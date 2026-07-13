/**
 * API Client — وفاء (Wafa) Frontend
 *
 * Centralized Axios-like client for all backend API calls.
 * Handles JWT access token, refresh cookie, and error normalization.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Token storage (in localStorage on client, in memory on server)
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('wafa_access_token', token);
    else localStorage.removeItem('wafa_access_token');
  }
};

export const getAccessToken = () => {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('wafa_access_token');
  }
  return accessToken;
};

/**
 * Make an API request
 * @param {String} path - API path (e.g., '/auth/send-otp')
 * @param {Object} options - { method, body, headers, noAuth }
 */
export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    noAuth = false,
    isFormData = false
  } = options;

  const url = `${API_BASE_URL}${path}`;

  const finalHeaders = {
    ...headers
  };

  if (!noAuth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  if (body && !isFormData) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    method,
    headers: finalHeaders,
    credentials: 'include' // Important: send HttpOnly refresh cookie
  };

  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  let response = await fetch(url, fetchOptions);

  // Auto-refresh on 401
  if (response.status === 401 && !noAuth) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry original request
      finalHeaders['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...fetchOptions, headers: finalHeaders });
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Request failed');
    error.status = response.status;
    error.code = data?.error?.code;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Refresh the access token using the HttpOnly cookie
 */
async function refreshToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.data.accessToken);
      return true;
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
  }
  return false;
}

// ===== Convenience methods =====
export const api = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' })
};

// ===== Auth API =====
export const authApi = {
  sendOtp: (phone, channel = 'sms') => api.post('/auth/send-otp', { phone, channel }, { noAuth: true }),
  verifyOtp: (phone, code, extra = {}) => api.post('/auth/verify-otp', { phone, code, ...extra }, { noAuth: true }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// ===== Medications API =====
export const medicationsApi = {
  list: (patientId) => api.get(`/medications${patientId ? `?patientId=${patientId}` : ''}`),
  get: (id) => api.get(`/medications/${id}`),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  refill: (id, newQuantity) => api.post(`/medications/${id}/refill`, { newQuantity }),
  deactivate: (id) => api.delete(`/medications/${id}`),
  refillNeeded: (patientId) => api.get(`/medications/refill-needed?patientId=${patientId}`),
  expiringSoon: (patientId) => api.get(`/medications/expiring-soon?patientId=${patientId}`),
  scan: (imageBase64) => api.post('/medications/scan', { imageBase64 })
};

// ===== Doses API =====
export const dosesApi = {
  dailySchedule: (patientId, date) =>
    api.get(`/doses?patientId=${patientId}${date ? `&date=${date}` : ''}`),
  adherence: (patientId, days = 30) =>
    api.get(`/doses/adherence?patientId=${patientId}&days=${days}`),
  confirm: (doseEventId, takenVia = 'PWA') =>
    api.post(`/doses/${doseEventId}/confirm`, { takenVia }),
  skip: (doseEventId, reason = null) =>
    api.post(`/doses/${doseEventId}/skip`, { reason })
};

// ===== Notifications API =====
export const notificationsApi = {
  getVapidKey: () => api.get('/notifications/vapid-public-key'),
  subscribe: (subscription) => api.post('/notifications/subscribe', subscription),
  unsubscribe: (endpoint) => api.post('/notifications/unsubscribe', { endpoint }),
  history: (params = {}) => api.get(`/notifications?${new URLSearchParams(params)}`),
  markClicked: (id) => api.post(`/notifications/${id}/click`),
  sendTest: () => api.post('/notifications/test')
};

// ===== Pharmacy API =====
export const pharmacyApi = {
  dashboard: () => api.get('/pharmacy/dashboard'),
  patients: (params = {}) => api.get(`/pharmacy/patients?${new URLSearchParams(params)}`),
  refillNeeded: () => api.get('/pharmacy/refill-needed'),
  analytics: () => api.get('/pharmacy/analytics'),
  sendRefillReminder: (patientId, medicationId = null) =>
    api.post(`/pharmacy/patients/${patientId}/refill-reminder`, { medicationId })
};

// ===== Doctor API =====
export const doctorApi = {
  dashboard: () => api.get('/doctor/dashboard'),
  patients: (params = {}) => api.get(`/doctor/patients?${new URLSearchParams(params)}`),
  weeklyReportPreview: () => api.get('/doctor/weekly-report-preview'),
  updateReportSettings: (settings) => api.put('/doctor/report-settings', settings),
  // New: Deep reports
  fullReport: (period = 30) => api.get(`/doctor/reports?period=${period}`),
  patientDetail: (patientId, period = 30) =>
    api.get(`/doctor/reports/patients/${patientId}?period=${period}`)
};

// ===== Relationships API (Invitations) =====
export const relationshipsApi = {
  createInvitation: (data) => api.post('/relationships/invite', data),
  getInvitation: (token) => api.get(`/relationships/invitation/${token}`, { noAuth: true }),
  acceptInvitation: (token) => api.post(`/relationships/accept/${token}`),
  getMyRelationships: () => api.get('/relationships'),
  revoke: (relationshipId) => api.delete(`/relationships/${relationshipId}`)
};

// ===== Admin API =====
export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  userGrowth: () => api.get('/admin/user-growth'),
  engagement: () => api.get('/admin/engagement'),
  financials: () => api.get('/admin/financials'),
  users: (params = {}) => api.get(`/admin/users?${new URLSearchParams(params)}`),
  systemHealth: () => api.get('/admin/system-health')
};

// ===== Export API =====
export const exportApi = {
  patientPDF: (patientId, period = 30) => {
    // Returns HTML — open in new window for browser print
    const token = getAccessToken();
    return `${API_BASE_URL}/export/patient/${patientId}/pdf?period=${period}&token=${token}`;
  },
  patientCSV: (patientId, period = 30) =>
    apiRequest(`/export/patient/${patientId}/csv?period=${period}`),
  doctorCSV: (period = 30) =>
    apiRequest(`/export/doctor/csv?period=${period}`)
};

// ===== AI API =====
export const aiApi = {
  insights: () => api.get('/ai/insights'),
  interactions: () => api.get('/ai/interactions'),
  checkNewMedication: (drugName) => api.post('/ai/interactions/check', { drugName }),
  drugInfo: (drugName) => api.get(`/ai/interactions/${encodeURIComponent(drugName)}`),
  predictions: (days = 7) => api.get(`/ai/predictions?days=${days}`),
  smartReminders: () => api.get('/ai/smart-reminders'),
  smartReminderSettings: () => api.get('/ai/smart-reminders/settings')
};
