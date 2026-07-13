# Auth Module

## Module Overview and Purpose

The Auth module handles user authentication flows including registration, login, logout, and token management. This module provides the authentication UI components, hooks for authentication state management, and services for communicating with the backend authentication endpoints. It serves as the entry point for all user sessions and manages the authentication lifecycle.

## Responsibilities and Scope

The Auth module is exclusively responsible for:
- User registration flow (sign up with email, password, role, profile details)
- User login flow (email and password authentication)
- Token management (access token storage, refresh token handling via HttpOnly cookies)
- Logout flow (session termination)
- Authentication state management (user session, loading states, error handling)
- Protected route components (authentication guards)
- Password validation and user input validation

The module does NOT handle:
- Backend authentication logic (handled by backend Auth module)
- Password hashing (handled by backend)
- JWT token generation (handled by backend)
- User profile management (handled by Profile module)
- Authorization/permission checks (handled by backend middleware)

## Features Owned by the Module

### 1. Registration Flow
- Multi-step registration wizard
- Email, password, role selection
- Profile details collection (first name, last name, phone)
- Password strength validation
- Form validation and error handling
- Success/error feedback

### 2. Login Flow
- Email and password input
- Form validation
- Authentication request to backend
- Access token storage
- Session initialization
- Error handling for invalid credentials

### 3. Logout Flow
- Session termination
- Token cleanup
- Redirect to login page
- State reset

### 4. Authentication State
- User session management
- Loading states for async operations
- Error state management
- Protected route components

## Functional Requirements

### FR-A-1: User Registration
- Users must be able to register with email, password, and role
- Users must provide profile details (first name, last name, phone)
- System must validate password strength
- System must validate email format
- System must validate phone number format
- System must handle registration success/error states

### FR-A-2: User Login
- Users must be able to login with email and password
- System must validate credentials with backend
- System must store access token on success
- System must handle login failure with appropriate error messages

### FR-A-3: User Logout
- Users must be able to logout
- System must clear session state
- System must redirect to login page

### FR-A-4: Protected Routes
- System must protect routes that require authentication
- System must redirect unauthenticated users to login
- System must preserve intended destination for post-login redirect

## Business Rules and Validation Rules

### Password Validation
- **Minimum length:** 8 characters
- **Complexity:** Must contain at least one uppercase letter, one lowercase letter, and one number
- **Validation:** Client-side validation before submission
- **Error messages:** Clear feedback for validation failures

### Email Validation
- **Format:** Valid email format
- **Validation:** Client-side validation before submission
- **Error messages:** Clear feedback for invalid email

### Phone Validation
- **Format:** International phone number format (+[country code][number])
- **Validation:** Client-side validation before submission
- **Error messages:** Clear feedback for invalid phone number

### Role Selection
- **Options:** PATIENT, CAREGIVER
- **Required:** User must select a role during registration
- **Default:** No default, explicit selection required

## User Workflows

### Registration Workflow
1. User navigates to registration page
2. User enters email, password, and selects role
3. User enters profile details (first name, last name, phone)
4. System validates form inputs
5. User submits registration form
6. System sends registration request to backend
7. On success: system stores access token, redirects to dashboard
8. On error: system displays error message, user can retry

### Login Workflow
1. User navigates to login page
2. User enters email and password
3. System validates form inputs
4. User submits login form
5. System sends login request to backend
6. On success: system stores access token, redirects to dashboard
7. On error: system displays error message, user can retry

### Logout Workflow
1. User clicks logout button
2. System sends logout request to backend
3. System clears access token
4. System clears authentication state
5. System redirects to login page

## Components

### RegistrationForm
Multi-step form for user registration with validation.

**Props:**
- `onSuccess`: Callback function on successful registration
- `onError`: Callback function on registration error

**State:**
- Form data (email, password, role, firstName, lastName, phone)
- Validation errors
- Loading state
- Current step (for multi-step wizard)

### LoginForm
Form for user login with validation.

**Props:**
- `onSuccess`: Callback function on successful login
- `onError`: Callback function on login error

**State:**
- Form data (email, password)
- Validation errors
- Loading state

