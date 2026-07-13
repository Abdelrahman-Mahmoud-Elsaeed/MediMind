# Profile Module

## Module Overview and Purpose

The Profile module handles the display and management of the user's personal information. Crucially, it enforces the RBAC (Role-Based Access Control) rules defined in the BRD, providing distinct functional portals and layouts for Patients and Companions (Caregivers).

## Responsibilities and Scope

The Profile module is exclusively responsible for:
- Viewing and editing personal profile details (Name, Phone Number, Date of Birth).
- Displaying account metadata and active roles (Patient vs Companion).
- Managing companion links (for patients) or patient lists (for companions).
- Managing avatar/profile picture uploads.

The module does NOT handle:
- Core Authentication or JWT Role assignment (handled by Auth module).
- Application-wide settings like theme or language (handled by Settings module).

## Features Owned by the Module

### 1. Profile Management
- View read-only profile information.
- Update personal details securely.

### 2. Role-based Contexts
- **Patient View:** Displays personal health metrics and companion links.
- **Companion View:** Displays monitored patients and caregiver-specific metrics.

## Functional Requirements

### FR-P-1: Profile Updates
- Users must be able to continually update their profile information to ensure accurate contact details.

### FR-1.1 & FR-1.2: RBAC Enforcement
- The UI must adapt to present distinct functional portals for Patients and Companions based on their role token.

## Business Rules and Validation Rules

### Phone Validation (Critical)
- The phone number must match standard international formats. This is a critical business rule because the Fallback SMS escalation engine relies on this number being valid.

## User Workflows

### Edit Profile Workflow
1. User navigates to the Profile page.
2. User clicks 'Edit Profile' to unlock input fields.
3. User updates their phone number.
4. Client-side Regex validates the international format.
5. User saves, backend updates the database.
6. Global context updates and a success notification is displayed.

## Components

### ProfileView
Read-only display of profile data with role-specific widgets.
**Props:**
- `user` (User): Current user object from Auth context.

### EditProfileForm
Form to update details.
**Props:**
- `initialData` (User): Existing user data.
- `onSave`: Submit handler.

## Hooks

### useProfile
Custom hook for profile data management.

**Returns:**
```javascript
{
  profile: Profile | null,
  isLoading: boolean,
  updateProfile: (data: Partial<Profile>) => Promise<void>
}
```

**Usage:**
```javascript
const { profile, updateProfile } = useProfile();

const onSubmit = async (data) => {
  await updateProfile(data);
};
```

## Services

### ProfileService
Service layer for profile API calls.

**Methods:**
- `getProfile()`: GET `/api/v1/profile` - Fetches detailed profile.
- `updateProfile(data)`: PUT `/api/v1/profile` - Updates profile details.

## State Management

### Profile Store
Often synced directly with the Auth Store's user context to avoid data desynchronization.

**State:**
```javascript
{
  profileData: Profile | null
}
```

**Actions:**
- `setProfile(data)`: Update the global profile object.

## API Integration

### Endpoints Used
- `GET /api/v1/profile`
- `PUT /api/v1/profile`

### Request/Response Handling
- Must synchronize profile changes immediately with the global Auth user context so the navbar and other components reflect the new name/avatar.

## Routing

### Routes
- `/profile` - Unified Profile view and edit page.

### Navigation
- In-place editing is preferred over navigating to a separate `/edit` route.

## Validation

### Client-Side Validation
- First Name and Last Name are required.
- Strict Regex validation for phone numbers (e.g., `^+?[1-9]\d{1,14}$`).

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
- Minimum 85% statement coverage required for the profile module.
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
- Multi-profile management allowing a Caregiver to seamlessly switch between multiple patient contexts without logging out.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Profile Module](../../../backend/src/modules/profile/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
