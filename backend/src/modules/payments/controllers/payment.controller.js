const paymentService = require('../services/payment.service');
const { logger } = require('../../../shared/utils/logger');

class PaymentController {
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
