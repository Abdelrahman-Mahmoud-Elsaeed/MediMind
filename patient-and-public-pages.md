# MediMind - Patient & Public Frontend Pages

This document details all public (unauthenticated) and authenticated patient-role frontend pages in the MediMind application structure.

---

## 🌐 1. Public Pages (Unauthenticated)

These routes are accessible without user authentication.

| Route / URL Path | Description | Component / Source File |
| :--- | :--- | :--- |
| `/` | Landing Page & App Overview | [frontend/src/app/(public)/LandingPage.tsx](file:///d:/MediMind/frontend/src/app/(public)/LandingPage.tsx) |
| `/login` | User Login Screen | [frontend/src/app/(public)/login/page.tsx](file:///d:/MediMind/frontend/src/app/(public)/login/page.tsx) |
| `/register` | User Registration Screen | [frontend/src/app/(public)/register/page.tsx](file:///d:/MediMind/frontend/src/app/(public)/register/page.tsx) |
| `/onboarding` | Patient & Caregiver Onboarding Wizard | [frontend/src/app/(public)/onboarding/page.tsx](file:///d:/MediMind/frontend/src/app/(public)/onboarding/page.tsx) |
| `/forgot-password` | Password Recovery Request | [frontend/src/app/(public)/forgot-password/page.tsx](file:///d:/MediMind/frontend/src/app/(public)/forgot-password/page.tsx) |
| `/reset-password` | Reset Password Confirmation | [frontend/src/app/(public)/reset-password/page.tsx](file:///d:/MediMind/frontend/src/app/(public)/reset-password/page.tsx) |
| `/verify` | Email & OTP Verification Page | [frontend/src/app/(public)/verify/page.tsx](file:///d:/MediMind/frontend/src/app/(public)/verify/page.tsx) |

---

## 🩺 2. Patient Pages (Authenticated - PATIENT Role)

These routes require active user authentication and `PATIENT` authorization.

| Route / URL Path | Description | Component / Source File |
| :--- | :--- | :--- |
| `/home` | Patient Dashboard & Upcoming Doses Overview | [frontend/src/app/home/PatientHome.tsx](file:///d:/MediMind/frontend/src/app/home/PatientHome.tsx) |
| `/medications` | Medication Cabinet & Active Prescriptions List | [frontend/src/app/(patient)/medications/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medications/page.tsx) |
| `/medications/add` | Add New Medication Form | [frontend/src/app/(patient)/medications/add/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medications/add/page.tsx) |
| `/medications/[id]` | View Specific Medication Details | [frontend/src/app/(patient)/medications/[id]/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medications/[id]/page.tsx) |
| `/medications/edit/[id]` | Edit Medication Schedule & Quantity | [frontend/src/app/(patient)/medications/edit/[id]/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medications/edit/[id]/page.tsx) |
| `/adherence` | Daily Dose Timeline & Adherence History | [frontend/src/app/(patient)/adherence/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/adherence/page.tsx) |
| `/medical-records` | Health Profile & Medical Records Summary | [frontend/src/app/(patient)/medical-records/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medical-records/page.tsx) |
| `/medical-records/conditions` | View & Manage Medical Conditions | [frontend/src/app/(patient)/medical-records/conditions/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medical-records/conditions/page.tsx) |
| `/medical-records/conditions/add` | Add New Medical Condition | [frontend/src/app/(patient)/medical-records/conditions/add/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medical-records/conditions/add/page.tsx) |
| `/medical-records/conditions/[id]/edit` | Edit Existing Medical Condition | [frontend/src/app/(patient)/medical-records/conditions/[id]/edit/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/medical-records/conditions/[id]/edit/page.tsx) |
| `/caregivers` | Caregivers Roster & Relationship Status | [frontend/src/app/(patient)/caregivers/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/caregivers/page.tsx) |
| `/caregivers/add` | Send Invitation to Add Caregiver | [frontend/src/app/(patient)/caregivers/add/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/caregivers/add/page.tsx) |
| `/caregivers/[id]` | View Caregiver Details & Access Control | [frontend/src/app/(patient)/caregivers/[id]/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/caregivers/[id]/page.tsx) |
| `/ocr-scan` | Scan Prescription Image via OCR | [frontend/src/app/(patient)/ocr-scan/page.tsx](file:///d:/MediMind/frontend/src/app/(patient)/ocr-scan/page.tsx) |
| `/profile` | Patient Personal Profile & Account Settings | [frontend/src/app/profile/PatientProfile.tsx](file:///d:/MediMind/frontend/src/app/profile/PatientProfile.tsx) |
| `/notifications` | Patient Reminders & System Notifications | [frontend/src/app/notifications/PatientNotifications.tsx](file:///d:/MediMind/frontend/src/app/notifications/PatientNotifications.tsx) |
