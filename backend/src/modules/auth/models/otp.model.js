
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OtpVerificationSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  channel: { 
    type: String, 
    enum: ["phone", "email"], 
    required: true 
  },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Auto-delete expired OTPs
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpVerificationSchema.index({ accountId: 1, channel: 1 });

module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);