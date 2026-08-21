# Implementation Plan: Worker Backend, Cron Jobs & Queueing Service Configuration

> **Author**: Mostafa Nagdy  
> **Target System**: `worker/` (Worker Engine) & `backend/` (Express API)  
> **Status**: Proposed  
> **Date**: August 2026  

---

## 1. Executive Summary

This document outlines the exact technical implementation plan for configuring the **MediMind Decoupled Worker Engine (`worker/`)**, integrating **BullMQ** with **Redis**, establishing automated **Cron Jobs**, and managing asynchronous background queues for medication alarms, missed dose transitions, snooze limits, caregiver escalation, and real-time alerts.

By offloading repetitive and heavy computational workloads (such as daily schedule generation, missed dose evaluations every few minutes, and multi-tier caregiver notifications) from the primary HTTP API process to the isolated worker process, we ensure high API throughput, zero request blocking, and resilient retry mechanisms.

---

## 2. Current Architecture Audit

### 2.1 Existing Components
1. **`backend/src/config/worker.js`**: Defines Redis connection parameters and queue names (`MedicationScheduler`, `NotificationEscalation`).
2. **`worker/index.js`**: Contains a basic BullMQ Worker instance listening to `QUEUE_NAMES.MEDICATION_SCHEDULER`.
3. **`worker/package.json`**: Configured with `bullmq` (`^5.0.0`) and `dotenv`.
4. **`backend/src/modules/doses/services/doses.service.js`**: Contains initial `getDailySchedule`, `confirmDose`, `skipDose`, and `snoozeDose` logic.

### 2.2 Identified Gaps & Required Additions
- **Lack of Cron / Repeatable Job Registration**: No automated cron scheduler is actively registering recurring jobs into BullMQ.
- **Incomplete Processor Set**: Worker engine currently only handles a single mock job type (`generateDailyDoses`). Needs dedicated processors for missed dose transitions, snooze expiry, caregiver escalation, and inventory/refill monitoring.
- **Internal API Security**: Lack of secret-token authentication on backend endpoints invoked by internal worker processes over Docker networks.
- **Graceful Error Handling & Dead Letter Strategy**: Standardizing retry attempts, exponential backoff, and job retention policies.

---

## 3. Proposed Queue Architecture & Job Flows

```
 +-------------------------------------------------------------------------+
 |                            REDIS BROKER                                |
 |                                                                         |
 |  [ Queue: MedicationScheduler ]    [ Queue: NotificationEscalation ]  |
 |  - generateDailyDoses (Cron)       - triggerCaregiverEscalation       |
 |  - evaluateMissedDoses (Cron)      - sendUrgentSmsAlert               |
 |  - processSnoozeExpiration         - sendPharmacyLowStockAlert        |
 +-------------------------------------------------------------------------+
                    ▲                                  │
                    │ Enqueue                          ▼ Process
 +------------------┴------------------+   +-----------┴------------------+
 |           BACKEND API               |   |        WORKER ENGINE         |
 |        (Express Server)             |   |     (Isolated Node App)      |
 |  - Enqueues on user events          |   |  - Listens to BullMQ queues  |
 |  - Exposes internal HTTP callback   |   |  - Executes async business   |
 |  - Authenticates via Secret Key     |   |    logic & triggers API/DB   |
 +-------------------------------------+   +------------------------------+
```

---

## 4. Detailed Step-by-Step Implementation Strategy

### Step 1: Environment & Configuration Standardization

#### A. Backend Config (`backend/src/config/worker.js`)
Ensure Redis connection options use `ioredis` compatible options and export queue singletons.

```javascript
const { Queue } = require('bullmq');
const { REDIS_URL } = require('./env');

const parsedUrl = new URL(REDIS_URL);
const redisConnectionOptions = {
  host: parsedUrl.hostname || '127.0.0.1',
  port: parseInt(parsedUrl.port, 10) || 6379,
  maxRetriesPerRequest: null,
};

const QUEUE_NAMES = {
  MEDICATION_SCHEDULER: 'MedicationScheduler',
  NOTIFICATION_ESCALATION: 'NotificationEscalation',
  REFILL_ALERTS: 'RefillAlerts'
};

const medicationQueue = new Queue(QUEUE_NAMES.MEDICATION_SCHEDULER, { connection: redisConnectionOptions });
const escalationQueue = new Queue(QUEUE_NAMES.NOTIFICATION_ESCALATION, { connection: redisConnectionOptions });
const refillQueue = new Queue(QUEUE_NAMES.REFILL_ALERTS, { connection: redisConnectionOptions });

module.exports = {
  redisConnectionOptions,
  QUEUE_NAMES,
  medicationQueue,
  escalationQueue,
  refillQueue
};
```

---

### Step 2: Cron Job Registration (Repeatable Queue Jobs)

Create a dedicated scheduler setup script `backend/src/shared/queues/cronScheduler.js` executed at API boot time to register repeatable jobs:

| Job Name | Cron Pattern | Purpose |
|---|---|---|
| `generateDailyDoses` | `0 0 * * *` (Daily at Midnight UTC) | Pre-creates `DoseEvent` records for all active patient medications for the day. |
| `evaluateMissedDoses` | `*/5 * * * *` (Every 5 minutes) | Identifies past-due `PENDING` doses beyond grace period (e.g., 60 mins), transitions them to `MISSED`, and enqueues caregiver notifications. |
| `evaluateSnoozeLimits` | `*/1 * * * *` (Every 1 minute) | Checks snoozed doses that reached their max snooze limit without confirmation. |
| `checkInventoryRefills` | `0 8 * * *` (Daily at 8:00 AM) | Scans medication stocks near completion/expiration and alerts patient and linked pharmacy. |

---

