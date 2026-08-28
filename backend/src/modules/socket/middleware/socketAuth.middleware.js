const { verifyToken } = require('../../../shared/utils/jwt.util');
const Account = require('../../auth/models/Account.model');
const { logger } = require('../../../shared/utils/logger');

/**
 * Socket.IO authentication middleware.
 * Verifies JWT token from handshake auth, headers, query, or cookie and attaches account info to socket.
 */
async function socketAuthMiddleware(socket, next) {
  try {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token;

    // If token passed in cookie
    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, str) => {
        const [k, v] = str.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies.accessToken || cookies.token;
    }

    if (!token) {
      logger.warn('Socket connection rejected: No authentication token provided.');
      return next(new Error('Authentication error: Token required.'));
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      logger.warn(`Socket JWT verification failed: ${err.message}`);
      return next(new Error('Authentication error: Invalid or expired token.'));
    }

    const accountId = decoded.accountId || decoded.id || decoded.sub || decoded._id;
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

    logger.debug(`Socket authenticated for user: ${socket.accountId} (${socket.role})`);
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication error: Internal authentication failure.'));
  }
}

module.exports = { socketAuthMiddleware };

