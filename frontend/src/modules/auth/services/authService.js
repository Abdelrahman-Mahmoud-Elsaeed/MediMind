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
      throw new Error(err.response?.data?.error?.message || err.message || 'Login failed');
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
      throw new Error(err.response?.data?.error?.message || err.message || 'Registration failed');
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
    return null;
  }
};

