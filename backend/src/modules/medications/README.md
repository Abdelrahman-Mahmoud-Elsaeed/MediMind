# Medications Module

## Module Overview and Purpose

The Medications module owns medication records, inventory details, prescribing context, and OCR-based medication scanning support. This module is responsible for the core medication management functionality including inventory tracking, dosage scheduling, and AI-assisted medication intake through OCR scanning. It serves as the foundation for the adherence tracking system.

## Responsibilities and Scope

The Medications module is exclusively responsible for:
- Creating medication records linked to medical conditions
- Managing medication inventory (initial quantity, current quantity, dose amount, refill threshold)
- Storing medication instructions (relation to meals, notes)
- Generating and storing dosage schedules (frequency, times of day, start/end dates)
- Supporting OCR-based medication scanning with confidence validation
- Updating medication details and inventory
- Archiving or deleting medications
- Managing medication images

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Profile data (handled by Profiles module)
- Medical conditions (handled by Conditions module)
- Dose event tracking (handled by Doses module)
- Notification delivery (handled by Notifications module)
- Image upload storage (handled by Uploads module)
- OCR processing (external AI service)

## Features Owned by the Module

### 1. Medication Creation
- Patients can create medication records
- Authorized caregivers can create medications for linked patients
- System validates medication data against schema rules
- System generates dosage schedule based on frequency and first dose time
- System stores inventory information
- System links medication to medical condition

### 2. Medication Listing
- Patients can list all their medications
- Authorized caregivers can list medications for linked patients
- System supports filtering by patient and active status
- System returns medication details including inventory and schedule

### 3. Medication Retrieval
- Patients can retrieve individual medication details
- Authorized caregivers can retrieve medications for linked patients
- System returns full medication record with all details

### 4. Medication Updates
- Patients can update medication inventory and instructions
- Authorized caregivers can update medications for linked patients
- System validates update fields
- System preserves immutable fields (name, form type, condition association)

### 5. Medication Deletion/Archiving
- Patients can delete/archive their medications
- Authorized caregivers can delete/archive medications for linked patients
- System validates medication exists
- System returns 204 No Content on success

### 6. OCR Medication Scanning
- Patients and caregivers can submit medication images for OCR analysis
- System sends image to external AI service (OpenAI Vision)
- System validates AI confidence score (must be >= 90%)
- System returns medication name, form type, and confidence score
- System rejects scans below confidence threshold

## Functional Requirements

### FR-M-1: Create Medication
- Patients must be able to create medication records
- Authorized caregivers must be able to create medications for linked patients
- Medication must include conditionId, name, formType, inventory, instructions, schedule, expirationDate
- System must validate all required fields
- System must generate timesOfDay array based on frequency and firstDoseTime
- System must return created medication record

### FR-M-2: List Medications
- Patients must be able to list all their medications
- Authorized caregivers must be able to list medications for linked patients
- System must support filtering by patientId and isActive
- System must return medication details including inventory and schedule

### FR-M-3: Get Single Medication
- Patients must be able to retrieve individual medication details
- Authorized caregivers must be able to retrieve medications for linked patients
- System must return full medication record

### FR-M-4: Update Medication
- Patients must be able to update medication inventory and instructions
- Authorized caregivers must be able to update medications for linked patients
- System must validate update fields
- System must preserve immutable fields

### FR-M-5: Delete/Archive Medication
- Patients must be able to delete/archive their medications
- Authorized caregivers must be able to delete/archive medications for linked patients
- System must validate medication exists
- System must return 204 No Content

### FR-M-6: OCR Medication Scan
- Patients and caregivers must be able to submit medication images for OCR
- System must send image to AI service for analysis
- System must validate confidence score >= 90%
- System must return medication name, form type, and confidence score
- System must reject scans below 90% confidence threshold

## Business Rules and Validation Rules

