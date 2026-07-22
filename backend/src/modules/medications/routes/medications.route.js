const express = require('express');
const router = express.Router();
const medicationsController = require('../controllers/medications.controller');
const { createMedicationSchema, updateMedicationSchema, scanMedicationSchema } = require('../validators/medications.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, validate(createMedicationSchema), medicationsController.create);
router.get('/', authenticate, medicationsController.list);
router.get('/refill-soon', authenticate, medicationsController.refillSoon);
router.post('/scan', authenticate, validate(scanMedicationSchema), medicationsController.scan);
router.get('/:medicationId', authenticate, medicationsController.getOne);
router.put('/:medicationId', authenticate, validate(updateMedicationSchema), medicationsController.update);
router.post('/:medicationId/order', authenticate, medicationsController.order);
router.delete('/:medicationId', authenticate, medicationsController.delete);

module.exports = router;
