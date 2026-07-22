const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OtpVerificationSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  channel: { type: String, enum: ["sms", "email"], required: true },
  destination: { type: String, required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0, max: 5 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  consumedAt: { type: Date, default: null },
}, { timestamps: true });

OtpVerificationSchema.index({ accountId: 1, consumedAt: 1 });

// Export with both names for compatibility
const OtpModel = mongoose.model('OtpVerification', OtpVerificationSchema);
module.exports = OtpModel;
