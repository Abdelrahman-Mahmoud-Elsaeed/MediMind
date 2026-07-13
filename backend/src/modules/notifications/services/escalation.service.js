const pushService = require('./push.service');
const whatsappService = require('../../../sheared/services/whatsapp.service');
const doseService = require('../../doses/services/dose.service');
const doseEventModel = require('../../doses/models/DoseEvent.model');
const Caregiver = require('../../auth/models/Caregiver.model');
const Patient = require('../../auth/models/Patient.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Escalation Service — وفاء (Wafa)
 *
 * Implements the 3-step escalation matrix:
 *   T+0:  PWA Push to patient
 *   T+15: WhatsApp/SMS to patient
 *   T+30: Caregiver alert (PWA + WhatsApp)
 *
 * Called by the background worker (BullMQ cron).
 */
class EscalationService {

  /**
   * Process all pending escalations
   * Called every minute by the worker cron
   */
  async processEscalations() {
    const { needsPush, needsSms, needsCaregiverAlert } =
      await doseService.getPendingDosesForEscalation();

    logger.info(`Escalation batch: push=${needsPush.length}, sms=${needsSms.length}, caregiver=${needsCaregiverAlert.length}`);

    for (const event of needsPush) {
      await this._sendPushReminder(event);
    }

    for (const event of needsSms) {
      await this._sendSmsReminder(event);
    }

    for (const event of needsCaregiverAlert) {
      await this._sendCaregiverAlert(event);
    }
  }

  /**
   * Step 1: Send PWA push notification to patient
   */
  async _sendPushReminder(event) {
    if (!event.patientId || !event.medicationId) return;

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

    // Get patient's account ID
    const patient = event.patientId;
    if (!patient.accountId) return;

    const result = await pushService.send(
      patient.accountId,
      payload,
      {
        patientId: patient._id,
        doseEventId: event._id,
        medicationId: event.medicationId._id,
        type: 'DOSE_REMINDER',
        escalationStep: 'PUSH'
      }
    );

    // Update escalation state
    event.escalationState = 'PUSH_SENT';
    event.escalationHistory.push({
      step: 'PUSH',
      sentAt: new Date(),
      success: result.success
    });
    await event.save();
  }

  /**
   * Step 2: Send WhatsApp (or SMS) fallback
   */
  async _sendSmsReminder(event) {
    const patient = event.patientId;
    if (!patient || !patient.phone) return;

    // For WhatsApp-opted patients, use WhatsApp; otherwise SMS
    if (patient.whatsappOnly || patient.accountId?.whatsappOptIn) {
      try {
        await whatsappService.sendPatientReminder(patient, {
          medicationName: event.medicationId.name,
          dosage: `${event.medicationId.inventory.doseAmount} ${event.medicationId.inventory.unit}`,
          time: event.scheduledFor.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        });
      } catch (err) {
        logger.error('WhatsApp reminder failed:', err.message);
      }
    } else {
      // TODO: Send SMS via AWS SNS
      logger.info(`[DEV SMS] To: ${patient.phone} | Take ${event.medicationId.name}`);
    }

    event.escalationState = 'SMS_SENT';
    event.escalationHistory.push({
      step: event.whatsappOnly ? 'WHATSAPP' : 'SMS',
      sentAt: new Date(),
      success: true
    });
    await event.save();
  }

  /**
   * Step 3: Alert caregiver(s)
   */
  async _sendCaregiverAlert(event) {
    const patient = event.patientId;
    if (!patient || !patient.caregiverIds || patient.caregiverIds.length === 0) {
      // No caregivers linked — mark as missed
      await doseService.markAsMissed(event._id);
      return;
    }

    const caregivers = await Caregiver.find({
      _id: { $in: patient.caregiverIds }
    }).populate('accountId');

    const alertData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      medicationName: event.medicationId.name,
      scheduledTime: event.scheduledFor.toLocaleTimeString('ar-EG', {
        hour: '2-digit', minute: '2-digit'
      }),
      missedDuration: Math.round((Date.now() - event.scheduledFor.getTime()) / 60000)
    };

    for (const caregiver of caregivers) {
      // Skip if caregiver has quiet hours active
      if (this._isInQuietHours(caregiver.alertSettings)) {
        logger.info(`Caregiver ${caregiver._id} in quiet hours — skipping alert`);
        continue;
      }

      // Send push notification
      if (caregiver.accountId && caregiver.channels.push) {
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
      }

      // Send WhatsApp alert
      if (caregiver.channels.whatsapp) {
        try {
          await whatsappService.sendCaregiverAlert(caregiver, alertData);
        } catch (err) {
          logger.error('Caregiver WhatsApp alert failed:', err.message);
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

    // After 24 hours with no confirmation, mark as missed
    // (The cron job will check for this)
  }

  /**
   * Check if current time is within caregiver's quiet hours
   */
  _isInQuietHours(alertSettings) {
    if (!alertSettings || !alertSettings.quietHoursStart || !alertSettings.quietHoursEnd) {
      return false;
    }
    const now = new Date();
    const currentHour = now.getHours();
    const [startHour] = alertSettings.quietHoursStart.split(':').map(Number);
    const [endHour] = alertSettings.quietHoursEnd.split(':').map(Number);

    // Handle overnight quiet hours (e.g., 22:00 - 06:00)
    if (startHour > endHour) {
      return currentHour >= startHour || currentHour < endHour;
    }
    return currentHour >= startHour && currentHour < endHour;
  }
}

module.exports = new EscalationService();
