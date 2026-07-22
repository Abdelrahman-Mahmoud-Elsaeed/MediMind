const express = require('express');
const router = express.Router();
const c = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');

router.use(authenticate, authorize('DOCTOR'));
router.get('/patients', c.getPatients);
router.get('/patients/:patientId/compliance', c.getCompliance);
router.get('/reports/weekly', c.getWeeklyReport);

module.exports = router;
