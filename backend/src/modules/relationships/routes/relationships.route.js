const express = require('express');
const router = express.Router();
const relationshipsController = require('../controllers/relationships.controller');
const { createRelationshipSchema, updateStatusSchema } = require('../validators/relationships.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, authorize('PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'), validate(createRelationshipSchema), relationshipsController.initiate);
router.get('/', authenticate, relationshipsController.list);
router.patch('/:relationshipId/status', authenticate, authorize('PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'), validate(updateStatusSchema), relationshipsController.updateStatus);
router.delete('/:relationshipId', authenticate, authorize('PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'), relationshipsController.revoke);

module.exports = router;
