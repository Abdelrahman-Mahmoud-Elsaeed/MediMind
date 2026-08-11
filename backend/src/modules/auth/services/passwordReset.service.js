const Account = require("../models/Account.model");
const PasswordReset = require("../models/PasswordReset.model");
const emailService = require("../../../config/email.service");
const AppError = require("../../../shared/utils/AppError");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

class PasswordResetService {
  /**
   * Initiates the password reset flow.
   * @param {Object} payload - { email: string }
   * @returns {Promise<ServiceResponse>}
   */
  async forgotPassword({ email }) {
    const normalizedEmail = email.trim().toLowerCase();

    const account = await Account.findOne({ email: normalizedEmail });
    if (!account) {
      // Return generic success to avoid account enumeration
      return new ServiceResponse({
        status: "SUCCESS",
        en: "If an account with this email exists, a password reset link has been sent.",
        ar: "إن كان هذا البريد الإلكتروني مسجلاً لدينا، فلقد تم إرسال رابط استعادة كلمة المرور.",
        data: {},
      });
    }

    const token = await PasswordReset.generateForAccount(account._id);

    // Attempt to send email -- failure does not leak that account exists
    try {
      const firstName = await this._getFirstName(account);
      await emailService.sendResetPassword(normalizedEmail, firstName, token);
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to send password reset email:", error.message);
    }

    return new ServiceResponse({
      status: "SUCCESS",
      en: "If an account with this email exists, a password reset link has been sent.",
      ar: "إن كان هذا البريد الإلكتروني مسجلاً لدينا، فلقد تم إرسال رابط استعادة كلمة المرور.",
      data: {},
    });
  }

  /**
   * Completes the password reset flow.
   * @param {Object} payload - { token: string, newPassword: string }
   * @returns {Promise<ServiceResponse>}
   */
  async resetPassword({ token, newPassword }) {
    const resetDoc = await PasswordReset.findValidToken(token);
    if (!resetDoc) {
      throw new AppError("Invalid or expired token", 400, "INVALID_TOKEN", {
        en: "The password reset link is invalid or has expired.",
        ar: "رابط استعادة كلمة المرور غير صالح أو انتهت صلاحيته.",
      });
    }

    const account = await Account.findById(resetDoc.accountId);
    if (!account) {
      throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND", {
        en: "The account associated with this reset link was not found.",
        ar: "لم يتم العثور على الحساب المرتبط بهذا الرابط.",
      });
    }

    // Update password (pre-save hook in Account model handles hashing)
    account.passwordHash = newPassword;
    await account.save();

    // Invalidate the token
    resetDoc.used = true;
    await resetDoc.save();

    // Revoke all active sessions (force re-login)
    account.sessions = [];
    await account.save();

    return new ServiceResponse({
      status: "SUCCESS",
      en: "Your password has been reset successfully. Please sign in with your new password.",
      ar: "تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول بكلمة المرور الجديدة.",
      data: {},
    });
  }

  async _getFirstName(account) {
    try {
      const MODEL_MAP = {
        PATIENT: require("../models/Patient.model"),
        FAMILY_CAREGIVER: require("../models/FamilyCaregiver.model"),
        DOCTOR: require("../models/Doctor.model"),
        PHARMACIST: require("../models/Pharmacist.model"),
        PROFESSIONAL_CAREGIVER: require("../models/ProfessionalCaregiver.model"),
      };
      const Model = MODEL_MAP[account.role];
      if (!Model) return null;
      const profile = await Model.findOne({ accountId: account._id }).lean();
      return profile?.firstName || null;
    } catch {
      return null;
    }
  }
}

module.exports = new PasswordResetService();
