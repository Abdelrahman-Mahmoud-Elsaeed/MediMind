const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfessionalCaregiverSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    addedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    hourlyRate: { type: Number, required: true },
    bio: { type: String },
    isAvailable: { type: Boolean, default: true },

    rating: { type: Number, default: 5.0, min: 0, max: 5 },

    specialties: [
      {
        type: String,
        enum: [
          "Geriatric",
          "Pediatric",
          "Post-Surgery Recovery",
          "Palliative Care",
          "Neurological",
          "General Nursing",
        ],
        default: ["General Nursing"],
      },
    ],

    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0 },
    licenseNumber: { type: String, trim: true },

    address: {
      governorate: { type: String, trim: true },
      city: { type: String, trim: true },
      street: { type: String, trim: true },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },

    profilePictureUrl: { type: String, trim: true },
    alternativePhone: { type: String, trim: true },

    whatsappOptIn: { type: Boolean, default: false },
    whatsappOptInDate: { type: Date, default: null },
    preferredLanguage: {
      type: String,
      enum: ["en", "ar"],
      default: "ar",
    },

    alertSettings: {
      instantMissed: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

ProfessionalCaregiverSchema.pre("save", function (next) {
  if (this.isModified("whatsappOptIn"))
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
});

ProfessionalCaregiverSchema.index({ location: "2dsphere" });

module.exports = mongoose.model(
  "ProfessionalCaregiver",
  ProfessionalCaregiverSchema,
);
