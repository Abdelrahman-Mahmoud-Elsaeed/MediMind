
# Database Schema Design

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Merged, Secured & Monetized Architecture with Caregiver Split)  
**Target Audience:** Development Team, Database Administrators  

---

## 1. Database Strategy & Conventions

This architecture strictly separates core authentication credentials from role-specific profiles to keep the storage footprint lean and highly specialized.

* **Hybrid Authentication (`accounts`):** Supports logging in via either email (with password) or phone (with password or OTP verification). Both fields are indexed, unique, and marked as `sparse`. The Account is the **single source of truth** for authentication credentials — profile collections do **not** duplicate the `phone` field.

* **Two-Tier Caregiver Architecture:**
  * **Family Caregivers (`family_caregivers`):** Free accounts for relatives. Linked to patients through mutual family relationship requests.
  * **Professional Caregivers (`professional_caregivers`):** Paid professional accounts created solely by Admins. Patients hire and pay them directly through the platform.

* **Privacy-Isolated Notes (`notes`):** Designed so that Patients see every note assigned to them, while Caregivers (Family and Professional), Doctors, and Pharmacists are strictly isolated to viewing only the notes they created or have been explicitly granted access to. Access is enforced via Mongoose static query methods.

* **Non-Admin Unified Payments (`payments`):** A centralized ledger recording payments made by non-admin roles. This handles Patient/Caregiver medication orders, Patient-to-Professional Caregiver hiring fees, and Doctor/Pharmacist platform subscription upgrades. Polymorphic references use `refPath` for type-safe population.

* **Refill Orders Lifecycle:** A transactional collection linking Patient inventory directly to the Pharmacist's fulfillment desk, tied directly to the Payment ledger.

* **Chronic Linkage:** Medications are linked directly to `Medical Conditions`. Both can be flagged as `isChronic`, which tells the system that schedules repeat indefinitely and inventory alerts require early refill warnings.

* **Content Categorization:** Educational content (Blogs and Advice) is decoupled from user profiles and globally categorized by `targetDisease`. The frontend will match a patient's condition to this content.

### 1.1 Indexing Convention

> **Rule:** When a field has `unique: true`, Mongoose automatically creates a unique index. Do **not** also add `index: true` on the same field — it creates a redundant second index that wastes memory and slows writes.

### 1.2 Dose Status Definitions

| Status    | Definition |
|-----------|------------|
| `PENDING` | Dose is scheduled but the scheduled time has not yet arrived. |
| `TAKEN`   | Patient confirmed the dose within the on-time window (≤ `scheduledFor` + 30 min). |
| `LATE`    | Patient confirmed the dose after the on-time window but within the grace period (`scheduledFor` + 31 min to + 120 min). Counts toward adherence at reduced weight. |
| `MISSED`  | Dose was not confirmed within 120 minutes of `scheduledFor`. Triggers full escalation completion. |
| `SKIPPED` | Patient explicitly chose to skip this dose (e.g., doctor advised, side effects). |

---

## 2. Core Identity & Role Profile Schemas

### 2.1 Accounts Collection (`accounts`)
Handles system security, credentials (email or phone), global device push tokens, refresh token tracking, and authorization.

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  // --- Hybrid Auth: Support for either Email or Phone login ---
  email: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true, 
    lowercase: true
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true
  }, // Format: +20XXXXXXXXXX
  
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["PATIENT", "FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "ADMIN", "DOCTOR", "PHARMACIST"],
    required: true,
  },

  // --- Verification Flags (Fix #1: OTP infrastructure) ---
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },

  // --- Session Security (Fix #8: Refresh token invalidation) ---
  refreshTokenHash: { type: String, default: null },

  pushSubscription: {
    endpoint: String,
    keys: { p256dh: String, auth: String },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// --- Fix #7: Properly halt pipeline on validation failure ---
AccountSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(new Error("An Account must have either an email or a phone number for authentication."));
  }
  next();
});

