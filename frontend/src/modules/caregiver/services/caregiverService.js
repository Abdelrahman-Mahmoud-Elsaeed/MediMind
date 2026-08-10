import apiClient from '@/shared/lib/apiClient';

export const caregiverService = {
  // Caregiver Profile
  getProfile: async () => {
    const res = await apiClient.get('/profiles/caregiver/me');
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await apiClient.put('/profiles/caregiver/me', payload);
    return res.data;
  },

  // Patient Relationships (Roster of Patients)
  getRelationships: async (status) => {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient.get(`/relationships${query}`);
    return res.data;
  },

  updateRelationshipStatus: async (relationshipId, status) => {
    const res = await apiClient.patch(`/relationships/${relationshipId}/status`, { status });
    return res.data;
  },

  // Patient Medications (for a specific linked patient)
  getPatientMedications: async (patientId) => {
    const res = await apiClient.get(`/medications?patientId=${patientId}`);
    return res.data;
  },

  // Patient Daily Dose Schedule (for a specific linked patient)
  getPatientDoses: async (patientId, dateStr) => {
    const queryDate = dateStr || new Date().toISOString().split('T')[0];
    const res = await apiClient.get(`/doses?patientId=${patientId}&date=${queryDate}`);
    return res.data;
  },

  // Confirm dose on behalf of patient
  confirmDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/confirm`);
    return res.data;
  },

  // Skip dose on behalf of patient
  skipDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/skip`);
    return res.data;
  },

  // Patient Medical Conditions
  getPatientConditions: async (patientId) => {
    const res = await apiClient.get(`/conditions?patientId=${patientId}`);
    return res.data;
  },
};
