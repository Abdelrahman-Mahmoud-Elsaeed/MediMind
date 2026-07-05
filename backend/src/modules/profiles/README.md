# Profiles Module

## Purpose and responsibilities
The Profiles module manages user profile details for patients and caregivers, including personal and contact information.

## Features in scope
- Patient profile read and update
- Caregiver profile read and update
- Profile-specific metadata and emergency contact information

## Public interfaces
- Profile retrieval and update operations exposed through the API layer
- Profile data access for other domain modules

## Dependencies
- Depends on Auth for identity context
- May be referenced by Relationships, Conditions, and Medications when patient or caregiver context is required

## Inputs and outputs
- Inputs: profile update payloads, current user identity
- Outputs: normalized profile data and update confirmations

## Implementation notes and future considerations
- Keep profile data separate from authentication credentials
- Future work may introduce richer profile forms, consent tracking, or role-specific fields
