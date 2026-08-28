// src/config/socket.js
const { socketService } = require('../modules/socket');
const { logger } = require('../shared/utils/logger');

/**
 * Initialize Socket.IO server (delegates to socketService)
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  return socketService.initSocket(httpServer);
}

/**
 * Get the active Socket.IO instance
 */
function getIO() {
  try {
    return socketService.getIO();
  } catch (err) {
    return null;
  }
}

/**
 * Emit event to a specific user account room
 */
function emitToUser(accountId, event, data) {
  if (!accountId) return false;
  return socketService.sendToUser(accountId.toString(), event, data);
}

/**
 * Emit event to multiple user accounts
 */
function emitToUsers(accountIds, event, data) {
  if (!Array.isArray(accountIds)) return false;
  return socketService.sendToUsers(accountIds, event, data);
}

/**
 * Emit event to a specific pharmacy room & pharmacist role
 */
function emitToPharmacy(pharmacyId, event, data) {
  return socketService.sendToPharmacy(pharmacyId, event, data);
}

/**
 * Emit event to all users with a specific role
 */
function emitToRole(role, event, data) {
  return socketService.sendToRole(role, event, data);
}

/**
 * Emit event to a specific room
 */
function emitToRoom(roomName, event, data) {
  return socketService.sendToRoom(roomName, event, data);
}

/**
 * Broadcast event to all connected sockets
 */
function broadcast(event, data) {
  return socketService.broadcast(event, data);
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToUsers,
  emitToPharmacy,
  emitToRole,
  emitToRoom,
  broadcast,
};

