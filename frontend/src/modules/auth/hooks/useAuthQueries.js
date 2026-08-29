import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import apiClient from '@/shared/lib/apiClient';

export const AUTH_KEYS = {
  user: ['auth', 'user'],
  uniqueness: (param) => ['auth', 'uniqueness', param],
};

// 1. Query: Get Current Authenticated User
export function useAuthUser() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const hasToken = mounted && typeof window !== 'undefined' && Boolean(localStorage.getItem('accessToken'));

  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
      const user = await authService.getMe();
      return user;
    },
    enabled: hasToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

// 2. Mutation: Login
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      const data = await authService.login(credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(AUTH_KEYS.user, data.user);
      } else {
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      }
    },
  });
}

// 3. Mutation: Register
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const data = await authService.register(userData);
      return data;
    },
    onSuccess: (data) => {
      if (data?.user) {
        queryClient.setQueryData(AUTH_KEYS.user, data.user);
      } else {
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      }
    },
  });
}

// 4. Mutation: Logout
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authService.logout();
      return result;
    },
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.clear();
      }
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.clear();
    },
    onError: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.clear();
      }
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.clear();
    },
  });
}

// 5. Mutation: Send OTP Code
export function useSendOtpMutation() {
  return useMutation({
    mutationFn: async ({ target, type }) => {
      const res = await apiClient.post('/auth/otp/send', { target, type });
      return res.data;
    },
  });
}

// 6. Mutation: Verify OTP Code
export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, code }) => {
      const res = await apiClient.post('/auth/otp/verify', { type, code });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
  });
}

// 7. Query: Validate Uniqueness
export function useValidateUniquenessQuery(queryParam, enabled = true) {
  return useQuery({
    queryKey: AUTH_KEYS.uniqueness(queryParam),
    queryFn: async () => {
      if (!queryParam) return null;
      const res = await apiClient.get(`/auth/validate-uniqueness?${queryParam}`);
      return res.data?.data || null;
    },
    enabled: Boolean(enabled && queryParam),
    staleTime: 1000 * 30, // 30 seconds
  });
}
