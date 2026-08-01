import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  error: null
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    }
  }
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;
