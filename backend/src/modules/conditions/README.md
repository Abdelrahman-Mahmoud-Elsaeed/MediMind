# Conditions Module

## Module Overview and Purpose

The Conditions module manages medical condition records associated with a patient. This module is responsible for storing and retrieving patient health conditions, which serve as the foundation for medication management and educational content targeting. Conditions are linked to medications and used to deliver disease-specific educational content.

## Responsibilities and Scope

The Conditions module is exclusively responsible for:
- Creating medical condition records for patients
- Listing and viewing patient conditions
- Updating condition details (notes, diagnosed date)
- Deleting archived or obsolete conditions
- Providing condition references for medication associations
- Supporting content targeting through disease categorization

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Profile data (handled by Profiles module)
- Medication data (handled by Medications module)
- Educational content (handled by Content module)
- Caregiver access control (uses Relationships module for permission checks)

## Features Owned by the Module

### 1. Condition Creation
- Patients can create medical condition records
- Authorized caregivers can create conditions for linked patients
- System validates disease name and diagnosed date
- System flags conditions as chronic or acute
- System stores notes for additional context

### 2. Condition Listing
- Patients can list all their conditions
- Authorized caregivers can list conditions for linked patients
- System supports filtering by patient
- System returns condition details including chronic status

### 3. Condition Retrieval
- Patients can retrieve individual condition details
- Authorized caregivers can retrieve conditions for linked patients
- System returns full condition record

### 4. Condition Updates
- Patients can update condition notes
- Authorized caregivers can update conditions for linked patients
- System validates update fields
- System preserves immutable fields (disease name, patientId)

### 5. Condition Deletion
- Patients can delete their conditions
- Authorized caregivers can delete conditions for linked patients
- System validates condition exists
- System returns 204 No Content on success

## Functional Requirements

### FR-C-1: Create Medical Condition
- Patients must be able to create medical condition records
- Authorized caregivers must be able to create conditions for linked patients
- Condition must include disease name, isChronic flag, diagnosed date, and notes
- System must validate required fields
- System must return created condition record

### FR-C-2: List Medical Conditions
- Patients must be able to list all their conditions
- Authorized caregivers must be able to list conditions for linked patients
- System must support filtering by patientId
- System must return condition details

### FR-C-3: Get Single Condition
- Patients must be able to retrieve individual condition details
- Authorized caregivers must be able to retrieve conditions for linked patients
- System must return full condition record

### FR-C-4: Update Condition
- Patients must be able to update condition notes
- Authorized caregivers must be able to update conditions for linked patients
- System must validate update fields
- System must preserve immutable fields

### FR-C-5: Delete Condition
- Patients must be able to delete their conditions
- Authorized caregivers must be able to delete conditions for linked patients
- System must validate condition exists
- System must return 204 No Content

## Business Rules and Validation Rules

### Condition Validation
- **patientId:** Required ObjectId, must reference existing Patient
- **diseaseName:** Required string, min 1 character
- **isChronic:** Boolean, default false - indicates if condition is chronic (ongoing) vs acute
- **diagnosedDate:** Date, optional
- **notes:** String, optional

### Access Control
- Patients can only access their own condition records
- Caregivers can only access conditions for patients they have ACCEPTED relationship with
- Caregiver access requires canViewMedicalRecords permission flag
- No cross-user access allowed

### Chronic vs Acute
- Chronic conditions (isChronic: true) indicate ongoing, long-term conditions (e.g., Diabetes, Hypertension)
- Acute conditions (isChronic: false) indicate temporary or short-term conditions
- Chronic flag influences medication scheduling and content targeting

### Data Integrity
- diseaseName should match targetDisease in Content module for content targeting
- patientId cannot be changed after creation
- isChronic flag can be updated if condition status changes

## User Workflows

### Create Condition Workflow
1. User makes POST request to /conditions with condition data
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. If PATIENT: system finds Patient record by accountId
5. If CAREGIVER: system validates relationship with patient and canViewMedicalRecords permission
6. System validates condition payload against schema rules
7. System creates condition record
8. System returns created condition record

### List Conditions Workflow
1. User makes GET request to /conditions with patientId query parameter
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. If PATIENT: system validates patientId matches user's patient record
5. If CAREGIVER: system validates relationship with patient and canViewMedicalRecords permission
6. System finds all conditions for patient
7. System returns list of conditions

### Get Single Condition Workflow
1. User makes GET request to /conditions/:conditionId
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds condition by conditionId
5. System validates user has access to this condition (patient or authorized caregiver)
6. System returns condition record

### Update Condition Workflow
1. User makes PUT request to /conditions/:conditionId with update data
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds condition by conditionId
5. System validates user has access to this condition (patient or authorized caregiver)
6. System validates update payload against schema rules
7. System updates allowed fields (notes, diagnosedDate, isChronic)
8. System returns updated condition record

### Delete Condition Workflow
1. User makes DELETE request to /conditions/:conditionId
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds condition by conditionId
5. System validates user has access to this condition (patient or authorized caregiver)
6. System deletes condition record
7. System returns 204 No Content

## Public APIs

### POST /api/v1/conditions
**Purpose:** Create a new medical condition

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "diseaseName": "Type 2 Diabetes",
  "isChronic": true,
  "diagnosedDate": "2023-05-10T00:00:00Z",
  "notes": "Monitor morning levels"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "conditionId": "64a1f...",
    "diseaseName": "Type 2 Diabetes",
    "isChronic": true,
    "diagnosedDate": "2023-05-10T00:00:00Z",
    "notes": "Monitor morning levels"
  }
}
```

**Validation Rules:**
- diseaseName: required string
- isChronic: boolean, default false
- diagnosedDate: valid date, optional
- notes: string, optional

### GET /api/v1/conditions
**Purpose:** Get all medical conditions for a patient

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `patientId`: Patient ID (required for caregivers, optional for patients)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "conditionId": "64a1f...",
      "diseaseName": "Type 2 Diabetes",
      "isChronic": true,
      "diagnosedDate": "2023-05-10T00:00:00Z",
      "notes": "Monitor morning levels"
    }
  ]
}
```

