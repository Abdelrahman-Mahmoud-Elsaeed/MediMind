# Profile Module

## Module Overview and Purpose

The Profile module handles post-registration user details. It allows Patients and Caregivers to update their personal profiles, upload profile images, link emergency contact card records, and record healthcare provider (physician) credentials.

## Responsibilities and Scope

The Profile module is responsible for:
- Viewing and editing user profile metadata (First Name, Last Name, Phone Number, Date of Birth).
- Managing medical attributes (e.g. Blood Type).
- Managing emergency contact details (Name, Phone).
- Storing primary care physician parameters (Name, Contact Phone, Clinic Name).

The module does NOT handle:
- Account setup or credentials validation (delegated to the Auth module).
- Modifying security settings (delegated to the Settings module).

## Features Owned by the Module

### 1. Profile Editor
- Form to edit basic user information and select a blood type.

### 2. Clinical and Contact Cards
- Card inputs to manage physician details.
- Configuration for emergency contact pairing.

## Functional Requirements

### FR-P-1: Profile Customization
- Users must be able to update contact details and upload profile photos.

### FR-P-2: Clinical Details
- Users must be able to save clinical indicators (Blood Type, Doctor phone).

## Business Rules and Validation Rules

### Profile Inputs (Zod Schema validation)
- **First Name & Last Name:** Required, minimum length of 2 characters.
- **Phone Number:** Required, must be at least 10 digits.
- **Emergency Phone:** Optional, must follow phone format guidelines if entered.
- **Doctor Phone:** Optional, must follow phone format guidelines if entered.

---

## User Workflows

### Update Profile Workflow
```mermaid
sequenceFlow
  participant User
  participant ProfileForm
  participant ProfileActions (updateProfileThunk)
  participant ProfileService
  participant ReduxStore

  User->>ProfileForm: Update First Name, Phone, and Doctor Info
  ProfileForm->>ProfileForm: Validate input values & enable Save changes button
  User->>ProfileForm: Click Save Changes
  ProfileForm->>ProfileActions (updateProfileThunk): Dispatch updateProfile(updatedData)
  ProfileActions (updateProfileThunk)->>ProfileService: Call updateProfile(updatedData)
  ProfileService->>ProfileService: Send PUT request via apiClient
  ProfileService-->>ProfileActions (updateProfileThunk): Return updated user profile
  ProfileActions (updateProfileThunk)-->>ReduxStore: Update state (user details)
```

---

## Components

### ProfileDetailsComponent
Displays active profile data.
- **State:** None.

### EditProfileFormComponent
Interactive editing form.
- **State:**
  - `firstName`, `lastName`, `phone`, `dob`, `bloodType`, `doctorName`, `doctorPhone` (controlled inputs).
  - `touched` (object).
- **Behavior:**
  - Validates fields via `profileSchema.safeParse`.
  - Disables submit changes action if validation fails.

---

## Hooks

### useProfile
Provides interface to access profile details and actions:
- **Exposes:**
  - `profileDetails`: Object containing user profile.
  - `loading`: State of save triggers.
  - Action triggers: `updateProfile()`, `updateDoctorInfo()`.

---

## Services

### profileService
Deports network interactions:
- **Methods:**
  - `getProfile()`: Sends `GET /profile`.
  - `updateProfile(data)`: Sends `PUT /profile`.

---

## State Management

### Redux State Slice (`profileSlice`)
- **Initial State:**
  ```javascript
  {
    profile: null,
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Communicates using the shared Axios `apiClient` defined in `@/shared/lib`.

---

## Routing

Next.js App Router paths:
- `/dashboard/profile`: Overview of profile information.
- `/dashboard/profile/edit`: Renders `EditProfileFormComponent`.

---

## Validation

- Driven by Zod schemas in `validation/profileValidation.js`.
- Outputs warning messages directly under the inputs.
- Outlines text fields in red (`border-error`) upon validation failures.
- Save button is disabled if `!isValid`.
