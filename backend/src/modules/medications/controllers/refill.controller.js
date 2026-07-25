const refillService = require('../services/refill.service');
const { logger } = require('../../../shared/utils/logger');

class RefillController {
  async create(req, res, next) {
    try {
      const order = await refillService.createRefillOrder(
        req.accountId,
        req.role,
        req.body
      );
      res.status(201).json({
        success: true,
        data: order
      });
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
      res.status(200).json({
        success: true,
        data: order
      });
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
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error) {
      logger.error('Error listing refill orders:', error);
      next(error);
    }
  }
}

module.exports = new RefillController();
