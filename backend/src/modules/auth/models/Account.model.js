const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const SessionSchema = new mongoose.Schema({
  tokenId: { type: String, required: true },
  tokenHash: { type: String, required: true },
  deviceInfo: { type: String },
  createdAt: { type: Date, default: Date.now, expires: "30d" },
});

const AccountSchema = new Schema({
  email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true, trim: true },
  nationalNumber: { code: { type: String, trim: true }, number: { type: String, trim: true } },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["PATIENT", "FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "ADMIN", "DOCTOR", "PHARMACIST"],
    required: true,
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  sessions: [SessionSchema],
  pushSubscription: { endpoint: String, keys: { p256dh: String, auth: String } },
  deviceTokens: [{
    token: { type: String, required: true, index: true },
    platform: { type: String, enum: ["android", "ios"], required: true },
    deviceId: { type: String, default: null },
    appVersion: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

AccountSchema.index(
  { "nationalNumber.number": 1 },
  { unique: true, partialFilterExpression: { "nationalNumber.number": { $exists: true } } }
);

AccountSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    throw new Error("An Account must have either an email or a phone number for authentication.");
  }
});

AccountSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    if (typeof next === "function") return next();
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  if (typeof next === "function") next();
});

module.exports = mongoose.model("Account", AccountSchema);
