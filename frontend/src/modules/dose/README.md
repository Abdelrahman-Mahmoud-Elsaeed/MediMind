# Dose Module

## Module Overview and Purpose

The Dose module specifically manages medication adherence events. According to the BRD, this module handles the strict inventory logic where doses must be explicitly confirmed as taken. This confirmation triggers backend inventory deductions and halts any active escalation pipelines (Push -> SMS -> Companion).

## Responsibilities and Scope

The Dose module is exclusively responsible for:
- Displaying individual dose events and their statuses (pending, taken, missed).
- Handling the user's explicit confirmation of taking a dose.
- Integrating closely with the backend to halt Cron escalation workers upon confirmation.
- Displaying historical dose logs for adherence tracking.

The module does NOT handle:
- Generating the future dose schedule (handled by Backend Medication logic).
- Managing raw inventory remaining stock views (handled by Inventory module).

## Features Owned by the Module

### 1. Dose Interaction
- Explicitly mark a pending dose as taken.
- Mark a dose as missed.
- Retrospectively log a dose taken in the past.

### 2. Dose History
- View a paginated history of past dose events.
- Filter historical doses by date range or specific medication.

## Functional Requirements

### Strict Inventory Logic (BRD 3.1)
- The remaining quantity of a medication must not automatically decrement when a reminder is sent. It decreases *only* when the user explicitly confirms that the dose has been successfully taken.

### Escalation Engine Halting
- Confirming a dose must communicate with the backend to immediately halt the 3-step escalation protocol.

## Business Rules and Validation Rules

### Timing Constraints
- Future doses cannot be marked as taken early (to prevent accidental early deductions).
- A dose can be confirmed retrospectively if the user missed the initial notification.

## User Workflows

### Confirm Dose Workflow
1. User views a pending dose on the dashboard or dose list.
2. User clicks the 'Confirm Dose' action button.
3. A confirmation prompt may appear to ensure accuracy.
4. System sends a `POST` request to update dose status to 'taken'.
5. Backend deducts from inventory and halts escalation.
6. System displays a success toast and updates the UI state immediately.

## Components

### DoseCard
Interactive card for a single dose event, typically embedded in the dashboard.
**Props:**
- `dose` (Dose): Dose object containing timing and medication details.
- `onConfirm` (function): Callback function to mark as taken.

### DoseHistoryList
List component for viewing past doses.
**Props:**
- `doses` (Dose[]): Array of historical dose objects.
- `filters` (Object): Active date/medication filters.

## Hooks

### useDoses
Custom hook for managing dose events and interactions.

**Returns:**
```javascript
{
  doses: Dose[],
  isLoading: boolean,
  confirmDose: (id: string) => Promise<void>,
  missDose: (id: string) => Promise<void>
}
```

**Usage:**
```javascript
const { confirmDose, isLoading } = useDoses();

const handleConfirm = async () => {
  await confirmDose(dose.id);
};
```

## Services

### DoseService
Service layer for dose API calls.

**Methods:**
- `getDoses(params)`: GET `/api/v1/doses` - Fetches doses with optional query filters.
- `confirmDose(id)`: POST `/api/v1/doses/:id/confirm` - Confirms a specific dose.
- `missDose(id)`: POST `/api/v1/doses/:id/miss` - Marks a dose as missed.

## State Management

### Dose Store
Global state for doses, often integrated closely with the Dashboard store.

**State:**
```javascript
{
  history: Dose[],
  isLoading: boolean,
  totalCount: number
}
```

**Actions:**
- `setHistory(doses)`: Update historical list.
- `updateDoseStatus(id, status)`: Optimistically update a specific dose's status.

## API Integration

### Endpoints Used
- `GET /api/v1/doses`
- `POST /api/v1/doses/:id/confirm`
- `POST /api/v1/doses/:id/miss`

### Request/Response Handling
- Implements optimistic UI updates for dose confirmation to make the app feel incredibly fast.
- Reverts local state if the API confirmation call fails.

## Routing

### Routes
- `/doses` - Detailed dose history view.

### Navigation
- Generally navigated to from the Dashboard or a 'History' tab.

## Validation

### Client-Side Validation
- Client explicitly prevents clicking 'Confirm' on future timestamped doses.

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
- Minimum 85% statement coverage required for the dose module.
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
- Machine learning integrations for predicting likelihood of missed doses.
- Smart watch/wearable integration for quick 1-tap confirmation.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Dose Module](../../../backend/src/modules/dose/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