### Step 3: Worker Processors Implementation (`worker/src/processors/`)

Divide job handlers into modular processors inside `worker/src/processors/`:

#### A. Medication Scheduler Processor (`worker/src/processors/medicationProcessor.js`)
```javascript
const { BACKEND_API_URL, WORKER_INTERNAL_SECRET } = require('../config/env');
const { logger } = require('../shared/logger');

async function processMedicationJob(job) {
  logger.info(`[Worker] Processing Medication Job: ${job.name} (ID: ${job.id})`);

  switch (job.name) {
    case 'generateDailyDoses':
      return await callBackendInternal('/internal/medications/generate-daily-doses', job.data);

    case 'evaluateMissedDoses':
      return await callBackendInternal('/internal/doses/evaluate-missed', job.data);

    case 'evaluateSnoozeLimits':
      return await callBackendInternal('/internal/doses/evaluate-snooze', job.data);

    default:
      throw new Error(`Unknown medication job type: ${job.name}`);
  }
}

async function callBackendInternal(endpoint, payload) {
  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-worker-secret': WORKER_INTERNAL_SECRET
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Internal API call failed [${response.status}]: ${errorBody}`);
  }

  return await response.json();
}

module.exports = { processMedicationJob };
```

#### B. Escalation Processor (`worker/src/processors/escalationProcessor.js`)
Handles triggering notifications to family caregivers and professional caregivers when doses are missed or snoozed past allowable thresholds.

---

### Step 4: Internal Backend Controller & Security (`backend/src/modules/internal/`)

Create an internal endpoint module protected by a middleware (`verifyWorkerSecret`):

- `POST /api/v1/internal/medications/generate-daily-doses`: Batch populates daily doses for active patients.
- `POST /api/v1/internal/doses/evaluate-missed`: Finds doses where `scheduledFor + gracePeriod < now` and `status === 'PENDING'`, updates status to `MISSED`, logs adherence stats, and pushes alert to `NotificationEscalation` queue.
- `POST /api/v1/internal/doses/evaluate-snooze`: Handles max snooze count checks (e.g. max 3 snoozes allowed per dose).

---

### Step 5: Alarm, Snooze & Missed Dose State Machine

```
               +-------------------+
               |      PENDING      |
               +---------+---------+
                         |
        +----------------+----------------+
        |                                 |
        v (User confirms)                 v (User snoozes)
 +--------------+                 +---------------+
 |    TAKEN     |                 |    SNOOZED    |
 +--------------+                 +-------+-------+
                                          |
                                          v (Max snoozes reached OR time elapsed)
                                  +---------------+
                                  |    MISSED     |
                                  +-------+-------+
                                          |
                                          v (Worker triggers)
                                  +---------------+
                                  |  ESCALATED TO |
                                  |   CAREGIVER   |
                                  +---------------+
```

---

### Step 6: Backend Snooze Synchronization & Worker Engine Reflection

When a user triggers a **Snooze** action (`POST /api/v1/doses/:id/snooze`):

1. **Database Timestamp Shift (Backend)**:
   The backend updates the `scheduledFor` field in MongoDB to the new target time:
   $$\text{newScheduledFor} = \text{currentScheduledFor} + (\text{snoozeMinutes} \times 60 \times 1000)$$
   The `status` remains `'PENDING'` (or updated with a `snoozeCount` increment).

2. **Worker Engine Reflection**:
   - **Database State Evaluation Pattern (Primary)**:
     When the worker runs `evaluateMissedDoses` (every 5 minutes), it queries MongoDB for:
     $$\text{status} = \text{'PENDING'} \quad \text{AND} \quad (\text{scheduledFor} + \text{gracePeriod}) < \text{currentTime}$$
     Because `scheduledFor` was pushed forward during snooze, `(scheduledFor + gracePeriod)` is now in the future. The worker **automatically defers** marking the dose as `MISSED` and postpones caregiver escalation until after the new snoozed period expires.
   - **Event-Driven Delayed BullMQ Jobs (Secondary)**:
     If individual delayed messages are enqueued into BullMQ:
     ```javascript
     await medicationQueue.add(
       'checkDoseStatus',
       { doseEventId: dose._id },
       { delay: minutes * 60 * 1000 }
     );
     ```
     When the BullMQ timer fires, the worker checks MongoDB state. If the dose is still `'PENDING'`, it sends the alarm/escalation; if confirmed `'TAKEN'`, it resolves without action.

---

## 5. Verification & Testing Strategy

1. **Integration Test Suites (`backend/src/tests/integration/worker.integration.test.js`)**:
   - Test job enqueueing from Express controllers.
   - Test Worker job pick-up and execution using mock Redis or Docker container.
   - Test retry behavior upon API failure (3 attempts with exponential backoff).
2. **Health Check (`backend/src/tests/integration/worker.health.test.js`)**:
   - Verify Redis ping-pong status from both backend and worker services.
3. **End-to-End Log Verification**:
   - Verify that missed doses are logged accurately in `DoseEvent` records when the day passes.

---

## 6. Execution Checklist for Mostafa Nagdy

- [ ] Add `WORKER_INTERNAL_SECRET` to `.env.example` and environment files.
- [ ] Implement `cronScheduler.js` in `backend/src/shared/queues/`.
- [ ] Create internal routes `backend/src/modules/internal/`.
- [ ] Update `worker/index.js` with multi-queue processing (`MedicationScheduler`, `NotificationEscalation`).
- [ ] Implement backend snooze timestamp synchronization & ensure worker cron defers missed dose state transitions.
- [ ] Test missed dose state transitions locally using mock timers.
- [ ] Validate Docker Compose integration (`docker-compose.yml`) for `redis`, `backend`, and `worker`.
