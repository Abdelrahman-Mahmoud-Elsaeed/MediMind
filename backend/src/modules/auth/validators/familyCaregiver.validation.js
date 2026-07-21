const { z } = require("zod");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const {
  nationalNumberSchema,
  validatePhoneMatch,
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

// --- Family Caregiver Registration Schema ---

const registerFamilyCaregiverSchema = z
  .object({
    // --- Nested Credentials & Role ---
    credentials: credentialsSchema,
    role: z.literal("FAMILY_CAREGIVER"),

    // --- Profile Identity ---
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters")
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters")
      .transform((val) => val.trim()),

    // --- Relationship ---
    relation: z.enum([
      "son",
      "daughter",
      "spouse",
      "parent",
      "sibling",
      "friend",
      "other",
    ]),

    // --- Optional Root-Level Overrides ---
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .toLowerCase()
      .optional(),
    phone: z.string().trim().min(5, "Phone number is too short").optional(),
    nationalNumber: nationalNumberSchema.optional(),

    // --- Settings Configurations ---
    whatsappOptIn: z.boolean().optional(),
    preferredLanguage: z.enum(["en", "ar"]).optional(),
  })
  .refine((data) => validatePhoneMatch(data), {
    message:
      "The phone number value does not match the nationalNumber code and number object details.",
    path: ["credentials", "phone"],
  })
  .transform(normalizePhoneCode);

module.exports = {
  registerFamilyCaregiverSchema,
};