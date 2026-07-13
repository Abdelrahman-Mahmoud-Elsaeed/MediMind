# Doses Module

## Module Overview and Purpose

The Doses module manages adherence tracking and dose event lifecycle for scheduled medication intake. This module is responsible for generating dose events from medication schedules, tracking dose confirmations, managing inventory updates, and maintaining adherence history. It serves as the transactional audit trail that drives the background notification system.

## Responsibilities and Scope

The Doses module is exclusively responsible for:
- Generating dose events from medication schedules
- Retrieving daily medication schedules for patients
- Processing dose confirmation actions (taken, skipped, missed)
- Updating medication inventory on dose confirmation
- Tracking dose status transitions (PENDING → TAKEN/MISSED/SKIPPED)
- Managing notification escalation states
- Providing adherence history and summaries

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Medication data (handled by Medications module)
- Notification delivery (handled by Notifications module)
- Background job scheduling (handled by background workers)
- Inventory management logic (uses Medications module for updates)

## Features Owned by the Module

### 1. Dose Event Generation
- Background workers generate dose events from medication schedules
- System creates dose events for upcoming doses (typically next 24 hours)
- System links dose events to medications and patients
- System sets initial status to PENDING
- System sets initial escalation state to NONE

### 2. Daily Schedule Retrieval
- Patients can retrieve their daily medication schedule
- Authorized caregivers can retrieve schedules for linked patients
- System supports filtering by patient and date
- System returns dose events with medication details and status

### 3. Dose Confirmation
- Patients can confirm doses as taken
- System validates dose exists and is in PENDING status
- System updates dose status to TAKEN
- System decrements medication inventory (CRITICAL: only on explicit confirmation)
- System records takenAt timestamp
- System returns updated inventory count

### 4. Dose Status Management
- Doses can be marked as TAKEN, MISSED, or SKIPPED
- System validates status transitions are valid
- System updates escalation state based on status
- System records timestamps for status changes

### 5. Adherence Tracking
- System maintains dose event history
- System provides adherence summaries
- System tracks missed doses for escalation

## Functional Requirements

### FR-D-1: Get Daily Schedule
- Patients must be able to retrieve their daily medication schedule
- Authorized caregivers must be able to retrieve schedules for linked patients
- System must support filtering by patient and date
- System must return dose events with medication details and status

### FR-D-2: Confirm Medication Taken
- Patients must be able to confirm doses as taken
- System must validate dose exists and is in PENDING status
- System must update dose status to TAKEN
- **CRITICAL:** System must decrement medication inventory only on explicit confirmation
- System must return updated inventory count

### FR-D-3: Dose Status Updates
- System must support status transitions (PENDING → TAKEN/MISSED/SKIPPED)
- System must validate status transitions are valid
- System must update escalation state based on status
- System must record timestamps for status changes

## Business Rules and Validation Rules

### Dose Event Validation
- **medicationId:** Required ObjectId, must reference existing Medication
- **patientId:** Required ObjectId, must reference existing Patient
- **scheduledFor:** Required Date, indexed for efficient queries
- **status:** Enum: PENDING, TAKEN, MISSED, SKIPPED, default PENDING, indexed
- **takenAt:** Date, default null
- **escalationState:** Enum: NONE, PUSH_SENT, SMS_SENT, CAREGIVER_NOTIFIED, default NONE

### Inventory Rules (Critical)
- **CRITICAL RULE:** Inventory currentQuantity must NOT automatically decrement when a reminder is sent
- **CRITICAL RULE:** Inventory currentQuantity decreases ONLY when user explicitly confirms dose via this module
- **CRITICAL RULE:** System must validate currentQuantity >= doseAmount before allowing confirmation
- **CRITICAL RULE:** System must block confirmation if medication is past expirationDate

### Status Transitions
- **PENDING → TAKEN:** User confirms dose taken
- **PENDING → MISSED:** Background worker marks as missed after escalation timeout
- **PENDING → SKIPPED:** User explicitly skips dose
- **TAKEN/MISSED/SKIPPED:** Terminal states, no further transitions

### Escalation State Transitions
- **NONE → PUSH_SENT:** Background worker sends push notification
- **PUSH_SENT → SMS_SENT:** Background worker sends SMS after 15 minutes without confirmation
- **SMS_SENT → CAREGIVER_NOTIFIED:** Background worker alerts caregiver after 15 more minutes without confirmation

### Access Control
- Patients can only access their own dose events
- Caregivers can only access dose events for patients with ACCEPTED relationship
- Caregiver access requires canAddMedication permission flag
- No cross-user access allowed

