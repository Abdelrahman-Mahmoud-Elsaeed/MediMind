# Uploads Module

## Module Overview and Purpose

The Uploads module owns file and media handling for user-submitted assets, especially medication images and other supporting documents. This module is responsible for validating file formats, streaming files to cloud storage, and returning storage metadata. It serves as the secure interface between user uploads and cloud object storage.

## Responsibilities and Scope

The Uploads module is exclusively responsible for:
- Validating uploaded file formats (JPEG, PNG, WebP)
- Validating file size limits (maximum 5MB)
- Verifying file "magic numbers" (binary headers) for MIME-type validation
- Streaming files to cloud object storage (AWS S3)
- Returning storage metadata (URL, format, size)
- Handling medication image uploads for OCR processing
- Orphan file cleanup (unlinked images older than 24 hours)

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- OCR processing (handled by external AI service via Medications module)
- Medication data (handled by Medications module)
- File serving (handled by cloud storage CDN)
- Virus scanning (future enhancement)

## Features Owned by the Module

### 1. Image Upload
- Users can upload medication images
- System validates file format (JPEG, PNG, WebP)
- System validates file size (max 5MB)
- System verifies file magic numbers (prevents extension spoofing)
- System streams file to cloud storage
- System returns file URL and metadata

### 2. File Validation
- MIME-type validation using magic numbers
- File size validation
- File format validation
- Security checks for malicious files

### 3. Orphan Cleanup
- Background job identifies unlinked images
- System removes images older than 24 hours
- System saves storage costs

## Functional Requirements

### FR-U-1: Upload Image
- Users must be able to upload medication images
- System must validate file format (JPEG, PNG, WebP)
- System must validate file size (max 5MB)
- System must verify file magic numbers
- System must stream file to cloud storage
- System must return file URL and metadata

### FR-U-2: File Security Validation
- System must verify file magic numbers match declared MIME type
- System must reject files with spoofed extensions
- System must limit file size to prevent DoS attacks

### FR-U-3: Orphan Cleanup
- System must identify unlinked images
- System must remove images older than 24 hours
- System must run as scheduled background job

## Business Rules and Validation Rules

### File Format Validation
- **Allowed formats:** JPEG, PNG, WebP
- **MIME types:** image/jpeg, image/png, image/webp
- **Magic numbers verification:** System must verify binary header matches declared format

### File Size Validation
- **Maximum size:** 5MB per image
- **Size enforced at:** API layer (before streaming to storage)

### Security Rules (Critical)
- **CRITICAL RULE:** System must independently verify file magic numbers (binary header) to ensure it is actually an image
- **CRITICAL RULE:** System must not trust file extensions alone
- **CRITICAL RULE:** Uploaded files must be stored in a dedicated bucket configured to serve files from a separate domain/subdomain
- **CRITICAL RULE:** This prevents uploaded malicious SVGs/HTML from executing code within the context of the main application domain

### Storage Rules
- **Bucket isolation:** Dedicated bucket for user uploads
- **Domain separation:** Serve from separate domain/subdomain
- **Access control:** Bucket configured for public read access
- **Naming convention:** Unique filenames to prevent collisions

### Orphan Cleanup
- **Definition:** Images uploaded but never linked to a medication
- **Cleanup threshold:** 24 hours after upload
- **Cleanup frequency:** Daily background job
- **Purpose:** Save storage costs

## User Workflows

### Upload Image Workflow
1. User makes POST request to /uploads/image with image file
2. System verifies authentication via access token
3. System validates file size (max 5MB)
4. System reads file magic numbers (binary header)
5. System validates MIME type matches magic numbers
6. System generates unique filename
7. System streams file to cloud storage (AWS S3)
8. System returns file URL, format, and size

### Orphan Cleanup Workflow (Background Job)
1. Background job scans all uploaded files
2. System identifies files not linked to any medication
3. System checks file age (older than 24 hours)
4. System deletes orphaned files from storage
5. System logs cleanup actions

## Public APIs

### POST /api/v1/uploads/image
**Purpose:** Upload medication image

**Authentication:** Required (Bearer token)

**Request:** multipart/form-data with file field

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://uploads.medimind.example.com/abc123.jpg",
    "format": "image/jpeg",
    "size": 1024000
  }
}
```

**Validation Rules:**
- File must be JPEG, PNG, or WebP
- File size must be <= 5MB
- File magic numbers must match declared format

**Response (422 Unprocessable Entity) - Invalid Format:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "File format not supported. Only JPEG, PNG, and WebP are allowed."
  }
}
```

