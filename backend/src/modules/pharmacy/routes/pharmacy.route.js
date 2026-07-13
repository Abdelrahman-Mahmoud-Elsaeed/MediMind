const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');

// All routes require authentication + PHARMACY role
router.use(authenticate, authorize('PHARMACY'));

/**
 * @route   GET /api/v1/pharmacy/dashboard
 * @desc    Get pharmacy dashboard stats
 * @access  PHARMACY
 */
router.get('/dashboard', pharmacyController.getDashboard);

/**
 * @route   GET /api/v1/pharmacy/patients
 * @desc    Get list of patients linked to this pharmacy
 * @access  PHARMACY
 * @query   search, page, limit
 */
router.get('/patients', pharmacyController.getPatients);

/**
 * @route   GET /api/v1/pharmacy/refill-needed
 * @desc    Get patients whose medications need refill soon
 * @access  PHARMACY
 */
router.get('/refill-needed', pharmacyController.getRefillNeeded);

/**
 * @route   GET /api/v1/pharmacy/analytics
 * @desc    Get weekly analytics report
 * @access  PHARMACY
 */
router.get('/analytics', pharmacyController.getAnalytics);

/**
 * @route   POST /api/v1/pharmacy/patients/:patientId/refill-reminder
 * @desc    Send a refill reminder to a patient
 * @access  PHARMACY
 * @body    { medicationId?: string }
 */
router.post('/patients/:patientId/refill-reminder', pharmacyController.sendRefillReminder);

module.exports = router;