### Schedule Generation
- Dose events are generated by background workers from medication schedules
- Dose events are typically generated for next 24 hours
- Chronic medications generate dose events indefinitely
- Acute medications generate dose events until endDate

## User Workflows

### Get Daily Schedule Workflow
1. User makes GET request to /doses with patientId and date query parameters
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. If PATIENT: system validates patientId matches user's patient record
5. If CAREGIVER: system validates relationship with patient and canAddMedication permission
6. System finds all dose events for patient on specified date
7. System populates medication details for each dose event
8. System returns list of dose events with medication information

### Confirm Dose Taken Workflow
1. User makes POST request to /doses/:doseEventId/confirm
2. System verifies authentication via access token
3. System extracts accountId and role from token
4. System finds dose event by doseEventId
5. System validates user has access to this dose (patient or authorized caregiver)
6. System validates dose status is PENDING
7. System validates medication is not expired
8. System validates currentQuantity >= doseAmount
9. System updates dose status to TAKEN
10. System records takenAt timestamp
11. System decrements medication currentQuantity by doseAmount
12. System returns updated dose status and remaining inventory

### Mark Dose Missed Workflow (Background Worker)
1. Background worker identifies PENDING doses past escalation timeout
2. System updates dose status to MISSED
3. System records missed timestamp
4. System does NOT decrement inventory (only explicit confirmations decrement)

### Mark Dose Skipped Workflow
1. User makes POST request to /doses/:doseEventId/skip
2. System verifies authentication via access token
3. System validates dose status is PENDING
4. System updates dose status to SKIPPED
5. System records skipped timestamp
6. System does NOT decrement inventory (only explicit confirmations decrement)

## Public APIs

### GET /api/v1/doses
**Purpose:** Get daily medication schedule for a patient

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `patientId`: Patient ID (required for caregivers, optional for patients)
- `date`: Date in ISO format (required, default: today)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "doseEventId": "64a1g...",
      "medicationId": "64a2g...",
      "medicationName": "Metformin",
      "scheduledFor": "2024-07-15T08:00:00Z",
      "status": "PENDING"
    }
  ]
}
```

### POST /api/v1/doses/:doseEventId/confirm
**Purpose:** Confirm medication taken

**Authentication:** Required (Bearer token)

**Request:** None (doseEventId in URL)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doseEventId": "64a1g...",
    "status": "TAKEN",
    "takenAt": "2024-07-15T08:05:00Z",
    "inventoryRemaining": 59
  }
}
```

### POST /api/v1/doses/:doseEventId/skip
**Purpose:** Skip a dose

**Authentication:** Required (Bearer token)

