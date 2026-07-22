const mongoose = require('mongoose');

const DoseEventSchema = new mongoose.Schema({
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true, index: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  scheduledFor: { type: Date, required: true, index: true },
  status: { type: String, enum: ['PENDING', 'TAKEN', 'MISSED', 'SKIPPED'], default: 'PENDING', required: true, index: true },
  takenAt: { type: Date, default: null },
  escalationState: { type: String, enum: ['NONE', 'PUSH_SENT', 'SMS_SENT', 'CAREGIVER_NOTIFIED'], default: 'NONE', required: true },
  alarmState: { type: String, enum: ['SCHEDULED', 'RINGING', 'SNOOZED', 'TAKEN', 'ACKNOWLEDGED', 'ESCALATED', 'MISSED'], default: 'SCHEDULED', index: true },
  snoozeCount: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

DoseEventSchema.index({ patientId: 1, scheduledFor: 1 });

module.exports = mongoose.model('DoseEvent', DoseEventSchema);
