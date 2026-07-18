const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    address: [
      {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true, default: "Egypt" },
        additionalDirections: { type: String, trim: true },
      },
    ],

    allergies: [{ type: String, trim: true }],

    height: { type: Number },
    weight: { type: Number },
    bmi: { type: Number },

    profilePictureUrl: { type: String, trim: true },

    emergencyContact: [
      {
        name: String,
        phone: String,
      },
    ],

    whatsappOptIn: { type: Boolean, default: false },
    whatsappOptInDate: { type: Date, default: null },

    preferredLanguage: {
      type: String,
      enum: ["en", "ar"],
      default: "ar",
    },

    consents: {
      familyCaregiver: { type: Boolean, default: false },
      professionalCaregiver: { type: Boolean, default: false },
      doctor: { type: Boolean, default: false },
      pharmacy: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

PatientSchema.pre("save", function () {
  if (this.isModified("whatsappOptIn")) {
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
  }

  if (this.isModified("height") || this.isModified("weight")) {
    if (this.height && this.weight && this.height > 0) {
      const heightInMeters = this.height / 100;
      const rawBmi = this.weight / (heightInMeters * heightInMeters);
      this.bmi = Math.round(rawBmi * 10) / 10;
    } else {
      this.bmi = undefined;
    }
  }
});

module.exports = mongoose.model("Patient", PatientSchema);