// --- Fix #2: Restore bcrypt password hashing (CRITICAL — prevents plain-text storage) ---
AccountSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12); // HIPAA-compliant cost factor
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Account', AccountSchema);
```

### 2.2 OTP Verification Collection (`otp_verifications`)
Supports phone-based OTP login and email verification flows. Tokens auto-expire via a MongoDB TTL index.

```javascript
const OtpVerificationSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  channel: { 
    type: String, 
    enum: ["phone", "email"], 
    required: true 
  },
  code: { type: String, required: true },     // Hashed OTP code
  attempts: { type: Number, default: 0 },      // Brute-force counter (max 5)
  expiresAt: { type: Date, required: true },   // TTL expiration
}, { timestamps: true });

// Auto-delete expired OTPs
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpVerificationSchema.index({ accountId: 1, channel: 1 });

module.exports = mongoose.model('OtpVerification', OtpVerificationSchema);
```

### 2.3 Patients Profile Collection (`patients`)
Stores biological metrics, primary demographics, emergency contacts, medical consents, and communication preferences. The `phone` field on Account is the auth source of truth — this profile does **not** duplicate it.

```javascript
const PatientSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  emergencyContact: {
    name: String,
    phone: String,
  },
  
  // --- Fix #11: Privacy-by-default (opt-in model) ---
  consents: {
    familyCaregiver: { type: Boolean, default: false },
    professionalCaregiver: { type: Boolean, default: false },
    doctor: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false }
  },
  
  whatsappOptIn: { type: Boolean, default: false },
  fcmToken: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
```

### 2.4 Consent Events Collection (`consent_events`)
Immutable audit trail for every consent change. Required for HIPAA compliance.

```javascript
const ConsentEventSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  changedBy: { type: Schema.Types.ObjectId, ref: "Account", required: true }, // Who made the change
  field: { 
    type: String, 
    enum: ["familyCaregiver", "professionalCaregiver", "doctor", "pharmacy"], 
    required: true 
  },
  oldValue: { type: Boolean, required: true },
  newValue: { type: Boolean, required: true },
  ipAddress: { type: String },  // Audit context
}, { timestamps: true });

ConsentEventSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('ConsentEvent', ConsentEventSchema);
```

### 2.5 Family Caregivers Collection (`family_caregivers`) — FREE
Free accounts intended for family members, relatives, or close friends. Self-registered.

```javascript
const FamilyCaregiverSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  relation: { 
    type: String, 
    enum: ["son", "daughter", "spouse", "parent", "sibling", "friend", "other"], 
    required: true 
  },
  
  // Basic free tier configurations
  alertSettings: {
    instantMissed: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('FamilyCaregiver', FamilyCaregiverSchema);
```

### 2.6 Professional Caregivers Collection (`professional_caregivers`) — PAID SERVICE
Paid medical caregivers (e.g., private nurses, medical escorts). These accounts are strictly created by Admins and hired by patients.

```javascript
const ProfessionalCaregiverSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  addedByAdminId: { type: Schema.Types.ObjectId, ref: "Account", required: true }, // Verification audit trail
  
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true }, // Medical/Nursing license
  
  hourlyRate: { type: Number, required: true }, // Service price rate
  bio: { type: String },
  isAvailable: { type: Boolean, default: true },

  // --- Fix #10: Bounded rating ---
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  
  alertSettings: {
    instantMissed: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('ProfessionalCaregiver', ProfessionalCaregiverSchema);
```

### 2.7 Doctors Profile Collection (`doctors`)
Vetted clinical personnel with prescribing authority, custom clinic records, and reporting configs.

```javascript
const DoctorSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  specialty: { type: String, required: true },
  syndicateId: { type: String, required: true, unique: true },
  clinicName: { type: String, required: true },
  clinicAddress: { type: String },
  isVerified: { type: Boolean, default: false },
  
  subscription: {
    status: { type: String, enum: ["pilot", "active", "expired"], default: "pilot" },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  whatsappReport: {
    enabled: { type: Boolean, default: false },
    day: { type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], default: "friday" },
    time: { type: String, default: "18:00" }
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', DoctorSchema);
```

### 2.8 Pharmacists Profile Collection (`pharmacists`)
Clinical pharmacy entities who fulfill refill requests, including GeoJSON coordinate tracking for spatial queries and customized refill settings.

```javascript
const PharmacistSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  pharmacyName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true },
  
  address: {
    governorate: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
  },

  // --- Fix #15: GeoJSON for native MongoDB geospatial queries ($near, $geoWithin) ---
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  
  isVerified: { type: Boolean, default: false },
  
  subscription: {
    status: { type: String, enum: ["pilot", "active", "expired"], default: "pilot" },
    plan: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  settings: {
    autoReminder: { type: Boolean, default: true },
    refillAlertDays: { type: Number, default: 5 }
  }
}, { timestamps: true });

PharmacistSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Pharmacist', PharmacistSchema);
```

### 2.9 System Admins Profile Collection (`admins`)
Platform operators, role verifiers, and permissions managers.

```javascript
const AdminSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, default: "Operations" },

  // --- Fix #16: Renamed from "role" to "adminType" to avoid shadowing Account.role ---
  adminType: { 
    type: String, 
    enum: ["super_admin", "ops_admin", "finance_admin"], 
    required: true 
  },
  permissions: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
```

### 2.10 Relationships Collection (`relationships`)
Maps authorization linkages between Patients and care providers (Family Caregivers, Professional Caregivers, and Doctors).

```javascript
const RelationshipSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  
  // --- Fix #4: refPath enables Mongoose .populate() on polymorphic references ---
  caregiverId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    refPath: 'caregiverType' 
  },
  // --- Fix #17: Doctors are now a supported relationship type ---
  caregiverType: { 
    type: String, 
    enum: ["FamilyCaregiver", "ProfessionalCaregiver", "Doctor"], 
    required: true 
  },
  
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "REVOKED"],
    default: "PENDING",
  },
  permissions: {
    canAddMedication: { type: Boolean, default: true },
    canViewMedicalRecords: { type: Boolean, default: false },
    canOrderRefills: { type: Boolean, default: true },
  },
}, { timestamps: true });

RelationshipSchema.index({ patientId: 1, caregiverId: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', RelationshipSchema);
```

---

## 3. Medical Records, Adherence, Notes & Financials

### 3.1 Medical Conditions Collection (`medical_conditions`)
An on-platform diagnosis ledger linked to a doctor or created by the system.

```javascript
const MedicalConditionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  diseaseName: { type: String, required: true },
  isChronic: { type: Boolean, default: false },
  diagnosedBy: { type: Schema.Types.ObjectId, ref: "Doctor" },
  diagnosedDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MedicalCondition', MedicalConditionSchema);
```

### 3.2 Medications Collection (`medications`)
Tracks current regimens, dosage structures, and tracking targets.

```javascript
const MedicationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  conditionId: { type: Schema.Types.ObjectId, ref: "MedicalCondition" },
  addedBy: { type: Schema.Types.ObjectId, ref: "Account", required: true },

  // --- Fix #18: Renamed from "pharmacyId" to "pharmacistId" to match the ref target ---
  pharmacistId: { type: Schema.Types.ObjectId, ref: "Pharmacist" },

  name: { type: String, required: true },
  imageURL: { type: String, default: null },
  formType: {
    type: String,
    enum: ["TABLET", "CAPSULE", "SYRUP", "INJECTION", "DROP", "CREAM", "OTHER"],
    required: true,
  },
  isChronic: { type: Boolean, default: false },

  inventory: {
    initialQuantity: { type: Number, required: true },
    currentQuantity: { type: Number, required: true },
    doseAmount: { type: Number, required: true },
    refillThreshold: { type: Number, default: 5 },
  },

  instructions: {
    relationToMeals: {
      type: String,
      enum: ["BEFORE_MEALS", "AFTER_MEALS", "WITH_FOOD", "ON_EMPTY_STOMACH", "NONE"],
      default: "NONE",
    },
    notes: { type: String },
  },

  schedule: {
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKLY", "AS_NEEDED"],
      required: true,
    },
    dosesPerDay: { type: Number, required: true },
    firstDoseTime: { type: String, required: true },
    timesOfDay: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },

  expirationDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Medication', MedicationSchema);
```

### 3.3 Refill Orders Collection (`refill_orders`)
The transactional state ledger tracking requests sent to pharmacists. Tied directly to a generated payment record.

> **Design Note (Fix #6):** The `fulfilledBy` field was removed. The `targetPharmacyId` pharmacist is always the fulfiller. If pharmacy transfer is needed in the future, add a `TRANSFERRED` status and a `transferredToId` field at that time.

```javascript
const RefillOrderSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  medicationId: { type: Schema.Types.ObjectId, ref: "Medication", required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: "Account", required: true }, // Patient, Caregiver, or Doctor account
  
  targetPharmacyId: { type: Schema.Types.ObjectId, ref: "Pharmacist", required: true, index: true },
  
  orderStatus: {
    type: String,
    enum: ["SUBMITTED", "APPROVED", "DISPENSED", "READY_FOR_PICKUP", "COMPLETED", "REJECTED"],
    default: "SUBMITTED",
    index: true,
  },
  
  fulfillmentType: {
    type: String,
    enum: ["PICKUP", "DELIVERY"],
    required: true,
  },
  deliveryAddress: {
    street: String,
    city: String,
    zipCode: String,
  },
  
  quantityRequested: { type: Number, required: true },
  pharmacistNotes: { type: String },
  dispensedAt: { type: Date },
  
  // Financial reference
  paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null }
}, { timestamps: true });

