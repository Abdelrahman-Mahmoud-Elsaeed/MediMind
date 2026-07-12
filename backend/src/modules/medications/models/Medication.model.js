const mongoose = require('mongoose');

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
    required: true,
    index: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageURL: {
    type: String,
    default: null
  },
  formType: {
    type: String,
    enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'OTHER'],
    required: true
  },
  isChronic: {
    type: Boolean,
    default: false
  },
  inventory: {
    initialQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    currentQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    doseAmount: {
      type: Number,
      required: true,
      min: 0.1
    },
    refillThreshold: {
      type: Number,
      default: 5,
      min: 0
    }
  },
  instructions: {
    relationToMeals: {
      type: String,
      enum: ['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'],
      default: 'NONE'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'AS_NEEDED'],
      required: true
    },
    dosesPerDay: {
      type: Number,
      required: true,
      min: 1,
      max: 24
    },
    firstDoseTime: {
      type: String,
      required: true
    },
    timesOfDay: {
      type: [String],
      default: []
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    }
  },
  expirationDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medication', MedicationSchema);
