const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FamilyCaregiverSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    relation: {
      type: String,
      enum: [
        "son",
        "daughter",
        "spouse",
        "parent",
        "sibling",
        "friend",
        "other",
      ],
      required: true,
    },

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "Egypt" },
    },

    profilePictureUrl: { type: String, trim: true },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
      },
      startDate: { type: Date },
      endDate: { type: Date },
    },

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
      monthlyReport: { type: Boolean, default: false }
    },
  },
  { timestamps: true },
);

FamilyCaregiverSchema.pre('save', function (next) {
  if (this.isModified('whatsappOptIn')) this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;

});

module.exports = mongoose.model("FamilyCaregiver", FamilyCaregiverSchema);