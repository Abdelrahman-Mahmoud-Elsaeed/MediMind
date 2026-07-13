/**
 * OTP Service Tests — وفاء (Wafa)
 *
 * Tests the OTP generation, hashing, and verification logic.
 */

const otpService = require('../../modules/auth/services/otp.service');

describe('🔐 OTP Service', () => {

  describe('generate()', () => {
    test('should generate a 6-digit code', () => {
      const result = otpService.generate();
      expect(result.code).toMatch(/^\d{6}$/);
    });

    test('should generate a hashed code (different from plain)', () => {
      const result = otpService.generate();
      expect(result.hashedCode).toBeTruthy();
      expect(result.hashedCode).not.toBe(result.code);
      expect(result.hashedCode.length).toBeGreaterThan(30);
    });

    test('should set expiry 5 minutes in the future', () => {
      const before = new Date();
      const result = otpService.generate();
      const after = new Date();

      const expectedMin = new Date(before.getTime() + 5 * 60 * 1000);
      const expectedMax = new Date(after.getTime() + 5 * 60 * 1000);

      expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    test('should generate different codes each time (statistical)', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(otpService.generate().code);
      }
      // At least 90 unique codes out of 100
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('hashCode()', () => {
    test('should return a consistent hash for the same input', () => {
      const code = '123456';
      const hash1 = otpService.hashCode(code);
      const hash2 = otpService.hashCode(code);
      expect(hash1).toBe(hash2);
    });

    test('should return different hashes for different inputs', () => {
      const hash1 = otpService.hashCode('123456');
      const hash2 = otpService.hashCode('654321');
      expect(hash1).not.toBe(hash2);
    });

    test('should return a hex string', () => {
      const hash = otpService.hashCode('123456');
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('verify()', () => {
    test('should return valid: true for correct code', () => {
      const { code, hashedCode, expiresAt } = otpService.generate();
      const result = otpService.verify(code, hashedCode, expiresAt, 0);
      expect(result.valid).toBe(true);
    });

    test('should return INVALID_CODE for wrong code', () => {
      const { hashedCode, expiresAt } = otpService.generate();
      const result = otpService.verify('000000', hashedCode, expiresAt, 0);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_CODE');
    });

    test('should return OTP_EXPIRED for past expiry', () => {
      const { code, hashedCode } = otpService.generate();
      const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
      const result = otpService.verify(code, hashedCode, pastDate, 0);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('OTP_EXPIRED');
    });

    test('should return NO_OTP_SENT when hashedCode is null', () => {
      const result = otpService.verify('123456', null, new Date(), 0);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('NO_OTP_SENT');
    });

    test('should return MAX_ATTEMPTS_EXCEEDED when attempts >= 5', () => {
      const { code, hashedCode, expiresAt } = otpService.generate();
      const result = otpService.verify(code, hashedCode, expiresAt, 5);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('MAX_ATTEMPTS_EXCEEDED');
    });

    test('should still verify with attempts < 5', () => {
      const { code, hashedCode, expiresAt } = otpService.generate();
      const result = otpService.verify(code, hashedCode, expiresAt, 4);
      expect(result.valid).toBe(true);
    });
  });

  describe('canResend()', () => {
    test('should allow resend when lastSentAt is null', () => {
      const result = otpService.canResend(null);
      expect(result.allowed).toBe(true);
      expect(result.waitSeconds).toBe(0);
    });

    test('should not allow resend within 60 seconds', () => {
      const recent = new Date(Date.now() - 30 * 1000); // 30s ago
      const result = otpService.canResend(recent);
      expect(result.allowed).toBe(false);
      expect(result.waitSeconds).toBeGreaterThan(0);
      expect(result.waitSeconds).toBeLessThanOrEqual(30);
    });

    test('should allow resend after 60 seconds', () => {
      const old = new Date(Date.now() - 90 * 1000); // 90s ago
      const result = otpService.canResend(old);
      expect(result.allowed).toBe(true);
      expect(result.waitSeconds).toBe(0);
    });
  });
});
