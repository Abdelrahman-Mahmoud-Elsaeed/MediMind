import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useState, useRef } from 'react';
import { selectRegistrationData } from '../store/authSelectors';
import { setRegistrationData as setRegData, clearRegistrationData as clearRegData } from '../store/authSlice';
import { useTranslation } from "@/shared/lib/i18nContext";
import { 
  useAuthUser, 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation 
} from './useAuthQueries';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { t, locale, dir } = useTranslation();

  const { data: user, isLoading, isError, error: userError } = useAuthUser();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const loginMutationRef = useRef(loginMutation);
  loginMutationRef.current = loginMutation;

  const registerMutationRef = useRef(registerMutation);
  registerMutationRef.current = registerMutation;

  const logoutMutationRef = useRef(logoutMutation);
  logoutMutationRef.current = logoutMutation;

  const [localError, setLocalError] = useState(null);

  const registrationData = useSelector(selectRegistrationData);
  const isAuthenticated = Boolean(user);
  const isSubmitting = loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;
  const loading = isSubmitting;
  const isAuthLoading = isLoading;

  const currentError = localError || 
    loginMutation.error?.message || 
    registerMutation.error?.message || 
    logoutMutation.error?.message || 
    (isError ? userError?.message : null);

  const login = useCallback(async (credentials) => {
    setLocalError(null);
    try {
      const data = await loginMutationRef.current.mutateAsync(credentials);
      return { payload: data };
    } catch (err) {
      setLocalError(err.message);
      return { error: err.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLocalError(null);
    try {
      const data = await registerMutationRef.current.mutateAsync(userData);
      return { payload: data };
    } catch (err) {
      setLocalError(err.message);
      return { error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    setLocalError(null);
    try {
      await logoutMutationRef.current.mutateAsync();
      return { payload: null };
    } catch (err) {
      setLocalError(err.message);
      return { error: err.message };
    }
  }, []);

  const resetError = useCallback(() => {
    setLocalError(null);
    loginMutationRef.current.reset();
    registerMutationRef.current.reset();
    logoutMutationRef.current.reset();
  }, []);

  const setRegistrationData = useCallback((data) => {
    dispatch(setRegData(data));
  }, [dispatch]);

  const clearRegistrationData = useCallback(() => {
    dispatch(clearRegData());
  }, [dispatch]);

  return {
    user: user || null,
    isAuthenticated,
    loading,
    isSubmitting,
    isAuthLoading,
    error: currentError,
    registrationData,
    login,
    register,
    logout,
    resetError,
    setRegistrationData,
    clearRegistrationData,
    t,
    locale,
    dir
  };
};