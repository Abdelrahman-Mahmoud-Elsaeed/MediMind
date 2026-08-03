# MediMind — Caregiver Architecture, Frontend Pages & Backend API Specification

This document provides the complete architectural specification, route map, backend API integration breakdown, and implementation plan for the **Caregiver** roles in MediMind, covering both **Family Caregiver (`FAMILY_CAREGIVER`)** and **Professional Caregiver (`PROFESSIONAL_CAREGIVER`)**.

---

## 👥 1. Overview of Caregiver Types in MediMind

MediMind distinguishes between two distinct caregiver profiles, each designed with tailored data schemas, onboarding workflows, and operational capabilities:

| Caregiver Type | Account Role | Database Model | Target Audience & Purpose | Key Attributes & Features |
| :--- | :--- | :--- | :--- | :--- |
| **Family Caregiver** | `FAMILY_CAREGIVER` | `FamilyCaregiver` (`backend/src/modules/auth/models/FamilyCaregiver.model.js`) | Family members, relatives, spouses, sons/daughters, or friends monitoring loved ones' health. | • Free / Premium subscription plans<br>• Relation types (Son, Daughter, Spouse, Parent, Sibling, Friend, Other)<br>• WhatsApp alert opt-in & instant missed dose notifications<br>• Weekly & monthly adherence digest reports |
| **Professional Caregiver** | `PROFESSIONAL_CAREGIVER` | `ProfessionalCaregiver` (`backend/src/modules/auth/models/ProfessionalCaregiver.model.js`) | Certified home-care nurses, healthcare assistants, and palliative care aides hired by patients/families. | • Set hourly rate (`hourlyRate`) & bio<br>• Specialties (Geriatric, Pediatric, Post-Surgery Recovery, Palliative Care, Neurological, General Nursing)<br>• Skills, experience years, and license number (`licenseNumber`)<br>• Real-time availability status (`isAvailable`) & rating (0-5.0)<br>• GeoJSON location (`coordinates`) for local discovery<br>• Support for direct hiring & payments (`PROFESSIONAL_CAREGIVER_HIRE`) |

---

## 👨‍👩‍👧‍👦 2. Caregiver Frontend Pages Breakdown

These routes require active user authentication and `FAMILY_CAREGIVER` or `PROFESSIONAL_CAREGIVER` authorization.

| Route / URL Path | Description | Component / Source File | Target Caregiver Type |
| :--- | :--- | :--- | :--- |
| `/dashboard` | Caregiver Dashboard — overview of all linked patients, pending invitations, daily activity feed, and dose confirmation summary | [frontend/src/app/(caregiver)/dashboard/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/dashboard/page.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/patients` | My Patients List — roster of all linked patients with status & relationship info | [frontend/src/app/(caregiver)/patients/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/page.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/patients/[id]` | Patient Overview — summary dashboard for a specific linked patient | [frontend/src/app/(caregiver)/patients/[id]/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/page.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/patients/[id]/medications` | Patient Medication Cabinet — view and manage active prescriptions for a specific patient | [frontend/src/app/(caregiver)/patients/[id]/medications/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/medications/page.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/patients/[id]/adherence` | Patient Adherence Tracker — dose timeline, adherence history, and confirmation/skip actions on behalf of patient | [frontend/src/app/(caregiver)/patients/[id]/adherence/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/adherence/page.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/patients/[id]/medical-records` | Patient Medical Records — medical conditions & health records summary for a patient | [frontend/src/app/(caregiver)/patients/[id]/medical-records/page.jsx](file:///d:/MediMind/frontend/src/app/(caregiver)/patients/[id]/medical-records/page.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/profile` | Caregiver Personal Profile — profile details, contact info, alert preferences, and professional credentials/rates (for professional caregivers) | [frontend/src/app/profile/CaregiverProfile.jsx](file:///d:/MediMind/frontend/src/app/profile/CaregiverProfile.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |
| `/notifications` | Caregiver Alerts & System Notifications — missed dose alerts, connection requests, and system updates | [frontend/src/app/notifications/CaregiverNotifications.jsx](file:///d:/MediMind/frontend/src/app/notifications/CaregiverNotifications.jsx) | Both (`FAMILY_CAREGIVER` & `PROFESSIONAL_CAREGIVER`) |

---

## ⚡ 3. Backend APIs Available for Caregiver Modules

### 🔐 A. Authentication & Onboarding APIs
| API Endpoint | Method | Auth & Authorization | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | POST | Public | Self-registration for `FAMILY_CAREGIVER` or `PROFESSIONAL_CAREGIVER` |
| `/api/v1/auth/admin/register/professional` | POST | `authorize('ADMIN')` | Admin onboarding of verified Professional Caregivers |
| `/api/v1/auth/login` | POST | Public | Authenticates caregivers and returns JWT with role (`FAMILY_CAREGIVER` / `PROFESSIONAL_CAREGIVER`) |
| `/api/v1/auth/verify-token` | GET | `authenticate` | Validates session token and returns active account payload |

### 👤 B. Caregiver Profile APIs
| API Endpoint | Method | Auth & Authorization | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/profiles/caregiver/me` | GET | `authorize('CAREGIVER', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER')` | Fetches active caregiver profile details (`FamilyCaregiver` or `ProfessionalCaregiver` model) |
| `/api/v1/profiles/caregiver/me` | PUT | `authorize('CAREGIVER', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER')` | Updates caregiver profile information, preferences, alert settings, or professional details |

### 🤝 C. Relationship & Patient Connection APIs
| API Endpoint | Method | Auth & Authorization | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/relationships` | GET | `authenticate` | Fetches all patient-caregiver linked relationships (lists linked patients for caregiver) |
| `/api/v1/relationships/:relationshipId/status` | PATCH | `authorize('CAREGIVER', 'FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER')` | Accepts or rejects pending patient invitations |
| `/api/v1/relationships/:relationshipId` | DELETE | `authorize('PATIENT')` | Revokes an existing patient-caregiver relationship |

### 💊 D. Patient Medication & Adherence Management APIs
| API Endpoint | Method | Auth & Authorization | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/medications?patientId=X` | GET | `authenticate` | Fetches active medications list for a linked patient |
| `/api/v1/medications/:id` | GET | `authenticate` | Retrieves details for a specific medication |
| `/api/v1/doses?patientId=X&date=Y` | GET | `authenticate` | Retrieves daily dose schedule for a linked patient |
| `/api/v1/doses/:doseEventId/confirm` | POST | `authenticate` | Confirms a dose as taken on behalf of the patient |
| `/api/v1/doses/:doseEventId/skip` | POST | `authenticate` | Marks a dose as skipped on behalf of the patient |
| `/api/v1/conditions?patientId=X` | GET | `authenticate` | Fetches medical conditions for a linked patient |
| `/api/v1/notes` | POST | `authenticate` | Creates shared health notes targeting `FAMILY_CAREGIVER` or `PROFESSIONAL_CAREGIVER` |

### 💳 E. Professional Caregiver Hiring & Payment APIs
| API Endpoint | Method | Auth & Authorization | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/payments` | POST | `authenticate` | Handles payments for hiring professional caregivers (`paymentType: "PROFESSIONAL_CAREGIVER_HIRE"`) |

