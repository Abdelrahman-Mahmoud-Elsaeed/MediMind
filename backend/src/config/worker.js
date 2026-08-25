// backend/src/config/worker.js
const { Queue } = require('bullmq');
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