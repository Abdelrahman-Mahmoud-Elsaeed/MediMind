const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { createPaymentSchema } = require('../validators/payment.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// Only patients initiate and complete their own payments
const PAYMENT_ACTOR = ['PATIENT'];
// Admins can list all payments; patients can list their own
const PAYMENT_VIEWERS = ['PATIENT', 'ADMIN'];

router.post('/', authenticate, authorize(...PAYMENT_ACTOR), validate(createPaymentSchema), paymentController.initiate);
router.post('/:id/complete', authenticate, authorize(...PAYMENT_ACTOR), paymentController.complete);
router.get('/', authenticate, authorize(...PAYMENT_VIEWERS), paymentController.list);

module.exports = router;
