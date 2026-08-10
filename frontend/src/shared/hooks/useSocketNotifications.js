import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/lib/apiClient';
import { getSocket } from '@/shared/lib/socketClient';

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
      const res = await apiClient.get('/notifications');
      return res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    },
    enabled: hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 2. Real-Time Socket.IO Listener Setup & Cleanup
  useEffect(() => {
    if (!hasToken) return;

    const token = localStorage.getItem('accessToken');
    const socket = getSocket(token);

    if (!socket) return;

    // Listener for new incoming real-time notifications
    const handleNewNotification = (newNotif) => {
      // Prepend new notification into React Query cache immediately
      queryClient.setQueryData(NOTIFICATION_KEYS.all, (oldData = []) => {
        const list = Array.isArray(oldData) ? oldData : [];
        const exists = list.some((item) => item.id === newNotif.id || item.notificationId === newNotif.id);
        if (exists) return list;
        return [newNotif, ...list];
      });

      // Invalidate relationships queries so UI roster/circle updates instantly
      queryClient.invalidateQueries({ queryKey: ['patient', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'relationships'] });
    };

    // Listener for relationship status changes
    const handleRelationshipUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('relationship:updated', handleRelationshipUpdated);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('relationship:updated', handleRelationshipUpdated);
    };
  }, [hasToken, queryClient]);

  // 3. Mark Single Notification as Read Mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const res = await apiClient.patch(`/notifications/${notificationId}/read`);
      return res.data;
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
      const res = await apiClient.patch('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData(NOTIFICATION_KEYS.all, (oldData = []) => {
        if (!Array.isArray(oldData)) return [];
        return oldData.map((n) => ({ ...n, isRead: true }));
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
  };
}
