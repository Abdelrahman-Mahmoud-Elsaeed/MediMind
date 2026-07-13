const mongoose = require('mongoose');

/**
 * Doctor Schema — وفاء (Wafa) Platform
 *
 * Doctors pay a monthly subscription (200-400 EGP/month).
 * They receive weekly WhatsApp reports about their patients' adherence
 * (instead of being forced to log into a dashboard).
 */
const DoctorSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true,
    index: true
  },

  // ===== BASIC INFO =====
  fullName: { type: String, required: true, trim: true },
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

  // ===== PROFESSIONAL INFO =====
  specialty: {
    type: String,
    required: true,
    enum: [
      'internal_medicine',   // باطنة
      'cardiology',          // قلب
      'endocrinology',       // سكر وغدد
      'nephrology',          // كلى
      'general_practitioner', // عام
      'other'
    ]
  },
  syndicateId: { type: String, required: true, unique: true, trim: true },

  // ===== CLINIC =====
  clinic: {
    name: { type: String, trim: true },
    address: {
      governorate: { type: String },
      city: { type: String },
      street: { type: String }
    },
    phone: { type: String }
  },

  // ===== LINKED PATIENTS =====
  patientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],

  // ===== WHATSAPP REPORT SETTINGS (KEY FEATURE) =====
  whatsappReport: {
    enabled: { type: Boolean, default: true },
    // Weekly report day (Friday is the default — end of work week in Egypt)
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      default: 'friday'
    },
    time: { type: String, default: '18:00' }, // 6 PM
    // What to include in the report
    includeLowAdherence: { type: Boolean, default: true }, // patients <50% adherence
    includeRefillSoon: { type: Boolean, default: true },   // patients running out
    includeNewPatients: { type: Boolean, default: true },  // patients added this week
    language: { type: String, enum: ['ar', 'en'], default: 'ar' }
  },

  // ===== DASHBOARD ACCESS (optional — most doctors prefer WhatsApp only) =====
  dashboardAccess: { type: Boolean, default: false },

  // ===== STATS =====
  stats: {
    totalPatients: { type: Number, default: 0 },
    activePatients: { type: Number, default: 0 },
    averageAdherenceRate: { type: Number, default: 0 }
  },

  // ===== VERIFICATION =====
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// ===== INDEXES =====
DoctorSchema.index({ specialty: 1 });
DoctorSchema.index({ syndicateId: 1 });
DoctorSchema.index({ patientIds: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
