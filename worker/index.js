// worker/index.js
/**
 * وفاء (Wafa) Background Worker
 *
 * Runs cron jobs for:
 *  1. Escalation Matrix (every minute) — sends push/SMS/caregiver alerts
 *  2. Dose Generation (every hour) — generates upcoming DoseEvents
 *  3. Refill Reminders (daily 9 AM) — alerts patients running low
 *  4. Expiration Check (weekly Monday 10 AM) — alerts about expired meds
 *  5. Weekly Doctor Reports (Friday 6 PM) — WhatsApp reports to doctors
 *
 * Also processes BullMQ jobs for on-demand tasks.
 */

const cron = require('node-cron');
const connectDB = require('./src/config/db');
const { logger } = require('./src/shared/logger');
const { PORT, CRON_ESCALATION, CRON_GENERATE_DOSES, CRON_WEEKLY_REPORTS, CRON_REFILL_CHECK, CRON_EXPIRATION_CHECK } = require('./src/config/env');

// Import jobs
const runEscalationJob = require('./src/jobs/escalation.job');
const runGenerateDosesJob = require('./src/jobs/generateDoses.job');
const runWeeklyReportsJob = require('./src/jobs/weeklyReports.job');
const runRefillRemindersJob = require('./src/jobs/refillReminders.job');
const runExpirationCheckJob = require('./src/jobs/expirationCheck.job');

// Health check HTTP server (simple)
const http = require('http');

let isShuttingDown = false;
let activeJobs = 0;

async function startWorker() {
  logger.info('🚀 وفاء (Wafa) Worker starting...');
  logger.info('📋 Cron schedules:');
  logger.info(`   Escalation:       ${CRON_ESCALATION} (every minute)`);
  logger.info(`   Dose generation:  ${CRON_GENERATE_DOSES} (hourly)`);
  logger.info(`   Refill check:     ${CRON_REFILL_CHECK} (daily 9 AM)`);
  logger.info(`   Expiration check: ${CRON_EXPIRATION_CHECK} (weekly Mon 10 AM)`);
  logger.info(`   Weekly reports:   ${CRON_WEEKLY_REPORTS} (Friday 6 PM)`);

  // Connect to MongoDB
  await connectDB();

  // ===== Schedule cron jobs =====

  // 1. Escalation matrix — every minute
  cron.schedule(CRON_ESCALATION, async () => {
    if (isShuttingDown) return;
    activeJobs++;
    try {
      await runEscalationJob();
    } catch (err) {
      logger.error('Escalation cron error:', err.message);
    } finally {
      activeJobs--;
    }
  }, {
    name: 'escalation-matrix'
  });

  // 2. Dose generation — every hour at minute 0
  cron.schedule(CRON_GENERATE_DOSES, async () => {
    if (isShuttingDown) return;
    activeJobs++;
    try {
      await runGenerateDosesJob();
    } catch (err) {
      logger.error('Generate doses cron error:', err.message);
    } finally {
      activeJobs--;
    }
  }, {
    name: 'generate-doses'
  });

  // 3. Refill reminders — daily at 9 AM
  cron.schedule(CRON_REFILL_CHECK, async () => {
    if (isShuttingDown) return;
    activeJobs++;
    try {
      await runRefillRemindersJob();
    } catch (err) {
      logger.error('Refill reminders cron error:', err.message);
    } finally {
      activeJobs--;
    }
  }, {
    name: 'refill-reminders'
  });

  // 4. Expiration check — weekly Monday 10 AM
  cron.schedule(CRON_EXPIRATION_CHECK, async () => {
    if (isShuttingDown) return;
    activeJobs++;
    try {
      await runExpirationCheckJob();
    } catch (err) {
      logger.error('Expiration check cron error:', err.message);
    } finally {
      activeJobs--;
    }
  }, {
    name: 'expiration-check'
  });

  // 5. Weekly doctor reports — Friday 6 PM
  cron.schedule(CRON_WEEKLY_REPORTS, async () => {
    if (isShuttingDown) return;
    activeJobs++;
    try {
      await runWeeklyReportsJob();
    } catch (err) {
      logger.error('Weekly reports cron error:', err.message);
    } finally {
      activeJobs--;
    }
  }, {
    name: 'weekly-doctor-reports'
  });

  // ===== Health check server =====
  const healthServer = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'UP',
        service: 'wafa-worker',
        activeJobs,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  healthServer.listen(PORT, () => {
    logger.info(`✅ Worker health check server listening on port ${PORT}`);
  });

  // ===== Graceful shutdown =====
  process.on('SIGTERM', async () => {
    logger.warn('SIGTERM received. Shutting down worker gracefully...');
    isShuttingDown = true;

    // Wait for active jobs to complete (max 30 seconds)
    const shutdownStart = Date.now();
    while (activeJobs > 0 && Date.now() - shutdownStart < 30000) {
      logger.info(`Waiting for ${activeJobs} active job(s) to complete...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    healthServer.close();
    cron.stop();
    logger.info('✅ Worker shut down successfully.');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.warn('SIGINT received. Shutting down worker...');
    isShuttingDown = true;
    cron.stop();
    healthServer.close();
    process.exit(0);
  });

  // ===== Run initial dose generation on startup =====
  logger.info('🚀 Running initial dose generation on startup...');
  try {
    await runGenerateDosesJob();
  } catch (err) {
    logger.error('Initial dose generation failed:', err.message);
  }

  logger.info('✅ Worker is fully operational.');
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('CRITICAL: Unhandled promise rejection:', err.message);
});

startWorker().catch(err => {
  logger.error('Failed to start worker:', err);
  process.exit(1);
});
