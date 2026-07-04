# Business Requirements Document (BRD)

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 2 (Baseline Version)  
**Target Audience:** Development Team, Stakeholders  

---

## 1. Executive Summary
The Intelligent Medication Management Platform is a secure, patient-centric web application designed to dramatically improve medication adherence. By automating schedule tracking, monitoring remaining dosages, and leveraging a smart, multi-channel notification escalation engine, the system ensures patients never miss a critical dose or run out of essential medicine. Built as a **Modular Monolith** using **React, Node.js, MongoDB, and Cron-driven background workers**, the platform provides a highly maintainable foundation for a small engineering team to deliver a production-ready MVP.

---

## 2. Project Scope & Functional Boundaries

### 2.1 In-Scope (MVP Deliverables)
* **Role-Based Access Control (RBAC):** Distinct functional portals for Administrators, Patients, and Companions (Caregivers).
* **Patient-Companion Relationships:** A secure invitation workflow enabling companions to link accounts and manage/monitor specific patients.
* **Advanced Medication Tracking:** State-managed inventory that tracks exact quantities, form types (tablets, syrups, injections, etc.), and strict expiration dates.
* **The Escalation Engine:** A background-processed notification pipeline that escalates from PWA Push -> SMS -> Companion alert if a patient fails to check-in.
* **AI-Powered Medication OCR:** Image processing of medicine labels via device cameras to automatically populate medication details, backed by a strict confidence-interval guardrail.
* **Bilingual Localization:** Full interface and notification localization in English and Arabic.
* **Health Content Management:** A basic module for publishing and distributing disease-specific articles and localized tips.

### 2.2 Out-of-Scope (Future Phases)
* Direct Pharmacy Integration (prescriptions, auto-refills).
* Social Media Messaging Channels (WhatsApp Business API, Facebook Messenger).
* Advanced AI-driven personalized health recommendations.
* Integrations with wearable medical devices or IoT smart pillboxes.

---

## 3. Business Rules & Logic Workflows

### 3.1 Strict Inventory Logic
> **Critical Rule:** The remaining quantity of a medication **must not** automatically decrement when a reminder is sent. It decreases **only** when the user explicitly confirms via the app or notification action that the dose has been successfully taken.

### 3.2 Notification Escalation Matrix
The background worker system (Cron) evaluates user confirmation states against the matrix below:

```text
[Trigger Time (T)] --------> Send PWA Push Notification to Patient
                                  |
                                  +---> Wait 15 Minutes (No Confirmation)
                                           |
                                           v
[Trigger Time (T + 15)] ---> Send Fallback SMS to Patient
                                  |
                                  +---> Wait 15 Minutes (No Confirmation)
                                           |
                                           v
[Trigger Time (T + 30)] ---> Send High-Priority Alert to Linked Companion

```

### 3.3 OCR Safety Validation

* When a user scans a medicine pack, the AI validation service must return a structured payload along with a confidence score.
* **The Threshold Rule:** If the OCR/AI confidence score falls below **90%**, the platform **must reject** the scan entirely, display a localized error, and prompt the user to retake the photo or enter data manually. The system must never guess.

---

## 4. Functional Requirements

### 4.1 User Management & Authentication

* **FR-1.1:** Users must be able to register and log in securely, choosing the role of Patient or Companion.
* **FR-1.2:** The system must enforce role-based access control (RBAC) across all API endpoints and frontend views.
* **FR-1.3:** Patients must be able to generate an invitation link or email request to link their account with a Companion. Companions must explicitly accept the invite to establish the link.

### 4.2 Medication & Schedule Management

* **FR-2.1:** Users (Patients or authorized Companions) must be able to log a medication, specifying: Name, Form Type (Tablets, Capsules, Syrups, Injections, Drops, Creams, Others), Initial Quantity, Dosage Schedule, and Expiration Date.
* **FR-2.2:** The system must track remaining dosages and flag medications that have passed their expiration dates, blocking adherence confirmations for expired batches.

### 4.3 Background Processing & Reminders

* **FR-3.1:** The system must utilize background Cron jobs to scan the database at frequent, optimized intervals to queue upcoming medication reminders.
* **FR-3.2:** Cron jobs must track the state of sent notifications to execute the 3-step escalation protocol accurately.
* **FR-3.3:** A daily maintenance Cron job must scan inventory levels and trigger a "Low Stock" notification when remaining doses fall below a 3-day supply.

### 4.4 Localization & PWA Requirements

* **FR-4.1:** The entire user interface must seamlessly toggle between English (LTR) and Arabic (RTL) text layouts.
* **FR-4.2:** The application must function as a Progressive Web App (PWA) to enable reliable background service workers and push notifications on mobile browsers.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Architecture & Performance

* **NFR-5.1 (Modular Monolith):** The codebase must be separated cleanly into distinct domain modules (Auth, Inventory, Notifications, Content) within a single Node.js runtime. This keeps domain boundaries strict for future microservice extraction while maintaining zero-network latency between modules today.
* **NFR-5.2 (Real-time):** Socket.IO must be utilized to push instant state changes (e.g., when a companion updates a schedule, the patient's dashboard updates in real-time without a page refresh).

### 5.2 Security & HIPAA-Awareness

* **NFR-6.1 (Data Encryption):** All Protected Health Information (PHI)—specifically patient names, medication regimens, and health histories—must be encrypted in transit via HTTPS/TLS 1.3 and at rest within MongoDB using AES-256.
* **NFR-6.2 (Audit Logs):** The system must generate immutable logs tracking who accessed or mutated any medication records, recording the timestamp, User ID, and action taken.
* **NFR-6.3 (OWASP Top 10):** Input validation, parameterized queries (via Mongoose), and sanitization must be enforced strictly to prevent injection and XSS attacks.

### 5.3 Infrastructure & Deployment

* **NFR-7.1:** The entire application stack must be containerized using Docker to guarantee local environment parity for the development team.
* **NFR-7.2:** Cloud resources on AWS (such as ECS/App Runner, DocumentDB/MongoDB Atlas, VPC infrastructure) must be fully declared and provisioned via Terraform scripts.

---

## 6. Timeline & Execution Constraints

* **Team Composition:** 3 Junior Engineers.
* **Development Runway:** 4 to 6 weeks.
* **Strategic Approach:** This is a clean-slate project rewrite. Architecture cleanliness, linting, and system documentation are prioritized over cutting corners to ensure maximum maintainability for the engineering team.

