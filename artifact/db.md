
# Database Schema Design

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Artifact 2)  
**Target Audience:** Development Team, Database Administrators  

---

## 1. Database Strategy & Conventions

This architecture separates core authentication credentials from role-specific profiles. This ensures that a `Patient` profile can hold rich medical data (records, conditions) without bloating the `Caregiver` or `Admin` data structures.

* **Account vs. Profile:** The `Accounts` collection handles login and security. The `Patients`, `Caregivers`, and `Admins` collections handle role-specific data.
* **Chronic Linkage:** Medications are linked directly to `Medical Conditions`. Both can be flagged as `isChronic`, which tells the system that schedules repeat indefinitely and inventory alerts require early refill warnings.
* **Content Categorization:** Educational content (Blogs and Advice) is decoupled from user profiles and globally categorized by `targetDisease`. The frontend will match a patient's condition to this content.

---

## 2. Core Identity & Role Schemas

### 2.1 Accounts Collection (`accounts`)
Handles authentication, global device subscriptions, and role delegation.

```javascript
const AccountSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['PATIENT', 'CAREGIVER', 'ADMIN'], required: true },
  pushSubscription: {
    endpoint: String,
    keys: { p256dh: String, auth: String }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

```

### 2.2 Patients Profile Collection (`patients`)

Stores patient-specific biological and profile data. Linked 1-to-1 with an Account.

```javascript
const PatientSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true }, // Crucial for SMS escalation
  dateOfBirth: { type: Date },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  emergencyContact: {
    name: String,
    phone: String
  }
}, { timestamps: true });

```

### 2.3 Caregivers Profile Collection (`caregivers`)

Stores Caregiver-specific data. Linked 1-to-1 with an Account.

```javascript
const CaregiverSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

```

### 2.4 Relationships Collection (`relationships`)

Maps the authorization bridge between Patient profiles and Caregiver profiles.

```javascript
const RelationshipSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  caregiverId: { type: Schema.Types.ObjectId, ref: 'Caregiver', required: true, index: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED'], default: 'PENDING' },
  permissions: {
    canAddMedication: { type: Boolean, default: true },
    canViewMedicalRecords: { type: Boolean, default: false }
  }
}, { timestamps: true });

RelationshipSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

```

---

## 3. Medical Records & Inventory Schemas

### 3.1 Medical Conditions Collection (`medical_conditions`)

Acts as the patient's medical record. A patient can have multiple conditions, and some can be flagged as chronic.

```javascript
const MedicalConditionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  diseaseName: { type: String, required: true },
  isChronic: { type: Boolean, default: false }, // e.g., Diabetes, Hypertension
  diagnosedDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

```

### 3.2 Medications Collection (`medications`)

Strictly linked to a medical condition. Introduces `isChronic` handling and auto-generated scheduling.

```javascript
const MedicationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  conditionId: { type: Schema.Types.ObjectId, ref: 'MedicalCondition' }, // Linked to the disease
  addedBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  
  name: { type: String, required: true },
  imageURL: { type: String, default: null },
  formType: { 
    type: String, 
    enum: ['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'OTHER'], 
    required: true 
  },
  isChronic: { type: Boolean, default: false },
  
  inventory: {
    initialQuantity: { type: Number, required: true },
    currentQuantity: { type: Number, required: true },
    doseAmount: { type: Number, required: true }, // How many pills/ml per dose
    refillThreshold: { type: Number, default: 5 }
  },

  instructions: {
    relationToMeals: { 
      type: String, 
      enum: ['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE'], 
      default: 'NONE' 
    },
    notes: { type: String } // e.g., "Drink with a full glass of water", "May cause drowsiness"
  },
  
  schedule: {
    frequency: { type: String, enum: ['DAILY', 'WEEKLY', 'AS_NEEDED'], required: true },
    dosesPerDay: { type: Number, required: true }, // e.g., 3 times a day
    firstDoseTime: { type: String, required: true }, // e.g., "08:00"
    timesOfDay: [{ type: String }], 
    startDate: { type: Date, required: true },
    endDate: { type: Date } // Null if isChronic is true
  },
  
  expirationDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

```

### 3.3 Dose Events Collection (`dose_events`)

The transactional audit trail. Drives the background Cron workers and notifications.

```javascript
const DoseEventSchema = new Schema({
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  scheduledFor: { type: Date, required: true, index: true },
  status: { type: String, enum: ['PENDING', 'TAKEN', 'MISSED', 'SKIPPED'], default: 'PENDING', index: true },
  takenAt: { type: Date, default: null },
  escalationState: { type: String, enum: ['NONE', 'PUSH_SENT', 'SMS_SENT', 'CAREGIVER_NOTIFIED'], default: 'NONE' }
}, { timestamps: true });

DoseEventSchema.index({ status: 1, scheduledFor: 1 });

```

---

## 4. Educational Content Schemas

### 4.1 Disease Advice Collection (`disease_advice`)

Stores quick, actionable "Dos and Don'ts" tailored to specific diseases. Categorized globally.

```javascript
const DiseaseAdviceSchema = new Schema({
  targetDisease: { type: String, required: true, index: true }, // e.g., "Type 2 Diabetes"
  dos: [{ type: String }], // Array of positive actions: "Drink 2L of water daily"
  donts: [{ type: String }], // Array of negative actions: "Don't skip breakfast"
  publishedBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true }, // Admin author
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

DiseaseAdviceSchema.index({ targetDisease: 1, isActive: 1 });

```

### 4.2 Disease Blogs Collection (`disease_blogs`)

Stores long-form educational articles. Also categorized by the specific disease for targeted delivery in the patient feed.

```javascript
const DiseaseBlogSchema = new Schema({
  targetDisease: { type: String, required: true, index: true }, // Matches MedicalCondition diseaseName
  title: { type: String, required: true },
  coverImageURL: { type: String }, 
  content: { type: String, required: true }, // Markdown or HTML format
  publishedBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true }, // Admin author
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

DiseaseBlogSchema.index({ targetDisease: 1, isActive: 1 });
```
