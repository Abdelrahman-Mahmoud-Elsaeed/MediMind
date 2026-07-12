const { z } = require('zod');

const getScheduleSchema = z.object({
  patientId: z.string().optional(),
  date: z.string().datetime().or(z.string().date()).optional()
});

module.exports = {
  getScheduleSchema
};
