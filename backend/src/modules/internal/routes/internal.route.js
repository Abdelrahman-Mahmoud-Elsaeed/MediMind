// backend/src/modules/internal/routes/internal.route.js
const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internal.controller');
const { verifyWorkerSecret } = require('../../../shared/middleware/workerAuth.middleware');

router.use(verifyWorkerSecret);

router.post('/medications/generate-daily-doses', internalController.generateDailyDoses);
router.post('/doses/evaluate-missed', internalController.evaluateMissedDoses);
router.post('/doses/evaluate-snooze', internalController.evaluateSnoozeLimits);

module.exports = router;
