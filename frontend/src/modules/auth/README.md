# Auth Module

## Module Overview and Purpose

The Auth module handles user authentication flows including registration, login, and logout. This module provides the user interface components, client-side validation logic, state selectors, and asynchronous actions. It serves as the gateway to the MediMind care portal and manages the lifecycle of the user session.

## Responsibilities and Scope

The Auth module is responsible for:
- User registration flow (including Step 1 for account credentials/role selection, and Step 2 for collecting patient/caregiver profile details).
- User login flow (email and password authentication).
- Storing access tokens in `localStorage` to persist sessions on the client side.
- Terminating user sessions during logout.
- Client-side form input validation using Zod.
- Authentication state management using Redux Toolkit.

The module does NOT handle:
- Backend authentication checks, hashing passwords, or generating JWT tokens (delegated to backend service).
- Session middleware or route guarding components (delegated to router configuration).
- User profile editing or updating post-registration (delegated to Profile module).

## Features Owned by the Module

### 1. Multi-Step Registration Flow
- Step 1: Input account credentials (email, password) and select a role (Patient or Caregiver).
- Step 2 (Patient): Collect profile details (first name, last name, phone number, date of birth, blood type, and emergency contact details).
- Step 2 (Caregiver): Collect profile details (first name, last name, phone number).

### 2. Login Flow
- Email and password inputs.
- Real-time client-side inputs verification.
- Session initialization via backend API validation.

### 3. Session Cleanup
- Local session cleanup (clears access tokens from `localStorage`).
- Dispatches a reset of state slices on logout.

## Functional Requirements

### FR-A-1: User Registration
- Users must be able to sign up with a valid email, complex password, and select a role.
- Users must fill in required profile fields (First Name, Last Name, Phone Number).
- System must perform dynamic, live validation on input blur and updates.
- Form submit buttons must remain disabled until all inputs satisfy validation rules.

### FR-A-2: User Login
- Users must be able to log in with their email and password.
- Form submit button must remain disabled until valid formats are entered.
- Handle failure states with visual error banners.

### FR-A-3: User Logout
- Users must be able to log out, terminating their backend session and removing local credentials.

## Business Rules and Validation Rules

### Password Requirements (Step 1 Registration)
- **Minimum length:** 8 characters.
- **Complexity:** Must contain at least one uppercase letter, one lowercase letter, and one number.

### Email Requirements
- Must follow standard email format constraints (`z.string().email()`).

### Name Requirements
- **First Name & Last Name:** Required, minimum length of 2 characters.

### Phone Requirements
- **Phone Number:** Required, minimum length of 10 digits, must conform to standard phone character format (numbers, spaces, hyphens, parentheses).

### Role Requirement
- Role must be explicitly selected as either `patient` or `caregiver` in Step 1.

---

## User Workflows

### Login Workflow
```mermaid
sequenceFlow
  participant User
  participant LoginComponent
  participant AuthActions (loginThunk)
  participant AuthService
  participant ReduxStore
  participant Router

  User->>LoginComponent: Input Email & Password
  LoginComponent->>LoginComponent: Perform validation & enable Sign In button
  User->>LoginComponent: Click Sign In
  LoginComponent->>AuthActions (loginThunk): Dispatch login({ email, password })
  AuthActions (loginThunk)->>AuthService: Call login(email, password)
  AuthService->>AuthService: Send POST request via apiClient
  AuthService->>AuthService: Store accessToken in localStorage
  AuthService-->>AuthActions (loginThunk): Return data
  AuthActions (loginThunk)-->>ReduxStore: Update state (user, accessToken, isAuthenticated)
  LoginComponent->>Router: Redirect to "/dashboard"
```

### Registration Workflow
```mermaid
sequenceFlow
  participant User
  participant Step1Component
  participant Step2Component (Patient/Caregiver)
  participant AuthActions (registerThunk)
  participant AuthService
  participant Router

  User->>Step1Component: Input Email, Password, select Role
  Step1Component->>Step1Component: Validate & click Continue
  Step1Component->>Step2Component (Patient/Caregiver): Route transition and hold temp registrationData
  User->>Step2Component (Patient/Caregiver): Input profile details
  Step2Component (Patient/Caregiver)->>Step2Component (Patient/Caregiver): Validate & click Complete Registration
  Step2Component (Patient/Caregiver)->>AuthActions (registerThunk): Dispatch register(completeData)
  AuthActions (registerThunk)->>AuthService: Call register(completeData)
  AuthService->>AuthService: Send POST request via apiClient
  AuthService->>AuthService: Store accessToken in localStorage
  AuthService-->>AuthActions (registerThunk): Return registered user data
  Step2Component (Patient/Caregiver)->>Router: Redirect to "/dashboard"
```

---

## Components

### LoginComponent
Located at `components/LoginComponent.jsx`. A client component rendering the login form, displaying form errors, and dispatching login actions.
- **Props:** None.
- **State:**
  - `email`, `password` (controlled inputs).
  - `showPassword` (boolean toggling visibility).
  - `touched` (object tracking blurred/interacted inputs).
