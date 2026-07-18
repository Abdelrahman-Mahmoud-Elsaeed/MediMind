const { z } = require('zod');
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const { normalizePhoneCode, validatePhoneMatch, nationalNumberSchema } = require('./patient.validation');

const registerProviderSchema = z.object({
  email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
  
  // Flat login string (e.g., "+2010...", "010...", "5123...")
  phone: z.string().trim().min(5, "Phone number is too short").optional(),
  
  // Structured input object required in the payload
  nationalNumber: nationalNumberSchema,

  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.literal('DOCTOR'),
  
  firstName: z.string().min(2).max(50).transform(val => val.trim()),
  lastName: z.string().min(2).max(50).transform(val => val.trim()),
  profilePictureUrl: z.string().url('Invalid URL format').transform(val => val.trim()).optional(),
  whatsappOptIn: z.boolean().default(false),
  preferredLanguage: z.enum(['en', 'ar']).default('ar'),

  specialty: z.string().min(2).transform(val => val.trim()),
  clinicName: z.string().min(2).transform(val => val.trim()),
  syndicateId: z.string().min(2).transform(val => val.trim()).optional(),
  licenseNumber: z.string().min(2).transform(val => val.trim()).optional(),

  governorate: z.string().transform(val => val.trim()).optional(),
  city: z.string().transform(val => val.trim()).optional(),
  street: z.string().transform(val => val.trim()).optional(),

  coordinates: z.array(z.number()).length(2).optional(),

  addedByAdminId: z.string().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  bio: z.string().transform(val => val.trim()).optional(),
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
// 1. Core account identifier pathway rule
.refine(data => data.email || data.phone, {
  message: "Either email or phone number must be provided",
  path: ["email"]
})
// 2. Licensing verification rule
.refine(data => data.syndicateId || data.licenseNumber, {
  message: "Either syndicateId or licenseNumber must be provided",
  path: ["syndicateId"]
})
// 3. UNIVERSAL MATCH CHECK: Cross-verifies field values dynamically across any global country configuration
  .refine(validatePhoneMatch, {
    message:
      "The phone number value does not match the nationalNumber code and number object details.",
    path: ["phone"],
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

  const resolvedLicense = (syndicateId || licenseNumber || "").trim();

  const providerAddress = (governorate || city || street) 
    ? {
        governorate: governorate || "Cairo",
        city: city || "Cairo",
        street: street || "Main Street",
      }
    : undefined;

  const location = coordinates 
    ? {
        type: "Point",
        coordinates: coordinates,
      }
    : null;


  return {
    ...cleanData,
    licenseNumber: resolvedLicense,
    providerAddress,
    location
  };
});

module.exports = {
  registerProviderSchema,
};