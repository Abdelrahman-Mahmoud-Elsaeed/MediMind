const { z } = require("zod");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

// --- Helper Schemas & Validation Functions ---

const nationalNumberSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{0,3}$/, "Invalid country code (e.g., +20 or 20)"),

  number: z
    .string()
    .trim()
    .regex(/^\d{7,14}$/, "Phone number must contain between 7 and 14 digits"),
});

const validatePhoneMatch = (data) => {
  // Extract phone either from credentials or root level
  const phoneValue = data.credentials?.phone || data.phone;

  if (!phoneValue || !data.nationalNumber) return true;

  // Normalize country code
  const cleanCode = data.nationalNumber.code.replace(/^(\+|00)/, "");

  // Parse structured phone
  const structuredPhone = parsePhoneNumberFromString(
    `+${cleanCode}${data.nationalNumber.number}`,
  );

  if (!structuredPhone || !structuredPhone.isValid()) {
    return false;
  }

  // Normalize flat phone
  let normalizedPhone = phoneValue.trim();

  if (normalizedPhone.startsWith("00")) {
    normalizedPhone = `+${normalizedPhone.slice(2)}`;
  }

  const parsedPhone = normalizedPhone.startsWith("+")
    ? parsePhoneNumberFromString(normalizedPhone)
    : parsePhoneNumberFromString(normalizedPhone, structuredPhone.country);

  if (!parsedPhone || !parsedPhone.isValid()) {
    return false;
  }

  return (
    parsedPhone.countryCallingCode === cleanCode &&
    parsedPhone.nationalNumber === data.nationalNumber.number
  );
};

const normalizePhoneCode = (data) => {
  if (data.nationalNumber) {
    const cleanCode = data.nationalNumber.code.replace(/^(\+|00)/, "");
    data.nationalNumber.code = `+${cleanCode}`;
  }
  return data;
};

// --- Base Profile Fields ---

const basePatientProfileFields = {
  role: z.literal("PATIENT"),

  // Optional root-level contact overrides (if user wants to attach extra email/phone)
  email: z.string().trim().email("Invalid email format").toLowerCase().optional(),
  phone: z.string().trim().min(5, "Phone number is too short").optional(),
  nationalNumber: nationalNumberSchema.optional(),

  // Health Metrics & Identifiers
  dateOfBirth: z.string().datetime({ precision: 3 }).or(z.date()).optional(),
  gender: z
    .preprocess(
      (val) => (typeof val === "string" ? val.toLowerCase() : val),
      z.enum(["male", "female", "other"]),
    )
    .optional(),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  height: z.number().positive().max(300).optional(),
  weight: z.number().positive().max(500).optional(),
  profilePictureUrl: z
    .string()
    .url("Invalid URL format")
    .transform((val) => val.trim())
    .optional(),

  // Settings & Structural Configurations
  whatsappOptIn: z.boolean().default(false),
  preferredLanguage: z.enum(["en", "ar"]).default("ar"),

  // Arrays structures
  address: z.array(z.any()).default([]),
  emergencyContact: z.array(z.any()).default([]),
  allergies: z.array(z.string()).default([]),

  // Consents Sub-object defaults
  consents: z
    .object({
      familyCaregiver: z.boolean().default(false),
      professionalCaregiver: z.boolean().default(false),
      doctor: z.boolean().default(false),
      pharmacy: z.boolean().default(false),
    })
    .default({
      familyCaregiver: false,
      professionalCaregiver: false,
      doctor: false,
      pharmacy: false,
    }),
};

// --- Main Credentials Schema ---

const credentialsSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    email: z.string().trim().email("Invalid email format").toLowerCase().optional(),
    phone: z.string().trim().min(5, "Phone number is too short").optional(),
  })
  .refine(
    (data) => (data.email && !data.phone) || (!data.email && data.phone),
    {
      message: "Credentials must contain either an email or a phone number, but not both.",
      path: ["email"],
    }
  );


const registerSchema = z
  .object({
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
    credentials: credentialsSchema,
    ...basePatientProfileFields,
  })
  .refine(validatePhoneMatch, {
    message:
      "The phone number value does not match the nationalNumber code and number object details.",
    path: ["credentials", "phone"],
  })
  .transform(normalizePhoneCode);

module.exports = {
  registerSchema,
  nationalNumberSchema,
  validatePhoneMatch,
  normalizePhoneCode,
};