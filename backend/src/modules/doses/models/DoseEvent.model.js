const mongoose = require('mongoose');

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
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'TAKEN', 'MISSED', 'LATE', 'SKIPPED'],
    default: 'PENDING',
    index: true
  },
  takenAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ["manual", "whatsapp", "caregiver", "system_auto"],
    default: "manual"
  },
  escalationState: {
    type: String,
    enum: ['NONE', 'PUSH_SENT', 'SMS_SENT', 'CAREGIVER_NOTIFIED'],
    default: 'NONE'
  },
  snoozeCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

DoseEventSchema.index({ patientId: 1, scheduledFor: -1 });
DoseEventSchema.index({ patientId: 1, medicationId: 1 });
DoseEventSchema.index({ status: 1, scheduledFor: 1 });

module.exports = mongoose.model('DoseEvent', DoseEventSchema);
