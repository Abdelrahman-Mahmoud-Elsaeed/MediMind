# Condition Module

## Module Overview and Purpose

The Condition module manages the user's list of medical conditions. These conditions are used across other modules (e.g., checking drug-disease interactions in the Medication module and filtering targeted information inside the Education module) to provide personalized, clinically context-aware features.

## Responsibilities and Scope

The Condition module is responsible for:
- Medical condition management (create, read, update, delete operations).
- Associating severity levels, diagnosis dates, and clinical notes to conditions.
- Serving condition contexts to the Education feed cache.

The module does NOT handle:
- Scheduling doses or logging intakes (delegated to the Dose module).
- Prescribing or cataloging medications (delegated to the Medication module).

## Features Owned by the Module

### 1. Condition Inventory
- Displaying active and resolved conditions for the logged-in user.
- Detail modals displaying severity, diagnosis notes, and diagnosis dates.

### 2. Condition Validation
- Custom form checks ensuring correct condition inputs.

## Functional Requirements

### FR-C-1: Logging Medical Conditions
- Users must be able to log conditions with a mandatory condition name.
- Users must be able to specify severity and date of diagnosis.

### FR-C-2: Historical Archiving
- Users can update conditions or mark them as resolved.

## Business Rules and Validation Rules

### Condition Inputs (Zod Schema validation)
- **Condition Name:** Required, minimum length of 2 characters, maximum of 100 characters.
- **Diagnosis Date:** Optional, but if provided, must be in the past or present (cannot be in the future).
- **Severity:** Required, enum validation selecting from `LOW`, `MODERATE`, `HIGH`.

---

## User Workflows

### Add Medical Condition Workflow
```mermaid
sequenceFlow
  participant User
  participant ConditionForm
  participant ConditionActions (addConditionThunk)
  participant ConditionService
  participant ReduxStore
  participant Router

  User->>ConditionForm: Input Name, Severity, Diagnosis Date
  ConditionForm->>ConditionForm: Validate & enable Save button
  User->>ConditionForm: Click Save
  ConditionForm->>ConditionActions (addConditionThunk): Dispatch addCondition({ name, severity, date })
  ConditionActions (addConditionThunk)->>ConditionService: Call addCondition(name, severity, date)
  ConditionService->>ConditionService: Send POST request via apiClient
  ConditionService-->>ConditionActions (addConditionThunk): Return condition object
  ConditionActions (addConditionThunk)-->>ReduxStore: Update state (conditions list)
  ConditionForm->>Router: Redirect to conditions dashboard
```

---

## Components

### ConditionFormComponent
Input form used for creating or editing conditions.
- **State:**
  - `name`, `severity`, `diagnosisDate`, `notes` (controlled inputs).
  - `touched` (object).
- **Behavior:**
  - Validates fields via `conditionSchema.safeParse`.
  - Disables save button if any fields are invalid.

### ConditionListComponent
Renders active and past conditions list.
- **State:** None.

---

## Hooks

### useConditions
Hook wrapper for condition queries and operations:
- **Exposes:**
  - `conditions`: List of active/past conditions.
  - `loading`: Async operation indicator.
  - Action triggers: `addCondition()`, `updateCondition()`, `deleteCondition()`.

---

## Services

### conditionService
Coordinates API calls:
- **Methods:**
  - `getConditions()`: Sends `GET /conditions`.
  - `addCondition(data)`: Sends `POST /conditions`.
  - `updateCondition(id, data)`: Sends `PUT /conditions/${id}`.
  - `deleteCondition(id)`: Sends `DELETE /conditions/${id}`.

---

## State Management

### Redux State Slice (`conditionSlice`)
- **Initial State:**
  ```javascript
  {
    conditions: [],
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Employs the shared `apiClient` Axios instance with interceptors for token attachment.

---

## Routing

Next.js App Router folders:
- `/dashboard/conditions`: Dashboard condition summary list.
- `/dashboard/conditions/add`: Renders `ConditionFormComponent`.

---

## Validation

- Driven by Zod schemas in `validation/conditionValidation.js`.
- Outputs warning messages directly under the inputs.
- Outlines text fields in red (`border-error`) upon validation failures.
- Save button is disabled if `!isValid`.
