// backend/src/config/worker.js
const { REDIS_URL } = require('./env');

// Parse Redis URL into ioredis-compatible connection options
const parsedUrl = new URL(REDIS_URL);
const redisConnectionOptions = {
  host: parsedUrl.hostname || '127.0.0.1',
  port: parseInt(parsedUrl.port, 10) || 6379,
  maxRetriesPerRequest: null, 
};

const QUEUE_NAMES = {
  MEDICATION_SCHEDULER: 'MedicationScheduler',
  NOTIFICATION_ESCALATION: 'NotificationEscalation'
};

module.exports = {
  redisConnectionOptions,
  QUEUE_NAMES
};