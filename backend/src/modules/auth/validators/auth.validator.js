const { z } = require('zod');

const registerSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .transform(val => val.trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['PATIENT', 'CAREGIVER', 'ADMIN'], {
    errorMap: () => ({ message: 'Invalid role. Must be PATIENT, CAREGIVER, or ADMIN' })
  }),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters')
    .transform(val => val.trim()),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters')
    .transform(val => val.trim()),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .transform(val => val.trim())
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .transform(val => val.trim()),
  password: z.string()
    .min(1, 'Password is required')
});

const refreshSchema = z.object({
  // No body validation needed - token comes from HttpOnly cookie
});

const logoutSchema = z.object({
  // No body validation needed
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema
};
