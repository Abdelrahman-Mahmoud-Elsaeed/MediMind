# AI Coding Assistant Implementation Prompt

## Intelligent Medication Management Platform

**Optimized for:** Cursor · Claude Code · Cline · Roo Code · Windsurf · GitHub Copilot Agent

---

## 1. Project Context

You are implementing the Intelligent Medication Management Platform — a secure, patient-centric medication adherence application for managing medications, caregiver relationships, reminders, inventory, uploads, and educational content.

**Tech stack:**
- React PWA frontend
- Node.js + Express backend
- MongoDB Atlas (NoSQL data store)
- Redis + BullMQ for background jobs
- Socket.IO for real-time updates
- Docker for local parity
- AWS-based deployment targets (ECS/Fargate, S3, ALB)
- OCR/AI-assisted medication scanning with confidence thresholds

---

## 2. Referenced Documents

Before writing any code, read and internalize all of the following:

- [artifact/BRD.md](BRD.md) — Business requirements, scope, acceptance criteria
- [artifact/architecture.md](architecture.md) — System topology, module boundaries, frontend/backend architecture
- [artifact/db.md](db.md) — Database schemas, indexes, and collection design
- [artifact/apiSpecificationDesign.md](apiSpecificationDesign.md) — API endpoints, request/response examples, error handling
- [artifact/security.md](security.md) — Authentication, RBAC, encryption, validation, upload protections
- [artifact/DevOps.md](DevOps.md) — Docker, CI/CD, deployment, monitoring
- [artifact/plan.md](plan.md) — Milestones, weekly objectives, task dependencies
- [artifact/test.md](test.md) — TDD approach, test standards, coverage expectations

When you are uncertain about a design decision, check the artifacts first. Never invent requirements.

---

## 3. Development Rules (Non-Negotiable)

1. Implement incrementally, following the execution plan milestones in order.
2. Follow a Test-First approach for core logic and public APIs.
3. Do not hardcode secrets; load all configuration from environment variables.
4. Use parameterized queries or schema-based database access; do not compose raw query strings for untrusted input.
5. Validate and sanitize all user input before persistence, notification dispatch, or AI/OCR processing.
6. Enforce authentication and RBAC on protected endpoints.
7. Use structured logging only; never log tokens, passwords, raw PHI, or secrets.
8. Keep code modular and aligned with the architecture boundaries.
9. If public configuration changes, update the relevant documentation.
10. Run the project’s linting and test commands before declaring work complete.

---

## 4. Coding Standards

- Follow existing repository conventions for formatting and structure.
- Keep modules focused and domain-specific.
- Prefer small, readable functions with clear responsibilities.
- Handle specific errors explicitly; avoid broad catch-all handlers.
- Keep business rules in service layers rather than controllers/routes.
- Write tests for new logic and API behavior before implementation where feasible.
- Maintain strong validation for payloads, permissions, and state transitions.

---

## 5. Architecture Constraints

The implementation must follow the architecture described in the documents:

- Frontend is a mobile-first React PWA.
- Backend is a modular monolith built around independent domain modules such as Auth, Medication Management, Relationships, Notifications, Content, and Uploads.
- Each module must be self-contained and own its own route, controller, service, model, schema, and validation logic.
- Core persistence uses MongoDB with Mongoose-style models.
- Background work uses Redis and BullMQ/Cron-style workers.
- Real-time updates use Socket.IO.
- File uploads and OCR flows must be handled through dedicated service layers.

### Modular monolith definition
A modular monolith means one application runtime, but with clear domain boundaries. Do not build this as one flat app with mixed responsibilities.

Each module must follow this structure:
- `routes/` or `router/` — HTTP entry points and endpoint definitions only
- `controllers/` — request parsing, auth checks, response shaping, and delegation only
- `services/` — all business logic, orchestration, and domain rules
- `models/` — database entities and persistence logic
- `schemas/` or `validators/` — request/response validation and DTO definitions
- `utils/` or `helpers/` — module-specific helper logic only when needed

### Module boundaries
- Keep HTTP handling in route/controller modules only.
- Keep business rules and orchestration in service modules.
- Keep persistence models and schemas in model modules.
- Keep request/response validation logic in schema/validator modules.
- Avoid cross-module logic leakage; modules should communicate through well-defined service interfaces or shared middleware.

### Required module examples
- `auth` module: register, login, refresh, logout, RBAC middleware
- `medications` module: conditions, medications, schedule generation, inventory rules
- `relationships` module: caregiver invitation flow, relationship approval, permission checks
- `notifications` module: reminder generation, escalation states, push/SMS alert handling
- `content` module: disease advice and blog retrieval
- `uploads` module: image upload validation, storage integration, OCR submission flow

