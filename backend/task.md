Based on the database schema and business requirements, authentication is handled via a **hybrid system** (supporting email or phone) with a strict **Role-Based Access Control (RBAC)** model.

Because **Professional Caregivers, Pharmacists, and Doctors** must undergo verification or subscription setup, their onboarding differs from self-registered accounts (Patients and Family Caregivers). Specifically, **Professional Caregivers** are strictly created by Admins in the database, while **Doctors** and **Pharmacists** self-register but must be verified/vetted (and can also be provisioned/managed by Admin endpoints).

Here is the structured list of all the backend API endpoints you will need for the Auth Module (`/api/v1/auth`):

---

## 1. Public Authentication Endpoints

These endpoints are accessible to anyone. They handle registration, login, token refresh, and the OTP verification flows.

| HTTP Method | Endpoint Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register/email` | Self-registration for **PATIENT** and **FAMILY_CAREGIVER** using email + password.

 |
| `POST` | `/api/v1/auth/register/phone` | Self-registration for **PATIENT** and **FAMILY_CAREGIVER** using phone + password.

 |
| `POST` | `/api/v1/auth/register/provider` | Self-registration for **DOCTOR** and **PHARMACIST** (creates account and profile in pending/unverified state).

 |
| `POST` | `/api/v1/auth/login` | Unified login endpoint. Accepts either `email` or `phone` with a password, verifying credentials and returning JWT access/refresh tokens.

 |
| `POST` | `/api/v1/auth/token/refresh` | Generates a new short-lived JWT Access Token using a valid Refresh Token (verifying and rotating the `refreshTokenHash` to prevent reuse).

 |
| `POST` | `/api/v1/auth/logout` | Revokes the active session by clearing the `refreshTokenHash` in the database.

 |

---

## 2. OTP & Verification Endpoints (Self-Service)

These endpoints manage verification codes for email addresses and phone numbers during signup or password recovery.

| HTTP Method | Endpoint Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/otp/send` | Generates and sends a 6-digit hashed OTP to the user's registered phone (via SMS fallback) or email.

 |
| `POST` | `/api/v1/auth/otp/verify` | Validates the OTP code, increments brute-force safety counters (max 5 attempts), and marks `isEmailVerified` or `isPhoneVerified` as true.

 |

---

## 3. Admin-Only Provisioning & Verification Endpoints

These endpoints require an **ADMIN** role check (using your RBAC middleware).

| HTTP Method | Endpoint Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/admin/register/professional` | **Admin-only registration** for **PROFESSIONAL_CAREGIVER**. Generates the core credentials, hashes the password, logs the `addedByAdminId` audit trail, and initiates profile setup.

 |
| `POST` | `/api/v1/auth/admin/register/provider` | **Alternative Admin-only provisioning** to register a **DOCTOR** or **PHARMACIST** directly (bypassing normal pending self-registration). |
| `PATCH` | `/api/v1/auth/admin/verify/doctor/:id` | Admin verification endpoint to review and set `isVerified: true` for a Doctor after checking their credentials and `syndicateId`.

 |
| `PATCH` | `/api/v1/auth/admin/verify/pharmacist/:id` | Admin verification endpoint to review and set `isVerified: true` for a Pharmacist after checking their `licenseNumber`.

 |
| `PATCH` | `/api/v1/auth/admin/accounts/:id/status` | Disables or enables a user's account (`isActive: true/false`).

 |

---

## 4. Consent & Profile Security Endpoints

These are authenticated endpoints for user-facing security operations.

| HTTP Method | Endpoint Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/consent` | Handles changes to HIPAA opt-in consent configurations (`consents` field on Patient profile).

 |
| `GET` | `/api/v1/auth/consent/audit` | Retrieves the immutable HIPAA audit trail of consent events for the requesting patient.

 |

---

Would you like to start by writing the controller, route, and validator files for the self-registration endpoints (`/register/email` and `/register/phone`)?