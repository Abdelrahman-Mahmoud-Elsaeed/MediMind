// backend/src/shared/queues/cronScheduler.js
const { medicationQueue, refillQueue } = require('../../config/worker');
const { logger } = require('../utils/logger');

async function registerCronJobs() {
  try {
    // 1. Generate Daily Doses (Daily at Midnight UTC)
    await medicationQueue.add(
      'generateDailyDoses',
      { type: 'cron' },
      {
        repeat: { pattern: '0 0 * * *' },
        jobId: 'cron-generateDailyDoses',
      }
    );

    // 2. Evaluate Missed Doses (Every 5 minutes)
    await medicationQueue.add(
      'evaluateMissedDoses',
      { type: 'cron' },
      {
        repeat: { pattern: '*/5 * * * *' },
        jobId: 'cron-evaluateMissedDoses',
      }
    );

    // 3. Evaluate Snooze Limits (Every 1 minute)
    await medicationQueue.add(
      'evaluateSnoozeLimits',
      { type: 'cron' },
      {
        repeat: { pattern: '*/1 * * * *' },
        jobId: 'cron-evaluateSnoozeLimits',
      }
    );

    // 4. Check Inventory Refills (Daily at 8:00 AM)
    await refillQueue.add(
      'checkInventoryRefills',
      { type: 'cron' },
      {
        repeat: { pattern: '0 8 * * *' },
        jobId: 'cron-checkInventoryRefills',
      }
    );

    logger.info('Successfully registered BullMQ cron jobs.');
  } catch (err) {
    logger.error(err, 'Failed to register BullMQ cron jobs.');
  }
}

module.exports = { registerCronJobs };
