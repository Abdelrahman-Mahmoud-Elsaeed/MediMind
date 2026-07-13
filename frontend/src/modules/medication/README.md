# Medication Module

## Module Overview and Purpose

The Medication module handles the core setup and management of a patient's medication regimen. Following the BRD, it provides a highly interactive, multi-step intake wizard capturing vital details such as Name, Form Type, Initial Quantity, Dosage Schedule, and Expiration Date.

## Responsibilities and Scope

The Medication module is exclusively responsible for:
- Medication CRUD operations.
- Managing the complex multi-step medication intake wizard.
- Supporting diverse form types (Tablets, Capsules, Syrups, Injections, Drops, Creams, Others).
- Displaying active and inactive medication lists.
- Processing complex dosage schedule inputs.

The module does NOT handle:
- Daily adherence confirmations (Dose module).
- Granular stock tracking displays and refills (Inventory module).

## Features Owned by the Module

### 1. Medication Intake Wizard
- Multi-step form capturing basic details, scheduling, and inventory data.
- Smart Scheduling Engine UI for defining complex dosage spacings (e.g., 'twice a day', 'every 8 hours').

### 2. Regimen Management
- View all active and inactive (stopped) medications.
- Edit existing medication details or cleanly stop an active regimen.

## Functional Requirements

### FR-2.1: Detail Capture (BRD 4.2)
- Users must be able to log a medication explicitly specifying: Name, Form Type, Initial Quantity, Dosage Schedule, and Expiration Date.

### Smart Scheduling UI (Plan Phase 2)
- The UI must allow users to define frequencies that the backend mathematical `timesOfDay` spacing algorithm will use to autogenerate schedules.

## Business Rules and Validation Rules

### Validation Rules
- Medication name, form type, and dosage schedule are strictly required.
- Cannot schedule a new dose regimen to start in the past.
- Stopping a medication must halt future reminders immediately.

## User Workflows

### Add Medication Wizard Workflow
1. User clicks 'Add Medication'.
2. **Step 1:** User inputs Name, Form Type, and optional notes.
3. **Step 2:** User defines the Schedule (Frequency, specific times, or spacing intervals).
4. **Step 3:** User inputs Initial Inventory (Quantity) and Expiration Date.
5. User reviews a summary and submits.
6. System saves the medication; backend generates the future schedule.
7. User is redirected to the Dashboard or Medication list.

## Components

### MedicationWizard
Stateful multi-step form container.
**Props:**
- `onComplete`: Callback function upon final submission.

### MedicationList
List displaying active regimens.
**Props:**
- `medications`: Array of medication objects.

### ScheduleBuilder
Complex form input component for configuring dosage timing.
**Props:**
- `value`: Current schedule configuration.
- `onChange`: Update handler.

## Hooks

### useMedication
Custom hook for medication regimen management.

**Returns:**
```javascript
{
  medications: Medication[],
  isLoading: boolean,
  createMedication: (data: MedicationPayload) => Promise<void>,
  updateMedication: (id: string, data: Partial<Medication>) => Promise<void>,
  stopMedication: (id: string) => Promise<void>
}
```

**Usage:**
```javascript
const { createMedication, isLoading } = useMedication();

const onWizardComplete = async (data) => {
  await createMedication(data);
};
```

## Services

### MedicationService
Service layer for complex medication API payloads.

**Methods:**
- `getMedications()`: GET `/api/v1/medications` - Lists regimens.
- `createMedication(data)`: POST `/api/v1/medications` - Creates new regimen via wizard.
- `updateMedication(id, data)`: PUT `/api/v1/medications/:id` - Updates regimen.
- `stopMedication(id)`: POST `/api/v1/medications/:id/stop` - Halts regimen.

## State Management

### Medication Store
Global state for medications, including transient wizard state to survive unmounts.

**State:**
```javascript
{
  medications: Medication[],
  wizardState: WizardData | null,
  isLoading: boolean
}
```

**Actions:**
- `setMedications(meds)`: Update regimen list.
- `updateWizardState(data)`: Preserve form data between steps.

## API Integration

### Endpoints Used
- `GET /api/v1/medications`
- `POST /api/v1/medications`
- `PUT /api/v1/medications/:id`
- `POST /api/v1/medications/:id/stop`

### Request/Response Handling
- Handles complex nested JSON payloads for scheduling.
- Maps validation errors from the backend to specific wizard steps for proper user correction.

## Routing

### Routes
- `/medications` - Active list view.
- `/medications/new` - Intake wizard entry point.
- `/medications/:id` - Deep details view.

### Navigation
- Wizard uses URL query params (e.g., `?step=2`) or internal state for navigation, allowing browser 'back' button to work within the wizard.

## Validation

### Client-Side Validation
- Complex interdependent field validation (e.g., if frequency is 'Specific Days', the days array cannot be empty).

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
- Minimum 85% statement coverage required for the medication module.
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
- Drug-drug interaction warnings querying an external database during intake.
- Pill identifier image database integration.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Medication Module](../../../backend/src/modules/medication/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
