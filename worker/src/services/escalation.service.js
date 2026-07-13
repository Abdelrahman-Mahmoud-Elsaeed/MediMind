// worker/src/services/escalation.service.js
const mongoose = require('../../../backend/node_modules/mongoose');
const { logger } = require('../shared/logger');

// Import shared models (using mongoose models from the same DB connection)
// We require the backend models so mongoose schemas are registered
require('../../../backend/src/modules/doses/models/DoseEvent.model');
require('../../../backend/src/modules/medications/models/Medication.model');
require('../../../backend/src/modules/auth/models/Patient.model');
require('../../../backend/src/modules/auth/models/Caregiver.model');
require('../../../backend/src/modules/auth/models/Account.model');

const DoseEvent = mongoose.model('DoseEvent');
const Medication = mongoose.model('Medication');
const Patient = mongoose.model('Patient');
const Caregiver = mongoose.model('Caregiver');
const Account = mongoose.model('Account');

// Import notification log model for audit trail
require('../../../backend/src/modules/notifications/models/NotificationLog.model');
require('../../../backend/src/modules/notifications/models/PushSubscription.model');
const NotificationLog = mongoose.model('NotificationLog');
const PushSubscription = mongoose.model('PushSubscription');

// Import backend services
const pushService = require('../../../backend/src/modules/notifications/services/push.service');
const whatsappService = require('../../../backend/src/sheared/services/whatsapp.service');

/**
 * Worker-side Escalation Service
 *
 * Connects directly to MongoDB and processes the escalation matrix.
 * This is called by the cron job every minute.
 */
class WorkerEscalationService {

  async processEscalations() {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Step 1: Doses needing PWA push (just past scheduled time, no escalation yet)
    const needsPush = await DoseEvent.find({
      status: 'PENDING',
      escalationState: 'NONE',
      scheduledFor: { $lte: now }
    })
      .populate('medicationId')
      .populate({ path: 'patientId', populate: { path: 'accountId' } })
      .limit(100);

    // Step 2: Doses needing SMS/WhatsApp (15 min after, only push sent)
    const needsSms = await DoseEvent.find({
      status: 'PENDING',
      escalationState: 'PUSH_SENT',
      scheduledFor: { $lte: fifteenMinutesAgo }
    })
      .populate('medicationId')
      .populate({ path: 'patientId', populate: { path: 'accountId' } })
      .limit(50);

    // Step 3: Doses needing caregiver alert (30 min after, SMS sent)
    const needsCaregiverAlert = await DoseEvent.find({
      status: 'PENDING',
      escalationState: 'SMS_SENT',
      scheduledFor: { $lte: thirtyMinutesAgo }
    })
      .populate('medicationId')
      .populate({ path: 'patientId', populate: { path: 'accountId' } })
      .limit(50);

    logger.info(
      `Escalation batch: push=${needsPush.length}, sms=${needsSms.length}, ` +
      `caregiver=${needsCaregiverAlert.length}`
    );

    let pushCount = 0;
    let smsCount = 0;
    let caregiverCount = 0;

    for (const event of needsPush) {
      try {
        await this._sendPushReminder(event);
        pushCount++;
      } catch (err) {
        logger.error(`Push escalation failed for event ${event._id}:`, err.message);
      }
    }

    for (const event of needsSms) {
      try {
        await this._sendSmsReminder(event);
        smsCount++;
      } catch (err) {
        logger.error(`SMS escalation failed for event ${event._id}:`, err.message);
      }
    }

    for (const event of needsCaregiverAlert) {
      try {
        await this._sendCaregiverAlert(event);
        caregiverCount++;
      } catch (err) {
        logger.error(`Caregiver alert failed for event ${event._id}:`, err.message);
      }
    }

    return { pushCount, smsCount, caregiverCount };
  }

  /**
   * Step 1: PWA Push notification
   */
  async _sendPushReminder(event) {
    if (!event.patientId || !event.medicationId) return;
    const patient = event.patientId;
    if (!patient.accountId) return;

    const payload = {
      title: 'حان وقت دوائك 💊',
      body: `${event.medicationId.name} — ${event.medicationId.inventory.doseAmount} ${event.medicationId.inventory.unit}`,
      data: {
        doseEventId: String(event._id),
        medicationId: String(event.medicationId._id),
        action: 'DOSE_REMINDER'
      },
      tag: `dose-${event._id}`,
      requireInteraction: true,
      actions: [
        { action: 'taken', title: '✅ أخدت الدواء' },
        { action: 'skip', title: '⏭ تخطي' }
      ]
    };

    // Use shared push service (handles VAPID + multiple subscriptions)
    const result = await pushService.send(
      patient.accountId._id,
      payload,
      {
        patientId: patient._id,
        doseEventId: event._id,
        medicationId: event.medicationId._id,
        type: 'DOSE_REMINDER',
        escalationStep: 'PUSH'
      }
    );

    // Update escalation state regardless of push success
    // (we don't want to retry push forever if user has no subscriptions)
    event.escalationState = 'PUSH_SENT';
    event.escalationHistory.push({
      step: 'PUSH',
      sentAt: new Date(),
      success: result.success
    });
    await event.save();
  }

