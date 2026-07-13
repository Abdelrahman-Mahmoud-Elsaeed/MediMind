const mongoose = require('mongoose');

/**
 * Caregiver Schema — وفاء (Wafa) Platform
 *
 * Caregivers (الأهل) follow the Freemium model:
 *  - Free tier: 1 patient + basic alerts
 *  - Premium (99 EGP/month): multiple patients + reports + history
 */
const CaregiverSchema = new mongoose.Schema({
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

  // ===== LINKED PATIENTS (multiple patients for premium users) =====
  patientIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],

  // ===== ALERT SETTINGS =====
  alertSettings: {
    // Instant alert when patient misses a dose (30 min after scheduled time)
    instantMissed: { type: Boolean, default: true },
    // Daily summary at end of day
    dailySummary: { type: Boolean, default: true },
    // Weekly detailed report (Premium only — enforced by subscription check)
    weeklyReport: { type: Boolean, default: true },
    // Monthly analytics (Premium only)
    monthlyReport: { type: Boolean, default: false },
    // Refill reminder (when patient is running out)
    refillAlert: { type: Boolean, default: true },
    // Quiet hours
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '06:00' }
  },

  // ===== NOTIFICATION CHANNELS =====
  channels: {
    push: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    sms: { type: Boolean, default: false } // SMS is paid — only for critical alerts
  },

  // ===== STATS =====
  stats: {
    patientsCount: { type: Number, default: 0 },
    alertsReceivedThisWeek: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// ===== INDEXES =====
CaregiverSchema.index({ phone: 1 });
CaregiverSchema.index({ patientIds: 1 });

// ===== VIRTUAL: Full Name =====
CaregiverSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Caregiver', CaregiverSchema);
