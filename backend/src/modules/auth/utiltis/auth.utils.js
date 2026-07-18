const AppError = require("../../../shared/utils/AppError");
const { generateAccessToken, generateRefreshToken } = require("../../../shared/utils/jwt.util");
const Account = require("../models/Account.model")
const bcrypt = require("bcrypt");

async function _verifyUniqueness({ email, phone }, session) {
  if (email) {
    const existingEmail = await Account.findOne({
      email: email.trim().toLowerCase(),
    }).session(session);
    if (existingEmail) {
      throw new AppError("Email already registered", 400, "EMAIL_EXISTS", {
        en: "This email address is already in use.",
        ar: "البريد الإلكتروني مسجل بالفعل.",
      });
    }
  }
  if (phone) {
    const existingPhone = await Account.findOne({
      phone: phone.trim(),
    }).session(session);
    if (existingPhone) {
      throw new AppError(
        "Phone number already registered",
        400,
        "PHONE_EXISTS",
        {
          en: "This phone number is already in use.",
          ar: "رقم الهاتف مسجل بالفعل.",
        },
      );
    }
  }
}

async function _finalizeSession(account, profile) {
  const accessToken = generateAccessToken({
    accountId: account._id,
    role: account.role,
  });
  const { token: refreshToken, tokenId } = generateRefreshToken({
    accountId: account._id,
    role: account.role,
  });
  const tokenHash = await bcrypt.hash(refreshToken, 12);

  if (account.sessions.length >= 5) {
    account.sessions.shift();
  }
  account.sessions.push({ tokenId, tokenHash });
  await account.save();

  const isEmailVerified = account.isEmailVerified || false;
  const isPhoneVerified = account.isPhoneVerified || false;

  const isVerified =
    isEmailVerified || isPhoneVerified || profile?.isVerified === true;

  return {
    accessToken,
    refreshToken,
    user: {
      accountId: account._id,
      role: account.role,
      profileId: profile ? profile._id : null,
      isEmailVerified,
      isPhoneVerified,
      isVerified,
    },
  };
}

module.exports = { _finalizeSession, _verifyUniqueness };
