const { z } = require('zod');

const createConditionSchema = z.object({
  patientId: z.string().optional(), // Optional for patients (inferred from token), but required for caregivers
  diseaseName: z.string().min(1, 'Disease name is required'),
  isChronic: z.boolean().default(false),
  diagnosedDate: z.string().datetime().optional().or(z.string().date().optional()),
  notes: z.string().optional()
});

const updateConditionSchema = z.object({
  isChronic: z.boolean().optional(),
  diagnosedDate: z.string().datetime().optional().or(z.string().date().optional()),
  notes: z.string().optional()
});

module.exports = {
  createConditionSchema,
  updateConditionSchema
};
