// src/modules/auth/controllers/admin.controller.js
const adminService = require('../services/admin.service');
const { logger } = require('../../../shared/utils/logger');

class AdminController {
  /**
   * POST /api/v1/auth/admin/register/professional
   * Admin-only registration for a PROFESSIONAL_CAREGIVER.
   */
  async registerProfessional(req, res, next) {
    try {
      const result = await adminService.registerProfessional(req.accountId, req.body);
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in admin.registerProfessional');
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/admin/register/provider
   * Admin-only registration for DOCTOR or PHARMACIST.
   */
  async registerProvider(req, res, next) {
    try {
      const result = await adminService.registerProvider(req.accountId, req.body);
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in admin.registerProvider');
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/admin/verify/doctor/:id
   * Verify a doctor after reviewing their syndicate ID + documents.
   */
  async verifyDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.verifyDoctor(req.accountId, id);
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in admin.verifyDoctor');
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/admin/verify/pharmacist/:id
   * Verify a pharmacist after reviewing their license + documents.
   */
  async verifyPharmacist(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.verifyPharmacist(req.accountId, id);
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in admin.verifyPharmacist');
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/admin/accounts/:id/status
   * Enable or disable any user account.
   */
  async updateAccountStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive, reason } = req.body;
      const result = await adminService.updateAccountStatus(
        req.accountId,
        id,
        isActive,
        reason
      );
      return result.send(res);
    } catch (error) {
      logger.error(error, 'Error in admin.updateAccountStatus');
      next(error);
    }
  }
}

module.exports = new AdminController();
