# Profiles Module

## Module Overview and Purpose

The Profiles module manages user profile details for patients and caregivers, separating personal and contact information from authentication credentials. This module is responsible for storing and retrieving role-specific profile data that supports the core medication management workflows.

## Responsibilities and Scope

The Profiles module is exclusively responsible for:
- Patient profile data management (biological and contact information)
- Caregiver profile data management (contact information)
- Profile-specific metadata (blood type, emergency contacts)
- Profile retrieval and update operations
- Ensuring profile data is separate from authentication credentials

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Caregiver-patient relationships (handled by Relationships module)
- Medical conditions (handled by Conditions module)
- Medication data (handled by Medications module)

## Features Owned by the Module

### 1. Patient Profile Management
- Retrieve patient profile information
- Update patient profile fields (blood type, emergency contact, etc.)
- Store biological data (date of birth, blood type)
- Store emergency contact information

### 2. Caregiver Profile Management
- Retrieve caregiver profile information
- Update caregiver profile fields (contact information)
- Store caregiver contact details

## Functional Requirements

### FR-P-1: Patient Profile Retrieval
- Patients must be able to retrieve their own profile information
- Profile must include firstName, lastName, phone, dateOfBirth, bloodType, emergencyContact
- Only the authenticated patient can access their own profile

### FR-P-2: Patient Profile Update
- Patients must be able to update their profile information
- Updates must be validated against schema rules
- firstName and lastName cannot be updated through this module (set during registration)
- Blood type must be one of the valid options
- Emergency contact information must include name and phone

### FR-P-3: Caregiver Profile Retrieval
- Caregivers must be able to retrieve their own profile information
- Profile must include firstName, lastName, phone
- Only the authenticated caregiver can access their own profile

### FR-P-4: Caregiver Profile Update
- Caregivers must be able to update their profile information
- Updates must be validated against schema rules
- firstName and lastName cannot be updated through this module (set during registration)
- Phone number must match international format

## Business Rules and Validation Rules

### Patient Profile Validation
- **firstName:** 2-50 characters, required (set during registration, not updatable)
- **lastName:** 2-50 characters, required (set during registration, not updatable)
- **phone:** International format `^\+?[1-9]\d{1,14}$`, required (critical for SMS escalation)
- **dateOfBirth:** Valid date, optional
- **bloodType:** Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-
- **emergencyContact.name:** String, optional
- **emergencyContact.phone:** International format, optional if name provided

### Caregiver Profile Validation
- **firstName:** 2-50 characters, required (set during registration, not updatable)
- **lastName:** 2-50 characters, required (set during registration, not updatable)
- **phone:** International format `^\+?[1-9]\d{1,14}$`, required

### Access Control
- Users can only access and modify their own profile
- Profile access is gated by authentication (accountId from JWT token)
- No cross-user profile access allowed

## User Workflows

### Get Patient Profile Workflow
1. User makes GET request to /profiles/patient/me
2. System verifies authentication via access token
3. System extracts accountId from token
4. System finds Patient record by accountId
5. System returns patient profile data

### Update Patient Profile Workflow
1. User makes PUT request to /profiles/patient/me with update payload
2. System verifies authentication via access token
3. System extracts accountId from token
4. System validates update payload against schema rules
5. System finds Patient record by accountId
6. System updates allowed fields (bloodType, emergencyContact, dateOfBirth)
7. System returns updated patient profile data

### Get Caregiver Profile Workflow
1. User makes GET request to /profiles/caregiver/me
2. System verifies authentication via access token
3. System extracts accountId from token
4. System finds Caregiver record by accountId
5. System returns caregiver profile data

### Update Caregiver Profile Workflow
1. User makes PUT request to /profiles/caregiver/me with update payload
2. System verifies authentication via access token
3. System extracts accountId from token
4. System validates update payload against schema rules
5. System finds Caregiver record by accountId
6. System updates allowed fields (phone)
7. System returns updated caregiver profile data

## Public APIs

### GET /api/v1/profiles/patient/me
**Purpose:** Get current patient's profile information

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "64a1c...",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+201000000000",
    "dateOfBirth": "1985-06-15T00:00:00Z",
    "bloodType": "O+",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+201000000001"
    }
  }
}
```

### PUT /api/v1/profiles/patient/me
**Purpose:** Update current patient's profile information

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "bloodType": "A+",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+201000000005"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "64a1c...",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+201000000000",
    "dateOfBirth": "1985-06-15T00:00:00Z",
    "bloodType": "A+",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+201000000005"
    }
  }
}
```

**Validation Rules:**
- bloodType: must be valid blood type enum
- emergencyContact.name: string if provided
- emergencyContact.phone: international format if provided

