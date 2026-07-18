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

### 2.1 Login
**POST** `/auth/login`

**Request:**

```JSON
{
  "email": "patient@example.com",
  "password": "securepassword123"
}
```
OR

```JSON
{
  "phone": "+201000000000",
  "password": "securepassword123"
}
```
**Response Headers:** Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": { "accountId": "64a1b...", "role": "PATIENT" }
  }
}
```

### 2.2 Register via Email (Patient & Family Caregiver)
**POST** `/auth/register/email`

**Request:**

```JSON
{
  "email": "patient@example.com",
  "password": "SecurePass123",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "gender": "male",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "profilePictureUrl": "https://example.com/image.jpg",
  "whatsappOptIn": true,
  "preferredLanguage": "en",
  "address": [],
  "emergencyContact": [],
  "allergies": ["penicillin"],
  "consents": {
    "familyCaregiver": true,
    "professionalCaregiver": false,
    "doctor": true,
    "pharmacy": false
  }
}
```
**Response Headers:** Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/

**Response (201 Created):**

```JSON
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b...",
      "role": "PATIENT",
      "profileId": "64a1c..."
    }
  }
}
```

### 2.3 Register via Phone (Patient & Family Caregiver)
**POST** `/auth/register/phone`

**Request:**

```JSON
{
  "phone": "+201000000000",
  "nationalNumber": {
    "code": "+20",
    "number": "1000000000"
  },
  "password": "SecurePass123",
  "role": "PATIENT",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "gender": "male",
  "bloodType": "O+",
  "height": 175,
  "weight": 70,
  "profilePictureUrl": "https://example.com/image.jpg",
  "whatsappOptIn": true,
  "preferredLanguage": "en",
  "address": [],
  "emergencyContact": [],
  "allergies": ["penicillin"],
  "consents": {
    "familyCaregiver": true,
    "professionalCaregiver": false,
    "doctor": true,
    "pharmacy": false
  }
}
```
**Response Headers:** Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/

**Response (201 Created):**

```JSON
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b...",
      "role": "PATIENT",
      "profileId": "64a1c..."
    }
  }
}
```

### 2.4 Register Provider (Doctor, Pharmacist, Professional Caregiver)
**POST** `/auth/register/provider`

**Request (Doctor):**

```JSON
{
  "email": "doctor@example.com",
  "phone": "+201000000001",
  "password": "SecurePass123",
  "role": "DOCTOR",
  "firstName": "Dr. Sarah",
  "lastName": "Johnson",
  "specialization": "Cardiology",
  "licenseNumber": "MD12345",
  "clinicName": "Heart Care Clinic",
  "clinicAddress": "123 Medical St, Cairo",
  "yearsOfExperience": 15
}
```

**Request (Pharmacist):**

```JSON
{
  "email": "pharmacist@example.com",
  "phone": "+201000000002",
  "password": "SecurePass123",
  "role": "PHARMACIST",
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "licenseNumber": "PH67890",
  "pharmacyName": "City Pharmacy",
  "pharmacyAddress": "456 Health Ave, Alexandria"
}
```

**Request (Professional Caregiver):**

```JSON
{
  "email": "caregiver@example.com",
  "phone": "+201000000003",
  "password": "SecurePass123",
  "role": "PROFESSIONAL_CAREGIVER",
  "firstName": "Fatima",
  "lastName": "Ali",
  "certificationNumber": "CG11223",
  "agencyName": "Care Services Ltd",
  "specializations": ["elderly care", "chronic disease management"],
  "yearsOfExperience": 8
}
```
**Response Headers:** Set-Cookie: refreshToken=eyJhb...; HttpOnly; Secure; SameSite=Strict; Path=/

**Response (201 Created):**

```JSON
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "accountId": "64a1b...",
      "role": "DOCTOR",
      "profileId": "64a1c..."
    }
  }
}
```

### 2.5 Refresh Token
**POST** `/auth/token/refresh`

**Description:** Reads the HttpOnly cookie containing the refresh token and issues a new access token.

**Request:** None (Token is sent automatically by the browser via Cookie header)

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz..."
  }
}
```

### 2.6 Logout
**POST** `/auth/logout`

**Request:** None

**Response Headers:** Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0

**Response (200 OK):**

```JSON
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

### 2.7 Send OTP
**POST** `/auth/otp/send`

**Access:** Protected (Requires valid access token)

**Request:**

```JSON
{
  "target": "patient@example.com",
  "type": "EMAIL"
}
```
OR

```JSON
{
  "target": "+201000000000",
  "type": "PHONE"
}
```

**Response (200 OK):**

```JSON
{
  "success": true,
  "status": "SUCCESS",
  "data": {},
  "en": "OTP sent successfully",
  "ar": "تم إرسال رمز التحقق بنجاح"
}
```

### 2.8 Verify OTP
**POST** `/auth/otp/verify`

**Access:** Protected (Requires valid access token)

**Request:**

```JSON
{
  "type": "EMAIL",
  "code": "123456"
}
```
OR

```JSON
{
  "type": "PHONE",
  "code": "123456"
}
```

**Response (200 OK):**

```JSON
{
  "success": true,
  "status": "SUCCESS",
  "data": {},
  "en": "OTP verified successfully",
  "ar": "تم التحقق من رمز التحقق بنجاح"
}
```

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