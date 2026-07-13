const adminService = require('../services/admin.service');
const { logger } = require('../../../sheared/utils/logger');

class AdminController {

  /**
   * GET /admin/dashboard
   * Platform overview
   */
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboard();
      res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Admin dashboard error:', error);
      next(error);
    }
  }

  /**
   * GET /admin/user-growth
   * User growth chart data (12 months)
   */
  async getUserGrowth(req, res, next) {
    try {
      const data = await adminService.getUserGrowth();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/financials
   * Financial summary (finance_admin + super_admin only)
   */
  async getFinancials(req, res, next) {
    try {
      // Check admin level
      if (req.adminLevel !== 'super_admin' && req.adminLevel !== 'finance_admin') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Finance access requires super_admin or finance_admin role' }
        });
      }
      const data = await adminService.getFinancials();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/users
   * All users with pagination (ops_admin + super_admin)
   */
  async getUsers(req, res, next) {
    try {
      if (req.adminLevel !== 'super_admin' && req.adminLevel !== 'ops_admin') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'User management requires super_admin or ops_admin role' }
        });
      }
      const data = await adminService.getUsers({
        role: req.query.role,
        search: req.query.search,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/system-health
   * System health metrics
   */
  async getSystemHealth(req, res, next) {
    try {
      const data = await adminService.getSystemHealth();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /admin/engagement
   * Engagement metrics (DAU, MAU, stickiness)
   */
  async getEngagement(req, res, next) {
    try {
      const data = await adminService.getEngagement();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
