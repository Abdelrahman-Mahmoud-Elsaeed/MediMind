# MediMind Frontend Design Manifest & Feature SOP

> **Purpose:** This manifest serves as the authoritative blueprint and AI Prompt Standard Operating Procedure (SOP) for developing, expanding, and standardizing frontend pages and features within MediMind. Use this document as direct context/prompting instructions for AI agents (or human developers) when adding new pages, routes, or features.

---

## 1. Tech Stack & Architecture Overview

* **Framework:** Next.js (App Router, React 18/19, TypeScript/JSX)
* **State Management:** Redux Toolkit (`src/store`), React Query (`@tanstack/react-query`), Local Component State
* **Styling & Design System:** Tailwind CSS (`globals.css`), `next-themes` (Dark/Light mode)
* **Internationalization (i18n):** `LanguageProvider` (`src/shared/lib/i18nContext`), Full LTR/RTL support (English & Arabic)
* **Authentication & Guards:** `AuthInitializer` (`src/app/providers.js`), Role-based access control (`PATIENT`, `CAREGIVER`, `DOCTOR`, `PHARAMACIST`, `ADMIN`)

---

## 2. Directory & Route Hierarchy Conventions

All frontend pages reside under `frontend/src/app/`. Route groups (`(group-name)`) are used to group routes logically without altering URL paths:

```text
frontend/src/
├── app/
│   ├── (public)/                 # Unauthenticated Public Routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── verify/page.tsx
│   │
│   ├── (patient)/                # Patient Portal (Auth required: PATIENT)
│   │   ├── medications/
│   │   │   ├── page.tsx          # Cabinet list
│   │   │   ├── add/page.tsx      # Add form
│   │   │   ├── [id]/page.tsx     # Details view
│   │   │   └── edit/[id]/page.tsx# Edit form
│   │   ├── adherence/page.tsx
│   │   ├── medical-records/page.tsx
│   │   ├── caregivers/page.tsx
│   │   └── ocr-scan/page.tsx
│   │
│   ├── (caregiver)/              # Caregiver Portal (Auth required: CAREGIVER)
│   │   └── patients/
│   │       ├── page.tsx
│   │       └── [id]/...
│   │
│   ├── (admin)/                  # Admin Portal (Auth required: ADMIN)
│   │   ├── admin-dashboard/page.tsx
│   │   └── users/page.tsx
│   │
│   ├── home/
│   │   ├── page.tsx              # Dynamic Home Router (Renders PatientHome / CaregiverHome)
│   │   ├── PatientHome.tsx
│   │   └── CaregiverHome.tsx
│   │
│   ├── profile/
│   │   ├── page.tsx              # Role-aware Profile Router
│   │   └── PatientProfile.tsx
│   │
│   ├── notifications/page.tsx
│   ├── layout.js                 # Root Layout & Theme Provider
│   ├── providers.js              # Global State & Auth Route Initializer
│   └── page.js                   # Root Route Redirector
│
├── modules/                      # Business Domain Modules
│   ├── auth/                     # Redux slices, thunks, services
│   ├── medications/
│   ├── adherence/
│   ├── caregivers/
│   └── profile/
│
└── shared/                       # Shared Utilities & Components
    ├── components/               # Buttons, Inputs, Modals, Cards, Navbars
    ├── lib/                      # i18nContext, API client Axios instance
    ├── hooks/                    # Custom hooks (useAuth, useLanguage, etc.)
    └── utils/                    # Helper functions, formatters
```

---

## 3. Step-by-Step SOP for Adding a New Page or Feature

Follow these strict guidelines whenever creating a new route or component:

### Step 1: Determine Route Group & Auth Requirement
* If the page is **Public** (no login required), place it under `src/app/(public)/<feature-name>/page.tsx`.
* If the page is **Patient-specific**, place it under `src/app/(patient)/<feature-name>/page.tsx`.
* If the page is **Caregiver-specific**, place it under `src/app/(caregiver)/<feature-name>/page.tsx`.
* If the page is **Admin-specific**, place it under `src/app/(admin)/<feature-name>/page.tsx`.

### Step 2: Update Auth Route Guard (if needed)
* Check `src/app/providers.js` inside `AuthInitializer`:
  * If adding a new public route, add the route path to the `publicRoutes` array.
  * If adding a protected route, ensure it is NOT in `publicRoutes` so `AuthInitializer` redirects unauthenticated users to `/login`.

