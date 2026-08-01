import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patientService';

export const PATIENT_KEYS = {
  all: ['patient'],
  profile: ['patient', 'profile'],
  medications: ['patient', 'medications'],
  doses: (dateStr) => ['patient', 'doses', dateStr],
  relationships: ['patient', 'relationships'],
  conditions: ['patient', 'conditions'],
};

// 1. Patient Profile
export function usePatientProfileQuery() {
  return useQuery({
    queryKey: PATIENT_KEYS.profile,
    queryFn: async () => {
      const res = await patientService.getProfile();
      return res?.success ? res.data : res;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePatientProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await patientService.updateProfile(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.profile });
    },
  });
}

// 2. Patient Medications
export function usePatientMedicationsQuery() {
  return useQuery({
    queryKey: PATIENT_KEYS.medications,
    queryFn: async () => {
      const res = await patientService.getMedications();
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddPatientMedicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await patientService.createMedication(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.medications });
      queryClient.invalidateQueries({ queryKey: ['patient', 'doses'] });
    },
  });
}

export function useScanPrescriptionMutation() {
  return useMutation({
    mutationFn: async (imageBase64) => {
      const res = await patientService.scanPrescription(imageBase64);
      return res;
    },
  });
}

// 3. Patient Doses
export function usePatientDosesQuery(dateStr) {
  return useQuery({
    queryKey: PATIENT_KEYS.doses(dateStr),
    queryFn: async () => {
      if (!dateStr) return [];
      const res = await patientService.getDoses(dateStr);
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    enabled: Boolean(dateStr),
    staleTime: 1000 * 60,
  });
}

export function useConfirmDoseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseEventId }) => {
      const res = await patientService.confirmDose(doseEventId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'doses'] });
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.medications });
    },
  });
}

export function useSkipDoseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseEventId }) => {
      const res = await patientService.skipDose(doseEventId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'doses'] });
    },
  });
}

// 4. Caregiver Relationships
export function usePatientRelationshipsQuery() {
  return useQuery({
    queryKey: PATIENT_KEYS.relationships,
    queryFn: async () => {
      const res = await patientService.getRelationships();
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInviteCaregiverMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await patientService.inviteCaregiver(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.relationships });
    },
  });
}

export function useRevokeRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipId) => {
      const res = await patientService.revokeRelationship(relationshipId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.relationships });
    },
  });
}

export function useUpdatePatientMedicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await patientService.updateMedication(id, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.medications });
      queryClient.invalidateQueries({ queryKey: ['patient', 'doses'] });
    },
  });
}

export function useDeletePatientMedicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await patientService.deleteMedication(id);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.medications });
      queryClient.invalidateQueries({ queryKey: ['patient', 'doses'] });
    },
  });
}

// 5. Patient Conditions
export function usePatientConditionsQuery() {
  return useQuery({
    queryKey: PATIENT_KEYS.conditions,
    queryFn: async () => {
      const res = await patientService.getConditions();
      return res?.success ? res.data : (Array.isArray(res) ? res : []);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddConditionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await patientService.createCondition(payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.conditions });
    },
  });
}

export function useUpdateConditionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conditionId, payload }) => {
      const res = await patientService.updateCondition(conditionId, payload);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.conditions });
    },
  });
}

export function useDeleteConditionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conditionId) => {
      const res = await patientService.deleteCondition(conditionId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.conditions });
    },
  });
}
