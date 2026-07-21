// worker/src/config/queue.js
const { REDIS_URL } = require('./env');
const { logger } = require('../shared/logger');

// Parse Redis URL into ioredis-compatible connection options
const parsedUrl = new URL(REDIS_URL);
const redisConnectionOptions = {
  host: parsedUrl.hostname || '127.0.0.1',
  port: parseInt(parsedUrl.port, 10) || 6379,
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