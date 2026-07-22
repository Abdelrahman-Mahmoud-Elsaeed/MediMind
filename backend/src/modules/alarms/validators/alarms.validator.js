const { z } = require('zod');
const alarmStatusReportSchema = z.object({ alarmEventId: z.string().min(1, 'alarmEventId required'), deliveryStatus: z.enum(['DELIVERED', 'FAILED', 'OPENED']), deviceTimestamp: z.string().datetime() });
module.exports = { alarmStatusReportSchema };
