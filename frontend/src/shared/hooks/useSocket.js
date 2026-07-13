/**
 * useSocket Hook — وفاء (Wafa)
 *
 * Real-time notifications via Socket.IO.
 *
 * Usage:
 *   const { connected, notifications, subscribe, unsubscribe } = useSocket();
 *
 *   useEffect(() => {
 *     subscribe('patient:123', (event, data) => {
 *       console.log('Got event:', event, data);
 *     });
 *   }, []);
 */

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '@/shared/lib/api';
import { io } from 'socket.io-client';

let socket = null;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const handlersRef = useRef({});

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    // Initialize socket connection
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
                       process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
                       'http://localhost:8080';

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // ===== Connection events =====
    socket.on('connect', () => {
      console.log('[Socket] Connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
      setConnected(false);
    });

    // ===== Welcome event =====
    socket.on('connected', (data) => {
      console.log('[Socket] Welcome:', data);
    });

    // ===== Notification event =====
    socket.on('notification', (data) => {
      console.log('[Socket] Notification:', data);
      setNotifications(prev => [
        { ...data, _id: Date.now(), receivedAt: new Date().toISOString() },
        ...prev.slice(0, 49) // keep last 50
      ]);

      // Show browser notification if permission granted
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(data.title || 'وفاء 💊', {
          body: data.body,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: data.tag || 'wafa-rt',
          data: data.data || {}
        });
      }

      // Call registered handlers
      Object.values(handlersRef.current).forEach(handler => {
        try {
          handler('notification', data);
        } catch (err) {
          console.error('[Socket] Handler error:', err);
        }
      });
    });

    // ===== Dose events =====
    socket.on('dose:confirmed', (data) => {
      console.log('[Socket] Dose confirmed:', data);
      Object.values(handlersRef.current).forEach(handler => {
        try { handler('dose:confirmed', data); } catch (err) {}
      });
    });

    socket.on('dose:missed', (data) => {
      console.log('[Socket] Dose missed:', data);
      Object.values(handlersRef.current).forEach(handler => {
        try { handler('dose:missed', data); } catch (err) {}
      });
    });

    // ===== Caregiver alerts =====
    socket.on('caregiver:alert', (data) => {
      console.log('[Socket] Caregiver alert:', data);
      setNotifications(prev => [
        { type: 'CAREGIVER_ALERT', ...data, _id: Date.now(), receivedAt: new Date().toISOString() },
        ...prev.slice(0, 49)
      ]);

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('⚠️ تنبيه: مريضك مخدش الدواء', {
          body: data.body,
          icon: '/icon-192.png',
          tag: `caregiver-${data.doseEventId}`,
          requireInteraction: true
        });
      }

      Object.values(handlersRef.current).forEach(handler => {
        try { handler('caregiver:alert', data); } catch (err) {}
      });
    });

    // ===== Relationship events =====
    socket.on('relationship:accepted', (data) => {
      console.log('[Socket] Relationship accepted:', data);
      Object.values(handlersRef.current).forEach(handler => {
        try { handler('relationship:accepted', data); } catch (err) {}
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  /**
   * Subscribe to a specific room (e.g., 'patient:123')
   * @param {String} room - Room name
   * @param {Function} handler - Event handler
   */
  const subscribe = useCallback((room, handler) => {
    if (!socket || !connected) return;

    const handlerId = room + '_' + Date.now();
    handlersRef.current[handlerId] = handler;

    socket.emit('subscribe', { room });

    return () => {
      socket?.emit('unsubscribe', { room });
      delete handlersRef.current[handlerId];
    };
  }, [connected]);

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    connected,
    notifications,
    subscribe,
    clearNotifications
  };
}