### Medication Validation
- **patientId:** Required ObjectId, must reference existing Patient
- **conditionId:** Required ObjectId, must reference existing MedicalCondition
- **addedBy:** Required ObjectId, must reference Account (who created the medication)
- **name:** Required string, min 1 character
- **imageURL:** String, optional (from Uploads module)
- **formType:** Required enum: TABLET, CAPSULE, SYRUP, INJECTION, DROP, CREAM, OTHER
- **isChronic:** Boolean, default false - influences scheduling and inventory alerts
- **inventory.initialQuantity:** Required number, must be > 0
- **inventory.currentQuantity:** Required number, must be >= 0
- **inventory.doseAmount:** Required number, must be > 0
- **inventory.refillThreshold:** Number, default 5
- **instructions.relationToMeals:** Enum: BEFORE_MEALS, AFTER_MEALS, WITH_FOOD, ON_EMPTY_STOMACH, NONE
- **instructions.notes:** String, optional
- **schedule.frequency:** Required enum: DAILY, WEEKLY, AS_NEEDED
- **schedule.dosesPerDay:** Required number, must be > 0, max 24
- **schedule.firstDoseTime:** Required string, format HH:MM
- **schedule.timesOfDay:** Array of strings, auto-generated based on frequency and firstDoseTime
- **schedule.startDate:** Required Date
- **schedule.endDate:** Date, required if isChronic is false, null if isChronic is true
- **expirationDate:** Required Date
- **isActive:** Boolean, default true

### Inventory Rules (Critical)
- **CRITICAL RULE:** Inventory currentQuantity must NOT automatically decrement when a reminder is sent
- **CRITICAL RULE:** Inventory currentQuantity decreases ONLY when user explicitly confirms dose via Doses module
- **CRITICAL RULE:** System must flag medications where currentQuantity < refillThreshold
- **CRITICAL RULE:** System must block adherence confirmations for medications past expirationDate

### Schedule Generation Rules
- **DAILY:** timesOfDay generated by dividing 24 hours by dosesPerDay, starting from firstDoseTime
- **WEEKLY:** timesOfDay generated for specific days of week
- **AS_NEEDED:** No automatic schedule generation, doses taken on demand
- **Chronic medications:** endDate is null, schedule continues indefinitely
- **Acute medications:** endDate required, schedule ends on that date

### OCR Safety Validation
- **CRITICAL RULE:** OCR confidence score must be >= 90% to accept scan results
- **CRITICAL RULE:** If confidence < 90%, system must reject scan and return error
- **CRITICAL RULE:** System must never guess or use low-confidence results
- OCR scan returns: name, formType, confidenceScore
- Confidence score is returned to frontend for display

### Access Control
- Patients can only access their own medication records
- Caregivers can only access medications for patients with ACCEPTED relationship
- Caregiver access requires canAddMedication permission flag
- No cross-user access allowed

### Expiration Handling
- Medications past expirationDate cannot have dose confirmations
- System should flag expired medications in UI
- Expired medications should be archived or deleted

## User Workflows

### Create Medication Workflow
1. User makes POST request to /medications with medication data
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. If PATIENT: system finds Patient record by accountId
5. If CAREGIVER: system validates relationship with patient and canAddMedication permission
6. System validates medication payload against schema rules
7. System generates timesOfDay array based on frequency and firstDoseTime
8. System creates medication record
9. System returns created medication record

### List Medications Workflow
1. User makes GET request to /medications with patientId and isActive query parameters
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. If PATIENT: system validates patientId matches user's patient record
5. If CAREGIVER: system validates relationship with patient and canAddMedication permission
6. System finds all medications for patient with optional isActive filter
7. System returns list of medications

### Get Single Medication Workflow
1. User makes GET request to /medications/:medicationId
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds medication by medicationId
5. System validates user has access to this medication (patient or authorized caregiver)
6. System returns medication record

### Update Medication Workflow
1. User makes PUT request to /medications/:medicationId with update data
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds medication by medicationId
5. System validates user has access to this medication (patient or authorized caregiver)
6. System validates update payload against schema rules
7. System updates allowed fields (inventory, instructions, schedule, imageURL)
8. System returns updated medication record

