// worker/src/processors/escalationProcessor.js
const { BACKEND_API_URL, WORKER_INTERNAL_SECRET } = require('../config/env');
const { logger } = require('../shared/logger');

async function processEscalationJob(job) {
  logger.info(`[Worker] Processing Escalation Job: ${job.name} (ID: ${job.id})`);

  switch (job.name) {
    case 'triggerCaregiverEscalation':
      // return await callBackendInternal('/internal/notifications/escalate', job.data);
      logger.info('Caregiver escalation would be processed here');
      return { success: true, message: 'Caregiver escalated (stub)' };

    default:
      throw new Error(`Unknown escalation job type: ${job.name}`);
  }
}

async function callBackendInternal(endpoint, payload) {
  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-worker-secret': WORKER_INTERNAL_SECRET
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Internal API call failed [${response.status}]: ${errorBody}`);
  }

  return await response.json();
}

module.exports = { processEscalationJob };
