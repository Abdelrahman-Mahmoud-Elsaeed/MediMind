const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfessionalCaregiverSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  addedByAdminId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  
  hourlyRate: { type: Number, required: true },
  bio: { type: String },
  isAvailable: { type: Boolean, default: true },

  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  
  // 1. WhatsApp Channel
  whatsappOptIn: { type: Boolean, default: false },
  whatsappOptInDate: { type: Date, default: null },
  preferredLanguage: { 
    type: String, 
    enum: ["en", "ar"], 
    default: "ar"
  },

  alertSettings: {
    instantMissed: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: true }
  }
}, { timestamps: true });

ProfessionalCaregiverSchema.pre('save', function (next) {
  if (this.isModified('whatsappOptIn')) {
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
  }
  next();
});

module.exports = mongoose.model('ProfessionalCaregiver', ProfessionalCaregiverSchema);