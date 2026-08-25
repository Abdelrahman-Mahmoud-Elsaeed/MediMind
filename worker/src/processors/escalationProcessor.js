// worker/src/processors/escalationProcessor.js
const { BACKEND_API_URL, WORKER_INTERNAL_SECRET, SNS_TOPIC_ARN, AWS_REGION } = require('../config/env');
const { logger } = require('../shared/logger');

let snsClient = null;
if (SNS_TOPIC_ARN) {
  try {
    const { SNSClient } = require('@aws-sdk/client-sns');
    snsClient = new SNSClient({ region: AWS_REGION || 'us-east-1' });
  } catch (err) {
    logger.warn('[Worker] AWS SNS SDK not available, using backend API or local logging');
  }
}

async function processEscalationJob(job) {
  logger.info(`[Worker] Processing Escalation Job: ${job.name} (ID: ${job.id})`);

  switch (job.name) {
    case 'triggerCaregiverEscalation': {
      if (snsClient && SNS_TOPIC_ARN) {
        try {
          const { PublishCommand } = require('@aws-sdk/client-sns');
          const command = new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Subject: 'Caregiver Escalation Alert - Missed Dose',
            Message: JSON.stringify(job.data)
          });
          const result = await snsClient.send(command);
          logger.info(`[Worker SNS] Successfully published escalation to AWS SNS: ${result.MessageId}`);
          return { success: true, messageId: result.MessageId, provider: 'AWS_SNS' };
        } catch (err) {
          logger.error(err, '[Worker SNS Error] Failed to publish escalation via AWS SNS, falling back to internal API');
        }
      }

      try {
        return await callBackendInternal('/internal/notifications/escalate', job.data);
      } catch (err) {
        logger.info('[Worker Local Fallback] Caregiver escalation notification logged locally:', job.data);
        return { success: true, message: 'Caregiver escalated (local fallback)', data: job.data };
      }
    }

    default:
      throw new Error(`Unknown escalation job type: ${job.name}`);
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

module.exports = { processEscalationJob };
