# Business Requirements Document (BRD)

**Project Title:** وفاء (Wafa) — Intelligent Medication Management Platform
**Version:** 2.0 (Updated)
**Target Audience:** Development Team, Stakeholders, Investors
**Phase:** Pilot-First MVP

---

## 1. Executive Summary

وفاء (Wafa) is a secure, patient-centric Arabic PWA designed to dramatically improve medication adherence for chronic disease patients (diabetes, hypertension) in Egypt and the Arab world. By connecting **patients, families, pharmacies, and doctors** in a single platform, Wafa ensures patients never miss a critical dose, families can monitor their loved ones, pharmacies increase revenue through automated refill reminders, and doctors receive real adherence data via weekly WhatsApp reports — eliminating the need for them to log into a dashboard.

Built as a **Modular Monolith** using **Node.js, Express, MongoDB, Next.js PWA, and BullMQ workers**, the platform provides a production-ready foundation that respects Egyptian cultural norms, complies with Egyptian Data Protection Law 151/2020, and operates on a sustainable B2B-focused revenue model.

---

## 2. Problem Statement

### 2.1 The Crisis
- **9 million** Egyptians have diabetes (one of the highest rates globally)
- **26 million** Egyptians have hypertension (26% of the population)
- **Medication non-adherence rate** in developing countries exceeds 50%
- Non-adherence leads to: kidney failure, blindness, amputations, heart attacks, strokes

### 2.2 Four-Sided Problem
| Stakeholder | Pain Point |
|-------------|------------|
| **Patient** | Forgets to take medication; no simple reminder system |
| **Family** | Worries constantly; can't monitor if their loved one took their medication |
| **Pharmacy** | Loses customers when patients forget to refill prescriptions |
| **Doctor** | Blind after the patient leaves the clinic; no real adherence data |

### 2.3 Market Gap
- **Medisafe** and **MyTherapy** are Western apps that don't understand Arabic culture or the Egyptian healthcare context
- Medisafe has started restricting free features and showing ads — creating user dissatisfaction
- **No single solution** connects the pharmacy with the patient in the Arab region
- The Egyptian government's "100 Million Health" initiative has raised chronic disease awareness, creating market readiness

---

## 3. Project Scope

### 3.1 In-Scope (MVP Deliverables)

#### Authentication & Identity
- **Phone + OTP authentication** (no email/password for regular users)
- Role-based access control (RBAC) for 5 roles: PATIENT, CAREGIVER, PHARMACY, DOCTOR, ADMIN
- Admin sub-levels: super_admin, ops_admin, finance_admin
- Full consent management per Egyptian Data Protection Law 151/2020

#### Patient Features (FREE FOREVER)
- Add medications and schedules (3-step wizard)
- One-tap "I took it" confirmation button (large touch target for elderly)
- Batch notifications (morning/noon/evening grouped, not per-medication)
- WhatsApp Bot option for elderly patients who don't use PWA
- Gamification: streaks, badges, weekly adherence summary
- Optional: consent to caregiver/doctor/pharmacy access

#### Caregiver Features (Freemium — 99 EGP/month Premium)
- **Free:** Monitor 1 patient + instant missed-dose alerts
- **Premium:** Multiple patients + weekly/monthly reports + adherence history
- WhatsApp alerts (in addition to PWA push)
- Quiet hours configuration

#### Pharmacy Features (B2B — 300-500 EGP/month after pilot)
- Dashboard showing linked patients
- "Refill Soon" alerts (patients running out within 5 days)
- One-tap "Send Reminder" to patient
- Weekly analytics report
- Pilot period: 3 months free per pharmacy
- Settings: auto-reminders, refill threshold customization

#### Doctor Features (B2B — 200-400 EGP/month)
- **No mandatory dashboard** — doctors are time-poor
- **Weekly WhatsApp report** (Friday 6 PM by default):
  - "12 of 15 patients adherent (80%)"
  - List of low-adherence patients
  - Patients running out of medication
  - New patients added this week
- Optional web dashboard for doctors who want deeper insights

#### Notifications & Escalation
- **3-step escalation matrix:**
  1. T+0 min: PWA Push notification to patient
  2. T+15 min: WhatsApp message (or SMS fallback)
  3. T+30 min: Caregiver alert (PWA + WhatsApp)
- **Batch notifications** to prevent notification fatigue
- **Quiet hours** respect (default: 10 PM - 6 AM)

#### Localization
- **Arabic-first** (RTL layout, Egyptian dialect in UI copy)
- English support as secondary language
- All notifications, emails, and reports in Arabic by default

