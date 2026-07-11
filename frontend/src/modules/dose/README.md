# Dose Module

## Module Overview and Purpose

The Dose module handles logging, editing, and tracking of individual medication intakes (doses). It records exactly when a dose was taken, skipped, or missed, enabling precise adherence tracking and calculating history charts for the user's patient profile.

## Responsibilities and Scope

The Dose module is responsible for:
- Tracking and recording medication intakes.
- Maintaining historical logs of doses for Patient and Caregiver views.
- Calculating compliance rates and adherence stats (taken vs. missed ratio).
- Decrementing stock quantities in the Inventory module upon successful intake logs.

The module does NOT handle:
- Defining medication parameters (names, frequencies, shapes) (delegated to the Medication module).
- Dispatching push or SMS alerts (delegated to backend scheduling worker).

## Features Owned by the Module

### 1. Dose Recording
- Interface to select date, time, and log status (`TAKEN`, `SKIPPED`, `MISSED`).
- Logging notes for skipped or delayed doses.

### 2. Historical Logs
- Filterable view listing logs chronologically.

## Functional Requirements

### FR-D-1: Log Intakes
- Users must be able to log dose intake status with timestamps.

### FR-D-2: Adherence Calculations
- The system must compile dose data to output weekly/monthly compliance rates.

## Business Rules and Validation Rules

### Dose Log Inputs (Zod Schema validation)
- **Log Time:** Required, must be a valid date-time string, cannot be a future timestamp.
- **Status:** Required, enum selection of `TAKEN`, `SKIPPED`, `MISSED`.
- **Skip Reason:** Required if status is `SKIPPED`, minimum length of 4 characters, optional otherwise.

---

## User Workflows

### Log Intake Workflow
```mermaid
sequenceFlow
  participant User
  participant DoseModal
  participant DoseActions (logDoseThunk)
  participant DoseService
  participant ReduxStore
  participant Router

  User->>DoseModal: Select Status (e.g. TAKEN) & optional Notes
  DoseModal->>DoseModal: Validate input values & enable Submit
  User->>DoseModal: Click Submit
  DoseModal->>DoseActions (logDoseThunk): Dispatch logDose({ medicationId, status, timestamp })
  DoseActions (logDoseThunk)->>DoseService: Call logDose(medicationId, status, timestamp)
  DoseService->>DoseService: Send POST request via apiClient
  DoseService-->>DoseActions (logDoseThunk): Return logged dose status
  DoseActions (logDoseThunk)-->>ReduxStore: Update state (logs history)
  DoseModal->>Router: Close modal & refresh views
```

---

## Components

### DoseModalComponent
Interactive modal for logging or updating intake records.
- **State:**
  - `status`, `timestamp`, `notes` (controlled inputs).
  - `touched` (object).
- **Behavior:**
  - Derives validity from `doseLogSchema`.
  - Disables logging actions until parameters are verified.

---

## Hooks

### useDoses
Exposes active selectors and async actions:
- **Exposes:**
  - `doseLogs`: Chronological history array.
  - `loading`: Async status tracker.
  - Action triggers: `logDose()`, `deleteDoseLog()`, `getDoseHistory()`.

---

## Services

### doseService
Handles network interactions:
- **Methods:**
  - `getHistory(params)`: Sends `GET /doses`.
  - `logDose(data)`: Sends `POST /doses`.
  - `updateDose(id, data)`: Sends `PUT /doses/${id}`.

---

## State Management

### Redux State Slice (`doseSlice`)
- **Initial State:**
  ```javascript
  {
    logs: [],
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Executes endpoints via the shared Axios `apiClient` defined in `@/shared/lib`.

---

## Routing

Integrated as overlays/modals inside Next.js App Router folders:
- `/dashboard`: Direct interaction via the daily schedule timeline cards.
- `/dashboard/history`: Full audit trail dashboard list.

---

## Validation

- Validated using Zod schemas in `validation/doseValidation.js`.
- Inline messages display under inputs if errors exist.
- Form fields highlight in red (`border-error`) if invalid.
- Submit button is disabled if `!isValid`.
