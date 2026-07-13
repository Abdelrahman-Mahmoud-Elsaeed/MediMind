# Settings Module

## Module Overview and Purpose

The Settings module manages global application preferences. According to the BRD, bilingual localization is a core MVP requirement. Thus, this module handles the critical responsibility of toggling between English (LTR layout) and Arabic (RTL layout) alongside notification preferences.

## Responsibilities and Scope

The Settings module is exclusively responsible for:
- Toggling application language (English/Arabic).
- Dynamically shifting DOM text layout (LTR/RTL).
- Managing notification channel preferences (Push vs SMS).
- Theme management (Light/Dark mode).
- Local persistence of preferences via `localStorage`.

The module does NOT handle:
- Personal profile data edits (Profile module).
- Account deletion or password changes (Auth module).

## Features Owned by the Module

### 1. Localization
- Seamless toggle between English and Arabic using i18n libraries.
- Automatic, jank-free RTL layout switching by modifying document attributes.

### 2. Notification Preferences
- Opt-in/out toggles for specific communication channels (SMS, Push) for the escalation engine.

## Functional Requirements

### FR-4.1: Localization (BRD 4.4)
- The entire user interface must seamlessly toggle between English (LTR) and Arabic (RTL) text layouts. The application must support right-to-left UI mirroring.

### FR-S-2: Alert Configuration
- Users must be able to configure how they receive escalation alerts.

## Business Rules and Validation Rules

### Persistence
- Settings must be persisted locally (`localStorage`) so they are applied immediately before the React app fully hydrates (preventing unstyled flashes).
- Settings must eventually sync to the backend to ensure cross-device consistency.

## User Workflows

### Change Language Workflow
1. User navigates to Settings.
2. User toggles language selection to Arabic.
3. System instantly updates the `dir` attribute on the `<html>` tag to `rtl`.
4. i18n provider re-renders all UI strings in Arabic.
5. System saves the preference locally.
6. System quietly syncs the preference to the backend.

## Components

### LanguageToggle
Switch component for toggling languages.
**Props:** None (Reads from global context)

### NotificationSettings
Form with toggle switches for alert types.
**Props:**
- `preferences`: Current notification configuration object.

## Hooks

### useSettings
Custom hook for application settings and theming.

**Returns:**
```javascript
{
  theme: string,
  language: string,
  notifications: NotificationPrefs,
  updateTheme: (theme: string) => void,
  updateLanguage: (lang: string) => Promise<void>,
  updateNotifications: (prefs: NotificationPrefs) => Promise<void>
}
```

**Usage:**
```javascript
const { language, updateLanguage } = useSettings();

<Button onClick={() => updateLanguage('ar')}>Switch to Arabic</Button>
```

## Services

### SettingsService
Service layer for settings API calls.

**Methods:**
- `getPreferences()`: GET `/api/v1/settings`
- `updatePreferences(data)`: PUT `/api/v1/settings`

## State Management

### Settings Store
Global state for settings, highly coupled with local storage.

**State:**
```javascript
{
  theme: 'light' | 'dark',
  language: 'en' | 'ar',
  notifications: Record<string, boolean>
}
```

**Actions:**
- `setTheme(theme)`: Updates theme and DOM body class.
- `setLanguage(lang)`: Updates language and DOM dir attribute.
- `setNotifications(prefs)`: Updates notification toggles.

## API Integration

### Endpoints Used
- `GET /api/v1/settings`
- `PUT /api/v1/settings`

### Request/Response Handling
- Applies theme/language immediately on the client side for zero latency.
- Syncs to the server in the background, ignoring minor network failures.

## Routing

### Routes
- `/settings` - Central Settings dashboard.

### Navigation
- Exposed as a top-level tab or sidebar menu item.

## Validation

### Client-Side Validation
- Simple boolean and enum validation before saving to localStorage.

### Validation Library
- Uses Zod or Yup schema validation integrated with React Hook Form.

## Error Handling

### Error States
- Network errors: Managed by global axios interceptors, showing generic toast.
- Validation errors: Mapped to specific form fields.
- Server errors (500): Triggers generic error boundary or alert.

### Error Display
- Inline validation messages below form inputs.
- Toast notifications for API success/failure feedback.

## Loading States

### Loading Indicators
- Skeleton loaders displayed while initial fetching is executing.
- Button disable and spinner icons active during form submissions.
- Overlay spinner for critical destructive operations.

## Accessibility

### A11y Considerations
- Form inputs have associated `<label>` elements or `aria-label` attributes.
- Keyboard navigation (Tab) supported across lists and forms.
- Screen reader announcements for form submission success/failure using `aria-live` regions.
- Modal dialogs trap focus until resolved.

## Styling

### Component Styling
- Leverages shared UI components from `src/shared/components` (e.g., `Button`, `Input`, `Card`).
- Consistent design system application (colors, typography).
- Fully responsive layout; lists transition to stacked cards on mobile devices.

## Testing

### Unit Tests
- Component rendering tests.
- Hook state transitions on success/failure.
- Service tests mocking axios to verify correct endpoint calls and payloads.

### Integration Tests
- End-to-end workflows representing core user journeys.

### Test Coverage
- Minimum 85% statement coverage required for the settings module.
- 100% coverage on complex validation logic.

## Performance Considerations

### Optimization
- React components memoized using `React.memo` to prevent unnecessary re-renders.
- Lazy loading for heavy sub-components to reduce initial bundle size.

## Security Considerations

### Client-Side Security
- No sensitive PHI data passed in URL parameters (use POST/PUT bodies).
- Strict output sanitization to prevent XSS.
- Token validation handled gracefully (unauthorized requests redirect to login).

## Future Enhancements

### Potential Future Work
- Custom alert tones for Push notifications.
- Granular timezone overrides for frequent travelers.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Settings Module](../../../backend/src/modules/settings/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
