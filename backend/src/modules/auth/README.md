# Auth Module — وفاء (Wafa)

## Overview

Phone + OTP based authentication for the وفاء platform. No email/password required for regular users (patients, caregivers, pharmacies, doctors). Admin accounts use email + password.

## Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/send-otp` | Send OTP to phone | Public |
| POST | `/api/v1/auth/verify-otp` | Verify OTP and login/register | Public |
| POST | `/api/v1/auth/refresh` | Refresh access token | Public (cookie) |
| POST | `/api/v1/auth/logout` | Logout | Public |
| GET | `/api/v1/auth/me` | Get current user | Private |

## Authentication Flow

```
1. POST /auth/send-otp  { phone: "+20XXXXXXXXXX", channel: "sms"|"whatsapp" }
   ↓
   Server generates 6-digit OTP, hashes it, saves to Account.otp
   Server sends OTP via SMS (or WhatsApp for elderly)
   ↓
   Returns: { success, isNewUser, expiresIn: 300 }

2. POST /auth/verify-otp  { phone, code, role?, firstName?, lastName? }
   ↓
   Server verifies OTP hash + expiry + attempts
   ↓
   If new user: creates Account + role-specific profile
   If existing user: logs in
   ↓
   Returns: { accessToken, user: { accountId, role, profileId, isNewUser } }
   + Sets refreshToken as HttpOnly cookie

3. GET /auth/me  (with Authorization: Bearer <accessToken>)
   ↓
   Returns account info (without sensitive fields)
```

## Roles

| Role | Description | Auth Method | Subscription |
|------|-------------|-------------|--------------|
| PATIENT | Chronic disease patient | Phone + OTP | Free forever |
| CAREGIVER | Family member monitoring patient | Phone + OTP | Freemium (99 EGP/mo) |
| PHARMACY | Pharmacy partner | Phone + OTP | Monthly (300-500 EGP) |
| DOCTOR | Doctor with weekly WhatsApp reports | Phone + OTP | Monthly (200-400 EGP) |
| ADMIN | Platform admin (3 sub-levels) | Email + Password | N/A |

## Files

```
auth/
├── controllers/
│   └── auth.controller.js     # Request handlers
├── services/
│   ├── auth.service.js         # Business logic
│   └── otp.service.js          # OTP generation & verification
├── models/
│   ├── Account.model.js        # Auth + role + consents
│   ├── Patient.model.js        # Patient profile
│   ├── Caregiver.model.js      # Caregiver profile
│   ├── Pharmacy.model.js       # Pharmacy profile (NEW)
│   └── Doctor.model.js         # Doctor profile (NEW)
├── routes/
│   └── auth.route.js           # Route definitions
├── validators/
│   └── auth.validator.js       # Zod schemas
└── index.js                    # Module exports
```

## Security

- OTP codes are hashed (SHA-256) before storage — never stored in plain text
- OTP expires after 5 minutes
- Max 5 verification attempts per OTP
- 60-second cooldown between resend requests
- Rate limited at middleware level (5 auth requests per 15 minutes per IP)
- JWT access token (15 min) + refresh token (7 days, HttpOnly cookie)
- Phone format validated (Egyptian +20XXXXXXXXXX)
- Consent tracking for Egyptian Data Protection Law 151/2020
