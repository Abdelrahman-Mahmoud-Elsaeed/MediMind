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

    this.io = new Server(httpServer, {
      cors: {
        origin: NODE_ENV === 'production' ? FRONTEND_URL : true,
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
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
    if (!this.io) {
      logger.warn(`Socket.IO not initialized. Cannot emit event '${eventName}' to user ${accountId}.`);
      return false;
    }

    const room = `user:${accountId}`;
    this.io.to(room).emit(eventName, payload);
    logger.debug(`Socket emitted event '${eventName}' to room '${room}'`);
    return true;
  }

  /**
   * Emits a real-time event to multiple users.
   * @param {Array<string>} accountIds
   * @param {string} eventName
   * @param {object} payload
   */
  sendToUsers(accountIds, eventName, payload) {
    if (!Array.isArray(accountIds)) return;
    accountIds.forEach((id) => this.sendToUser(id, eventName, payload));
  }

  /**
   * Emits a real-time event to an arbitrary room name.
   * @param {string} roomName
   * @param {string} eventName
   * @param {object} payload
   */
  sendToRoom(roomName, eventName, payload) {
    if (!this.io) return false;
    this.io.to(roomName).emit(eventName, payload);
    return true;
  }
}

module.exports = new SocketService();
