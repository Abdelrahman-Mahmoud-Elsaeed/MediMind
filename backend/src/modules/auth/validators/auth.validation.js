const { z } = require('zod');
const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format').toLowerCase().optional(),
  phone: z.string().trim().min(5, 'Phone number is too short').optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => (data.email && !data.phone) || (!data.email && data.phone), {
  message: 'Provide either email or phone number, but not both.',
  path: ['email'],
});
module.exports = { loginSchema };
