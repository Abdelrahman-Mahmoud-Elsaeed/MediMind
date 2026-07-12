const express = require('express');
const router = express.Router();
const conditionsController = require('../controllers/conditions.controller');
const { createConditionSchema, updateConditionSchema } = require('../validators/conditions.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, validate(createConditionSchema), conditionsController.create);
router.get('/', authenticate, conditionsController.list);
router.get('/:conditionId', authenticate, conditionsController.getOne);
router.put('/:conditionId', authenticate, validate(updateConditionSchema), conditionsController.update);
router.delete('/:conditionId', authenticate, conditionsController.delete);

module.exports = router;
