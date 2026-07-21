# API Specification Design

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Artifact 3)  
**Target Audience:** Development Team, Frontend Engineers, Backend Engineers  

---

## Module Organization Index

The implementation work is organized around domain modules. Each module has a dedicated documentation file that defines its purpose, ownership boundaries, and interfaces before any implementation begins.

- [Auth Module](../backend/src/modules/auth/README.md)
- [Profiles Module](../backend/src/modules/profiles/README.md)
- [Relationships Module](../backend/src/modules/relationships/README.md)
- [Conditions Module](../backend/src/modules/conditions/README.md)
- [Medications Module](../backend/src/modules/medications/README.md)
- [Doses Module](../backend/src/modules/doses/README.md)
- [Content Module](../backend/src/modules/content/README.md)
- [Notifications Module](../backend/src/modules/notifications/README.md)
- [Uploads Module](../backend/src/modules/uploads/README.md)

This module index is the architectural entry point for the platform and is intended to guide future implementation work without introducing code-level behavior yet.

---

## 1. Global API Conventions

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication (Short-Lived):** `Authorization: Bearer <ACCESS_TOKEN>`
- **Authentication (Long-Lived):** `refreshToken` managed exclusively via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
- **Standard Response Format:**
```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "Success message in English",
    "ar": "رسالة نجاح باللغة العربية"
  },
  "data": {}
}
```
- **Standard Error Response (4xx/5xx):**
```json
{
  "success": false,
  "status": "ERROR",
  "messages": {
    "en": "Error message in English",
    "ar": "رسالة خطأ باللغة العربية"
  },
  "data": {}
}
```

## 2. Authentication & Identity (/auth)

All authentication endpoints apply rate-limiting protection (`authRateLimiter`) and return standardized `ServiceResponse` envelopes with bilingual (`en`/`ar`) messages.

### 2.1 Login
**POST** `/auth/login`

**Request (Email Login):**

```json
{
  "credentials": {
    "email": "patient@example.com",
    "password": "SecurePassword123"
  }
}
```

**Request (Phone Login):**

```json
{
  "credentials": {
    "phone": "01000000000",
    "password": "SecurePassword123"
  }
}
```

**Response Headers:** `Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/`

**Response (200 OK):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "Logged in successfully.",
    "ar": "تم تسجيل الدخول بنجاح."
  },
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b2c3d4e5f67890123456",
      "role": "PATIENT",
      "profileId": "64a1c2d3e4f5a67890123457",
      "isEmailVerified": false,
      "isPhoneVerified": true,
      "isVerified": true
    }
  }
}
```

---

### 2.2 Self-Registration
**POST** `/auth/register`

Single unified registration endpoint with role-based body validation (`validateByRole`).

#### A. Patient Registration
**Request:**

```json
{
  "role": "PATIENT",
  "credentials": {
    "email": "patient@example.com",
    "password": "SecurePassword123"
  },
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "gender": "male",
  "bloodType": "O+",
  "whatsappOptIn": true,
  "preferredLanguage": "en"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "Registered successfully.",
    "ar": "تم التسجيل بنجاح."
  },
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b2c3d4e5f67890123456",
      "role": "PATIENT",
      "profileId": "64a1c2d3e4f5a67890123457",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "isVerified": false
    }
  }
}
```

#### B. Family Caregiver Registration
**Request:**

```json
{
  "role": "FAMILY_CAREGIVER",
  "credentials": {
    "email": "caregiver@example.com",
    "password": "SecurePassword123"
  },
  "firstName": "Jane",
  "lastName": "Doe",
  "relation": "daughter",
  "whatsappOptIn": true,
  "preferredLanguage": "ar"
}
```

#### C. Provider Self-Registration (Doctor & Pharmacist)
Providers self-register in a `PENDING_VERIFICATION` state awaiting admin verification.

**Request (Doctor):**

```json
{
  "role": "DOCTOR",
  "credentials": {
    "email": "doctor@example.com",
    "password": "SecurePassword123"
  },
  "firstName": "Dr. Sarah",
  "lastName": "Johnson",
  "specialty": "Cardiology",
  "syndicateId": "SYN123456",
  "clinicName": "Heart Care Clinic",
  "preferredLanguage": "ar"
}
```

**Response (201 Created - Pending Verification):**

```json
{
  "success": true,
  "status": "PENDING_VERIFICATION",
  "messages": {
    "en": "Registration complete. Please wait while we verify your medical license.",
    "ar": "تمت عملية التسجيل. يرجى الانتظار لحين التحقق من ترخيصك الطبي."
  },
  "data": {
    "accountId": "64a1b2c3d4e5f67890123456",
    "role": "DOCTOR",
    "profileId": "64a1c2d3e4f5a67890123457",
    "isVerified": false
  }
}
```

---

### 2.3 Refresh Token
**POST** `/auth/token/refresh`

Rotates session tokens using the `refreshToken` HttpOnly cookie.

**Response (200 OK):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "Session tokens renewed successfully.",
    "ar": "تم تجديد رموز الجلسة بنجاح."
  },
  "data": {
    "accessToken": "eyJhbGciOiJIUz..."
  }
}
```

