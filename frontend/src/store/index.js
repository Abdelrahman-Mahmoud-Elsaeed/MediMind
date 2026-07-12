import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';
import patientReducer from '../modules/patient/store/patientSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
  },
});