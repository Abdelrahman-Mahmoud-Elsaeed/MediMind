const mongoose = require('mongoose');

/**
 * Account Schema — وفاء (Wafa) Platform
 *
 * Updated based on the agreed v2.0 spec:
 *  - Authentication is now PHONE + OTP based (no email/password)
 *  - Roles extended: PATIENT, CAREGIVER, PHARMACY, DOCTOR, ADMIN
 *  - Admin role split into 3 sub-levels (super_admin, ops_admin, finance_admin)
 *  - Consent tracking for caregiver/doctor/pharmacy access
 *  - WhatsApp opt-in for elderly patients and doctors
 */
const AccountSchema = new mongoose.Schema({
  // ===== AUTHENTICATION (Phone + OTP) =====
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    // Format: +20XXXXXXXXXX
    validate: {
      validator: function(v) {
        return /^\+20\d{10}$/.test(v);
      },
      message: 'Phone must be in Egyptian format +20XXXXXXXXXX'
    }
  },

  // Optional email (for admin/finance only — patients use phone only)
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true,
    index: true,
    default: null
  },

  // Password hash (for admin accounts only — patients use OTP)
  passwordHash: {
    type: String,
    default: null,
    select: false
  },

  // ===== ROLE =====
  role: {
    type: String,
    enum: ['PATIENT', 'CAREGIVER', 'PHARMACY', 'DOCTOR', 'ADMIN'],
    required: true,
    index: true
  },

  // Admin sub-levels (only relevant when role === 'ADMIN')
  adminLevel: {
    type: String,
    enum: ['super_admin', 'ops_admin', 'finance_admin', null],
    default: null
  },

  // ===== OTP STATE =====
  otp: {
    code: { type: String, default: null },
    hashedCode: { type: String, default: null }, // store hash, not plain
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null }
  },

  // ===== STATUS =====
  isActive: { type: Boolean, default: true },
  isPhoneVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null },

  // ===== DEVICE & NOTIFICATIONS =====
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },

  fcmToken: { type: String, default: null },

  // ===== WhatsApp OPT-IN =====
  // For elderly patients who prefer WhatsApp over PWA
  // For doctors who receive weekly reports via WhatsApp
  whatsappOptIn: { type: Boolean, default: false },
  whatsappSettings: {
    receiveReminders: { type: Boolean, default: true },
    receiveReports: { type: Boolean, default: true },
    preferredLanguage: { type: String, enum: ['ar', 'en'], default: 'ar' }
  },

  // ===== CONSENT (CRITICAL for Egyptian Data Protection Law 151/2020) =====
  consents: {
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date, default: null },
    privacyPolicyAccepted: { type: Boolean, default: false },
    privacyPolicyAcceptedAt: { type: Date, default: null },
    // Patient explicitly allows caregiver/doctor/pharmacy to access their data
    caregiverAccess: { type: Boolean, default: false },
    doctorAccess: { type: Boolean, default: false },
    pharmacyAccess: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false }
  },

  // ===== SUBSCRIPTION (for paying users: caregiver, pharmacy, doctor) =====
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'pilot', 'monthly', 'yearly'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['none', 'trial', 'active', 'expired', 'cancelled'],
      default: 'none'
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    // Pilot period (3 months free for pharmacies)
    isPilot: { type: Boolean, default: false }
  },

  // ===== AUDIT FIELDS =====
  preferredLanguage: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  }
}, {
  timestamps: true // createdAt, updatedAt
});

// ===== INDEXES =====
AccountSchema.index({ phone: 1 });
AccountSchema.index({ role: 1, isActive: 1 });
AccountSchema.index({ 'subscription.status': 1, 'subscription.endDate': 1 });

// ===== METHODS =====

/**
 * Check if account is currently in pilot period
 */
AccountSchema.methods.isInPilot = function() {
  return this.subscription.isPilot &&
         this.subscription.startDate &&
         (Date.now() - this.subscription.startDate.getTime()) < 90 * 24 * 60 * 60 * 1000; // 90 days
};

/**
 * Check if account has active subscription
 */
AccountSchema.methods.hasActiveSubscription = function() {
  if (this.role === 'PATIENT') return true; // Patient is always free
  if (this.isInPilot()) return true;
  return this.subscription.status === 'active' &&
         (!this.subscription.endDate || this.subscription.endDate > new Date());
};

// ===== PRE-SAVE HOOK (only hash password for admin accounts) =====
AccountSchema.pre('save', async function() {
  // Only hash password if it's modified and account is admin
  if (!this.isModified('passwordHash') || this.role !== 'ADMIN' || !this.passwordHash) {
    return;
  }

  try {
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model('Account', AccountSchema);
