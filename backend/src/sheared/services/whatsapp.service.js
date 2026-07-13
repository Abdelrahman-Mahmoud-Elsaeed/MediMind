const { logger } = require('../utils/logger');

/**
 * WhatsApp Service — وفاء (Wafa) Platform
 *
 * Sends WhatsApp messages via WhatsApp Business API.
 * Used for:
 *  1. Doctor weekly adherence reports (KEY FEATURE — most doctors won't use a dashboard)
 *  2. Patient reminders (for elderly patients who don't use PWA)
 *  3. Caregiver alerts (when patient misses a dose)
 *  4. OTP fallback (when SMS fails)
 *
 * In development: logs to console
 * In production: calls WhatsApp Business Cloud API
 */
class WhatsAppService {
  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.fromNumber = process.env.WHATSAPP_FROM_NUMBER;
  }

  /**
   * Send a text message via WhatsApp
   * @param {string} to - Recipient phone (+20XXXXXXXXXX)
   * @param {string} message - Plain text message
   */
  async sendText(to, message) {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[DEV WhatsApp] To: ${to}\nMessage: ${message}`);
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    try {
      const axios = require('axios');
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace('+', ''),
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id
      };
    } catch (error) {
      logger.error('WhatsApp send error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  /**
   * Send doctor weekly report
   * @param {Object} doctor - Doctor document
   * @param {Object} report - { totalPatients, adherentPatients, lowAdherencePatients, refillSoonPatients }
   */
  async sendDoctorWeeklyReport(doctor, report) {
    const adherenceRate = report.totalPatients > 0
      ? Math.round((report.adherentPatients / report.totalPatients) * 100)
      : 0;

    let message = `د. ${doctor.fullName}، تقرير الالتزام الأسبوعي 📊\n\n`;
    message += `✅ ${report.adherentPatients} مريض من الـ ${report.totalPatients} ملتزمين بالدواء (${adherenceRate}%)\n\n`;

    if (report.lowAdherencePatients && report.lowAdherencePatients.length > 0) {
      message += `❌ ${report.lowAdherencePatients.length} مرضى مخدوش الدواء الأسبوع ده:\n`;
      report.lowAdherencePatients.slice(0, 5).forEach(p => {
        message += `• ${p.name} (${p.missedCount} مرات فات)\n`;
      });
      if (report.lowAdherencePatients.length > 5) {
        message += `• ... و${report.lowAdherencePatients.length - 5} مريض تاني\n`;
      }
      message += '\n';
    }

    if (report.refillSoonPatients && report.refillSoonPatients.length > 0) {
      message += `💊 ${report.refillSoonPatients.length} مريض هيخلصوا الدواء الأسبوع الجاي\n\n`;
    }

    if (report.newPatients && report.newPatients.length > 0) {
      message += `➕ ${report.newPatients.length} مريض جديد اتضافوا الأسبوع ده\n\n`;
    }

    message += `تفاصيل أكتر: ${process.env.FRONTEND_URL || 'https://wafa.app'}/dr/dashboard`;

    return this.sendText(doctor.phone, message);
  }

  /**
   * Send medication reminder to patient (for elderly WhatsApp-only users)
   * @param {Object} patient - Patient document
   * @param {Object} reminder - { medicationName, dosage, time }
   */
  async sendPatientReminder(patient, reminder) {
    let message = `مرحباً ${patient.firstName} 👋\n\n`;
    message += `🕐 حان وقت أخذ دوائك:\n`;
    message += `💊 ${reminder.medicationName} ${reminder.dosage}\n\n`;
    message += `لو أخدت الدواء، رد بكلمة "أخدت" عشان نسجل ذلك ✅`;

    return this.sendText(patient.phone, message);
  }

  /**
   * Send caregiver alert when patient misses a dose
   * @param {Object} caregiver - Caregiver document
   * @param {Object} alert - { patientName, medicationName, scheduledTime, missedDuration }
   */
  async sendCaregiverAlert(caregiver, alert) {
    let message = `⚠️ تنبيه: ${alert.patientName}\n\n`;
    message += `مخدش دواء ${alert.medicationName}\n`;
    message += `الميعاد المحدد: ${alert.scheduledTime}\n`;
    message += `عدد دقائق التأخير: ${alert.missedDuration} دقيقة\n\n`;
    message += `برجاء التواصل معه للتأكد من أخذ الدواء 💊`;

    return this.sendText(caregiver.phone, message);
  }

  /**
   * Send OTP via WhatsApp
   * @param {string} phone - Phone number
   * @param {string} code - OTP code
   */
  async sendOtp(phone, code) {
    const message = `وفاء 💊\n\nرمز التحقق بتاعك هو: ${code}\n\nصالح لمدة 5 دقايق فقط.\nلو مش أنت اللي طلبت الكود، تجاهل الرسالة دي.`;
    return this.sendText(phone, message);
  }

  /**
   * Send pharmacy refill reminder to patient
   * @param {Object} patient - Patient document
   * @param {Object} reminder - { medicationName, daysRemaining, pharmacyName }
   */
  async sendRefillReminder(patient, reminder) {
    let message = `💊 تذكير تجديد الدواء\n\n`;
    message += `مرحباً ${patient.firstName}،\n`;
    message += `دوائك ${reminder.medicationName} هيخلص خلال ${reminder.daysRemaining} أيام\n`;
    message += `تقدر تتجدده من ${reminder.pharmacyName}\n\n`;
    message += `للتواصل مع الصيدلية، اضغط هنا: ${process.env.FRONTEND_URL || 'https://wafa.app'}/refill`;

    return this.sendText(patient.phone, message);
  }
}

module.exports = new WhatsAppService();