### 3.2 Out-of-Scope (Future Phases)
- Direct pharmacy POS integration (prescriptions, auto-refills)
- Facebook Messenger integration
- Advanced AI-driven personalized health recommendations
- Wearable device integration (Apple Health, Google Fit)
- IoT smart pillboxes
- Insurance company partnerships (Year 2+)
- Pharma company B2B data partnerships (Year 2+)

---

## 4. Business Rules & Logic Workflows

### 4.1 Strict Inventory Logic
> **Critical Rule:** Medication remaining quantity must NOT auto-decrement when a reminder is sent. It decreases ONLY when the user explicitly confirms taking the dose via the app, WhatsApp reply, or notification action.

### 4.2 Notification Escalation Matrix
```
[Trigger Time (T)] ─────► PWA Push Notification to Patient
                                │
                                ├──► Wait 15 Minutes (No Confirmation)
                                │       │
                                │       ▼
[T + 15 min] ───────────► WhatsApp Message to Patient
                                │       (or SMS fallback if no WhatsApp)
                                │
                                ├──► Wait 15 Minutes (No Confirmation)
                                │       │
                                │       ▼
[T + 30 min] ───────────► Caregiver Alert (PWA + WhatsApp)
                                │
                                ▼
                          Mark dose as MISSED
                          Update patient's adherence rate
                          Award no gamification points
```

### 4.3 Pilot-First Validation Rule
> **Mandatory:** Before writing any code, the team MUST validate market demand by:
> 1. Building a landing page with 3 questions
> 2. Speaking with 10 pharmacies in person
> 3. Collecting waitlist signups
> 4. **Decision Gate:** If 3+ pharmacies say "yes" → proceed with development. If 8+ say "no" → revise the concept.

### 4.4 Consent Rule (Egyptian Law 151/2020)
> **Mandatory:** Patient must explicitly consent before any caregiver, doctor, or pharmacy can access their data. Consent can be revoked at any time. No data is shared without explicit, logged consent.

### 4.5 Free Forever Rule
> **Mandatory:** Patient accounts are FREE FOREVER. Monetization comes exclusively from B2B sources (pharmacies, doctors, future pharma/insurance partnerships). This ensures maximum patient acquisition and network effect.

---

## 5. Functional Requirements

### 5.1 Authentication (FR-1)
- **FR-1.1:** Users register/login with phone number + OTP only (no email/password)
- **FR-1.2:** OTP is 6 digits, expires in 5 minutes, max 5 verification attempts
- **FR-1.3:** 60-second cooldown between OTP resend requests
- **FR-1.4:** OTP sent via SMS (primary) or WhatsApp (fallback for elderly)
- **FR-1.5:** System enforces RBAC across all API endpoints
- **FR-1.6:** Admin accounts use email + password (created via seeding script)
- **FR-1.7:** All users must accept terms & privacy policy during registration

### 5.2 Patient Management (FR-2)
- **FR-2.1:** Patients can add medications specifying: name, form type, dosage, schedule, expiration date, linked pharmacy
- **FR-2.2:** Patients can confirm dose taken via: PWA button, WhatsApp reply, notification action
- **FR-2.3:** System tracks adherence rate per patient (weekly, monthly, all-time)
- **FR-2.4:** System awards gamification badges for adherence streaks (7, 30, 90 days)
- **FR-2.5:** Patients can opt for "WhatsApp-only" mode (no PWA, all reminders via WhatsApp)

### 5.3 Caregiver Management (FR-3)
- **FR-3.1:** Caregivers receive instant alert if patient misses dose by 30 minutes
- **FR-3.2:** Free tier: 1 patient, basic alerts only
- **FR-3.3:** Premium tier: multiple patients, weekly/monthly reports, adherence history
- **FR-3.4:** Caregivers can configure quiet hours and notification channels

### 5.4 Pharmacy Management (FR-4)
- **FR-4.1:** Pharmacies see linked patients in a dashboard (web)
- **FR-4.2:** System auto-flags patients running out within X days (configurable, default 5)
- **FR-4.3:** Pharmacies can send one-tap refill reminders to patients
- **FR-4.4:** Pharmacies receive weekly analytics report (patient count, refills, revenue estimate)
- **FR-4.5:** Pilot period: 3 months free, then auto-convert to paid subscription

### 5.5 Doctor Management (FR-5)
- **FR-5.1:** Doctors receive weekly WhatsApp report (Friday 6 PM by default)
- **FR-5.2:** Report includes: adherence rate, low-adherence patients, refill-soon patients, new patients
- **FR-5.3:** Optional web dashboard for deeper insights
- **FR-5.4:** Doctors can configure report day, time, and content preferences

