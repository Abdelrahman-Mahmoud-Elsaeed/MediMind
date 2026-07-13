# Frontend Architecture Guide

## Philosophy

- Next.js App Router is used only for routing, layouts and SEO.
- All business logic lives inside feature modules.
- Features are isolated from each other.
- Shared code lives in `shared/`.
- Pages inside `app/` should be as small as possible.

---

# Project Structure

```text
src/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── loading.js
│   ├── error.js
│   ├── not-found.js
│   │
│   ├── auth/
│   ├── dashboard/
│   ├── medications/
│   ├── doses/
│   ├── conditions/
│   ├── companion/
│   ├── profile/
│   ├── education/
│   ├── settings/
│   │
│   ├── sitemap.js
│   └── robots.js
│
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── medication/
│   ├── dose/
│   ├── condition/
│   ├── companion/
│   ├── inventory/
│   ├── upload/
│   ├── education/
│   ├── profile/
│   └── settings/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   ├── config/
│   ├── lib/
│   └── styles/
│
├── store/
├── assets/
└── middleware.js
```

---

# Module Structure

Every feature follows the exact same structure.

```text
modules/
└── medication/
    ├── api/
    ├── components/
    ├── hooks/
    ├── pages/
    ├── services/
    ├── store/
    ├── utils/
    ├── constants/
    ├── index.js
    └── routes.js (optional)
```

---

# Folder Responsibilities

## app/

Contains only:

- Next.js routing
- Layouts
- Metadata
- Route groups
- Error pages

No business logic.

Example:

```jsx
import { MedicationPage } from "@/modules/medication";

export default function Page() {
    return <MedicationPage />;
}
```

---

## modules/

Each folder represents one business feature.

Examples:

- Auth
- Medication
- Companion
- Dashboard
- Education

A module should contain everything related to that feature.

Modules should **never depend on each other directly**.

Communication between modules should happen through:

- shared/services
- shared/hooks
- global store

---

## shared/

Contains reusable code.

Never place business logic here.

Example:

```
shared/components/Button
shared/components/Input
shared/components/Modal

shared/hooks/useDebounce
shared/hooks/useLocalStorage

shared/services/api
shared/services/socket

shared/utils/date
shared/utils/storage

shared/constants/routes
shared/constants/queryKeys
```

---


## store/

Global application state.

Examples

```
auth.store.js
ui.store.js
notification.store.js
```

Feature-specific state stays inside its own module.

---

# Layer Rules

Components

↓

Hooks

↓

Services

↓

API

```
Component
    ↓
Hook
    ↓
Service
    ↓
Axios
    ↓
Backend
```

Never skip layers.

Bad

```
Component
      ↓
Axios
```

Good

```
Component
↓
useMedication()
↓
MedicationService
↓
api.get()
```

---

# Mapping the Roadmap

## Week 1

Auth

```
modules/auth
```

Authentication state

```
store/AuthSlice.jsx
```

Axios Interceptors

```
shared/services/api.js
```

---

## Week 2

Medication Wizard

```
modules/medication
```

Conditions

```
modules/condition
```

Companion

```
modules/companion
```

Dashboard

```
modules/dashboard
```

---

## Week 3

Dose Timeline

```
modules/dose
```

Inventory

```
modules/inventory
```

Camera Upload

```
modules/upload
```

---

## Week 4

Education Feed

```
modules/education
```

---

# Adding a New Feature

Example: Notification

Create

```
modules/
    notification/
```

Add

```
api/
components/
hooks/
pages/
services/
store/
utils/
constants/
index.js
```

Create the route

```
app/notifications/page.jsx
```

```jsx
import { NotificationPage } from "@/modules/notification";

export default function Page() {
    return <NotificationPage />;
}
```
