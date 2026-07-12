const relationshipsService = require('../services/relationships.service');
const { logger } = require('../../../shared/utils/logger');

class RelationshipsController {
  async initiate(req, res, next) {
    try {
      const { caregiverEmail, permissions } = req.body;
      const relationship = await relationshipsService.initiateRelationship(
        req.accountId,
        caregiverEmail,
        permissions
      );
      res.status(201).json({
        success: true,
        data: {
          relationshipId: relationship._id,
          status: relationship.status
        }
      });
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
      res.status(200).json({
        success: true,
        data: list
      });
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
        relationshipId,
        status
      );
      res.status(200).json({
        success: true,
        data: relationship
      });
    } catch (error) {
      logger.error('Error updating relationship status:', error);
      next(error);
    }
  }

  async revoke(req, res, next) {
    try {
      const { relationshipId } = req.params;
      await relationshipsService.revokeRelationship(req.accountId, relationshipId);
      res.status(204).end();
    } catch (error) {
      logger.error('Error revoking relationship:', error);
      next(error);
    }
  }
}

module.exports = new RelationshipsController();
