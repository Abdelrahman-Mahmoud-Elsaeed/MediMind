import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthThunk = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const refreshResult = await authService.refreshToken();
      const accessToken = refreshResult.accessToken;
      const user = await authService.getMe(accessToken);
      return { accessToken, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
