// src/config/socket.js
const { Server } = require('socket.io');
const { verifyToken } = require('../shared/utils/jwt.util');
const { logger } = require('../shared/utils/logger');
const { NODE_ENV, FRONTEND_URL } = require('./env');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} httpServer 
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: NODE_ENV === 'production' ? FRONTEND_URL : true,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

      if (!token) {
        return next();
      }

      const decoded = verifyToken(token);
      socket.user = {
        accountId: decoded.accountId,
        role: decoded.role,
      };

      next();
    } catch (err) {
      logger.warn('Socket authentication failed:', err.message);
      next();
    }
  });

  io.on('connection', async (socket) => {
    if (socket.user?.accountId) {
      const { accountId, role } = socket.user;
      
      // Join personal account room
      socket.join(`user_${accountId}`);
      // Join role room
      socket.join(`role_${role}`);

      logger.info(`Socket connected for user: ${accountId} [${role}] (Socket ID: ${socket.id})`);

      // If pharmacist, join pharmacy room
      if (role === 'PHARMACIST') {
        try {
          const Pharmacist = require('../modules/auth/models/Pharmacist.model');
          const pharmacist = await Pharmacist.findOne({ accountId });
          if (pharmacist) {
            socket.join(`pharmacy_${pharmacist._id}`);
          }
        } catch (e) {
          logger.error('Error joining pharmacy socket room:', e.message);
        }
      }
    } else {
      logger.info(`Anonymous socket connected (Socket ID: ${socket.id})`);
    }

    // Client can also manually subscribe to a pharmacy room with their pharmacy ID
    socket.on('join_pharmacy', (pharmacyId) => {
      if (pharmacyId) {
        socket.join(`pharmacy_${pharmacyId}`);
        logger.info(`Socket ${socket.id} joined pharmacy_${pharmacyId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get the active Socket.IO instance
 */
function getIO() {
  return io;
}

/**
 * Emit event to a specific user account room
 */
function emitToUser(accountId, event, data) {
  if (!io) return;
  io.to(`user_${accountId}`).emit(event, data);
}

/**
 * Emit event to a specific pharmacy room
 */
function emitToPharmacy(pharmacyId, event, data) {
  if (!io) return;
  io.to(`pharmacy_${pharmacyId}`).emit(event, data);
  // Also emit to all connected pharmacists as fallback
  io.to('role_PHARMACIST').emit(event, data);
}

/**
 * Emit event to all users with a specific role
 */
function emitToRole(role, event, data) {
  if (!io) return;
  io.to(`role_${role}`).emit(event, data);
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToPharmacy,
  emitToRole,
};