- **Behavior:**
  - Derives validity and individual field errors dynamically using `loginSchema.safeParse`.
  - Disables submit button until the schema is fully satisfied.

### RegistrationStep1Component
Located at `components/RegistrationStep1Component.jsx`. Renders Step 1 of the sign-up process (Email, Password, and Role selection).
- **Props:** None.
- **State:**
  - `email`, `password`, `role` (controlled inputs).
  - `showPassword` (boolean).
  - `touched` (object tracking blurred/interacted inputs).
- **Behavior:**
  - Derives validity and errors from `registerStep1Schema.safeParse`.
  - On continue, saves inputs in Redux state (`registrationData`) and redirects to Step 2.

### RegistrationPatientComponent
Located at `components/RegistrationPatientComponent.jsx`. Gathers demographic information, optional health metadata (DOB, blood type), and emergency contact information for Patient accounts.
- **Props:** None.
- **State:**
  - `formData` (object holding firstName, lastName, phone, dob, bloodType, emName, emPhone).
  - `touched` (object).

### RegistrationCaregiverComponent
Located at `components/RegistrationCaregiverComponent.jsx`. Collects profile details for Caregiver accounts.
- **Props:** None.
- **State:**
  - `formData` (object holding firstName, lastName, phone).
  - `touched` (object).

---

## Hooks

### useAuth
Located at `hooks/useAuth.js`. A React hook wrapping Redux state selectors and action dispatchers to expose a simplified authentication interface:
- **Exposes:**
  - `user`: Currently authenticated user object.
  - `isAuthenticated`: Boolean status of user session.
  - `loading`: Boolean state for asynchronous thunk operations.
  - `error`: Error messages from API requests.
  - `registrationData`: Temporary registration state held in Redux between Step 1 and Step 2.
  - Action triggers: `login(credentials)`, `register(userData)`, `logout()`, `resetError()`, `setRegistrationData(data)`, and `clearRegistrationData()`.

---

## Services

### authService
Located at `services/authService.js`. Handles communication with auth endpoints:
- **Methods:**
  - `login(email, password)`: Sends `POST /auth/login`. Returns user credentials and saves token.
  - `register(userData)`: Sends `POST /auth/register`. Returns registered credentials.
  - `logout()`: Sends `POST /auth/logout`. Deletes token locally.
  - `getAccessToken()`: Helper retrieving token from storage.

---

## State Management

### Redux State Slice (`authSlice`)
Located at `store/authSlice.js`.
- **Initial State:**
  ```javascript
  {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    registrationData: null,
  }
  ```
- **Sync Reducers:**
  - `clearError`: Resets API errors.
  - `setCredentials`: Manually sets auth credentials.
  - `setRegistrationData`: Sets temporary Step 1 inputs.
  - `clearRegistrationData`: Resets Step 1 inputs.
- **Extra Reducers (Async Actions):**
  - Updates `loading`, `error`, and `user` state fields based on thunk progress (`pending`, `fulfilled`, `rejected`).

---

## API Integration

Auth network calls are handled by the central `apiClient` defined in `@/shared/lib`.
- **Axios Interceptor:** The client interceptor checks `localStorage` and appends the `Authorization: Bearer <token>` header dynamically to all requests.
- **Error Propagation:** Service layer translates raw Axios request failures into explicit JavaScript Error messages.

---

## Routing

Utilizes Next.js App Router folders:
- `/auth/login`: Renders `LoginComponent`.
- `/auth/register`: Renders `RegistrationStep1Component`.
- `/auth/register/patient`: Renders `RegistrationPatientComponent`.
- `/auth/register/caregiver`: Renders `RegistrationCaregiverComponent`.

---

## Validation

- Driven by **Zod** schemas in [authValidation.js](file:///d:/MediMind/frontend/src/modules/auth/validation/authValidation.js).
- **Two-way Validation flow:**
  1. On field blur (`onBlur`), the field name is marked in the `touched` state object.
  2. Errors are calculated dynamically on every render from form state.
  3. If a field has been blurred (is in `touched` state) and has an active validation error, the error is displayed.
  4. The error clears or updates in real time as the user types (`onChange`) and satisfies the schema conditions.
  5. The submit button's active state is bound directly to the validity check (`!isValid`).

---

## Error Handling

- API failures (such as incorrect credentials or duplicate register email) are captured in the Redux store's `error` state.
- Banners display these API messages at the top of forms.
- Client validation errors are displayed inline under individual fields.

---

## Accessibility

- Semantic HTML inputs.
- Field labels reference fields explicitly using `htmlFor`.
- Keyboard-accessible input structures.

---

## Styling

- Structured with Tailwind CSS.
- Color styling is linked to custom CSS theme variables (e.g. `text-error` for warnings, `border-error` for highlighting problematic fields).
- Clean layouts using modern transitions and glassmorphism containers.

---

## Security Considerations

- **Session persistence:** Token is saved to `localStorage` under key `accessToken`.
- **Token clearing:** Logout cleanly deletes the token from local storage and dispatches state resets.
