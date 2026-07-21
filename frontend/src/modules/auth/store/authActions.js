import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (loginPayload, { rejectWithValue }) => {
    try {
      return await authService.login(loginPayload);
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
    const existingToken = authService.getAccessToken();
    if (existingToken) {
      try {
        const user = await authService.getMe();
        return { accessToken: existingToken, user };
      } catch (err) {
        // Token in storage is invalid/expired, try refresh token
      }
    }

    try {
      const refreshResult = await authService.refreshToken();
      const accessToken = refreshResult?.accessToken || authService.getAccessToken();
      const user = await authService.getMe();
      return { accessToken, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
