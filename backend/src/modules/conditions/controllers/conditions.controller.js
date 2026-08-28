const conditionsService = require('../services/conditions.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class ConditionsController {
  async create(req, res, next) {
    try {
      const condition = await conditionsService.createCondition(
        req.accountId,
        req.role,
        req.body
      );
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Medical condition added successfully.',
        ar: 'تمت إضافة الحالة الطبية بنجاح.',
        data: {
          conditionId: condition._id,
          diseaseName: condition.diseaseName,
          isChronic: condition.isChronic,
          diagnosedDate: condition.diagnosedDate,
          notes: condition.notes
        }
      }).send(res);
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
      return new ServiceResponse({
        en: 'Medical conditions retrieved successfully.',
        ar: 'تم استرجاع الحالات الطبية بنجاح.',
        data: list
      }).send(res);
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
      return new ServiceResponse({
        en: 'Medical condition details retrieved successfully.',
        ar: 'تم استرجاع تفاصيل الحالة الطبية بنجاح.',
        data: condition
      }).send(res);
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
      return new ServiceResponse({
        en: 'Medical condition updated successfully.',
        ar: 'تم تحديث الحالة الطبية بنجاح.',
        data: condition
      }).send(res);
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
      return new ServiceResponse({
        en: 'Medical condition deleted successfully.',
        ar: 'تم حذف الحالة الطبية بنجاح.',
        data: {}
      }).send(res);
    } catch (error) {
      logger.error('Error deleting medical condition:', error);
      next(error);
    }
  }
}

module.exports = new ConditionsController();
