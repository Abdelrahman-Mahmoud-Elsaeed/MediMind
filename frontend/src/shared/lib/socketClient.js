import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

/**
 * Returns or initializes the singleton Socket.IO client instance with JWT authentication.
 * @param {string} [token] - JWT access token
 * @returns {import('socket.io-client').Socket|null}
 */
export function getSocket(token) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

  if (!authToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    return null;
  }

  // If token changed or socket disconnected, create/re-connect
  if (!socket || currentToken !== authToken) {
    if (socket) {
      socket.disconnect();
    }

    currentToken = authToken;
    socket = io(SOCKET_URL, {
      auth: {
        token: authToken,
      },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  if (socket && !socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Disconnects and destroys the active socket connection.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
