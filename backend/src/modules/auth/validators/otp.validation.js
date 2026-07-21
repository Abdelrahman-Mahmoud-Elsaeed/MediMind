const { z } = require('zod');

const sendOtpSchema = z.object({}).default({});

const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

module.exports = { sendOtpSchema, verifyOtpSchema };
