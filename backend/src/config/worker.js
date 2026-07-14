// backend/src/config/worker.js
const { REDIS_URL } = require('./env');

const redisConnectionOptions = {
  connectionString: REDIS_URL,
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