**Response (413 Payload Too Large) - File Too Large:**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum limit of 5MB."
  }
}
```

## Data Models and Database Collections

No dedicated database collections for this module. File metadata is returned directly from cloud storage. Orphan cleanup job queries Medications module to identify linked files.

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides authentication for upload operations

### Provides File URLs To:
- **Medications Module:** Uses image URLs for medication records and OCR processing

### Coordinates With:
- **Cloud Storage (AWS S3):** Stores uploaded files
- **Background Workers:** Perform orphan cleanup

## Dependencies and External Services

### Internal Dependencies
- **multer:** Middleware for handling multipart/form-data uploads
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware

### External Services
- **AWS S3:** Cloud object storage for uploaded files
- **AWS S3 CDN:** Content delivery network for file serving

### Environment Variables Required
- `AWS_S3_BUCKET_NAME`: S3 bucket name for uploads
- `AWS_S3_ACCESS_KEY`: AWS access key
- `AWS_S3_SECRET_KEY`: AWS secret key
- `AWS_S3_REGION`: AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET_URL`: Base URL for uploaded files (separate domain)

## Background Jobs, Queues, and Scheduled Tasks

### Orphan Cleanup Job
- Daily background job scans uploaded files
- Identifies files not linked to any medication record
- Deletes files older than 24 hours
- Saves storage costs
- Logs cleanup actions

## Configuration and Environment Variables

### AWS S3 Configuration
- `AWS_S3_BUCKET_NAME`: S3 bucket name for uploads
- `AWS_S3_ACCESS_KEY`: AWS access key
- `AWS_S3_SECRET_KEY`: AWS secret key
- `AWS_S3_REGION`: AWS region
- `AWS_S3_BUCKET_URL`: Base URL for uploaded files (separate domain)

### Upload Limits
- Maximum file size: 5MB (hardcoded)
- Allowed formats: JPEG, PNG, WebP (hardcoded)
- Orphan cleanup threshold: 24 hours (hardcoded)

## Security and Authorization Requirements

### Access Control
- All upload endpoints require authentication (Bearer token)
- Only authenticated users can upload files

### File Security
- **CRITICAL:** Verify file magic numbers (binary headers) to prevent extension spoofing
- **CRITICAL:** Do not trust file extensions alone
- **CRITICAL:** Store files in dedicated bucket with separate domain
- **CRITICAL:** Prevents malicious SVGs/HTML from executing in main application context

### MIME-Type Validation
- System must independently verify file's "magic numbers"
- System must ensure it is actually an image (image/jpeg, image/png, image/webp)
- System must not just trust .jpg, .png, or .webp extensions

### Size Limits
- Maximum 5MB per image enforced at API layer
- Prevents DoS attacks through large file uploads
- Rate limiting: Max 20 requests per IP per hour

### Bucket Isolation
- Dedicated bucket for user uploads
- Configured to serve files from separate domain/subdomain
- Prevents cross-origin script execution

## Error Handling Expectations

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Invalid or missing access token
- `INVALID_FILE_FORMAT`: File format not supported
- `FILE_TOO_LARGE`: File size exceeds 5MB limit
- `MIME_TYPE_MISMATCH`: Magic numbers do not match declared format
- `UPLOAD_FAILED`: Failed to stream file to storage

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log upload events (accountId, fileUrl, format, size, timestamp)
- Log validation failures (accountId, reason, timestamp)
- Log orphan cleanup events (fileUrl, timestamp)
- **Never log file contents**

### Audit Requirements
- Track who uploaded files
- Record timestamp, User ID, and file metadata
- Maintain immutable logs for compliance
- File uploads must be auditable

## Testing Requirements

### Unit Tests
- File validation logic (magic number verification)
- MIME-type validation logic
- File size validation logic
- Format detection logic

### Integration Tests
- POST /uploads/image - successful upload
- POST /uploads/image - invalid format rejection
- POST /uploads/image - file too large rejection
- POST /uploads/image - MIME type mismatch rejection
- POST /uploads/image - unauthorized access

### Security Tests
- Extension spoofing attempts (e.g., .exe renamed to .jpg)
- Magic number verification
- Large file upload attempts
- Malicious file upload attempts

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Mock AWS S3 for testing

## Performance Considerations

### Upload Performance
- File streaming should be efficient
- Large files should be rejected early (size check before full upload)
- Magic number verification should be fast (read only first few bytes)

### Storage Performance
- AWS S3 provides high availability and low latency
- CDN caching for frequently accessed images
- Response times should be < 1s for upload completion

### Cleanup Performance
- Orphan cleanup should be batched for efficiency
- Should run during low-traffic periods
- Should not impact upload performance

## Future Enhancements and Planned Features

### Potential Future Work
- Virus scanning integration
- Image thumbnail generation
- Image compression and optimization
- Rich media support (videos, documents)
- File versioning
- Retention policies per file type
- Image editing capabilities (crop, rotate)
- EXIF data extraction and removal
- Custom file naming
- Batch upload support

### Out of Scope (Future Phases)
- User file management UI
- File sharing features
- External file integration (Google Drive, Dropbox)
- Advanced image processing

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Upload endpoint details
- [Security Architecture](../../../artifact/security.md) - Media upload security guidelines
- [Architecture Design](../../../artifact/architecture.md) - Cloud storage integration