RefillOrderSchema.index({ orderStatus: 1, targetPharmacyId: 1 });

module.exports = mongoose.model('RefillOrder', RefillOrderSchema);
```

### 3.4 Dose Events Collection (`dose_events`)
Maintains the patient compliance auditing records. Status definitions are documented in Section 1.2.

```javascript
const DoseEventSchema = new Schema({
  medicationId: { type: Schema.Types.ObjectId, ref: "Medication", required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  scheduledFor: { type: Date, required: true, index: true },

  // --- Fix #12: LATE is now formally defined (see Section 1.2) ---
  status: {
    type: String,
    enum: ["PENDING", "TAKEN", "MISSED", "LATE", "SKIPPED"],
    default: "PENDING",
    index: true,
  },
  takenAt: { type: Date, default: null },
  source: { 
    type: String, 
    enum: ["manual", "whatsapp", "caregiver", "system_auto"], 
    default: "manual" 
  },
  
  escalationState: {
    type: String,
    enum: ["NONE", "PUSH_SENT", "SMS_SENT", "CAREGIVER_NOTIFIED"],
    default: "NONE",
  },
}, { timestamps: true });

DoseEventSchema.index({ patientId: 1, scheduledFor: -1 });
DoseEventSchema.index({ patientId: 1, medicationId: 1 });
DoseEventSchema.index({ status: 1, scheduledFor: 1 });

module.exports = mongoose.model('DoseEvent', DoseEventSchema);
```

### 3.5 Interactive Shared Notes Collection (`notes`)
Ensures secure segregation. Patients see all notes. Doctors, Pharmacists, and Caregivers can only retrieve notes they authored or were explicitly granted access to.

> **Fix #9:** Access control is enforced at the model layer via Mongoose statics — not left to ad-hoc controller queries.

```javascript
const NoteSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  creatorId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  
  targetRole: {
    type: String,
    enum: ["FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "DOCTOR", "PHARMACIST", "PATIENT_PRIVATE"],
    required: true,
    index: true
  },
  
  // Explicit account identifier authorized to view this note alongside the patient
  sharedWithId: { type: Schema.Types.ObjectId, ref: "Account", default: null, index: true },
  
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
}, { timestamps: true });

NoteSchema.index({ patientId: 1, targetRole: 1, sharedWithId: 1 });

