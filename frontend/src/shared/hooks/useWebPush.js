import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);

      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => {
          setIsSubscribed(!!subscription);
        })
        .catch(() => {});
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported by your browser');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied by user');
      }

      // Fetch VAPID public key from backend API
      const response = await apiClient.get('/notifications/vapid-public-key');
      const vapidPublicKey = response?.data?.vapidPublicKey;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not available from server');
      }

      const registration = await navigator.serviceWorker.ready;
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // Send subscription payload to backend
      const subscriptionJSON = subscription.toJSON();
      await apiClient.post('/notifications/push-subscription', {
        endpoint: subscriptionJSON.endpoint,
        keys: subscriptionJSON.keys,
      });

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[WebPush] Error subscribing to push:', err);
      setError(err.message || 'Failed to subscribe to push notifications');
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return false;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await apiClient.delete('/notifications/push-subscription', {
          data: { endpoint },
        });
      }

      setIsSubscribed(false);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('[WebPush] Error unsubscribing:', err);
      setError(err.message || 'Failed to unsubscribe');
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
