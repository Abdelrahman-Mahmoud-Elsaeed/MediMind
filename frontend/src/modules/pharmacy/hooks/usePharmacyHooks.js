import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmacyApi } from '../services/pharmacyApi';

export const PHARMACY_KEYS = {
  all: ['pharmacy'],
  refills: (params) => ['pharmacy', 'refills', params],
  list: (query) => ['pharmacy', 'list', query],
};

export function useRefillOrders(params) {
  return useQuery({
    queryKey: PHARMACY_KEYS.refills(params),
    queryFn: () => pharmacyApi.getRefillOrders(params),
  });
}

export function usePharmacies(query) {
  return useQuery({
    queryKey: PHARMACY_KEYS.list(query),
    queryFn: () => pharmacyApi.getPharmacies(query),
  });
}

export function useCreateRefillOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => pharmacyApi.createRefillOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHARMACY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useUpdateRefillStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderStatus, pharmacistNotes }) =>
      pharmacyApi.updateRefillStatus(id, { orderStatus, pharmacistNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHARMACY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}
