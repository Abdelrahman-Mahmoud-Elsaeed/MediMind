const pharmacyService = require('../services/pharmacy.service');
const { logger } = require('../../../sheared/utils/logger');

class PharmacyController {

  /**
   * GET /pharmacy/dashboard
   * Get pharmacy dashboard stats
   */
  async getDashboard(req, res, next) {
    try {
      const stats = await pharmacyService.getDashboardStats(req.accountId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      logger.error('Pharmacy dashboard error:', error);
      next(error);
    }
  }

  /**
   * GET /pharmacy/patients?search=...&page=1&limit=20
   */
  async getPatients(req, res, next) {
    try {
      const result = await pharmacyService.getPatients(req.accountId, {
        search: req.query.search || '',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /pharmacy/refill-needed
   * Get patients whose medications need refill soon
   */
  async getRefillNeeded(req, res, next) {
    try {
      const result = await pharmacyService.getRefillNeededPatients(req.accountId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /pharmacy/patients/:patientId/refill-reminder
   * Send a refill reminder to a specific patient
   * @body { medicationId?: string }
   */
  async sendRefillReminder(req, res, next) {
    try {
      const result = await pharmacyService.sendRefillReminder(
        req.accountId,
        req.params.patientId,
        req.body.medicationId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Send refill reminder error:', error);
      next(error);
    }
  }

  /**
   * GET /pharmacy/analytics
   * Get weekly analytics report
   */
  async getAnalytics(req, res, next) {
    try {
      const analytics = await pharmacyService.getWeeklyAnalytics(req.accountId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PharmacyController();
