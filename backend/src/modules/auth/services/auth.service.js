const Account = require("../models/Account.model");
const Patient = require("../models/Patient.model");
const FamilyCaregiver = require("../models/FamilyCaregiver.model");
const Doctor = require("../models/Doctor.model");
const Pharmacist = require("../models/Pharmacist.model");
const ProfessionalCaregiver = require("../models/ProfessionalCaregiver.model");
const Admin = require("../models/Admin.model");
const { _finalizeSession } = require("../utils/auth.utils");
const AppError = require("../../../shared/utils/AppError");
const bcrypt = require("bcrypt");
const {
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../../../shared/utils/jwt.util");
const ServiceResponse = require("../../../shared/utils/ServiceResponse"); // Path to your ServiceResponse class

const MODEL_MAP = {
  PATIENT: Patient,
  FAMILY_CAREGIVER: FamilyCaregiver,
  DOCTOR: Doctor,
  PHARMACIST: Pharmacist,
  PROFESSIONAL_CAREGIVER: ProfessionalCaregiver,
  ADMIN: Admin,
};

class AuthService {
  async refreshSession(rawRefreshToken) {
    const decoded = verifyToken(rawRefreshToken);
    const account = await Account.findById(decoded.accountId);

    if (!account || !account.isActive || !MODEL_MAP[account.role]) {
      throw new AppError("Invalid session", 401, "INVALID_SESSION", {
        en: "Your session is invalid or has been modified.",
        ar: "الجلسة غير صالحة أو تم تعديلها.",
      });
    }

    const sessionIndex = account.sessions.findIndex(
      (s) => s.tokenId === decoded.jti,
    );
    if (sessionIndex === -1) {
      throw new AppError("Session expired", 401, "SESSION_EXPIRED", {
        en: "Your session has expired. Please sign in again.",
        ar: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
      });
    }

    const currentSession = account.sessions[sessionIndex];
    const isTokenValid = await bcrypt.compare(
      rawRefreshToken,
      currentSession.tokenHash,
    );
    if (!isTokenValid) {
      account.sessions.splice(sessionIndex, 1);
      await account.save();
      throw new AppError("Session compromised", 401, "COMPROMISED_SESSION", {
        en: "Security warning: Session token mismatch detected.",
        ar: "تحذير أمني: تم رصد عدم تطابق في رمز الجلسة.",
      });
    }

    const newAccessToken = generateAccessToken({
      accountId: account._id,
      role: account.role,
    });
    const { token: newRefreshToken, tokenId: newTokenId } =
      generateRefreshToken({
        accountId: account._id,
        role: account.role,
      });

    const newTokenHash = await bcrypt.hash(newRefreshToken, 12);
    currentSession.tokenId = newTokenId;
    currentSession.tokenHash = newTokenHash;

    account.markModified("sessions");
    await account.save();

    return new ServiceResponse({
      status: "SUCCESS",
      en: "Session tokens renewed successfully.",
      ar: "تم تجديد رموز الجلسة بنجاح.",
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  }

  async login(credentials) {
    const { email, phone, password } = credentials;

    const account = await Account.findOne({
      $or: [
        ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ...(phone ? [{ phone: phone.trim() }] : []),
      ],
    });

    if (!account || !MODEL_MAP[account.role]) {
      throw new AppError("Incorrect credentials", 401, "INVALID_CREDENTIALS", {
        en: "The login credentials provided are incorrect.",
        ar: "بيانات الاعتماد المدخلة غير صحيحة.",
      });
    }

    if (!account.isActive) {
      throw new AppError("Account is deactivated", 403, "ACCOUNT_INACTIVE", {
        en: "Your account has been deactivated. Please contact support.",
        ar: "هذا الحساب معطل حالياً. يرجى التواصل مع الدعم الفني.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppError("Incorrect credentials", 401, "INVALID_CREDENTIALS", {
        en: "The login credentials provided are incorrect.",
        ar: "بيانات الاعتماد المدخلة غير صحيحة.",
      });
    }

    const TargetModel = MODEL_MAP[account.role];
    const profile = await TargetModel.findOne({
      accountId: account._id,
    }).lean();

    const sessionData = await _finalizeSession(account, profile);

    return new ServiceResponse({
      status: "SUCCESS",
      en: "Logged in successfully.",
      ar: "تم تسجيل الدخول بنجاح.",
      data: sessionData,
    });
  }

  async logout(accountId, rawRefreshToken) {
    if (rawRefreshToken) {
      try {
        const decoded = verifyToken(rawRefreshToken);
        await Account.findByIdAndUpdate(accountId, {
          $pull: { sessions: { tokenId: decoded.jti } },
        });
      } catch (err) {}
    }

    return new ServiceResponse({
      status: "SUCCESS",
      en: "Logged out successfully.",
      ar: "تم تسجيل الخروج بنجاح.",
      data: {},
    });
  }
}

module.exports = new AuthService();
