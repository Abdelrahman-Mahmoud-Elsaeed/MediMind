// src/modules/doses/models/AlarmEvent.model.js
const mongoose = require('mongoose');

/**
 * AlarmEvent Schema (One-to-One with DoseEvent)
 *
 * IMPORTANT ARCHITECTURE CHANGE (v3.2):
 * The alarm is now LOCAL on the patient's phone (Flutter local notifications).
 * The server does NOT scan every minute for due alarms.
 * The server only gets involved when:
 *   1. Patient presses "Taken" → server decrements inventory
 *   2. Patient ignores alarm 30 min → phone tells server "escalate to caregiver"
 *   3. 3 consecutive missed days → server escalates to doctor
 *
 * snoozeCount, snoozeMinutes, maxSnoozeCount are NOT stored here anymore.
 * They live in Patient.alarmSettings and are fetched by the phone.
 */
const AlarmEventSchema = new mongoose.Schema({
  doseEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoseEvent',
    required: true,
    unique: true,
    index: true,
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
    index: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'RINGING', 'SNOOZED', 'TAKEN', 'ACKNOWLEDGED', 'ESCALATED', 'MISSED'],
    default: 'SCHEDULED',
    required: true,
    index: true,
  },
  // snoozeCount is kept here for query convenience but the SETTING (maxSnoozeCount, snoozeMinutes)
  // is fetched from Patient.alarmSettings by the Flutter app — NOT duplicated here.
  snoozeCount: { type: Number, default: 0, min: 0 },

  // Timestamps for the escalation pipeline
  alarmTriggeredAt: Date,           // When the phone first rang (reported by phone)
  escalatedToCaregiverAt: Date,     // When phone told server "30 min passed, escalate"
  acknowledgedByCaregiverAt: Date,  // When caregiver acknowledged
  acknowledgedByCaregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyCaregiver',
    default: null,
  },
  escalatedToDoctorAt: Date,        // When 3 consecutive missed days reached
  finalStateAt: Date,
}, { timestamps: true });

// Index for finding alarms that need doctor escalation (3 consecutive missed days)
AlarmEventSchema.index({ patientId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('AlarmEvent', AlarmEventSchema);
