const crypto = require('crypto');
const { logger } = require('../../../sheared/utils/logger');

/**
 * OTP Service — وفاء (Wafa) Platform
 *
 * Generates and verifies OTP codes for phone-based authentication.
 * Implements rate limiting and brute-force protection.
 *
 * In production, OTP is sent via:
 *  1. SMS (primary) — via AWS SNS or Twilio
 *  2. WhatsApp (fallback) — for elderly patients
 *
 * In development, OTP is logged to console (no real SMS sent).
 */
class OtpService {
  constructor() {
    this.CODE_LENGTH = 6;
    this.EXPIRY_MINUTES = 5;
    this.MAX_ATTEMPTS = 5;
    this.RESEND_COOLDOWN_SECONDS = 60; // 1 minute between resends
  }

  /**
   * Generate a new OTP code
   * @returns {Object} { code, hashedCode, expiresAt }
   */
  generate() {
    // Generate cryptographically secure random code
    const code = String(crypto.randomInt(0, Math.pow(10, this.CODE_LENGTH)))
      .padStart(this.CODE_LENGTH, '0');

    // Hash the code for storage (don't store plain code)
    const hashedCode = this.hashCode(code);

    const expiresAt = new Date(Date.now() + this.EXPIRY_MINUTES * 60 * 1000);

    return { code, hashedCode, expiresAt };
  }

  /**
   * Hash an OTP code using SHA-256
   * @param {string} code - The plain OTP code
   * @returns {string} Hashed code
   */
  hashCode(code) {
    return crypto
      .createHash('sha256')
      .update(code + (process.env.OTP_SALT || 'wafa-otp-salt'))
      .digest('hex');
  }

  /**
   * Verify an OTP code against stored hash
   * @param {string} code - User-provided code
   * @param {string} hashedCode - Stored hash
   * @param {Date} expiresAt - Expiry timestamp
   * @param {Number} attempts - Current attempt count
   * @returns {Object} { valid, reason }
   */
  verify(code, hashedCode, expiresAt, attempts) {
    // Check if code exists
    if (!hashedCode) {
      return { valid: false, reason: 'NO_OTP_SENT' };
    }

    // Check expiry
    if (new Date() > expiresAt) {
      return { valid: false, reason: 'OTP_EXPIRED' };
    }

    // Check max attempts
    if (attempts >= this.MAX_ATTEMPTS) {
      return { valid: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    // Compare hashes
    const providedHash = this.hashCode(code);
    if (providedHash !== hashedCode) {
      return { valid: false, reason: 'INVALID_CODE' };
    }

    return { valid: true };
  }

  /**
   * Check if a resend is allowed (cooldown check)
   * @param {Date} lastSentAt - Last OTP send timestamp
   * @returns {Object} { allowed, waitSeconds }
   */
  canResend(lastSentAt) {
    if (!lastSentAt) return { allowed: true, waitSeconds: 0 };

    const elapsed = (Date.now() - lastSentAt.getTime()) / 1000;
    if (elapsed >= this.RESEND_COOLDOWN_SECONDS) {
      return { allowed: true, waitSeconds: 0 };
    }

    return {
      allowed: false,
      waitSeconds: Math.ceil(this.RESEND_COOLDOWN_SECONDS - elapsed)
    };
  }

  /**
   * Send OTP via configured channel
   * In development: just log to console
   * In production: call SMS/WhatsApp provider
   *
   * @param {string} phone - Phone number
   * @param {string} code - OTP code
   * @param {string} channel - 'sms' or 'whatsapp'
   */
  async send(phone, code, channel = 'sms') {
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[DEV OTP] Phone: ${phone} | Code: ${code}`);
      return { success: true, channel: 'dev_log' };
    }

    // TODO: Integrate with real SMS provider (AWS SNS / Twilio)
    // TODO: Integrate with WhatsApp Business API for fallback
    try {
      if (channel === 'whatsapp') {
        // await whatsappService.sendOtp(phone, code);
        logger.info(`WhatsApp OTP sent to ${phone}`);
      } else {
        // await smsService.sendOtp(phone, code);
        logger.info(`SMS OTP sent to ${phone}`);
      }
      return { success: true, channel };
    } catch (error) {
      logger.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP. Please try again.');
    }
  }
}

module.exports = new OtpService();
