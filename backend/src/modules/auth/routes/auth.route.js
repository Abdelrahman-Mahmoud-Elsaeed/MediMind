const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authenticate } = require('../../../shared/middleware/auth.middleware');
const validate  = require('../../../shared/middleware/validation.middleware');
const { authRateLimiter } = require('../../../shared/middleware/rateLimit.middleware');


/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token cookie)
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user info
 * @access  Private (requires authentication)
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
