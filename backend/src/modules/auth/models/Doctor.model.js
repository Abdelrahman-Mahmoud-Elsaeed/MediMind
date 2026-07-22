const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    specialty: { type: String, required: true },
    syndicateId: { type: String, required: true, unique: true },

    clinicName: { type: String, required: true },

    clinicAddress: {
      governorate: { type: String, trim: true },
      city: { type: String, trim: true },
      street: { type: String, trim: true },
      additionalDirections: { type: String, trim: true },
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },

    isVerified: { type: Boolean, default: false },

    title: {
      type: String,
      enum: ["Specialist", "Consultant", "Professor", "Lecturer"],
      default: "Specialist",
    },
    bio: { type: String, trim: true },
    experienceYears: { type: Number, min: 0 },
    consultationFee: { type: Number, min: 0 },
    profilePictureUrl: { type: String, trim: true },
    clinicPhone: { type: String, trim: true },

    workingHours: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        isClosed: { type: Boolean, default: false },
        openTime: { type: String },
        closeTime: { type: String },
      },
    ],

    whatsappOptIn: { type: Boolean, default: false },
    whatsappOptInDate: { type: Date, default: null },
    preferredLanguage: { type: String, enum: ["en", "ar"], default: "ar" },

    subscription: {
      status: {
        type: String,
        enum: ["pilot", "active", "expired"],
        default: "pilot",
      },
      startDate: { type: Date },
      endDate: { type: Date },
    },

    whatsappReport: {
      enabled: { type: Boolean, default: false },
      day: {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        default: "friday",
      },
      time: { type: String, default: "18:00" },
    },
  },
  { timestamps: true },
);

DoctorSchema.pre("save", function (next) {
  if (this.isModified("whatsappOptIn"))
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
});



module.exports = mongoose.model("Doctor", DoctorSchema);
