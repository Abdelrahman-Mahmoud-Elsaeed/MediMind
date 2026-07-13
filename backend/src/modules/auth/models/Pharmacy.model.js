const mongoose = require('mongoose');

/**
 * Pharmacy Schema — وفاء (Wafa) Platform
 *
 * Represents a pharmacy partner on the platform.
 * Pharmacies pay a monthly subscription (300-500 EGP/month after pilot).
 * They can see their linked patients, send reminders, and view refill alerts.
 */
const PharmacySchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true,
    index: true
  },

  // ===== BASIC INFO =====
  pharmacyName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
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

  // ===== LICENSE =====
  licenseNumber: { type: String, required: true, unique: true, trim: true },
  syndicateRegistration: { type: String, trim: true },

  // ===== LOCATION =====
  address: {
    governorate: { type: String, required: true }, // e.g., "القاهرة"
    city: { type: String, required: true },         // e.g., "مدينة نصر"
    street: { type: String, required: true },       // e.g., "شارع عباس العقاد"
    buildingNumber: { type: String },
    landmark: { type: String },
    // Geo coordinates for "nearby pharmacy" feature
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    }
  },

  // ===== LINKED PATIENTS =====
  patientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],

  // ===== SETTINGS =====
  settings: {
    autoReminder: { type: Boolean, default: true },
    refillAlertDays: { type: Number, default: 5, min: 1, max: 30 },
    notifyOnNewPatient: { type: Boolean, default: true },
    dailyReport: { type: Boolean, default: false },
    weeklyReport: { type: Boolean, default: true }
  },

  // ===== ANALYTICS =====
  stats: {
    totalPatients: { type: Number, default: 0 },
    activePatients: { type: Number, default: 0 },
    totalRefills: { type: Number, default: 0 },
    estimatedRevenue: { type: Number, default: 0 }
  },

  // ===== VERIFICATION =====
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null }
}, {
  timestamps: true
});

// ===== INDEXES =====
PharmacySchema.index({ 'address.location': '2dsphere' });
PharmacySchema.index({ governorate: 1, city: 1 });
PharmacySchema.index({ licenseNumber: 1 });
PharmacySchema.index({ patientIds: 1 });

module.exports = mongoose.model('Pharmacy', PharmacySchema);
