import apiClient from "@/shared/lib/apiClient";

export const patientService = {
  // 1. Patient Profile
  getProfile: async () => {
    const res = await apiClient.get("/profiles/patient/me");
    return res.data?.data ?? res.data;
  },

  updateProfile: async (payload) => {
    const res = await apiClient.put("/profiles/patient/me", payload);
    return res.data?.data ?? res.data;
  },

  // 2. Patient Medications
  getMedications: async () => {
    const res = await apiClient.get("/medications");
    return res.data?.data ?? res.data;
  },

  createMedication: async (payload) => {
    const res = await apiClient.post("/medications", payload);
    return res.data?.data ?? res.data;
  },

  updateMedication: async (id, payload) => {
    const res = await apiClient.put(`/medications/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  deleteMedication: async (id) => {
    const res = await apiClient.delete(`/medications/${id}`);
    return res.data?.data ?? res.data;
  },

  scanPrescription: async (imageBase64) => {
    const res = await apiClient.post("/medications/scan", { imageBase64 });
    return res.data?.data ?? res.data;
  },

  // 3. Medical Conditions
  getConditions: async () => {
    const res = await apiClient.get("/conditions");
    return res.data?.data ?? res.data;
  },

  createCondition: async (payload) => {
    const res = await apiClient.post("/conditions", payload);
    return res.data?.data ?? res.data;
  },

  updateCondition: async (conditionId, payload) => {
    const res = await apiClient.put(`/conditions/${conditionId}`, payload);
    return res.data?.data ?? res.data;
  },

  deleteCondition: async (conditionId) => {
    const res = await apiClient.delete(`/conditions/${conditionId}`);
    return res.data?.data ?? res.data;
  },

  // 4. Patient Doses & Schedule
  getDoses: async (dateStr) => {
    const res = await apiClient.get(`/doses?date=${dateStr}`);
    return res.data?.data ?? res.data;
  },

  confirmDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/confirm`);
    return res.data?.data ?? res.data;
  },

  skipDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/skip`);
    return res.data?.data ?? res.data;
  },

  snoozeDose: async (doseEventId, minutes = 15) => {
    const res = await apiClient.post(`/doses/${doseEventId}/snooze`, { minutes });
    return res.data?.data ?? res.data;
  },

  // 5. Caregiver Relationships
  getRelationships: async () => {
    const res = await apiClient.get("/relationships");
    return res.data?.data ?? res.data;
  },

  inviteCaregiver: async (payload) => {
    const res = await apiClient.post("/relationships/invite", payload);
    return res.data?.data ?? res.data;
  },

  updateRelationshipStatus: async (relationshipId, status) => {
    const res = await apiClient.put(`/relationships/${relationshipId}`, { status });
    return res.data?.data ?? res.data;
  },

  revokeRelationship: async (relationshipId) => {
    const res = await apiClient.delete(`/relationships/${relationshipId}`);
    return res.data?.data ?? res.data;
  },

  // 6. Refill Orders
  getRefillOrders: async () => {
    const res = await apiClient.get("/refill-orders");
    return res.data?.data ?? res.data;
  },

  createRefillOrder: async (payload) => {
    const res = await apiClient.post("/refill-orders", payload);
    return res.data?.data ?? res.data;
  },

  updateRefillStatus: async (id, payload) => {
    const res = await apiClient.put(`/refill-orders/${id}/status`, payload);
    return res.data?.data ?? res.data;
  },
};

export default patientService;
