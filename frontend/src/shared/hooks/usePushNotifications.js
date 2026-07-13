/**
 * Push Notification Hook — وفاء (Wafa)
 *
 * React hook that handles:
 *  1. Service worker registration
 *  2. Requesting notification permission
 *  3. Subscribing to push notifications
 *  4. Sending subscription to backend
 *
 * Usage:
 *   const { isSupported, permission, subscribe, unsubscribe } = usePushNotifications();
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/shared/lib/api';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check support
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (!supported) return;

    setPermission(Notification.permission);

    // Register service worker
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] SW registered:', registration.scope);
        // Check existing subscription
        return registration.pushManager.getSubscription();
      })
      .then((subscription) => {
        setIsSubscribed(!!subscription);
      })
      .catch((err) => {
        console.error('[PWA] SW registration failed:', err);
      });
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('تم رفض إذن الإشعارات');
        return false;
      }

      // Get VAPID public key from backend
      const vapidRes = await notificationsApi.getVapidKey();
      const vapidPublicKey = vapidRes.data.publicKey;
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe via service worker
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });

      // Send subscription to backend
      await notificationsApi.subscribe(subscription.toJSON());

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('[PWA] Subscribe failed:', err);
      setError(err.message || 'فشل في تفعيل الإشعارات');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await notificationsApi.unsubscribe(subscription.endpoint);
      }
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('[PWA] Unsubscribe failed:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe
  };
}

/**
 * Convert VAPID base64 URL string to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = typeof window !== 'undefined'
    ? window.atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');

  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
