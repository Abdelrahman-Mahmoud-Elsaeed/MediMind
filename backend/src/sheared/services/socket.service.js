const { Server } = require('socket.io');
const { logger } = require('../utils/logger');
const { verifyToken } = require('../utils/jwt.util');

/**
 * Socket.IO Service — وفاء (Wafa)
 *
 * Real-time notifications via WebSockets.
 *
 * Room structure:
 *  - account:{accountId}  — private room per user (notifications)
 *  - patient:{patientId}  — room for everyone monitoring a patient
 *  - pharmacy:{pharmacyId} — pharmacy-specific updates
 *  - doctor:{doctorId}    — doctor-specific updates
 *  - admin                — admin broadcast room
 *
 * Events emitted by server:
 *  - 'notification'        — new notification
 *  - 'dose:confirmed'      — dose confirmed by patient
 *  - 'dose:missed'         — dose marked as missed
 *  - 'medication:added'    — new medication added
 *  - 'medication:refill'   — medication refilled
 *  - 'caregiver:alert'     — caregiver alert triggered
 *  - 'relationship:accepted' — invitation accepted
 */

let io = null;

/**
 * Initialize Socket.IO server and attach to HTTP server
 * @param {http.Server} server - HTTP server instance
 */
function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingInterval: 25000,
    pingTimeout: 60000
  });

  // ===== Authentication middleware =====
  io.use((socket, next) => {
    try {
      // Get token from auth handshake
      const token = socket.handshake.auth?.token ||
                    socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      socket.accountId = decoded.accountId;
      socket.role = decoded.role;
      socket.adminLevel = decoded.adminLevel;

      next();
    } catch (err) {
      logger.warn('Socket auth failed:', err.message);
      next(new Error('Invalid token'));
    }
  });

  // ===== Connection handler =====
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.accountId} (${socket.role})`);

    // Join personal room
    socket.join(`account:${socket.accountId}`);

    // Join role-based rooms
    if (socket.role === 'ADMIN') {
      socket.join('admin');
    }

    // Handle room subscriptions
    socket.on('subscribe', (data) => {
      const { room } = data;

      // Validate room access
      if (canJoinRoom(socket, room)) {
        socket.join(room);
        logger.debug(`Socket ${socket.accountId} joined room: ${room}`);
      } else {
        socket.emit('error', { message: 'Not authorized for this room' });
      }
    });

    socket.on('unsubscribe', (data) => {
      socket.leave(data.room);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.accountId}`);
    });

    // Send welcome
    socket.emit('connected', {
      message: 'متصل بـ وفاء',
      accountId: socket.accountId,
      timestamp: new Date().toISOString()
    });
  });

  logger.info('✅ Socket.IO server initialized');
  return io;
}

/**
 * Check if user can join a specific room
 */
function canJoinRoom(socket, room) {
  // Account can always join their own room
  if (room === `account:${socket.accountId}`) return true;

  // Admins can join any room
  if (socket.role === 'ADMIN') return true;

  // Patient can join their patient room (would need DB lookup for full validation)
  if (room.startsWith('patient:') && socket.role === 'PATIENT') return true;

  // Caregivers can join patient rooms they're linked to (simplified — in prod, verify DB)
  if (room.startsWith('patient:') && socket.role === 'CAREGIVER') return true;

  // Doctors can join their doctor room
  if (room.startsWith('doctor:') && socket.role === 'DOCTOR') return true;

  // Pharmacies can join their pharmacy room
  if (room.startsWith('pharmacy:') && socket.role === 'PHARMACY') return true;

  return false;
}

/**
 * Emit event to a specific account
 * @param {String} accountId - Target account ID
 * @param {String} event - Event name
 * @param {Object} data - Event payload
 */
function emitToAccount(accountId, event, data) {
  if (!io) {
    logger.warn('Socket.IO not initialized — skipping emit');
    return;
  }
  io.to(`account:${accountId}`).emit(event, data);
}

/**
 * Emit event to a patient's monitoring room
 * (notifies all caregivers + doctors monitoring this patient)
 * @param {String} patientId - Patient ID
 * @param {String} event - Event name
 * @param {Object} data - Event payload
 */
function emitToPatientRoom(patientId, event, data) {
  if (!io) return;
  io.to(`patient:${patientId}`).emit(event, data);
}

/**
 * Emit event to a specific pharmacy
 */
function emitToPharmacy(pharmacyId, event, data) {
  if (!io) return;
  io.to(`pharmacy:${pharmacyId}`).emit(event, data);
}

/**
 * Emit event to a specific doctor
 */
function emitToDoctor(doctorId, event, data) {
  if (!io) return;
  io.to(`doctor:${doctorId}`).emit(event, data);
}

/**
 * Broadcast to all admins
 */
function emitToAdmins(event, data) {
  if (!io) return;
  io.to('admin').emit(event, data);
}

/**
 * Get connected clients count
 */
function getConnectedCount() {
  if (!io) return 0;
  return io.engine.clientsCount;
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  return io;
}

module.exports = {
  initSocket,
  emitToAccount,
  emitToPatientRoom,
  emitToPharmacy,
  emitToDoctor,
  emitToAdmins,
  getConnectedCount,
  getIO
};
