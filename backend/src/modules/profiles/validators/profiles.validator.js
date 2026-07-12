const { z } = require('zod');

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const updatePatientProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional().or(z.string().date().optional()),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyContact: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().regex(phoneRegex, 'Invalid international phone number format').optional()
  }).optional()
});

const updateCaregiverProfileSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid international phone number format')
});

module.exports = {
  updatePatientProfileSchema,
  updateCaregiverProfileSchema
};
