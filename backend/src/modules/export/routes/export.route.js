const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');
const { verifyPatientAccess } = require('../../../sheared/middleware/access.middleware');

router.use(authenticate);

/**
 * @route   GET /api/v1/export/patient/:patientId/pdf
 * @desc    Get patient report as HTML (print to PDF)
 * @access  PATIENT, CAREGIVER, DOCTOR
 * @query   period (7|30|90, default 30)
 */
router.get(
  '/patient/:patientId/pdf',
  verifyPatientAccess,
  exportController.exportPatientPDF
);

/**
 * @route   GET /api/v1/export/patient/:patientId/csv
 * @desc    Get patient report as CSV (Excel)
 * @access  PATIENT, CAREGIVER, DOCTOR
 * @query   period (7|30|90, default 30)
 */
router.get(
  '/patient/:patientId/csv',
  verifyPatientAccess,
  exportController.exportPatientCSV
);

/**
 * @route   GET /api/v1/export/doctor/csv
 * @desc    Get doctor's panel report as CSV
 * @access  DOCTOR
 * @query   period (7|30|90, default 30)
 */
router.get(
  '/doctor/csv',
  authorize('DOCTOR'),
  exportController.exportDoctorCSV
);

module.exports = router;