### GET /api/v1/conditions/:conditionId
**Purpose:** Get a single medical condition

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conditionId": "64a1f...",
    "diseaseName": "Type 2 Diabetes",
    "isChronic": true,
    "diagnosedDate": "2023-05-10T00:00:00Z",
    "notes": "Monitor morning levels"
  }
}
```

### PUT /api/v1/conditions/:conditionId
**Purpose:** Update a medical condition

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "notes": "Updated dosage notes per latest doctor visit."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conditionId": "64a1f...",
    "diseaseName": "Type 2 Diabetes",
    "isChronic": true,
    "diagnosedDate": "2023-05-10T00:00:00Z",
    "notes": "Updated dosage notes per latest doctor visit."
  }
}
```

**Validation Rules:**
- notes: string, optional
- diagnosedDate: valid date, optional
- isChronic: boolean, optional

### DELETE /api/v1/conditions/:conditionId
**Purpose:** Delete a medical condition

**Authentication:** Required (Bearer token)

**Response (204 No Content)**

## Data Models and Database Collections

### Medical Conditions Collection (`medical_conditions`)
Acts as the patient's medical record. A patient can have multiple conditions, and some can be flagged as chronic.

**Schema:**
```javascript
{
  patientId: ObjectId (ref: 'Patient', required, indexed),
  diseaseName: String (required),
  isChronic: Boolean (default: false),
  diagnosedDate: Date (optional),
  notes: String (optional)
}
```

**Indexes:**
- Index on patientId
- Default index on _id

**Relationships:**
- Many-to-one with Patient via patientId
- One-to-many with Medications via conditionId

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides accountId and role for authentication
- **Profiles Module:** Provides Patient model for validation
- **Relationships Module:** Provides permission checks for caregiver access

### Provides Condition Data To:
- **Medications Module:** Uses conditionId for medication association and chronic flag for scheduling
- **Content Module:** Uses diseaseName to match with targetDisease for educational content targeting

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and user identity
- **Profiles Module:** Patient model for validation
- **Relationships Module:** Permission checks for caregiver access

### External Services
- **MongoDB Atlas:** Primary data store for condition records

### Environment Variables Required
None specific to this module. Uses shared database configuration.

## Background Jobs, Queues, and Scheduled Tasks

None. The Conditions module operates synchronously and does not require background processing.

## Configuration and Environment Variables

No module-specific configuration required. Uses shared database and authentication configuration.

## Security and Authorization Requirements

### Access Control
- All condition endpoints require authentication (Bearer token)
- Patients can only access their own condition records
- Caregivers can only access conditions for patients with ACCEPTED relationship
- Caregiver access requires canViewMedicalRecords permission flag
- No cross-user access allowed

### Data Protection
- Medical condition data is sensitive PHI
- Condition records are protected by authentication and RBAC
- Caregiver access is gated by relationship permissions

### Input Validation
- All input validated against Zod schemas
- patientId validated to reference existing Patient
- diseaseName validated as non-empty string
- diagnosedDate validated as valid date if provided

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
- `FORBIDDEN`: User does not have permission to access this condition
- `CONDITION_NOT_FOUND`: Condition does not exist
- `PATIENT_NOT_FOUND`: Patient does not exist
- `INSUFFICIENT_PERMISSIONS`: Caregiver lacks canViewMedicalRecords permission

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log condition creation events (patientId, diseaseName, isChronic, timestamp)
- Log condition update events (conditionId, updated fields, actor, timestamp)
- Log condition deletion events (conditionId, patientId, actor, timestamp)
- **Never log sensitive medical data in plain text**

### Audit Requirements
- Track who accessed or mutated condition records
- Record timestamp, User ID, and action taken
- Maintain immutable logs for compliance
- Caregiver access must be auditable

## Testing Requirements

### Unit Tests
- Condition validation schema rules
- Chronic flag validation logic
- Access control logic (patient vs caregiver)
- Permission check logic

### Integration Tests
- POST /conditions - successful creation by patient
- POST /conditions - successful creation by authorized caregiver
- POST /conditions - forbidden (unauthorized caregiver)
- GET /conditions - patient listing
- GET /conditions - caregiver listing with permission
- GET /conditions/:id - successful retrieval
- PUT /conditions/:id - successful update
- DELETE /conditions/:id - successful deletion
- DELETE /conditions/:id - forbidden (unauthorized caregiver)

### Security Tests
- Cross-user condition access attempts
- Permission bypass attempts
- Caregiver access without canViewMedicalRecords permission

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Indexing
- Index on patientId for fast patient condition lookups
- Condition queries are simple by patientId lookups

### Query Optimization
- Condition queries are simple by patientId or conditionId lookups
- No complex joins or aggregations required
- Response times should be < 50ms for condition operations

## Future Enhancements and Planned Features

### Potential Future Work
- Condition versioning and history tracking
- Diagnosis evidence attachments (documents, images)
- Condition severity levels
- Condition treatment plans
- Integration with external medical coding systems (ICD-10)
- Condition-specific medication recommendations
- Condition progression tracking
- Symptom tracking linked to conditions

### Out of Scope (Future Phases)
- AI-powered condition diagnosis
- Medical imaging analysis
- Genetic condition tracking
- Predictive health analytics

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Condition endpoint details
- [Database Schema](../../../artifact/db.md) - Medical condition schema definition
- [Security Architecture](../../../artifact/security.md) - PHI protection guidelines
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
