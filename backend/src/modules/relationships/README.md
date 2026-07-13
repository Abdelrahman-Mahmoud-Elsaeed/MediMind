# Relationships Module

## Module Overview and Purpose

The Relationships module manages caregiver-patient delegation and permission flows. This module is responsible for establishing the authorization bridge between patients and caregivers, enabling caregivers to access and manage patient medication data based on granted permissions. This is a critical security module that implements the platform's delegation model.

## Responsibilities and Scope

The Relationships module is exclusively responsible for:
- Initiating caregiver-patient links (invitation flow)
- Managing relationship status transitions (PENDING → ACCEPTED/REJECTED/REVOKED)
- Storing and enforcing permission flags (canAddMedication, canViewMedicalRecords)
- Listing current relationships for patients and caregivers
- Revoking or removing relationships
- Providing permission context for access control in other modules

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Profile data (handled by Profiles module)
- Medication data (handled by Medications module)
- Notification delivery (handled by Notifications module)
- Permission enforcement (middleware uses relationship data but enforcement is shared)

## Features Owned by the Module

### 1. Relationship Initiation
- Patients can invite caregivers by email
- System validates caregiver email exists in system
- System creates relationship record with PENDING status
- System stores permission flags for the relationship
- System returns relationship ID for tracking

### 2. Relationship Listing
- Patients can list all their caregiver relationships
- Caregivers can list all their patient relationships
- System returns relationship status and permissions
- System filters by status if requested

### 3. Relationship Status Management
- Caregivers can accept pending relationship invitations
- Caregivers can reject pending relationship invitations
- Patients can revoke active relationships
- System updates relationship status accordingly
- System validates status transitions are valid

### 4. Relationship Removal
- Patients can remove relationships (sets status to REVOKED)
- System validates user has permission to remove relationship
- System updates relationship status
- System returns confirmation

## Functional Requirements

### FR-R-1: Initiate Caregiver Link
- Patients must be able to invite caregivers by email
- Invitation must include permission flags (canAddMedication, canViewMedicalRecords)
- System must validate caregiver email exists in system
- System must create relationship with PENDING status
- System must return relationship ID

### FR-R-2: List Relationships
- Patients must be able to list all their caregiver relationships
- Caregivers must be able to list all their patient relationships
- System must return relationship status and permissions
- System must support filtering by status

### FR-R-3: Update Relationship Status
- Caregivers must be able to accept PENDING invitations
- Caregivers must be able to reject PENDING invitations
- Patients must be able to revoke ACCEPTED relationships
- System must validate status transitions are valid
- System must update relationship status

### FR-R-4: Remove Relationship
- Patients must be able to remove relationships
- System must set status to REVOKED
- System must validate user has permission to remove

## Business Rules and Validation Rules

### Relationship Status Transitions
- **PENDING** → **ACCEPTED**: Only by caregiver
- **PENDING** → **REJECTED**: Only by caregiver
- **ACCEPTED** → **REVOKED**: Only by patient
- **REVOKED**: Terminal state, no further transitions
- **REJECTED**: Terminal state, no further transitions

### Permission Flags
- **canAddMedication**: Boolean, default true - allows caregiver to add medications for patient
- **canViewMedicalRecords**: Boolean, default false - allows caregiver to view patient's medical conditions

### Access Control
- Only patients can initiate relationships (invite caregivers)
- Only caregivers can accept/reject invitations
- Only patients can revoke active relationships
- Caregivers can only access their own relationship records
- Patients can only access their own relationship records

### Email Validation
- Caregiver email must exist in Accounts collection
- Caregiver must have role CAREGIVER
- Email must be valid format

### Uniqueness
- One-to-one relationship between patient and caregiver (unique constraint on patientId + caregiverId)
- Cannot create duplicate relationships between same patient and caregiver

## User Workflows

### Initiate Relationship Workflow
1. Patient makes POST request to /relationships with caregiverEmail and permissions
2. System verifies authentication via access token
3. System extracts patient accountId from token
4. System validates caregiverEmail exists and has role CAREGIVER
5. System checks if relationship already exists between patient and caregiver
6. System creates relationship record with PENDING status
7. System returns relationship ID and status

