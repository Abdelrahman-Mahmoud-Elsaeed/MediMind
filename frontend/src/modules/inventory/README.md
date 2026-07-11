# Inventory Module

## Module Overview and Purpose

The Inventory module manages physical medication quantities inside the user's virtual medicine cabinet. It tracks current pill counts, automatically decrements stock as doses are recorded, and warns users when stock levels fall below predefined thresholds.

## Responsibilities and Scope

The Inventory module is responsible for:
- Tracking current counts of pills, capsules, or liquid volumes for logged medications.
- Emitting threshold-based refill notifications (SMS, email, push warnings).
- Adding stock adjustments (restocks/refills).
- Managing pharmacy prescription numbers.

The module does NOT handle:
- Recording actual medication intake (delegated to the Dose module).
- Automatically processing refills with physical pharmacies (out of application scope).

## Features Owned by the Module

### 1. Stock Tracking
- Panel displaying medication counts.
- Form inputs to log restocks.

### 2. Warning Indicators
- Visual triggers highlighting items requiring immediate refill.

## Functional Requirements

### FR-I-1: Refill Warnings
- System must warn users if a medication quantity drops below its threshold count.

### FR-I-2: Manual Refill Logs
- Users must be able to log manual refills to increase medication counts.

## Business Rules and Validation Rules

### Restock Inputs (Zod Schema validation)
- **Quantity Added:** Required, integer, must be greater than 0.
- **Threshold Limit:** Required, integer, must be greater than or equal to 0.
- **Rx Number:** Optional, alphanumeric code if entered.

---

## User Workflows

### Log Refill Workflow
```mermaid
sequenceFlow
  participant User
  participant RestockForm
  participant InventoryActions (restockThunk)
  participant InventoryService
  participant ReduxStore

  User->>RestockForm: Input Restock Quantity & Threshold Limit
  RestockForm->>RestockForm: Validate inputs & enable Submit Refill button
  User->>RestockForm: Click Submit Refill
  RestockForm->>InventoryActions (restockThunk): Dispatch addInventory({ medicationId, quantity, threshold })
  InventoryActions (restockThunk)->>InventoryService: Call addInventory(medicationId, quantity, threshold)
  InventoryService->>InventoryService: Send POST request via apiClient
  InventoryService-->>InventoryActions (restockThunk): Return updated inventory status
  InventoryActions (restockThunk)-->>ReduxStore: Update state (inventory records list)
```

---

## Components

### CabinetInventoryListComponent
Displays cabinet listing.
- **State:** None.

### RestockFormComponent
Form used for updating restock levels.
- **State:**
  - `quantity`, `threshold`, `rxNumber` (controlled inputs).
  - `touched` (object).
- **Behavior:**
  - Validates fields via `inventorySchema.safeParse`.
  - Disables restock button if inputs are invalid.

---

## Hooks

### useInventory
Custom hook wrapping selectors and actions:
- **Exposes:**
  - `cabinetItems`: Active medication stock list.
  - `lowStockItems`: List of warning items.
  - Action triggers: `addInventory()`, `updateThreshold()`, `getInventory()`.

---

## Services

### inventoryService
Deports network calls:
- **Methods:**
  - `getInventory()`: Sends `GET /inventory`.
  - `addInventory(data)`: Sends `POST /inventory`.
  - `updateThreshold(id, threshold)`: Sends `PUT /inventory/${id}/threshold`.

---

## State Management

### Redux State Slice (`inventorySlice`)
- **Initial State:**
  ```javascript
  {
    items: [],
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Accesses endpoints via the shared Axios `apiClient` defined in `@/shared/lib`.

---

## Routing

Next.js App Router paths:
- `/dashboard/cabinet`: Cabinet visual stock levels.
- `/dashboard/cabinet/restock`: Renders `RestockFormComponent`.

---

## Validation

- Driven by Zod schemas in `validation/inventoryValidation.js`.
- Outputs warning messages directly under the inputs.
- Outlines text fields in red (`border-error`) upon validation failures.
- Restock button is disabled if `!isValid`.
