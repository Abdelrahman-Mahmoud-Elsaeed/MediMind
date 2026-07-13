const { verifyToken } = require('../utils/jwt.util');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header OR query param (for PDF exports in new tabs)
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query && req.query.token) {
      // Allow token via query param for export endpoints (PDF opens in new tab)
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required'
        }
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.accountId = decoded.accountId;
    req.role = decoded.role;
    // For admin, also attach admin level (need to fetch from DB)
    if (decoded.role === 'ADMIN' && decoded.adminLevel) {
      req.adminLevel = decoded.adminLevel;
    }

    next();
  } catch (error) {
    logger.error('Authentication error:', error);

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token'
      }
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