  /**
   * Step 2: WhatsApp or SMS fallback
   */
  async _sendSmsReminder(event) {
    const patient = event.patientId;
    if (!patient || !patient.phone) {
      event.escalationState = 'SMS_SENT';
      await event.save();
      return;
    }

    // Use WhatsApp for opted-in patients, SMS otherwise
    const useWhatsapp = patient.whatsappOnly ||
      (patient.accountId && patient.accountId.whatsappOptIn);

    if (useWhatsapp) {
      try {
        await whatsappService.sendPatientReminder(patient, {
          medicationName: event.medicationId.name,
          dosage: `${event.medicationId.inventory.doseAmount} ${event.medicationId.inventory.unit}`,
          time: event.scheduledFor.toLocaleTimeString('ar-EG', {
            hour: '2-digit', minute: '2-digit'
          })
        });
      } catch (err) {
        logger.error('WhatsApp reminder failed:', err.message);
      }
    } else {
      // TODO: Integrate AWS SNS for SMS
      logger.info(`[DEV SMS] To: ${patient.phone} | Take ${event.medicationId.name}`);
    }

    event.escalationState = 'SMS_SENT';
    event.escalationHistory.push({
      step: useWhatsapp ? 'WHATSAPP' : 'SMS',
      sentAt: new Date(),
      success: true
    });
    await event.save();
  }

  /**
   * Step 3: Caregiver alert
   */
  async _sendCaregiverAlert(event) {
    const patient = event.patientId;
    if (!patient) {
      await this._markAsMissed(event);
      return;
    }

    const caregiverIds = patient.caregiverIds || [];
    if (caregiverIds.length === 0) {
      // No caregivers — mark as missed
      await this._markAsMissed(event);
      return;
    }

    const caregivers = await Caregiver.find({
      _id: { $in: caregiverIds }
    }).populate('accountId');

    const alertData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      medicationName: event.medicationId?.name || 'دواء',
      scheduledTime: event.scheduledFor.toLocaleTimeString('ar-EG', {
        hour: '2-digit', minute: '2-digit'
      }),
      missedDuration: Math.round((Date.now() - event.scheduledFor.getTime()) / 60000)
    };

    for (const caregiver of caregivers) {
      if (this._isInQuietHours(caregiver.alertSettings)) continue;

      // Push notification
      if (caregiver.accountId && caregiver.channels?.push) {
        try {
          await pushService.send(
            caregiver.accountId._id,
            {
              title: '⚠️ تنبيه: مريضك مخدش الدواء',
              body: `${alertData.patientName} مخدش ${alertData.medicationName} منذ ${alertData.missedDuration} دقيقة`,
              data: {
                patientId: String(patient._id),
                doseEventId: String(event._id),
                action: 'CAREGIVER_ALERT'
              },
              tag: `caregiver-alert-${event._id}`,
              requireInteraction: true
            },
            {
              patientId: patient._id,
              doseEventId: event._id,
              type: 'CAREGIVER_ALERT',
              escalationStep: 'CAREGIVER'
            }
          );
        } catch (err) {
          logger.error('Caregiver push failed:', err.message);
        }
      }

      // WhatsApp alert
      if (caregiver.channels?.whatsapp) {
        try {
          await whatsappService.sendCaregiverAlert(caregiver, alertData);
        } catch (err) {
          logger.error('Caregiver WhatsApp failed:', err.message);
        }
      }
    }

    event.escalationState = 'CAREGIVER_NOTIFIED';
    event.escalationHistory.push({
      step: 'CAREGIVER_PUSH',
      sentAt: new Date(),
      success: true
    });
    await event.save();

    // After caregiver alert, mark dose as MISSED after 1 hour of no confirmation
    // (handled by separate cleanup job)
  }

  /**
   * Mark a dose as missed and reset patient streak
   */
  async _markAsMissed(event) {
    event.status = 'MISSED';
    await event.save();

    // Reset patient streak
    if (event.patientId) {
      const patient = await Patient.findById(event.patientId);
      if (patient) {
        patient.gamification.totalDosesScheduled = (patient.gamification.totalDosesScheduled || 0) + 1;
        patient.gamification.currentStreak = 0;
        await patient.save();
      }
    }
  }

  _isInQuietHours(alertSettings) {
    if (!alertSettings?.quietHoursStart || !alertSettings?.quietHoursEnd) return false;
    const hour = new Date().getHours();
    const [startHour] = alertSettings.quietHoursStart.split(':').map(Number);
    const [endHour] = alertSettings.quietHoursEnd.split(':').map(Number);

    if (startHour > endHour) {
      return hour >= startHour || hour < endHour;
    }
    return hour >= startHour && hour < endHour;
  }
}

module.exports = new WorkerEscalationService();
