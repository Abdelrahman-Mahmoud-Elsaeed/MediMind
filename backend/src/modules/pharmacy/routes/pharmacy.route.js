const express = require('express');
const router = express.Router();
const c = require('../controllers/pharmacy.controller');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');

router.use(authenticate, authorize('PHARMACIST'));
router.get('/patients', c.getPatients);
router.get('/patients/refill-soon', c.getRefillSoon);
router.get('/analytics', c.getAnalytics);
router.post('/patients/:patientId/reminder', c.sendRefillReminder);

module.exports = router;
