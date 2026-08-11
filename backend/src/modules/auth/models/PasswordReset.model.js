const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const PasswordResetSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-delete expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetSchema.index({ accountId: 1, used: 1 });

// Generates a new token (plain text returned once) and stores its hash.
PasswordResetSchema.statics.generateForAccount = async function (accountId) {
  // Delete any existing unused tokens for this account
  await this.deleteMany({ accountId, used: false });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  // Match the 15-minute validity stated in the reset-password email template
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await this.create({
    accountId,
    tokenHash,
    expiresAt,
    used: false,
  });

  // Return the plain token -- sent to the user, never stored
  return token;
};

// Verifies a plain token; returns the document or throws.
PasswordResetSchema.statics.findValidToken = async function (token) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");

  const doc = await this.findOne({ tokenHash, used: false });

  if (!doc) {
    return null;
  }

  if (new Date() > doc.expiresAt) {
    await this.deleteOne({ _id: doc._id });
    return null;
  }

  return doc;
};

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);
