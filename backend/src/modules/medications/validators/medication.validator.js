const { z } = require('zod');

/**
 * Medication Validators — وفاء (Wafa)
 */

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM

const createMedicationSchema = z.object({
  body: z.object({
    conditionId: z.string().length(24).optional(),
    name: z.string().min(2, 'Medication name must be at least 2 characters').max(100),
    nameAr: z.string().max(100).optional(),
    formType: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'INHALER', 'OTHER']),
    isChronic: z.boolean().optional().default(false),
    imageURL: z.string().url().optional(),

    inventory: z.object({
      initialQuantity: z.number().min(0, 'Initial quantity cannot be negative'),
      currentQuantity: z.number().min(0),
      doseAmount: z.number().min(0.1, 'Dose amount must be at least 0.1'),
      unit: z.enum(['pill', 'ml', 'mg', 'drop', 'puff']).optional().default('pill'),
      refillThreshold: z.number().min(1).max(30).optional().default(5)
    }),

    instructions: z.object({
      relationToMeals: z.enum([
        'BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'
      ]).optional().default('NONE'),
      notes: z.string().max(300).optional()
    }).optional().default({}),

    schedule: z.object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'AS_NEEDED']),
      dosesPerDay: z.number().min(1).max(6).optional().default(1),
      firstDoseTime: z.string().regex(TIME_REGEX, 'Time must be in HH:MM format'),
      timesOfDay: z.array(z.string().regex(TIME_REGEX)).min(1, 'At least one time is required'),
      daysOfWeek: z.array(z.enum([
        'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
      ])).optional(),
      startDate: z.string().datetime().optional().default(() => new Date().toISOString()),
      endDate: z.string().datetime().optional().nullable()
    }),

    pharmacyId: z.string().length(24).optional(),
    expirationDate: z.string().datetime('Valid expiration date is required')
  })
});

const updateMedicationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    nameAr: z.string().max(100).optional(),
    formType: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'INHALER', 'OTHER']).optional(),
    isChronic: z.boolean().optional(),

    inventory: z.object({
      initialQuantity: z.number().min(0).optional(),
      currentQuantity: z.number().min(0).optional(),
      doseAmount: z.number().min(0.1).optional(),
      unit: z.enum(['pill', 'ml', 'mg', 'drop', 'puff']).optional(),
      refillThreshold: z.number().min(1).max(30).optional()
    }).optional(),

    instructions: z.object({
      relationToMeals: z.enum([
        'BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'
      ]).optional(),
      notes: z.string().max(300).optional()
    }).optional(),

    schedule: z.object({
      frequency: z.enum(['DAILY', 'WEEKLY', 'AS_NEEDED']).optional(),
      dosesPerDay: z.number().min(1).max(6).optional(),
      firstDoseTime: z.string().regex(TIME_REGEX).optional(),
      timesOfDay: z.array(z.string().regex(TIME_REGEX)).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional().nullable()
    }).optional(),

    pharmacyId: z.string().length(24).optional().nullable(),
    expirationDate: z.string().datetime().optional(),
    isActive: z.boolean().optional()
  })
});

const refillMedicationSchema = z.object({
  body: z.object({
    newQuantity: z.number().min(1, 'New quantity must be at least 1')
  })
});

const scanMedicationSchema = z.object({
  body: z.object({
    imageBase64: z.string().min(100, 'Valid base64 image is required')
  })
});

module.exports = {
  createMedicationSchema,
  updateMedicationSchema,
  refillMedicationSchema,
  scanMedicationSchema
};
