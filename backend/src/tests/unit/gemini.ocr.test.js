const geminiService = require('../../modules/medications/services/gemini.service');
const medicationsService = require('../../modules/medications/services/medications.service');
const AppError = require('../../shared/utils/AppError');

describe('Gemini OCR Prescription Parser Unit Tests', () => {
  const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';

  describe('normalizeMedicationItem', () => {
    it('should correctly normalize a complete medication item', () => {
      const raw = {
        name: 'Augmentin XR',
        strength: '1000mg',
        formType: 'TABLET',
        frequency: 'DAILY',
        dosesPerDay: 2,
        firstDoseTime: '09:00',
        relationToMeals: 'AFTER_MEALS',
        initialQuantity: 14,
        currentQuantity: 14,
        doseAmount: 1,
        refillThreshold: 3,
        isChronic: false,
        notes: 'Take after food',
        confidenceScore: 0.98,
      };

      const normalized = geminiService.normalizeMedicationItem(raw, 0);

      expect(normalized.name).toBe('Augmentin XR');
      expect(normalized.strength).toBe('1000mg');
      expect(normalized.formType).toBe('TABLET');
      expect(normalized.instructions.relationToMeals).toBe('AFTER_MEALS');
      expect(normalized.instructions.notes).toBe('Take after food');
      expect(normalized.inventory.initialQuantity).toBe(14);
      expect(normalized.inventory.currentQuantity).toBe(14);
      expect(normalized.inventory.doseAmount).toBe(1);
      expect(normalized.inventory.refillThreshold).toBe(3);
      expect(normalized.schedule.frequency).toBe('DAILY');
      expect(normalized.schedule.dosesPerDay).toBe(2);
      expect(normalized.schedule.firstDoseTime).toBe('09:00');
      expect(normalized.confidenceScore).toBe(0.98);
      expect(normalized.isChronic).toBe(false);
    });

    it('should sanitize invalid formType, meal relation, and frequency to sensible defaults', () => {
      const raw = {
        name: 'Generic Drug',
        formType: 'UNKNOWN_TYPE',
        frequency: 'EVERY_FEW_HOURS',
        relationToMeals: 'INVALID_MEAL',
        dosesPerDay: 99,
        firstDoseTime: 'bad-time',
      };

      const normalized = geminiService.normalizeMedicationItem(raw, 0);

      expect(normalized.formType).toBe('TABLET');
      expect(normalized.schedule.frequency).toBe('DAILY');
      expect(normalized.instructions.relationToMeals).toBe('NONE');
      expect(normalized.schedule.dosesPerDay).toBe(24); // Capped to max 24
      expect(normalized.schedule.firstDoseTime).toBe('08:00');
    });
  });

  describe('parseBase64Image', () => {
    it('should correctly parse base64 data URLs with MIME type', () => {
      const { mimeType, data } = geminiService.parseBase64Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      expect(mimeType).toBe('image/png');
      expect(data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    });

    it('should throw AppError for invalid non-string image data', () => {
      expect(() => geminiService.parseBase64Image(null)).toThrow(AppError);
      expect(() => geminiService.parseBase64Image('')).toThrow(AppError);
    });
  });

  describe('extractMedicationsFromImage & scanMedication', () => {
    it('should return an array of parsed objects for prescription scan', async () => {
      const result = await geminiService.extractMedicationsFromImage(sampleBase64);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('strength');
      expect(result[0]).toHaveProperty('formType');
      expect(result[0]).toHaveProperty('inventory');
      expect(result[0]).toHaveProperty('instructions');
      expect(result[0]).toHaveProperty('schedule');
      expect(result[0]).toHaveProperty('confidenceScore');
      expect(result[0].confidenceScore).toBeGreaterThanOrEqual(0.90);
    });

    it('should support multiple parsed medication objects in a single prescription image', async () => {
      const multiImage = 'data:image/jpeg;base64,mock_multi_prescriptions_data_payload_12345';
      const result = await medicationsService.scanMedication(multiImage);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Amoxicillin & Clavulanate');
      expect(result[1].name).toBe('Ibuprofen');
      expect(result[0].confidenceScore).toBeGreaterThanOrEqual(0.90);
      expect(result[1].confidenceScore).toBeGreaterThanOrEqual(0.90);
    });

    it('should reject low-confidence scans (< 90%) with 422 LOW_CONFIDENCE error', async () => {
      const lowConfidenceImage = 'data:image/jpeg;base64,low_confidence_unclear_image_sample';

      await expect(medicationsService.scanMedication(lowConfidenceImage)).rejects.toThrow(
        expect.objectContaining({
          statusCode: 422,
          code: 'LOW_CONFIDENCE',
        })
      );
    });

    it('should reject scans triggering an error with appropriate AppError', async () => {
      const errorImage = 'data:image/jpeg;base64,error_throw_test_image';

      await expect(medicationsService.scanMedication(errorImage)).rejects.toThrow(
        expect.objectContaining({
          statusCode: 500,
          code: 'OCR_SERVICE_ERROR',
        })
      );
    });
  });
});
