import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  medicationApi,
  CreateMedicationDto,
  UpdateMedicationDto,
  CreateRefillOrderDto,
  UpdateRefillStatusDto,
} from '../services/medicationApi';
import { Medication, RefillRequest } from '../types/medication.types';

export const MEDICATION_KEYS = {
  all: ['medications'] as const,
  list: (params?: Record<string, any>) => ['medications', 'list', params] as const,
  detail: (id: string) => ['medications', 'detail', id] as const,
  refills: ['refill-orders'] as const,
};

// 1. List Medications
export function useMedications(params?: Record<string, any>) {
  return useQuery({
    queryKey: MEDICATION_KEYS.list(params),
    queryFn: () => medicationApi.getMedications(params),
  });
}

// 2. Single Medication Detail
export function useMedication(id: string) {
  return useQuery({
    queryKey: MEDICATION_KEYS.detail(id),
    queryFn: () => medicationApi.getMedicationById(id),
    enabled: Boolean(id),
  });
}

// 3. Create Medication
export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMedicationDto) => medicationApi.createMedication(payload),
    onSuccess: (newMedication) => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

// 4. Update Medication (with Optimistic UI Update)
export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMedicationDto }) =>
      medicationApi.updateMedication(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: MEDICATION_KEYS.all });
      const previousMedications = queryClient.getQueryData<Medication[]>(MEDICATION_KEYS.list());

      if (previousMedications) {
        queryClient.setQueryData<Medication[]>(MEDICATION_KEYS.list(), (old) =>
          old ? old.map((m) => (m.id === id ? { ...m, ...payload } as Medication : m)) : []
        );
      }

      return { previousMedications };
    },
    onError: (err, newMed, context) => {
      if (context?.previousMedications) {
        queryClient.setQueryData(MEDICATION_KEYS.list(), context.previousMedications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

// 5. Delete Medication
export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicationApi.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

// 6. Scan Medication Image / Barcode
export function useScanMedication() {
  return useMutation({
    mutationFn: (formData: FormData) => medicationApi.scanMedication(formData),
  });
}

// 7. List Refill Orders
export function useRefillOrders() {
  return useQuery({
    queryKey: MEDICATION_KEYS.refills,
    queryFn: () => medicationApi.getRefillOrders(),
  });
}

// 8. Create Refill Order
export function useCreateRefillOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRefillOrderDto) => medicationApi.createRefillOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.refills });
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.all });
    },
  });
}

// 9. Update Refill Order Status
export function useUpdateRefillStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRefillStatusDto }) =>
      medicationApi.updateRefillStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICATION_KEYS.refills });
    },
  });
}
