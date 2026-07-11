# Upload Module

## Module Overview and Purpose

The Upload module provides file-handling capabilities for the application. It manages uploading prescription document files, scanning medical reports, and updating profile avatars by sending multipart/form-data to storage buckets and returning remote asset URLs.

## Responsibilities and Scope

The Upload module is responsible for:
- Providing file drag-and-drop or picker layouts.
- Verifying file size limitations and extension/mime-type restrictions.
- Sending file data via multipart/form-data requests to the storage API.
- Emitting progress bar tracking loaders.

The module does NOT handle:
- Associating the returned remote URL to user database records directly (delegated to the Profile or Medication modules).
- Physical server-side storage configuration (handled by backend).

## Features Owned by the Module

### 1. Drag and Drop Input
- Universal component supporting single or multiple file uploads, size warnings, and type validations.

### 2. Upload Progress Tracker
- Custom progress bar component highlighting active chunk progress.

## Functional Requirements

### FR-U-1: File Selection
- Users must be able to upload files using drag-and-drop actions.

### FR-U-2: Security Checks
- System must intercept and reject invalid file types or files exceeding size thresholds.

## Business Rules and Validation Rules

### Upload Constraints (Zod/JS validation)
- **Max File Size:** 5MB per upload.
- **Allowed MIME Types:** `image/jpeg`, `image/png`, `application/pdf`.

---

## User Workflows

### Upload Profile Photo Workflow
```mermaid
sequenceFlow
  participant User
  participant DropZone
  participant UploadActions (uploadFileThunk)
  participant UploadService
  participant ReduxStore

  User->>DropZone: Drag and drop picture file
  DropZone->>DropZone: Perform client-side size & type check
  DropZone->>UploadActions (uploadFileThunk): Dispatch uploadFile({ file })
  UploadActions (uploadFileThunk)->>UploadService: Call uploadFile(file)
  UploadService->>UploadService: Send POST request via apiClient (multipart/form-data)
  UploadService-->>UploadActions (uploadFileThunk): Return remote asset URL
  UploadActions (uploadFileThunk)-->>ReduxStore: Update state (uploaded file URL)
  DropZone->>User: Display upload success and thumbnail preview
```

---

## Components

### FileUploaderComponent
Primary user interface containing the file drop-zone area.
- **State:**
  - `selectedFile` (File object).
  - `progress` (number).
  - `error` (string).
- **Behavior:**
  - Disallows uploads if criteria are breached.

---

## Hooks

### useUpload
Simplifies dispatcher calls:
- **Exposes:**
  - `uploadedUrl`: Remote storage string.
  - `progress`: Number between 0 and 100.
  - `loading`: Active uploads indicator.
  - Action triggers: `uploadFile()`, `resetUploadState()`.

---

## Services

### uploadService
Handles form-data posting:
- **Methods:**
  - `uploadFile(file)`: Sends `POST /upload` with multipart form headers.

---

## State Management

### Redux State Slice (`uploadSlice`)
- **Initial State:**
  ```javascript
  {
    url: null,
    progress: 0,
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `resetUploadState`: Resets state variables.

---

## API Integration

Accesses storage API via Axios `apiClient` defined in `@/shared/lib` using custom form-data config.

---

## Routing

Integrated as reusable component overlays (no standalone pages).

---

## Validation

- Validated using custom file checks and Zod schemas in `validation/uploadValidation.js`.
- Errors prevent network dispatches and output warning texts.
