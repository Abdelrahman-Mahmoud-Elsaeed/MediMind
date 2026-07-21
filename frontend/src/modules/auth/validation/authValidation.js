import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const emailSchema = z
  .string()
  .min(1, "Email address is required")
  .email("Invalid email address");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => isValidPhoneNumber(val || ""), {
    message: "Invalid phone number format",
  });

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const loginSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema,
});

export const getStep1Schema = (inputType) => {
  return z.object({
    password: passwordSchema,
    role: z.enum(["patient", "caregiver"]).optional(),
    ...(inputType === "phone"
      ? {
          phone: phoneSchema,
          email: z.string().optional().or(z.literal("")),
        }
      : {
          email: emailSchema,
          phone: z.string().optional().or(z.literal("")),
        }),
  });
};
// Deprecated in favor of getStep1Schema, kept for fallback compatibility
export const registerStep1Schema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  role: z.enum(["patient", "caregiver"]),
});

export const registerPatientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: phoneSchema,
  dob: z.string().optional().or(z.literal("")),
  bloodType: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  height: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  weight: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  whatsappOptIn: z.boolean().optional(),
  preferredLanguage: z.string().optional(),
  emName: z.string().optional().or(z.literal("")),
  emPhone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\+?[0-9\s\-()]+$/.test(val), {
      message: "Invalid emergency contact phone number format",
    }),
});

export const registerCaregiverSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: phoneSchema.optional().or(z.literal("")),
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
});