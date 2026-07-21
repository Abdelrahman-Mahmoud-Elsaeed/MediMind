const { z } = require('zod');
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const { normalizePhoneCode, validatePhoneMatch, nationalNumberSchema } = require('./patient.validation');

// --- Credentials Sub-Schema ---

const credentialsSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    email: z
      .string()
      .trim()
      .email('Invalid email format')
      .toLowerCase()
      .optional(),
    phone: z.string().trim().min(5, 'Phone number is too short').optional(),
  })
  .refine(
    (data) => (data.email && !data.phone) || (!data.email && data.phone),
    {
      message:
        'Credentials must contain either an email or a phone number, but not both.',
      path: ['email'],
    },
  );

// --- Doctor Registration Schema ---

const registerProviderSchema = z
  .object({
    // --- Nested Credentials & Role ---
    credentials: credentialsSchema,
    role: z.literal('DOCTOR'),

    // --- Core Account Fields (Optional root-level overrides) ---
    email: z
      .string()
      .trim()
      .email('Invalid email format')
      .toLowerCase()
      .optional(),

    phone: z.string().trim().min(5, 'Phone number is too short').optional(),

    // Structured input object required in the payload
    nationalNumber: nationalNumberSchema,

    // --- Profile Identity ---
    firstName: z.string().min(2).max(50).transform((val) => val.trim()),
    lastName: z.string().min(2).max(50).transform((val) => val.trim()),
    profilePictureUrl: z
      .string()
      .url('Invalid URL format')
      .transform((val) => val.trim())
      .optional(),
    whatsappOptIn: z.boolean().default(false),
    preferredLanguage: z.enum(['en', 'ar']).default('ar'),

    // --- Doctor Specific Fields ---
    specialty: z.string().min(2).transform((val) => val.trim()),
    clinicName: z.string().min(2).transform((val) => val.trim()),
    syndicateId: z.string().min(2).transform((val) => val.trim()).optional(),
    licenseNumber: z.string().min(2).transform((val) => val.trim()).optional(),

    // --- Location Breakdown ---
    governorate: z.string().transform((val) => val.trim()).optional(),
    city: z.string().transform((val) => val.trim()).optional(),
    street: z.string().transform((val) => val.trim()).optional(),
    coordinates: z.array(z.number()).length(2).optional(),

    // --- Additional Meta Configurations ---
    addedByAdminId: z.string().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    bio: z.string().transform((val) => val.trim()).optional(),
    isAvailable: z.boolean().optional(),
    specialties: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    experienceYears: z.number().int().nonnegative().optional(),
    alternativePhone: z.string().trim().optional(),
    relation: z.string().optional(),
    subscription: z.string().optional(),
    pharmacyName: z.string().optional(),
    ownerName: z.string().optional(),
    alertSettings: z.any().optional(),
  })

  // 1. Licensing verification rule
  .refine((data) => data.syndicateId || data.licenseNumber, {
    message: 'Either syndicateId or licenseNumber must be provided',
    path: ['syndicateId'],
  })

  // 2. Cross-verifies field values dynamically across any global country configuration
  .refine(validatePhoneMatch, {
    message:
      'The phone number value does not match the nationalNumber code and number object details.',
    path: ['credentials', 'phone'],
  })

  .transform(normalizePhoneCode)

  .transform((data) => {
    const {
      governorate,
      city,
      street,
      coordinates,
      syndicateId,
      licenseNumber,
      ...cleanData
    } = data;

    const resolvedLicense = (syndicateId || licenseNumber || '').trim();

    const providerAddress =
      governorate || city || street
        ? {
            governorate: governorate || 'Cairo',
            city: city || 'Cairo',
            street: street || 'Main Street',
          }
        : undefined;

    const location = coordinates
      ? {
          type: 'Point',
          coordinates: coordinates,
        }
      : null;

    return {
      ...cleanData,
      licenseNumber: resolvedLicense,
      providerAddress,
      location,
    };
  });

module.exports = {
  registerProviderSchema,
};