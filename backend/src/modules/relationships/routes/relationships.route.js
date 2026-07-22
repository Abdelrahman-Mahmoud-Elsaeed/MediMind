const express = require('express');
const router = express.Router();
const relationshipsController = require('../controllers/relationships.controller');
const { createRelationshipSchema, updateStatusSchema } = require('../validators/relationships.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, authorize('PATIENT'), validate(createRelationshipSchema), relationshipsController.initiate);
router.get('/', authenticate, relationshipsController.list);
router.patch('/:relationshipId/status', authenticate, authorize('FAMILY_CAREGIVER'), validate(updateStatusSchema), relationshipsController.updateStatus);
router.delete('/:relationshipId', authenticate, authorize('PATIENT'), relationshipsController.revoke);

module.exports = router;
