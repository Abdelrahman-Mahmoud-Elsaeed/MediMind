const { z } = require('zod');

const createNoteSchema = z.object({
  patientId: z.string().min(1, 'patientId is required'),
  targetRole: z.enum([
    "FAMILY_CAREGIVER",
    "PROFESSIONAL_CAREGIVER",
    "DOCTOR",
    "PHARMACIST",
    "PATIENT_PRIVATE"
  ]),
  sharedWithId: z.string().optional().nullable(),
  title: z.string().min(1, 'title is required').max(100),
  content: z.string().min(1, 'content is required')
});

module.exports = {
  createNoteSchema
};
