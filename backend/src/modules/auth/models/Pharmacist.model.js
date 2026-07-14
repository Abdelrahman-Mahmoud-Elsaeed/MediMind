const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PharmacistSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  pharmacyName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true },
  
  address: {
    governorate: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
  },

  // --- GeoJSON for native MongoDB geospatial queries ($near, $geoWithin) ---
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  
  isVerified: { type: Boolean, default: false },
  
  subscription: {
    status: { type: String, enum: ["pilot", "active", "expired"], default: "pilot" },
    plan: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  // --- DIRECT NOTIFICATIONS CONFIGURATION ---
  whatsappOptIn: { type: Boolean, default: false },
  whatsappOptInDate: { type: Date, default: null }, // Audit trail for Meta compliance
  preferredLanguage: { 
    type: String, 
    enum: ["en", "ar"], 
    default: "ar" // Default to Arabic templates for regional pharmacies (+20)
  },

  settings: {
    autoReminder: { type: Boolean, default: true },
    refillAlertDays: { type: Number, default: 5 }
  }
}, { timestamps: true });

// --- Pre-save Hook: Handles WhatsApp Opt-In date validation ---
PharmacistSchema.pre('save', function (next) {
  if (this.isModified('whatsappOptIn')) {
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
  }
  next();
});

// Spatial index setup for proximity queries
PharmacistSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Pharmacist', PharmacistSchema);