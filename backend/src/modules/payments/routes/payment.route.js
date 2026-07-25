const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { createPaymentSchema } = require('../validators/payment.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

router.post('/', authenticate, validate(createPaymentSchema), paymentController.initiate);
router.post('/:id/complete', authenticate, paymentController.complete);
router.get('/', authenticate, paymentController.list);

module.exports = router;
