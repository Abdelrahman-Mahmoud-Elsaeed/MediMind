import apiClient from '@/shared/lib/apiClient';

export const adminApi = {
  getPendingApprovals: async () => {
    const response = await apiClient.get('/auth/admin/pending-approvals');
    return response.data?.data || response.data;
  },

  verifyDoctor: async (id) => {
    const response = await apiClient.patch(`/auth/admin/verify/doctor/${id}`);
    return response.data;
  },

  verifyPharmacist: async (id) => {
    const response = await apiClient.patch(`/auth/admin/verify/pharmacist/${id}`);
    return response.data;
  },

  verifyCaregiver: async (id) => {
    const response = await apiClient.patch(`/auth/admin/verify/caregiver/${id}`);
    return response.data;
  },

  getAllAccounts: async () => {
    const response = await apiClient.get('/auth/admin/accounts');
    return response.data?.data || response.data;
  },

  updateAccountStatus: async (id, isActive, reason = '') => {
    const response = await apiClient.patch(`/auth/admin/accounts/${id}/status`, { isActive, reason });
    return response.data;
  },

  registerProvider: async (payload) => {
    const response = await apiClient.post('/auth/admin/register/provider', payload);
    return response.data;
  },

  registerProfessional: async (payload) => {
    const response = await apiClient.post('/auth/admin/register/professional', payload);
    return response.data;
  },
};
