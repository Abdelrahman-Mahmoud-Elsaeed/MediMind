const mongoose = require('mongoose');

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
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'],
    default: 'PENDING',
    required: true
  },
  permissions: {
    canAddMedication: {
      type: Boolean,
      default: true
    },
    canViewMedicalRecords: {
      type: Boolean,
      default: false
    }
  }
}, { timestamps: true });

// Caregiver + Patient unique link validation
RelationshipSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', RelationshipSchema);
