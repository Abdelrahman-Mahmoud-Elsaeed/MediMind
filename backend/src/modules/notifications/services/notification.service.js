const pushService = require('./push.service');
const whatsappService = require('../../../sheared/services/whatsapp.service');
const socketService = require('../../../sheared/services/socket.service');
const NotificationLog = require('../models/NotificationLog.model');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Notification Service — وفاء (Wafa)
 *
 * High-level notification orchestration.
 * Used by other modules to send notifications without worrying about channels.
 */
class NotificationService {

  /**
   * Send a dose reminder (immediate)
   * @param {Object} patient - Patient document (with accountId populated)
   * @param {Object} medication - Medication document
   * @param {Object} doseEvent - DoseEvent document
   */
  async sendDoseReminder(patient, medication, doseEvent) {
    const payload = {
      title: 'حان وقت دوائك 💊',
      body: `${medication.name} — ${medication.inventory.doseAmount} ${medication.inventory.unit}`,
      data: {
        doseEventId: String(doseEvent._id),
        medicationId: String(medication._id),
        action: 'DOSE_REMINDER'
      },
      tag: `dose-${doseEvent._id}`,
      requireInteraction: true,
      actions: [
        { action: 'taken', title: '✅ أخدت الدواء' },
        { action: 'skip', title: '⏭ تخطي' }
      ]
    };

    // Emit via Socket.IO for real-time UI update
    if (patient.accountId) {
      socketService.emitToAccount(patient.accountId, 'notification', {
        type: 'DOSE_REMINDER',
        title: payload.title,
        body: payload.body,
        data: payload.data,
        timestamp: new Date().toISOString()
      });
    }

    return pushService.send(patient.accountId, payload, {
      patientId: patient._id,
      doseEventId: doseEvent._id,
      medicationId: medication._id,
      type: 'DOSE_REMINDER',
      batchGroup: doseEvent.batchGroup
    });
  }

  /**
   * Send batched dose reminder (morning/noon/evening)
   * Instead of 3 separate notifications, send one with all meds in that time slot
   */
  async sendBatchedDoseReminder(patient, medications, batchGroup) {
    const groupLabels = {
      morning: 'أدوية الصباح',
      noon: 'أدوية الضهر',
      evening: 'أدوية المساء',
      night: 'أدوية الليل'
    };

    const medList = medications.map(m => `💊 ${m.name}`).join('\n');

    const payload = {
      title: `${groupLabels[batchGroup] || 'تذكير بالأدوية'} ⏰`,
      body: medList,
      data: { action: 'BATCH_DOSE_REMINDER', batchGroup },
      tag: `batch-${batchGroup}-${new Date().toDateString()}`,
      requireInteraction: true,
      actions: [
        { action: 'taken_all', title: '✅ أخدت الكل' },
        { action: 'view', title: '👁 عرض' }
      ]
    };

    return pushService.send(patient.accountId, payload, {
      patientId: patient._id,
      type: 'DOSE_REMINDER_BATCH',
      batchGroup
    });
  }

  /**
   * Send refill reminder to patient
   */
  async sendRefillReminder(patient, medication, daysRemaining, pharmacyName) {
    const payload = {
      title: '💊 دواؤك هيخلص قريب',
      body: `${medication.name} هيخلص خلال ${daysRemaining} أيام. تقدر تتجدده من ${pharmacyName}.`,
      data: { medicationId: String(medication._id), action: 'REFILL_REMINDER' },
      tag: `refill-${medication._id}`
    };

    // Send push
    await pushService.send(patient.accountId, payload, {
      patientId: patient._id,
      medicationId: medication._id,
      type: 'REFILL_REMINDER'
    });

    // Also send WhatsApp if patient opted in
    if (patient.whatsappOnly || patient.accountId?.whatsappOptIn) {
      try {
        await whatsappService.sendRefillReminder(patient, {
          medicationName: medication.name,
          daysRemaining,
          pharmacyName
        });
      } catch (err) {
        logger.error('WhatsApp refill reminder failed:', err.message);
      }
    }
  }

  /**
   * Send expiration alert
   */
  async sendExpirationAlert(patient, medication) {
    const payload = {
      title: '⚠️ دواء منتهي الصلاحية',
      body: `${medication.name} انتهت صلاحيته. برجاء التخلص منه بأمان وتجديد الوصفة.`,
      data: { medicationId: String(medication._id), action: 'EXPIRATION_ALERT' },
      tag: `exp-${medication._id}`
    };

    return pushService.send(patient.accountId, payload, {
      patientId: patient._id,
      medicationId: medication._id,
      type: 'EXPIRATION_ALERT'
    });
  }

  /**
   * Send welcome message to new user
   */
  async sendWelcome(accountId, role) {
    const welcomeMessages = {
      PATIENT: {
        title: 'أهلاً بك في وفاء 💊',
        body: 'حنبدأ رحلتك مع بعض عشان متحدّش ينسى دواؤه تاني. ضيف أول دواء من شاشة الأدوية.'
      },
      CAREGIVER: {
        title: 'أهلاً بك في وفاء 💊',
        body: 'تقدر دلوقتي تتابع أحبابك وتطمن عليهم في أي وقت.'
      },
      PHARMACY: {
        title: 'أهلاً بصيدلية وفاء 💊',
        body: 'تقدر دلوقتي تتابع عملائك وتبعتلهم reminders للـ refill.'
      },
      DOCTOR: {
        title: 'أهلاً دكتور في وفاء 💊',
        body: 'هيوصلك تقرير أسبوعي كل يوم جمعة بنسبة التزام مرضاك بالأدوية.'
      }
    };

    const msg = welcomeMessages[role] || welcomeMessages.PATIENT;
    return pushService.send(accountId, msg, { type: 'WELCOME' });
  }

  /**
   * Get notification history for an account
   */
  async getHistory(accountId, options = {}) {
    const { limit = 50, offset = 0, type, channel } = options;
    const filter = { accountId };
    if (type) filter.type = type;
    if (channel) filter.channel = channel;

    return NotificationLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
  }

  /**
   * Mark a notification as clicked
   */
  async markAsClicked(notificationId) {
    return NotificationLog.findByIdAndUpdate(
      notificationId,
      { status: 'CLICKED', clickedAt: new Date() },
      { new: true }
    );
  }
}

module.exports = new NotificationService();
