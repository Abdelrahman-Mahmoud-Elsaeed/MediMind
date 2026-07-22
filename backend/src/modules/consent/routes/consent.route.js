// src/modules/consent/routes/consent.route.js
const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consent.controller');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');
const { updateConsentSchema } = require('../validators/consent.validation');

// All consent routes require authentication + PATIENT role only
router.use(authenticate, authorize('PATIENT'));

// POST /api/v1/consent — update one or more consent flags
router.post('/', validate(updateConsentSchema), consentController.updateConsent);

// GET /api/v1/consent/audit — retrieve immutable audit trail
router.get('/audit', consentController.getAudit);

module.exports = router;
