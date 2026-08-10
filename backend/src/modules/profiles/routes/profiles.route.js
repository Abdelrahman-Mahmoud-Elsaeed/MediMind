const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profiles.controller');
const { updatePatientProfileSchema, updateCaregiverProfileSchema } = require('../validators/profiles.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.get('/patient/me', authenticate, authorize('PATIENT'), profilesController.getPatientMe);
router.put('/patient/me', authenticate, authorize('PATIENT'), validate(updatePatientProfileSchema), profilesController.updatePatientMe);

router.get('/caregiver/me', authenticate, authorize('FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'), profilesController.getCaregiverMe);
router.put('/caregiver/me', authenticate, authorize('FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'), validate(updateCaregiverProfileSchema), profilesController.updateCaregiverMe);

router.get('/family-caregiver/me', authenticate, authorize('FAMILY_CAREGIVER', 'CAREGIVER'), profilesController.getCaregiverMe);
router.put('/family-caregiver/me', authenticate, authorize('FAMILY_CAREGIVER', 'CAREGIVER'), validate(updateCaregiverProfileSchema), profilesController.updateCaregiverMe);

router.get('/professional-caregiver/me', authenticate, authorize('PROFESSIONAL_CAREGIVER'), profilesController.getCaregiverMe);
router.put('/professional-caregiver/me', authenticate, authorize('PROFESSIONAL_CAREGIVER'), validate(updateCaregiverProfileSchema), profilesController.updateCaregiverMe);

module.exports = router;