### GET /api/v1/profiles/caregiver/me
**Purpose:** Get current caregiver's profile information

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "64a1d...",
    "firstName": "Sarah",
    "lastName": "Smith",
    "phone": "+201000000002"
  }
}
```

### PUT /api/v1/profiles/caregiver/me
**Purpose:** Update current caregiver's profile information

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "phone": "+201000000009"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "64a1d...",
    "firstName": "Sarah",
    "lastName": "Smith",
    "phone": "+201000000009"
  }
}
```

**Validation Rules:**
- phone: international format

## Data Models and Database Collections

### Patient Collection (`patients`)
Stores patient-specific biological and profile data. Linked 1-to-1 with Account.

**Schema:**
```javascript
{
  accountId: ObjectId (ref: 'Account', required, unique),
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  phone: String (required, international format),
  dateOfBirth: Date (optional),
  bloodType: String (enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], optional),
  emergencyContact: {
    name: String (optional),
    phone: String (optional, international format if provided)
  }
}
```

**Indexes:**
- Unique index on accountId
- Default index on _id

**Relationships:**
- One-to-one with Account via accountId
- Referenced by Conditions (patientId)
- Referenced by Medications (patientId)
- Referenced by Relationships (patientId)
- Referenced by Dose Events (patientId)

### Caregiver Collection (`caregivers`)
Stores Caregiver-specific data. Linked 1-to-1 with Account.

**Schema:**
```javascript
{
  accountId: ObjectId (ref: 'Account', required, unique),
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  phone: String (required, international format)
}
```

**Indexes:**
- Unique index on accountId
- Default index on _id

**Relationships:**
- One-to-one with Account via accountId
- Referenced by Relationships (caregiverId)

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides accountId for profile identification and authentication context

### Provides Profile Data To:
- **Relationships Module:** Provides patient and caregiver profile context for relationship management
- **Conditions Module:** Provides patient profile context for condition association
- **Medications Module:** Provides patient profile context for medication operations
- **Doses Module:** Provides patient identity for schedule retrieval
- **Notifications Module:** Uses phone number for SMS escalation (patient phone from profile)

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and user identity

### External Services
- **MongoDB Atlas:** Primary data store for patient and caregiver profiles

### Environment Variables Required
None specific to this module. Uses shared database configuration.

## Background Jobs, Queues, and Scheduled Tasks

None. The Profiles module operates synchronously and does not require background processing.

## Configuration and Environment Variables

No module-specific configuration required. Uses shared database and authentication configuration.

## Security and Authorization Requirements

### Access Control
- All profile endpoints require authentication (Bearer token)
- Users can only access their own profile (enforced by accountId matching)
- No cross-user profile access allowed
- Profile updates are restricted to specific fields (firstName/lastName set during registration)

### Data Protection
- Phone numbers are critical for SMS escalation functionality
- Emergency contact information is sensitive personal data
- All profile data is protected by authentication and RBAC

### Input Validation
- All input validated against Zod schemas
- Phone numbers validated against international format
- Blood type validated against allowed enum values
- Name fields validated for length and character set

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
- `FORBIDDEN`: Attempting to access another user's profile
- `PROFILE_NOT_FOUND`: Profile does not exist for authenticated user
- `INVALID_BLOOD_TYPE`: Blood type not in allowed enum

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log profile retrieval events (accountId, timestamp)
- Log profile update events (accountId, updated fields, timestamp)
- **Never log sensitive personal data in plain text**

### Audit Requirements
- Track who accessed or mutated profile records
- Record timestamp, User ID, and action taken
- Maintain immutable logs for compliance

## Testing Requirements

### Unit Tests
- Profile validation schema rules
- Blood type enum validation
- Phone format validation
- Emergency contact validation logic

### Integration Tests
- GET /profiles/patient/me - successful retrieval
- GET /profiles/patient/me - unauthorized access
- PUT /profiles/patient/me - successful update
- PUT /profiles/patient/me - validation errors
- PUT /profiles/patient/me - forbidden (cross-user access)
- GET /profiles/caregiver/me - successful retrieval
- PUT /profiles/caregiver/me - successful update

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Indexing
- Unique index on accountId for fast profile lookup
- Profile retrieval by accountId is O(1) with proper indexing

### Query Optimization
- Profile queries are simple by accountId lookups
- No complex joins or aggregations required
- Response times should be < 50ms for profile operations

## Future Enhancements and Planned Features

### Potential Future Work
- Profile photo/avatar support
- Consent tracking and management
- Richer profile forms with additional fields
- Profile versioning and history
- Address and location information
- Insurance information storage
- Medical history summary integration
- Language preference for localization

### Out of Scope (Future Phases)
- Social profile integration
- Advanced biometric data storage
- Genetic information storage

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Profile endpoint details
- [Database Schema](../../../artifact/db.md) - Patient and Caregiver schema definitions
- [Security Architecture](../../../artifact/security.md) - Data protection guidelines
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
