# 💊 وفاء (Wafa)

> منصة متكاملة لإدارة الأدوية ومتابعة المرضى المزمنين في الوطن العربي

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](.)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](.)
[![Tests](https://img.shields.io/badge/tests-136%20passing-brightgreen.svg)](.)
[![Languages](https://img.shields.io/badge/lang-Arabic%20%7C%20English-orange.svg)](.)
[![PWA](https://img.shields.io/badge/PWA-ready-purple.svg)](.)

---

## 📌 عن المشروع

وفاء هي منصة PWA عربية بالكامل بتربط المريض المزمن بأهله وصيدليته ودكتوره في حتة واحدة، عشان تحل مشكلة نسيان الدواء اللي بتعاني منها أغلب العائلات المصرية والعربية.

### 🎯 المشكلة اللي بنحلها
- **9 مليون** مريض سكر في مصر
- **26 مليون** مريض ضغط في مصر
- **70,000+** صيدلية في مصر (سوق ضخم غير مخدوم رقمياً)
- نسبة عدم الالتزام بالأدوية المزمنة بتوصل لـ 50%+

### 💡 الحل
منصة بتربط 4 أطراف في حتة واحدة:
1. **المريض** 🧓 — يتذكر دواءه بضغطة زرار واحدة (مجاني للأبد)
2. **الأهل** 👨‍👩‍👧 — يطمنوا على أحبابهم في أي وقت (Freemium)
3. **الصيدلية** 💊 — تتواصل مع عملائها وتزود مبيعاتها (B2B)
4. **الدكتور** 👨‍⚕️ — يشوف التزام مرضاه ببيانات حقيقية (B2B + WhatsApp)

---

## ✨ المميزات (Features)

### 🔐 المصادقة (Authentication)
- **Phone + OTP** authentication (لا إيميل، لا كلمة سر للمستخدمين العاديين)
- OTP آمن (SHA-256 hashed، 5 دقائق expiry، 5 محاولات max)
- JWT access token (15 min) + refresh token (7 days, HttpOnly cookie)
- 5 أدوار (PATIENT, CAREGIVER, PHARMACY, DOCTOR, ADMIN)
- 3 مستويات admin (super_admin, ops_admin, finance_admin)
- تتبع موافقات (consent tracking) للامتثال لقانون حماية البيانات المصري 151/2020

### 💊 إدارة الأدوية (Medications)
- إضافة أدوية بـ 3 خطوات (اسم → جرعة → صيدلية)
- 8 أنواع أدوية (أقراص، كبسولات، شراب، حقن، نقط، كريم، بخاخ، أخرى)
- تتبع المخزون مع تنبيهات التجديد (refill alerts)
- تنبيهات انتهاء الصلاحية
- AI OCR scan (stub — جاهز للتكامل مع OpenAI Vision)
- ربط الأدوية بالأمراض المزمنة

### ⏰ إدارة الجرعات (Doses)
- توليد تلقائي لـ DoseEvents (cron job كل ساعة)
- تأكيد الجرعات بضغطة زرار واحدة (PWA, WhatsApp, notification action)
- حساب نسبة الالتزام (يومي، أسبوعي، شهري)
- **Escalation Matrix** (3 خطوات):
  - T+0: PWA Push notification
  - T+15: WhatsApp/SMS fallback
  - T+30: Caregiver alert

### 🔔 الإشعارات (Notifications)
- **Push Notifications** (VAPID + Web Push API)
- **Real-time** notifications via **Socket.IO** (WebSockets)
- **WhatsApp** integration (WhatsApp Business API)
- **SMS** fallback (AWS SNS)
- **Batch notifications** (تجميع إشعارات الصبح/الضهر/المسا)
- **Quiet hours** (ساعات هدوء)
- Notification center في الـ frontend مع فلترة وتجميع حسب التاريخ

### 👨‍👩‍👧 العلاقات والدعوات (Relationships)
- **QR Code invitations** — المريض يولّد QR يبعه لأهله
- صلاحيات مفصلة (canAddMedication, canViewMedicalRecords, canConfirmDoses, canReceiveAlerts)
- 6 أنواع قرابة (ابن، ابنة، زوج، أب، أخ، أخرى)
- Tokens آمنة (24 bytes hex، 7 أيام expiry)
- صفحة قبول الدعوة مع عرض الصلاحيات

### 💊 لوحة تحكم الصيدلية (Pharmacy Dashboard)
- إحصائيات سريعة (عدد المرضى، نشطين، يحتاجون تجديد، إيراد متوقع)
- قائمة المرضى مع نسبة التزام كل واحد
- تنبيهات التجديد (refill alerts)
- زرار "بعت reminder" بضغطة واحدة
- تقارير أسبوعية (analytics)
- فترة تجريبية 3 شهور مجاناً

### 👨‍⚕️ لوحة تحكم الدكتور (Doctor Dashboard)
- **WhatsApp Weekly Report** (تقرير أسبوعي كل جمعة 6 مساءً)
- معاينة التقرير قبل الإرسال
- إعدادات قابلة للتخصيص (يوم، ميعاد، محتوى)
- **Deep Analytics Dashboard**:
  - Cohort analysis (5 tiers)
  - Adherence trend (line chart)
  - Per-medication breakdown
  - Intervention list (critical + warning)
  - Refill alerts
  - Heatmap (7×24 of missed doses)
  - Patient detail view مع time-of-day analysis

### 👑 لوحة تحكم الأدمن (Admin Dashboard)
- إحصائيات شاملة (مستخدمين، محتوى، التزام)
- نمو المستخدمين (12 شهر — line chart)
- مقاييس التفاعل (DAU, WAU, MAU, stickiness)
- تقارير مالية (MRR, ARR, revenue breakdown)
- إدارة المستخدمين مع RBAC
- حالة النظام (DB stats, memory, uptime)

### 📄 التصدير (Export)
- **PDF** reports (HTML قابل للطباعة)
- **Excel/CSV** reports (مع BOM للعربية)
- تصدير تقرير المريض (PDF + CSV)
- تصدير تقرير الدكتور (CSV)
- مشاركة عبر WhatsApp

### 🌍 التدويل (i18n)
- **Arabic** (default، RTL)
- **English** (LTR)
- Language switcher في الإعدادات
- حفظ التفضيل في localStorage
- تحديث تلقائي لـ `<html lang>` و `<dir>`

### 📱 PWA
- Manifest جاهز للتثبيت على الموبايل
- Service Worker (push notifications + offline + cache)
- 8 أيقونات (192, 512, maskable, apple-touch, favicon, badge)
- Offline fallback page
- Installable على Android و iOS

### 🤖 الذكاء الاصطناعي (AI Features)

#### Drug Interaction Checker (مدقق تفاعلات الأدوية)
- قاعدة بيانات بـ **30+ تفاعل** بين أدوية الأمراض المزمنة
- تغطي: السكر، الضغط، الكوليسترول، القلب، الغدة الدرقية
- 4 مستويات خطورة: mild / moderate / severe / contraindicated
- فحص تلقائي عند إضافة دواء جديد (تحذير قبل الحفظ)
- توصيات مخصصة لكل تفاعل
- شرح آلية التفاعل (mechanism)

#### Adherence Prediction Engine (محرك توقعات الالتزام)
- توقعات لـ 7 أيام قادمة (احتمالية فوات كل يوم)
- **6 عوامل خطر** محسوبة:
  - نسبة الالتزام (30 يوم) — وزن 40
  - الاتجاه الأخير (7 أيام vs الأسبوع السابق) — وزن 20
  - نمط أيام الأسبوع (ويك إند vs أيام) — وزن 15
  - نمط أوقات الجرعات (صبح vs مساء) — وزن 15
  - تعقيد الأدوية (عدد + جرعات) — وزن 10
  - الستريك الحالي (gamification) — وزن 10
- 4 مستويات خطر: LOW / MODERATE / HIGH / CRITICAL
- توصيات مخصصة لكل مستوى + عوامل محددة

#### Smart Reminders (التذكيرات الذكية — بتتعلم من سلوك المريض)
- **تحليل المواعيد**: بيتعلم إمتى المريض بيأخذ أدويته فعلاً
  - لو بيتأخر 30 دقيقة → يذكّر 30 دقيقة بدري
  - لو بيأخذ بدري → يؤخر التذكير
- **تفضيل القنوات**: بيتعلم أي قناة أشط (Push / WhatsApp / SMS)
- **تردد متكيف**: يعدّل عدد التذكيرات حسب الالتزام
  - ملتزم جداً (90%+) → تذكيرات أقل
  - التزام ضعيف (<50%) → تذكيرات مكثفة
- **كشف الأنماط**: يكتشف مشاكل محددة
  - صعوبة الويك إند
  - يوم معين مشكلة
  - اتجاه متناقص
- **اقتراحات جدول**: يقترح تعديل مواعيد الجرعات
  - "نقترح نذكّرك 40 دقيقة بدري"
  - مع نسبة ثقة (confidence score)
- **5 أنواع توصيات**: TIMING_ADJUSTMENT / WEEKEND_BOOST / DAY_SPECIFIC / REDUCE_FREQUENCY / INCREASE_FREQUENCY

---

## 🏗️ الـ Architecture

```
Modular Monolith — Node.js + Express + MongoDB + Socket.IO
                ↓
  Frontend: Next.js 16 PWA (Arabic RTL + English LTR)
                ↓
  Background Worker: BullMQ + node-cron (escalation, dose generation, weekly reports)
                ↓
  External APIs: WhatsApp Business + AWS SNS + FCM + OpenAI Vision (stub)
```

### Tech Stack
| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 |
| Backend | Node.js + Express 5 |
| Database | MongoDB 7 (Mongoose) |
| Cache/Queue | Redis 7 + BullMQ |
| Real-time | Socket.IO 4 |
| Notifications | FCM + WhatsApp Business API + AWS SNS |
| Storage | AWS S3 |
| Monitoring | Sentry + Prometheus + Grafana |
| Hosting | Vercel (frontend) + Railway (backend + worker) |

---

## 📁 الـ Project Structure

```
wafa/
├── artifact/                    # Design & spec documents
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── app.js               # Express app + HTTP server
│   │   ├── index.route.js       # Root router (10 modules)
│   │   ├── config/              # env, db, worker
│   │   ├── sheared/             # Shared utilities
│   │   │   ├── middleware/      # auth, access, validation, error, security
│   │   │   ├── services/        # WhatsApp, Socket.IO, monitoring
│   │   │   └── utils/           # JWT, logger
│   │   └── modules/             # 10 feature modules
│   │       ├── auth/            # Phone + OTP authentication
│   │       ├── medications/     # CRUD + OCR scan
│   │       ├── doses/           # Confirm/skip + adherence
│   │       ├── notifications/   # Push + escalation + log
│   │       ├── pharmacy/        # B2B dashboard
│   │       ├── doctor/          # Dashboard + reports + WhatsApp
│   │       ├── relationships/   # QR invitations
│   │       ├── admin/           # Platform analytics
│   │       ├── export/          # PDF + CSV export
│   │       └── conditions/      # Medical conditions
│   ├── api/index.js             # Vercel serverless entry
│   ├── Dockerfile
│   ├── railway.toml
│   └── vercel.json
├── frontend/                    # Next.js PWA
│   ├── src/
│   │   ├── app/                 # 22 pages
│   │   │   ├── layout.js        # RTL + Cairo font + I18nProvider
│   │   │   ├── page.js          # Landing
│   │   │   ├── auth/            # Phone + OTP login
│   │   │   ├── dashboard/       # Patient dashboard
│   │   │   ├── medications/     # List + add + detail
│   │   │   ├── doses/           # Daily schedule
│   │   │   ├── companion/       # Caregiver view
│   │   │   ├── pharmacy/        # Pharmacy dashboard
│   │   │   ├── doctor/          # Doctor dashboard + reports
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── reports/         # Patient reports + export
│   │   │   ├── notifications/   # Notification center
│   │   │   ├── invite/          # QR code generation
│   │   │   ├── accept-invite/   # Accept invitation
│   │   │   └── settings/        # Profile + notifications + privacy
│   │   └── shared/
│   │       ├── components/      # UI library
│   │       ├── hooks/           # usePushNotifications, useSocket
│   │       ├── i18n/            # translations + provider
│   │       └── lib/             # API client
│   ├── public/                  # manifest, sw.js, icons, offline
│   ├── Dockerfile
│   └── vercel.json
├── worker/                      # Background job processor
│   ├── src/
│   │   ├── jobs/                # 5 cron jobs
│   │   │   ├── escalation.job.js       # Every minute
│   │   │   ├── generateDoses.job.js    # Hourly
│   │   │   ├── refillReminders.job.js  # Daily 9 AM
│   │   │   ├── expirationCheck.job.js  # Weekly Monday
│   │   │   └── weeklyReports.job.js    # Friday 6 PM
│   │   └── services/            # Worker-side services
│   ├── Dockerfile
│   └── railway.toml
├── docker/                      # Docker Compose for local dev
├── scripts/                     # Utility scripts
│   ├── deploy.sh                # Vercel + Railway deployment
│   ├── seed.js                  # Database seeding
│   ├── test-push.js             # Push notification test
│   └── generate_pwa_icons.py    # PWA icon generator
├── monitoring/                  # Prometheus + Grafana configs
├── .env.example
├── .gitignore
├── DEPLOYMENT.md                # Full deployment guide
└── README.md                    # This file
```

---

## 🚀 Quick Start

### 1. Using Docker (Recommended)
```bash
# Clone & extract
unzip wafa_v2.zip && cd wafa

# Start MongoDB + Redis + API + Worker
cd docker && docker-compose up -d

# Install & start frontend
cd ../frontend && npm install && npm run dev
```

### 2. Manual Setup
```bash
# 1. Start MongoDB + Redis (local or Docker)
docker run -d -p 27017:27017 mongo:7.0
docker run -d -p 6379:6379 redis:7-alpine

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../worker && npm install

# 3. Set up environment
cp .env.example .env  # Edit with your values

# 4. Seed database (optional, for development)
cd .. && node scripts/seed.js --clean --verbose

# 5. Run services (3 terminals)
cd backend && npm run dev      # Port 8080
cd frontend && npm run dev     # Port 3000
cd worker && npm start         # Port 3001
```

### 3. Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- Health check: http://localhost:8080/api/v1/health
- Worker health: http://localhost:3001/health

---

## 🧪 Testing

```bash
cd backend

# Run all tests
npm test

# Run specific test suite
npx jest src/tests/services/otp.service.test.js

# Run with coverage
npx jest --coverage
```

### Test Coverage
| Suite | Tests | Coverage |
|-------|-------|----------|
| OTP Service | 15 | Generation, hashing, verification, expiry |
| Account Model | 18 | Validation, roles, admin levels, subscription |
| Medication Model | 13 | Schema, virtuals, methods |
| WhatsApp Service | 9 | All message types |
| Doctor Reports | 22 | All helpers (cohort, trend, heatmap) |
| Relationship | 15 | Schema, status, methods |
| Admin Service | 18 | Config, controller, routes, RBAC |
| Export Service | 12 | Config, helpers, HTML generation |
| Socket Service | 14 | Config, rooms, events |
| Drug Interaction | 29 | Database, findInteractions, checkAll, scoring |
| Adherence Prediction | 19 | Risk levels, complexity, patterns, predictions |
| Smart Reminders | 26 | Timing analysis, patterns, suggestions, frequency |
| **Total** | **210** | **All passing ✅** |

---

## 🔐 Security

### Authentication
- Phone + OTP (no passwords for regular users)
- OTP hashed with SHA-256 + salt
- 5-minute expiry, 5 max attempts, 60s resend cooldown
- JWT access (15min) + refresh (7days, HttpOnly cookie)

### Authorization
- Role-based access control (5 roles)
- Admin sub-levels (3 levels with different permissions)
- `verifyPatientAccess` middleware — verifies access to patient data
- `verifyResourceAccess` middleware — verifies access to specific resource

### HTTP Security
- **Helmet** for security headers
- **CSP** (Content Security Policy) — strict, allow only trusted sources
- **Rate limiting**:
  - Global: 100 requests/minute per IP
  - Auth: 5 requests/15 minutes per IP
  - Media: 20 requests/hour per IP
- **CORS** — configurable origins
- **HSTS** — forced HTTPS in production

### Data Protection
- Egyptian Data Protection Law 151/2020 compliant
- Consent tracking for all data sharing
- AES-256 encryption at rest (MongoDB)
- HTTPS/TLS 1.3 in transit
- Audit logs for all PHI access

---

## 📊 Monitoring

### Error Tracking (Sentry)
- Frontend errors (Next.js)
- Backend errors (Node.js)
- Worker errors
- Performance monitoring
- Release tracking

### Metrics (Prometheus + Grafana)
- HTTP request duration histogram
- Request count by route
- Error rate
- Active connections (Socket.IO)
- Database operation duration
- Worker job duration
- Custom business metrics (doses confirmed, notifications sent)

### Dashboards (Grafana)
- API Overview (requests, errors, latency)
- Business Metrics (adherence, signups, retention)
- Worker Health (jobs processed, queue depth)
- System Health (CPU, memory, uptime)

---

## 🌍 Deployment

### Quick Deploy
```bash
# Install CLI tools
npm install -g vercel @railway/cli

# Run deployment script
./scripts/deploy.sh
```

### Manual Deploy
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions.

### Cost Estimates
| Service | Free Tier | Production |
|---------|-----------|------------|
| Vercel (Frontend) | ✅ Hobby (free) | $20/month (Pro) |
| Railway (Backend + Worker) | $5 credit/month | $5-20/month |
| MongoDB Atlas | 512MB (free) | $9/month (2GB) |
| **Total (MVP)** | **$0/month** | **~$25/month** |

---

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/send-otp` | Send OTP to phone | Public |
| POST | `/auth/verify-otp` | Verify OTP and login/register | Public |
| POST | `/auth/refresh` | Refresh access token | Cookie |
| POST | `/auth/logout` | Logout | Public |
| GET | `/auth/me` | Get current user | Private |

### Medications (`/api/v1/medications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/medications` | Create medication | PATIENT, CAREGIVER |
| GET | `/medications` | List medications | All roles |
| GET | `/medications/:id` | Get medication | All roles |
| PUT | `/medications/:id` | Update medication | PATIENT, CAREGIVER |
| DELETE | `/medications/:id` | Deactivate medication | PATIENT, CAREGIVER |
| POST | `/medications/:id/refill` | Refill inventory | PATIENT, CAREGIVER, PHARMACY |
| POST | `/medications/scan` | AI OCR scan | PATIENT, CAREGIVER |
| GET | `/medications/refill-needed` | Refill-needed meds | PATIENT, CAREGIVER, PHARMACY |
| GET | `/medications/expiring-soon` | Expiring meds | PATIENT, CAREGIVER |

### Doses (`/api/v1/doses`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/doses` | Daily schedule | All roles |
| GET | `/doses/adherence` | Adherence stats | PATIENT, CAREGIVER, DOCTOR |
| POST | `/doses/:id/confirm` | Confirm dose taken | PATIENT, CAREGIVER |
| POST | `/doses/:id/skip` | Skip dose | PATIENT, CAREGIVER |

### Notifications (`/api/v1/notifications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications/vapid-public-key` | Get VAPID key | Private |
| POST | `/notifications/subscribe` | Save push subscription | Private |
| POST | `/notifications/unsubscribe` | Remove subscription | Private |
| GET | `/notifications` | Notification history | Private |
| POST | `/notifications/:id/click` | Mark as clicked | Private |
| POST | `/notifications/test` | Send test push | Private |

### Pharmacy (`/api/v1/pharmacy`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/pharmacy/dashboard` | Dashboard stats | PHARMACY |
| GET | `/pharmacy/patients` | List patients | PHARMACY |
| GET | `/pharmacy/refill-needed` | Refill-needed patients | PHARMACY |
| GET | `/pharmacy/analytics` | Weekly analytics | PHARMACY |
| POST | `/pharmacy/patients/:id/refill-reminder` | Send reminder | PHARMACY |

### Doctor (`/api/v1/doctor`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/doctor/dashboard` | Dashboard overview | DOCTOR |
| GET | `/doctor/patients` | List patients | DOCTOR |
| GET | `/doctor/weekly-report-preview` | WhatsApp report preview | DOCTOR |
| GET | `/doctor/reports` | Full analytics report | DOCTOR |
| GET | `/doctor/reports/patients/:id` | Patient detail report | DOCTOR |
| PUT | `/doctor/report-settings` | Update WhatsApp settings | DOCTOR |

### Relationships (`/api/v1/relationships`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/relationships/invite` | Create QR invitation | PATIENT |
| GET | `/relationships/invitation/:token` | Get invitation details | Public |
| POST | `/relationships/accept/:token` | Accept invitation | CAREGIVER |
| GET | `/relationships` | List relationships | PATIENT, CAREGIVER |
| DELETE | `/relationships/:id` | Revoke relationship | PATIENT, CAREGIVER |

### Admin (`/api/v1/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/dashboard` | Platform overview | ADMIN |
| GET | `/admin/user-growth` | User growth chart | ADMIN |
| GET | `/admin/engagement` | Engagement metrics | ADMIN |
| GET | `/admin/financials` | Financial summary | super_admin, finance_admin |
| GET | `/admin/users` | All users | super_admin, ops_admin |
| GET | `/admin/system-health` | System health | ADMIN |

### Export (`/api/v1/export`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/export/patient/:id/pdf` | Patient report (HTML/PDF) | PATIENT, CAREGIVER, DOCTOR |
| GET | `/export/patient/:id/csv` | Patient report (CSV) | PATIENT, CAREGIVER, DOCTOR |
| GET | `/export/doctor/csv` | Doctor report (CSV) | DOCTOR |

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| Account | Authentication + role + consents + subscription |
| Patient | Patient profile + gamification |
| Caregiver | Caregiver profile + alert settings |
| Pharmacy | Pharmacy profile + location + settings |
| Doctor | Doctor profile + WhatsApp report settings |
| MedicalCondition | Patient's medical conditions |
| Medication | Medication + inventory + schedule + stats |
| DoseEvent | Scheduled dose + status + escalation |
| PushSubscription | Web Push subscription |
| NotificationLog | Audit trail of all notifications |
| Relationship | Patient-caregiver invitation + link |

---

## 🧰 Utility Scripts

| Script | Description |
|--------|-------------|
| `scripts/seed.js` | Seed database with test data |
| `scripts/test-push.js` | Test push notification pipeline |
| `scripts/deploy.sh` | Deploy to Vercel + Railway |
| `scripts/generate_pwa_icons.py` | Generate PWA icons |

---

## 📄 License

ISC License — © 2026 وفاء

---

## 📞 Contact

- **Website:** [wafa.app](https://wafa.app) (coming soon)
- **Email:** hello@wafa.app
- **Location:** Cairo, Egypt

---

## 🙏 Acknowledgments

- Built with ❤️ for the Arab world
- Inspired by the "100 Million Health" initiative
- Thanks to all open-source projects that made this possible

---

> 💊 **وفاء** — نبني المستقبل الصحي للوطن العربي
