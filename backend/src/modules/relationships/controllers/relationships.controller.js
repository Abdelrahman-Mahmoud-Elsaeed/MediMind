const relationshipsService = require('../services/relationships.service');
const ServiceResponse = require('../../../shared/utils/ServiceResponse');
const { logger } = require('../../../shared/utils/logger');

class RelationshipsController {
  async initiate(req, res, next) {
    try {
      const { caregiverEmail, targetEmail, relation, permissions } = req.body;
      const emailToUse = caregiverEmail || targetEmail;
      const relationship = await relationshipsService.initiateRelationship(
        req.accountId,
        req.role,
        emailToUse,
        relation,
        permissions
      );
      return new ServiceResponse({
        status: 'CREATED',
        en: 'Caregiver connection request sent successfully.',
        ar: 'تم إرسال طلب الربط مع مقدم الرعاية بنجاح.',
        data: {
          relationshipId: relationship._id,
          status: relationship.status
        }
      }).send(res);
    } catch (error) {
      logger.error('Error initiating caregiver relationship:', error);
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const statusFilter = req.query.status || null;
      const list = await relationshipsService.listRelationships(
        req.accountId,
        req.role,
        statusFilter
      );
      return new ServiceResponse({
        en: 'Relationships list retrieved successfully.',
        ar: 'تم استرجاع قائمة العلاقات بنجاح.',
        data: list
      }).send(res);
    } catch (error) {
      logger.error('Error listing relationships:', error);
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { relationshipId } = req.params;
      const { status } = req.body;
      const relationship = await relationshipsService.updateStatus(
        req.accountId,
        req.role,
        relationshipId,
        status
      );
      return new ServiceResponse({
        en: 'Relationship status updated successfully.',
        ar: 'تم تحديث حالة العلاقة بنجاح.',
        data: relationship
      }).send(res);
    } catch (error) {
      logger.error('Error updating relationship status:', error);
      next(error);
    }
  }

  async revoke(req, res, next) {
    try {
      const { relationshipId } = req.params;
      await relationshipsService.revokeRelationship(req.accountId, relationshipId);
      return new ServiceResponse({
        en: 'Relationship revoked successfully.',
        ar: 'تم إلغاء العلاقة بنجاح.',
        data: {}
      }).send(res);
    } catch (error) {
      logger.error('Error revoking relationship:', error);
      next(error);
    }
  }
}

module.exports = new RelationshipsController();
