import { apiClient } from '@/shared/lib';

export const authService = {
  async login(email, password) {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const data = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.data.accessToken);
      }

      return data.data;
    } catch (err) {
      const errorObj = err.response?.data?.error;
      if (errorObj?.messages) {
        throw new Error(JSON.stringify(errorObj.messages));
      }
      throw new Error(errorObj?.code || err.message || 'Login failed');
    }
  },

  async register(userData) {
    try {
      const res = await apiClient.post('/auth/register', userData);
      const data = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.data.accessToken);
      }

      return data.data;
    } catch (err) {
      const errorObj = err.response?.data?.error;
      if (errorObj?.messages) {
        throw new Error(JSON.stringify(errorObj.messages));
      }
      throw new Error(JSON.stringify({ en: errorObj?.message || 'Registration failed', ar: errorObj?.message || 'فشل التسجيل' }));
    }
  },

  async logout() {
    try {
      const res = await apiClient.post('/auth/logout');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      return res.status === 200 || res.data?.success;
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      // Even if network logout fails, we consider the local session terminated
      return false;
    }
  },

  getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }

    return data.data;
  },

  async getMe() {
    const res = await apiClient.get(`/auth/me`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data?.error?.messages
          ? JSON.stringify(data.error.messages)
          : JSON.stringify({ en: data?.error?.message || 'Failed to fetch user', ar: data?.error?.message || 'فشل جلب بيانات المستخدم' })
      );
    }

    return data.data;
  }
};

