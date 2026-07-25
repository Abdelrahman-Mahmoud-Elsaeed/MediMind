const mongoose = require('mongoose');
const { CAREGIVER_MODELS, RELATIONS, STATUSES } = require('../constants/relationship.constants');

const RelationshipSchema = new mongoose.Schema({
  /**
   * Reference to the Patient profile document.
   */
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  /**
   * Dynamic reference to the caregiver profile document.
   * Can point to FamilyCaregiver, ProfessionalCaregiver, or Doctor.
   */
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'caregiverType',
    required: true,
    index: true
  },
  /**
   * Stores the model name of the caregiver to satisfy dynamic reference pathing.
   */
  caregiverType: {
    type: String,
    required: true,
    enum: ["FamilyCaregiver", "ProfessionalCaregiver", "Doctor"]
  },
  /**
   * Relationship label of the caregiver to the patient.
   */
  relation: {
    type: String,
    required: true
  },
  /**
   * Lifecycle status of the invitation/relationship connection.
   */
  status: {
    type: String,
    enum: STATUSES,
    default: 'PENDING'
  },
  /**
   * Presets granted to the caregiver according to db.md specifications.
   */
  permissions: {
    canAddMedication: { type: Boolean, default: true },
    canViewMedicalRecords: { type: Boolean, default: false },
    canOrderRefills: { type: Boolean, default: true }
  },
  /**
   * Soft delete timestamp.
   */
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Caregiver + Patient unique link validation per active relationship (ignoring soft-deleted ones)
RelationshipSchema.index(
  { patientId: 1, caregiverId: 1, caregiverType: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// Indexes for common relationship listing queries
RelationshipSchema.index({ patientId: 1, status: 1 });
RelationshipSchema.index({ caregiverId: 1, status: 1 });

/**
 * Pre-save middleware to prevent self-relationships and verify referenced document existence.
 */
RelationshipSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('patientId') || this.isModified('caregiverId')) {
    const PatientModel = mongoose.model('Patient');
    const CaregiverModel = mongoose.model(this.caregiverType);

    const patientObj = await PatientModel.findById(this.patientId);
    const caregiverObj = await CaregiverModel.findById(this.caregiverId);

    // 1. Verify existence of referenced documents
    if (!patientObj) {
      return next(new Error('Referenced Patient document does not exist.'));
    }
    if (!caregiverObj) {
      return next(new Error('Referenced Caregiver document does not exist.'));
    }

    // 2. Prevent self-relationships (sharing the same Account ID)
    if (patientObj.accountId.toString() === caregiverObj.accountId.toString()) {
      return next(new Error('Cannot establish a relationship with yourself.'));
    }
  }
});

module.exports = mongoose.model('Relationship', RelationshipSchema);
