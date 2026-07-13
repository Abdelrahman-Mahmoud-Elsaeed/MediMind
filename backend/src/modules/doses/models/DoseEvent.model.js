const mongoose = require('mongoose');

/**
 * Dose Event Schema — وفاء (Wafa)
 *
 * Each scheduled dose of a medication creates one DoseEvent.
 * Drives the escalation engine and adherence calculations.
 *
 * CRITICAL: Status transitions:
 *   PENDING → TAKEN (when user confirms)
 *   PENDING → MISSED (when escalation completes without confirmation)
 *   PENDING → SKIPPED (when user explicitly skips)
 *
 * Escalation State:
 *   NONE → PUSH_SENT → SMS_SENT → CAREGIVER_NOTIFIED → (MISSED)
 */
const DoseEventSchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },

  // ===== SCHEDULING =====
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },

  // ===== STATUS =====
  status: {
    type: String,
    enum: ['PENDING', 'TAKEN', 'MISSED', 'SKIPPED'],
    default: 'PENDING',
    index: true
  },
  takenAt: { type: Date, default: null },
  takenVia: {
    type: String,
    enum: ['PWA', 'WHATSAPP', 'NOTIFICATION_ACTION', 'CAREGIVER', null],
    default: null
  },

  // ===== ESCALATION STATE =====
  escalationState: {
    type: String,
    enum: ['NONE', 'PUSH_SENT', 'SMS_SENT', 'CAREGIVER_NOTIFIED'],
    default: 'NONE'
  },
  escalationHistory: [{
    step: { type: String, enum: ['PUSH', 'SMS', 'WHATSAPP', 'CAREGIVER_PUSH', 'CAREGIVER_WHATSAPP'] },
    sentAt: { type: Date, default: Date.now },
    success: { type: Boolean, default: true }
  }],

  // ===== BATCH NOTIFICATION GROUPING =====
  // Used to group morning/noon/evening doses into single notification
  batchGroup: {
    type: String,
    enum: ['morning', 'noon', 'evening', 'night', null],
    default: null
  }
}, { timestamps: true });

// ===== COMPOUND INDEXES =====
DoseEventSchema.index({ status: 1, scheduledFor: 1 });
DoseEventSchema.index({ patientId: 1, scheduledFor: -1 });
DoseEventSchema.index({ medicationId: 1, scheduledFor: -1 });

// ===== VIRTUAL: Is Late =====
DoseEventSchema.virtual('isLate').get(function() {
  if (this.status !== 'PENDING') return false;
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  return this.scheduledFor < fifteenMinutesAgo;
});

// ===== VIRTUAL: Is Missed (30 min after scheduled) =====
DoseEventSchema.virtual('isMissed').get(function() {
  if (this.status !== 'PENDING') return false;
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return this.scheduledFor < thirtyMinutesAgo;
});

module.exports = mongoose.model('DoseEvent', DoseEventSchema);
