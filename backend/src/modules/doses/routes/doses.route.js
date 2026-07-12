const express = require('express');
const router = express.Router();
const dosesController = require('../controllers/doses.controller');
const { authenticate } = require('../../../shared/middleware/auth.middleware');

router.get('/', authenticate, dosesController.getSchedule);
router.post('/:doseEventId/confirm', authenticate, dosesController.confirm);
router.post('/:doseEventId/skip', authenticate, dosesController.skip);

module.exports = router;
