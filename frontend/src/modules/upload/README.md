# Upload Module

## Module Overview and Purpose

The Upload module provides secure image upload capabilities and integrates with AI-powered OCR to read medication packs. Following the BRD, this module enforces strict OCR safety validations based on confidence thresholds to prevent dangerous medication data entry errors.

## Responsibilities and Scope

The Upload module is exclusively responsible for:
- Interfacing securely with the device camera or file picker.
- Validating images on the client side (size limits, MIME types).
- Handling binary file uploads securely.
- Processing OCR scanning feedback and enforcing confidence threshold validation.

The module does NOT handle:
- Final creation of medication records (handled by Medication module Wizard after OCR auto-population).

## Features Owned by the Module

### 1. Image Capture
- PWA capabilities allowing users to take photos directly via native device cameras.
- Client-side compression and resizing to save bandwidth.

### 2. OCR Integration
- Submit optimized images for AI scanning.
- Handle confidence interval thresholds, rejecting poor scans.

## Functional Requirements

### FR-U-1: Camera Access
- The system must support native device camera uploads to function as a seamless PWA.

### AI-Powered Medication OCR (BRD 2.1)
- Utilize image processing of medicine labels via device cameras to automatically extract and populate medication details.

## Business Rules and Validation Rules

### OCR Safety Validation (BRD 3.3)
- **The Threshold Rule:** If the OCR/AI confidence score returned by the backend falls below **90%**, the platform **must reject** the scan entirely. It must display a localized error and prompt the user to retake the photo or enter data manually. The system must *never guess* medical data.

## User Workflows

### Scan Medication Workflow
1. User clicks 'Scan Medicine Pack' during the intake wizard.
2. Device prompts for camera access.
3. User takes a photo of the medication label.
4. Module compresses the photo and uploads it.
5. Backend runs OCR and returns extracted data and a confidence score.
6. If confidence > 90%, module auto-populates the Wizard form.
7. If confidence < 90%, module blocks population and shows a strict warning to retake the photo.

## Components

### ImageUploader
Drag-and-drop or click-to-upload area.
**Props:**
- `onUploadSuccess`: Callback passing uploaded file URL or OCR data.

### CameraCapture
PWA wrapper component for native camera access.
**Props:**
- `onCapture`: Callback passing the captured image Blob.

## Hooks

### useUpload
Custom hook for handling file uploads, progress tracking, and OCR logic.

**Returns:**
```javascript
{
  isUploading: boolean,
  isScanning: boolean,
  uploadProgress: number,
  uploadImage: (file: File) => Promise<string>,
  scanMedication: (file: File) => Promise<OCRData>
}
```

**Usage:**
```javascript
const { scanMedication, isScanning } = useUpload();

const handleCapture = async (blob) => {
  const data = await scanMedication(blob);
  if (data.confidence >= 0.90) populateForm(data);
};
```

## Services

### UploadService
Service layer managing `multipart/form-data` API calls.

**Methods:**
- `uploadImage(formData)`: POST `/api/v1/uploads/image` - Standard file upload.
- `scanMedication(formData)`: POST `/api/v1/uploads/scan` - Specialized OCR endpoint.

## State Management

### Upload Store
Transient local state managing upload progress bars.

**State:**
```javascript
{
  progress: number // 0 to 100
}
```

**Actions:**
- `setProgress(val)`: Updates the progress bar UI.

## API Integration

### Endpoints Used
- `POST /api/v1/uploads/image`
- `POST /api/v1/uploads/scan`

### Request/Response Handling
- Must use `FormData` API and set correct `multipart/form-data` headers.
- Utilizes axios `onUploadProgress` to track real-time upload progress for the UI.

## Routing

### Routes
- N/A (Embedded as components within the Medication Wizard workflow).

### Navigation
- N/A

## Validation

### Client-Side Validation
- Strict file size limits (e.g., < 5MB).
- Strict file type checks (allowing only `image/jpeg`, `image/png`).

### Validation Library
- Uses Zod or Yup schema validation integrated with React Hook Form.

## Error Handling

### Error States
- Network errors: Managed by global axios interceptors, showing generic toast.
- Validation errors: Mapped to specific form fields.
- Server errors (500): Triggers generic error boundary or alert.

### Error Display
- Inline validation messages below form inputs.
- Toast notifications for API success/failure feedback.

## Loading States

### Loading Indicators
- Skeleton loaders displayed while initial fetching is executing.
- Button disable and spinner icons active during form submissions.
- Overlay spinner for critical destructive operations.

## Accessibility

### A11y Considerations
- Form inputs have associated `<label>` elements or `aria-label` attributes.
- Keyboard navigation (Tab) supported across lists and forms.
- Screen reader announcements for form submission success/failure using `aria-live` regions.
- Modal dialogs trap focus until resolved.

## Styling

### Component Styling
- Leverages shared UI components from `src/shared/components` (e.g., `Button`, `Input`, `Card`).
- Consistent design system application (colors, typography).
- Fully responsive layout; lists transition to stacked cards on mobile devices.

## Testing

### Unit Tests
- Component rendering tests.
- Hook state transitions on success/failure.
- Service tests mocking axios to verify correct endpoint calls and payloads.

### Integration Tests
- End-to-end workflows representing core user journeys.

### Test Coverage
- Minimum 85% statement coverage required for the upload module.
- 100% coverage on complex validation logic.

## Performance Considerations

### Optimization
- React components memoized using `React.memo` to prevent unnecessary re-renders.
- Lazy loading for heavy sub-components to reduce initial bundle size.

## Security Considerations

### Client-Side Security
- No sensitive PHI data passed in URL parameters (use POST/PUT bodies).
- Strict output sanitization to prevent XSS.
- Token validation handled gracefully (unauthorized requests redirect to login).

## Future Enhancements

### Potential Future Work
- Multi-image uploads (e.g., front and back of a box).
- Standardized barcode/QR scanning alongside OCR.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Upload Module](../../../backend/src/modules/upload/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
