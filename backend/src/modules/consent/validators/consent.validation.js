// src/modules/consent/validators/consent.validation.js
const { z } = require('zod');

/**
 * Schema for updating consent — the patient grants or revokes consent
 * for one or more of the 4 consent types.
 *
 * Only PATIENT role accounts can call this endpoint.
 *
 * Example body:
 *   {
 *     "consents": {
 *       "familyCaregiver": true,
 *       "doctor": false
 *     },
 *     "reason": "Revoked doctor consent because I changed doctors"
 *   }
 */
const updateConsentSchema = z.object({
  consents: z
    .object({
      familyCaregiver: z.boolean().optional(),
      professionalCaregiver: z.boolean().optional(),
      doctor: z.boolean().optional(),
      pharmacy: z.boolean().optional(),
    })
    .refine(
      (data) =>
        data.familyCaregiver !== undefined ||
        data.professionalCaregiver !== undefined ||
        data.doctor !== undefined ||
        data.pharmacy !== undefined,
      {
        message: 'At least one consent field must be provided',
      }
    ),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

module.exports = {
  updateConsentSchema,
};
