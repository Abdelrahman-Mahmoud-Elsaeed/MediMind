// backend/src/config/aws.service.js
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const env = require('./env');
const { logger } = require('../shared/utils/logger');

let snsClient = null;

if (env.SNS_TOPIC_ARN || env.AWS_ACCESS_KEY_ID) {
  try {
    snsClient = new SNSClient({ region: env.AWS_REGION || 'us-east-1' });
    logger.info(`AWS SNS Client initialized for region: ${env.AWS_REGION || 'us-east-1'}`);
  } catch (err) {
    logger.warn('AWS SNS Client initialization skipped (local environment fallback)');
  }
}

/**
 * Publishes an escalation or patient alert to AWS SNS Topic in production,
 * or logs the event in local development.
 */
async function publishEscalationNotification(subject, messagePayload) {
  const topicArn = env.SNS_TOPIC_ARN;

  if (snsClient && topicArn) {
    try {
      const command = new PublishCommand({
        TopicArn: topicArn,
        Subject: subject,
        Message: typeof messagePayload === 'object' ? JSON.stringify(messagePayload) : String(messagePayload),
      });
      const response = await snsClient.send(command);
      logger.info(`[AWS SNS] Successfully published message ${response.MessageId} to topic ${topicArn}`);
      return { success: true, messageId: response.MessageId, provider: 'AWS_SNS' };
    } catch (err) {
      logger.error(err, `[AWS SNS Error] Failed to publish escalation message to ${topicArn}`);
      return { success: false, error: err.message, provider: 'AWS_SNS' };
    }
  } else {
    logger.info(`[Local Escalation Notification] Subject: "${subject}" - Payload:`, messagePayload);
    return { success: true, message: 'Local notification logged', provider: 'LOCAL' };
  }
}

module.exports = {
  snsClient,
  publishEscalationNotification,
};
