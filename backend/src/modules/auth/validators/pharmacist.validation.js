const { z } = require("zod");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
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
      message: "Credentials must contain either an email or a phone number, but not both.",
      path: ["email"],
    }
  );

// --- Pharmacist Registration Schema ---

const registerPharmacistSchema = z
  .object({
    credentials: credentialsSchema,
    role: z.literal("PHARMACIST"),

    // Optional root-level contact fields
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .toLowerCase()
      .optional(),
    phone: z.string().trim().min(5, "Phone number is too short").optional(),

    nationalNumber: nationalNumberSchema,

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

    pharmacyName: z
      .string()
      .min(2)
      .transform((val) => val.trim()),
    ownerName: z
      .string()
      .transform((val) => val.trim())
      .optional(),
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
      firstName,
      lastName,
      ownerName,
      ...cleanData
    } = data;

    const resolvedLicense = (licenseNumber || syndicateId || "").trim();

    const resolvedOwnerName = ownerName
      ? ownerName.trim()
      : `${firstName || ""} ${lastName || ""}`.trim() || "Pharmacy Owner";

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
      ownerName: resolvedOwnerName,
      providerAddress,
      location,
    };
  });

module.exports = { registerPharmacistSchema };