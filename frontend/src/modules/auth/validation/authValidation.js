import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["PATIENT", "CAREGIVER", "ADMIN"]),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z
  .string()
  .trim()
  .regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
});

export const registerStep1Schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["patient", "caregiver"]),
});

export const registerPatientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
  dob: z.string().optional().or(z.literal("")),
  bloodType: z.string().optional().or(z.literal("")),
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
  phone: z
  .string()
  .trim()
  .regex(/^01[0125]\d{8}$/, "Invalid Egyptian phone number"),
});
