// backend/src/config/worker.js
const { REDIS_URL } = require('./env');

// Simple connection details for the Queue instances to connect to Redis
const redisConnectionOptions = {
  connectionString: REDIS_URL,
  // Must be set to null for BullMQ configurations to ensure stability
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