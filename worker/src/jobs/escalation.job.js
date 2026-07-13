// worker/src/jobs/escalation.job.js
const escalationService = require('../services/escalation.service');
const { logger } = require('../shared/logger');

/**
 * Escalation Job — runs every minute
 *
 * Scans DoseEvents and triggers the 3-step escalation matrix:
 *   T+0:  PWA Push to patient
 *   T+15: WhatsApp/SMS to patient
 *   T+30: Caregiver alert
 */
async function runEscalationJob() {
  const startTime = Date.now();
  try {
    logger.debug('🔄 Escalation job started...');

    const result = await escalationService.processEscalations();

    const duration = Date.now() - startTime;
    logger.info(
      `✅ Escalation job completed in ${duration}ms | ` +
      `Push: ${result.pushCount} | SMS: ${result.smsCount} | Caregiver: ${result.caregiverCount}`
    );

    return result;
  } catch (error) {
    logger.error('❌ Escalation job failed:', error.message);
    throw error;
  }
}

module.exports = runEscalationJob;