---

### 2.4 Verify Access Token
**GET** `/auth/verify-token`

**Access:** Protected (`authenticate`)

**Response (200 OK):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": ["Token is valid"],
  "data": {
    "user": {
      "accountId": "64a1b2c3d4e5f67890123456",
      "role": "PATIENT"
    }
  }
}
```

---

### 2.5 Logout
**POST** `/auth/logout`

**Access:** Protected (`authenticate`)

**Response Headers:** `Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`

**Response (200 OK):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "Logged out successfully.",
    "ar": "تم تسجيل الخروج بنجاح."
  },
  "data": {}
}
```

---

### 2.6 Send OTP
**POST** `/auth/otp/send`

**Access:** Protected (`authenticate`)

**Request:**

```json
{
  "target": "patient@example.com",
  "type": "EMAIL"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "OTP verification code sent successfully.",
    "ar": "تم إرسال رمز التحقق بنجاح."
  },
  "data": {}
}
```

---

### 2.7 Verify OTP
**POST** `/auth/otp/verify`

**Access:** Protected (`authenticate`)

**Request:**

```json
{
  "type": "EMAIL",
  "code": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "status": "SUCCESS",
  "messages": {
    "en": "OTP verified successfully.",
    "ar": "تم التحقق من رمز التحقق بنجاح."
  },
  "data": {}
}
```

---

### 2.8 Admin Provisioning & Verification Endpoints
All admin endpoints require `ADMIN` role access (`authenticate`, `authorize("ADMIN")`).

* **POST** `/auth/admin/register/professional` – Admin-only registration for `PROFESSIONAL_CAREGIVER`.
* **POST** `/auth/admin/register/provider` – Admin provisioning for `DOCTOR` or `PHARMACIST`.
* **PATCH** `/auth/admin/verify/doctor/:id` – Admin verification for doctor license (`isVerified: true`).
* **PATCH** `/auth/admin/verify/pharmacist/:id` – Admin verification for pharmacist license (`isVerified: true`).
* **PATCH** `/auth/admin/accounts/:id/status` – Update user account active status (`isActive: true/false`).

## 3. Profile Management (/profiles)

### 3.1 Get Patient Profile
**GET** `/profiles/patient/me`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "id": "64a1c...",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+201000000000",
    "dateOfBirth": "1985-06-15T00:00:00Z",
    "bloodType": "O+",
    "emergencyContact": { "name": "Jane Doe", "phone": "+201000000001" }
  }
}
```

### 3.2 Update Patient Profile
**PUT** `/profiles/patient/me`

**Request:**

```JSON
{
  "bloodType": "A+",
  "emergencyContact": { "name": "Jane Doe", "phone": "+201000000005" }
}
```
**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "id": "64a1c...",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+201000000000",
    "dateOfBirth": "1985-06-15T00:00:00Z",
    "bloodType": "A+",
    "emergencyContact": { "name": "Jane Doe", "phone": "+201000000005" }
  }
}
```

### 3.3 Get Caregiver Profile
**GET** `/profiles/caregiver/me`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "id": "64a1d...",
    "firstName": "Sarah",
    "lastName": "Smith",
    "phone": "+201000000002"
  }
}
```

### 3.4 Update Caregiver Profile
**PUT** `/profiles/caregiver/me`

**Request:**

```JSON
{
  "phone": "+201000000009"
}
```
**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "id": "64a1d...",
    "firstName": "Sarah",
    "lastName": "Smith",
    "phone": "+201000000009"
  }
}
```

## 4. Relationships & Delegation (/relationships)

### 4.1 Initiate Link (Patient invites Caregiver)
**POST** `/relationships`

**Request:**

```JSON
{
  "caregiverEmail": "caregiver@example.com",
  "permissions": {
    "canAddMedication": true,
    "canViewMedicalRecords": true
  }
}
```
**Response (201 Created):**

```JSON
{
  "success": true,
  "data": {
    "relationshipId": "64a1e...",
    "status": "PENDING"
  }
}
```

