# Dashboard Module

## Module Overview and Purpose

The Dashboard module serves as the main landing page and daily hub for the user (Patient and Caregiver). Based on the BRD, it aggregates data from multiple modules to provide a comprehensive daily timeline of pending, taken, and missed doses, alongside alerts for low stock. It provides a holistic, at-a-glance view of the user's daily health regimen.

## Responsibilities and Scope

The Dashboard module is exclusively responsible for:
- Rendering the interactive daily calendar/timeline view.
- Aggregating pending, taken, and missed doses for the current day from the Dose module.
- Displaying critical alerts (e.g., low stock, missed doses) from the Inventory and Escalation modules.
- Providing quick-action entry points for dose confirmation.

The module does NOT handle:
- CRUD operations for medications or conditions (handled by Medication/Condition modules).
- Educational feeds (handled by Education module).
- Deep dose confirmation logic (delegated to Dose module components integrated here).

## Features Owned by the Module

### 1. Daily Overview Timeline
- Interactive daily calendar view highlighting the current day's schedule.
- Medication cards showing time, drug name, and dosage instructions for today's doses.

### 2. Global Alert System
- Visual, high-priority alerts for low inventory (triggered when stock < 3 days).
- Missed dose notifications requiring immediate attention.

## Functional Requirements

### FR-D-1: Daily Schedule
- The dashboard must accurately display all doses scheduled for the current day in chronological order.

### FR-D-2: Alert Highlighting
- Medications with stock below the refillThreshold must be highlighted (e.g., in red) to prompt refill actions.

### FR-D-3: Quick Actions
- Users must be able to interact with pending dose cards directly from the dashboard to mark them as taken or missed.

## Business Rules and Validation Rules

### Data Aggregation Rules
- The Dashboard strictly relies on real-time state from Dose and Inventory modules.
- It must reflect the accurate timezone of the patient to avoid premature or delayed dose prompts.
- Alerts must be cleared automatically once the underlying issue (e.g., low stock) is resolved.

## User Workflows

### Daily Review Workflow
1. User logs in and is automatically redirected to the Dashboard.
2. User views the timeline of doses for today, identifying pending vs taken doses.
3. User clicks on a pending dose card.
4. A Dose confirmation modal/action triggers.
5. Upon success, the Dashboard UI updates instantly, moving the dose to the 'Taken' section.

## Components

### DashboardOverview
Main container component coordinating state and layout.
**Props:** None
**State:** Aggregated loading state, error states.
**Hooks Used:** `useDashboardData`

### DailyTimeline
Renders the chronological schedule of doses.
**Props:**
- `doses` (Dose[]): Array of dose events.
- `onDoseClick` (function): Handler for interaction.

### AlertsWidget
Displays low stock and missed dose alerts prominently.
**Props:**
- `alerts` (Alert[]): Array of alert objects.
- `onAlertClick` (function): Navigation handler.

## Hooks

### useDashboardData
Custom hook for fetching aggregated dashboard data including timeline doses and active alerts.

**Returns:**
```javascript
{
  dailyDoses: Dose[],
  alerts: Alert[],
  isLoading: boolean,
  error: Error | null,
  refreshData: () => Promise<void>
}
```

**Usage:**
```javascript
const { dailyDoses, alerts, isLoading, refreshData } = useDashboardData();

useEffect(() => {
  refreshData();
}, [refreshData]);
```

## Services

### DashboardService
Service layer for aggregated dashboard REST API calls.

**Methods:**
- `getDailySummary(date)`: GET `/api/v1/dashboard/summary?date={date}` - Fetches today's doses.
- `getAlerts()`: GET `/api/v1/dashboard/alerts` - Fetches active global alerts.

## State Management

### Dashboard Store
Global state for dashboard data utilizing Redux or Zustand.

**State:**
```javascript
{
  selectedDate: string (ISO),
  summary: SummaryData | null,
  alerts: Alert[],
  isLoading: boolean,
  error: string | null
}
```

**Actions:**
- `setSelectedDate(date)`: Changes the viewed date for the timeline.
- `fetchSummaryStart()`: Initiates loading sequence.
- `fetchSummarySuccess(data)`: Updates summary and clears loading.
- `setAlerts(alerts)`: Updates active alerts.

## API Integration

### Endpoints Used
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/alerts`

### Request/Response Handling
- Implements data caching for quick navigation between days.
- May include background polling or WebSocket listeners for real-time updates.

## Routing

### Routes
- `/dashboard` - Main dashboard view (Protected Route).

### Navigation
- Clicking on a specific alert navigates to the respective module (e.g., `/inventory` for low stock).

## Validation

### Client-Side Validation
- Date range validation for calendar picking (restricting viewing too far into the past/future).

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
- Minimum 85% statement coverage required for the dashboard module.
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
- Gamification metrics (streaks, adherence percentages).
- Advanced Caregiver summary view with multiple patient selection.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Dashboard Module](../../../backend/src/modules/dashboard/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
