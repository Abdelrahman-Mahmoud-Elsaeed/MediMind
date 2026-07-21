import { createSlice } from '@reduxjs/toolkit';
import { loginThunk, registerThunk, logoutThunk, checkAuthThunk } from './authActions';

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || null;
  }
  return null;
};

const initialToken = getInitialToken();

const initialState = {
  user: null,
  accessToken: initialToken,
  isAuthenticated: Boolean(initialToken),
  loading: Boolean(initialToken),
  error: null,
  registrationData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = Boolean(action.payload.accessToken);
      state.loading = false;
    },
    setRegistrationData: (state, action) => {
      state.registrationData = action.payload;
    },
    clearRegistrationData: (state) => {
      state.registrationData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || action.payload;
        state.accessToken = action.payload?.accessToken || state.accessToken;
        state.isAuthenticated = Boolean(state.accessToken);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || action.payload;
        state.accessToken = action.payload?.accessToken || state.accessToken;
        state.isAuthenticated = Boolean(state.accessToken);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user || action.payload;
        state.accessToken = action.payload?.accessToken || state.accessToken;
        state.isAuthenticated = Boolean(state.accessToken);
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, setCredentials, setRegistrationData, clearRegistrationData } = authSlice.actions;
export default authSlice.reducer;
