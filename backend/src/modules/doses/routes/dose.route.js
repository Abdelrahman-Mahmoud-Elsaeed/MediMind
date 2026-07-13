const express = require('express');
const router = express.Router();
const doseController = require('../controllers/dose.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');
const { verifyPatientAccess, verifyResourceAccess } = require('../../../sheared/middleware/access.middleware');

router.use(authenticate);

/**
 * @route   GET /api/v1/doses
 * @desc    Get daily schedule for a patient
 * @access  PATIENT, CAREGIVER, DOCTOR, PHARMACY
 * @query   patientId (required), date (optional, ISO datetime)
 */
router.get('/', verifyPatientAccess, doseController.getDailySchedule);

/**
 * @route   GET /api/v1/doses/adherence
 * @desc    Get adherence stats for a patient
 * @access  PATIENT, CAREGIVER, DOCTOR
 * @query   patientId (required), days (optional, default 30)
 */
router.get('/adherence', verifyPatientAccess, doseController.getAdherence);

/**
 * @route   POST /api/v1/doses/:id/confirm
 * @desc    Confirm a dose as taken
 * @access  PATIENT, CAREGIVER
 * @body    { takenVia?: 'PWA' | 'WHATSAPP' | 'NOTIFICATION_ACTION' | 'CAREGIVER' }
 */
router.post(
  '/:id/confirm',
  authorize('PATIENT', 'CAREGIVER'),
  verifyResourceAccess('DoseEvent'),
  doseController.confirm
);

/**
 * @route   POST /api/v1/doses/:id/skip
 * @desc    Skip a dose
 * @access  PATIENT, CAREGIVER
 * @body    { reason?: string }
 */
router.post(
  '/:id/skip',
  authorize('PATIENT', 'CAREGIVER'),
  verifyResourceAccess('DoseEvent'),
  doseController.skip
);

module.exports = router;