### 5.6 Notifications (FR-6)
- **FR-6.1:** PWA push notifications via Firebase Cloud Messaging (FCM)
- **FR-6.2:** WhatsApp messages via WhatsApp Business API
- **FR-6.3:** SMS fallback via AWS SNS (for critical alerts only — paid)
- **FR-6.4:** Batch notifications: group morning/noon/evening meds into single notification
- **FR-6.5:** Quiet hours respected (default 10 PM - 6 AM)

### 5.7 Localization & PWA (FR-7)
- **FR-7.1:** Full Arabic (RTL) interface with Egyptian dialect in UI copy
- **FR-7.2:** English support as secondary language
- **FR-7.3:** PWA with service worker for offline support
- **FR-7.4:** Installable on mobile home screen (no App Store required)

---

## 6. Non-Functional Requirements (NFRs)

### 6.1 Architecture & Performance
- **NFR-1.1 (Modular Monolith):** Clean domain module separation within a single Node.js runtime
- **NFR-1.2 (Real-time):** Socket.IO for instant UI updates (caregiver alert → patient dashboard)
- **NFR-1.3 (Elderly-friendly):** All touch targets minimum 48x48px, preferred 56x56px
- **NFR-1.4 (Performance):** API response time < 200ms for 95% of requests

### 6.2 Security & Compliance
- **NFR-2.1 (Data Encryption):** HTTPS/TLS 1.3 in transit, AES-256 at rest for PHI
- **NFR-2.2 (OTP Security):** OTP codes hashed (SHA-256) before storage, never plain text
- **NFR-2.3 (Audit Logs):** Immutable logs tracking who accessed/mutated medication records
- **NFR-2.4 (OWASP Top 10):** Strict input validation, parameterized queries, sanitization
- **NFR-2.5 (Egyptian Law 151/2020):** Full compliance with Egyptian Data Protection Law
- **NFR-2.6 (Consent Tracking):** All consents logged with timestamp and IP

### 6.3 Infrastructure
- **NFR-3.1 (Dockerized):** Full Docker support for local dev/prod parity
- **NFR-3.2 (Cloud-Ready):** AWS ECS Fargate deployment via Terraform (production)
- **NFR-3.3 (Cost-Optimized):** Free tier usage for first 6 months (Vercel + MongoDB Atlas + Railway)

---

## 7. Revenue Model

| Source | Model | Price | Timing |
|--------|-------|-------|--------|
| Pharmacies | Monthly subscription (after 3-month pilot) | 300-500 EGP/month | Month 4+ |
| Caregiver Premium | Freemium | 99 EGP/month | Month 6+ |
| Doctors | Monthly + WhatsApp reports | 200-400 EGP/month | Month 8+ |
| Pharma companies | B2B Data & Engagement | Negotiable | Year 2 |
| Insurance companies | B2B Partnership | Negotiable | Year 3 |

### Revenue Projections (Conservative)
| Period | Source | Expected Count | Monthly Revenue |
|--------|--------|---------------|-----------------|
| Month 1-3 | Pilot (free) | 5 pharmacies | 0 (credibility investment) |
| Month 4-6 | Paid pharmacies | 15-20 | 5,000-10,000 EGP |
| Month 6-12 | + caregivers + doctors | 30 ph + 100 premium | 25,000-50,000 EGP |
| Year 2 | + Pharma B2B | 100+ pharmacies | 100,000+ EGP |

---

## 8. Timeline & Execution

### Phase 0 — Pre-Code Validation (2 weeks)
1. Build landing page (1 day)
2. Speak with 10 pharmacies (1 week)
3. Collect waitlist signups
4. Legal consultation re: data protection
5. Assemble team

### Phase 1 — MVP Development (8 weeks)
- Week 1-2: Database schema + UI design + setup
- Week 3-4: Auth + medications + notifications
- Week 5-6: Caregiver flow + pharmacy dashboard
- Week 7-8: Testing + first pharmacy pilot launch

### Phase 2 — Pilot & Iterate (Months 3-6)
- Onboard 5 pilot pharmacies (free)
- Collect feedback, iterate
- Convert pilots to paid
- Add premium caregiver features

### Phase 3 — Scale (Months 6-12)
- Add WhatsApp doctor reports
- Expand to 30+ pharmacies
- Launch premium caregiver tier
- Begin Cairo/Alexandria expansion

---

## 9. Success Metrics (KPIs)

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Active pharmacies | 20 | 50 |
| Active patients | 500 | 3,000 |
| Active caregivers | 100 | 800 |
| Active doctors | 10 | 50 |
| Patient adherence improvement | +25% | +35% |
| Pharmacy retention | 80% | 85% |
| Monthly revenue | 10,000 EGP | 50,000 EGP |
