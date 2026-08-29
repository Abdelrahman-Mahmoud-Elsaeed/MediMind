import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { getSocket } from '@/shared/lib/socketClient';
import { showNotification } from '@/shared/components/ui/toast';

import { notificationService } from '@/shared/services/notificationService';

export const NOTIFICATION_KEYS = {
  all: ['notifications'],
};

/**
 * Custom hook that manages real-time notifications via Socket.IO
 * combined with persistent DB storage from the backend.
 */
export function useSocketNotifications() {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('accessToken'));

  // 1. Load persisted notifications from DB on initial load / reconnect
  const notificationsQuery = useQuery({
    queryKey: NOTIFICATION_KEYS.all,
    queryFn: async () => {
      const data = await notificationService.getNotifications();
      return Array.isArray(data) ? data : [];
    },
    enabled: hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Pre-unlock audio domain permission on first user interaction anywhere on page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unlockAudio = () => {
      try {
        const silentAudio = new Audio('/sounds/mixkit-long-pop-2358.wav');
        silentAudio.volume = 0;
        silentAudio.play().catch(() => {});
      } catch (e) {}
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // 2. Real-Time Socket.IO Listener Setup & Cleanup
  useEffect(() => {
    if (!hasToken) return;

    const token = localStorage.getItem('accessToken');
    const socket = getSocket(token);

    if (!socket) return;

    const handleNewNotification = (newNotif) => {
      const isAr =
        typeof document !== 'undefined' &&
        (document.documentElement.dir === 'rtl' ||
          document.dir === 'rtl' ||
          document.documentElement.getAttribute('lang') === 'ar');

      const title = isAr && newNotif.titleAr ? newNotif.titleAr : newNotif.title;
      const message = isAr && newNotif.messageAr ? newNotif.messageAr : newNotif.message;

      showNotification({
        title,
        message,
        type: newNotif.type === 'RELATIONSHIP_REJECTED' ? 'warning' : 'info',
        isRtl: isAr,
      });

      // Prepend new notification into React Query cache immediately
      queryClient.setQueryData(NOTIFICATION_KEYS.all, (oldData = []) => {
        const list = Array.isArray(oldData) ? oldData : [];
        const exists = list.some((item) => item.id === newNotif.id || item.notificationId === newNotif.id);
        if (exists) return list;
        return [newNotif, ...list];
      });

      // Invalidate relevant queries so UI updates instantly across all views
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      queryClient.invalidateQueries({ queryKey: ['refillOrders'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['patient', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'relationships'] });
    };

    // Listener for relationship status changes
    const handleRelationshipUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    };

    const handleRefillOrderEvent = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['refillOrders'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification', handleNewNotification);
    socket.on('relationship:updated', handleRelationshipUpdated);
    socket.on('new_refill_order', handleRefillOrderEvent);
    socket.on('refill_status_updated', handleRefillOrderEvent);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification', handleNewNotification);
      socket.off('relationship:updated', handleRelationshipUpdated);
      socket.off('new_refill_order', handleRefillOrderEvent);
      socket.off('refill_status_updated', handleRefillOrderEvent);
    };
  }, [hasToken, queryClient]);

  // 3. Mark Single Notification as Read Mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const data = await notificationService.markAsRead(notificationId);
      return data;
    },
    onSuccess: (data, notificationId) => {
      queryClient.setQueryData(NOTIFICATION_KEYS.all, (oldData = []) => {
        if (!Array.isArray(oldData)) return [];
        return oldData.map((n) =>
          n.id === notificationId || n.notificationId === notificationId
            ? { ...n, isRead: true }
            : n
        );
      });
    },
  });

  // 4. Mark All Notifications as Read Mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const data = await notificationService.markAllAsRead();
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(NOTIFICATION_KEYS.all, (oldData = []) => {
        if (!Array.isArray(oldData)) return [];
        return oldData.map((n) => ({ ...n, isRead: true }));
      });
    },
  });

  // 5. Delete Notification Mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      const data = await notificationService.deleteNotification(notificationId);
      return data;
    },
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(NOTIFICATION_KEYS.all, (oldData = []) => {
        if (!Array.isArray(oldData)) return [];
        return oldData.filter(
          (n) => n.id !== notificationId && n.notificationId !== notificationId && n._id !== notificationId
        );
      });
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: (id) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    deleteNotification: (id) => deleteNotificationMutation.mutate(id),
  };
}
