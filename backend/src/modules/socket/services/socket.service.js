const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('../middleware/socketAuth.middleware');
const { handleSocketConnection } = require('../handlers/connection.handler');
const { logger } = require('../../../shared/utils/logger');
const { FRONTEND_URL, NODE_ENV } = require('../../../config/env');

class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initializes Socket.IO server attached to HTTP server instance.
   * @param {import('http').Server} httpServer
   */
  initSocket(httpServer) {
    if (this.io) {
      logger.warn('Socket.IO is already initialized.');
      return this.io;
    }

    // Determine allowed CORS origins
    let allowedOrigins = true;
    if (NODE_ENV === 'production' && FRONTEND_URL) {
      if (FRONTEND_URL.includes(',')) {
        allowedOrigins = FRONTEND_URL.split(',').map((url) => url.trim().replace(/\/$/, ''));
      } else {
        allowedOrigins = [FRONTEND_URL.trim().replace(/\/$/, '')];
      }
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 30000,
      pingInterval: 10000,
      connectTimeout: 45000,
    });

    // Register authentication middleware
    this.io.use(socketAuthMiddleware);

    // Register connection handler
    this.io.on('connection', (socket) => {
      handleSocketConnection(socket, this.io);
    });

    logger.info('Socket.IO server successfully initialized and bound.');
    return this.io;
  }

  /**
   * Returns the initialized Socket.IO instance.
   * @returns {import('socket.io').Server}
   */
  getIO() {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized. Call initSocket(httpServer) first.');
    }
    return this.io;
  }

  /**
   * Emits a real-time event to a specific user by their Account ID.
   * @param {string} accountId - Recipient Account ID
   * @param {string} eventName - Socket event name (e.g. 'notification:new')
   * @param {object} payload - Event payload data
   */
  sendToUser(accountId, eventName, payload) {
    if (!this.io || !accountId) {
      logger.warn(`Socket.IO not initialized or missing accountId. Cannot emit '${eventName}' to user ${accountId}.`);
      return false;
    }

    const idStr = accountId.toString();
    this.io.to(`user:${idStr}`).to(`user_${idStr}`).emit(eventName, payload);
    logger.debug(`Socket emitted event '${eventName}' to user '${idStr}'`);
    return true;
  }

  /**
   * Emits a real-time event to multiple users.
   * @param {Array<string>} accountIds
   * @param {string} eventName
   * @param {object} payload
   */
  sendToUsers(accountIds, eventName, payload) {
    if (!Array.isArray(accountIds) || !this.io) return false;
    accountIds.forEach((id) => this.sendToUser(id, eventName, payload));
    return true;
  }

  /**
   * Emits a real-time event to all connected users belonging to a specific role.
   * @param {string} role - Role enum (e.g. 'PHARMACIST', 'PATIENT', 'CAREGIVER')
   * @param {string} eventName
   * @param {object} payload
   */
  sendToRole(role, eventName, payload) {
    if (!this.io || !role) return false;
    this.io.to(`role_${role}`).to(`role:${role}`).emit(eventName, payload);
    logger.debug(`Socket emitted event '${eventName}' to role '${role}'`);
    return true;
  }

  /**
   * Emits a real-time event to a pharmacy room.
   * @param {string} pharmacyId
   * @param {string} eventName
   * @param {object} payload
   */
  sendToPharmacy(pharmacyId, eventName, payload) {
    if (!this.io) return false;
    if (pharmacyId) {
      const idStr = pharmacyId.toString();
      this.io.to(`pharmacy_${idStr}`).to(`pharmacy:${idStr}`).emit(eventName, payload);
    }
    // Also notify pharmacists role channel
    this.io.to('role_PHARMACIST').to('role:PHARMACIST').emit(eventName, payload);
    logger.debug(`Socket emitted event '${eventName}' to pharmacy '${pharmacyId}' and role:PHARMACIST`);
    return true;
  }

  /**
   * Emits a real-time event to an arbitrary room name.
   * @param {string} roomName
   * @param {string} eventName
   * @param {object} payload
   */
  sendToRoom(roomName, eventName, payload) {
    if (!this.io || !roomName) return false;
    this.io.to(roomName).emit(eventName, payload);
    logger.debug(`Socket emitted event '${eventName}' to room '${roomName}'`);
    return true;
  }

  /**
   * Broadcasts a real-time event to all connected sockets.
   * @param {string} eventName
   * @param {object} payload
   */
  broadcast(eventName, payload) {
    if (!this.io) return false;
    this.io.emit(eventName, payload);
    logger.debug(`Socket broadcasted event '${eventName}' to all connected clients`);
    return true;
  }

  /**
   * Gets the total number of connected sockets.
   * @returns {number}
   */
  getConnectedSocketsCount() {
    if (!this.io) return 0;
    return this.io.engine?.clientsCount || 0;
  }

  /**
   * Closes the active Socket.IO server.
   */
  close() {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
  }
}

module.exports = new SocketService();

