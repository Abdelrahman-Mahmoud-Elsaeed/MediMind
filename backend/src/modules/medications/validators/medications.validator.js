const { z } = require('zod');

const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;

const createMedicationSchema = z.object({
  patientId: z.string().optional(),
  conditionId: z.string().min(1, 'conditionId is required'),
  name: z.string().min(1, 'Medication name is required'),
  imageURL: z.string().url().optional().nullable(),
  formType: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'OTHER']),
  isChronic: z.boolean().default(false),
  inventory: z.object({
    initialQuantity: z.number().positive(),
    currentQuantity: z.number().nonnegative(),
    doseAmount: z.number().positive(),
    refillThreshold: z.number().nonnegative().default(5)
  }),
  instructions: z.object({
    relationToMeals: z.enum(['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE']).default('NONE'),
    notes: z.string().optional()
  }).default({
    relationToMeals: 'NONE',
    notes: ''
  }),
  schedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'AS_NEEDED']),
    dosesPerDay: z.number().int().min(1).max(24),
    firstDoseTime: z.string().regex(timeRegex, 'Time must be in HH:MM format'),
    startDate: z.string().datetime().or(z.string().date()),
    endDate: z.string().datetime().or(z.string().date()).optional().nullable()
  }),
  expirationDate: z.string().datetime().or(z.string().date())
});

const updateMedicationSchema = z.object({
  imageURL: z.string().url().optional().nullable(),
  inventory: z.object({
    currentQuantity: z.number().nonnegative().optional(),
    doseAmount: z.number().positive().optional(),
    refillThreshold: z.number().nonnegative().optional()
  }).optional(),
  instructions: z.object({
    relationToMeals: z.enum(['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE']).optional(),
    notes: z.string().optional()
  }).optional(),
  schedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'AS_NEEDED']).optional(),
    dosesPerDay: z.number().int().min(1).max(24).optional(),
    firstDoseTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').optional(),
    startDate: z.string().datetime().or(z.string().date()).optional(),
    endDate: z.string().datetime().or(z.string().date()).optional().nullable()
  }).optional(),
  isActive: z.boolean().optional()
});

const scanMedicationSchema = z.object({
  imageBase64: z.string().min(1, 'imageBase64 is required')
});

module.exports = {
  createMedicationSchema,
  updateMedicationSchema,
  scanMedicationSchema
};
