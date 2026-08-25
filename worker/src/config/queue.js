// worker/src/config/queue.js
const { REDIS_URL } = require('./env');
const { logger } = require('../shared/logger');
function parseRedisOptions(redisUrl) {
  try {
    const urlString = redisUrl || 'redis://127.0.0.1:6379';
    const parsedUrl = new URL(urlString);
    const options = {
      host: parsedUrl.hostname || '127.0.0.1',
      port: parseInt(parsedUrl.port, 10) || 6379,
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`[Worker] Redis link dropped. Reconnecting try #${times} in ${delay}ms...`);
        return delay;
      }
    };
    if (parsedUrl.password) {
      options.password = decodeURIComponent(parsedUrl.password);
    }
    if (parsedUrl.username) {
      options.username = decodeURIComponent(parsedUrl.username);
    }
    if (parsedUrl.protocol === 'rediss:') {
      options.tls = {};
    }
    return options;
  } catch (err) {
    return {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null
    };
  }
}

const redisConnectionOptions = parseRedisOptions(REDIS_URL);

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