### Step 3: Implement Page Component (`page.tsx`)
* Use Next.js App Router conventions.
* Keep `page.tsx` concise — extract main UI logic into modular components under `src/modules/<feature>/components/` or `src/app/(role)/<feature>/<FeatureComponent>.tsx`.
* Always enforce `'use client';` directive if using React hooks (`useState`, `useEffect`, `useSelector`, `useLanguage`).

### Step 4: UI/UX & Design Standards
* **RTL/LTR Support:** Use `useLanguage()` from `src/shared/lib/i18nContext`. Avoid hardcoded physical spacing like `mr-4` or `ml-4`; use logical utility classes (e.g., `me-4`, `ms-4`, `space-x-reverse`) or dynamic `dir` attributes.
* **Dark Mode & Dynamic Primary Palette Switching:** MediMind utilizes CSS variables (e.g., `--background`, `--surface`, `--primary`, `--on-surface`, `--surface-container`) defined in `globals.css`. Toggling `.dark` dynamically switches the primary palette and surface tokens. Ensure components use theme design tokens or explicit Tailwind `dark:` variants (e.g. `bg-[var(--surface)] dark:bg-[var(--surface-dim)] text-[var(--on-surface)]` or `bg-white dark:bg-gray-800 text-gray-900 dark:text-white`) so elements switch seamlessly with the primary theme.
* **Interactive & Micro-animations:** Include hover transitions (`transition-all duration-200 hover:shadow-lg`), loading skeletons, and interactive state feedback.

### Step 5: API & State Integration
* Define API request methods in `src/modules/<feature>/services/<feature>Api.js` or `src/shared/services/`.
* For global asynchronous state (auth, notifications, active patient), use **Redux Toolkit** thunks.
* For server data fetching & caching (lists, details, history), use **React Query** (`useQuery`, `useMutation`).

---

## 4. AI Prompt Template (Copy & Paste for AI Assistant)

When instructing an AI to create a new page or feature, copy and use the prompt template below:

```text
[CONTEXT & TASK INSTRUCTIONS FOR AI ASSISTANT]
You are working on the MediMind Next.js App Router codebase.
Refer to `frontend-design-manifest.md` for architecture standards.

Task: Implement a new feature/page for: [INSERT FEATURE NAME, e.g. "Doctor Notes History"]

Target Audience / Role: [INSERT ROLE, e.g. PATIENT / CAREGIVER / PUBLIC / ADMIN]

Requirements:
1. Route Path: Create the route file at `src/app/([ROLE_GROUP])/[FEATURE_NAME]/page.tsx`.
2. Auth Guard: Ensure the page handles authorization appropriately via `AuthInitializer` in `providers.js`.
3. Design System:
   - Support Dark Mode via `.dark` class dynamic primary palette & surface CSS variables (`--primary`, `--surface`, `--background`, `--on-surface`) or Tailwind `dark:` variant overrides.
   - Support RTL/LTR using `useLanguage()` from `src/shared/lib/i18nContext`.
   - Ensure clean micro-animations, loading state skeletons, and empty state UI.
4. API & Data Layer:
   - Create or update service file under `src/modules/[FEATURE_NAME]/services/`.
   - Use React Query (`useQuery` / `useMutation`) or Redux Toolkit for state management.
5. Verification:
   - Provide standard export default React component.
   - Include clear TypeScript/JSX prop definitions.
```

---

## 5. Upcoming / Planned Future Pages Matrix

| Feature / Page | Target Route Group | Role | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Shared Notes** | `(patient)/notes` | Patient | Yes (`PATIENT`) | View caregiver/doctor notes addressed to patient |
| **Refill Orders** | `(patient)/refills` | Patient | Yes (`PATIENT`) | Track refill order status with local pharmacies |
| **Doctor Notes** | `(caregiver)/patients/[id]/notes` | Caregiver | Yes (`CAREGIVER`)| View notes regarding assigned patient care |
| **Pharmacy Search** | `(public)/pharmacies` | Public | No | Search nearby partner pharmacies and operating hours |
| **Health Advice Blog** | `(public)/health-advice` | Public | No | Published medical articles and dosage safety tips |
