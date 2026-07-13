const mongoose = require('mongoose');

/**
 * Medication Schema — وفاء (Wafa)
 *
 * Linked to a MedicalCondition (optional but recommended for chronic patients).
 * Tracks inventory, schedule, and is linked to a pharmacy for refill alerts.
 *
 * CRITICAL BUSINESS RULE:
 *   - Inventory currentQuantity decreases ONLY when a dose is confirmed as TAKEN
 *   - Never auto-decrement on reminder send
 */
const MedicationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  conditionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalCondition',
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },

  // ===== BASIC INFO =====
  name: { type: String, required: true, trim: true, index: 'text' },
  nameAr: { type: String, trim: true }, // Arabic brand name
  imageURL: { type: String, default: null },

  formType: {
    type: String,
    enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'INHALER', 'OTHER'],
    required: true
  },

  // ===== CHRONIC FLAG (for indefinite schedules) =====
  isChronic: { type: Boolean, default: false },

  // ===== INVENTORY =====
  inventory: {
    initialQuantity: { type: Number, required: true, min: 0 },
    currentQuantity: { type: Number, required: true, min: 0 },
    doseAmount: { type: Number, required: true, min: 0.1 }, // pills/ml per dose
    unit: { type: String, default: 'pill', enum: ['pill', 'ml', 'mg', 'drop', 'puff'] },
    refillThreshold: { type: Number, default: 5, min: 1 },
    lastRefilledAt: { type: Date, default: null }
  },

  // ===== INSTRUCTIONS =====
  instructions: {
    relationToMeals: {
      type: String,
      enum: ['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'],
      default: 'NONE'
    },
    notes: { type: String, trim: true, maxlength: 300 } // e.g., "اشرب معاه كوباية مية كبيرة"
  },

  // ===== SCHEDULE =====
  schedule: {
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'AS_NEEDED'],
      required: true
    },
    dosesPerDay: { type: Number, min: 1, max: 6, default: 1 },
    firstDoseTime: { type: String, required: true }, // "08:00"
    timesOfDay: [{ type: String }], // ["08:00", "14:00", "20:00"]
    // For weekly frequency
    daysOfWeek: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, default: null } // null if isChronic
  },

  // ===== PHARMACY LINK =====
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    default: null,
    index: true
  },

  // ===== STATUS =====
  expirationDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true, index: true },
  deactivatedAt: { type: Date, default: null },

  // ===== STATS (computed periodically) =====
  stats: {
    totalDosesScheduled: { type: Number, default: 0 },
    totalDosesTaken: { type: Number, default: 0 },
    adherenceRate: { type: Number, default: 0 }, // 0-100
    lastDoseTakenAt: { type: Date, default: null },
    currentStreak: { type: Number, default: 0 }
  }
}, { timestamps: true });

// ===== INDEXES =====
MedicationSchema.index({ patientId: 1, isActive: 1 });
MedicationSchema.index({ pharmacyId: 1, isActive: 1 });
MedicationSchema.index({ expirationDate: 1 });

// ===== VIRTUAL: Days Until Refill Needed =====
MedicationSchema.virtual('daysUntilRefill').get(function() {
  if (!this.inventory.currentQuantity || !this.inventory.doseAmount) return null;
  const dosesPerDay = this.schedule.dosesPerDay || 1;
  const dosesRemaining = Math.floor(this.inventory.currentQuantity / this.inventory.doseAmount);
  const daysRemaining = Math.floor(dosesRemaining / dosesPerDay);
  return daysRemaining;
});

// ===== VIRTUAL: Is Refill Needed Soon =====
MedicationSchema.virtual('isRefillNeededSoon').get(function() {
  const days = this.daysUntilRefill;
  if (days === null) return false;
  return days <= this.inventory.refillThreshold;
});

// ===== VIRTUAL: Is Expired =====
MedicationSchema.virtual('isExpired').get(function() {
  return this.expirationDate && this.expirationDate < new Date();
});

// ===== METHOD: Decrement Inventory =====
MedicationSchema.methods.decrementInventory = function() {
  if (this.inventory.currentQuantity < this.inventory.doseAmount) {
    return false; // not enough inventory
  }
  this.inventory.currentQuantity -= this.inventory.doseAmount;
  return true;
};

// ===== METHOD: Refill =====
MedicationSchema.methods.refill = function(newQuantity) {
  this.inventory.currentQuantity = newQuantity;
  this.inventory.lastRefilledAt = new Date();
  return this;
};

module.exports = mongoose.model('Medication', MedicationSchema);
