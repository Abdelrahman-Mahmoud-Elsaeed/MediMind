const express = require('express');
const router = express.Router();
const conditionsController = require('../controllers/conditions.controller');
const { createConditionSchema, updateConditionSchema } = require('../validators/conditions.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// Roles that can read medical conditions
const CONDITION_READERS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'ADMIN'];
// Roles that can create a condition
const CONDITION_CREATORS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'ADMIN'];
// Roles that can update a condition
const CONDITION_EDITORS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'ADMIN'];
// Roles that can delete a condition
const CONDITION_DELETORS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER', 'DOCTOR', 'ADMIN'];

router.post('/', authenticate, authorize(...CONDITION_CREATORS), validate(createConditionSchema), conditionsController.create);
router.get('/', authenticate, authorize(...CONDITION_READERS), conditionsController.list);
router.get('/:conditionId', authenticate, authorize(...CONDITION_READERS), conditionsController.getOne);
router.put('/:conditionId', authenticate, authorize(...CONDITION_EDITORS), validate(updateConditionSchema), conditionsController.update);
router.delete('/:conditionId', authenticate, authorize(...CONDITION_DELETORS), conditionsController.delete);

module.exports = router;
