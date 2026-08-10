import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caregiverService } from '../services/caregiverService';

export const CAREGIVER_KEYS = {
  profile: ['caregiver', 'profile'],
  relationships: ['caregiver', 'relationships'],
  patientMedications: (patientId) => ['caregiver', 'patient', patientId, 'medications'],
  patientDoses: (patientId, dateStr) => ['caregiver', 'patient', patientId, 'doses', dateStr],
  patientConditions: (patientId) => ['caregiver', 'patient', patientId, 'conditions'],
};

// 1. Caregiver Profile
export function useCaregiverProfileQuery() {
  return useQuery({
    queryKey: CAREGIVER_KEYS.profile,
    queryFn: async () => {
      const res = await caregiverService.getProfile();
      return res?.success ? res.data : res;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateCaregiverProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      return await caregiverService.updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.profile });
    },
  });
}

// 2. Linked Patient Relationships Roster
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

export function useUpdateRelationshipStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ relationshipId, status }) => {
      return await caregiverService.updateRelationshipStatus(relationshipId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAREGIVER_KEYS.relationships });
    },
  });
}

// 3. Patient Medications
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

// 4. Patient Doses Timeline
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

export function useConfirmCaregiverDoseMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseEventId }) => {
      return await caregiverService.confirmDose(doseEventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'patient', patientId] });
    },
  });
}

export function useSkipCaregiverDoseMutation(patientId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseEventId }) => {
      return await caregiverService.skipDose(doseEventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'patient', patientId] });
    },
  });
}

// 5. Patient Conditions
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
