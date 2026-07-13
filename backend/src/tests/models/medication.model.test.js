/**
 * Medication Model Tests — وفاء (Wafa)
 *
 * Tests the Medication schema virtuals, methods, and business rules.
 */

const mongoose = require('mongoose');
const Medication = require('../../modules/medications/models/Medication.model');

describe('💊 Medication Model', () => {

  describe('Schema Validation', () => {
    test('should create a valid medication', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Glucophage',
        formType: 'TABLET',
        inventory: {
          initialQuantity: 60,
          currentQuantity: 60,
          doseAmount: 1
        },
        schedule: {
          frequency: 'DAILY',
          firstDoseTime: '08:00',
          timesOfDay: ['08:00', '20:00'],
          startDate: new Date()
        },
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      expect(med.name).toBe('Glucophage');
      expect(med.formType).toBe('TABLET');
      expect(med.isActive).toBe(true); // default
      expect(med.inventory.refillThreshold).toBe(5); // default
    });

    test('should reject invalid formType', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'INVALID_TYPE',
        inventory: { initialQuantity: 30, currentQuantity: 30, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      const err = med.validateSync();
      expect(err).toBeDefined();
      expect(err.errors.formType).toBeDefined();
    });

    test('should reject negative inventory', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: -5, currentQuantity: 30, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      const err = med.validateSync();
      expect(err).toBeDefined();
      expect(err.errors['inventory.initialQuantity']).toBeDefined();
    });
  });

  describe('Virtual: daysUntilRefill', () => {
    test('should calculate days until refill correctly', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: {
          initialQuantity: 30,
          currentQuantity: 10,
          doseAmount: 1
        },
        schedule: {
          frequency: 'DAILY',
          dosesPerDay: 2,
          firstDoseTime: '08:00',
          timesOfDay: ['08:00', '20:00'],
          startDate: new Date()
        },
        expirationDate: new Date(Date.now() + 86400000)
      });

      // 10 pills / 1 per dose / 2 doses per day = 5 days
      expect(med.daysUntilRefill).toBe(5);
    });

    test('should return null when currentQuantity is 0', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 0, doseAmount: 1 },
        schedule: { frequency: 'DAILY', dosesPerDay: 1, firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      // When currentQuantity is 0, virtual returns null (cannot divide by zero)
      expect(med.daysUntilRefill).toBeNull();
    });
  });

  describe('Virtual: isRefillNeededSoon', () => {
    test('should return true when days <= threshold', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 8, doseAmount: 1, refillThreshold: 10 },
        schedule: { frequency: 'DAILY', dosesPerDay: 2, firstDoseTime: '08:00', timesOfDay: ['08:00', '20:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      // 8 pills / 2 per day = 4 days, threshold = 10
      expect(med.isRefillNeededSoon).toBe(true);
    });

    test('should return false when days > threshold', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 60, currentQuantity: 50, doseAmount: 1, refillThreshold: 5 },
        schedule: { frequency: 'DAILY', dosesPerDay: 1, firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      // 50 pills / 1 per day = 50 days, threshold = 5
      expect(med.isRefillNeededSoon).toBe(false);
    });
  });

  describe('Virtual: isExpired', () => {
    test('should return true for past expiration date', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 30, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() - 86400000) // yesterday
      });

      expect(med.isExpired).toBe(true);
    });

    test('should return false for future expiration date', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 30, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 365 * 86400000)
      });

      expect(med.isExpired).toBe(false);
    });
  });

  describe('Method: decrementInventory()', () => {
    test('should decrement inventory by doseAmount', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 10, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      const result = med.decrementInventory();
      expect(result).toBe(true);
      expect(med.inventory.currentQuantity).toBe(9);
    });

    test('should return false when insufficient inventory', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 0, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      const result = med.decrementInventory();
      expect(result).toBe(false);
      expect(med.inventory.currentQuantity).toBe(0);
    });

    test('should handle decimal doseAmount (syrup)', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Syrup Test',
        formType: 'SYRUP',
        inventory: { initialQuantity: 100, currentQuantity: 10.5, doseAmount: 2.5 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      const result = med.decrementInventory();
      expect(result).toBe(true);
      expect(med.inventory.currentQuantity).toBe(8);
    });
  });

  describe('Method: refill()', () => {
    test('should update currentQuantity and lastRefilledAt', () => {
      const med = new Medication({
        patientId: new mongoose.Types.ObjectId(),
        addedBy: new mongoose.Types.ObjectId(),
        name: 'Test',
        formType: 'TABLET',
        inventory: { initialQuantity: 30, currentQuantity: 2, doseAmount: 1 },
        schedule: { frequency: 'DAILY', firstDoseTime: '08:00', timesOfDay: ['08:00'] },
        expirationDate: new Date(Date.now() + 86400000)
      });

      med.refill(30);
      expect(med.inventory.currentQuantity).toBe(30);
      expect(med.inventory.lastRefilledAt).toBeInstanceOf(Date);
    });
  });
});
