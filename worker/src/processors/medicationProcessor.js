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

async function callBackendInternal(endpoint, payload, retries = 4, delayMs = 1500) {
  const url = `${BACKEND_API_URL}${endpoint}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
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
    } catch (err) {
      const isConnError = ['ECONNREFUSED', 'ETIMEDOUT', 'FETCH_ERROR', 'ECONNRESET', 'fetch failed'].some(
        (code) => String(err?.cause?.code || err?.message || '').includes(code)
      );

      if (attempt < retries && isConnError) {
        logger.warn(`[Worker] Backend API not ready at ${url} (Attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
}

module.exports = { processMedicationJob };
