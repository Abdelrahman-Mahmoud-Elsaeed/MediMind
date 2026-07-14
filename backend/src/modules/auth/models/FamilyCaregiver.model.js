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
  if (this.isModified('whatsappOptIn')) {
    this.whatsappOptInDate = this.whatsappOptIn ? new Date() : null;
  }
  next();
});

module.exports = mongoose.model("FamilyCaregiver", FamilyCaregiverSchema);