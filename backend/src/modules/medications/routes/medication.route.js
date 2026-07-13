const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medication.controller');
const {
  createMedicationSchema,
  updateMedicationSchema,
  refillMedicationSchema,
  scanMedicationSchema
} = require('../validators/medication.validator');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');
const { verifyPatientAccess, verifyResourceAccess } = require('../../../sheared/middleware/access.middleware');
const validate = require('../../../sheared/middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/medications
 * @desc    Create a new medication
 * @access  PATIENT, CAREGIVER
 */
router.post(
  '/',
  authenticate,
  authorize('PATIENT', 'CAREGIVER'),
  validate(createMedicationSchema),
  medicationController.create
);

/**
 * @route   GET /api/v1/medications
 * @desc    Get all medications for a patient
 * @access  PATIENT, CAREGIVER, DOCTOR, PHARMACY
 */
router.get('/', verifyPatientAccess, medicationController.getAll);

/**
 * @route   POST /api/v1/medications/scan
 * @desc    AI OCR scan of medication label
 * @access  PATIENT, CAREGIVER
 */
router.post(
  '/scan',
  authorize('PATIENT', 'CAREGIVER'),
  validate(scanMedicationSchema),
  medicationController.scan
);

/**
 * @route   GET /api/v1/medications/refill-needed
 * @desc    Get medications that need refill soon
 * @access  PATIENT, CAREGIVER, PHARMACY
 */
router.get('/refill-needed', verifyPatientAccess, medicationController.getRefillNeeded);

/**
 * @route   GET /api/v1/medications/expiring-soon
 * @desc    Get medications expiring within 30 days
 * @access  PATIENT, CAREGIVER
 */
router.get('/expiring-soon', verifyPatientAccess, medicationController.getExpiringSoon);

/**
 * @route   GET /api/v1/medications/:id
 * @desc    Get a single medication
 * @access  PATIENT, CAREGIVER, DOCTOR, PHARMACY
 */
router.get('/:id', verifyResourceAccess('Medication'), medicationController.getById);

/**
 * @route   PUT /api/v1/medications/:id
 * @desc    Update a medication
 * @access  PATIENT, CAREGIVER
 */
router.put(
  '/:id',
  authorize('PATIENT', 'CAREGIVER'),
  verifyResourceAccess('Medication'),
  validate(updateMedicationSchema),
  medicationController.update
);

/**
 * @route   POST /api/v1/medications/:id/refill
 * @desc    Refill medication inventory
 * @access  PATIENT, CAREGIVER, PHARMACY
 */
router.post(
  '/:id/refill',
  authorize('PATIENT', 'CAREGIVER', 'PHARMACY'),
  verifyResourceAccess('Medication'),
  validate(refillMedicationSchema),
  medicationController.refill
);

/**
 * @route   DELETE /api/v1/medications/:id
 * @desc    Deactivate (soft-delete) a medication
 * @access  PATIENT, CAREGIVER
 */
router.delete(
  '/:id',
  authorize('PATIENT', 'CAREGIVER'),
  verifyResourceAccess('Medication'),
  medicationController.deactivate
);

module.exports = router;
