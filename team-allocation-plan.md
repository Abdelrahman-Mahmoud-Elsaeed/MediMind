# 2-Week MVP Extraction & Team Allocation Plan
**Intelligent Medication Management Platform**  
**Duration:** 2 Weeks (10 Working Days)  
**Team Size:** 5 Developers  
**Scope Strategy:** 
- **Backend:** ALL features/endpoints (all 6 roles, full CRUD for Medications, Doses, Relationships, Notes, Orders, Payments).
- **Frontend:** Focused extraction (Patient, Family Caregiver, Admin only).

---

## Executive Summary

| Component | Owner | Status |
|-----------|-------|--------|
| **Database Design** | N/A | ✅ DONE (db.md) |
| **Terraform/Infrastructure** | N/A | ✅ DONE (cloud setup) |
| **Patient View Design** | N/A | ✅ DONE |
| **Backend API (Full Scope)** | Abdelrahman + Mohamed | 🔄 IN PROGRESS |
| **Frontend MVP (Patient/Caregiver/Admin)** | Mostafa.N + Mostafa.S | 🔄 IN PROGRESS |
| **Workers & Cron Jobs** | Mohamed + Mostafa.S | 🔄 IN PROGRESS |
| **DevOps & AWS Deployment** | Abdelrahman | 🔄 IN PROGRESS |
| **QA, Testing & Documentation** | Mariam | 🔄 IN PROGRESS |

---

## Team Roster & Role Assignment

### 1. **Abdelrahman** (Lead Engineer / Full-Stack Architect)
**Responsibility Level:** Primary Load (40% management, 60% development)
**Key Responsibilities:**
- Oversee architectural integrity and code quality.
- Lead backend API design and auth module implementation (supporting all 6 roles).
- Monitor progress, unblock team members, resolve critical issues.
- DevOps/AWS deployment pipeline oversight.
- Ensure backend supports future workflows (Orders, Payments) without blocking MVP.

### 2. **Mohamed** (Senior Backend Engineer)
**Responsibility Level:** Second Load (80% development)
**Key Responsibilities:**
- Implement **ALL** core backend API endpoints (Medications, Doses, Notes, Orders, Refill Orders, Payments).
- Build universal Relationship logic (Invite → Explicit Acceptance by both parties) for all roles.
- Build Redis + BullMQ integration for background workers (escalation matrix).
- Collaborate with Abdelrahman on auth module.

### 3. **Mostafa.N** (Frontend Engineer)
**Responsibility Level:** Third Load (85% development)
**Key Responsibilities:**
- Build Next.js PWA structure and component scaffolding.
- Implement **Phase 1: Patient views** (Dashboard, Medications, Adherence, Notes read-only).
- Socket.IO real-time listener integration and Service Worker setup.
- Web Push notification handler, OCR scanning interface, and Patient Notifications Center UI (for handling relationship invites).

### 4. **Mostafa.S** (Full-Stack Engineer)
**Responsibility Level:** Fourth Load (90% development)
**Key Responsibilities:**
- Implement **Phase 2: Family Caregiver views** (Linked patients, escalations, Notes creation).
- Implement **Phase 3: Admin Dashboard** (Users management, settings).
- Connect frontend to backend API endpoints and manage relationship acceptance UI via the Notifications Center.
- Worker status dashboard & monitoring UI.

### 5. **Mariam** (Quality Assurance & Documentation)
**Responsibility Level:** Fifth Load (70% development, 30% testing)
**Key Responsibilities:**
- Write comprehensive API documentation covering **all 6 roles** (even headless endpoints).
- Manual QA testing of Patient, Caregiver, and Admin frontend workflows.
- Test headless APIs (Orders, Payments) via Postman/Insomnia.
- Create runbooks for deployment and troubleshooting.

---

## Week 1: Foundation & Core Implementation

### **Days 1–2: Setup & Architecture Kickoff**
**Abdelrahman (Lead):** Finalize setup, review API versioning, create base Express app.  
**Mohamed (Backend):** Set up MongoDB, implement Account & universal Relationship models, prepare all 6 roles in DB.  
**Mostafa.N (Frontend):** Clone Next.js PWA, configure Tailwind/Redux Toolkit, create Patient layout shell.  
**Mostafa.S (Frontend):** Create Caregiver & Admin layout shells, set up Axios interceptors.  
**Mariam (QA):** Create Swagger docs structure, set up test seeds for all roles.

