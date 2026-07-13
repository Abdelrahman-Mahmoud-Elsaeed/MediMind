# Module Index

This document provides an architectural index for the MediMind backend domain modules. Its purpose is to define ownership boundaries and documentation entry points before implementation begins.

## Module overview

The system is organized into the following modules:

- [Auth](../backend/src/modules/auth/README.md) — identity, authentication, and session handling
- [Profiles](../backend/src/modules/profiles/README.md) — patient and caregiver profile data
- [Relationships](../backend/src/modules/relationships/README.md) — caregiver-patient delegation and permissions
- [Conditions](../backend/src/modules/conditions/README.md) — medical condition records
- [Medications](../backend/src/modules/medications/README.md) — medications, inventory, and OCR intake
- [Doses](../backend/src/modules/doses/README.md) — adherence and scheduled dose events
- [Content](../backend/src/modules/content/README.md) — educational advice and blog content
- [Notifications](../backend/src/modules/notifications/README.md) — notification subscriptions and delivery coordination
- [Uploads](../backend/src/modules/uploads/README.md) — file upload and media handling

## How the modules fit together

- Auth provides identity and access context for the rest of the platform.
- Profiles stores who the users are.
- Relationships defines how caregivers and patients interact.
- Conditions, Medications, and Doses form the core care workflow around treatment and adherence.
- Content provides education and guidance to support patient care.
- Notifications and Uploads provide supporting delivery and media capabilities that connect to the core workflow.

## Documentation convention

Each module folder contains a dedicated documentation file that describes:
- the module purpose and responsibilities
- the features that belong to the module
- its public interfaces
- its dependencies on other modules
- its inputs and outputs
- implementation notes and future considerations

This documentation is intentionally non-implementation-focused and is meant to clarify ownership and boundaries before development begins.
