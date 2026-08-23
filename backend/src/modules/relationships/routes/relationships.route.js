const express = require('express');
const router = express.Router();
const relationshipsController = require('../controllers/relationships.controller');
const { createRelationshipSchema, updateStatusSchema } = require('../validators/relationships.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// Roles that can initiate a relationship (patient or a caregiver/doctor inviting a patient)
const RELATIONSHIP_INITIATORS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'ADMIN'];
// All relational roles can list their own relationships
const RELATIONSHIP_VIEWERS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'PHARMACIST', 'ADMIN'];
// Both sides of the relationship can accept/reject a pending invitation
const RELATIONSHIP_STATUS_UPDATERS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'ADMIN'];
// Only the patient can revoke (permanently remove) a relationship
const RELATIONSHIP_REVOKERS = ['PATIENT'];

router.post('/', authenticate, authorize(...RELATIONSHIP_INITIATORS), validate(createRelationshipSchema), relationshipsController.initiate);
router.get('/', authenticate, authorize(...RELATIONSHIP_VIEWERS), relationshipsController.list);
router.patch('/:relationshipId/status', authenticate, authorize(...RELATIONSHIP_STATUS_UPDATERS), validate(updateStatusSchema), relationshipsController.updateStatus);
router.delete('/:relationshipId', authenticate, authorize(...RELATIONSHIP_REVOKERS), relationshipsController.revoke);

module.exports = router;
