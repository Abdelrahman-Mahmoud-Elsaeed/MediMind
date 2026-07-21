import { apiClient } from '@/shared/lib';

export const authService = {
  async login(loginPayload, passwordParam) {
    try {
      let bodyData = {};
      if (typeof loginPayload === "object" && loginPayload !== null) {
        if (loginPayload.credentials) {
          bodyData = loginPayload;
        } else {
          const { email, phone, password } = loginPayload;
          bodyData = {
            credentials: {
              ...(email ? { email } : {}),
              ...(phone ? { phone } : {}),
              password: password || passwordParam,
            },
          };
        }
      } else {
        const isEmail = String(loginPayload).includes("@");
        bodyData = {
          credentials: {
            [isEmail ? "email" : "phone"]: loginPayload,
            password: passwordParam,
          },
        };
      }

      const res = await apiClient.post('/auth/login', bodyData);
      const body = res.data;

      if (typeof window !== 'undefined' && body?.data?.accessToken) {
        localStorage.setItem('accessToken', body.data.accessToken);
      }

      return body.data;
    } catch (err) {
      const messages = err.response?.data?.messages;
      if (messages?.en || messages?.ar) {
        throw new Error(JSON.stringify(messages));
      }
      const legacyMsg = err.response?.data?.error?.message || err.message || 'Login failed';
      throw new Error(JSON.stringify({ en: legacyMsg, ar: 'فشل تسجيل الدخول' }));
    }
  },

  async register(userData) {
    try {
      const res = await apiClient.post('/auth/register', userData);
      const body = res.data;

      if (typeof window !== 'undefined' && body?.data?.accessToken) {
        localStorage.setItem('accessToken', body.data.accessToken);
      }

      return body.data || body;
    } catch (err) {
      const messages = err.response?.data?.messages;
      if (messages?.en || messages?.ar) {
        throw new Error(JSON.stringify(messages));
      }
      const legacyMsg = err.response?.data?.error?.message || err.message || 'Registration failed';
      throw new Error(JSON.stringify({ en: legacyMsg, ar: 'فشل التسجيل' }));
    }
  },

  async refreshToken() {
    try {
      const res = await apiClient.post('/auth/token/refresh');
      const body = res.data;

      if (typeof window !== 'undefined' && body?.data?.accessToken) {
        localStorage.setItem('accessToken', body.data.accessToken);
      }

      return body.data;
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      throw err;
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
      return false;
    }
  },

  getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  async getMe() {
    try {
      const res = await apiClient.get('/auth/verify-token');
      const body = res.data;
      return body.data?.user || body.data;
    } catch (err) {
      const messages = err.response?.data?.messages;
      if (messages?.en || messages?.ar) {
        throw new Error(JSON.stringify(messages));
      }
      const legacyMsg = err.response?.data?.error?.message || err.message || 'Failed to fetch user';
      throw new Error(JSON.stringify({ en: legacyMsg, ar: 'فشل جلب بيانات المستخدم' }));
    }
  }
};
