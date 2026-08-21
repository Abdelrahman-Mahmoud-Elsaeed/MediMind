# MediMind - Team Task Breakdown

---

## 👤 Mostafa Nagdy

- [ ] **Medication Alarms & Logs**: Add alarm triggers when medication is due, configure max snooze functionality, and record missed medication doses when the day passes.
- [ ] **PWA Configuration**: Set up Progressive Web App (PWA) configuration for offline capability and mobile experience.
- [ ] **Multi-Step Self-Registration**: Build multi-step self-registration flows for:
  - Pharmacy
  - Doctor
  - Professional Caregiver
  *(Reusing existing backend endpoints and frontend components)*
- [ ] **Admin Dashboard MVP**: Implement Admin Dashboard MVP featuring:
  - Approval workflow for Doctors, Pharmacies, and Professional Caregivers
  - Add single-entry creation capabilities
- [ ] **Worker Backend & Queueing Configuration**: Configure worker backend (`worker/`), BullMQ message queues (`MedicationScheduler`, `NotificationEscalation`), Redis integration, and recurring cron jobs (daily dose generation, missed dose tracking, max snooze evaluation). Write comprehensive implementation documentation (`worker-configuration-plan.md`) explaining architecture and execution plan based on current code.

---

## 👤 Mohamed Jameel

- [ ] **Mobile App Development**: Mobile app development based on current backend.
- [ ] **Version Control**: Create a dedicated branch and open a Pull Request (PR) with work completed.

---

## 👤 Mariam Mohammed

- [ ] **API Documentation**: Generate and configure Swagger documentation for backend endpoints.

---

## 👤 Rabia Shaaban

- [ ] **Stripe Payment Gateway**: Integrate Stripe payment gateway with backend.
- [ ] **Real-Time Pharmacy Notifications**: Add real-time pharmacy notifications and storage *(utilizing existing backend functionality)*.
- [ ] **UI Integration**: Integrate UI for Pharmacy, Caregiver, and Patient with payments and address configuration.
- [ ] **Gemini OCR Integration**: Implement OCR with Gemini by sending prescription images and receiving an array of parsed objects as response.
