'use client';
import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const serverUrl = rawApiUrl.replace(/\/api\/v1\/?$/, '');

    const token = localStorage.getItem('accessToken');

    socket = io(serverUrl, {
      auth: {
        token: token ? `Bearer ${token}` : '',
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to server, ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
};

export const reconnectSocket = (token) => {
  if (socket) {
    if (token) {
      socket.auth = { token: `Bearer ${token}` };
    }
    socket.disconnect().connect();
  } else {
    getSocket();
  }
};
