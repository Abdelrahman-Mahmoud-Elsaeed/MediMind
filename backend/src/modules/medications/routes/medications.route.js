const express = require('express');
const router = express.Router();
const medicationsController = require('../controllers/medications.controller');
const refillController = require('../controllers/refill.controller');
const { createMedicationSchema, updateMedicationSchema, scanMedicationSchema } = require('../validators/medications.validator');
const { createRefillOrderSchema, updateRefillStatusSchema } = require('../validators/refill.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// Roles that can read patient medications (service layer enforces relationship checks for caregivers)
const MEDICATION_READERS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR', 'PHARMACIST'];
// Roles that can create a medication
const MEDICATION_CREATORS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR'];
// Roles that can update a medication
const MEDICATION_EDITORS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR'];
// Roles that can delete a medication
const MEDICATION_DELETORS = ['PATIENT', 'FAMILY_CAREGIVER', 'DOCTOR'];

// Roles that can request a refill
const REFILL_REQUESTORS = ['PATIENT', 'FAMILY_CAREGIVER', 'DOCTOR'];
// Roles that can list refill orders
const REFILL_VIEWERS = ['PATIENT', 'FAMILY_CAREGIVER', 'DOCTOR', 'PHARMACIST', 'ADMIN'];
// Roles that can update refill status (fulfillment side)
const REFILL_STATUS_UPDATERS = ['PHARMACIST', 'ADMIN'];

router.post('/', authenticate, authorize(...MEDICATION_CREATORS), validate(createMedicationSchema), medicationsController.create);
router.get('/', authenticate, authorize(...MEDICATION_READERS), medicationsController.list);
router.post('/scan', authenticate, authorize(...MEDICATION_CREATORS), validate(scanMedicationSchema), medicationsController.scan);

// --- Medications Refill Orders API ---
router.post('/refills', authenticate, authorize(...REFILL_REQUESTORS), validate(createRefillOrderSchema), refillController.create);
router.get('/refills', authenticate, authorize(...REFILL_VIEWERS), refillController.list);
router.patch('/refills/:id/status', authenticate, authorize(...REFILL_STATUS_UPDATERS), validate(updateRefillStatusSchema), refillController.updateStatus);

router.get('/:medicationId', authenticate, authorize(...MEDICATION_READERS), medicationsController.getOne);
router.put('/:medicationId', authenticate, authorize(...MEDICATION_EDITORS), validate(updateMedicationSchema), medicationsController.update);
router.patch('/:medicationId', authenticate, authorize(...MEDICATION_EDITORS), validate(updateMedicationSchema), medicationsController.update);
router.delete('/:medicationId', authenticate, authorize(...MEDICATION_DELETORS), medicationsController.delete);

module.exports = router;