### 4.2 List Relationships
**GET** `/relationships`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": [
    {
      "relationshipId": "64a1e...",
      "patientId": "...",
      "caregiverId": "...",
      "status": "ACCEPTED",
      "permissions": { "canAddMedication": true, "canViewMedicalRecords": true }
    }
  ]
}
```

### 4.3 Update Relationship Status (Caregiver accepts/rejects)
**PATCH** `/relationships/:relationshipId/status`

**Request:**

```JSON
{
  "status": "ACCEPTED"
}
```
**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "relationshipId": "64a1e...",
    "status": "ACCEPTED"
  }
}
```

### 4.4 Revoke/Remove Relationship
**DELETE** `/relationships/:relationshipId`

**Request:** None

**Response (204 No Content)**

## 5. Medical Conditions (/conditions)

### 5.1 Create Medical Condition
**POST** `/conditions`

**Request:**

```JSON
{
  "diseaseName": "Type 2 Diabetes",
  "isChronic": true,
  "diagnosedDate": "2023-05-10T00:00:00Z",
  "notes": "Monitor morning levels"
}
```
**Response (201 Created):**

```JSON
{
  "success": true,
  "data": {
    "conditionId": "64a1f...",
    "diseaseName": "Type 2 Diabetes",
    "isChronic": true,
    "diagnosedDate": "2023-05-10T00:00:00Z",
    "notes": "Monitor morning levels"
  }
}
```

### 5.2 Get All Medical Conditions
**GET** `/conditions?patientId=64a1c...`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": [
    {
      "conditionId": "64a1f...",
      "diseaseName": "Type 2 Diabetes",
      "isChronic": true,
      "diagnosedDate": "2023-05-10T00:00:00Z",
      "notes": "Monitor morning levels"
    }
  ]
}
```

### 5.3 Get Single Condition
**GET** `/conditions/:conditionId`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "conditionId": "64a1f...",
    "diseaseName": "Type 2 Diabetes",
    "isChronic": true,
    "diagnosedDate": "2023-05-10T00:00:00Z",
    "notes": "Monitor morning levels"
  }
}
```

### 5.4 Update Condition
**PUT** `/conditions/:conditionId`

**Request:**

```JSON
{
  "notes": "Updated dosage notes per latest doctor visit."
}
```
**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "conditionId": "64a1f...",
    "diseaseName": "Type 2 Diabetes",
    "isChronic": true,
    "diagnosedDate": "2023-05-10T00:00:00Z",
    "notes": "Updated dosage notes per latest doctor visit."
  }
}
```

### 5.5 Delete Condition
**DELETE** `/conditions/:conditionId`

**Request:** None

**Response (204 No Content)**

## 6. Medications & Inventory (/medications)

### 6.1 Create Medication
**POST** `/medications`

**Request:**

```JSON
{
  "conditionId": "64a1f...",
  "name": "Metformin",
  "formType": "TABLET",
  "isChronic": true,
  "inventory": {
    "initialQuantity": 60,
    "currentQuantity": 60,
    "doseAmount": 1,
    "refillThreshold": 10
  },
  "instructions": {
    "relationToMeals": "WITH_FOOD",
    "notes": "Take with a full glass of water."
  },
  "schedule": {
    "frequency": "DAILY",
    "dosesPerDay": 2,
    "firstDoseTime": "08:00",
    "timesOfDay": ["08:00", "20:00"], 
    "startDate": "2024-07-05T00:00:00Z"
  },
  "expirationDate": "2025-12-01T00:00:00Z"
}
```
**Response (201 Created):**

```JSON
{
  "success": true,
  "data": {
    "medicationId": "64a2g...",
    "name": "Metformin",
    "status": "CREATED"
  }
}
```

### 6.2 Get All Medications
**GET** `/medications?patientId=64a1c...&isActive=true`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": [
    {
      "medicationId": "64a2g...",
      "conditionId": "64a1f...",
      "name": "Metformin",
      "formType": "TABLET",
      "isChronic": true,
      "inventory": {
        "currentQuantity": 60,
        "doseAmount": 1,
        "refillThreshold": 10
      },
      "instructions": {
        "relationToMeals": "WITH_FOOD",
        "notes": "Take with a full glass of water."
      },
      "schedule": {
        "frequency": "DAILY",
        "timesOfDay": ["08:00", "20:00"]
      }
    }
  ]
}
```

### 6.3 Get Single Medication
**GET** `/medications/:medicationId`

**Request:** None

**Response (200 OK):** (Returns the full medication object as shown in 6.2)

### 6.4 Update Medication
**PUT** `/medications/:medicationId`

