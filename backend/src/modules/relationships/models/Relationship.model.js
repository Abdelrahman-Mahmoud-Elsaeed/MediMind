const mongoose = require('mongoose');

/**
 * Relationship Schema — وفاء (Wafa)
 *
 * Maps the authorization bridge between Patient and Caregiver.
 * A patient can have multiple caregivers, and a caregiver can monitor multiple patients.
 *
 * Status flow: PENDING → ACCEPTED | REJECTED | REVOKED
 */
const RelationshipSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    default: null, // null when invitation is pending
    index: true
  },

  // ===== INVITATION TOKEN (for QR code sharing) =====
  invitationToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  invitedPhone: {
    type: String,
    default: null // optional: pre-fill the caregiver's phone
  },
  invitedByName: { type: String, default: null }, // patient name shown in invitation
  invitedByRole: {
    type: String,
    enum: ['PATIENT', 'CAREGIVER', 'DOCTOR'],
    default: 'PATIENT'
  },

  // ===== STATUS =====
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'],
    default: 'PENDING',
    index: true
  },

  // ===== PERMISSIONS =====
  permissions: {
    canAddMedication: { type: Boolean, default: true },
    canViewMedicalRecords: { type: Boolean, default: true },
    canConfirmDoses: { type: Boolean, default: true },
    canReceiveAlerts: { type: Boolean, default: true }
  },

  // ===== RELATION TYPE =====
  relationType: {
    type: String,
    enum: ['son', 'daughter', 'spouse', 'parent', 'sibling', 'other', null],
    default: null
  },

  // ===== AUDIT =====
  acceptedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  expiresAt: { type: Date, default: null } // invitation expiry (default 7 days)
}, { timestamps: true });

// ===== COMPOUND INDEX =====
RelationshipSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true, sparse: true });

// ===== METHOD: Is Invitation Expired =====
RelationshipSchema.methods.isInvitationExpired = function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
};

// ===== METHOD: Is Active =====
RelationshipSchema.methods.isActive = function() {
  return this.status === 'ACCEPTED';
};

module.exports = mongoose.model('Relationship', RelationshipSchema);
