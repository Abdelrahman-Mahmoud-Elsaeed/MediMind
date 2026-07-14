const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  email: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true, 
    lowercase: true
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true
  },
  
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["PATIENT", "FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "ADMIN", "DOCTOR", "PHARMACIST"],
    required: true,
  },

  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },

  refreshTokenHash: { type: String, default: null },

  pushSubscription: {
    endpoint: String,
    keys: { p256dh: String, auth: String },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

AccountSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("An Account must have either an email or a phone number for authentication."));
  }
  next();
});

AccountSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Account', AccountSchema);