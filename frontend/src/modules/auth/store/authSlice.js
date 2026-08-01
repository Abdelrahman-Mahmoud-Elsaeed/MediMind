import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  registrationData: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRegistrationData: (state, action) => {
      state.registrationData = action.payload;
    },
    clearRegistrationData: (state) => {
      state.registrationData = null;
    }
  }
});

export const { clearError, setRegistrationData, clearRegistrationData } = authSlice.actions;
export default authSlice.reducer;
