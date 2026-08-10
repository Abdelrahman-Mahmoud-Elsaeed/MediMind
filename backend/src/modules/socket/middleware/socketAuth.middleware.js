const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../config/env');
const Account = require('../../auth/models/Account.model');
const { logger } = require('../../../shared/utils/logger');

/**
 * Socket.IO authentication middleware.
 * Verifies JWT token from handshake auth or headers and attaches account info to socket.
 */
async function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Socket connection attempt rejected: No token provided.');
      return next(new Error('Authentication error: Token required.'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      logger.warn(`Socket JWT verification failed: ${err.message}`);
      return next(new Error('Authentication error: Invalid or expired token.'));
    }

    const accountId = decoded.id || decoded.accountId || decoded.sub;
    if (!accountId) {
      return next(new Error('Authentication error: Invalid token payload.'));
    }

    const account = await Account.findById(accountId);
    if (!account || !account.isActive) {
      return next(new Error('Authentication error: User account inactive or not found.'));
    }

    // Attach authenticated identity to socket instance
    socket.accountId = account._id.toString();
    socket.user = account;
    socket.role = account.role;

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication error: Internal authentication failure.'));
  }
}

module.exports = { socketAuthMiddleware };
