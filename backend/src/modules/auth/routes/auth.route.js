const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../../../sheared/middleware/auth.middleware');
const validate = require('../../../sheared/middleware/validation.middleware');
const { sendOtpSchema, verifyOtpSchema } = require('../validators/auth.validator');

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP code to phone number
 * @access  Public
 */
router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and login or register
 * @access  Public
 */
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using HttpOnly refresh cookie
 * @access  Public (cookie-based)
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (clears refresh cookie)
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
