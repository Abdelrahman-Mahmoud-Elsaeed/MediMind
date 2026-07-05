# Notifications Module

## Module Overview and Purpose

The Notifications module manages notification subscriptions and delivery coordination for reminder and escalation workflows. This module is responsible for registering web push subscriptions, coordinating with the background notification engine, and managing the escalation matrix for missed doses. It serves as the interface between the domain logic and the asynchronous background notification system.

## Responsibilities and Scope

The Notifications module is exclusively responsible for:
- Registering and managing web push subscriptions
- Storing push subscription data (endpoint, keys)
- Coordinating with background workers for notification delivery
- Supporting the escalation matrix for missed dose reminders
- Managing notification preferences and settings
- Providing subscription data to background workers

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Dose event generation (handled by Doses module)
- Background job scheduling (handled by background workers)
- Actual notification delivery (handled by background workers and external services)
- SMS delivery (handled by AWS SNS via background workers)

## Features Owned by the Module

### 1. Web Push Subscription Registration
- Users can register web push subscriptions
- System validates subscription data (endpoint, p256dh, auth)
- System stores subscription data in Account model
- System supports multiple devices per user
- System allows subscription updates and removal

### 2. Subscription Management
- Users can retrieve their current subscriptions
- Users can update subscription data
- Users can remove subscriptions
- System validates subscription ownership

### 3. Notification Coordination
- System provides subscription data to background workers
- System coordinates with Doses module for reminder triggers
- System supports escalation matrix (push → SMS → caregiver alert)
- System tracks notification delivery states

## Functional Requirements

### FR-N-1: Register Push Subscription
- Users must be able to register web push subscriptions
- Subscription must include endpoint, p256dh, and auth keys
- System must validate subscription data format
- System must store subscription in Account model
- System must return confirmation

### FR-N-2: Retrieve Subscriptions
- Users must be able to retrieve their current subscriptions
- System must return subscription data for the authenticated user

### FR-N-3: Update Subscription
- Users must be able to update subscription data
- System must validate subscription ownership
- System must update subscription in Account model

### FR-N-4: Remove Subscription
- Users must be able to remove subscriptions
- System must validate subscription ownership
- System must remove subscription from Account model

## Business Rules and Validation Rules

### Subscription Validation
- **endpoint:** Required string, valid URL
- **keys.p256dh:** Required string, base64-encoded
- **keys.auth:** Required string, base64-encoded

### Subscription Storage
- Subscriptions are stored in the Account model's pushSubscription field
- Each account can have one active subscription at a time (current implementation)
- Future enhancement may support multiple devices per user

### Escalation Matrix
- **Level 1:** Web Push Notification (sent immediately at scheduled time)
- **Level 2:** SMS (sent 15 minutes after push if no confirmation)
- **Level 3:** Caregiver Alert (sent 15 minutes after SMS if no confirmation)
- Escalation states are tracked in Dose Events (escalationState field)

### Access Control
- Users can only access their own subscription data
- No cross-user subscription access allowed
- Subscription operations require authentication

## User Workflows

### Register Subscription Workflow
1. User makes POST request to /notifications/subscribe with subscription data
2. System verifies authentication via access token
3. System extracts accountId from token
4. System validates subscription data format
5. System finds Account by accountId
6. System updates Account.pushSubscription with new subscription data
7. System returns confirmation

### Retrieve Subscription Workflow
1. User makes GET request to /notifications/subscribe
2. System verifies authentication via access token
3. System extracts accountId from token
4. System finds Account by accountId
5. System returns subscription data

### Update Subscription Workflow
1. User makes PUT request to /notifications/subscribe with updated subscription data
2. System verifies authentication via access token
3. System extracts accountId from token
4. System validates subscription data format
5. System finds Account by accountId
6. System updates Account.pushSubscription with new subscription data
7. System returns confirmation

### Remove Subscription Workflow
1. User makes DELETE request to /notifications/subscribe
2. System verifies authentication via access token
3. System extracts accountId from token
4. System finds Account by accountId
5. System clears Account.pushSubscription field
6. System returns confirmation

## Public APIs

### POST /api/v1/notifications/subscribe
**Purpose:** Register web push subscription

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BHP...",
    "auth": "V4..."
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Subscription registered successfully"
  }
}
```

**Validation Rules:**
- endpoint: required string, valid URL
- keys.p256dh: required string
- keys.auth: required string

### GET /api/v1/notifications/subscribe
**Purpose:** Get current subscription

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BHP...",
      "auth": "V4..."
    }
  }
}
```

### PUT /api/v1/notifications/subscribe
**Purpose:** Update subscription

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BHP...",
    "auth": "V4..."
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Subscription updated successfully"
  }
}
```

### DELETE /api/v1/notifications/subscribe
**Purpose:** Remove subscription

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Subscription removed successfully"
  }
}
```

## Data Models and Database Collections

### Account Collection (`accounts`)
Stores push subscription data in the pushSubscription field.

