const { z } = require('zod');

const OTP_REGEX = /^\d{6}$/;

const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone number is too short'),
    channel: z.enum(['sms', 'whatsapp']).optional().default('sms')
  })
});

const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone number is too short'),
    code: z.string().regex(OTP_REGEX, 'OTP code must be exactly 6 digits'),
    role: z.enum(['PATIENT', 'CAREGIVER', 'PHARMACY', 'DOCTOR']).optional(),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional()
  })
});

const refreshOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(10, 'Phone number is too short')
  })
});

const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

const completeProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    pharmacyName: z.string().min(2).max(100).optional(),
    licenseNumber: z.string().min(3).max(50).optional(),
    specialty: z.enum([
      'internal_medicine', 'cardiology', 'endocrinology',
      'nephrology', 'general_practitioner', 'other'
    ]).optional(),
    syndicateId: z.string().min(3).max(50).optional(),
    acceptTerms: z.boolean().refine(v => v === true, 'You must accept the terms'),
    acceptPrivacy: z.boolean().refine(v => v === true, 'You must accept the privacy policy')
  })
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
  refreshOtpSchema,
  adminLoginSchema,
  completeProfileSchema
};
