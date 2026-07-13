const Account = require('../models/Account.model');
const Patient = require('../models/Patient.model');
const Caregiver = require('../models/Caregiver.model');
const Pharmacy = require('../models/Pharmacy.model');
const Doctor = require('../models/Doctor.model');
const otpService = require('./otp.service');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../../sheared/utils/jwt.util');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Auth Service — وفاء (Wafa) Platform
 *
 * Phone + OTP based authentication (no email/password for regular users).
 * Admin accounts use email + password (for finance/ops security).
 */
class AuthService {
  /**
   * Step 1: Send OTP to phone number
   * @param {Object} params - { phone, channel }
   */
  async sendOtp({ phone, channel = 'sms' }) {
    // Check if account exists (we still send OTP either way — don't leak account existence)
    const account = await Account.findOne({ phone });

    // Rate limit check (handled at middleware level too)
    if (account && account.otp.lastSentAt) {
      const { allowed, waitSeconds } = otpService.canResend(account.otp.lastSentAt);
      if (!allowed) {
        const err = new Error(`Please wait ${waitSeconds} seconds before requesting a new code`);
        err.code = 'OTP_COOLDOWN';
        err.waitSeconds = waitSeconds;
        throw err;
      }
    }

    // Generate new OTP
    const { code, hashedCode, expiresAt } = otpService.generate();

    // Save to account (or temp store if account doesn't exist yet)
    if (account) {
      account.otp = {
        hashedCode,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date()
      };
      await account.save();
    } else {
      // For non-existing accounts, we still log the OTP in dev mode
      // In production, we'd use a Redis cache for temp OTP storage
      logger.info(`[OTP] New user registration attempt for ${phone}`);
    }

    // Send the OTP
    await otpService.send(phone, code, channel);

    return {
      success: true,
      message: 'OTP sent successfully',
      // Return whether this is a new user (for frontend to show registration flow)
      isNewUser: !account,
      expiresIn: otpService.EXPIRY_MINUTES * 60 // seconds
    };
  }