### Delete Medication Workflow
1. User makes DELETE request to /medications/:medicationId
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds medication by medicationId
5. System validates user has access to this medication (patient or authorized caregiver)
6. System deletes medication record
7. System returns 204 No Content

### OCR Medication Scan Workflow
1. User makes POST request to /medications/scan with imageBase64
2. System verifies authentication via access token
3. System validates image format and size
4. System sends image to external AI service (OpenAI Vision)
5. System receives response with name, formType, confidenceScore
6. System validates confidenceScore >= 90%
7. If confidence >= 90%: system returns medication data
8. If confidence < 90%: system returns 422 error with rejection message

## Public APIs

### POST /api/v1/medications
**Purpose:** Create a new medication

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "conditionId": "64a1f...",
  "name": "Metformin",
  "formType": "TABLET",
  "isChronic": true,
  "inventory": {
    "initialQuantity": 60,
    "currentQuantity": 60,
    "doseAmount": 1,
    "refillThreshold": 10
  },
  "instructions": {
    "relationToMeals": "WITH_FOOD",
    "notes": "Take with a full glass of water."
  },
  "schedule": {
    "frequency": "DAILY",
    "dosesPerDay": 2,
    "firstDoseTime": "08:00",
    "timesOfDay": ["08:00", "20:00"],
    "startDate": "2024-07-05T00:00:00Z"
  },
  "expirationDate": "2025-12-01T00:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "medicationId": "64a2g...",
    "name": "Metformin",
    "status": "CREATED"
  }
}
```

**Validation Rules:**
- conditionId: required ObjectId, must reference existing MedicalCondition
- name: required string
- formType: required enum
- inventory: required object with initialQuantity, currentQuantity, doseAmount
- schedule: required object with frequency, dosesPerDay, firstDoseTime, startDate
- expirationDate: required Date

### GET /api/v1/medications
**Purpose:** Get all medications for a patient

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `patientId`: Patient ID (required for caregivers, optional for patients)
- `isActive`: Boolean (optional, default true)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "medicationId": "64a2g...",
      "conditionId": "64a1f...",
      "name": "Metformin",
      "formType": "TABLET",
      "isChronic": true,
      "inventory": {
        "currentQuantity": 60,
        "doseAmount": 1,
        "refillThreshold": 10
      },
      "instructions": {
        "relationToMeals": "WITH_FOOD",
        "notes": "Take with a full glass of water."
      },
      "schedule": {
        "frequency": "DAILY",
        "timesOfDay": ["08:00", "20:00"]
      }
    }
  ]
}
```

### GET /api/v1/medications/:medicationId
**Purpose:** Get a single medication

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "medicationId": "64a2g...",
    "conditionId": "64a1f...",
    "name": "Metformin",
    "formType": "TABLET",
    "isChronic": true,
    "inventory": {
      "initialQuantity": 60,
      "currentQuantity": 60,
      "doseAmount": 1,
      "refillThreshold": 10
    },
    "instructions": {
      "relationToMeals": "WITH_FOOD",
      "notes": "Take with a full glass of water."
    },
    "schedule": {
      "frequency": "DAILY",
      "dosesPerDay": 2,
      "firstDoseTime": "08:00",
      "timesOfDay": ["08:00", "20:00"],
      "startDate": "2024-07-05T00:00:00Z"
    },
    "expirationDate": "2025-12-01T00:00:00Z",
    "isActive": true
  }
}
```

### PUT /api/v1/medications/:medicationId
**Purpose:** Update a medication

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "inventory": {
    "currentQuantity": 90,
    "doseAmount": 1,
    "refillThreshold": 15
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "medicationId": "64a2g...",
    "name": "Metformin",
    "formType": "TABLET",
    "isChronic": true,
    "inventory": {
      "initialQuantity": 60,
      "currentQuantity": 90,
      "doseAmount": 1,
      "refillThreshold": 15
    },
    "instructions": {
      "relationToMeals": "WITH_FOOD",
      "notes": "Take with a full glass of water."
    },
    "schedule": {
      "frequency": "DAILY",
      "timesOfDay": ["08:00", "20:00"]
    },
    "expirationDate": "2025-12-01T00:00:00Z",
    "isActive": true
  }
}
```

