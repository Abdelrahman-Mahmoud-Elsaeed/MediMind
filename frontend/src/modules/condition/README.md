# Condition Module

## Module Overview and Purpose

The Condition module manages the user's medical conditions (e.g., Diabetes, Hypertension, Asthma). This module provides the UI components, hooks for state management, and services for communicating with the backend condition endpoints. It serves a critical role in the system because, as per the BRD, these conditions contextually inform medication prescriptions and filter targeted educational content. It allows both Patients and their Companions (Caregivers) to maintain an accurate, up-to-date health profile.

## Responsibilities and Scope

The Condition module is exclusively responsible for:
- Medical condition CRUD operations (create, read, update, delete)
- Linking conditions to a specific patient's profile
- Managing condition severity, clinical notes, and diagnosis dates
- Client-side form validation for condition entry
- Providing condition context to the Education module for personalized content filtering

The module does NOT handle:
- Medication scheduling or tracking (handled by the Medication and Dose modules)
- Fetching and rendering educational content (handled by the Education module)
- User profile management or role assignment (handled by Profile and Auth modules)

## Features Owned by the Module

### 1. Condition Management
- View a comprehensive list of current and past medical conditions.
- Add a new medical condition with details such as diagnosis date and severity.
- Edit existing condition details (e.g., updating notes or severity).
- Remove or archive a condition.

### 2. Condition Validation
- Form validation for condition names (must not be empty).
- Error handling and feedback for API failures.
- Date validation (diagnosis date cannot be in the future).

## Functional Requirements

### FR-C-1: Condition Logging
- Patients must be able to log their medical conditions accurately.
- Users must provide at minimum a condition name.

### FR-C-2: Condition Updates
- The system must allow users to update or delete conditions as their health status changes over time.

### FR-C-3: Cross-Module Integration
- The logged conditions must seamlessly integrate with the Education module to filter health tips and blogs based on the target disease matching the patient's conditions.

## Business Rules and Validation Rules

### Condition Validation
- **Name:** Cannot be empty, max length 100 characters.
- **Diagnosis Date:** Optional, but if provided, cannot be a future date.
- **Data Dependency:** Deleting or adding a condition should gracefully trigger an update to the Education feed cache.

## User Workflows

### Add Condition Workflow
1. User navigates to the Conditions page from the main navigation.
2. User clicks the "Add Condition" button.
3. A modal or dedicated form page opens.
4. User enters the condition name, diagnosis date, and optional notes.
5. System performs client-side validation on inputs.
6. User submits the form.
7. System sends a `POST` request to the backend API.
8. On success: system updates the local Redux/Zustand state and redirects back to the condition list.
9. On error: system displays a toast notification or inline error message.

## Components

### ConditionForm
Form for creating or editing a medical condition.
**Props:**
- `initialData` (Condition | null): Existing condition data for edit mode. Null for create mode.
- `onSuccess` (function): Callback function executed after successful submission.
- `onError` (function): Callback function executed on API failure.

**State:**
- `formData`: Object containing name, diagnosisDate, severity, notes.
- `errors`: Object containing field-level validation errors.
- `isSubmitting`: Boolean tracking API request status.

**Hooks Used:**
- `useConditions`
- `useFormValidation`

### ConditionList
Displays the list of a user's medical conditions.
**Props:**
- `conditions` (Condition[]): Array of condition objects to render.
- `isLoading` (boolean): Whether the initial fetch is in progress.
- `onDelete` (function): Callback triggered when a condition is deleted.

### ConditionCard
Displays a single condition's summary within the list.
**Props:**
- `condition` (Condition): The condition object.
- `onEdit` (function): Callback to open edit mode.
- `onDelete` (function): Callback to confirm deletion.

## Hooks

### useConditions
Custom hook for managing condition state and operations.

**Returns:**
```javascript
{
  conditions: Condition[],
  isLoading: boolean,
  error: Error | null,
  fetchConditions: () => Promise<void>,
  addCondition: (data: Partial<Condition>) => Promise<Condition>,
  updateCondition: (id: string, data: Partial<Condition>) => Promise<Condition>,
  deleteCondition: (id: string) => Promise<void>
}
```

**Usage:**
```javascript
const { conditions, isLoading, addCondition, deleteCondition } = useConditions();

const handleSubmit = async (data) => {
  try {
    await addCondition(data);
    // Handle success
  } catch (err) {
    // Handle error
  }
};
```

## Services

