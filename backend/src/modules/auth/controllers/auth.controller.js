const authService = require('../services/auth.service');
const { logger } = require('../../../sheared/utils/logger');

class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
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
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      next(error);
    }
  }

  /**
   * Logout user
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

      res.status(200).json({
        success: true,
        data: result
      });
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
      const accountId = req.accountId;
      const account = await authService.getAccountById(accountId);

      res.status(200).json({
        success: true,
        data: account
      });
    } catch (error) {
      logger.error('Get user error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
