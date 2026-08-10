const { z } = require('zod');
const { RELATIONS } = require('../constants/relationship.constants');

const ALL_RELATIONS = Object.values(RELATIONS).flat();

const createRelationshipSchema = z.object({
  caregiverEmail: z.string().email('Invalid email address format').optional(),
  targetEmail: z.string().email('Invalid email address format').optional(),
  relation: z.string().optional(),
  permissions: z.object({
    canViewMedications: z.boolean().optional(),
    canAddMedication: z.boolean().optional(),
    canEditMedication: z.boolean().optional(),
    canDeleteMedication: z.boolean().optional(),
    canViewMedicalRecords: z.boolean().optional(),
    canEditMedicalRecords: z.boolean().optional(),
    canViewDoseSchedule: z.boolean().optional(),
    canConfirmDose: z.boolean().optional(),
    canOrderRefills: z.boolean().optional(),
    canReceiveNotifications: z.boolean().optional()
  }).optional()
}).refine(data => data.caregiverEmail || data.targetEmail, {
  message: 'Email address is required',
  path: ['caregiverEmail']
});

const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'])
});

module.exports = {
  createRelationshipSchema,
  updateStatusSchema
};
