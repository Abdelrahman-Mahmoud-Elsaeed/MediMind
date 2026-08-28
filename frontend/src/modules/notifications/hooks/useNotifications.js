'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../services/notificationsApi';
import { getSocket } from '@/shared/lib/socketClient';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const NOTIFICATION_KEYS = {
  all: ['notifications'],
  list: (params) => ['notifications', 'list', params],
  unreadCount: ['notifications', 'unread-count'],
};

export function useNotifications(params = {}) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Attach Real-Time Socket.IO listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log('[Socket.IO] Incoming notification received:', data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    };

    const handleNewRefillOrder = (data) => {
      console.log('[Socket.IO] New refill order event:', data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    };

    const handleRefillStatusUpdated = (data) => {
      console.log('[Socket.IO] Refill status updated event:', data);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    };

    const handleRelationshipUpdated = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
      queryClient.invalidateQueries({ queryKey: ['patient', 'relationships'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'relationships'] });
    };

    socket.on('notification', handleNewNotification);
    socket.on('notification:new', handleNewNotification);
    socket.on('new_refill_order', handleNewRefillOrder);
    socket.on('refill_status_updated', handleRefillStatusUpdated);
    socket.on('relationship:updated', handleRelationshipUpdated);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('notification:new', handleNewNotification);
      socket.off('new_refill_order', handleNewRefillOrder);
      socket.off('refill_status_updated', handleRefillStatusUpdated);
      socket.off('relationship:updated', handleRelationshipUpdated);
    };
  }, [isAuthenticated, queryClient]);

  return query;
}

export function useUnreadNotificationCount() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 15,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}
