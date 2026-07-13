const mongoose = require('mongoose');

/**
 * Notification Log Schema — وفاء (Wafa)
 *
 * Audit trail of all notifications sent (push, SMS, WhatsApp).
 * Used for debugging, analytics, and compliance.
 */
const NotificationLogSchema = new mongoose.Schema({
  // ===== RECIPIENT =====
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null,
    index: true
  },

  // ===== RELATED DOSE EVENT (for medication reminders) =====
  doseEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoseEvent',
    default: null
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    default: null
  },

  // ===== CHANNEL =====
  channel: {
    type: String,
    enum: ['PUSH', 'SMS', 'WHATSAPP', 'EMAIL'],
    required: true
  },

  // ===== TYPE =====
  type: {
    type: String,
    enum: [
      'DOSE_REMINDER',         // Initial reminder
      'DOSE_REMINDER_BATCH',   // Batched morning/noon/evening reminder
      'DOSE_ESCALATION_SMS',   // 15 min after scheduled, fallback
      'CAREGIVER_ALERT',       // 30 min after, alert caregiver
      'REFILL_REMINDER',       // Medication running low
      'EXPIRATION_ALERT',      // Medication expiring soon
      'WEEKLY_REPORT',         // Doctor weekly WhatsApp report
      'WELCOME',               // Welcome message
      'OTP',                   // OTP code
      'CUSTOM'
    ],
    required: true
  },

  // ===== CONTENT =====
  title: { type: String, default: null },
  body: { type: String, required: true },

  // ===== STATUS =====
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CLICKED'],
    default: 'PENDING',
    index: true
  },
  errorMessage: { type: String, default: null },

  // ===== METADATA =====
  sentAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  clickedAt: { type: Date, default: null },

  // ===== BATCH GROUP (for batched notifications) =====
  batchGroup: {
    type: String,
    enum: ['morning', 'noon', 'evening', 'night', null],
    default: null
  },

  // ===== ESCALATION STEP (for tracking escalation matrix) =====
  escalationStep: {
    type: String,
    enum: ['PUSH', 'SMS', 'CAREGIVER', null],
    default: null
  }
}, { timestamps: true });

NotificationLogSchema.index({ accountId: 1, createdAt: -1 });
NotificationLogSchema.index({ status: 1, type: 1 });
NotificationLogSchema.index({ doseEventId: 1 });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