### **Days 3–4: Auth Module & Universal Relationships**
**Abdelrahman (Lead):** JWT (access+refresh), RBAC middleware for all 6 roles.  
**Mohamed (Backend):** Implement auth endpoints (email/phone). Build universal Relationship endpoints (invite/accept logic).  
**Mostafa.N (Frontend):** Build Login/Register/OTP UI, integrate Patient auth state.  
**Mostafa.S (Frontend):** Build Admin & Caregiver auth state, route guards. Implement Caregiver linking UI (accept invites via Notifications Center).  
**Mariam (QA):** Write Auth API docs, test registration for all roles.

### **Day 5: Medication Core & Patient Dashboard**
**Abdelrahman (Lead):** Finalize Medication/Dose API structure, unblock DB queries.  
**Mohamed (Backend):** Implement Medication & MedicalCondition CRUD. Build Notes endpoints.  
**Mostafa.N (Frontend):** Build Patient Medications Dashboard, Add Medication wizard.  
**Mostafa.S (Frontend):** Build Caregiver Medications View, Admin Dashboard skeleton (Users list).  
**Mariam (QA):** Document Medication APIs, test permission boundaries.

---

## Week 2: Workers, Integration & Future-Proofing

### **Days 6–7: Dose Tracking, Notes & Escalation Engine**
**Abdelrahman (Lead):** Design job queue, prepare Docker/Terraform for staging.  
**Mohamed (Backend):** Build DoseEvent models, confirm endpoints. Implement BullMQ escalation matrix. Build headless Orders/Payments APIs.  
**Mostafa.N (Frontend):** Build Dose Reminder UI, Confirm Dose buttons. Build Patient Notes UI (view only).  
**Mostafa.S (Frontend):** Build Caregiver Alert Dashboard, Adherence Summary, Caregiver Notes UI (create/edit).  
**Mariam (QA):** Test escalation matrix delays, test Notes permissions.

### **Days 8–9: OCR, Notifications & Admin Polish**
**Abdelrahman (Lead):** Security review, staging deployment plan.  
**Mohamed (Backend):** Implement OCR endpoint, Web Push registration, SMS fallback. Refine Pharmacist/Doctor headless endpoints.  
**Mostafa.N (Frontend):** Build Camera UI for OCR, push notification handler, test PWA.  
**Mostafa.S (Frontend):** Polish Admin Dashboard (manage users, suspend accounts). Add bilingual toggle.  
**Mariam (QA):** Test OCR flow, Web Push delivery, test headless backend endpoints (Orders/Payments).

### **Day 10: Testing, Deployment & Handoff**
**Abdelrahman (Lead):** Final security audit, lead AWS staging deployment, validate Terraform.  
**Mohamed (Backend):** Performance testing, deploy backend, troubleshoot.  
**Mostafa.N & Mostafa.S (Frontend):** Final visual polish, full integration testing, deploy frontend.  
**Mariam (QA):** Comprehensive UAT on staging, finalize runbooks.

---

## Scope Exclusions for this 2-Week MVP (Frontend Only)
*Backend APIs for these will be built, but frontend UI is excluded from this 2-week sprint:*
- ❌ Professional Caregiver hiring & acceptance UI
- ❌ Pharmacist refill order fulfillment dashboard
- ❌ Doctor/Pharmacist content publishing UI
- ❌ Orders & Refill Orders feature
- ❌ Billing & Payments UI
- ❌ Messaging / Chat

---

## Success Metrics (Day 10)

✅ **Must Have:**
- [ ] Backend fully supports all 6 roles, Orders, and Payments APIs.
- [ ] Patient can register, add medications, and track doses.
- [ ] Universal relationships logic works (Patient invites Caregiver, Caregiver explicitly accepts).
- [ ] Caregiver can view linked patients, view escalations, and create Notes.
- [ ] Admin can access dashboard and manage users.
- [ ] Escalation matrix triggers Push → SMS → Caregiver alerts correctly.
- [ ] Staging deployment is live and stable.

⭐ **Nice to Have:**
- [ ] Medication OCR scanning works reliably.
- [ ] Bilingual UI (English/Arabic) fully tested.
- [ ] Offline PWA mode tested and documented.