### ConditionService
Service layer for interacting with condition REST API endpoints.

**Methods:**
- `getConditions()`: GET `/api/v1/conditions` - Fetches all conditions for the current user.
- `createCondition(data)`: POST `/api/v1/conditions` - Creates a new condition.
- `updateCondition(id, data)`: PUT `/api/v1/conditions/:id` - Updates an existing condition.
- `deleteCondition(id)`: DELETE `/api/v1/conditions/:id` - Deletes a condition.

## State Management

### Condition Store
Global state for conditions using Redux (or Zustand).

**State:**
```javascript
{
  items: Condition[],
  isLoading: boolean,
  error: string | null,
  lastFetched: number | null
}
```

**Actions:**
- `fetchConditionsStart()`: Sets loading state.
- `fetchConditionsSuccess(conditions)`: Updates items and clears loading.
- `fetchConditionsFailure(error)`: Sets error state.
- `addConditionSuccess(condition)`: Appends new condition to items.
- `updateConditionSuccess(condition)`: Replaces updated condition in items.
- `removeConditionSuccess(id)`: Filters out deleted condition from items.

## API Integration

### Endpoints Used
- `GET /api/v1/conditions`
- `POST /api/v1/conditions`
- `PUT /api/v1/conditions/:id`
- `DELETE /api/v1/conditions/:id`

### Request/Response Handling
- Authorization token automatically attached via axios interceptors.
- Centralized error handling mapping 400 status codes to validation errors.
- Optimistic updates can be applied for deletion to improve perceived performance.

## Routing

### Routes
- `/conditions` - Main list view of conditions.
- `/conditions/new` - Add condition form (could be a separate route or modal).
- `/conditions/:id/edit` - Edit condition form.

### Navigation
- Breadcrumb navigation support.
- Redirects to `/conditions` after successful form submission.

## Validation

### Client-Side Validation
- Condition name is required.
- Diagnosis date must be `<= Date.now()`.

### Validation Library
- Uses Zod or Yup schema validation integrated with React Hook Form.

## Error Handling

### Error States
- Network errors: Managed by global axios interceptors, showing generic toast.
- Validation errors: Mapped to specific form fields (e.g., "Name is required").
- Server errors (500): Triggers generic error boundary or alert.

### Error Display
- Inline validation messages below form inputs.
- Toast notifications for API success/failure feedback.

## Loading States

### Loading Indicators
- Skeleton loaders displayed while `fetchConditions` is executing.
- Button disable and spinner icons active during form submission (`addCondition`, `updateCondition`).
- Overlay spinner for delete operations.

## Accessibility

### A11y Considerations
- Form inputs have associated `<label>` elements or `aria-label` attributes.
- Keyboard navigation (Tab) supported across the list and forms.
- Screen reader announcements for form submission success/failure using `aria-live` regions.
- Delete confirmation dialog traps focus until resolved.

## Styling

### Component Styling
- Leverages shared UI components from `src/shared/components` (e.g., `Button`, `Input`, `Card`).
- Consistent design system application (colors, typography).
- Fully responsive layout; lists transition to stacked cards on mobile devices.

## Testing

### Unit Tests
- `ConditionForm.test.tsx`: Tests rendering, validation errors, and submission.
- `useConditions.test.ts`: Tests hook state transitions on success/failure.
- `ConditionService.test.ts`: Mocks axios to verify correct endpoint calls and payloads.

### Integration Tests
- End-to-end workflow: User can navigate to conditions, click add, fill out the form, submit, and see the new condition in the list.

### Test Coverage
- Minimum 85% statement coverage required for the condition module.
- 100% coverage on complex validation logic.

## Performance Considerations

### Optimization
- Condition list is memoized using `React.memo` to prevent unnecessary re-renders when parent state changes.
- Lazy loading for the `ConditionForm` component to reduce initial bundle size.

## Security Considerations

### Client-Side Security
- No sensitive PHI data passed in URL parameters (use POST/PUT bodies).
- Strict output sanitization to prevent XSS if notes allow rich text.
- Token validation handled gracefully (unauthorized requests redirect to login).

## Future Enhancements

### Potential Future Work
- Integration with standard medical ontologies (ICD-10, SNOMED) via auto-suggest search fields.
- Timeline visualization showing when conditions were diagnosed relative to medication changes.
- Sharing condition profiles securely with healthcare providers via PDF export.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Condition Module](../../../backend/src/modules/condition/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
