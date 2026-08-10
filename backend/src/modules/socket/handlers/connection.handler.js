const { logger } = require('../../../shared/utils/logger');

/**
 * Handles individual socket client connection, room joining, and event listeners.
 */
function handleSocketConnection(socket, io) {
  const userRoom = `user:${socket.accountId}`;

  // Automatically join user-specific private room
  socket.join(userRoom);
  logger.info(`Socket connected: ${socket.id} | Account: ${socket.accountId} | Role: ${socket.role} | Room: ${userRoom}`);

  // Handle client ping / health check
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Handle client explicit room join request if needed
  socket.on('join:room', (roomName) => {
    if (typeof roomName === 'string' && roomName.startsWith(`user:${socket.accountId}`)) {
      socket.join(roomName);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id} | Account: ${socket.accountId} | Reason: ${reason}`);
  });
}

module.exports = { handleSocketConnection };
