// worker/src/processors/medicationProcessor.js
const { BACKEND_API_URL, WORKER_INTERNAL_SECRET } = require('../config/env');
const { logger } = require('../shared/logger');

async function processMedicationJob(job) {
  logger.info(`[Worker] Processing Medication Job: ${job.name} (ID: ${job.id})`);

  switch (job.name) {
    case 'generateDailyDoses':
      return await callBackendInternal('/internal/medications/generate-daily-doses', job.data);

    case 'evaluateMissedDoses':
      return await callBackendInternal('/internal/doses/evaluate-missed', job.data);

    case 'evaluateSnoozeLimits':
      return await callBackendInternal('/internal/doses/evaluate-snooze', job.data);

    default:
      throw new Error(`Unknown medication job type: ${job.name}`);
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

module.exports = { processMedicationJob };
