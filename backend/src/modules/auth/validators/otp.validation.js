const { z } = require('zod');

const sendOtpSchema = z.object({
  target: z.string().optional(),
  type: z.enum(['EMAIL', 'PHONE', 'email', 'phone']).optional(),
});

const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  type: z.enum(['EMAIL', 'PHONE', 'email', 'phone']),
});

module.exports = { sendOtpSchema, verifyOtpSchema };
