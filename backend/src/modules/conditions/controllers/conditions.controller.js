const conditionsService = require('../services/conditions.service');
const { logger } = require('../../../shared/utils/logger');

class ConditionsController {
  async create(req, res, next) {
    try {
      const condition = await conditionsService.createCondition(
        req.accountId,
        req.role,
        req.body
      );
      res.status(201).json({
        success: true,
        data: {
          conditionId: condition._id,
          diseaseName: condition.diseaseName,
          isChronic: condition.isChronic,
          diagnosedDate: condition.diagnosedDate,
          notes: condition.notes
        }
      });
    } catch (error) {
      logger.error('Error creating medical condition:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const patientId = req.query.patientId || null;
      const list = await conditionsService.listConditions(
        req.accountId,
        req.role,
        patientId
      );
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error) {
      logger.error('Error listing medical conditions:', error);
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const { conditionId } = req.params;
      const condition = await conditionsService.getCondition(
        req.accountId,
        req.role,
        conditionId
      );
      res.status(200).json({
        success: true,
        data: condition
      });
    } catch (error) {
      logger.error('Error getting medical condition:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { conditionId } = req.params;
      const condition = await conditionsService.updateCondition(
        req.accountId,
        req.role,
        conditionId,
        req.body
      );
      res.status(200).json({
        success: true,
        data: condition
      });
    } catch (error) {
      logger.error('Error updating medical condition:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { conditionId } = req.params;
      await conditionsService.deleteCondition(
        req.accountId,
        req.role,
        conditionId
      );
      res.status(204).end();
    } catch (error) {
      logger.error('Error deleting medical condition:', error);
      next(error);
    }
  }
}

module.exports = new ConditionsController();
