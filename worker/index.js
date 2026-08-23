// worker/index.js
const http = require('http');
const { Worker } = require('bullmq');
const { redisConnectionOptions, QUEUE_NAMES } = require('./src/config/queue');
const { BACKEND_API_URL } = require('./src/config/env');
const { logger } = require('./src/shared/logger');

const PORT = process.env.PORT || 8080;

// Start Lightweight Health Check Server for AWS ALB / ECS Target Group Probes
const healthServer = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/worker/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      data: { status: 'UP', service: 'medtrack-worker', timestamp: new Date().toISOString() } 
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Not Found' }));
  }
});

healthServer.listen(PORT, () => {
  logger.info(`Worker Health Probe HTTP Server running on port ${PORT}`);
});

const startWorkerProcess = () => {
  logger.info('Initializing background worker process loops...');

  const medicationWorker = new Worker(
    QUEUE_NAMES.MEDICATION_SCHEDULER,
    async (job) => {
      logger.info(`[Job Claimed] ID: ${job.id} | Type: ${job.name}`);
      
      if (job.name === 'generateDailyDoses') {
        const { userId } = job.data;
        logger.debug(`Relaying calculation request back to backend API for user: ${userId}`);

        // Forward task processing back to backend via HTTP REST over internal Docker network
        const response = await fetch(`${BACKEND_API_URL}/internal/medications/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, jobId: job.id })
        });

        if (!response.ok) {
          throw new Error(`Backend API rejected worker operation with status code: ${response.status}`);
        }

        logger.info(`[Completed] Successfully synchronized worker state with API for user: ${userId}`);
      }
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5 // Process 5 jobs simultaneously inside this isolated environment
    }
  );

  medicationWorker.on('completed', (job) => {
    logger.info(`[Success] Job ID ${job.id} finalized cleanly.`);
  });

  medicationWorker.on('failed', (job, err) => {
    logger.error(err, `[Failure] Job ID ${job ? job.id : 'unknown'} processing failed`);
  });

  logger.info('Decoupled Worker Engine is actively listening for message queue streams.');
};

process.on('SIGTERM', () => {
  logger.warn('SIGTERM received. Gracefully closing active worker connections...');
  healthServer.close(() => {
    process.exit(0);
  });
});

startWorkerProcess();