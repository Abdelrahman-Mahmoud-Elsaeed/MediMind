// worker/src/jobs/refillReminders.job.js
const mongoose = require('../../../backend/node_modules/mongoose');
const { logger } = require('../shared/logger');

require('../../../backend/src/modules/medications/models/Medication.model');
require('../../../backend/src/modules/auth/models/Patient.model');
require('../../../backend/src/modules/auth/models/Pharmacy.model');
require('../../../backend/src/modules/notifications/models/NotificationLog.model');
require('../../../backend/src/modules/notifications/models/PushSubscription.model');

const Medication = mongoose.model('Medication');
const Patient = mongoose.model('Patient');
const Pharmacy = mongoose.model('Pharmacy');

const pushService = require('../../../backend/src/modules/notifications/services/push.service');
const whatsappService = require('../../../backend/src/sheared/services/whatsapp.service');

/**
 * Refill Reminders Job — runs daily at 9 AM
 *
 * Scans all active medications and sends refill reminders to patients
 * whose medications will run out within their refill threshold (default 5 days).
 */
async function runRefillRemindersJob() {
  const startTime = Date.now();
  try {
    logger.info('🔄 Refill reminders job started...');

    const medications = await Medication.find({ isActive: true })
      .populate('patientId')
      .populate('pharmacyId', 'pharmacyName');

    let remindersSent = 0;

    for (const med of medications) {
      try {
        if (!med.isRefillNeededSoon) continue;
        if (!med.patientId) continue;

        const patient = med.patientId;
        const daysRemaining = med.daysUntilRefill || 0;

        // Skip if already reminded today (check notification log)
        const NotificationLog = mongoose.model('NotificationLog');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alreadyReminded = await NotificationLog.findOne({
          accountId: patient.accountId,
          medicationId: med._id,
          type: 'REFILL_REMINDER',
          createdAt: { $gte: today }
        });

        if (alreadyReminded) continue;

        // Send push notification
        if (patient.accountId) {
          await pushService.send(
            patient.accountId,
            {
              title: '💊 دواؤك هيخلص قريب',
              body: `${med.name} هيخلص خلال ${daysRemaining} أيام. تقدر تتجدده من ${med.pharmacyId?.pharmacyName || 'صيدليتك'}.`,
              data: {
                medicationId: String(med._id),
                action: 'REFILL_REMINDER'
              },
              tag: `refill-${med._id}`
            },
            {
              patientId: patient._id,
              medicationId: med._id,
              type: 'REFILL_REMINDER'
            }
          );
        }

        // Also send WhatsApp if patient opted in
        if (patient.whatsappOnly || patient.accountId?.whatsappOptIn) {
          try {
            await whatsappService.sendRefillReminder(patient, {
              medicationName: med.name,
              daysRemaining,
              pharmacyName: med.pharmacyId?.pharmacyName || 'صيدليتك'
            });
          } catch (err) {
            logger.error('WhatsApp refill reminder failed:', err.message);
          }
        }

        remindersSent++;
      } catch (err) {
        logger.error(`Refill reminder failed for medication ${med._id}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Refill reminders job completed in ${duration}ms | Sent: ${remindersSent}`);

    return { remindersSent };
  } catch (error) {
    logger.error('❌ Refill reminders job failed:', error.message);
    throw error;
  }
}

module.exports = runRefillRemindersJob;
