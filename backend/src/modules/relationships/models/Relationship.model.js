const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyCaregiver', required: true, index: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'], default: 'PENDING', required: true },
  permissions: {
    canAddMedication: { type: Boolean, default: true },
    canViewMedicalRecords: { type: Boolean, default: false },
    canViewAdherence: { type: Boolean, default: true },
  }
}, { timestamps: true });

RelationshipSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', RelationshipSchema);
