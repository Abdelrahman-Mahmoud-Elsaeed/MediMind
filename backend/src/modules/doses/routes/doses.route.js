const express = require('express');
const router = express.Router();
const dosesController = require('../controllers/doses.controller');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');

// Roles that can view the daily dose schedule
const DOSE_SCHEDULE_VIEWERS = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'DOCTOR'];
// Roles that can confirm or skip a dose (those physically present with the patient)
const DOSE_ACTION_ROLES = ['PATIENT', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER'];

router.get('/', authenticate, authorize(...DOSE_SCHEDULE_VIEWERS), dosesController.getSchedule);
router.post('/:doseEventId/confirm', authenticate, authorize(...DOSE_ACTION_ROLES), dosesController.confirm);
router.post('/:doseEventId/skip', authenticate, authorize(...DOSE_ACTION_ROLES), dosesController.skip);

module.exports = router;
