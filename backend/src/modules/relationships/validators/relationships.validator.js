const { z } = require('zod');
const { RELATIONS } = require('../constants/relationship.constants');

const ALL_RELATIONS = Object.values(RELATIONS).flat();

const createRelationshipSchema = z.object({
  caregiverEmail: z.string().email('Invalid email address format'),
  relation: z.string().refine(val => ALL_RELATIONS.includes(val), {
    message: `Relation must be one of: ${ALL_RELATIONS.join(', ')}`
  }),
  permissions: z.object({
    canAddMedication: z.boolean().default(false),
    canEditMedication: z.boolean().default(false),
    canDeleteMedication: z.boolean().default(false),
    canViewMedicalRecords: z.boolean().default(false),
    canEditMedicalRecords: z.boolean().default(false),
    canManageAppointments: z.boolean().default(false),
    canReceiveNotifications: z.boolean().default(false)
  }).optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'])
});

module.exports = {
  createRelationshipSchema,
  updateStatusSchema
};
