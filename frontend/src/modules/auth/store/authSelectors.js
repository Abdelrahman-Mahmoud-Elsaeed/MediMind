export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectRegistrationData = (state) => state.auth.registrationData;
