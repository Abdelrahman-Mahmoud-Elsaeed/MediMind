// worker/index.js
const { Worker } = require('bullmq');
const { redisConnectionOptions, QUEUE_NAMES } = require('./src/config/queue');
const { logger } = require('./src/shared/logger');
const { processMedicationJob } = require('./src/processors/medicationProcessor');
const { processEscalationJob } = require('./src/processors/escalationProcessor');

const startWorkerProcess = () => {
  logger.info('Initializing background worker process loops...');

  // Medication Worker
  const medicationWorker = new Worker(
    QUEUE_NAMES.MEDICATION_SCHEDULER,
    processMedicationJob,
    {
      connection: redisConnectionOptions,
      concurrency: 5
    }
  );

  medicationWorker.on('completed', (job) => {
    logger.info(`[Success] Medication Job ID ${job.id} finalized cleanly.`);
  });

  medicationWorker.on('failed', (job, err) => {
    logger.error(err, `[Failure] Medication Job ID ${job ? job.id : 'unknown'} processing failed`);
  });

  // Escalation Worker
  const escalationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATION_ESCALATION,
    processEscalationJob,
    {
      connection: redisConnectionOptions,
      concurrency: 5
    }
  );

  escalationWorker.on('completed', (job) => {
    logger.info(`[Success] Escalation Job ID ${job.id} finalized cleanly.`);
  });

  escalationWorker.on('failed', (job, err) => {
    logger.error(err, `[Failure] Escalation Job ID ${job ? job.id : 'unknown'} processing failed`);
  });

  logger.info('Decoupled Worker Engine is actively listening for message queue streams.');
};

process.on('SIGTERM', () => {
  logger.warn('SIGTERM received. Gracefully closing active worker connections...');
  process.exit(0);
});

startWorkerProcess();