### ProtectedRoute
Wrapper component to protect routes requiring authentication.

**Props:**
- `children`: Child components to render if authenticated
- `redirectTo`: Path to redirect if not authenticated (default: /auth)

**Behavior:**
- Checks authentication state
- Renders children if authenticated
- Redirects to login if not authenticated

### LogoutButton
Button component for logout action.

**Props:**
- None

**Behavior:**
- Triggers logout flow on click

## Hooks

### useAuth
Custom hook for authentication state and operations.

**Returns:**
```javascript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: Error | null,
  login: (credentials) => Promise<void>,
  logout: () => Promise<void>,
  register: (userData) => Promise<void>
}
```

**Usage:**
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

## Services

### AuthService
Service layer for authentication API calls.

**Methods:**
- `register(userData)`: POST /api/v1/auth/register
- `login(credentials)`: POST /api/v1/auth/login
- `logout()`: POST /api/v1/auth/logout
- `refreshToken()`: POST /api/v1/auth/refresh
- `getMe()`: GET /api/v1/auth/me

## State Management

### Auth Store
Global state for authentication using Redux/Zustand.

**State:**
```javascript
{
  user: User | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: Error | null
}
```

**Actions:**
- `login(credentials)`: Authenticate user
- `logout()`: Terminate session
- `register(userData)`: Register new user
- `setError(error)`: Set error state
- `clearError()`: Clear error state

## API Integration

### Endpoints Used
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Request/Response Handling
- Access token stored in memory (not localStorage for security)
- Refresh token handled via HttpOnly cookie (managed by backend)
- Axios interceptors for automatic token refresh
- Error handling for 401 unauthorized responses

## Routing

### Routes
- `/auth` - Login page
- `/auth/register` - Registration page
- `/auth/logout` - Logout action

### Navigation
- Redirect to dashboard after successful login/registration
- Redirect to login after logout
- Preserve intended destination for post-login redirect

## Validation

### Client-Side Validation
- Email format validation
- Password strength validation
- Phone number format validation
- Required field validation

### Validation Library
- Uses validation utilities from `shared/validation`
- Form-level validation with clear error messages
- Real-time validation feedback

## Error Handling

### Error States
- Network errors (connection issues)
- Validation errors (invalid input)
- Authentication errors (invalid credentials)
- Server errors (500, etc.)

### Error Display
- User-friendly error messages
- Inline validation errors
- Toast notifications for API errors
- Error boundaries for component errors

## Loading States

### Loading Indicators
- Form submission loading state
- Button disable during submission
- Skeleton loaders for async data
- Progress indicators for multi-step flows

## Accessibility

### A11y Considerations
- Form labels and ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management on form errors
- Color contrast compliance

## Styling

### Component Styling
- Uses shared components from `shared/components`
- Consistent design system
- Responsive design for mobile/desktop
- Theme-aware styling

## Testing

### Unit Tests
- Component rendering tests
- Hook behavior tests
- Service function tests
- Validation logic tests

### Integration Tests
- Registration flow end-to-end
- Login flow end-to-end
- Logout flow end-to-end
- Protected route behavior

### Test Coverage
- Minimum 85% coverage for auth module
- Critical paths (login, register, logout) must have 100% coverage

## Performance Considerations

### Optimization
- Lazy loading of auth components
- Debounced form validation
- Optimized re-renders with memoization
- Efficient state updates

## Security Considerations

### Client-Side Security
- Access token stored in memory (not localStorage)
- No sensitive data in URL parameters
- HTTPS only for production
- XSS prevention (input sanitization)
- CSRF protection (handled by backend)

## Future Enhancements

### Potential Future Work
- Social login (Google, Apple, Facebook)
- Multi-factor authentication (MFA)
- Password reset flow
- Email verification
- Remember me functionality
- Biometric authentication
- Session timeout warnings

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md) - Overall frontend structure
- [Backend Auth Module](../../../backend/src/modules/auth/README.md) - Backend authentication implementation
- [API Specification](../../../artifact/apiSpecificationDesign.md) - Auth API endpoints
- [Security Architecture](../../../artifact/security.md) - Security guidelines
