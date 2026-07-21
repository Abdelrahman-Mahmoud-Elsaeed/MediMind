import { apiClient } from '@/shared/lib';

export const authService = {
  async login(email, password) {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const body = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', body.data.accessToken);
      }

      return body.data;
    } catch (err) {
      // API standard: { success:false, messages:{ en, ar } }
      const messages = err.response?.data?.messages;
      if (messages?.en || messages?.ar) {
        throw new Error(JSON.stringify(messages));
      }
      // Legacy / network error fallback
      const legacyMsg = err.response?.data?.error?.message || err.message || 'Login failed';
      throw new Error(JSON.stringify({ en: legacyMsg, ar: legacyMsg }));
    }
  },

  async register(userData) {
    try {
      const endpoint = userData.email ? '/auth/register/email' : '/auth/register/phone';
      const res = await apiClient.post(endpoint, userData);
      const body = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', body.data.accessToken);
      }

      return body.data;
    } catch (err) {
      // API standard: { success:false, messages:{ en, ar } }
      const messages = err.response?.data?.messages;
      if (messages?.en || messages?.ar) {
        throw new Error(JSON.stringify(messages));
      }
      // Legacy / network error fallback
      const legacyMsg = err.response?.data?.error?.message || err.message || 'Registration failed';
      throw new Error(JSON.stringify({ en: legacyMsg, ar: 'فشل التسجيل' }));
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

