import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caregiverService } from '../services/caregiverService';

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const CAREGIVER_KEYS = {
  profile:              ['caregiver', 'profile'],
  relationships:        ['caregiver', 'relationships'],
  patientMedications:   (patientId) => ['caregiver', 'patient', patientId, 'medications'],
  patientDoses:         (patientId, dateStr) => ['caregiver', 'patient', patientId, 'doses', dateStr],
  patientConditions:    (patientId) => ['caregiver', 'patient', patientId, 'conditions'],
  patientRefillOrders:  (patientId) => ['caregiver', 'patient', patientId, 'refills'],
  patient:              (patientId) => ['caregiver', 'patient', patientId],
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useCaregiverProfileQuery(options = {}) {
  return useQuery({
    queryKey: CAREGIVER_KEYS.profile,
    queryFn: async () => {
      const res = await caregiverService.getProfile();
      return res?.success ? res.data : res;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useUpdateCaregiverProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => caregiverService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.profile });
    },
  });
}

// ─── Relationships ────────────────────────────────────────────────────────────

/**
 * List this caregiver's linked patient relationships.
 * The `permissions` object on each relationship reflects the
 * 10-key canonical permission set from the backend.
 */
export function useCaregiverRelationshipsQuery(status) {
  return useQuery({
    queryKey: [...CAREGIVER_KEYS.relationships, status || 'all'],
    queryFn: async () => {
      const res = await caregiverService.getRelationships(status);
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 1000 * 60 * 2,
  });
}

/** Accept or reject a pending relationship invitation. */
export function useUpdateRelationshipStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ relationshipId, status }) =>
      caregiverService.updateRelationshipStatus(relationshipId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.relationships });
    },
  });
}

/** Send a care-relationship invitation to a patient. */
export function useSendCaregiverInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetEmail, relation }) =>
      caregiverService.sendInvitation(targetEmail, relation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.relationships });
    },
  });
}

// ─── Patient Medications ─────────────────────────────────────────────────────

/**
 * List a linked patient's medications.
 * Gate in UI with: relationship.permissions.canViewMedications
 */
export function usePatientMedicationsQuery(patientId) {
  return useQuery({
    queryKey: CAREGIVER_KEYS.patientMedications(patientId),
    queryFn: async () => {
      if (!patientId) return [];
      const res = await caregiverService.getPatientMedications(patientId);
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Add a medication for a linked patient.
 * Gate in UI with: relationship.permissions.canAddMedication
 */
export function useAddPatientMedicationMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId: pid, payload }) =>
      caregiverService.addPatientMedication(pid ?? patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientMedications(patientId) });
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patient(patientId) });
    },
  });
}

/**
 * Update an existing medication for a linked patient.
 * Gate in UI with: relationship.permissions.canEditMedication
 */
export function useUpdatePatientMedicationMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, payload }) =>
      caregiverService.updateMedication(medicationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientMedications(patientId) });
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patient(patientId) });
    },
  });
}

/**
 * Delete a medication for a linked patient.
 * Gate in UI with: relationship.permissions.canDeleteMedication
 */
export function useDeletePatientMedicationMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medicationId) =>
      caregiverService.deletePatientMedication(medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientMedications(patientId) });
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patient(patientId) });
    },
  });
}

// ─── Patient Dose Schedule ───────────────────────────────────────────────────

/**
 * Get a linked patient's daily dose schedule.
 * Gate in UI with: relationship.permissions.canViewDoseSchedule
 */
export function usePatientDosesQuery(patientId, dateStr) {
  return useQuery({
    queryKey: CAREGIVER_KEYS.patientDoses(patientId, dateStr),
    queryFn: async () => {
      if (!patientId) return [];
      const res = await caregiverService.getPatientDoses(patientId, dateStr);
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60,
  });
}

/**
 * Confirm a dose on behalf of a linked patient.
 * Gate in UI with: relationship.permissions.canConfirmDose
 */
export function useConfirmCaregiverDoseMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseEventId }) =>
      caregiverService.confirmDose(doseEventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patient(patientId) });
    },
  });
}

/**
 * Skip a dose on behalf of a linked patient.
 * Gate in UI with: relationship.permissions.canConfirmDose
 */
export function useSkipCaregiverDoseMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseEventId }) =>
      caregiverService.skipDose(doseEventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patient(patientId) });
    },
  });
}

// ─── Patient Medical Conditions ──────────────────────────────────────────────

/**
 * List a linked patient's medical conditions.
 * Gate in UI with: relationship.permissions.canViewMedicalRecords
 */
export function usePatientConditionsQuery(patientId) {
  return useQuery({
    queryKey: CAREGIVER_KEYS.patientConditions(patientId),
    queryFn: async () => {
      if (!patientId) return [];
      const res = await caregiverService.getPatientConditions(patientId);
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Add a medical condition for a linked patient.
 * Gate in UI with: relationship.permissions.canEditMedicalRecords
 */
export function useAddPatientConditionMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId: pid, payload }) =>
      caregiverService.addPatientCondition(pid ?? patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientConditions(patientId) });
    },
  });
}

/**
 * Update a medical condition for a linked patient.
 * Gate in UI with: relationship.permissions.canEditMedicalRecords
 */
export function useUpdatePatientConditionMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conditionId, payload }) =>
      caregiverService.updatePatientCondition(conditionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientConditions(patientId) });
    },
  });
}

/**
 * Delete a medical condition for a linked patient.
 * Gate in UI with: relationship.permissions.canEditMedicalRecords
 */
export function useDeletePatientConditionMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conditionId) =>
      caregiverService.deletePatientCondition(conditionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientConditions(patientId) });
    },
  });
}

// ─── Refill Orders ───────────────────────────────────────────────────────────

/**
 * List refill orders for a linked patient.
 * Gate in UI with: relationship.permissions.canOrderRefills
 */
export function usePatientRefillOrdersQuery(patientId) {
  return useQuery({
    queryKey: CAREGIVER_KEYS.patientRefillOrders(patientId),
    queryFn: async () => {
      if (!patientId) return [];
      const res = await caregiverService.getPatientRefillOrders(patientId);
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    enabled: Boolean(patientId),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Create a refill order for a linked patient.
 * Gate in UI with: relationship.permissions.canOrderRefills
 */
export function useCreatePatientRefillOrderMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId: pid, payload }) =>
      caregiverService.createRefillOrder(pid ?? patientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientRefillOrders(patientId) });
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.patientMedications(patientId) });
    },
  });
}