### Important implementation rules
- Reminder and escalation logic must follow the documented inventory and notification rules.
- Inventory must only decrement when dose confirmation is explicitly recorded.
- OCR scans must be rejected if confidence is below the required threshold.
- Caregiver access must be gated by the relationship bridge and permission flags.
- Do not place business logic directly inside route files.

---

## 6. Implementation Phases

### Phase 1 — Foundation & Security

Tasks:
1. Set up the project structure and base backend/frontend runtime configuration.
2. Create the core database models and schema validation for accounts, profiles, relationships, conditions, medications, dose events, advice, and blogs.
3. Implement secure authentication and session handling using short-lived access tokens and refresh-token cookies.
4. Add RBAC middleware and protected-route enforcement.
5. Configure Docker-based local environment support and basic deployment scaffolding.

Validation gate:
- Core models are created and migrations or initialization scripts complete successfully.
- Authentication endpoints work correctly.
- Protected routes reject unauthorized access.

### Phase 2 — Medication Scheduling & Caregiver Relationships

Tasks:
1. Implement CRUD flows for medical conditions and medications.
2. Implement schedule generation and dosage spacing logic.
3. Implement caregiver invitation and relationship acceptance/rejection flows.
4. Add medication inventory and expiration handling.

Validation gate:
- Patients and authorized caregivers can manage medication data correctly.
- Schedules are generated according to the documented rules.
- Relationship permissions behave correctly.

### Phase 3 — Reminders, Inventory & Media Uploads

Tasks:
1. Implement background jobs for reminder generation and escalation handling.
2. Implement dose confirmation logic and inventory updates.
3. Implement secure image upload handling and OCR integration.
4. Emit real-time updates for relevant state changes.

Validation gate:
- Reminder and escalation flows execute as documented.
- Inventory only updates on explicit confirmation.
- OCR submission fails safely below the required confidence threshold.

### Phase 4 — Educational Content & Release Hardening

Tasks:
1. Implement content publishing and retrieval for disease-specific blogs and advice.
2. Connect the content feed to patient condition data.
3. Complete test coverage, security hardening, and deployment readiness.
4. Prepare documentation for setup, run, backup, and troubleshooting.

Validation gate:
- Educational content is served correctly and scoped to the appropriate disease context.
- Tests are passing and coverage targets are met.
- The app is deployable with the documented infrastructure.

---

## 7. Validation Gates Summary

| Gate | Expected Result |
| --- | --- |
| Auth & RBAC | Protected endpoints require valid authorization |
| Medication CRUD | Conditions and medications are created, read, updated, and removed correctly |
| Scheduling | Doses and reminder states are generated correctly |
| Inventory Logic | Quantity decreases only on explicit confirmation |
| OCR Safety | Low-confidence scans are rejected |
| Notification Escalation | Reminder progression follows the documented workflow |
| Security | Input validation, encryption, and access control are enforced |
| Tests | Unit, integration, and security tests pass |

---

## 8. Testing Requirements

- Every new backend business rule needs unit tests.
- Every new endpoint needs integration tests.
- Tests must use isolated fixtures and temporary state.
- Security payloads and injection-style inputs must be explicitly tested.
- The implementation should support deterministic testing of scheduling, inventory, and authorization behaviors.

---

## 9. Deliverables Checklist

### Core Application
- [ ] Backend API implementing the documented endpoints
- [ ] React PWA frontend for core user workflows
- [ ] MongoDB data model and initialization logic
- [ ] Redis/BullMQ background worker flows
- [ ] Real-time Socket.IO integration

### Security & Config
- [ ] Authentication and RBAC implementation
- [ ] Input validation and sanitization
- [ ] Environment-based configuration
- [ ] Secure upload handling with content validation

### Tests & Docs
- [ ] Unit tests for core logic
- [ ] Integration tests for API flows
- [ ] Security tests for unsafe payloads
- [ ] Setup and run documentation
- [ ] Backup, restore, and troubleshooting runbook

---

## 10. Definition of Done

A task is complete only when all of the following are true:

- The implementation matches the referenced artifacts.
- Security and RBAC rules are enforced.
- Structured logs are emitted for key operations.
- Secrets are loaded from environment configuration.
- Core user workflows work end to end.
- Tests are written and passing.
- Documentation is updated if behavior or configuration changes.
- No temporary or placeholder implementation remains where production-ready behavior is required.
