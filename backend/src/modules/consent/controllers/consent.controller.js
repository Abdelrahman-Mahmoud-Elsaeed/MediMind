// src/modules/consent/controllers/consent.controller.js
const consentService = require('../services/consent.service');
const { logger } = require('../../../shared/utils/logger');

class ConsentController {
  /**
   * POST /api/v1/consent
   * Update consent preferences (one or more of: familyCaregiver, professionalCaregiver, doctor, pharmacy).
   * Each change is recorded in the immutable ConsentAudit trail.
   */
  async updateConsent(req, res, next) {
    try {
      const { consents, reason } = req.body;
      const reqMetadata = {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceId: req.headers['x-device-id'] || null,
      };

      const result = await consentService.updateConsent(
        req.accountId,
        consents,
        reason,
        reqMetadata
      );
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in consent.updateConsent');
      next(error);
    }
  }

  /**
   * GET /api/v1/consent/audit
   * Retrieve the immutable HIPAA audit trail of consent events for the requesting patient.
   */
  async getAudit(req, res, next) {
    try {
      const { limit, consentType } = req.query;
      const result = await consentService.getConsentAudit(req.accountId, {
        limit,
        consentType,
      });
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in consent.getAudit');
      next(error);
    }
  }
}

module.exports = new ConsentController();
