# Worker Backend & Queueing Configuration Plan

## Architecture Overview
MediMind utilizes a decoupled Worker Engine operating alongside the main Express API server. Background asynchronous jobs, scheduled tasks, dose generation, and escalation alarms are managed through **BullMQ** backed by **Redis**.

```
+-------------------+      HTTP (Internal Key Auth)     +--------------------+
|                   | <--------------------------------> |                    |
|   Express API     |                                    |   Decoupled Worker |
|   (port 8080)     | -------- Enqueues Jobs ----------->|   Engine (3001)    |
|                   |                                    |                    |
+-------------------+                                    +--------------------+
          |                                                         |
          +--------------------> [ Redis Cache / BullMQ ] <---------+
```

---

## Key Components

### 1. Environment & Configuration
- **`backend/.env` & `worker/src/config/env.js`**:
  - `REDIS_URL`: `redis://127.0.0.1:6379`
  - `WORKER_URL`: `http://127.0.0.1:3001` or internal container network `http://worker:3001`
  - `WORKER_INTERNAL_SECRET`: Shared secret for securing internal webhook routes.

### 2. Message Queues (BullMQ)
- **`MedicationScheduler` Queue**:
  - Daily dose generation (`generateDailyDoses`)
  - Evaluation of missed doses and max snooze thresholds
  - Internal processing via `worker/src/processors/medicationProcessor.js`.
- **`NotificationEscalation` Queue**:
  - Multi-channel notification dispatch (Web-Push / SNS)
  - Processing via `worker/src/processors/escalationProcessor.js`.

### 3. Cron Scheduler Jobs
- **Daily Dose Pre-generation (`0 0 * * *`)**:
  - Automatically runs at midnight to populate daily medication schedules.
- **Missed Dose Tracking (`*/15 * * * *`)**:
  - Runs every 15 minutes to mark past-due doses as `MISSED` and initiate escalation notifications to designated caregivers if snoozed beyond maximum limits.

### 4. Internal API & Auth
- **`backend/src/modules/internal/routes/internal.route.js`**:
  - Secures endpoints used by worker nodes via `workerAuth.middleware.js`.

---

## Verification & Monitoring
- **Health Check Probe**: `http://localhost:3001/health`
- Logs emit status reports via standard Winston Logger output.
