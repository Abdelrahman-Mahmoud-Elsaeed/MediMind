const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');

// All routes require authentication + DOCTOR role
router.use(authenticate, authorize('DOCTOR'));

/**
 * @route   GET /api/v1/doctor/dashboard
 * @desc    Get doctor dashboard overview
 * @access  DOCTOR
 */
router.get('/dashboard', doctorController.getDashboard);

/**
 * @route   GET /api/v1/doctor/patients
 * @desc    Get list of patients with adherence stats
 * @access  DOCTOR
 * @query   search, sortBy (adherence|name)
 */
router.get('/patients', doctorController.getPatients);

/**
 * @route   GET /api/v1/doctor/weekly-report-preview
 * @desc    Get a preview of the next WhatsApp weekly report
 * @access  DOCTOR
 */
router.get('/weekly-report-preview', doctorController.getWeeklyReportPreview);

/**
 * @route   GET /api/v1/doctor/reports
 * @desc    Get full analytics report for all patients
 * @access  DOCTOR
 * @query   period (7|30|90, default 30)
 */
router.get('/reports', doctorController.getFullReport);

/**
 * @route   GET /api/v1/doctor/reports/patients/:patientId
 * @desc    Get detailed report for a specific patient
 * @access  DOCTOR
 * @query   period (7|30|90, default 30)
 */
router.get('/reports/patients/:patientId', doctorController.getPatientDetail);

/**
 * @route   PUT /api/v1/doctor/report-settings
 * @desc    Update WhatsApp report settings
 * @access  DOCTOR
 * @body    { enabled?, day?, time?, includeLowAdherence?, includeRefillSoon? }
 */
router.put('/report-settings', doctorController.updateReportSettings);

module.exports = router;
