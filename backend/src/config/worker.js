// backend/src/config/worker.js
const { Queue } = require('bullmq');
const { REDIS_URL } = require('./env');

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
        return Math.min(times * 100, 3000);
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
  NOTIFICATION_ESCALATION: 'NotificationEscalation',
  REFILL_ALERTS: 'RefillAlerts'
};

const medicationQueue = new Queue(QUEUE_NAMES.MEDICATION_SCHEDULER, { connection: redisConnectionOptions });
const escalationQueue = new Queue(QUEUE_NAMES.NOTIFICATION_ESCALATION, { connection: redisConnectionOptions });
const refillQueue = new Queue(QUEUE_NAMES.REFILL_ALERTS, { connection: redisConnectionOptions });

module.exports = {
  redisConnectionOptions,
  QUEUE_NAMES,
  medicationQueue,
  escalationQueue,
  refillQueue
};