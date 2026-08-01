# MediMind — Family Caregiver Frontend Pages & Implementation Plan

This document provides the complete specification, route architecture, backend API integration map, and implementation plan for the **FAMILY_CAREGIVER** role in the MediMind application.

---

## 👨‍👩‍👧‍👦 1. Family Caregiver Frontend Pages Overview

These routes require active user authentication and `FAMILY_CAREGIVER` / `CAREGIVER` authorization.

| Route / URL Path | Description | Component / Source File |
| :--- | :--- | :--- |
| `/dashboard` | Caregiver Dashboard — overview of all linked patients, pending invitations, and daily activity feed | [frontend/src/app/(caregiver)/dashboard/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/dashboard/page.jsx) |
| `/patients` | My Patients List — roster of all linked patients with status & relationship info | [frontend/src/app/(caregiver)/patients/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/page.jsx) |
| `/patients/[id]` | Patient Overview — summary dashboard for a specific linked patient | [frontend/src/app/(caregiver)/patients/[id]/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/page.jsx) |
| `/patients/[id]/medications` | Patient Medication Cabinet — view and manage active prescriptions for a specific patient | [frontend/src/app/(caregiver)/patients/[id]/medications/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/medications/page.jsx) |
| `/patients/[id]/adherence` | Patient Adherence Tracker — dose timeline, adherence history, and confirmation for a patient | [frontend/src/app/(caregiver)/patients/[id]/adherence/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/adherence/page.jsx) |
| `/patients/[id]/medical-records` | Patient Medical Records — medical conditions & health records summary for a patient | [frontend/src/app/(caregiver)/patients/[id]/medical-records/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/medical-records/page.jsx) |
| `/profile` | Caregiver Personal Profile — caregiver personal information, preferences, and alert settings | [frontend/src/app/profile/CaregiverProfile.jsx](file:///d:/MediMind/frontend/src/app/profile/CaregiverProfile.jsx) |
| `/notifications` | Caregiver Alerts & System Notifications | [frontend/src/app/notifications/CaregiverNotifications.jsx](file:///d:/MediMind/frontend/src/app/notifications/CaregiverNotifications.jsx) |

---

## ⚡ 2. Backend APIs Available for Caregiver

| API Endpoint | Method | Auth & Authorization | Caregiver Usage & Purpose |
| :--- | :--- | :--- | :--- |
| `GET /relationships` | GET | `authenticate` | ✅ Fetches all patient-caregiver linked relationships |
| `PATCH /relationships/:relationshipId/status` | PATCH | `authorize('CAREGIVER')` | ✅ Accept or reject pending patient invitations |
| `GET /doses?patientId=X&date=Y` | GET | `authenticate` | ✅ Retrieves daily dose schedule for a linked patient |
| `POST /doses/:doseEventId/confirm` | POST | `authenticate` | ✅ Confirms a dose as taken on behalf of the patient |
| `POST /doses/:doseEventId/skip` | POST | `authenticate` | ✅ Marks a dose as skipped on behalf of the patient |
| `GET /medications?patientId=X` | GET | `authenticate` | ✅ Fetches active medications list for a linked patient |
| `GET /medications/:id` | GET | `authenticate` | ✅ Retrieves details for a specific medication |
| `GET /conditions?patientId=X` | GET | `authenticate` | ✅ Fetches medical conditions for a linked patient |
| `GET /profiles/caregiver/me` | GET | `authorize('CAREGIVER')` | ✅ Retrieves logged-in caregiver's profile & alert settings |
| `PUT /profiles/caregiver/me` | PUT | `authorize('CAREGIVER')` | ✅ Updates logged-in caregiver's profile & preferences |

---

## 🛠️ 3. Implementation Plan

### Feature Module Structure (`frontend/src/modules/caregiver/`)

```
frontend/src/modules/caregiver/
├── components/
│   ├── CaregiverDashboardComponent.jsx
│   ├── CaregiverPatientsListComponent.jsx
│   ├── CaregiverPatientDetailComponent.jsx
│   ├── CaregiverPatientMedicationsComponent.jsx
│   ├── CaregiverPatientAdherenceComponent.jsx
│   └── CaregiverPatientRecordsComponent.jsx
├── hooks/
│   └── useCaregiverQueries.js
└── services/
    └── caregiverService.js
```

#### 1. Services (`modules/caregiver/services/caregiverService.js`)
- `getCaregiverProfile()`: Calls `GET /profiles/caregiver/me`.
- `updateCaregiverProfile(payload)`: Calls `PUT /profiles/caregiver/me`.
- `getRelationships()`: Calls `GET /relationships`.
- `updateRelationshipStatus(id, status)`: Calls `PATCH /relationships/:id/status`.
- `getPatientDoses(patientId, date)`: Calls `GET /doses?patientId=X&date=Y`.
- `getPatientMedications(patientId)`: Calls `GET /medications?patientId=X`.
- `getPatientConditions(patientId)`: Calls `GET /conditions?patientId=X`.

#### 2. React Query Hooks (`modules/caregiver/hooks/useCaregiverQueries.js`)
- `useCaregiverProfileQuery()` & `useUpdateCaregiverProfileMutation()`
- `useCaregiverRelationshipsQuery()`
- `useUpdateRelationshipStatusMutation()`
- `usePatientMedicationsQuery(patientId)`
- `usePatientDosesQuery(patientId, dateStr)`
- `usePatientConditionsQuery(patientId)`

#### 3. Frontend Views & Components
- **`CaregiverDashboardComponent.jsx`**: Overview of active linked patients, pending invitation acceptance banner, recent adherence activity stream.
- **`CaregiverPatientsListComponent.jsx`**: Cards grid of linked patients, showing relationship type (e.g. Son, Daughter, Mother), status badge, adherence score %, and action links.
- **`CaregiverPatientDetailComponent.jsx`**: Single patient hub with quick navigation tabs to Medications, Adherence, and Medical Records.
- **`CaregiverPatientMedicationsComponent.jsx`**: Displays patient's cabinet, remaining stocks, dose intervals, and refill status.
- **`CaregiverPatientAdherenceComponent.jsx`**: Daily dose timeline with interactive Take/Skip actions, monthly adherence heatmap, and streak counter.
- **`CaregiverPatientRecordsComponent.jsx`**: Medical conditions list (chronic/acute), diagnosis dates, and notes.

#### 4. Navigation & Layout Updates
- **`Sidebar.jsx` & `MobileNav.jsx`**: Detect `user.role` from Auth context to dynamically render Caregiver navigation items when logged in as `CAREGIVER` / `FAMILY_CAREGIVER`.

---

## 🔍 4. Verification & Testing Strategy

### Automated Verification
```bash
npm --prefix frontend run build
```
Verify zero TypeScript / Next.js route compilation errors across all new `/patients/[id]` subroutes.

### Manual End-to-End Walkthrough
1. Log in with caregiver credentials (`caregiver1@medimind.io` / `Password123!`).
2. Navigate to `/dashboard` to view linked patients summary.
3. Accept/reject pending patient connection request under `/patients`.
4. Click on a patient to view `/patients/[id]` overview, `/patients/[id]/medications`, and `/patients/[id]/adherence`.
5. Confirm or skip a dose for the patient and verify adherence stats update in real-time.
6. Open `/profile` to update caregiver contact details and alert preferences.
