// src/modules/consent/models/ConsentAudit.model.js
const mongoose = require('mongoose');

/**
 * ConsentAudit Schema
 *
 * Immutable audit trail of every consent change a patient makes.
 * Required for HIPAA / Egyptian Personal Data Protection Law (Law 151/2020) compliance.
 *
 * Each document represents ONE consent change event:
 *   - Which patient changed which consent
 *   - From what value to what value
 *   - At what timestamp
 *   - From which IP / device (for forensic analysis)
 *
 * Documents are NEVER updated or deleted — they are append-only.
 * The TTL is set to 7 years to comply with medical record retention laws.
 */
const ConsentAuditSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  },

  // Which consent was changed
  consentType: {
    type: String,
    enum: ['familyCaregiver', 'professionalCaregiver', 'doctor', 'pharmacy'],
    required: true,
  },

  // The change itself
  previousValue: { type: Boolean, required: true },
  newValue: { type: Boolean, required: true },

  // Action description (e.g. "granted", "revoked")
  action: {
    type: String,
    enum: ['GRANTED', 'REVOKED'],
    required: true,
  },

  // Optional reason provided by the patient (e.g. "no longer seeing this doctor")
  reason: { type: String, trim: true, default: null },

  // Forensic metadata
  ipAddress: { type: String, trim: true },
  userAgent: { type: String, trim: true },
  deviceId: { type: String, trim: true, default: null },

  // Auto-expire after 7 years (medical record retention period)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
    expires: 0,
  },
}, {
  timestamps: true, // createdAt + updatedAt
});

// Compound index for querying a patient's consent history sorted by date
ConsentAuditSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('ConsentAudit', ConsentAuditSchema);