**Schema (pushSubscription field):**
```javascript
pushSubscription: {
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String
  }
}
```

**Relationships:**
- One-to-one with Account

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides accountId and role for authentication
- **Profiles Module:** Provides Patient model for phone number (SMS escalation)

### Provides Subscription Data To:
- **Background Workers:** Use subscription data for push notification delivery
- **Doses Module:** Uses escalation states for notification triggering

### Coordinates With:
- **Doses Module:** Receives dose event data for reminder generation
- **Relationships Module:** Uses caregiver data for escalation alerts

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and user identity
- **Profiles Module:** Patient model for phone number retrieval

### External Services
- **MongoDB Atlas:** Primary data store for subscription data
- **Web Push Service:** (e.g., Firebase Cloud Messaging) - used by background workers
- **AWS SNS:** SMS delivery - used by background workers

### Environment Variables Required
- `VAPID_PUBLIC_KEY`: VAPID public key for web push (if using VAPID)
- `VAPID_PRIVATE_KEY`: VAPID private key for web push (if using VAPID)
- `AWS_SNS_ACCESS_KEY`: AWS SNS access key for SMS (used by background workers)
- `AWS_SNS_SECRET_KEY`: AWS SNS secret key for SMS (used by background workers)

## Background Jobs, Queues, and Scheduled Tasks

### Notification Delivery (Consumes This Module's Data)
- Background workers (Redis + BullMQ) send push notifications using subscription data
- Workers send SMS using phone numbers from Patient profiles
- Workers escalate based on dose event escalationState
- Workers update escalation state in Dose Events

### Escalation Matrix (Consumes Doses Module Data)
- Background workers monitor PENDING dose events
- Workers send push notification at scheduled time (escalationState: NONE → PUSH_SENT)
- Workers send SMS after 15 minutes without confirmation (escalationState: PUSH_SENT → SMS_SENT)
- Workers alert caregiver after 15 more minutes without confirmation (escalationState: SMS_SENT → CAREGIVER_NOTIFIED)

## Configuration and Environment Variables

### Web Push Configuration
- `VAPID_PUBLIC_KEY`: VAPID public key for web push authentication
- `VAPID_PRIVATE_KEY`: VAPID private key for web push authentication
- `VAPID_SUBJECT`: VAPID subject (mailto or URL)

### SMS Configuration
- `AWS_SNS_ACCESS_KEY`: AWS SNS access key
- `AWS_SNS_SECRET_KEY`: AWS SNS secret key
- `AWS_SNS_REGION`: AWS region (e.g., us-east-1)

### Escalation Timing
- Push to SMS delay: 15 minutes (hardcoded)
- SMS to Caregiver delay: 15 minutes (hardcoded)

## Security and Authorization Requirements

### Access Control
- All notification endpoints require authentication (Bearer token)
- Users can only access their own subscription data
- No cross-user subscription access allowed

### Data Protection
- Push subscription keys are sensitive (used for authentication)
- Subscription data is protected by authentication
- Phone numbers used for SMS are sensitive PHI

### Input Validation
- All input validated against Zod schemas
- Subscription endpoint validated as valid URL
- Subscription keys validated as base64 strings

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
- `INVALID_SUBSCRIPTION`: Subscription data format invalid

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log subscription registration events (accountId, timestamp)
- Log subscription update events (accountId, timestamp)
- Log subscription removal events (accountId, timestamp)
- **Never log subscription keys in plain text**

### Audit Requirements
- Track who registered or modified subscriptions
- Record timestamp, User ID, and action taken
- Maintain immutable logs for compliance

## Testing Requirements

### Unit Tests
- Subscription validation schema rules
- Subscription format validation logic

### Integration Tests
- POST /notifications/subscribe - successful registration
- GET /notifications/subscribe - successful retrieval
- PUT /notifications/subscribe - successful update
- DELETE /notifications/subscribe - successful removal

### Security Tests
- Cross-user subscription access attempts
- Invalid subscription data attempts

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Operations
- Subscription operations are simple Account updates
- Subscription retrieval is simple Account lookup
- Response times should be < 50ms for subscription operations

### Background Job Performance
- Push notification delivery depends on external service latency
- SMS delivery depends on AWS SNS latency
- Escalation tracking should use efficient time-based queries

## Future Enhancements and Planned Features

### Potential Future Work
- Multiple device support per user
- Notification preferences (quiet hours, frequency limits)
- Notification history and logs
- In-app notification support
- Email notification channel
- Rich notification templates
- Notification grouping and bundling
- Custom notification sounds
- Notification scheduling (send later)

### Out of Scope (Future Phases)
- Voice call notifications
- In-app chat support
- Social media notifications
- Third-party integrations (Slack, Teams)

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Notification endpoint details
- [Security Architecture](../../../artifact/security.md) - Notification security guidelines
- [Architecture Design](../../../artifact/architecture.md) - Background notification engine
- [Business Requirements](../../../artifact/BRD.md) - Escalation matrix requirements
