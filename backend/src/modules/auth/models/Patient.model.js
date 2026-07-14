const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },

  emergencyContact: {
    name: String,
    phone: String,
  },

  whatsappOptIn: { type: Boolean, default: false },
  whatsappOptInDate: { type: Date, default: null },
  
  preferredLanguage: { 
    type: String, 
    enum: ["en", "ar"], 
    default: "ar"
  },
  
  consents: {
    familyCaregiver: { type: Boolean, default: false },
    professionalCaregiver: { type: Boolean, default: false },
    doctor: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false }
  },
  
}, { timestamps: true });

PatientSchema.pre('save', function (next) {
  if (this.isModified('whatsappOptIn')) {
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
  }
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
