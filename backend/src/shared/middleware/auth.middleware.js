const { verifyToken } = require("../utils/jwt.util");
const { logger } = require("../utils/logger");

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is required",
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.accountId = decoded.accountId;
    req.role = decoded.role;

    next();
  } catch (error) {
    logger.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired access token",
      },
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
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
