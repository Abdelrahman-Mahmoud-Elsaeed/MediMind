const AppError = require("../../../shared/utils/AppError");
const { generateAccessToken, generateRefreshToken } = require("../../../shared/utils/jwt.util");
const Account = require("../models/Account.model");
const bcrypt = require("bcrypt");

async function _verifyUniqueness({ email, phone }) {
  if (email) {
    const existing = await Account.findOne({ email: email.trim().toLowerCase() });
    if (existing) throw new AppError("Email already registered", 400, "EMAIL_EXISTS", { en: "Email already in use.", ar: "البريد مسجل بالفعل." });
  }
  if (phone) {
    const existing = await Account.findOne({ phone: phone.trim() });
    if (existing) throw new AppError("Phone already registered", 400, "PHONE_EXISTS", { en: "Phone already in use.", ar: "الهاتف مسجل بالفعل." });
  }
}

async function _finalizeSession(account, profile) {
  const accessToken = generateAccessToken({ accountId: account._id, role: account.role });
  const { token: refreshToken, tokenId } = generateRefreshToken({ accountId: account._id, role: account.role });
  const tokenHash = await bcrypt.hash(refreshToken, 12);
  if (account.sessions.length >= 5) account.sessions.shift();
  account.sessions.push({ tokenId, tokenHash });
  await account.save();
  return { accessToken, refreshToken, user: { accountId: account._id, role: account.role, profileId: profile ? profile._id : null, isEmailVerified: account.isEmailVerified, isPhoneVerified: account.isPhoneVerified, isVerified: account.isEmailVerified || account.isPhoneVerified || profile?.isVerified === true } };
}

module.exports = { _finalizeSession, _verifyUniqueness };
