const { z } = require('zod');
const registerDeviceSchema = z.object({ token: z.string().min(10, 'Token too short').max(512, 'Token too long'), platform: z.enum(['android', 'ios']), deviceId: z.string().max(255).optional(), appVersion: z.string().max(50).optional() });
module.exports = { registerDeviceSchema };
