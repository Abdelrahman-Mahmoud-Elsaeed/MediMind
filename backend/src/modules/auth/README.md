# Auth Module

## Module Overview and Purpose

The Auth module is the foundation of the platform's security infrastructure. It owns all identity and session management flows, including user registration, authentication, token lifecycle management, and role-based access control (RBAC). This module is responsible for establishing user identity and providing the security context that all other modules depend on.

## Responsibilities and Scope

The Auth module is exclusively responsible for:
- User registration and account creation
- Password-based authentication and credential verification
- JWT token issuance and validation
- Session management through split-token architecture
- Role assignment and RBAC enforcement
- Account activation/deactivation
- Web push subscription management

The module does NOT handle:
- Business domain logic (medications, conditions, relationships, etc.)
- Profile management (handled by Profiles module)
- Permission delegation (handled by Relationships module)
- Notification delivery (handled by Notifications module)

## Features Owned by the Module

### 1. User Registration
- Creates new user accounts with email and password
- Assigns roles (PATIENT, CAREGIVER, ADMIN)
- Creates corresponding role-specific profiles (Patient/Caregiver)
- Issues initial access and refresh tokens
- Validates email format, password strength, and required fields

### 2. User Authentication
- Verifies user credentials during login
- Checks account active status
- Issues short-lived access tokens (15 minutes)
- Issues long-lived refresh tokens (7 days) via HttpOnly cookies
- Supports automatic token refresh

### 3. Token Management
- Generates JWT access tokens with user identity and role
- Generates JWT refresh tokens for session persistence
- Validates and verifies tokens
- Handles token refresh without user interaction
- Invalidates sessions on logout

### 4. Session Management
- Manages split-token architecture (access token in memory, refresh token in HttpOnly cookie)
- Handles logout and session invalidation
- Clears refresh token cookies securely

### 5. Role-Based Access Control (RBAC)
- Enforces role-based access across all protected endpoints
- Provides authentication middleware for route protection
- Supports role-based authorization (PATIENT, CAREGIVER, ADMIN)
- Attaches user identity to request context for downstream modules

## Functional Requirements

### FR-1.1: User Registration
- Users must be able to register with email, password, role, firstName, lastName, and phone
- Password must be at least 8 characters with uppercase, lowercase, and number
- Email must be unique across the system
- Role must be one of: PATIENT, CAREGIVER, ADMIN
- Registration must create both Account and role-specific Profile records
- Registration must return access token and user identity payload
- Registration must set refresh token as HttpOnly cookie

### FR-1.2: User Authentication
- Users must be able to login with email and password
- System must verify password hash before granting access
- System must check account active status before authentication
- Authentication must return access token and user identity payload
- Authentication must set refresh token as HttpOnly cookie
- Failed authentication must not reveal specific error details

### FR-1.3: Token Refresh
- System must support automatic token refresh using refresh token cookie
- Refresh token must be read from HttpOnly cookie (not from request body)
- Refresh must issue new access token without requiring re-authentication
- Invalid refresh tokens must be rejected with 401 error

### FR-1.4: Logout
- Users must be able to logout and invalidate their session
- Logout must clear refresh token cookie
- Logout must return success confirmation

## Business Rules and Validation Rules

### Password Requirements
- Minimum length: 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Passwords are hashed using bcrypt with salt rounds of 10
- Password hashing is handled by mongoose pre-save hook

### Email Validation
- Must be valid email format
- Must be unique across all accounts
- Stored in lowercase for consistency
- Trimmed of whitespace

### Phone Validation
- Must match international phone format: `^\+?[1-9]\d{1,14}$`
- Required for SMS escalation functionality

### Role Validation
- Must be one of: PATIENT, CAREGIVER, ADMIN
- Role is assigned at registration and cannot be changed through this module
- Role determines access permissions across the platform

### Name Validation
- First and last name must be 2-50 characters
- Trimmed of whitespace

### Account Status
- New accounts are active by default
- Inactive accounts cannot authenticate
- Account deactivation is handled separately (not in scope for MVP)

## User Workflows

### Registration Workflow
1. User submits registration data (email, password, role, firstName, lastName, phone)
2. System validates all fields against schema rules
3. System checks if email already exists
4. System hashes password using bcrypt (mongoose pre-save hook)
5. System creates Account record with role
6. System creates role-specific Profile (Patient or Caregiver)
7. System generates access token (15min expiry) and refresh token (7day expiry)
8. System sets refresh token as HttpOnly, Secure, SameSite=Strict cookie
9. System returns access token and user identity (accountId, role, profileId)

