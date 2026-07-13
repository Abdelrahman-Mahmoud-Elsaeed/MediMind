const { z } = require('zod');

const confirmDoseSchema = z.object({
  body: z.object({
    takenVia: z.enum(['PWA', 'WHATSAPP', 'NOTIFICATION_ACTION', 'CAREGIVER']).optional().default('PWA')
  })
});

const skipDoseSchema = z.object({
  body: z.object({
    reason: z.string().max(200).optional()
  })
});

const getDailyScheduleSchema = z.object({
  query: z.object({
    patientId: z.string().length(24),
    date: z.string().datetime().optional()
  })
});

module.exports = {
  confirmDoseSchema,
  skipDoseSchema,
  getDailyScheduleSchema
};
