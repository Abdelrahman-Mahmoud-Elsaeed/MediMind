const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const {
  createPaymentSchema,
  createCheckoutSessionSchema,
  createPaymentIntentSchema,
} = require('../validators/payment.validator');
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const validate = require('../../../shared/middleware/validation.middleware');

const PAYMENT_ACTOR = ['PATIENT'];
const PAYMENT_VIEWERS = ['PATIENT', 'ADMIN'];

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
router.post('/', authenticate, authorize(...PAYMENT_ACTOR), validate(createPaymentSchema), paymentController.initiate);
router.post('/:id/complete', authenticate, authorize(...PAYMENT_ACTOR), paymentController.complete);
router.get('/', authenticate, authorize(...PAYMENT_VIEWERS), paymentController.list);

module.exports = router;
