import apiClient from "@/shared/lib/apiClient";

export const patientService = {
  // Medications
  getMedications: async () => {
    const res = await apiClient.get("/medications");
    return res.data;
  },

  createMedication: async (payload) => {
    const res = await apiClient.post("/medications", payload);
    return res.data;
  },

  scanPrescription: async (imageBase64) => {
    const res = await apiClient.post("/medications/scan", { imageBase64 });
    return res.data;
  },

  // Doses
  getDoses: async (dateStr) => {
    const res = await apiClient.get(`/doses?date=${dateStr}`);
    return res.data;
  },

  confirmDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/confirm`);
    return res.data;
  },

  skipDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/skip`);
    return res.data;
  },

  // Caregivers & Relationships
  getRelationships: async () => {
    const res = await apiClient.get("/relationships");
    return res.data;
  },

  inviteCaregiver: async (payload) => {
    const res = await apiClient.post("/relationships", payload);
    return res.data;
  },

  revokeRelationship: async (relationshipId) => {
    const res = await apiClient.delete(`/relationships/${relationshipId}`);
    return res.data;
  },

  // Profiles
  getProfile: async () => {
    const res = await apiClient.get("/profiles/patient/me");
    return res.data;
  },

  updateProfile: async (payload) => {
    const res = await apiClient.put("/profiles/patient/me", payload);
    return res.data;
  },

  // Conditions
  getConditions: async () => {
    const res = await apiClient.get("/conditions");
    return res.data;
  },

  createCondition: async (payload) => {
    const res = await apiClient.post("/conditions", payload);
    return res.data;
  },

  deleteCondition: async (conditionId) => {
    const res = await apiClient.delete(`/conditions/${conditionId}`);
    return res.data;
  }
};
