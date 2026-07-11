# Medication Module

## Module Overview and Purpose

The Medication module handles the primary setup and scheduling of patient prescriptions. It allows Patients and Caregivers to enter medication names, dosages, instructions (e.g., "take with food"), and define recurring intake timelines (frequencies, cycles, times of day).

## Responsibilities and Scope

The Medication module is responsible for:
- Medication scheduling and schedule mutations (add, edit, list, remove).
- Recording instructions, categories, forms (tablet, liquid), and dosages.
- Running compatibility warnings (checks active drugs against logged conditions).
- Providing schedules to the daily timeline.

The module does NOT handle:
- Recording individual intake events (delegated to the Dose module).
- Monitoring physical pill cabinet stocks (delegated to the Inventory module).

## Features Owned by the Module

### 1. Prescription Form
- Step-by-step form to select pill type, dose metrics, daily frequency, and intake instructions.

### 2. Medication Organizer
- List view of active and archived prescriptions.

## Functional Requirements

### FR-M-1: Prescription Scheduling
- Users must be able to schedule medication intakes by defining times and intervals.

### FR-M-2: Instruction Labels
- The system must display warning advice (e.g. "Take after meal") alongside schedules.

## Business Rules and Validation Rules

### Prescription Inputs (Zod Schema validation)
- **Medication Name:** Required, minimum length of 2 characters.
- **Dosage Value:** Required, numeric value greater than 0.
- **Frequency:** Required, integer between 1 and 8 (doses per day).
- **Scheduled Times:** Required, array of valid time strings matching frequency count.

---

## User Workflows

### Schedule Prescription Workflow
```mermaid
sequenceFlow
  participant User
  participant MedicationForm
  participant MedicationActions (addMedicationThunk)
  participant MedicationService
  participant ReduxStore
  participant Router

  User->>MedicationForm: Input Name, Dosage, Frequency & Times
  MedicationForm->>MedicationForm: Validate input values & enable Schedule button
  User->>MedicationForm: Click Schedule
  MedicationForm->>MedicationActions (addMedicationThunk): Dispatch addMedication({ name, dosage, schedule })
  MedicationActions (addMedicationThunk)->>MedicationService: Call addMedication(name, dosage, schedule)
  MedicationService->>MedicationService: Send POST request via apiClient
  MedicationService-->>MedicationActions (addMedicationThunk): Return medication object
  MedicationActions (addMedicationThunk)-->>ReduxStore: Update state (active medications list)
  MedicationForm->>Router: Redirect to medications schedule manager
```

---

## Components

### MedicationFormComponent
Form used for registering or editing medication items.
- **State:**
  - `name`, `dosage`, `frequency`, `times`, `instructions` (controlled inputs).
  - `touched` (object).
- **Behavior:**
  - Validates fields via `medicationSchema.safeParse`.
  - Disables scheduling action until all criteria are met.

---

## Hooks

### useMedications
Provides queries and operational access:
- **Exposes:**
  - `medicationsList`: Active medications.
  - `loading`: Async indicator.
  - Action triggers: `addMedication()`, `archiveMedication()`, `fetchMedications()`.

---

## Services

### medicationService
Orchestrates API queries:
- **Methods:**
  - `getMedications()`: Sends `GET /medications`.
  - `addMedication(data)`: Sends `POST /medications`.
  - `archiveMedication(id)`: Sends `DELETE /medications/${id}`.

---

## State Management

### Redux State Slice (`medicationSlice`)
- **Initial State:**
  ```javascript
  {
    medications: [],
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Network requests use the shared Axios `apiClient` defined in `@/shared/lib`.

---

## Routing

Next.js App Router paths:
- `/dashboard/medications`: Active prescriptions overview list.
- `/dashboard/medications/add`: Renders `MedicationFormComponent`.

---

## Validation

- Validated using Zod schemas in `validation/medicationValidation.js`.
- Outlines fields in red (`border-error`) if values do not comply.
- Displays inline messages under inputs.
- Button is disabled if `!isValid`.
