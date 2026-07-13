const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');
const { verifyPatientAccess } = require('../../../sheared/middleware/access.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/ai/insights
 * @desc    Get combined AI insights (interactions + predictions)
 * @access  PATIENT, CAREGIVER, DOCTOR
 */
router.get('/insights', verifyPatientAccess, aiController.getInsights);

/**
 * @route   GET /api/v1/ai/interactions
 * @desc    Check all drug interactions for current patient
 * @access  PATIENT, CAREGIVER, DOCTOR
 */
router.get('/interactions', verifyPatientAccess, aiController.getInteractions);

/**
 * @route   POST /api/v1/ai/interactions/check
 * @desc    Check interactions for a new medication before adding
 * @access  PATIENT, CAREGIVER
 * @body    { drugName: string }
 */
router.post(
  '/interactions/check',
  authorize('PATIENT', 'CAREGIVER'),
  aiController.checkNewMedication
);

/**
 * @route   GET /api/v1/ai/interactions/:drugName
 * @desc    Get all known interactions for a single drug
 * @access  PATIENT, CAREGIVER, DOCTOR, PHARMACY
 */
router.get('/interactions/:drugName', aiController.getDrugInfo);

/**
 * @route   GET /api/v1/ai/predictions
 * @desc    Get adherence risk prediction for current patient
 * @access  PATIENT, CAREGIVER, DOCTOR
 * @query   days (default 7)
 */
router.get('/predictions', verifyPatientAccess, aiController.getAdherencePrediction);

/**
 * @route   GET /api/v1/ai/smart-reminders
 * @desc    Get smart reminder analysis (learns from patient behavior)
 * @access  PATIENT, CAREGIVER, DOCTOR
 */
router.get('/smart-reminders', verifyPatientAccess, aiController.getSmartReminders);

/**
 * @route   GET /api/v1/ai/smart-reminders/settings
 * @desc    Get smart reminder settings (for worker/cron)
 * @access  PATIENT, CAREGIVER
 */
router.get(
  '/smart-reminders/settings',
  verifyPatientAccess,
  aiController.getSmartReminderSettings
);

module.exports = router;
