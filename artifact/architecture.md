# Architecture Design (System Blueprints)

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Artifact 1)  
**Target Audience:** Development Team, Engineering Leads  

---

## 1. High-Level Full-Stack Topology

The platform operates as a modern cloud-native web application. The frontend is a Progressive Web App (PWA) built with React, which communicates with a Node.js/Express backend hosted on AWS ECS. Data flows through a mix of synchronous REST APIs, bidirectional Socket.IO streams, and asynchronous background workers.

```text
                     [ Patient / Companion Device ]
                     (Mobile Browser / Desktop UI)
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      │                   React PWA Frontend                  │
      │   [UI Components]   [State Management]   [PWA SW]     │
      └──────┬────────────────────┬────────────────────┬──────┘
             │ (HTTPS REST)       │ (WSS / Socket.IO)  ▲ (Native Web Push)
             ▼                    ▼                    │
      ┌────────────────────────────────────────────────────────┐
      │                AWS Application Load Balancer           │
      └───────────────────────────┬────────────────────────────┘
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      │               Node.js Express Modular Monolith        │
      │                   (AWS ECS Fargate)                   │
      │                                                       │
      │  [Auth Module]  [Medication Module]  [Notifications]  │
      └──────┬────────────────────┬────────────────────┬──────┘
             │                    │                    │
   (Mongoose)│          (Producer)│                    │(External APIs)
             ▼                    ▼                    ▼
   ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
   │  MongoDB Atlas  │  │  Redis (BullMQ)  │  │ - OpenAI Vision │
   │ (Data Storage)  │  │  (Job Queue)     │  │ - AWS SNS (SMS) │
   └─────────────────┘  └─────────┬────────┘  └─────────────────┘
                                  │ (Consumer)
                        ┌─────────▼────────┐
                        │ Background Jobs  │
                        │ (Escalation/Cron)│
                        └──────────────────┘

```

---

## 2. Frontend Architecture (React PWA)

The frontend is designed to be mobile-first and reliable under poor network conditions, treating the browser like a native application interface.

* **Client-Side Rendering (CSR):** Built with React. To keep the cognitive load manageable for the junior team, standard React Context or a lightweight library like Zustand will manage global state (User Auth, Active Medications).
* **Progressive Web App (PWA) Layer:**
* **Service Workers (SW):** Intercepts network requests to cache static assets (HTML, CSS, JS) and offline fallback pages.
* **Native Web Push API:** The service worker acts as the listener for incoming Push Notifications from the backend. It securely stores VAPID keys and registers device subscription objects with the Node.js API.


* **Component-Driven API Calls:** Standard RESTful API calls (using Axios or Fetch) manage CRUD operations.
* **Real-Time Listeners:** A persistent Socket.IO client listens to specific rooms (e.g., `room:patient_123`) to instantly update the UI when a Companion alters a schedule or when a background job confirms a notification was sent.

---

## 3. Backend Architecture (Modular Monolith)

The backend rejects the traditional flat MVC structure in favor of a **Feature-Module Architecture**. Each domain module owns its models, routing, schema validations, and business logic.

* **Domain Boundaries:** The frontend communicates with specific isolated domain modules:
* `/api/v1/auth`: Handles JWT token issuance, user registration, and RBAC mapping.
* `/api/v1/medications`: Handles CRUD operations for inventory, dosage logic, and OCR AI scanning.
* `/api/v1/notifications`: Handles saving PWA push subscriptions, escalation logs, and SMS fallback logic.


* **Controller/Service Split:** Controllers are extremely thin—their only job is to receive the HTTP request from the React frontend, pass data to the Service layer, and return the HTTP response. All business logic (like enforcing the rule that inventory only decreases on confirmation) lives strictly in the Service layer.

---

## 4. Asynchronous Background Engine (Redis + BullMQ)

Because the frontend relies on precise timing for medication reminders, the backend delegates all time-sensitive tasks to an asynchronous queue.

* **The Trigger:** A cron job scans MongoDB for medications scheduled in the next hour and pushes them to BullMQ.
* **The Queue Execution:** The worker picks up the job and executes the escalation matrix:
1. Sends a payload to the React PWA Service Worker (via Web Push).
2. Spawns a delayed job (+15 mins) to check if the user confirmed the dose via the UI.
3. If unconfirmed, triggers AWS SNS for SMS.
4. Spawns a second delayed job (+15 mins) to trigger the Companion alert.


* **State Updates:** Once a background job executes, it emits a Socket.IO event back to the React UI, updating the patient's dashboard status to "Reminder Sent."

---

## 5. Third-Party Integration Flow

External API interactions are initiated by the frontend but securely executed by the backend.

* **Medication OCR (OpenAI Vision):** * The React PWA accesses the device camera, captures the image, and compresses it.
* The image is sent to the Node.js backend.
* Node.js passes the image to OpenAI with strict JSON output instructions.
* Node.js evaluates the AI confidence score. If it is >= 90%, it maps the data back to the React UI to auto-fill the form. If < 90%, it returns an HTTP 422 error, prompting the React UI to display the manual entry fallback.


* **SMS Fallback (AWS SNS):** Orchestrated entirely by the Node.js background workers when the React UI fails to send a dose confirmation back in time.

---

## 6. Infrastructure & Deployment (AWS)

The infrastructure emphasizes "Infrastructure as Code" (IaC) and containerization to simplify the deployment pipeline for the junior engineering team.

* **Dockerization:** Both the React frontend (served via Nginx) and the Node.js backend are bundled into separate Docker images. This ensures the team's local development environment perfectly matches production.
* **AWS ECS Fargate:** The Docker containers run on AWS Elastic Container Service (ECS) using Fargate (serverless compute). The team does not need to manage underlying EC2 instances, OS updates, or patch management.
* **Application Load Balancer (ALB):** Sits in front of the ECS containers, terminating the SSL/TLS certificate, handling HTTPS traffic, and routing API requests `/api/*` to the Node.js backend while routing default traffic `/` to the React frontend container.
* **Managed Databases:** * **MongoDB Atlas:** Fully managed NoSQL database cluster.
* **Amazon ElastiCache (Redis):** Fully managed Redis cluster powering the BullMQ background workers.


* **Terraform:** All AWS resources (VPC, ECS, ALB, ElastiCache) are declared in Terraform configuration files to ensure the environment can be torn down or replicated programmatically.

