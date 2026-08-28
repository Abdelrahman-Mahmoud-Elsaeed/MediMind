const refillService = require('../services/refill.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class RefillController {
  async create(req, res, next) {
    try {
      const order = await refillService.createRefillOrder(
        req.accountId,
        req.role,
        req.body
      );
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Refill order submitted successfully.',
        ar: 'تم تقديم طلب إعادة التعبئة بنجاح.',
        data: order
      }).send(res);
    } catch (error) {
      logger.error('Error creating refill order:', error);
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const order = await refillService.updateRefillOrderStatus(
        req.accountId,
        req.role,
        req.params.id,
        req.body
      );
      return new ServiceResponse({
        en: 'Refill order status updated successfully.',
        ar: 'تم تحديث حالة طلب إعادة التعبئة بنجاح.',
        data: order
      }).send(res);
    } catch (error) {
      logger.error('Error updating refill order status:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const list = await refillService.listRefillOrders(
        req.accountId,
        req.role,
        req.query
      );
      return new ServiceResponse({
        en: 'Refill orders retrieved successfully.',
        ar: 'تم استرجاع طلبات إعادة التعبئة بنجاح.',
        data: list
      }).send(res);
    } catch (error) {
      logger.error('Error listing refill orders:', error);
      next(error);
    }
  }
}

module.exports = new RefillController();
