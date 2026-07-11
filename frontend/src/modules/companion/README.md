# Companion Module

## Module Overview and Purpose

The Companion module manages access relationships and permissions between Patients and Caregivers (Companions). It enables caregivers to monitor medication schedules, view dose log histories, track medication inventory warnings, and receive automated SMS or push notifications for missed doses on behalf of the patient.

## Responsibilities and Scope

The Companion module is responsible for:
- Establishing and managing patient-caregiver links (invitations and pairing).
- Verifying access authorizations and permission scopes (e.g., view-only dashboard vs. full medication manager access).
- Providing companion dashboard views showing paired patient daily schedules.
- Delivering automated alerts to companions for patient adherence and refilling needs.

The module does NOT handle:
- App-wide user authentication or registration (delegated to the Auth module).
- Direct logging of doses for the patient (delegated to the Dose module).
- Modifying doctor details or primary care configurations (delegated to the Profile module).

## Features Owned by the Module

### 1. Caregiver Dashboard
- Interface displaying a caregiver's list of linked patients.
- Details panels showing patient daily timelines, medication statuses, and recent logs.

### 2. Linking and Verification
- Form for caregivers to invite patients by email or validation code.
- Verification mechanism for patients to accept or revoke caregiver linkages.

## Functional Requirements

### FR-C-1: Caregiver Pairing
- Caregivers must be able to send pairing requests to patients via email.
- Patients must be able to view, accept, or reject pending pairing requests.

### FR-C-2: Permission Control
- Patients must be able to specify viewing permissions (e.g., read-only vs. read/write).

## Business Rules and Validation Rules

### Pairing Inputs (Zod Schema validation)
- **Email:** Must be a valid email format.
- **Link Code:** Optional, alphanumeric code of exactly 6 characters if entered.
- **Relationship Type:** Required, selected from preset list (e.g., Parent, Spouse, Child, Professional Caregiver).

---

## User Workflows

### Invite Patient Workflow
```mermaid
sequenceFlow
  participant Caregiver
  participant InviteComponent
  participant CompanionActions (inviteThunk)
  participant CompanionService
  participant ReduxStore

  Caregiver->>InviteComponent: Enter Patient Email & select Relationship Type
  InviteComponent->>InviteComponent: Perform validation & enable Send Invitation button
  Caregiver->>InviteComponent: Click Send Invitation
  InviteComponent->>CompanionActions (inviteThunk): Dispatch invitePatient({ email, relationship })
  CompanionActions (inviteThunk)->>CompanionService: Call invitePatient(email, relationship)
  CompanionService->>CompanionService: Send POST request via apiClient
  CompanionService-->>CompanionActions (inviteThunk): Return invitation status
  CompanionActions (inviteThunk)-->>ReduxStore: Update state (activeInvitations)
```

---

## Components

### CaregiverPatientListComponent
Displays the list of linked patients.
- **State:**
  - `selectedPatientId` (string).
- **Behavior:** Renders overview cards for each patient.

### CompanionInviteForm
Form to send link requests to patients.
- **State:**
  - `email`, `relationship` (controlled inputs).
  - `touched` (object tracking blurred/interacted inputs).
- **Behavior:**
  - Derives validity and errors from `companionInviteSchema.safeParse`.
  - Disables submit button until valid.

---

## Hooks

### useCompanions
Custom hook wrapping companion slice selectors and dispatchers:
- **Exposes:**
  - `companions`: List of paired caregivers or patients.
  - `activeInvitations`: Pending pairings list.
  - Action triggers: `sendInvitation()`, `acceptInvitation()`, `removeLink()`.

---

## Services

### companionService
Performs API operations:
- **Methods:**
  - `getLinks()`: Sends `GET /companion/links`.
  - `invitePatient(data)`: Sends `POST /companion/invite`.
  - `acceptInvitation(id)`: Sends `POST /companion/accept`.
  - `removeLink(id)`: Sends `DELETE /companion/link/${id}`.

---

## State Management

### Redux State Slice (`companionSlice`)
- **Initial State:**
  ```javascript
  {
    companions: [],
    activeInvitations: [],
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Network requests utilize the central `apiClient` defined in `@/shared/lib` with automatic auth header injection.

---

## Routing

Next.js App Router paths:
- `/dashboard/companion`: Main caregiver portal page.
- `/dashboard/companion/invite`: Renders `CompanionInviteForm`.

---

## Validation

- Validated using Zod schemas defined in `validation/companionValidation.js`.
- Errors calculate dynamically on render. Invalid fields trigger a red border highlight (`border-error`) and display error text.
- Submit button is bound to validity state (`disabled={!isValid}`).

---

## Error Handling

- API errors store in the Redux slice and present in centralized top-form banners.
- Field-level validation messages display inline.
