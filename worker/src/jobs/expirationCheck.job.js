// worker/src/jobs/expirationCheck.job.js
const mongoose = require('../../../backend/node_modules/mongoose');
const { logger } = require('../shared/logger');

require('../../../backend/src/modules/medications/models/Medication.model');
require('../../../backend/src/modules/auth/models/Patient.model');
require('../../../backend/src/modules/notifications/models/NotificationLog.model');
require('../../../backend/src/modules/notifications/models/PushSubscription.model');

const Medication = mongoose.model('Medication');
const Patient = mongoose.model('Patient');

const pushService = require('../../../backend/src/modules/notifications/services/push.service');

/**
 * Expiration Check Job — runs every Monday 10 AM
 *
 * Scans all medications and sends alerts for:
 *  - Medications that expired (already past expiration date)
 *  - Medications expiring within 30 days
 */
async function runExpirationCheckJob() {
  const startTime = Date.now();
  try {
    logger.info('🔄 Expiration check job started...');

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find expired or soon-to-expire medications
    const medications = await Medication.find({
      isActive: true,
      expirationDate: { $lte: thirtyDaysFromNow }
    }).populate('patientId');

    let alertsSent = 0;

    for (const med of medications) {
      try {
        if (!med.patientId?.accountId) continue;

        const isExpired = med.expirationDate < now;
        const daysUntilExpiry = Math.ceil(
          (med.expirationDate - now) / (24 * 60 * 60 * 1000)
        );

        // Skip if already alerted this week
        const NotificationLog = mongoose.model('NotificationLog');
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const alreadyAlerted = await NotificationLog.findOne({
          accountId: med.patientId.accountId,
          medicationId: med._id,
          type: 'EXPIRATION_ALERT',
          createdAt: { $gte: weekAgo }
        });

        if (alreadyAlerted) continue;

        const title = isExpired
          ? '⚠️ دواء منتهي الصلاحية'
          : '📅 دواء قارب ينتهي';

        const body = isExpired
          ? `${med.name} انتهت صلاحيته. برجاء التخلص منه بأمان وتجديد الوصفة.`
          : `${med.name} هيخلص صلاحيته خلال ${daysUntilExpiry} يوم. برجاء تجديده قريب.`;

        await pushService.send(
          med.patientId.accountId,
          {
            title,
            body,
            data: {
              medicationId: String(med._id),
              action: 'EXPIRATION_ALERT',
              expired: isExpired
            },
            tag: `exp-${med._id}`
          },
          {
            patientId: med.patientId._id,
            medicationId: med._id,
            type: 'EXPIRATION_ALERT'
          }
        );

        alertsSent++;
      } catch (err) {
        logger.error(`Expiration alert failed for med ${med._id}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Expiration check job completed in ${duration}ms | Alerts: ${alertsSent}`);

    return { alertsSent };
  } catch (error) {
    logger.error('❌ Expiration check job failed:', error.message);
    throw error;
  }
}

module.exports = runExpirationCheckJob;
