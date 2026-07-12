import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { patientService } from "../services/patientService";

// Medications Thunks
export const fetchMedicationsThunk = createAsyncThunk(
  "patient/fetchMedications",
  async (_, { rejectWithValue }) => {
    try {
      const data = await patientService.getMedications();
      return data.success ? data.data : rejectWithValue("Failed to fetch medications");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const addMedicationThunk = createAsyncThunk(
  "patient/addMedication",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await patientService.createMedication(payload);
      return data.success ? data.data : rejectWithValue("Failed to add medication");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

// Doses Thunks
export const fetchDosesThunk = createAsyncThunk(
  "patient/fetchDoses",
  async (dateStr, { rejectWithValue }) => {
    try {
      const data = await patientService.getDoses(dateStr);
      return data.success ? data.data : rejectWithValue("Failed to fetch doses");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const confirmDoseThunk = createAsyncThunk(
  "patient/confirmDose",
  async ({ doseEventId, dateStr }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.confirmDose(doseEventId);
      if (data.success) {
        if (dateStr) dispatch(fetchDosesThunk(dateStr));
        dispatch(fetchMedicationsThunk()); // Update stock quantity
        return doseEventId;
      }
      return rejectWithValue("Failed to confirm dose");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const skipDoseThunk = createAsyncThunk(
  "patient/skipDose",
  async ({ doseEventId, dateStr }, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.skipDose(doseEventId);
      if (data.success) {
        if (dateStr) dispatch(fetchDosesThunk(dateStr));
        return doseEventId;
      }
      return rejectWithValue("Failed to skip dose");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

// Relationships Thunks
export const fetchRelationshipsThunk = createAsyncThunk(
  "patient/fetchRelationships",
  async (_, { rejectWithValue }) => {
    try {
      const data = await patientService.getRelationships();
      return data.success ? data.data : rejectWithValue("Failed to fetch caregivers");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const inviteCaregiverThunk = createAsyncThunk(
  "patient/inviteCaregiver",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.inviteCaregiver(payload);
      if (data.success) {
        dispatch(fetchRelationshipsThunk());
        return data.data;
      }
      return rejectWithValue("Failed to send caregiver invitation");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const revokeRelationshipThunk = createAsyncThunk(
  "patient/revokeRelationship",
  async (relationshipId, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.revokeRelationship(relationshipId);
      if (data.success) {
        dispatch(fetchRelationshipsThunk());
        return relationshipId;
      }
      return rejectWithValue("Failed to revoke relationship");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

// Profiles Thunks
export const fetchProfileThunk = createAsyncThunk(
  "patient/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await patientService.getProfile();
      return data.success ? data.data : rejectWithValue("Failed to fetch profile");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "patient/updateProfile",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.updateProfile(payload);
      if (data.success) {
        dispatch(fetchProfileThunk());
        return data.data;
      }
      return rejectWithValue("Failed to update profile");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

// Conditions Thunks
export const fetchConditionsThunk = createAsyncThunk(
  "patient/fetchConditions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await patientService.getConditions();
      return data.success ? data.data : rejectWithValue("Failed to fetch conditions");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const addConditionThunk = createAsyncThunk(
  "patient/addCondition",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.createCondition(payload);
      if (data.success) {
        dispatch(fetchConditionsThunk());
        return data.data;
      }
      return rejectWithValue("Failed to add condition");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

export const deleteConditionThunk = createAsyncThunk(
  "patient/deleteCondition",
  async (conditionId, { dispatch, rejectWithValue }) => {
    try {
      const data = await patientService.deleteCondition(conditionId);
      if (data.success) {
        dispatch(fetchConditionsThunk());
        return conditionId;
      }
      return rejectWithValue("Failed to delete condition");
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.message);
    }
  }
);

const initialState = {
  medications: [],
  doses: [],
  relationships: [],
  conditions: [],
  profile: null,
  loading: false,
  error: null
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Medications
      .addCase(fetchMedicationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = action.payload;
      })
      .addCase(fetchMedicationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Doses
      .addCase(fetchDosesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDosesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.doses = action.payload;
      })
      .addCase(fetchDosesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Relationships
      .addCase(fetchRelationshipsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelationshipsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.relationships = action.payload;
      })
      .addCase(fetchRelationshipsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Profile
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Conditions
      .addCase(fetchConditionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConditionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.conditions = action.payload;
      })
      .addCase(fetchConditionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;
