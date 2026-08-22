const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const {
  createPaymentSchema,
  createCheckoutSessionSchema,
  createPaymentIntentSchema,
} = require('../validators/payment.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

// Public Stripe Webhook listener
router.post('/webhook', paymentController.handleWebhook);

// Stripe Checkout Session creation
router.post(
  '/create-checkout-session',
  authenticate,
  validate(createCheckoutSessionSchema),
  paymentController.createCheckoutSession
);

// Direct Stripe PaymentIntent creation
router.post(
  '/create-payment-intent',
  authenticate,
  validate(createPaymentIntentSchema),
  paymentController.createPaymentIntent
);

// Generic Payment Initiation & Completion
router.post('/', authenticate, validate(createPaymentSchema), paymentController.initiate);
router.post('/:id/complete', authenticate, paymentController.complete);
router.get('/', authenticate, paymentController.list);

module.exports = router;
