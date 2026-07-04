// worker/src/config/queue.js
const { REDIS_URL } = require('./env');
const { logger } = require('../shared/logger');

const redisConnectionOptions = {
  connectionString: REDIS_URL,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`[Worker] Redis link dropped. Reconnecting try #${times} in ${delay}ms...`);
    return delay;
  }
};

const QUEUE_NAMES = {
  MEDICATION_SCHEDULER: 'MedicationScheduler',
  NOTIFICATION_ESCALATION: 'NotificationEscalation'
};

const defaultWorkerSettings = {
  concurrency: 5,
  removeOnComplete: { age: 3600, count: 1000 }, 
  removeOnFail: { age: 86400, count: 5000 },    
};

module.exports = {
  redisConnectionOptions,
  QUEUE_NAMES,
  defaultWorkerSettings
};