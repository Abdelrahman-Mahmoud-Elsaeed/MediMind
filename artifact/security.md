# Security Architecture & Threat Mitigation (Artifact 4)

**Project Title:** Intelligent Medication Management Platform  
**Phase:** Phase 4 (Artifact 4)  
**Target Audience:** Security Engineers, DevOps, Development Team  

---

## 1. Authentication & Session Management

We employ a split-token architecture to balance user convenience with maximum security against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

| Token Type | Storage Mechanism | Expiration | Purpose & Security Benefit |
| :--- | :--- | :--- | :--- |
| **Access Token** | Memory (Frontend state) | 15–30 Minutes | Used for API authorization (`Bearer <TOKEN>`). If stolen via XSS, the window of vulnerability is extremely small. |
| **Refresh Token** | `HttpOnly`, `Secure`, `SameSite=Strict` Cookie | 7 Days | Automatically sent to `/auth/refresh` to get new Access Tokens. Inaccessible to JavaScript, completely eliminating XSS token theft. |

**Password Storage:** All user passwords must be hashed using a strong, salted cryptographic algorithm (e.g., **bcrypt** with a minimum cost factor of 12, or **Argon2**) prior to database insertion.

---

## 2. Role-Based Access Control (RBAC) & Delegation

Access to endpoints is strictly governed by the user's role and their relational links.

* **PATIENT:** Can only access and modify their own `patientId` records, medications, and profile.
* **CAREGIVER:** Access is granted *exclusively* through the `Relationships` bridge table. 
  * A Caregiver cannot view a Patient's medical conditions unless the Patient has explicitly granted `canViewMedicalRecords: true`.
  * The backend middleware must verify the `Relationship` status (`ACCEPTED`) on every delegated API call.
* **ADMIN:** Has access to user management and global educational content management (`disease_blogs`, `disease_advice`), but *cannot* access raw Patient Medical Data/PHI without explicit audit-logged escalation.

---

## 3. Data Protection (In Transit & At Rest)

As a healthcare application handling Personal Health Information (PHI), data encryption is mandatory.

### 3.1 Data in Transit
* **TLS/SSL Encryption:** All API traffic, frontend communications, and database connections must be encrypted using TLS 1.2 or higher (HTTPS). Unencrypted HTTP traffic will be aggressively redirected or dropped.

### 3.2 Data at Rest
* **Database Encryption:** The database storage volumes (e.g., AWS EBS, MongoDB Atlas clusters) must be encrypted at rest using AES-256.
* **Sensitive Fields:** Highly sensitive data (e.g., government IDs, if ever collected) should utilize application-level/field-level encryption before being written to the database.

---

## 4. API Defense & Network Security

* **CORS (Cross-Origin Resource Sharing):** Strict CORS policies must be enforced. Only exact matches of the production and staging frontend URLs will be permitted. Wildcards (`*`) are strictly prohibited in production.
* **Rate Limiting (DDoS & Brute Force Protection):**
  * `/auth/login` & `/auth/register`: Max 5 attempts per IP per 15 minutes.
  * `/medications/scan` & `/uploads/image`: Max 20 requests per IP per hour (to prevent cloud billing attacks).
  * Global API: Standard 100 requests per minute per IP.
* **Input Validation & Sanitization:** All incoming JSON payloads must be validated against a strict schema (e.g., using Joi or Zod) to prevent NoSQL Injection and payload bloat.

---

## 5. Media Upload Security (Medication Images)

Because the system allows users to upload images of their medications (`/uploads/image`), strict guardrails must be placed on the object storage bucket (e.g., AWS S3).

* **MIME-Type Validation:** The backend must independently verify the file's "magic numbers" (binary header) to ensure it is actually an image (`image/jpeg`, `image/png`), not just trusting the `.jpg` extension.
* **Size Limits:** Enforced at the proxy/API layer (Maximum 5MB per image).
* **Storage Bucket Isolation:** Uploaded files must be stored in a dedicated bucket configured to serve files from a separate domain/subdomain. This prevents uploaded malicious SVGs/HTML from executing code within the context of the main application domain.
* **Orphan Cleanup:** If an image is uploaded but the medication creation API is never called, a cron job should purge unlinked images older than 24 hours to save storage costs.
