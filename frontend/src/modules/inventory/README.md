# Inventory Module

## Module Overview and Purpose

The Inventory module tracks the physical quantities of patient medications. As mandated by the BRD, it manages exact stock levels, form types, expiration dates, and interfaces with daily Cron-driven low stock alerts. This module is vital for ensuring patients never run out of critical medications.

## Responsibilities and Scope

The Inventory module is exclusively responsible for:
- Tracking exact remaining quantities of all active medications.
- Flagging medications that are expired or expiring soon.
- Managing refill actions to increase quantities and update expiration dates.
- Calculating estimated run-out dates based on dosage schedules.

The module does NOT handle:
- Automatic deductions (handled by backend via the Dose module).
- Initial creation of medication records (handled by Medication module).

## Features Owned by the Module

### 1. Stock Tracking
- View current stock levels for all active medications in a centralized list.
- Visual progress bars showing remaining stock percentages.
- Explicit 'Low Stock' warning badges.

### 2. Refill Management
- Modal workflow to log a medication refill.
- Update expiration dates for the newly added batch.

## Functional Requirements

### FR-I-1: Quantity Tracking
- System must accurately track exact quantities and form types (e.g., tablets, syrups, injections).

### FR-I-2: Low Stock Alerts (BRD 3.3)
- A daily maintenance Cron job must scan inventory levels and trigger a 'Low Stock' notification when remaining doses fall below a 3-day supply. The UI must reflect this state prominently.

### FR-I-3: Expiration Safety (FR-2.2)
- The system must track remaining dosages and flag medications that have passed their expiration dates, visually indicating they are unsafe.

## Business Rules and Validation Rules

### Deduction Rules
- Quantity *only* decreases upon explicit dose confirmation (Strict Inventory Logic).
- Cannot refill with a negative amount.
- Expiration dates must be in the future when logging a refill.

## User Workflows

### Refill Workflow
1. User navigates to Inventory page and sees a 'Low Stock' warning on a medication.
2. User clicks the 'Refill' button on the medication card.
3. A modal opens asking for the added quantity and the new expiration date.
4. User submits the form.
5. System sends `POST` request to the backend to append stock.
6. System updates the local state, recalculates the run-out date, and clears the 'Low Stock' warning.

## Components

### InventoryList
Displays all tracked medications.
**Props:**
- `items` (InventoryItem[]): Array of inventory objects.

### StockProgress
Visual bar showing remaining stock.
**Props:**
- `current` (number): Current stock amount.
- `total` (number): Original or baseline stock amount for percentage calculation.

### RefillModal
Form to log a new refill.
**Props:**
- `medicationId` (string): ID of the medication being refilled.
- `isOpen` (boolean): Controls modal visibility.

## Hooks

### useInventory
Custom hook for managing stock levels and refill actions.

**Returns:**
```javascript
{
  inventory: InventoryItem[],
  isLoading: boolean,
  logRefill: (medId: string, amount: number, expDate: string) => Promise<void>
}
```

**Usage:**
```javascript
const { inventory, logRefill } = useInventory();

const handleRefill = async (data) => {
  await logRefill(medId, data.amount, data.expirationDate);
};
```

## Services

### InventoryService
Service layer for inventory API calls.

**Methods:**
- `getInventory()`: GET `/api/v1/inventory` - Fetches current stock levels.
- `logRefill(id, data)`: POST `/api/v1/inventory/:id/refill` - Appends stock to a medication.

## State Management

### Inventory Store
Global state for inventory.

**State:**
```javascript
{
  items: InventoryItem[],
  isLoading: boolean
}
```

**Actions:**
- `setItems(items)`: Overwrite inventory list.
- `updateItemStock(id, newStock)`: Optimistically update a specific item's stock.

## API Integration

### Endpoints Used
- `GET /api/v1/inventory`
- `POST /api/v1/inventory/:id/refill`

### Request/Response Handling
- Recalculate estimated depletion dates on the client side immediately for responsive UI feedback.

## Routing

### Routes
- `/inventory` - Main inventory tracking view.

### Navigation
- Refill actions use Modals to keep the user on the main inventory page context.

## Validation

### Client-Side Validation
- Refill amount must be > 0.
- Expiration date must be a valid future date.

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
- Minimum 85% statement coverage required for the inventory module.
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
- Direct pharmacy integration for automatic refills via APIs.
- Barcode scanning to automatically log refills based on pharmacy labels.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Inventory Module](../../../backend/src/modules/inventory/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
