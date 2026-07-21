import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { 
  selectAuthUser, 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectAuthError,
  selectRegistrationData
} from '../store/authSelectors';
import { loginThunk, registerThunk, logoutThunk } from '../store/authActions';
import { clearError, setRegistrationData as setRegData, clearRegistrationData as clearRegData } from '../store/authSlice';
import { useTranslation } from "@/shared/lib/i18nContext";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { t, locale, dir } = useTranslation();
  
  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const registrationData = useSelector(selectRegistrationData);

  const login = useCallback((credentials) => {
    return dispatch(loginThunk(credentials));
  }, [dispatch]);

  const register = useCallback((userData) => {
    return dispatch(registerThunk(userData));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutThunk());
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setRegistrationData = useCallback((data) => {
    dispatch(setRegData(data));
  }, [dispatch]);

  const clearRegistrationData = useCallback(() => {
    dispatch(clearRegData());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
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