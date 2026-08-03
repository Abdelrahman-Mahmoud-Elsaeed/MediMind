const { z } = require('zod');

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const updatePatientProfileSchema = z.object({
  dateOfBirth: z
    .preprocess((val) => {
      if (!val) return undefined;
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
      return val;
    }, z.date().optional())
    .superRefine((date, ctx) => {
      if (!date) return;
      if (isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date format for date of birth.",
        });
        return;
      }
      const now = new Date();
      if (date > now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date of birth cannot be in the future.",
        });
        return;
      }
      const twelveYearsAgo = new Date(now);
      twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12);
      if (date > twelveYearsAgo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "User must be at least 12 years old.",
        });
      }
    }),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  emergencyContact: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().regex(phoneRegex, 'Invalid international phone number format').optional()
  }).optional()
});

const updateCaregiverProfileSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().regex(phoneRegex, 'Invalid international phone number format').optional(),
  alternativePhone: z.string().regex(phoneRegex, 'Invalid international phone number format').optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  isAvailable: z.boolean().optional(),
  specialties: z.array(z.enum([
    "Geriatric",
    "Pediatric",
    "Post-Surgery Recovery",
    "Palliative Care",
    "Neurological",
    "General Nursing",
  ])).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().nonnegative().optional(),
  licenseNumber: z.string().optional(),
  profilePictureUrl: z.string().url().or(z.string().min(1)).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    governorate: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  preferredLanguage: z.enum(['en', 'ar']).optional(),
  whatsappOptIn: z.boolean().optional(),
  alertSettings: z.object({
    instantMissed: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    monthlyReport: z.boolean().optional()
  }).optional()
});

module.exports = {
  updatePatientProfileSchema,
  updateCaregiverProfileSchema
};
