const Otp = require('../models/otp.model');
const Account = require('../models/Account.model');
const AppError = require('../../../shared/utils/AppError');
const { logger } = require('../../../shared/utils/logger');
const bcrypt = require('bcrypt');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');

class OtpService {
  /**
   * Generate and send a 6-digit OTP to the user's email or phone.
   * Called automatically after register or login if the account is not yet verified.
   */
  async sendOtp(accountId) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND', {
        en: 'Account not found.', ar: 'الحساب غير موجود.'
      });
    }

    // Determine channel
    const channel = account.email ? 'email' : 'sms';
    const destination = account.email || account.phone;

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);

    // Invalidate any previous unused OTPs for this account
    await Otp.updateMany(
      { accountId, consumedAt: null },
      { consumedAt: new Date() }
    );

    // Create new OTP record (auto-expires in 10 minutes via TTL)
    const otpRecord = new Otp({
      accountId,
      channel,
      destination,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await otpRecord.save();

    // Send the OTP
    if (channel === 'email') {
      await this._sendEmailOtp(destination, code);
    } else {
      await this._sendSmsOtp(destination, code);
    }

    logger.info(`[OTP] Sent ${channel} OTP to ${destination} for account ${accountId}`);

    return new ServiceResponse({
      status: 'SUCCESS',
      en: `OTP sent to your ${channel === 'email' ? 'email' : 'phone'}.`,
      ar: `تم إرسال رمز التحقق إلى ${channel === 'email' ? 'بريدك الإلكتروني' : 'هاتفك'}.`,
      data: {
        channel,
        destination: destination.replace(/(\w{3})[\w@.]+/, '$1***'), // masked
        expiresIn: 600, // seconds
      },
    });
  }

  /**
   * Verify the OTP code. If correct, marks the account as verified.
   */
  async verifyOtp(accountId, code) {
    const otpRecord = await Otp.findOne({
      accountId,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new AppError('OTP expired or not found', 400, 'OTP_EXPIRED', {
        en: 'OTP has expired. Please request a new one.',
        ar: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.',
      });
    }

    // Check brute-force attempts
    if (otpRecord.attempts >= 5) {
      otpRecord.consumedAt = new Date();
      await otpRecord.save();
      throw new AppError('Too many attempts', 400, 'OTP_TOO_MANY_ATTEMPTS', {
        en: 'Too many failed attempts. Please request a new OTP.',
        ar: 'محاولات كثيرة فاشلة. يرجى طلب رمز جديد.',
      });
    }

    // Verify the code
    const isMatch = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new AppError('Invalid OTP', 400, 'OTP_INVALID', {
        en: `Invalid code. ${5 - otpRecord.attempts} attempts remaining.`,
        ar: `رمز غير صحيح. متبقي ${5 - otpRecord.attempts} محاولات.`,
      });
    }

    // Mark OTP as consumed
    otpRecord.consumedAt = new Date();
    await otpRecord.save();

    // Mark account as verified
    const account = await Account.findById(accountId);
    if (otpRecord.channel === 'email') {
      account.isEmailVerified = true;
    } else {
      account.isPhoneVerified = true;
    }

    // Activate the account if it was pending (for providers)
    if (!account.isActive && account.role !== 'ADMIN') {
      // Self-registered patients and caregivers can be activated immediately
      if (account.role === 'PATIENT' || account.role === 'FAMILY_CAREGIVER') {
        account.isActive = true;
      }
      // Doctors and pharmacists stay inactive until admin verification
    }
    await account.save();

    logger.info(`[OTP] Account ${accountId} verified via ${otpRecord.channel}`);

    return new ServiceResponse({
      status: 'SUCCESS',
      en: 'Account verified successfully.',
      ar: 'تم التحقق من الحساب بنجاح.',
      data: {
        accountId: account._id,
        isEmailVerified: account.isEmailVerified,
        isPhoneVerified: account.isPhoneVerified,
        isActive: account.isActive,
      },
    });
  }

  /**
   * Send OTP via email (placeholder — integrate with email service in production)
   */
  async _sendEmailOtp(email, code) {
    // TODO: Integrate with the email service (config/email.service.js)
    // For now, log it (in production, use nodemailer or AWS SES)
    logger.info(`[OTP-EMAIL] To: ${email}, Code: ${code}`);
    console.log(`\n📧 OTP Email sent to ${email}: Your verification code is ${code}\n`);
  }

  /**
   * Send OTP via SMS (placeholder — integrate with AWS SNS in production)
   */
  async _sendSmsOtp(phone, code) {
    // TODO: Integrate with AWS SNS
    logger.info(`[OTP-SMS] To: ${phone}, Code: ${code}`);
    console.log(`\n📱 OTP SMS sent to ${phone}: Your verification code is ${code}\n`);
  }
}

module.exports = new OtpService();
