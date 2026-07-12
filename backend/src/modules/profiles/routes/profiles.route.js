const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profiles.controller');
const { updatePatientProfileSchema, updateCaregiverProfileSchema } = require('../validators/profiles.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.get('/patient/me', authenticate, authorize('PATIENT'), profilesController.getPatientMe);
router.put('/patient/me', authenticate, authorize('PATIENT'), validate(updatePatientProfileSchema), profilesController.updatePatientMe);

router.get('/caregiver/me', authenticate, authorize('CAREGIVER'), profilesController.getCaregiverMe);
router.put('/caregiver/me', authenticate, authorize('CAREGIVER'), validate(updateCaregiverProfileSchema), profilesController.updateCaregiverMe);

module.exports = router;
