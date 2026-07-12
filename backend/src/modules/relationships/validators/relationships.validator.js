const { z } = require('zod');

const createRelationshipSchema = z.object({
  caregiverEmail: z.string().email(),
  permissions: z.object({
    canAddMedication: z.boolean().default(true),
    canViewMedicalRecords: z.boolean().default(false)
  }).default({
    canAddMedication: true,
    canViewMedicalRecords: false
  })
});

const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'])
});

module.exports = {
  createRelationshipSchema,
  updateStatusSchema
};
