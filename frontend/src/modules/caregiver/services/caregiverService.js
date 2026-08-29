import apiClient from '@/shared/lib/apiClient';

export const caregiverService = {
  // ─── Caregiver Profile ───────────────────────────────────────────────────────

  getProfile: async () => {
    const res = await apiClient.get('/profiles/caregiver/me');
    return res.data?.data ?? res.data;
  },

  updateProfile: async (payload) => {
    const res = await apiClient.put('/profiles/caregiver/me', payload);
    return res.data?.data ?? res.data;
  },

  // ─── Relationships (Patient Roster) ─────────────────────────────────────────

  /**
   * List all patient relationships for this caregiver.
   * @param {string} [status] - Optional filter: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVOKED'
   */
  getRelationships: async (status) => {
    const query = status && typeof status === 'string' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await apiClient.get(`/relationships${query}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Accept or reject a pending relationship invitation.
   * @param {string} relationshipId
   * @param {'ACCEPTED'|'REJECTED'} status
   */
  updateRelationshipStatus: async (relationshipId, status) => {
    const res = await apiClient.patch(`/relationships/${relationshipId}/status`, { status });
    return res.data?.data ?? res.data;
  },

  /**
   * Send a care-relationship invitation to a patient by email.
   * @param {string} targetEmail - Patient's email address
   * @param {string} relation - e.g. 'son', 'daughter', 'spouse', 'friend'
   */
  sendInvitation: async (targetEmail, relation) => {
    const res = await apiClient.post('/relationships', {
      targetEmail,
      caregiverEmail: targetEmail,
      relation: relation || 'Family Member',
    });
    return res.data?.data ?? res.data;
  },

  // ─── Patient Medications ─────────────────────────────────────────────────────

  /**
   * List a linked patient's medications.
   * Requires canViewMedications on the relationship.
   */
  getPatientMedications: async (patientId) => {
    const res = await apiClient.get(`/medications?patientId=${patientId}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Add a new medication for a linked patient.
   * Requires canAddMedication on the relationship.
   */
  addPatientMedication: async (patientId, payload) => {
    const res = await apiClient.post('/medications', { ...payload, patientId });
    return res.data?.data ?? res.data;
  },

  /**
   * Update an existing medication for a linked patient.
   * Requires canEditMedication on the relationship.
   */
  updateMedication: async (medicationId, payload) => {
    const res = await apiClient.patch(`/medications/${medicationId}`, payload);
    return res.data?.data ?? res.data;
  },

  /**
   * Delete a medication for a linked patient.
   * Requires canDeleteMedication on the relationship.
   */
  deletePatientMedication: async (medicationId) => {
    const res = await apiClient.delete(`/medications/${medicationId}`);
    return res.status === 204 ? { success: true } : (res.data?.data ?? res.data ?? { success: true });
  },

  // ─── Patient Dose Schedule ───────────────────────────────────────────────────

  /**
   * Get a linked patient's daily dose schedule.
   * Requires canViewDoseSchedule on the relationship.
   */
  getPatientDoses: async (patientId, dateStr) => {
    const queryDate = dateStr || new Date().toISOString().split('T')[0];
    const res = await apiClient.get(`/doses?patientId=${patientId}&date=${queryDate}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Confirm a dose on behalf of a linked patient.
   * Requires canConfirmDose on the relationship.
   */
  confirmDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/confirm`);
    return res.data?.data ?? res.data;
  },

  /**
   * Skip a dose on behalf of a linked patient.
   * Requires canConfirmDose on the relationship.
   */
  skipDose: async (doseEventId) => {
    const res = await apiClient.post(`/doses/${doseEventId}/skip`);
    return res.data?.data ?? res.data;
  },

  // ─── Patient Medical Conditions ──────────────────────────────────────────────

  /**
   * List a linked patient's medical conditions.
   * Requires canViewMedicalRecords on the relationship.
   */
  getPatientConditions: async (patientId) => {
    const res = await apiClient.get(`/conditions?patientId=${patientId}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Add a medical condition for a linked patient.
   * Requires canEditMedicalRecords on the relationship.
   */
  addPatientCondition: async (patientId, payload) => {
    const res = await apiClient.post('/conditions', { ...payload, patientId });
    return res.data?.data ?? res.data;
  },

  /**
   * Update a medical condition for a linked patient.
   * Requires canEditMedicalRecords on the relationship.
   */
  updatePatientCondition: async (conditionId, payload) => {
    const res = await apiClient.put(`/conditions/${conditionId}`, payload);
    return res.data?.data ?? res.data;
  },

  /**
   * Delete a medical condition for a linked patient.
   * Requires canEditMedicalRecords on the relationship.
   */
  deletePatientCondition: async (conditionId) => {
    const res = await apiClient.delete(`/conditions/${conditionId}`);
    return res.status === 204 ? { success: true } : (res.data?.data ?? res.data ?? { success: true });
  },

  // ─── Refill Orders ───────────────────────────────────────────────────────────

  /**
   * List refill orders for a linked patient.
   * Requires canOrderRefills on the relationship (for patient-scoped view).
   */
  getPatientRefillOrders: async (patientId) => {
    const res = await apiClient.get(`/medications/refills?patientId=${patientId}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Create a refill order for a linked patient.
   * Requires canOrderRefills on the relationship.
   */
  createRefillOrder: async (patientId, payload) => {
    const res = await apiClient.post('/medications/refills', { ...payload, patientId });
    return res.data?.data ?? res.data;
  },
};