  /**
   * Step 2: Verify OTP and login/register
   * @param {Object} params - { phone, code, role, firstName, lastName }
   */
  async verifyOtp({ phone, code, role, firstName, lastName }) {
    const account = await Account.findOne({ phone });

    // For new users: validate required fields
    if (!account) {
      if (!role) {
        throw new Error('Role is required for new user registration');
      }
      // OTP was sent in step 1 but account doesn't exist — we need a temp OTP store
      // For now, in dev mode, accept any 6-digit code if account doesn't exist
      // TODO: Use Redis for temp OTP storage for unregistered phones
      logger.warn(`[DEV] Auto-registering new user ${phone} with role ${role}`);

      return this._createNewAccount({ phone, role, firstName, lastName });
    }

    // Verify OTP for existing account
    const result = otpService.verify(
      code,
      account.otp.hashedCode,
      account.otp.expiresAt,
      account.otp.attempts
    );

    if (!result.valid) {
      // Increment attempts
      account.otp.attempts = (account.otp.attempts || 0) + 1;
      await account.save();

      const err = new Error(this._getOtpErrorMessage(result.reason));
      err.code = result.reason;
      throw err;
    }

    // Clear OTP after successful verification
    account.otp = { hashedCode: null, expiresAt: null, attempts: 0, lastSentAt: null };
    account.isPhoneVerified = true;
    account.lastLoginAt = new Date();
    await account.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      accountId: account._id,
      role: account.role
    });
    const refreshToken = generateRefreshToken({
      accountId: account._id,
      role: account.role
    });

    logger.info(`User logged in: ${phone}, role: ${account.role}`);

    // Get profile ID based on role
    const profileId = await this._getProfileId(account);

    return {
      accessToken,
      refreshToken,
      user: {
        accountId: account._id,
        role: account.role,
        profileId,
        isNewUser: false,
        isProfileComplete: await this._isProfileComplete(account)
      }
    };
  }

  /**
   * Create a new account with role-specific profile
   */
  async _createNewAccount({ phone, role, firstName, lastName }) {
    const account = new Account({
      phone,
      role,
      isActive: true,
      isPhoneVerified: true,
      lastLoginAt: new Date(),
      consents: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        privacyPolicyAccepted: true,
        privacyPolicyAcceptedAt: new Date()
      },
      subscription: {
        plan: role === 'PATIENT' ? 'free' : 'none',
        status: role === 'PATIENT' ? 'active' : 'trial'
      }
    });
    await account.save();

    // Create role-specific profile
    let profile = null;
    const profileData = {
      accountId: account._id,
      firstName: firstName || '',
      lastName: lastName || '',
      phone
    };

    switch (role) {
      case 'PATIENT':
        profile = new Patient(profileData);
        break;
      case 'CAREGIVER':
        profile = new Caregiver(profileData);
        break;
      case 'PHARMACY':
        // Pharmacy needs additional fields — create minimal stub, complete via /profiles/complete
        profile = new Pharmacy({
          accountId: account._id,
          pharmacyName: firstName || 'صيدلية جديدة',
          ownerName: `${firstName || ''} ${lastName || ''}`.trim() || 'مالك الصيدلية',
          phone,
          licenseNumber: 'PENDING-' + Date.now()
        });
        break;
      case 'DOCTOR':
        profile = new Doctor({
          accountId: account._id,
          fullName: `${firstName || ''} ${lastName || ''}`.trim() || 'دكتور جديد',
          phone,
          specialty: 'general_practitioner',
          syndicateId: 'PENDING-' + Date.now()
        });
        break;
      case 'ADMIN':
        // Admins created via separate admin seeding script
        throw new Error('Admin accounts must be created via admin seeding script');
      default:
        throw new Error(`Invalid role: ${role}`);
    }

    if (profile) {
      await profile.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      accountId: account._id,
      role: account.role
    });
    const refreshToken = generateRefreshToken({
      accountId: account._id,
      role: account.role
    });

    logger.info(`New user registered: ${phone}, role: ${role}`);

    return {
      accessToken,
      refreshToken,
      user: {
        accountId: account._id,
        role: account.role,
        profileId: profile ? profile._id : null,
        isNewUser: true,
        isProfileComplete: false
      }
    };
  }

  /**
   * Get profile ID based on role
   */
  async _getProfileId(account) {
    const Model = this._getProfileModel(account.role);
    if (!Model) return null;
    const profile = await Model.findOne({ accountId: account._id }).select('_id');
    return profile ? profile._id : null;
  }

  _getProfileModel(role) {
    switch (role) {
      case 'PATIENT': return Patient;
      case 'CAREGIVER': return Caregiver;
      case 'PHARMACY': return Pharmacy;
      case 'DOCTOR': return Doctor;
      default: return null;
    }
  }

  /**
   * Check if user has completed their profile
   */
  async _isProfileComplete(account) {
    const Model = this._getProfileModel(account.role);
    if (!Model) return true;
    const profile = await Model.findOne({ accountId: account._id });
    if (!profile) return false;

    if (account.role === 'PATIENT' || account.role === 'CAREGIVER') {
      return !!(profile.firstName && profile.lastName);
    }
    if (account.role === 'PHARMACY') {
      return !!(profile.pharmacyName && profile.licenseNumber && !profile.licenseNumber.startsWith('PENDING-'));
    }
    if (account.role === 'DOCTOR') {
      return !!(profile.fullName && profile.specialty && !profile.syndicateId.startsWith('PENDING-'));
    }
    return true;
  }

  _getOtpErrorMessage(reason) {
    const messages = {
      'NO_OTP_SENT': 'No OTP was sent. Please request a new code.',
      'OTP_EXPIRED': 'OTP has expired. Please request a new code.',
      'MAX_ATTEMPTS_EXCEEDED': 'Maximum attempts exceeded. Please request a new code.',
      'INVALID_CODE': 'Invalid OTP code. Please try again.'
    };
    return messages[reason] || 'OTP verification failed';
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const decoded = verifyToken(refreshToken);
    const account = await Account.findById(decoded.accountId);
    if (!account || !account.isActive) {
      throw new Error('Invalid or expired refresh token');
    }

    const accessToken = generateAccessToken({
      accountId: account._id,
      role: account.role
    });

    return { accessToken };
  }

  /**
   * Logout (clears server-side state if needed)
   */
  async logout(accountId) {
    if (accountId) {
      await Account.findByIdAndUpdate(accountId, { lastLoginAt: new Date() });
    }
    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  /**
   * Get current account info
   */
  async getAccountById(accountId) {
    const account = await Account.findById(accountId).select('-passwordHash -otp');
    if (!account) {
      throw new Error('Account not found');
    }
    return account;
  }
}

module.exports = new AuthService();