### DELETE /api/v1/medications/:medicationId
**Purpose:** Delete/archive a medication

**Authentication:** Required (Bearer token)

**Response (204 No Content)**

### POST /api/v1/medications/scan
**Purpose:** Scan medication image using OCR

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Amoxicillin",
    "formType": "CAPSULE",
    "confidenceScore": 0.96
  }
}
```

**Response (422 Unprocessable Entity) - Low Confidence:**
```json
{
  "success": false,
  "error": {
    "code": "LOW_CONFIDENCE",
    "message": "OCR confidence score (0.85) is below required threshold (0.90). Please retake the photo or enter data manually."
  }
}
```

## Data Models and Database Collections

### Medications Collection (`medications`)
Strictly linked to a medical condition. Introduces isChronic handling and auto-generated scheduling.

**Schema:**
```javascript
{
  patientId: ObjectId (ref: 'Patient', required, indexed),
  conditionId: ObjectId (ref: 'MedicalCondition'),
  addedBy: ObjectId (ref: 'Account', required),
  
  name: String (required),
  imageURL: String (default: null),
  formType: String (enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'OTHER'], required),
  isChronic: Boolean (default: false),
  
  inventory: {
    initialQuantity: Number (required),
    currentQuantity: Number (required),
    doseAmount: Number (required),
    refillThreshold: Number (default: 5)
  },

  instructions: {
    relationToMeals: String (enum: ['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'], default: 'NONE'),
    notes: String
  },
  
  schedule: {
    frequency: String (enum: ['DAILY', 'WEEKLY', 'AS_NEEDED'], required),
    dosesPerDay: Number (required),
    firstDoseTime: String (required),
    timesOfDay: [String],
    startDate: Date (required),
    endDate: Date
  },
  
  expirationDate: Date (required),
  isActive: Boolean (default: true)
}
```

**Indexes:**
- Index on patientId
- Index on conditionId
- Index on isActive
- Default index on _id

**Relationships:**
- Many-to-one with Patient via patientId
- Many-to-one with MedicalCondition via conditionId
- Many-to-one with Account via addedBy
- One-to-many with Dose Events via medicationId

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides accountId and role for authentication
- **Profiles Module:** Provides Patient model for validation
- **Relationships Module:** Provides permission checks for caregiver access
- **Conditions Module:** Provides MedicalCondition for medication association
- **Uploads Module:** Provides imageURL for medication images

### Provides Medication Data To:
- **Doses Module:** Uses medication schedule and inventory for dose event generation and confirmation
- **Notifications Module:** Uses medication schedule for reminder generation
- **Content Module:** May use medication data for educational content targeting

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and user identity
- **Profiles Module:** Patient model for validation
- **Relationships Module:** Permission checks for caregiver access
- **Conditions Module:** MedicalCondition model for validation

### External Services
- **MongoDB Atlas:** Primary data store for medication records
- **OpenAI Vision API:** OCR processing for medication scanning (confidence threshold: 90%)

### Environment Variables Required
- `OPENAI_API_KEY`: API key for OpenAI Vision service (required for OCR functionality)
- Shared database configuration

## Background Jobs, Queues, and Scheduled Tasks

None directly in this module. However, the module's data is consumed by:
- **Doses Module:** Background jobs generate dose events based on medication schedules
- **Notifications Module:** Background jobs generate reminders based on medication schedules

## Configuration and Environment Variables

### OCR Configuration
- `OPENAI_API_KEY`: Required for medication scanning functionality
- Confidence threshold: 90% (hardcoded, not configurable)

### Schedule Generation
- Maximum doses per day: 24 (hardcoded validation)
- Time format: HH:MM (24-hour format)

## Security and Authorization Requirements

### Access Control
- All medication endpoints require authentication (Bearer token)
- Patients can only access their own medication records
- Caregivers can only access medications for patients with ACCEPTED relationship
- Caregiver access requires canAddMedication permission flag
- No cross-user access allowed

### Data Protection
- Medication data is sensitive PHI
- Medication records are protected by authentication and RBAC
- Caregiver access is gated by relationship permissions

### Input Validation
- All input validated against Zod schemas
- patientId validated to reference existing Patient
- conditionId validated to reference existing MedicalCondition
- Inventory values validated as positive numbers
- Schedule times validated in HH:MM format

### OCR Security
- Image size limited to prevent DoS attacks
- Image format validated (JPEG, PNG, WebP)
- Confidence threshold enforced to prevent incorrect data entry
- Low-confidence scans rejected with clear error message

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
- `FORBIDDEN`: User does not have permission to access this medication
- `MEDICATION_NOT_FOUND`: Medication does not exist
- `CONDITION_NOT_FOUND`: Condition does not exist
- `PATIENT_NOT_FOUND`: Patient does not exist
- `INSUFFICIENT_PERMISSIONS`: Caregiver lacks canAddMedication permission
- `LOW_CONFIDENCE`: OCR confidence score below 90% threshold
- `OCR_SERVICE_ERROR`: External AI service unavailable or error
- `EXPIRED_MEDICATION`: Medication has passed expiration date

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log medication creation events (patientId, medicationId, name, addedBy, timestamp)
- Log medication update events (medicationId, updated fields, actor, timestamp)
- Log medication deletion events (medicationId, patientId, actor, timestamp)
- Log OCR scan events (accountId, confidenceScore, success/failure, timestamp)
- **Never log sensitive medication data in plain text**

### Audit Requirements
- Track who accessed or mutated medication records
- Record timestamp, User ID, and action taken
- Maintain immutable logs for compliance
- Caregiver access must be auditable
- OCR scan attempts must be logged

## Testing Requirements

### Unit Tests
- Medication validation schema rules
- Schedule generation logic (timesOfDay calculation)
- Inventory validation logic
- Chronic vs acute medication handling
- OCR confidence threshold validation

### Integration Tests
- POST /medications - successful creation by patient
- POST /medications - successful creation by authorized caregiver
- POST /medications - forbidden (unauthorized caregiver)
- GET /medications - patient listing
- GET /medications - caregiver listing with permission
- GET /medications/:id - successful retrieval
- PUT /medications/:id - successful update
- DELETE /medications/:id - successful deletion
- POST /medications/scan - successful OCR scan
- POST /medications/scan - low confidence rejection

### Security Tests
- Cross-user medication access attempts
- Permission bypass attempts
- Caregiver access without canAddMedication permission
- OCR image size/format validation
- Inventory manipulation attempts

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation
- Mock external OCR service for testing

## Performance Considerations

### Database Indexing
- Index on patientId for fast patient medication lookups
- Index on conditionId for condition-based queries
- Index on isActive for filtering active medications

### Query Optimization
- Medication queries are simple by patientId or medicationId lookups
- Schedule generation is CPU-intensive but only occurs on creation/update
- Inventory queries should be optimized for frequent dose confirmation checks

### OCR Performance
- OCR calls to external AI service are slow (1-3 seconds)
- OCR should be rate-limited to prevent abuse
- Consider caching OCR results for identical images

## Future Enhancements and Planned Features

### Potential Future Work
- Richer dosage rules (take with food, avoid alcohol, etc.)
- Automatic refill reminders based on inventory thresholds
- Drug interaction checking
- Medication history and versioning
- Barcode/QR code scanning as alternative to OCR
- Image analysis results storage
- Medication categorization and tagging
- Prescription integration
- Generic vs brand name handling
- Dosage strength variations

### Out of Scope (Future Phases)
- Direct pharmacy integration
- Automatic prescription refills
- Insurance claim processing
- Drug pricing information
- Pharmacy network integration

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Medication endpoint details
- [Database Schema](../../../artifact/db.md) - Medication schema definition
- [Security Architecture](../../../artifact/security.md) - PHI protection guidelines
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
- [Business Requirements](../../../artifact/BRD.md) - Medication tracking requirements
