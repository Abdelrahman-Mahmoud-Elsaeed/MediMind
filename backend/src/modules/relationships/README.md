# Relationships Module

## Purpose and responsibilities
The Relationships module manages caregiver-patient delegation and permission flows.

## Features in scope
- Initiating caregiver links
- Listing current relationships
- Accepting or rejecting relationship requests
- Revoking relationships

## Public interfaces
- Relationship creation, listing, update, and removal endpoints
- Permission state for delegated actions

## Dependencies
- Depends on Auth for actor identity
- Depends on Profiles for participant context
- May influence access control in Medications and Notifications

## Inputs and outputs
- Inputs: caregiver invitation data, relationship status changes, participant identifiers
- Outputs: relationship records, status updates, permission summaries

## Implementation notes and future considerations
- Relationship state transitions should remain explicit and auditable
- Future work may add richer permission models and relationship history