### Login Workflow
1. User submits credentials (email, password)
2. System validates email format
3. System finds Account by email
4. System verifies account is active
5. System compares password hash using bcrypt
6. System generates access token (15min expiry) and refresh token (7day expiry)
7. System sets refresh token as HttpOnly, Secure, SameSite=Strict cookie
8. System returns access token and user identity (accountId, role)

### Token Refresh Workflow
1. Frontend makes request to /auth/refresh
2. Browser automatically sends refresh token via HttpOnly cookie
3. System verifies refresh token signature and expiry
4. System finds Account by accountId from token
5. System verifies account is still active
6. System generates new access token (15min expiry)
7. System returns new access token

### Logout Workflow
1. User triggers logout
2. System clears refresh token cookie (Max-Age=0)
3. System returns success confirmation

## Public APIs

### POST /api/v1/auth/register
**Purpose:** Register a new user account

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securepassword123",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+201000000000"
}
```

**Response Headers:** Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b...",
      "role": "PATIENT",
      "profileId": "64a1c..."
    }
  }
}
```

**Validation Rules:**
- Email: valid email format, unique
- Password: min 8 chars, uppercase, lowercase, number
- Role: PATIENT, CAREGIVER, or ADMIN
- firstName: 2-50 chars
- lastName: 2-50 chars
- phone: international format

### POST /api/v1/auth/login
**Purpose:** Authenticate user with credentials

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securepassword123"
}
```

**Response Headers:** Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b...",
      "role": "PATIENT"
    }
  }
}
```

**Validation Rules:**
- Email: valid email format
- Password: required

### POST /api/v1/auth/refresh
**Purpose:** Refresh access token using refresh token cookie

**Request:** None (token from HttpOnly cookie)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz..."
  }
}
```

### POST /api/v1/auth/logout
**Purpose:** Logout user and invalidate session

**Request:** None

**Response Headers:** Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  }
}
```

