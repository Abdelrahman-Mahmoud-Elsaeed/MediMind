import axios from 'axios';

function getCleanApiUrl() {
  let url = process.env.NEXT_PUBLIC_API_URL;
  if (url && typeof url === 'string') {
    url = url.trim().replace(/^["']|["']$/g, '');
    // If it's a Windows drive letter path (e.g. C:\ or C:/), discard it
    if (!/^[a-zA-Z]:/.test(url)) {
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
        return url;
      }
    }
  }
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return 'http://localhost:8080/api/v1';
}

const API_URL = getCleanApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Sanitize any accidental Windows drive letter in config.url
    if (config.url && typeof config.url === 'string') {
      config.url = config.url.replace(/^[a-zA-Z]:[\\/]+/, '/');
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/token/refresh') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const { authService } = await import('@/modules/auth/services/authService');
        const data = await authService.refreshToken();
        const newToken = data.accessToken;
        
        isRefreshing = false;
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          if (
            !window.location.pathname.startsWith('/login') && 
            !window.location.pathname.startsWith('/register') &&
            window.location.pathname !== '/'
          ) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
