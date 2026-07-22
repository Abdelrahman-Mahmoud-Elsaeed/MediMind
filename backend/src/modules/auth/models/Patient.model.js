const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  address: [{ street: { type: String, trim: true }, city: { type: String, trim: true }, state: { type: String, trim: true }, postalCode: { type: String, trim: true }, country: { type: String, trim: true, default: "Egypt" }, additionalDirections: { type: String, trim: true } }],
  allergies: [{ type: String, trim: true }],
  height: { type: Number },
  weight: { type: Number },
  bmi: { type: Number },
  profilePictureUrl: { type: String, trim: true },
  emergencyContact: [{ name: String, phone: String }],
  whatsappOptIn: { type: Boolean, default: false },
  whatsappOptInDate: { type: Date, default: null },
  preferredLanguage: { type: String, enum: ["en", "ar"], default: "ar" },
  consents: {
    familyCaregiver: { type: Boolean, default: false },
    professionalCaregiver: { type: Boolean, default: false },
    doctor: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false },
  },
  alarmSettings: {
    ringtone: { type: String, default: "default" },
    snoozeMinutes: { type: Number, default: 5, min: 1, max: 30 },
    maxSnoozeCount: { type: Number, default: 6, min: 1, max: 20 },
    vibrate: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    autoEscalateToCaregiver: { type: Boolean, default: true },
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: "22:00" },
    quietHoursEnd: { type: String, default: "07:00" },
  },
}, { timestamps: true });

PatientSchema.pre("save", function (next) {
  if (this.isModified("whatsappOptIn")) {
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
  }
  if (this.isModified("height") || this.isModified("weight")) {
    if (this.height && this.weight && this.height > 0) {
      const h = this.height / 100;
      this.bmi = Math.round((this.weight / (h * h)) * 10) / 10;
    }
  }
  if (typeof next === "function") next();
});

module.exports = mongoose.model("Patient", PatientSchema);
