const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const crypto = require("crypto");
const env = require("../../../config/env");
const OtpVerification = require("../models/otp.model");
const Account = require("../models/Account.model");
const AppError = require("../../../shared/utils/AppError");
const ServiceResponse = require("../../../shared/utils/ServiceResponse");

// Initialize AWS SNS Client for SMS deliveries
const snsClient = new SNSClient({
  region: env.AWS_SNS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize AWS SES Client for Transactional Emails
const sesClient = new SESClient({
  region: env.AWS_SES_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

class OtpService {
  /**
   * Generates, saves to MongoDB, and sends a 6-digit OTP
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
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (type === "PHONE") {
      await this._sendSMS(resolvedTarget, otp);
    } else if (type === "EMAIL") {
      await this._sendEmail(resolvedTarget, otp);
    } else {
      throw new AppError("Unsupported transport verification channel type", 400, "INVALID_TYPE", {
        en: "Unsupported channel type specified.",
        ar: "نوع القناة المحدد غير مدعوم."
      });
    }

    // 5. Encapsulate execution using ServiceResponse structure
    return new ServiceResponse({
      success: true,
      status: "SUCCESS",
      data: {},
      en: "OTP has been sent successfully.",
      ar: "تم إرسال رمز التحقق بنجاح."
    });
  }

  /**
   * Validates the verification parameters, checking boundaries & brute-force lock limits against MongoDB,
   * then updates the user's verification profile flags.
   * @param {Object} payload - { accountId: "ObjectIdString", type: "EMAIL" | "PHONE", code: "123456" }
   * @returns {Promise<ServiceResponse>}
   */
  async verifyOtp({ accountId, type, code }) {
    const channel = type.toLowerCase();

    // 1. Fetch tracking token
    const record = await OtpVerification.findOne({ accountId, channel });

    if (!record) {
      throw new AppError("OTP code expired or was never requested", 400, "OTP_NOT_FOUND", {
        en: "Verification code expired or not requested yet.",
        ar: "انتهت صلاحية رمز التحقق أو لم يتم طلبه بعد."
      });
    }

    // 2. Validate standard lifetime limits
    if (new Date() > record.expiresAt) {
      await OtpVerification.deleteOne({ _id: record._id });
      throw new AppError("OTP code expired", 400, "OTP_EXPIRED", {
        en: "The verification code has expired.",
        ar: "انتهت صلاحية رمز التحقق."
      });
    }

    // 3. Brute-force verification ceiling checks
    if (record.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: record._id });
      throw new AppError("Too many incorrect attempts. Please request a new OTP", 429, "BRUTE_FORCE_LOCK", {
        en: "Too many failed attempts. Code revoked.",
        ar: "محاولات كثيرة خاطئة. تم إلغاء الرمز."
      });
    }

    // 4. Hash verification comparison logic
    const inputHash = crypto.createHash("sha256").update(code.trim()).digest("hex");

    if (inputHash !== record.code) {
      record.attempts += 1;
      await record.save();

      throw new AppError(
        `Invalid OTP code. ${5 - record.attempts} attempts remaining.`,
        400,
        "INVALID_OTP",
        {
          en: `Invalid code. ${5 - record.attempts} attempts remaining.`,
          ar: `رمز التحقق غير صحيح. متبقي ${5 - record.attempts} محاولات.`
        }
      );
    }

    // 5. Explicitly apply specific verification true status updates on target account profile
    const updatePayload = {};
    if (type === "EMAIL") updatePayload.isEmailVerified = true;
    if (type === "PHONE") updatePayload.isPhoneVerified = true;

    const updatedAccount = await Account.findByIdAndUpdate(accountId, updatePayload, { new: true });

    if (!updatedAccount) {
      throw new AppError("Associated account profile was not found", 404, "ACCOUNT_NOT_FOUND", {
        en: "Target account profile missing.",
        ar: "الحساب المرتبط غير موجود."
      });
    }

    // 6. Verification completed cleanly, destroy temporary collection verification document
    await OtpVerification.deleteOne({ _id: record._id });

    // 7. Encapsulate successful execution architecture inside ServiceResponse instance
    return new ServiceResponse({
      success: true,
      status: "SUCCESS",
      data: {},
      en: "Identity verification successfully completed.",
      ar: "تم التحقق من الهوية بنجاح."
    });
  }

  // ==========================================
  // PRIVATE INFRASTRUCTURE ROUTINES
  // ==========================================

  async _sendSMS(phoneNumber, otp) {
    try {
      const messageAttributes = {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: env.AWS_SNS_SENDER_ID,
        }
      };

      const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: `Your verification security OTP code is: ${otp}. Valid for 5 minutes.`,
        MessageAttributes: messageAttributes,
      });

      await snsClient.send(command);
    } catch (error) {
      throw new AppError("SMS delivery provider tracking failure", 500, "SMS_PROVIDER_ERROR", {
        en: "Failed to dispatch SMS text token message.",
        ar: "فشل إرسال رسالة التحقق النصية."
      });
    }
  }

  async _sendEmail(emailAddress, otp) {
    try {
      const command = new SendEmailCommand({
        Source: env.AWS_SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [emailAddress],
        },
        Message: {
          Subject: {
            Data: "Your Verification Code",
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
                  <h2 style="color: #333; text-align: center;">Security Verification</h2>
                  <p>Use the following 6-digit One-Time Password (OTP) to complete your verification process. This code is valid for 5 minutes.</p>
                  <div style="background-color: #f4f7f6; padding: 15px; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 5px; color: #0070f3; margin: 20px 0; border-radius: 4px;">
                    ${otp}
                  </div>
                  <p style="font-size: 12px; color: #666; text-align: center;">If you did not request this code, please ignore this email.</p>
                </div>
              `,
              Charset: "UTF-8",
            },
            Text: {
              Data: `Your verification security OTP code is: ${otp}. Valid for 5 minutes.`,
              Charset: "UTF-8",
            },
          },
        },
      });

      await sesClient.send(command);
    } catch (error) {
      console.error("====== AWS SES CRASH DETAILS ======", error);
      throw new AppError("Email gateway delivery communication failure", 500, "EMAIL_PROVIDER_ERROR", {
        en: "Failed to dispatch email verification message.",
        ar: "فشل إرسال بريد التحقق الإلكتروني."
      });
    }
  }
}

module.exports = new OtpService();