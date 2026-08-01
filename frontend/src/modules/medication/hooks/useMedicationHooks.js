import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '../services/medicationApi';

export const MEDICATION_KEYS = {
  all: ['medications'],
  list: (params) => ['medications', 'list', params],
  detail: (id) => ['medications', 'detail', id],
  refills: ['refill-orders'],
};

/**
 * @param {Record<string, any>} [params]
 */
export function useMedications(params) {
  return useQuery({
    queryKey: MEDICATION_KEYS.list(params),
    queryFn: () => medicationApi.getMedications(params),
  });
}

/**
 * @param {string} id
 */
export function useMedication(id) {
  return useQuery({
    queryKey: MEDICATION_KEYS.detail(id),
    queryFn: () => medicationApi.getMedicationById(id),
    enabled: Boolean(id),
  });
}

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, any>}
 */
export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => medicationApi.createMedication(payload),
    onSuccess: (newMed) => {
      queryClient.setQueryData(MEDICATION_KEYS.list(), (old) => {
        const list = Array.isArray(old) ? old : [];
        return [newMed, ...list];
      });
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, { id: string; payload?: any; data?: any }>}
 */
export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, data }) => medicationApi.updateMedication(id, payload || data),
    onMutate: async ({ id, payload, data }) => {
      const updateData = payload || data;
      await queryClient.cancelQueries({ queryKey: MEDICATION_KEYS.all });
      const previousMedications = queryClient.getQueryData(MEDICATION_KEYS.list());

      if (previousMedications) {
        queryClient.setQueryData(MEDICATION_KEYS.list(), (old) =>
          old ? old.map((m) => (m.id === id || m._id === id ? { ...m, ...updateData } : m)) : []
        );
      }

      return { previousMedications };
    },
    onError: (err, variables, context) => {
      if (context?.previousMedications) {
        queryClient.setQueryData(MEDICATION_KEYS.list(), context.previousMedications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, string>}
 */
export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => medicationApi.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, any>}
 */
export function useScanMedication() {
  return useMutation({
    mutationFn: (payload) => medicationApi.scanMedication(payload),
  });
}

export function useRefillOrders() {
  return useQuery({
    queryKey: MEDICATION_KEYS.refills,
    queryFn: () => medicationApi.getRefillOrders(),
  });
}

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, any>}
 */
export function useCreateRefillOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => medicationApi.createRefillOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.refills });
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

/**
 * @returns {import('@tanstack/react-query').UseMutationResult<any, Error, { id: string; payload?: any; data?: any }>}
 */
export function useUpdateRefillStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, data }) => medicationApi.updateRefillStatus(id, payload || data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.refills });
    },
  });
}
