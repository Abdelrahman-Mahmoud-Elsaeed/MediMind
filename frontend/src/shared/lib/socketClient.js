import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

function getCleanSocketUrl() {
  let url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;
  if (url && typeof url === 'string') {
    url = url.trim().replace(/^["']|["']$/g, '');
    if (!/^[a-zA-Z]:/.test(url) && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ws://') || url.startsWith('wss://'))) {
      return url;
    }
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    return window.location.origin;
  }
  return 'http://localhost:8080';
}

const SOCKET_URL = getCleanSocketUrl();

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
