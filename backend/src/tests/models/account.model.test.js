/**
 * Account Model Tests — وفاء (Wafa)
 *
 * Tests the Account schema, role validation, and helper methods.
 */

const mongoose = require('mongoose');
const Account = require('../../modules/auth/models/Account.model');

describe('👤 Account Model', () => {

  describe('Schema Validation', () => {
    test('should create a valid patient account', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.phone).toBe('+201234567890');
      expect(account.role).toBe('PATIENT');
      expect(account.isActive).toBe(true);
      expect(account.isPhoneVerified).toBe(false);
      expect(account.preferredLanguage).toBe('ar');
      expect(account.subscription.plan).toBe('free');
    });

    test('should create a valid pharmacy account', () => {
      const account = new Account({
        phone: '+201234567891',
        role: 'PHARMACY'
      });

      expect(account.role).toBe('PHARMACY');
    });

    test('should create a valid doctor account', () => {
      const account = new Account({
        phone: '+201234567892',
        role: 'DOCTOR'
      });

      expect(account.role).toBe('DOCTOR');
    });

    test('should reject invalid role', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'INVALID_ROLE'
      });

      const err = account.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.role).toBeDefined();
    });

    test('should reject invalid phone format', () => {
      const account = new Account({
        phone: 'invalid-phone',
        role: 'PATIENT'
      });

      const err = account.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.phone).toBeDefined();
    });

    test('should accept Egyptian phone format +20XXXXXXXXXX', () => {
      const validPhones = [
        '+201234567890',
        '+201000000000',
        '+201234500678'
      ];

      validPhones.forEach(phone => {
        const account = new Account({ phone, role: 'PATIENT' });
        const err = account.validateSync();
        expect(err).toBeUndefined();
      });
    });

    test('should reject phone without +20 prefix', () => {
      const account = new Account({
        phone: '01234567890', // missing +20
        role: 'PATIENT'
      });

      const err = account.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.phone).toBeDefined();
    });
  });

  describe('Admin Levels', () => {
    test('should accept valid admin levels', () => {
      const levels = ['super_admin', 'ops_admin', 'finance_admin'];

      levels.forEach(level => {
        const account = new Account({
          phone: '+201234567890',
          role: 'ADMIN',
          adminLevel: level,
          email: 'admin@wafa.app',
          passwordHash: 'hashedpassword'
        });
        const err = account.validateSync();
        expect(err).toBeUndefined();
      });
    });

    test('should reject invalid admin level', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'ADMIN',
        adminLevel: 'invalid_level'
      });

      const err = account.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.adminLevel).toBeDefined();
    });

    test('should default adminLevel to null for non-admin roles', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.adminLevel).toBeNull();
    });
  });

  describe('Subscription', () => {
    test('should default to free plan for patients', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.subscription.plan).toBe('free');
      expect(account.subscription.status).toBe('none');
    });

    test('should accept pilot subscription', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'pilot',
          status: 'trial',
          startDate: new Date(),
          isPilot: true
        }
      });

      expect(account.subscription.isPilot).toBe(true);
    });
  });

  describe('Method: isInPilot()', () => {
    test('should return true for active pilot (< 90 days)', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'pilot',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          isPilot: true
        }
      });

      expect(account.isInPilot()).toBe(true);
    });

    test('should return false for expired pilot (> 90 days)', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'pilot',
          startDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
          isPilot: true
        }
      });

      expect(account.isInPilot()).toBe(false);
    });

    test('should return false when isPilot is false', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'monthly',
          startDate: new Date(),
          isPilot: false
        }
      });

      expect(account.isInPilot()).toBe(false);
    });
  });

  describe('Method: hasActiveSubscription()', () => {
    test('should always return true for patients', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.hasActiveSubscription()).toBe(true);
    });

    test('should return true for pharmacy in pilot', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'pilot',
          startDate: new Date(),
          isPilot: true
        }
      });

      expect(account.hasActiveSubscription()).toBe(true);
    });

    test('should return true for active subscription with future endDate', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'monthly',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days future
        }
      });

      expect(account.hasActiveSubscription()).toBe(true);
    });

    test('should return false for expired subscription', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PHARMACY',
        subscription: {
          plan: 'monthly',
          status: 'expired',
          startDate: new Date(),
          endDate: new Date(Date.now() - 86400000) // yesterday
        }
      });

      expect(account.hasActiveSubscription()).toBe(false);
    });
  });

  describe('Consents', () => {
    test('should default all consents to false', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.consents.termsAccepted).toBe(false);
      expect(account.consents.privacyPolicyAccepted).toBe(false);
      expect(account.consents.caregiverAccess).toBe(false);
      expect(account.consents.doctorAccess).toBe(false);
      expect(account.consents.pharmacyAccess).toBe(false);
    });
  });

  describe('WhatsApp Settings', () => {
    test('should default whatsappOptIn to false', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.whatsappOptIn).toBe(false);
    });

    test('should default preferredLanguage to ar', () => {
      const account = new Account({
        phone: '+201234567890',
        role: 'PATIENT'
      });

      expect(account.whatsappSettings.preferredLanguage).toBe('ar');
    });
  });
});
