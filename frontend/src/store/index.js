import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/store/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});