### GET /api/v1/auth/me
**Purpose:** Get current user information

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "64a1b...",
    "email": "patient@example.com",
    "role": "PATIENT",
    "isActive": true
  }
}
```

## Data Models and Database Collections

### Account Collection (`accounts`)
Handles authentication, global device subscriptions, and role delegation.

**Schema:**
```javascript
{
  email: String (required, unique, indexed, lowercase, trimmed),
  passwordHash: String (required, hashed by bcrypt pre-save hook),
  role: String (enum: ['PATIENT', 'CAREGIVER', 'ADMIN'], required),
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  isActive: Boolean (default: true)
}
```

**Indexes:**
- Unique index on email
- Default index on _id

**Pre-save Hook:**
- Automatically hashes passwordHash field if modified using bcrypt (salt rounds: 10)

### Patient Collection (`patients`)
Stores patient-specific biological and profile data. Linked 1-to-1 with Account.

**Schema:**
```javascript
{
  accountId: ObjectId (ref: 'Account', required, unique),
  firstName: String (required),
  lastName: String (required),
  phone: String (required),
  dateOfBirth: Date,
  bloodType: String (enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  emergencyContact: {
    name: String,
    phone: String
  }
}
```

**Relationships:**
- One-to-one with Account via accountId

### Caregiver Collection (`caregivers`)
Stores Caregiver-specific data. Linked 1-to-1 with Account.

**Schema:**
```javascript
{
  accountId: ObjectId (ref: 'Account', required, unique),
  firstName: String (required),
  lastName: String (required),
  phone: String (required)
}
```

**Relationships:**
- One-to-one with Account via accountId

## Relationships with Other Modules

### Provides Identity Context To:
- **Profiles Module:** Provides accountId for profile operations
- **Relationships Module:** Provides actor identity for invitation/acceptance flows
- **Conditions Module:** Provides patient context for condition CRUD
- **Medications Module:** Provides patient/caregiver context for medication operations
- **Doses Module:** Provides patient identity for schedule retrieval
- **Notifications Module:** Provides user identity for subscription management
- **Content Module:** Uses role for content publishing (ADMIN only)

### Depends On:
- **Shared Infrastructure:** Validation utilities (Zod), JWT utilities, logging, error handling
- **No Module Dependencies:** Auth is the foundational module with no upstream dependencies

## Dependencies and External Services

### Internal Dependencies
- **bcrypt:** Password hashing (via mongoose pre-save hook and comparison)
- **jsonwebtoken:** JWT token generation and verification
- **zod:** Request validation schemas
- **mongoose:** Database ORM and schema management

### External Services
- **MongoDB Atlas:** Primary data store for accounts and profiles
- **None for authentication:** All auth logic is self-contained

### Environment Variables Required
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_ACCESS_EXPIRY`: Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRY`: Refresh token expiry (default: 7d)
- `NODE_ENV`: Environment (development/production) for cookie security settings

## Background Jobs, Queues, and Scheduled Tasks

None. The Auth module operates synchronously and does not require background processing.

## Configuration and Environment Variables

### JWT Configuration
- `JWT_SECRET`: Cryptographic secret for token signing (required)
- `JWT_ACCESS_EXPIRY`: Access token lifetime (default: "15m")
- `JWT_REFRESH_EXPIRY`: Refresh token lifetime (default: "7d")

### Cookie Configuration
- HttpOnly: true (prevents XSS access)
- Secure: true in production, false in development
- SameSite: strict (prevents CSRF)
- Path: /
- Max-Age: 7 days (for refresh token)

### Rate Limiting
- `/auth/login`: Max 5 attempts per IP per 15 minutes
- `/auth/register`: Max 5 attempts per IP per 15 minutes

## Security and Authorization Requirements

### Split-Token Architecture
- **Access Token:** Stored in frontend memory, 15-minute expiry, used for API authorization via `Authorization: Bearer <TOKEN>` header
- **Refresh Token:** Stored in HttpOnly, Secure, SameSite=Strict cookie, 7-day expiry, inaccessible to JavaScript

### Password Security
- All passwords hashed using bcrypt with salt rounds of 10
- Hashing performed by mongoose pre-save hook (automatic)
- Password comparison using bcrypt.compare()
- Plain text passwords never stored or logged

### RBAC Enforcement
- PATIENT: Can only access their own patientId records
- CAREGIVER: Access granted through Relationships bridge only
- ADMIN: Can access user management and content management

### Rate Limiting
- Auth endpoints rate-limited to prevent brute force attacks
- Global API rate limit: 100 requests per minute per IP

### CORS
- Strict CORS policies enforced
- Only exact frontend URLs permitted in production
- Wildcards (`*`) prohibited in production

## Error Handling Expectations

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Invalid or missing access token
- `INVALID_CREDENTIALS`: Email or password incorrect
- `EMAIL_EXISTS`: Email already registered
- `ACCOUNT_INACTIVE`: Account has been deactivated
- `INVALID_TOKEN`: Refresh token invalid or expired

### Security Considerations
- Do not reveal specific error details for authentication failures
- Log authentication attempts without logging passwords
- Return generic error messages to prevent user enumeration

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log registration events (email, role, timestamp)
- Log login events (email, timestamp, success/failure)
- Log logout events (accountId, timestamp)
- Log token refresh events (accountId, timestamp)
- **Never log passwords, tokens, or sensitive PHI**

### Audit Requirements
- Track who accessed or mutated account records
- Record timestamp, User ID, and action taken
- Maintain immutable logs for security auditing

## Testing Requirements

### Unit Tests
- Password hashing and comparison logic
- Token generation and verification
- Validation schema rules
- Business logic (email uniqueness, account status checks)

### Integration Tests
- POST /auth/register - successful registration
- POST /auth/register - validation errors
- POST /auth/register - duplicate email
- POST /auth/login - successful authentication
- POST /auth/login - invalid credentials
- POST /auth/login - inactive account
- POST /auth/refresh - successful token refresh
- POST /auth/refresh - invalid refresh token
- POST /auth/logout - successful logout
- GET /auth/me - authenticated user retrieval
- GET /auth/me - unauthorized access

### Security Tests
- SQL/NoSQL injection attempts on auth endpoints
- XSS attempts on registration/login
- CSRF protection verification
- Rate limiting enforcement
- Token theft scenarios

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Indexing
- Email field indexed for fast lookup during login
- Unique constraint on email enforced at database level

### Token Operations
- JWT operations are CPU-intensive but fast for typical payload sizes
- Access token verification on every authenticated request
- Refresh token verification only when access token expires

### Password Hashing
- bcrypt with salt rounds of 10 provides good security/performance balance
- Hashing only occurs during registration and password changes
- Comparison is optimized by bcrypt

## Future Enhancements and Planned Features

### Potential Future Work
- Multi-factor authentication (MFA) support
- OAuth/OIDC integration (Google, Apple, etc.)
- Password reset flow via email
- Account email verification
- Session management (multiple active sessions, revoke specific sessions)
- Biometric authentication support
- Account recovery mechanisms
- Enhanced audit logging and compliance reporting

### Out of Scope (Future Phases)
- Social media authentication
- Advanced identity providers
- SAML/SSO integration
- Biometric data storage

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Authentication endpoint details
- [Security Architecture](../../../artifact/security.md) - Split-token architecture and security guidelines
- [Database Schema](../../../artifact/db.md) - Account and profile schema definitions
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
- [Test Guidelines](../../../artifact/test.md) - TDD requirements and coverage standards
