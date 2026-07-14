# Product Navigation Flow

## Authentication

* Login
* Register

## Core Patient Navigation Paths:
```
[ Home ] ───> [/notifications] (Dynamic Notifications)
│
├───> [/medications] (Cabinet View)
│ ├───> [/medications/add] (Intake Wizard Flow)
│ |  |───> [/ocr-scan] (Pill bottle text/info ingestion)
│ ├───> [/medications/[id]] (Info Card)
│ └───> [/medications/edit/[id]] (Edit Form)
│
├───> [/adherence] (Timeline logs & taken/skipped buttons)
│
├───> [/caregivers] (Manage active circle)
│ └───> [/caregivers/add] (Invite caregiver link)
│
└───> [/profile]
    └───> [/medical-records] (Condition & vitals tracking)
        └───> [/medical-records/conditions]
            ├───> [/medical-records/conditions/add]
            └───> [/medical-records/conditions/[id]]
```
