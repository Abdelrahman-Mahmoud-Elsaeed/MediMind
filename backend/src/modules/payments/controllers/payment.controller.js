const paymentService = require('../services/payment.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
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
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Stripe checkout session created successfully.',
        ar: 'تم إنشاء جلسة الدفع بنجاح.',
        data: result,
      }).send(res);
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
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Payment intent created successfully.',
        ar: 'تم إنشاء إذن الدفع بنجاح.',
        data: result,
      }).send(res);
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
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Payment initiated successfully.',
        ar: 'تم البدء في عملية الدفع بنجاح.',
        data: payment
      }).send(res);
    } catch (error) {
      logger.error('Error initiating payment:', error);
      next(error);
    }
  }

  async complete(req, res, next) {
    try {
      const payment = await paymentService.completePayment(req.params.id, req.body);
      return new ServiceResponse({
        en: 'Payment completed successfully.',
        ar: 'تمت إكتمل عملية الدفع بنجاح.',
        data: payment
      }).send(res);
    } catch (error) {
      logger.error('Error completing payment:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const list = await paymentService.listPayments(req.accountId, req.role);
      return new ServiceResponse({
        en: 'Payments history retrieved successfully.',
        ar: 'تم استرجاع سجل الدفعات بنجاح.',
        data: list
      }).send(res);
    } catch (error) {
      logger.error('Error listing payments:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();