/**
 * Fix #9: Enforced access control via static method.
 * Controllers MUST use this method — never raw Note.find().
 *
 * @param {String} role - The caller's Account.role
 * @param {ObjectId} accountId - The caller's Account._id
 * @param {ObjectId} [patientProfileId] - Required for PATIENT role
 * @returns {Query} Mongoose query with correct access filter applied
 */
NoteSchema.statics.findForRole = function (role, accountId, patientProfileId) {
  switch (role) {
    case "PATIENT":
      return this.find({ patientId: patientProfileId });
    case "FAMILY_CAREGIVER":
      return this.find({ targetRole: "FAMILY_CAREGIVER", sharedWithId: accountId });
    case "PROFESSIONAL_CAREGIVER":
      return this.find({ targetRole: "PROFESSIONAL_CAREGIVER", sharedWithId: accountId });
    case "DOCTOR":
      return this.find({ targetRole: "DOCTOR", sharedWithId: accountId });
    case "PHARMACIST":
      return this.find({ targetRole: "PHARMACIST", sharedWithId: accountId });
    default:
      return this.find({ _id: null }); // Return empty result set for unknown roles
  }
};

module.exports = mongoose.model('Note', NoteSchema);
```

### 3.6 Payments Collection (`payments`)
A financial ledger tracking transactions initiated by non-admin roles (Patients, Family Caregivers, Professional Caregivers, Doctors, and Pharmacists).

```javascript
const PaymentSchema = new Schema({
  // The non-admin account authorizing the payment
  payerAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true }, 
  payerRole: {
    type: String,
    enum: ["PATIENT", "FAMILY_CAREGIVER", "PROFESSIONAL_CAREGIVER", "DOCTOR", "PHARMACIST"],
    required: true
  },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: "EGP" },
  
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "PENDING",
    index: true
  },
  
  paymentMethod: {
    type: String,
    enum: ["CARD", "MOBILE_WALLET", "CASH_ON_DELIVERY", "KIOSK", "FAWRY"],
    required: true
  },
  
  paymentType: {
    type: String,
    enum: ["SUBSCRIPTION_UPGRADE", "REFILL_ORDER_PAYMENT", "PROFESSIONAL_CAREGIVER_HIRE"],
    required: true,
    index: true
  },
  
  // --- Fix #5: Polymorphic reference with refPath for type-safe population ---
  referenceId: { type: Schema.Types.ObjectId, refPath: 'referenceModel' },
  referenceModel: {
    type: String,
    enum: ["RefillOrder", "Doctor", "Pharmacist", "ProfessionalCaregiver"],
    required: true
  },
  
  gatewayTransactionId: { type: String, unique: true, sparse: true }, 
  gatewayRawResponse: { type: Schema.Types.Map, of: Schema.Types.Mixed }, 
}, { timestamps: true });

PaymentSchema.index({ payerAccountId: 1, status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
```

---

## 4. Educational Content Schemas

### 4.1 Disease Advice Collection (`disease_advice`)
Clinical bullet guidelines curated by verified doctors.

```javascript
const DiseaseAdviceSchema = new Schema({
  targetDisease: { type: String, required: true, index: true },
  dos: [{ type: String }],
  donts: [{ type: String }],
  publishedBy: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DiseaseAdviceSchema.index({ targetDisease: 1, isActive: 1 });

module.exports = mongoose.model('DiseaseAdvice', DiseaseAdviceSchema);
```

### 4.2 Disease Blogs Collection (`disease_blogs`)
Targeted educational insights linked to specific health conditions.

```javascript
const DiseaseBlogSchema = new Schema({
  targetDisease: { type: String, required: true, index: true },
  title: { type: String, required: true },
  coverImageURL: { type: String },
  content: { type: String, required: true },
  publishedBy: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DiseaseBlogSchema.index({ targetDisease: 1, isActive: 1 });

module.exports = mongoose.model('DiseaseBlog', DiseaseBlogSchema);
```