### List Relationships Workflow
1. User makes GET request to /relationships
2. System verifies authentication via access token
3. System extracts accountId from token
4. System determines user role from token
5. If PATIENT: system finds all relationships where patientId matches
6. If CAREGIVER: system finds all relationships where caregiverId matches
7. System returns list of relationships with status and permissions

### Accept Relationship Workflow
1. Caregiver makes PATCH request to /relationships/:relationshipId/status with status ACCEPTED
2. System verifies authentication via access token
3. System extracts caregiver accountId from token
4. System validates relationship exists and caregiverId matches
5. System validates current status is PENDING
6. System updates status to ACCEPTED
7. System returns updated relationship

### Reject Relationship Workflow
1. Caregiver makes PATCH request to /relationships/:relationshipId/status with status REJECTED
2. System verifies authentication via access token
3. System extracts caregiver accountId from token
4. System validates relationship exists and caregiverId matches
5. System validates current status is PENDING
6. System updates status to REJECTED
7. System returns updated relationship

### Revoke Relationship Workflow
1. Patient makes DELETE request to /relationships/:relationshipId
2. System verifies authentication via access token
3. System extracts patient accountId from token
4. System validates relationship exists and patientId matches
5. System updates status to REVOKED
6. System returns 204 No Content

## Public APIs

### POST /api/v1/relationships
**Purpose:** Initiate caregiver-patient link (patient invites caregiver)

**Authentication:** Required (Bearer token, PATIENT role)

**Request Body:**
```json
{
  "caregiverEmail": "caregiver@example.com",
  "permissions": {
    "canAddMedication": true,
    "canViewMedicalRecords": true
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "relationshipId": "64a1e...",
    "status": "PENDING"
  }
}
```

**Validation Rules:**
- caregiverEmail: valid email format, must exist as CAREGIVER account
- permissions.canAddMedication: boolean, default true
- permissions.canViewMedicalRecords: boolean, default false

