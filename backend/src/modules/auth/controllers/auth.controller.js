const authService = require('../services/auth.service');
const { logger } = require('../../../sheared/utils/logger');

/**
 * Auth Controller — وفاء (Wafa) Platform
 *
 * Phone + OTP based authentication.
 * Endpoints:
 *  POST /auth/send-otp     - Send OTP to phone
 *  POST /auth/verify-otp   - Verify OTP and login/register
 *  POST /auth/refresh       - Refresh access token
 *  POST /auth/logout        - Logout
 *  GET  /auth/me            - Get current user
 *  POST /auth/admin/login   - Admin login (email + password)
 */
class AuthController {
  /**
   * Send OTP
   * POST /auth/send-otp
   * Body: { phone: "+20XXXXXXXXXX", channel?: "sms"|"whatsapp" }
   */
  async sendOtp(req, res, next) {
    try {
      const { phone, channel } = req.body;
      const result = await authService.sendOtp({ phone, channel });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Send OTP error:', error);

      // Handle rate limit errors with appropriate status
      if (error.code === 'OTP_COOLDOWN') {
        return res.status(429).json({
          success: false,
          error: {
            code: 'OTP_COOLDOWN',
            message: error.message,
            waitSeconds: error.waitSeconds
          }
        });
      }
      next(error);
    }
  }

  /**
   * Verify OTP and login/register
   * POST /auth/verify-otp
   * Body: { phone, code, role?, firstName?, lastName? }
   */
  async verifyOtp(req, res, next) {
    try {
      const result = await authService.verifyOtp(req.body);

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(result.user.isNewUser ? 201 : 200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      logger.error('Verify OTP error:', error);
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: { accessToken: result.accessToken }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      next(error);
    }
  }

  /**
   * Logout
   * POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      const accountId = req.accountId || null;
      const result = await authService.logout(accountId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Get current user info
   * GET /auth/me
   */
  async getMe(req, res, next) {
    try {
      const account = await authService.getAccountById(req.accountId);
      res.status(200).json({ success: true, data: account });
    } catch (error) {
      logger.error('Get user error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
