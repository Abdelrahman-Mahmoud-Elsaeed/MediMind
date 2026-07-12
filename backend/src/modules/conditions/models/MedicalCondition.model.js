const mongoose = require('mongoose');

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
  isChronic: {
    type: Boolean,
    default: false
  },
  diagnosedDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalCondition', MedicalConditionSchema);
