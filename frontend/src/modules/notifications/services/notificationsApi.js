import apiClient from '@/shared/lib/apiClient';

export const notificationsApi = {
  getNotifications: async (params) => {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data?.data?.unreadCount ?? 0;
  },

  markAsRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data?.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  },
};
