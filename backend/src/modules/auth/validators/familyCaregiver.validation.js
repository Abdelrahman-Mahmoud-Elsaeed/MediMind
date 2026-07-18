const { z } = require("zod");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const {
  nationalNumberSchema,
  validatePhoneMatch,
  normalizePhoneCode,
} = require("./patient.validation");

const registerEmailSchema = z
  .object({
    email: z.string().trim().email("Invalid email format").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    role: z.literal("FAMILY_CAREGIVER"),
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
    phone: z.string().trim().min(5, "Phone number is too short").optional(),
    nationalNumber: nationalNumberSchema.optional(),
    relation: z.enum([
      "son",
      "daughter",
      "spouse",
      "parent",
      "sibling",
      "friend",
      "other",
    ]),
    whatsappOptIn: z.boolean().optional(),
    preferredLanguage: z.enum(["en", "ar"]).optional(),
  })
  .refine((data) => validatePhoneMatch(data), {
    message:
      "The phone number value does not match the nationalNumber code and number object details.",
    path: ["phone"],
  })
  .transform(normalizePhoneCode);

// =========================================================================
// 2. REGISTER PHONE SCHEMA
// =========================================================================
const registerPhoneSchema = z
  .object({
    phone: z.string().trim().min(5, "Phone number is too short"),
    nationalNumber: nationalNumberSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    role: z.literal("FAMILY_CAREGIVER"),
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
    email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .transform((val) => val.trim())
      .optional(),
    relation: z.enum([
      "son",
      "daughter",
      "spouse",
      "parent",
      "sibling",
      "friend",
      "other",
    ]),
    whatsappOptIn: z.boolean().optional(),
    preferredLanguage: z.enum(["en", "ar"]).optional(),
  })
  .refine((data) => validatePhoneMatch(data), {
    message:
      "The phone number value does not match the nationalNumber code and number object details.",
    path: ["phone"],
  })
  .transform(normalizePhoneCode);

module.exports = {
  registerEmailSchema,
  registerPhoneSchema,
};
