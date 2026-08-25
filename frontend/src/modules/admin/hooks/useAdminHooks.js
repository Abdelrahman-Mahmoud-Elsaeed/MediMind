import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';

export const ADMIN_KEYS = {
  pendingApprovals: ['admin', 'pending-approvals'],
  accounts: ['admin', 'accounts'],
};

export function usePendingApprovals() {
  return useQuery({
    queryKey: ADMIN_KEYS.pendingApprovals,
    queryFn: () => adminApi.getPendingApprovals(),
  });
}

export function useAllAccounts() {
  return useQuery({
    queryKey: ADMIN_KEYS.accounts,
    queryFn: () => adminApi.getAllAccounts(),
  });
}

export function useVerifyDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.verifyDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.pendingApprovals });
    },
  });
}

export function useVerifyPharmacist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.verifyPharmacist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.pendingApprovals });
    },
  });
}

export function useVerifyCaregiver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.verifyCaregiver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.pendingApprovals });
    },
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive, reason }) => adminApi.updateAccountStatus(id, isActive, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.accounts });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.pendingApprovals });
    },
  });
}

export function useRegisterProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminApi.registerProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.accounts });
    },
  });
}

export function useRegisterProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminApi.registerProfessional(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.accounts });
    },
  });
}
