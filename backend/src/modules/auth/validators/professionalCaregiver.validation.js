const { z } = require("zod");
const {
  parsePhoneNumberFromString,
  getCountryCallingCode,
} = require("libphonenumber-js");
const {
  validatePhoneMatch,
  nationalNumberSchema,
  normalizePhoneCode,
} = require("./patient.validation");

// --- Credentials Sub-Schema ---

const credentialsSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .toLowerCase()
      .optional(),
    phone: z.string().trim().min(5, "Phone number is too short").optional(),
  })
  .refine(
    (data) => (data.email && !data.phone) || (!data.email && data.phone),
    {
      message:
        "Credentials must contain either an email or a phone number, but not both.",
      path: ["email"],
    },
  );

// --- Professional Caregiver Registration Schema ---

const registerProfessionalCaregiverSchema = z
  .object({
    // --- Nested Credentials & Role ---
    credentials: credentialsSchema,
    role: z.literal("PROFESSIONAL_CAREGIVER"),

    // --- Core Account Fields (Optional root-level overrides) ---
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .toLowerCase()
      .optional(),

    phone: z.string().trim().min(5, "Phone number is too short").optional(),

    // Structured international payload fields
    nationalNumber: nationalNumberSchema,

    // --- Profile Meta Fields ---
    firstName: z
      .string()
      .min(2)
      .max(50)
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(2)
      .max(50)
      .transform((val) => val.trim()),
    profilePictureUrl: z
      .string()
      .url("Invalid URL format")
      .transform((val) => val.trim())
      .optional(),
    whatsappOptIn: z.boolean().default(false),
    preferredLanguage: z.enum(["en", "ar"]).default("ar"),

    // --- Professional Caregiver Specific Fields ---
    addedByAdminId: z.string().optional(),
    hourlyRate: z.preprocess(
      (val) => Number(val) || 0,
      z.number().nonnegative().default(0),
    ),
    bio: z
      .string()
      .transform((val) => val.trim())
      .default(""),
    isAvailable: z.boolean().default(true),
    specialties: z.array(z.string()).default(["General Nursing"]),
    skills: z.preprocess(
      (val) => (Array.isArray(val) ? val.map((s) => String(s).trim()) : []),
      z.array(z.string()).default([]),
    ),
    experienceYears: z.preprocess(
      (val) => Number(val) || 0,
      z.number().int().nonnegative().default(0),
    ),
    alternativePhone: z.string().trim().optional(),

    // --- Verification Tokens ---
    licenseNumber: z
      .string()
      .min(2)
      .transform((val) => val.trim())
      .optional(),
    syndicateId: z
      .string()
      .min(2)
      .transform((val) => val.trim())
      .optional(),

    // --- Address Coordinates Breakdown ---
    governorate: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    city: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    street: z
      .string()
      .transform((val) => val.trim())
      .optional(),
    coordinates: z.array(z.number()).length(2).optional(),

    // --- Dynamic UI Settings Configurations ---
    alertSettings: z
      .object({
        instantMissed: z.boolean().default(true),
        weeklyReport: z.boolean().default(true),
        monthlyReport: z.boolean().default(true),
      })
      .default({
        instantMissed: true,
        weeklyReport: true,
        monthlyReport: true,
      }),
  })

  .refine((data) => data.licenseNumber || data.syndicateId, {
    message: "Either licenseNumber or syndicateId must be provided",
    path: ["licenseNumber"],
  })

  .refine(validatePhoneMatch, {
    message:
      "The phone number value does not match the nationalNumber code and number object details.",
    path: ["credentials", "phone"],
  })
  .transform(normalizePhoneCode)
  .transform((data) => {
    const {
      governorate,
      city,
      street,
      coordinates,
      licenseNumber,
      syndicateId,
      ...cleanData
    } = data;

    const resolvedLicense = (licenseNumber || syndicateId || "").trim();

    const providerAddress = {
      governorate: governorate || "Cairo",
      city: city || "Cairo",
      street: street || "Main Street",
    };

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
      location,
    };
  });

module.exports = { registerProfessionalCaregiverSchema };