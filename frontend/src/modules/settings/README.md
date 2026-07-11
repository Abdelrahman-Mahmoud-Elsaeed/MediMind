# Settings Module

## Module Overview and Purpose

The Settings module handles configuration settings for the user interface and notification alerts. It allows Patients and Caregivers to customize notification channels (SMS, email, push), set preferred alert lead times, and switch between light and dark visual themes.

## Responsibilities and Scope

The Settings module is responsible for:
- Saving app-wide preferences (light/dark mode toggle).
- Configuring notification dispatch switches (on/off for email, push, SMS alerts).
- Setting warning offset parameters (e.g. notify 15 mins before a dose).
- Changing locale or language settings.

The module does NOT handle:
- Account setup or password updates (delegated to the Auth module).
- Modifying physician info or emergency contact details (delegated to the Profile module).

## Features Owned by the Module

### 1. Preferences Panel
- Interface to toggle system themes (light, dark, system default).
- Language selectors.

### 2. Alert Customizer
- Checkboxes to toggle email, push, and SMS channels.
- Slider or picker to adjust warning lead offsets.

## Functional Requirements

### FR-S-1: Theme Options
- Users must be able to select and toggle between light, dark, and system themes.

### FR-S-2: Alert Switches
- Users must be able to switch active notifications channels.

## Business Rules and Validation Rules

### Settings Inputs (Zod Schema validation)
- **Theme:** Required, enum selection of `light`, `dark`, `system`.
- **Lead Offset:** Required, integer between 0 and 60 (minutes before dose).
- **Channels:** Required, object specifying booleans for `email`, `sms`, `push`.

---

## User Workflows

### Update Notification Channels Workflow
```mermaid
sequenceFlow
  participant User
  participant SettingsForm
  participant SettingsActions (saveSettingsThunk)
  participant SettingsService
  participant ReduxStore

  User->>SettingsForm: Select Theme & Toggle SMS/Email switches
  SettingsForm->>SettingsForm: Validate configuration & enable Save settings button
  User->>SettingsForm: Click Save Settings
  SettingsForm->>SettingsActions (saveSettingsThunk): Dispatch updateSettings(preferences)
  SettingsActions (saveSettingsThunk)->>SettingsService: Call saveSettings(preferences)
  SettingsService->>SettingsService: Send PUT request via apiClient
  SettingsService-->>SettingsActions (saveSettingsThunk): Return updated settings object
  SettingsActions (saveSettingsThunk)-->>ReduxStore: Update state (user preferences)
```

---

## Components

### SettingsFormComponent
Primary preference editing page.
- **State:**
  - `theme`, `leadTime`, `emailEnabled`, `smsEnabled`, `pushEnabled` (controlled inputs).
  - `touched` (object).
- **Behavior:**
  - Validates fields via `settingsSchema.safeParse`.
  - Disables save actions if fields contain errors.

---

## Hooks

### useSettings
Coordinates app-wide configurations and selectors:
- **Exposes:**
  - `preferences`: Object containing themes and channels data.
  - `loading`: State of saving triggers.
  - Action triggers: `updateSettings()`, `toggleTheme()`.

---

## Services

### settingsService
Integrates API requests:
- **Methods:**
  - `getSettings()`: Sends `GET /settings`.
  - `saveSettings(data)`: Sends `PUT /settings`.

---

## State Management

### Redux State Slice (`settingsSlice`)
- **Initial State:**
  ```javascript
  {
    preferences: {
      theme: 'system',
      leadTime: 15,
      channels: {
        email: true,
        sms: false,
        push: true
      }
    },
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.
  - `setLocalTheme`: Updates local stylesheet without API dispatch.

---

## API Integration

Network requests use the shared Axios `apiClient` defined in `@/shared/lib`.

---

## Routing

Next.js App Router paths:
- `/dashboard/settings`: Primary settings configurations panel.

---

## Validation

- Driven by Zod schemas in `validation/settingsValidation.js`.
- Outlines fields in red (`border-error`) if values do not comply.
- Displays inline messages under inputs.
- Button is disabled if `!isValid`.
