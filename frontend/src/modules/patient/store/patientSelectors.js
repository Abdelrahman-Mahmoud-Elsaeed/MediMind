export const selectPatientState = (state) => state.patient;

export const selectPatientMedications = (state) => state.patient.medications;
export const selectPatientDoses = (state) => state.patient.doses;
export const selectPatientRelationships = (state) => state.patient.relationships;
export const selectPatientConditions = (state) => state.patient.conditions;
export const selectPatientProfile = (state) => state.patient.profile;
export const selectPatientLoading = (state) => state.patient.loading;
export const selectPatientError = (state) => state.patient.error;
