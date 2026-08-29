import apiClient from '@/shared/lib/apiClient';

export const notificationService = {
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return res.data?.data ?? res.data;
  },

  getUnreadCount: async () => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data?.data ?? res.data;
  },

  markAsRead: async (notificationId) => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res.data?.data ?? res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data?.data ?? res.data;
  },

  deleteNotification: async (notificationId) => {
    const res = await apiClient.delete(`/notifications/${notificationId}`);
    return res.data?.data ?? res.data;
  },
};

export default notificationService;