**Request:**

```JSON
{
  "inventory": {
    "currentQuantity": 90,
    "doseAmount": 1,
    "refillThreshold": 15
  }
}
```
**Response (200 OK):** (Returns the updated full medication object)

### 6.5 Delete/Archive Medication
**DELETE** `/medications/:medicationId`

**Request:** None

**Response (204 No Content)**

### 6.6 AI Medication OCR Scan
**POST** `/medications/scan`

**Request:**

```JSON
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```
**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "name": "Amoxicillin",
    "formType": "CAPSULE",
    "confidenceScore": 0.96
  }
}
```

## 7. Adherence & Dose Events (/doses)

### 7.1 Get Daily Schedule
**GET** `/doses?patientId=64a1c...&date=2024-07-15`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": [
    {
      "doseEventId": "64a1g...",
      "medicationId": "64a2g...",
      "medicationName": "Metformin",
      "scheduledFor": "2024-07-15T08:00:00Z",
      "status": "PENDING"
    }
  ]
}
```

### 7.2 Confirm Medication Taken
**POST** `/doses/:doseEventId/confirm`

**Request:** None (The URL parameter specifies the dose)

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "doseEventId": "64a1g...",
    "status": "TAKEN",
    "takenAt": "2024-07-15T08:05:00Z",
    "inventoryRemaining": 59
  }
}
```

## 8. Educational Content (/education)

### 8.1 Get Targeted Advice (Dos and Don'ts)
**GET** `/education/advice/recommended`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": [
    {
      "adviceId": "64b2x...",
      "targetDisease": "Type 2 Diabetes",
      "dos": ["Drink 2L of water daily", "Check blood sugar before exercising"],
      "donts": ["Don't skip breakfast", "Avoid heavy meals before bed"]
    },
    {
      "adviceId": "64b2y...",
      "targetDisease": "Hypertension",
      "dos": ["Reduce sodium intake", "Engage in light cardio daily"],
      "donts": ["Don't drink excess caffeine", "Don't smoke"]
    }
  ]
}
```

### 8.2 Get Targeted Blogs (Feed)
**GET** `/education/blogs/recommended`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": [
    {
      "blogId": "64b1z...",
      "targetDisease": "Type 2 Diabetes",
      "title": "Managing Morning Blood Sugar Spikes",
      "coverImageURL": "[https://storage.provider.com/images/diabetes-morning.jpg](https://storage.provider.com/images/diabetes-morning.jpg)",
      "createdAt": "2024-06-01T10:00:00Z"
    }
  ]
}
```

### 8.3 Get Single Blog Content
**GET** `/education/blogs/:blogId`

**Request:** None

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "blogId": "64b1z...",
    "title": "Managing Morning Blood Sugar Spikes",
    "targetDisease": "Type 2 Diabetes",
    "coverImageURL": "[https://storage.provider.com/images/diabetes-morning.jpg](https://storage.provider.com/images/diabetes-morning.jpg)",
    "content": "# The Dawn Phenomenon \n\nThe dawn phenomenon happens when your body naturally releases hormones...",
    "publishedBy": "64admin...",
    "createdAt": "2024-06-01T10:00:00Z"
  }
}
```

## 9. Notifications (/notifications)

### 9.1 Register Web Push Subscription
**POST** `/notifications/subscribe`

**Request:**

```JSON
{
  "endpoint": "[https://fcm.googleapis.com/fcm/send/](https://fcm.googleapis.com/fcm/send/)...",
  "keys": {
    "p256dh": "BPNk...",
    "auth": "Ag..."
  }
}
```
**Response (200 OK):**

```JSON
{
  "success": true,
  "data": { "message": "Subscription saved successfully." }
}
```

## 10. Media & File Uploads (`/uploads`)

### 10.1 Upload Medication Image
- **POST** `/uploads/image`
- **Access:** Protected (PATIENT or authorized CAREGIVER)
- **Content-Type:** `multipart/form-data`
- **Description:** Accepts an image file (e.g., JPEG, PNG), uploads it to a secure cloud storage bucket (like AWS S3 or Firebase Storage), and returns the public URL to be saved in the `Medication` schema.
- **Request (Form Data):**
  - `file`: (Binary File Data) - *Max size: 5MB. Allowed types: image/jpeg, image/png, image/webp.*
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "url": "[https://storage.yourprovider.com/medications/user_64a1b/img_987654321.jpg](https://storage.yourprovider.com/medications/user_64a1b/img_987654321.jpg)",
      "format": "jpg",
      "sizeBytes": 102450
    }
  }