const { verifyToken } = require("../utils/jwt.util");
const { logger } = require("../utils/logger");

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Access token is required",
          messages: {
            en: "Authentication token is missing or malformed.",
            ar: "رمز المصادقة مفقود أو غير صالح."
          }
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

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
        messages: {
          en: "Your session has expired or the token is invalid. Please log in again.",
          ar: "انتهت صلاحية الجلسة أو الرمز غير صالح. يرجى تسجيل الدخول مرة أخرى."
        }
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
          messages: {
            en: "You must be logged in to access this resource.",
            ar: "يجب تسجيل الدخول للوصول إلى هذا المورد."
          }
        },
      });
    }

    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
          messages: {
            en: "You do not have the required permissions to perform this action.",
            ar: "ليس لديك الصلاحيات الكافية لإتمام هذا الإجراء."
          }
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