**Request:** None (doseEventId in URL)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doseEventId": "64a1g...",
    "status": "SKIPPED",
    "skippedAt": "2024-07-15T08:05:00Z"
  }
}
```

## Data Models and Database Collections

### Dose Events Collection (`dose_events`)
The transactional audit trail. Drives the background Cron workers and notifications.

**Schema:**
```javascript
{
  medicationId: ObjectId (ref: 'Medication', required),
  patientId: ObjectId (ref: 'Patient', required),
  scheduledFor: Date (required, indexed),
  status: String (enum: ['PENDING', 'TAKEN', 'MISSED', 'SKIPPED'], default: 'PENDING', indexed),
  takenAt: Date (default: null),
  escalationState: String (enum: ['NONE', 'PUSH_SENT', 'SMS_SENT', 'CAREGIVER_NOTIFIED'], default: 'NONE')
}
```

**Indexes:**
- Index on scheduledFor for efficient time-based queries
- Index on status for filtering by status
- Compound index on { status: 1, scheduledFor: 1 } for background worker queries
- Default index on _id

**Relationships:**
- Many-to-one with Medication via medicationId
- Many-to-one with Patient via patientId

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides accountId and role for authentication
- **Profiles Module:** Provides Patient model for validation
- **Relationships Module:** Provides permission checks for caregiver access
- **Medications Module:** Provides Medication model for validation and inventory updates

### Provides Dose Event Data To:
- **Notifications Module:** Uses dose events for reminder generation and escalation
- **Background Workers:** Use dose events for generating reminders and tracking escalations

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and user identity
- **Profiles Module:** Patient model for validation
- **Relationships Module:** Permission checks for caregiver access
- **Medications Module:** Medication model for validation and inventory updates

### External Services
- **MongoDB Atlas:** Primary data store for dose event records

### Environment Variables Required
None specific to this module. Uses shared database configuration.

## Background Jobs, Queues, and Scheduled Tasks

### Dose Event Generation (Consumes Medications Module Data)
- Background workers (Redis + BullMQ) generate dose events from medication schedules
- Workers scan medications and create dose events for upcoming doses
- Typically runs daily to generate next 24 hours of dose events
- Dose events are created with PENDING status and NONE escalation state

### Escalation Tracking (Consumes This Module's Data)
- Background workers monitor PENDING dose events
- Workers update escalation state based on time elapsed
- Workers trigger notifications through Notifications module
- Workers mark doses as MISSED after escalation timeout

### Inventory Check (Consumes Medications Module Data)
- Daily maintenance job scans inventory levels
- Triggers "Low Stock" notification when currentQuantity < refillThreshold
- Uses 3-day supply threshold for low stock alerts

## Configuration and Environment Variables

No module-specific configuration required. Uses shared database configuration.

## Security and Authorization Requirements

### Access Control
- All dose endpoints require authentication (Bearer token)
- Patients can only access their own dose events
- Caregivers can only access dose events for patients with ACCEPTED relationship
- Caregiver access requires canAddMedication permission flag
- No cross-user access allowed

### Data Protection
- Dose event data is sensitive PHI (medication adherence information)
- Dose event records are protected by authentication and RBAC
- Caregiver access is gated by relationship permissions

### Input Validation
- All input validated against Zod schemas
- patientId validated to reference existing Patient
- doseEventId validated to reference existing DoseEvent
- date validated as valid ISO date format

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
- `FORBIDDEN`: User does not have permission to access this dose
- `DOSE_NOT_FOUND`: Dose event does not exist
- `PATIENT_NOT_FOUND`: Patient does not exist
- `INSUFFICIENT_PERMISSIONS`: Caregiver lacks canAddMedication permission
- `INVALID_STATUS_TRANSITION`: Cannot transition from current status
- `INSUFFICIENT_INVENTORY`: Current quantity less than dose amount
- `MEDICATION_EXPIRED`: Medication has passed expiration date

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log dose confirmation events (doseEventId, patientId, medicationId, timestamp)
- Log dose status changes (doseEventId, fromStatus, toStatus, actor, timestamp)
- Log inventory updates (medicationId, oldQuantity, newQuantity, timestamp)
- **Never log sensitive medication data in plain text**

### Audit Requirements
- Track who confirmed doses or changed dose status
- Record timestamp, User ID, and action taken
- Maintain immutable logs for compliance
- Inventory changes must be auditable
- Caregiver actions must be auditable

## Testing Requirements

### Unit Tests
- Dose validation schema rules
- Status transition logic
- Inventory decrement logic
- Escalation state transition logic
- Expiration validation logic

### Integration Tests
- GET /doses - successful schedule retrieval by patient
- GET /doses - successful schedule retrieval by authorized caregiver
- GET /doses - forbidden (unauthorized caregiver)
- POST /doses/:id/confirm - successful confirmation
- POST /doses/:id/confirm - insufficient inventory
- POST /doses/:id/confirm - expired medication
- POST /doses/:id/skip - successful skip
- POST /doses/:id/confirm - invalid status transition

### Security Tests
- Cross-user dose access attempts
- Permission bypass attempts
- Caregiver access without canAddMedication permission
- Inventory manipulation attempts

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Indexing
- Index on scheduledFor for efficient time-based queries
- Index on status for filtering by status
- Compound index on { status: 1, scheduledFor: 1 } for background worker queries

### Query Optimization
- Dose queries are simple by patientId, date, or status lookups
- Schedule retrieval requires joining with Medication for details
- Inventory updates require atomic operations to prevent race conditions

### Background Job Performance
- Dose event generation should be batched for efficiency
- Escalation tracking should use efficient time-based queries
- Inventory checks should be optimized for large patient bases

## Future Enhancements and Planned Features

### Potential Future Work
- Advanced adherence analytics and reporting
- Adherence trend visualization
- Predictive missed dose detection
- Dose timing flexibility (take early/late windows)
- Dose notes and side effect tracking
- Adherence gamification and rewards
- Integration with wearable devices
- Automatic dose confirmation from smart pillboxes

### Out of Scope (Future Phases)
- Direct integration with pharmacy dispensing systems
- Insurance adherence reporting
- Clinical trial adherence monitoring
- Real-time biometric dose confirmation

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Dose endpoint details
- [Database Schema](../../../artifact/db.md) - Dose event schema definition
- [Security Architecture](../../../artifact/security.md) - PHI protection guidelines
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
- [Business Requirements](../../../artifact/BRD.md) - Inventory and escalation requirements
