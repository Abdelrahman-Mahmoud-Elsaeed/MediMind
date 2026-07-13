const relationshipService = require('../services/relationship.service');
const { logger } = require('../../../sheared/utils/logger');

class RelationshipController {

  /**
   * POST /relationships/invite
   * Create an invitation (returns QR code + URL)
   * @body { invitedPhone?, relationType?, permissions? }
   */
  async createInvitation(req, res, next) {
    try {
      const result = await relationshipService.createInvitation(
        req.accountId,
        req.body
      );
      res.status(201).json({
        success: true,
        data: {
          invitationToken: result.relationship.invitationToken,
          invitationUrl: result.invitationUrl,
          qrCode: result.qrCodeDataUrl,
          expiresAt: result.relationship.expiresAt,
          invitedByName: result.relationship.invitedByName,
          status: result.relationship.status
        }
      });
    } catch (error) {
      logger.error('Create invitation error:', error);
      next(error);
    }
  }

  /**
   * GET /relationships/invitation/:token
   * Get invitation details (public — for the accept-invite page)
   */
  async getInvitation(req, res, next) {
    try {
      const invitation = await relationshipService.getInvitationByToken(req.params.token);
      res.status(200).json({ success: true, data: invitation });
    } catch (error) {
      logger.error('Get invitation error:', error);
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: error.message }
      });
    }
  }

  /**
   * POST /relationships/accept/:token
   * Accept an invitation (caregiver only)
   */
  async acceptInvitation(req, res, next) {
    try {
      const result = await relationshipService.acceptInvitation(
        req.params.token,
        req.accountId
      );
      res.status(200).json({
        success: true,
        data: {
          patientName: result.patientName,
          status: result.relationship.status,
          acceptedAt: result.relationship.acceptedAt
        }
      });
    } catch (error) {
      logger.error('Accept invitation error:', error);
      next(error);
    }
  }

  /**
   * GET /relationships
   * Get current user's relationships
   */
  async getMyRelationships(req, res, next) {
    try {
      const relationships = await relationshipService.getMyRelationships(
        req.accountId,
        req.role
      );
      res.status(200).json({ success: true, data: relationships });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /relationships/:id
   * Revoke a relationship
   */
  async revoke(req, res, next) {
    try {
      await relationshipService.revoke(req.params.id, req.accountId);
      res.status(200).json({ success: true, data: { message: 'تم إلغاء العلاقة بنجاح' } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RelationshipController();
