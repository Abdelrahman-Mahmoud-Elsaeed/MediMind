const express = require('express');
const router = express.Router();
const medicationsController = require('../controllers/medications.controller');
const refillController = require('../controllers/refill.controller');
const { createMedicationSchema, updateMedicationSchema, scanMedicationSchema } = require('../validators/medications.validator');
const { createRefillOrderSchema, updateRefillStatusSchema } = require('../validators/refill.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, validate(createMedicationSchema), medicationsController.create);
router.get('/', authenticate, medicationsController.list);
router.post('/scan', authenticate, validate(scanMedicationSchema), medicationsController.scan);

// --- Medications Refill Orders API ---
router.post('/refills', authenticate, validate(createRefillOrderSchema), refillController.create);
router.get('/refills', authenticate, refillController.list);
router.patch('/refills/:id/status', authenticate, validate(updateRefillStatusSchema), refillController.updateStatus);

router.get('/:medicationId', authenticate, medicationsController.getOne);
router.put('/:medicationId', authenticate, validate(updateMedicationSchema), medicationsController.update);
router.delete('/:medicationId', authenticate, medicationsController.delete);

module.exports = router;
