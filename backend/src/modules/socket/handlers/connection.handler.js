const { logger } = require('../../../shared/utils/logger');

/**
 * Handles individual socket client connection, room joining, and event listeners.
 */
function handleSocketConnection(socket, io) {
  const accountId = socket.accountId;
  const userRoom = `user:${accountId}`;
  const userRoomAlt = `user_${accountId}`;

  // Automatically join user-specific private rooms
  socket.join(userRoom);
  socket.join(userRoomAlt);
  logger.info(`Socket connected: ${socket.id} | Account: ${accountId} | Role: ${socket.role} | Rooms: ${userRoom}, ${userRoomAlt}`);

  // Automatically join role rooms
  if (socket.role) {
    socket.join(`role_${socket.role}`);
    socket.join(`role:${socket.role}`);
  }

  // If Pharmacist, join pharmacy rooms
  if (socket.role === 'PHARMACIST') {
    try {
      const Pharmacist = require('../../auth/models/Pharmacist.model');
      Pharmacist.findOne({ accountId })
        .then((pharmacist) => {
          if (pharmacist) {
            socket.join(`pharmacy_${pharmacist._id}`);
            socket.join(`pharmacy:${pharmacist._id}`);
            logger.info(`Pharmacist socket ${socket.id} joined pharmacy_${pharmacist._id}`);
          }
        })
        .catch((e) => logger.warn(`Failed joining pharmacy socket room: ${e.message}`));
    } catch (e) {
      // Ignore
    }
  }

  // If Patient, join patient-specific domain rooms
  if (socket.role === 'PATIENT') {
    try {
      const Patient = require('../../auth/models/Patient.model');
      Patient.findOne({ accountId })
        .then((patient) => {
          if (patient) {
            socket.join(`patient_${patient._id}`);
            socket.join(`patient:${patient._id}`);
            logger.debug(`Patient socket ${socket.id} joined patient_${patient._id}`);
          }
        })
        .catch((e) => logger.warn(`Failed joining patient socket room: ${e.message}`));
    } catch (e) {
      // Ignore
    }
  }

  // Handle client ping / health check
  socket.on('ping', () => {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      accountId: socket.accountId,
    });
  });

  // Handle client explicit room join request if authorized
  socket.on('join:room', (roomName) => {
    if (
      typeof roomName === 'string' &&
      (roomName.startsWith(`user:${accountId}`) ||
       roomName.startsWith(`user_${accountId}`) ||
       roomName.startsWith(`role:${socket.role}`) ||
       roomName.startsWith(`role_${socket.role}`))
    ) {
      socket.join(roomName);
      logger.debug(`Socket ${socket.id} joined room: ${roomName}`);
    }
  });

  // Handle client room leave request
  socket.on('leave:room', (roomName) => {
    if (typeof roomName === 'string') {
      socket.leave(roomName);
      logger.debug(`Socket ${socket.id} left room: ${roomName}`);
    }
  });

  // Handle socket errors
  socket.on('error', (err) => {
    logger.error(`Socket error on connection ${socket.id}:`, err);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id} | Account: ${accountId} | Reason: ${reason}`);
  });
}

module.exports = { handleSocketConnection };

