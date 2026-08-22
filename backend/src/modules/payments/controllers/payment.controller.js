const paymentService = require('../services/payment.service');
const { logger } = require('../../../shared/utils/logger');

class PaymentController {
  /**
   * POST /api/v1/payments/create-checkout-session
   */
  async createCheckoutSession(req, res, next) {
    try {
      const result = await paymentService.createCheckoutSession(
        req.accountId,
        req.role,
        req.body
      );
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error creating Stripe Checkout Session:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/create-payment-intent
   */
  async createPaymentIntent(req, res, next) {
    try {
      const result = await paymentService.createPaymentIntent(
        req.accountId,
        req.role,
        req.body
      );
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error creating Stripe PaymentIntent:', error);
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/webhook
   */
  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers['stripe-signature'];
      const rawBody = req.rawBody || req.body;
      const result = await paymentService.handleStripeWebhook(signature, rawBody);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error handling Stripe Webhook:', error);
      next(error);
    }
  }

  async initiate(req, res, next) {
    try {
      const payment = await paymentService.initiatePayment(req.accountId, req.body);
      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error initiating payment:', error);
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const payment = await paymentService.completePayment(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error completing payment:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const list = await paymentService.listPayments(req.accountId, req.role);
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error) {
      logger.error('Error listing payments:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();
