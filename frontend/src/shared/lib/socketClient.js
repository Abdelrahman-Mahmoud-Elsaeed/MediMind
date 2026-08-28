import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

/**
 * Resolves the backend base URL for Socket.IO connection.
 * Correctly strips REST paths (like /api/v1) to prevent 404 handshake failures.
 */
export function getCleanSocketUrl() {
  let url =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (url && typeof url === 'string') {
    url = url.trim().replace(/^["']|["']$/g, '');

    // Convert ws:// and wss:// to http:// and https:// for socket.io client
    if (url.startsWith('ws://')) url = 'http://' + url.slice(5);
    if (url.startsWith('wss://')) url = 'https://' + url.slice(6);

    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url);
        // If URL includes an API path like /api/v1, use its origin (base host & port)
        if (parsed.pathname && parsed.pathname.includes('/api')) {
          return parsed.origin;
        }
        return url.replace(/\/+$/, '');
      }
    } catch {
      // Ignore URL parsing errors and fallback
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
 * @param {string} [token] - Optional JWT access token (defaults to localStorage accessToken)
 * @returns {import('socket.io-client').Socket|null}
 */
export function getSocket(token) {
  if (typeof window === 'undefined') return null;

  const rawToken = token || localStorage.getItem('accessToken');

  if (!rawToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
      currentToken = null;
    }
    return null;
  }

  const cleanToken = rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken.trim();

  // If token changed or socket instance doesn't exist, create a fresh connection
  if (!socket || currentToken !== cleanToken) {
    if (socket) {
      socket.disconnect();
    }

    currentToken = cleanToken;

    socket = io(SOCKET_URL, {
      auth: {
        token: cleanToken,
      },
      extraHeaders: {
        Authorization: `Bearer ${cleanToken}`,
      },
      query: {
        token: cleanToken,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Socket.IO] Connected successfully (ID: ${socket.id})`);
      }
    });

    socket.on('connect_error', (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Socket.IO] Connection error:', error.message);
      }
    });

    socket.on('reconnect_attempt', () => {
      // Sync fresh token from storage on reconnect attempt
      const latestToken = localStorage.getItem('accessToken');
      if (latestToken) {
        const cleanLatest = latestToken.startsWith('Bearer ') ? latestToken.slice(7).trim() : latestToken.trim();
        socket.auth = { token: cleanLatest };
        if (socket.io?.opts?.extraHeaders) {
          socket.io.opts.extraHeaders.Authorization = `Bearer ${cleanLatest}`;
        }
      }
    });

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Socket.IO] Disconnected:', reason);
      }
    });
  }

  if (socket && !socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Checks whether the socket is currently connected.
 * @returns {boolean}
 */
export function isSocketConnected() {
  return Boolean(socket && socket.connected);
}

/**
 * Re-connects the socket with fresh credentials.
 * @param {string} [token]
 * @returns {import('socket.io-client').Socket|null}
 */
export function reconnectSocket(token) {
  disconnectSocket();
  return getSocket(token);
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

