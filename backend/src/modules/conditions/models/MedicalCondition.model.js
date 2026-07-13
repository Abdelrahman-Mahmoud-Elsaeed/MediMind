const mongoose = require('mongoose');

/**
 * Medical Condition Schema — وفاء (Wafa)
 *
 * A patient's medical condition (disease). Can be chronic or acute.
 * Medications are linked to conditions for better tracking.
 */
const MedicalConditionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  diseaseName: {
    type: String,
    required: true,
    trim: true
  },
  diseaseNameAr: { type: String, trim: true },
  isChronic: { type: Boolean, default: false },
  diagnosedDate: { type: Date },
  notes: { type: String, trim: true, maxlength: 500 },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

MedicalConditionSchema.index({ patientId: 1, diseaseName: 1 }, { unique: true });

module.exports = mongoose.model('MedicalCondition', MedicalConditionSchema);
