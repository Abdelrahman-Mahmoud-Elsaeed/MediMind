const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
  
  phone: z.string().trim().min(5, "Phone number is too short").optional(),
  
  password: z.string().min(1, 'Password is required'),
})
.refine(data => (data.email && !data.phone) || (!data.email && data.phone), {
  message: "Provide either email or phone number, but not both.",
  path: ["email"]
});

// --- Forgot / Reset Password Schemas ---

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format").toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};