### GET /api/v1/relationships
**Purpose:** List current relationships

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "relationshipId": "64a1e...",
      "patientId": "...",
      "caregiverId": "...",
      "status": "ACCEPTED",
      "permissions": {
        "canAddMedication": true,
        "canViewMedicalRecords": true
      }
    }
  ]
}
```

### PATCH /api/v1/relationships/:relationshipId/status
**Purpose:** Update relationship status (accept/reject)

**Authentication:** Required (Bearer token, CAREGIVER role)

**Request Body:**
```json
{
  "status": "ACCEPTED"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "relationshipId": "64a1e...",
    "status": "ACCEPTED"
  }
}
```

**Validation Rules:**
- status: must be ACCEPTED or REJECTED
- Current status must be PENDING
- Only caregiver can update status

### DELETE /api/v1/relationships/:relationshipId
**Purpose:** Revoke/remove relationship

**Authentication:** Required (Bearer token, PATIENT role)

**Response (204 No Content)**

**Validation Rules:**
- Only patient can revoke relationship
- Current status must be ACCEPTED

## Data Models and Database Collections

### Relationships Collection (`relationships`)
Maps the authorization bridge between Patient profiles and Caregiver profiles.

**Schema:**
```javascript
{
  patientId: ObjectId (ref: 'Patient', required, indexed),
  caregiverId: ObjectId (ref: 'Caregiver', required, indexed),
  status: String (enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'], default: 'PENDING'),
  permissions: {
    canAddMedication: Boolean (default: true),
    canViewMedicalRecords: Boolean (default: false)
  }
}
```

**Indexes:**
- Index on patientId
- Index on caregiverId
- Unique compound index on { patientId: 1, caregiverId: 1 }

**Relationships:**
- Many-to-one with Patient via patientId
- Many-to-one with Caregiver via caregiverId

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides accountId and role for authentication and authorization
- **Profiles Module:** Provides Patient and Caregiver profile context for relationship creation

### Provides Permission Context To:
- **Medications Module:** Uses relationship permissions to determine if caregiver can add/view medications
- **Conditions Module:** Uses relationship permissions to determine if caregiver can view medical conditions
- **Notifications Module:** Uses relationship data to identify caregivers for escalation alerts
- **Shared Middleware:** Authentication middleware uses relationship data for permission checks

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and user identity
- **Profiles Module:** Patient and Caregiver models for validation

### External Services
- **MongoDB Atlas:** Primary data store for relationship records

### Environment Variables Required
None specific to this module. Uses shared database configuration.

## Background Jobs, Queues, and Scheduled Tasks

None. The Relationships module operates synchronously and does not require background processing.

## Configuration and Environment Variables

No module-specific configuration required. Uses shared database and authentication configuration.

## Security and Authorization Requirements

### Access Control
- All relationship endpoints require authentication (Bearer token)
- Only PATIENT role can initiate relationships (POST)
- Only CAREGIVER role can accept/reject relationships (PATCH)
- Only PATIENT role can revoke relationships (DELETE)
- Users can only access their own relationship records
- Relationship status transitions are strictly enforced

### Permission Enforcement
- Permission flags are stored in relationship record
- Other modules must check relationship permissions before granting access
- canAddMedication: allows caregiver to add medications for patient
- canViewMedicalRecords: allows caregiver to view patient's medical conditions
- Default permissions: canAddMedication=true, canViewMedicalRecords=false

### Data Protection
- Relationship data links sensitive patient data with caregivers
- Permission flags control access to PHI
- All relationship operations are audited

### Input Validation
- All input validated against Zod schemas
- Caregiver email validated to exist and have correct role
- Status transitions validated against allowed state machine
- Permission flags validated as boolean values

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
- `FORBIDDEN`: User does not have permission for this operation
- `CAREGIVER_NOT_FOUND`: Caregiver email does not exist or is not a caregiver
- `RELATIONSHIP_EXISTS`: Relationship already exists between patient and caregiver
- `RELATIONSHIP_NOT_FOUND`: Relationship does not exist
- `INVALID_STATUS_TRANSITION`: Cannot transition from current status to requested status
- `INSUFFICIENT_PERMISSIONS`: User does not have required permission flag

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log relationship creation events (patientId, caregiverId, permissions, timestamp)
- Log relationship status changes (relationshipId, fromStatus, toStatus, actor, timestamp)
- Log relationship revocation events (relationshipId, patientId, timestamp)
- **Never log sensitive personal data in plain text**

### Audit Requirements
- Track who initiated, accepted, rejected, or revoked relationships
- Record timestamp, User ID, and action taken
- Maintain immutable logs for compliance
- Permission changes must be auditable

## Testing Requirements

### Unit Tests
- Relationship validation schema rules
- Status transition logic
- Permission flag validation
- Email validation logic

### Integration Tests
- POST /relationships - successful initiation
- POST /relationships - caregiver not found
- POST /relationships - duplicate relationship
- GET /relationships - patient listing
- GET /relationships - caregiver listing
- PATCH /relationships/:id/status - successful accept
- PATCH /relationships/:id/status - successful reject
- PATCH /relationships/:id/status - invalid transition
- DELETE /relationships/:id - successful revoke
- DELETE /relationships/:id - forbidden (not patient)

### Security Tests
- Cross-user relationship access attempts
- Permission bypass attempts
- Invalid status transition attempts
- Role-based access control enforcement

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Indexing
- Index on patientId for fast patient relationship lookups
- Index on caregiverId for fast caregiver relationship lookups
- Unique compound index on patientId + caregiverId prevents duplicates

### Query Optimization
- Relationship queries are simple by patientId or caregiverId lookups
- Permission checks require relationship lookup by patientId + caregiverId
- Response times should be < 50ms for relationship operations

## Future Enhancements and Planned Features

### Potential Future Work
- Richer permission models (canEditMedication, canDeleteMedication, etc.)
- Relationship history and audit trail
- Temporary/time-limited relationships
- Relationship expiration and auto-revocation
- Multi-caregiver support with permission tiers
- Caregiver group management
- Relationship request expiration (auto-reject after X days)
- Relationship request reminders

### Out of Scope (Future Phases)
- Social network-style connections
- Public caregiver directory
- Caregiver rating and review system
- Paid caregiver marketplace integration

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Relationship endpoint details
- [Database Schema](../../../artifact/db.md) - Relationship schema definition
- [Security Architecture](../../../artifact/security.md) - RBAC and permission guidelines
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
- [Business Requirements](../../../artifact/BRD.md) - Caregiver relationship requirements
