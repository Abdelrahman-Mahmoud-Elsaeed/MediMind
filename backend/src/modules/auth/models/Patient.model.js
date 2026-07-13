const mongoose = require('mongoose');

/**
 * Patient Schema — وفاء (Wafa) Platform
 *
 * Updated based on v2.0 spec:
 *  - Patient is FREE FOREVER (subscription managed on Account)
 *  - Added consents object for explicit consent tracking
 *  - Added caregiverIds, doctorIds, pharmacyIds arrays for fast lookups
 *  - Added gamification fields (streaks, badges)
 */
const PatientSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true,
    index: true
  },

  // ===== BASIC INFO =====
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+20\d{10}$/.test(v);
      },
      message: 'Phone must be in Egyptian format +20XXXXXXXXXX'
    }
  },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: null },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
    default: null
  },

  // ===== EMERGENCY CONTACT =====
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String },
    relation: { type: String, enum: ['son', 'daughter', 'spouse', 'parent', 'sibling', 'other'] }
  },

  // ===== LINKED ENTITIES (for fast lookups) =====
  caregiverIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver'
  }],
  doctorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  primaryPharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    default: null
  },

  // ===== MEDICAL CONDITIONS (array of ObjectIds — populated from conditions module) =====
  conditionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalCondition'
  }],

  // ===== GAMIFICATION (increases engagement, reduces churn) =====
  gamification: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalDosesTaken: { type: Number, default: 0 },
    totalDosesScheduled: { type: Number, default: 0 },
    badges: [{
      type: { type: String, enum: ['first_week', 'first_month', 'streak_7', 'streak_30', 'streak_90', 'perfect_week', 'perfect_month'] },
      awardedAt: { type: Date, default: Date.now }
    }],
    lastWeekAdherence: { type: Number, default: 0 } // 0-100
  },

  // ===== PREFERENCES =====
  preferences: {
    batchNotifications: { type: Boolean, default: true }, // Group by morning/noon/evening
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '06:00' },
    reminderLeadTime: { type: Number, default: 0 } // minutes before scheduled time
  },

  // ===== WHATSAPP OPT-IN (for elderly patients) =====
  whatsappOnly: { type: Boolean, default: false } // If true, patient uses WhatsApp bot exclusively
}, {
  timestamps: true
});

// ===== INDEXES =====
PatientSchema.index({ phone: 1 });
PatientSchema.index({ caregiverIds: 1 });
PatientSchema.index({ doctorIds: 1 });
PatientSchema.index({ primaryPharmacyId: 1 });

// ===== VIRTUAL: Full Name =====
PatientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ===== VIRTUAL: Adherence Rate =====
PatientSchema.virtual('adherenceRate').get(function() {
  if (this.gamification.totalDosesScheduled === 0) return 0;
  return Math.round((this.gamification.totalDosesTaken / this.gamification.totalDosesScheduled) * 100);
});

module.exports = mongoose.model('Patient', PatientSchema);
