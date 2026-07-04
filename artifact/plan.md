# Execution Plan & Project Roadmap

**Project Title:** Intelligent Medication Management Platform

**Phase:** Phase 5 (Artifact 7)

**Target Audience:** Project Managers, Tech Leads, Full-Stack Engineers

---

## 1. Project Milestones (4-Week Hyper-Sprint)

```
[Week 1] ──> M1: Core Security, Split-Token Auth & DB Setup
[Week 2] ──> M2: Smart Scheduling Engine & Caregiver Delegation
[Week 3] ──> M3: Cron Workers, Active Inventory & Cloud Image Uploads
[Week 4] ──> M4: Targeted Content Feeds, TDD Hardening & Production Push

```

* **Week 1: Foundations & Auth** – Establish Docker environments, secure database connections, deploy Split-Token Authentication, and handle basic profile registrations.
* **Week 2: The Scheduling Core** – Implement medical condition links, deploy the mathematical `timesOfDay` spacing algorithm, and build the caregiver invitation bridge.
* **Week 3: Automation & Media** – Wire up the background Redis/Cron workers to generate daily dose events, activate inventory tracking, and integrate cloud photo uploads.
* **Week 4: Targeted Feeds & Release** – Deploy the disease-categorized blog and advice engines, run rapid integration testing to hit 85%+ coverage, and launch.

---

## 2. Weekly Feature & Task Matrix

### Week 1: Core Security, Split-Token Auth & DB Setup

* **Backend Objectives:**
* Initialize Node.js/Express with Mongoose. Enforce NoSQL injection validation schemas.
* Implement Bcrypt hashing and the Split-Token auth system (Short-lived JWT in memory, Long-lived Refresh Token in an `HttpOnly` cookie).


* **Frontend Objectives:**
* Initialize React/Vite template, establish global auth state context, and build Login/Registration screens.
* Configure global Axios/Fetch interceptors to handle silent `/auth/refresh` cycles automatically on 401 errors.



### Week 2: Smart Scheduling Engine & Caregiver Delegation

* **Backend Objectives:**
* Build TDD unit tests for the `generateTimesOfDay` utility to auto-calculate dosage spacing.
* Expose CRUD endpoints for `/conditions` and `/medications`.
* Build the `/relationships` logic allowing caregivers to request access to a patient's medical records.


* **Frontend Objectives:**
* Build the multi-step "Add Medication" wizard form (capturing meal instructions, forms, and start dates).
* Implement Mock Service Worker (MSW) to mock backend scheduling arrays so UI development isn't blocked.
* Create the basic Patient and Caregiver profile layout dashboards.



### Week 3: Cron Workers, Active Inventory & Cloud Image Uploads

* **Backend Objectives:**
* Spin up Redis within Docker Compose and configure background cron queues (e.g., BullMQ) to generate tomorrow's `DoseEvent` records nightly.
* Write the `/doses/:id/confirm` logic to automatically decrement remaining inventory.
* Expose `/uploads/image`, validating image headers (magic numbers) before streaming to Cloud Storage.


* **Frontend Objectives:**
* Build the main "Daily Calendar View" showing a list of interactive pending, taken, and missed medication cards.
* Integrate native device camera/upload functionality to seamlessly pipe pill photos to the backend.
* Add dynamic visual alerts that turn medication cards red if stock falls below the `refillThreshold`.



### Week 4: Targeted Content Feeds, TDD Hardening & Production Push

* **Backend Objectives:**
* Build administrative content models and endpoints to publish disease-categorized Blogs and Advice.
* Create a query aggregator that fetches content where `targetDisease` matches the client profile's `MedicalConditions`.
* Run rapid load/stress tests on the critical `/doses` loops using K6.


* **Frontend Objectives:**
* Design the personalized educational feed layout, rendering markdown-based long-form articles and "Dos and Don'ts" visual components cleanly.
* Connect real backend endpoints, replacing all local mock setups.


* **DevOps/QA Objectives:**
* Enforce the CI/CD pipeline to block deployment if Jest test suites fall below 85% coverage.
* Deploy the production cluster to a managed environment (e.g., AWS ECS/Fargate + MongoDB Atlas).



---

## 3. High-Granularity Task Dependencies

| Task ID | Domain | Assignment | Task Description | Dependent On |
| --- | --- | --- | --- | --- |
| **T1.1** | Backend | Dev 1 | Setup DB schemas, index configurations, and base Express server. | None |
| **T1.2** | Backend | Security | Implement Split-Token cookies and role verification middleware. | T1.1 |
| **T1.3** | Frontend | Dev 2 | Initialize app architecture and secure route guards. | None |
| **T1.4** | Frontend | Dev 2 | Map Axios interceptors to catch expired JWT tokens. | T1.2, T1.3 |
| **T2.1** | Backend | Dev 1 | Write TDD mathematical utility for scheduling medication dose spreads. | T1.2 |
| **T2.2** | Backend | Dev 1 | Code CRUD controllers for `/conditions` and `/medications`. | T2.1 |
| **T2.3** | Frontend | Dev 2 | Formulate the multi-step medication intake wizard UI. | T1.4 |
| **T3.1** | Backend | DevOps | Initialize Redis in Docker, orchestrate background automated queues. | T2.2 |
| **T3.2** | Backend | Dev 1 | Implement secure file streaming endpoints for image uploads. | T2.2 |
| **T3.3** | Frontend | Dev 2 | Build calendar timelines and connect device camera uploads. | T2.3 |
| **T4.1** | Backend | Dev 1 | Code the medical-category targeted content filtering algorithms. | T1.2 |
| **T4.2** | Frontend | Dev 2 | Design the educational feeds and clean up edge-case UI states. | T3.3, T4.1 |
| **T4.3** | DevOps | DevOps | Execute automated integration test validations and launch to production. | All Tasks |

---

## 4. Accelerated Critical Path

On a compressed 4-week timeline, the critical path represents a zero-float sequence. A delay on any of these tasks instantly delays the project release.

> **The 4-Week Critical Path Sequence:**
> **Days 1–3:** `T1.1` (Schema Validation Locks) ➔ **Days 4–7:** `T1.2` (Split-Token Auth & Cookie Setup) ➔ **Days 8–11:** `T2.1 & T2.2` (Scheduling Algorithms & Medication CRUD) ➔ **Days 12–16:** `T3.1` (Redis Queue Configuration) ➔ **Days 17–20:** `T3.2` (Secure Image Upload Processing) ➔ **Days 21–28:** Full Integration E2E Audit & Cloud Launch.

### Key Risk Mitigation for the 4-Week Timeline:

1. **Strict Parallel Development:** The frontend team must use the exact API specifications from Artifact 3 to build the medication intake wizard and dashboard panels using local mock data during Week 2, without waiting for the backend scheduling endpoints to be fully written.
2. **No Feature Creep:** Push notification delivery mechanics can be deprioritized to basic in-app logging triggers if Redis queue sync configurations take longer than 48 hours to secure in Week 3.
3. **Database Stability:** Staging and production databases on MongoDB Atlas must be spun up on Day 1 rather than waiting for Week 4 to eliminate environment-specific network/connectivity bugs late in the sprint.