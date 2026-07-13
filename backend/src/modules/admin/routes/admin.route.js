const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../../../sheared/middleware/auth.middleware');

// All routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Platform overview stats
 * @access  ADMIN (any level)
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   GET /api/v1/admin/user-growth
 * @desc    User growth chart data (12 months)
 * @access  ADMIN (any level)
 */
router.get('/user-growth', adminController.getUserGrowth);

/**
 * @route   GET /api/v1/admin/engagement
 * @desc    Engagement metrics (DAU, MAU, stickiness)
 * @access  ADMIN (any level)
 */
router.get('/engagement', adminController.getEngagement);

/**
 * @route   GET /api/v1/admin/financials
 * @desc    Financial summary (revenue, MRR, ARR)
 * @access  ADMIN (super_admin, finance_admin only)
 */
router.get('/financials', adminController.getFinancials);

/**
 * @route   GET /api/v1/admin/users
 * @desc    All users with pagination
 * @access  ADMIN (super_admin, ops_admin only)
 * @query   role, search, page, limit
 */
router.get('/users', adminController.getUsers);

/**
 * @route   GET /api/v1/admin/system-health
 * @desc    System health metrics (DB stats, memory, uptime)
 * @access  ADMIN (any level)
 */
router.get('/system-health', adminController.getSystemHealth);

module.exports = router;
