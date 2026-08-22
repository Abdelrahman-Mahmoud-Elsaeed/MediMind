# MediMind - High-Level Architecture Overview

> **Presentation Summary**: High-level structural overview highlighting application layers, containerization, cloud infrastructure, and automated provisioning. Complex implementation details are encapsulated to present a clean 30,000-foot view.

---

## 📊 System Architecture Diagram (High-Level)

```
                       [ USER CLIENTS ]
             (Web Browser / PWA / Mobile Apps)
                             │
                             ▼
              [ AWS Application Load Balancer ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Frontend Layer ] ◄── Socket.io ──► [ Backend Layer ]
   Next.js / React App   (Real-Time)   Express API Server
                                              │
                                              ▼
                                     [ Background Engine ]
                                     BullMQ + Redis Worker
                                              │
       ┌──────────────────────────────────────┼──────────────────────────────────────┐
       ▼                                      ▼                                      ▼
[ AWS DocumentDB ]                     [ AWS S3 Storage ]                   [ AWS SNS / SES ]
(MongoDB Database)                    (Files & Attachments)               (SMS, Push & Email)
```

---

## 1. 🎨 Frontend Layer (Client Experience)

- **Framework**: **Next.js (App Router) + React**
- **UI & Styling**: Custom responsive design system, Tailwind CSS, Dark/Light Mode, RTL (Arabic) & LTR (English) localization.
- **State Management**: Redux Toolkit (auth & global state) + React Query (server data caching & revalidation).
- **Capabilities**: Progressive Web App (PWA) ready, interactive medication calendar, adherence analytics charts, and camera-based prescription scanning (Gemini OCR).

---

## 2. ⚙️ Backend & Worker Engine (API & Background Jobs)

- **API Gateway**: **Express.js (Node.js)** micro-service architecture providing secure RESTful API endpoints.
- **Real-Time Communication**: **Socket.io** web-socket gateway for instantaneous patient & caregiver alerts.
- **Decoupled Worker Engine**: Isolated **BullMQ + Redis** worker handling:
  - Daily dose schedule generation
  - Automated missed dose detection & grace period transitions
  - Multi-tiered caregiver notification escalations
  - Pharmacy inventory & refill threshold monitoring

---

## 3. 🐳 Containerization (Docker)

- **Standardized Environments**: Unified containerized setup via `Docker` & `Docker Compose`.
- **Services Multi-Container Mesh**:
  - `frontend` (Next.js Application Container)
  - `backend` (Express REST API Container)
  - `worker` (BullMQ Processor Container)
  - `mongodb` (Database Replica Set Container)
  - `redis` (Cache & Queue Container)

---

## 4. ☁️ AWS Cloud Infrastructure

- **Compute**: **AWS ECS (Elastic Container Service) on Fargate** — serverless, auto-scaling container management without EC2 server management overhead.
- **Load Balancing**: **AWS ALB (Application Load Balancer)** for traffic distribution and SSL/TLS termination.
- **Database**: **AWS DocumentDB** — fully managed, highly available MongoDB-compatible cluster.
- **Storage**: **AWS S3** — cloud object storage for files (medical documents, prescription images, avatars).
- **Messaging & Notifications**: **AWS SNS & SES** — Simple Notification Service & Simple Email Service for SMS, Push notifications, and automated transactional Emails.
- **Secrets & Security**: **AWS Secrets Manager** for centralized credential & API key security.

---

## 5. 🛠️ Infrastructure as Code (Terraform)

- **Automated Provisioning**: Entire AWS infrastructure is defined and version-controlled via modular **Terraform** manifests (`terraform/`):
  - `vpc` module: Isolated public/private subnet networking.
  - `database` module: Managed DocumentDB cluster.
  - `ecs` module: Fargate clusters, task definitions, and load balancer rules.
  - `storage` module: S3 buckets for file storage.
  - `messaging` module: SNS topics & SES email notification channels.
  - `security` module: IAM execution roles, policies, and Secrets Manager.

---

## 🌟 Executive Summary for Slides / Presentation

| Layer | Technology | Key Highlight |
|---|---|---|
| **Frontend** | Next.js / React / Tailwind | PWA, Bilingual (AR/EN), Responsive UX |
| **Backend** | Node.js / Express / Socket.io | Scalable REST API & Real-Time Alerts |
| **Worker Engine** | BullMQ / Redis | Decoupled Background Crons & Escalation Queue |
| **Containers** | Docker / Docker Compose | Single-command multi-service local environment |
| **Cloud** | AWS ECS Fargate, DocumentDB, S3 | Serverless, Enterprise Security & High Availability |
| **Infrastructure** | Terraform | 100% Automated, Reproducible IaC Deployment |
