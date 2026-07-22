const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PharmacistSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    pharmacyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true },

    address: {
      governorate: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      additionalDirections: { type: String, trim: true },
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },

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
    is24Hours: { type: Boolean, default: false },

    pharmacyPhone: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    taxRegistrationNumber: { type: String, trim: true },
    commercialRegisterId: { type: String, trim: true },

    offersDelivery: { type: Boolean, default: true },

    subscription: {
      status: {
        type: String,
        enum: ["pilot", "active", "expired"],
        default: "pilot",
      },
      plan: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
      startDate: { type: Date },
      endDate: { type: Date },
    },

    whatsappOptIn: { type: Boolean, default: false },
    whatsappOptInDate: { type: Date, default: null },
    preferredLanguage: {
      type: String,
      enum: ["en", "ar"],
      default: "ar",
    },

    settings: {
      autoReminder: { type: Boolean, default: true },
      refillAlertDays: { type: Number, default: 5 },
    },
  },
  { timestamps: true },
);

PharmacistSchema.pre("save", function (next) {
  if (this.isModified("whatsappOptIn"))
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
});



module.exports = mongoose.model("Pharmacist", PharmacistSchema);
