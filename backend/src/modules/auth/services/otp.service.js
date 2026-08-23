const crypto = require("crypto");
const mongoose = require("mongoose");
const Account = require("../models/Account.model");
const OtpVerification = require("../models/otp.model");
const AppError = require("../../../shared/utils/AppError");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");
const { logger } = require("../../../shared/utils/logger");

class OtpService {
  /**
   * Generates, saves to MongoDB, and sends a 6-digit OTP via AWS SNS (SMS) or Email
   * @param {Object} payload - { accountId: "ObjectIdString", target: "email/phone", type: "EMAIL" | "PHONE" }
   * @returns {Promise<ServiceResponse>}
   */
  async sendOtp({ accountId, target, type }) {
    let resolvedTarget = target ? target.trim() : null;
    const channel = type ? type.toLowerCase() : "email";

    if (!resolvedTarget) {
      const account = await Account.findById(accountId);
      if (!account) {
        throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND", {
          en: "Account not found.",
          ar: "الحساب غير موجود."
        });
      }
      resolvedTarget = channel === "email" ? account.email : account.phone;
    }

    if (!resolvedTarget) {
      throw new AppError("Verification target destination is missing", 400, "MISSING_TARGET", {
        en: "No email or phone number found to send verification code.",
        ar: "لم يتم العثور على بريد إلكتروني أو رقم هاتف لإرسال رمز التحقق."
      });
    }

    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpVerification.findOneAndUpdate(
      { accountId, channel },
      {
        code: hashedOtp,
        attempts: 0,
        expiresAt,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // Highly visible CloudWatch & Console searchable log banner
    console.log(`
============================================================
🔑 [OTP DISPATCH] SENSITIVE VERIFICATION CODE GENERATED 🔑
============================================================
  • Target Destination : ${resolvedTarget}
  • Channel Type       : ${type || channel}
  • Generated OTP Code : >>> ${otp} <<<
  • Account ID         : ${accountId || 'N/A'}
  • Environment        : ${process.env.NODE_ENV || 'development'}
  • Timestamp          : ${new Date().toISOString()}
============================================================
`);

    logger.info(
      { target: resolvedTarget, channel: type || channel, otp, accountId },
      '[OTP_DISPATCH] Verification code generated successfully'
    );

    // Dispatch via SNS (SMS) or Email in production/staging environments
    if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
      if (channel === "phone") {
        await this._sendSMS(resolvedTarget, otp);
      } else {
        await this._sendEmail(resolvedTarget, otp);
      }
    } else {
      logger.info(
        { target: resolvedTarget, channel, otp },
        "[LOCAL_DEV] Skipped external SMS/Email dispatch in local development mode"
      );
    }

    return new ServiceResponse({
      success: true,
      status: "SUCCESS",
      data: {},
      en: "OTP has been sent successfully.",
      ar: "تم إرسال رمز التحقق بنجاح."
    });
  }

  /**
   * Sends transactional SMS via AWS SNS
   */
  async _sendSMS(phone, otp) {
    try {
      const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
      const snsClient = new SNSClient({ region: process.env.AWS_SNS_REGION || process.env.AWS_REGION || "us-east-1" });
      const command = new PublishCommand({
        PhoneNumber: phone,
        Message: `Your MediMind verification code is: ${otp}`,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: process.env.AWS_SNS_SENDER_ID || 'MEDTRACK'
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      });
      await snsClient.send(command);
      logger.info({ phone }, '[SNS_SMS_SUCCESS] SMS verification code published via AWS SNS');
    } catch (err) {
      logger.error(err, '[SNS_SMS_ERROR] Failed to publish SMS via AWS SNS');
      throw err;
    }
  }

  /**
   * Sends transactional email via Email Service
   */
  async _sendEmail(email, otp) {
    try {
      const emailService = require("../../../config/email.service");
      await emailService.sendOtp(email, "User", otp);
      logger.info({ email }, '[EMAIL_SUCCESS] Email verification code sent successfully');
    } catch (err) {
      logger.error(err, '[EMAIL_ERROR] Failed to send email verification code');
      throw err;
    }
  }

  /**
   * Validates the verification parameters, checking boundaries & brute-force lock limits against MongoDB,
   * then updates the user's verification profile flags.
   * @param {Object} payload - { accountId: "ObjectIdString", type: "EMAIL" | "PHONE", code: "123456" }
   * @returns {Promise<ServiceResponse>}
   */
  async verifyOtp({ accountId, type, code }) {
    const channel = type.toLowerCase();

    const otpRecord = await OtpVerification.findOne({ accountId, channel });

    if (!otpRecord) {
      throw new AppError("No OTP requested for this channel", 400, "OTP_NOT_FOUND", {
        en: "No verification code requested.",
        ar: "لم يتم طلب رمز تحقق لهذه القناة."
      });
    }

    if (otpRecord.attempts >= 5) {
      throw new AppError("Maximum OTP attempts exceeded", 429, "MAX_ATTEMPTS_EXCEEDED", {
        en: "Too many failed attempts. Please request a new verification code.",
        ar: "تم تجاوز الحد الأقصى للمحاولات. يرجى طلب رمز جديد."
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new AppError("OTP has expired", 400, "OTP_EXPIRED", {
        en: "Verification code has expired. Please request a new code.",
        ar: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد."
      });
    }

    const hashedInput = crypto.createHash("sha256").update(code).digest("hex");

    if (hashedInput !== otpRecord.code) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      console.log(`❌ [OTP VERIFY FAILED] Account: ${accountId} | Input: ${code} | Attempts: ${otpRecord.attempts}`);

      throw new AppError("Invalid OTP verification code", 400, "INVALID_OTP", {
        en: "Invalid verification code. Please try again.",
        ar: "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى."
      });
    }

    await OtpVerification.deleteOne({ _id: otpRecord._id });

    const updateField = channel === "email" ? { isEmailVerified: true } : { isPhoneVerified: true };
    await Account.findByIdAndUpdate(accountId, updateField);

    console.log(`✅ [OTP VERIFY SUCCESS] Account: ${accountId} | Channel: ${channel}`);

    return new ServiceResponse({
      success: true,
      status: "SUCCESS",
      data: {},
      en: "Verification completed successfully.",
      ar: "تمت عملية التحقق بنجاح."
    });
  }
}

module.exports = new OtpService();