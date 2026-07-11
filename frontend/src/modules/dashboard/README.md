# Dashboard Module

## Module Overview and Purpose

The Dashboard module acts as the home hub of the MediMind application, bringing together data from the Medication, Dose, and Condition modules. It compiles medication schedules, daily dose logs, and inventory warnings into a single personalized dashboard layout.

## Responsibilities and Scope

The Dashboard module is responsible for:
- Rendering daily, weekly, and monthly calendar timeline summaries of prescribed doses.
- Displaying real-time adherence scores and progress gauges.
- Organizing quick-links for recording immediate doses or managing companion associations.
- Showing notifications, alerts, and dynamic educational banners.

The module does NOT handle:
- Mutating or adding raw medications or dose log entities (delegated to Medication and Dose modules).
- Access control validation (delegated to the Auth module).

## Features Owned by the Module

### 1. Daily Timeline View
- Interactive timeline showing doses grouped by timing (Morning, Afternoon, Evening, Night).
- Quick-log checkbox buttons to record intake directly from the dashboard card.

### 2. Refill and Adherence Indicators
- Graphical indicator displaying current-month adherence rates.
- Panel displaying low inventory alerts.

## Functional Requirements

### FR-D-1: Interactive Daily Timeline
- Authenticated users must see their exact schedule timeline for the current date.
- Caregivers must see the active daily timeline of their selected paired patient.

### FR-D-2: Quick Adherence Gauges
- The system must display a real-time progress circle mapping taken vs. scheduled doses.

---

## User Workflows

### Daily Intake Quick-Log Workflow
```mermaid
sequenceFlow
  participant User
  participant DashboardTimeline
  participant DoseActions (logDoseThunk)
  participant DoseService
  participant ReduxStore

  User->>DashboardTimeline: Click Quick-Take checkbox
  DashboardTimeline->>DoseActions (logDoseThunk): Dispatch logDose({ id, timestamp, status: 'TAKEN' })
  DoseActions (logDoseThunk)->>DoseService: Call logDose(id, timestamp, status)
  DoseService->>DoseService: Send POST request via apiClient
  DoseService-->>DoseActions (logDoseThunk): Return logged dose status
  DoseActions (logDoseThunk)-->>ReduxStore: Update dose status in local cache
  DashboardTimeline->>DashboardTimeline: Recalculate adherence rate metrics
```

---

## Components

### DashboardTimelineComponent
Renders the daily schedule checklist.
- **State:** None (data derived from active medication slices).

### AdherenceGaugeComponent
Displays visual circular progress.
- **State:** None.

---

## Hooks

### useDashboard
Assembles and filters data from multiple store slices:
- **Exposes:**
  - `todayTimeline`: Filtered doses for today.
  - `adherenceScore`: Calculated percentage.
  - `lowInventoryAlerts`: List of warning indicators.

---

## Services

There is no custom service for this module as it coordinates and views data from existing services (Dose, Medication).

---

## State Management

This module does not maintain its own custom slice. It queries other slices (`medication`, `dose`, `inventory`) using custom memoized selectors defined in `@/store`.

---

## API Integration

None (relies on background pre-fetching within the Medication and Dose modules).

---

## Routing

Next.js App Router paths:
- `/dashboard`: Main portal page.

---

## Validation

- Validation checks are not applicable to the main dashboard container itself, but child modals utilize individual form schemas (e.g. Dose logging forms).

---

## Error Handling

- Employs Redux-captured errors from referenced modules, outputting user-friendly notifications in case background loaders fail.
