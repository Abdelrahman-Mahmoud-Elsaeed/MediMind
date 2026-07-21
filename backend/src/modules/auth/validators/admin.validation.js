// src/modules/auth/validators/admin.validation.js
const { z } = require('zod');
const {
  nationalNumberSchema,
  validatePhoneMatch,
  normalizePhoneCode,
} = require('./patient.validation');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

/**
 * Schema for admin-creating a PROFESSIONAL_CAREGIVER.
 * The admin provides credentials + profile data; the account is auto-activated.
 */
const registerProfessionalSchema = z
  .object({
    email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
    phone: z.string().trim().min(5, 'Phone number is too short').optional(),
    nationalNumber: nationalNumberSchema,
    password: passwordSchema,

    firstName: z.string().min(2).max(50).transform((val) => val.trim()),
    lastName: z.string().min(2).max(50).transform((val) => val.trim()),
    licenseNumber: z.string().min(2, 'License number is required'),
    specialization: z.string().optional(),
    hourlyRate: z.number().optional(),

    whatsappOptIn: z.boolean().optional(),
    preferredLanguage: z.enum(['en', 'ar']).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone number must be provided',
    path: ['email'],
  })
  .refine(validatePhoneMatch, {
    message: 'The phone number does not match the nationalNumber code/number.',
    path: ['phone'],
  })
  .transform(normalizePhoneCode);

/**
 * Schema for admin-creating a DOCTOR or PHARMACIST.
 * The role field determines which provider profile gets created.
 */
const registerProviderSchema = z
  .object({
    role: z.enum(['DOCTOR', 'PHARMACIST']),

    email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
    phone: z.string().trim().min(5, 'Phone number is too short').optional(),
    nationalNumber: nationalNumberSchema,
    password: passwordSchema,

    firstName: z.string().min(2).max(50).transform((val) => val.trim()),
    lastName: z.string().min(2).max(50).transform((val) => val.trim()),
    whatsappOptIn: z.boolean().optional(),
    preferredLanguage: z.enum(['en', 'ar']).optional(),

    // Doctor-specific fields (required when role === 'DOCTOR')
    specialty: z.string().optional(),
    syndicateId: z.string().optional(),
    clinicName: z.string().optional(),
    clinicAddress: z
      .object({
        governorate: z.string().optional(),
        city: z.string().optional(),
        street: z.string().optional(),
        additionalDirections: z.string().optional(),
      })
      .optional(),

    // Pharmacist-specific fields (required when role === 'PHARMACIST')
    pharmacyName: z.string().optional(),
    ownerName: z.string().optional(),
    licenseNumber: z.string().optional(),
    address: z
      .object({
        governorate: z.string().optional(),
        city: z.string().optional(),
        street: z.string().optional(),
        additionalDirections: z.string().optional(),
      })
      .optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone number must be provided',
    path: ['email'],
  })
  .refine(
    (data) =>
      data.role !== 'DOCTOR' ||
      (data.specialty && data.syndicateId && data.clinicName),
    {
      message: 'Doctor registration requires specialty, syndicateId, and clinicName',
      path: ['specialty'],
    }
  )
  .refine(
    (data) => data.role !== 'PHARMACIST' || (data.pharmacyName && data.licenseNumber),
    {
      message: 'Pharmacist registration requires pharmacyName and licenseNumber',
      path: ['pharmacyName'],
    }
  )
  .refine(validatePhoneMatch, {
    message: 'The phone number does not match the nationalNumber code/number.',
    path: ['phone'],
  })
  .transform(normalizePhoneCode);

/**
 * Schema for the PATCH /accounts/:id/status endpoint.
 */
const updateAccountStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

module.exports = {
  registerProfessionalSchema,
  registerProviderSchema,
  updateAccountStatusSchema,
};
