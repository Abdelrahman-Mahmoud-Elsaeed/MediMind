# Content Module

## Module Overview and Purpose

The Content module owns educational content for patients, including advice and blog-like articles that support medication adherence and wellness guidance. This module is responsible for storing, retrieving, and targeting disease-specific educational content. Content is matched to patients based on their medical conditions to provide personalized health education.

## Responsibilities and Scope

The Content module is exclusively responsible for:
- Storing disease advice (dos and don'ts for specific conditions)
- Storing disease blog articles (long-form educational content)
- Retrieving advice by disease category
- Retrieving blog feeds by disease category
- Retrieving individual blog articles
- Targeting content based on patient medical conditions
- Content management for ADMIN users

The module does NOT handle:
- Authentication credentials (handled by Auth module)
- Medical conditions (handled by Conditions module)
- Patient data (handled by Profiles module)
- Content creation workflow (handled by ADMIN users via this module)
- Content editorial workflows (future enhancement)

## Features Owned by the Module

### 1. Disease Advice Management
- ADMIN users can create disease advice entries
- ADMIN users can update disease advice entries
- ADMIN users can delete disease advice entries
- System stores dos and don'ts for specific diseases
- System targets advice to patients with matching conditions

### 2. Disease Blog Management
- ADMIN users can create disease blog articles
- ADMIN users can update disease blog articles
- ADMIN users can delete disease blog articles
- System stores long-form educational content
- System targets blogs to patients with matching conditions

### 3. Content Retrieval
- Patients can retrieve advice for their conditions
- Patients can retrieve blog feeds for their conditions
- Patients can retrieve individual blog articles
- System matches content to patient's medical conditions
- System returns personalized content recommendations

## Functional Requirements

### FR-C-1: Get Recommended Advice
- Patients must be able to retrieve advice for their medical conditions
- System must match advice targetDisease to patient's condition diseaseName
- System must return dos and don'ts for matching conditions
- System must return empty array if no matching advice exists

### FR-C-2: Get Recommended Blog Feed
- Patients must be able to retrieve blog articles for their medical conditions
- System must match blog targetDisease to patient's condition diseaseName
- System must return blog summaries for matching conditions
- System must return empty array if no matching blogs exist

### FR-C-3: Get Single Blog Article
- Patients must be able to retrieve individual blog articles
- System must return full blog content including title, body, and metadata

### FR-C-4: Create Disease Advice (ADMIN)
- ADMIN users must be able to create disease advice entries
- Advice must include targetDisease, dos, and don'ts
- System must validate targetDisease format
- System must return created advice record

### FR-C-5: Create Disease Blog (ADMIN)
- ADMIN users must be able to create disease blog articles
- Blog must include targetDisease, title, and body
- System must validate targetDisease format
- System must return created blog record

## Business Rules and Validation Rules

### Disease Advice Validation
- **targetDisease:** Required string, must match diseaseName in Conditions module
- **dos:** Required array of strings, each string is a "do" recommendation
- **donts:** Required array of strings, each string is a "don't" recommendation

### Disease Blog Validation
- **targetDisease:** Required string, must match diseaseName in Conditions module
- **title:** Required string, min 1 character
- **body:** Required string, markdown format
- **author:** String, optional
- **publishedAt:** Date, default current date

### Content Targeting
- Content is targeted by matching targetDisease field to patient's condition diseaseName
- Content matching is case-sensitive
- Patients receive content for all their matching conditions
- If a patient has multiple conditions, they receive content for each condition

### Access Control
- Content retrieval endpoints are public (no authentication required for read operations)
- Content creation/update/delete endpoints require ADMIN role
- Only ADMIN users can manage content
- Content targeting is based on patient's medical conditions

### Content Uniqueness
- Multiple advice entries can exist for the same disease
- Multiple blog articles can exist for the same disease
- Content is not unique by disease (allows multiple articles per disease)

## User Workflows

### Get Recommended Advice Workflow
1. User makes GET request to /content/advice with patientId query parameter
2. System finds Patient record by patientId
3. System finds all MedicalConditions for patient
4. System extracts diseaseName from each condition
5. System finds all DiseaseAdvice where targetDisease matches condition diseaseName
6. System returns array of advice entries

### Get Recommended Blog Feed Workflow
1. User makes GET request to /content/blogs with patientId query parameter
2. System finds Patient record by patientId
3. System finds all MedicalConditions for patient
4. System extracts diseaseName from each condition
5. System finds all DiseaseBlogs where targetDisease matches condition diseaseName
6. System returns array of blog summaries (title, publishedAt, targetDisease)

### Get Single Blog Article Workflow
1. User makes GET request to /content/blogs/:blogId
2. System finds DiseaseBlog by blogId
3. System returns full blog content

### Create Disease Advice Workflow (ADMIN)
1. ADMIN user makes POST request to /content/advice with advice data
2. System verifies authentication via access token
3. System validates user has ADMIN role
4. System validates advice payload against schema rules
5. System creates DiseaseAdvice record
6. System returns created advice record

### Create Disease Blog Workflow (ADMIN)
1. ADMIN user makes POST request to /content/blogs with blog data
2. System verifies authentication via access token
3. System validates user has ADMIN role
4. System validates blog payload against schema rules
5. System creates DiseaseBlog record
6. System returns created blog record

## Public APIs

### GET /api/v1/content/advice
**Purpose:** Get recommended advice for a patient's conditions

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `patientId`: Patient ID (required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "adviceId": "64a1h...",
      "targetDisease": "Type 2 Diabetes",
      "dos": [
        "Monitor blood sugar regularly",
        "Take medication as prescribed"
      ],
      "donts": [
        "Skip doses without consulting doctor",
        "Ignore high blood sugar readings"
      ]
    }
  ]
}
```

### GET /api/v1/content/blogs
**Purpose:** Get recommended blog feed for a patient's conditions

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `patientId`: Patient ID (required)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "blogId": "64a1i...",
      "targetDisease": "Type 2 Diabetes",
      "title": "Managing Diabetes During the Holidays",
      "publishedAt": "2024-06-15T00:00:00Z"
    }
  ]
}
```

### GET /api/v1/content/blogs/:blogId
**Purpose:** Get a single blog article

**Authentication:** Not required (public endpoint)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "blogId": "64a1i...",
    "targetDisease": "Type 2 Diabetes",
    "title": "Managing Diabetes During the Holidays",
    "body": "# Managing Diabetes During the Holidays\n\nThe holiday season can be challenging...",
    "author": "Dr. Sarah Johnson",
    "publishedAt": "2024-06-15T00:00:00Z"
  }
}
```

### POST /api/v1/content/advice (ADMIN)
**Purpose:** Create disease advice

**Authentication:** Required (Bearer token, ADMIN role)

**Request Body:**
```json
{
  "targetDisease": "Type 2 Diabetes",
  "dos": [
    "Monitor blood sugar regularly",
    "Take medication as prescribed"
  ],
  "donts": [
    "Skip doses without consulting doctor",
    "Ignore high blood sugar readings"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "adviceId": "64a1h...",
    "targetDisease": "Type 2 Diabetes",
    "dos": ["Monitor blood sugar regularly", "Take medication as prescribed"],
    "donts": ["Skip doses without consulting doctor", "Ignore high blood sugar readings"]
  }
}
```

### POST /api/v1/content/blogs (ADMIN)
**Purpose:** Create disease blog

**Authentication:** Required (Bearer token, ADMIN role)

**Request Body:**
```json
{
  "targetDisease": "Type 2 Diabetes",
  "title": "Managing Diabetes During the Holidays",
  "body": "# Managing Diabetes During the Holidays\n\nThe holiday season can be challenging...",
  "author": "Dr. Sarah Johnson"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "blogId": "64a1i...",
    "targetDisease": "Type 2 Diabetes",
    "title": "Managing Diabetes During the Holidays",
    "body": "# Managing Diabetes During the Holidays\n\nThe holiday season can be challenging...",
    "author": "Dr. Sarah Johnson",
    "publishedAt": "2024-06-15T00:00:00Z"
  }
}
```

## Data Models and Database Collections

### Disease Advice Collection (`disease_advice`)
Stores dos and don'ts for specific diseases. Managed by ADMIN users.

**Schema:**
```javascript
{
  targetDisease: String (required, indexed),
  dos: [String] (required),
  donts: [String] (required)
}
```

**Indexes:**
- Index on targetDisease for efficient disease-based queries
- Default index on _id

### Disease Blogs Collection (`disease_blogs`)
Stores long-form educational articles. Managed by ADMIN users.

**Schema:**
```javascript
{
  targetDisease: String (required, indexed),
  title: String (required),
  body: String (required),
  author: String (optional),
  publishedAt: Date (default: Date.now)
}
```

**Indexes:**
- Index on targetDisease for efficient disease-based queries
- Index on publishedAt for chronological ordering
- Default index on _id

## Relationships with Other Modules

### Depends On:
- **Auth Module:** Provides role verification for ADMIN operations
- **Profiles Module:** Provides Patient model for condition lookup
- **Conditions Module:** Provides MedicalCondition data for content targeting

### Provides Content To:
- **Frontend:** Displays educational content to patients
- **Medications Module:** May use content for medication-related education

## Dependencies and External Services

### Internal Dependencies
- **mongoose:** Database ORM and schema management
- **zod:** Request validation schemas
- **Auth Module:** Authentication middleware and role verification
- **Profiles Module:** Patient model for validation
- **Conditions Module:** MedicalCondition model for content targeting

### External Services
- **MongoDB Atlas:** Primary data store for content records

### Environment Variables Required
None specific to this module. Uses shared database configuration.

## Background Jobs, Queues, and Scheduled Tasks

None. The Content module operates synchronously and does not require background processing.

## Configuration and Environment Variables

No module-specific configuration required. Uses shared database and authentication configuration.

## Security and Authorization Requirements

### Access Control
- Content retrieval endpoints are public (no authentication required)
- Content creation/update/delete endpoints require ADMIN role
- Only ADMIN users can manage content
- Content targeting is based on patient's medical conditions (no access control needed for retrieval)

### Data Protection
- Content is educational and not PHI
- Content is publicly accessible for patient education
- ADMIN operations are audited

### Input Validation
- All input validated against Zod schemas
- targetDisease validated as non-empty string
- dos and donts validated as arrays of strings
- Blog body validated as non-empty string

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
- `UNAUTHORIZED`: Invalid or missing access token (for ADMIN operations)
- `FORBIDDEN`: User does not have ADMIN role
- `PATIENT_NOT_FOUND`: Patient does not exist
- `BLOG_NOT_FOUND`: Blog does not exist

## Logging and Audit Requirements

### Structured Logging
- Use structured logging (JSON format) for all operations
- Log content creation events (adminId, targetDisease, timestamp)
- Log content update events (contentId, updated fields, adminId, timestamp)
- Log content deletion events (contentId, adminId, timestamp)
- Log content retrieval events (patientId, targetDisease, timestamp)

### Audit Requirements
- Track who created, updated, or deleted content
- Record timestamp, Admin ID, and action taken
- Maintain immutable logs for compliance
- Content changes must be auditable

## Testing Requirements

### Unit Tests
- Content validation schema rules
- Content targeting logic (targetDisease matching)
- Access control logic (ADMIN role verification)

### Integration Tests
- GET /content/advice - successful retrieval
- GET /content/blogs - successful retrieval
- GET /content/blogs/:id - successful article retrieval
- POST /content/advice - successful creation by ADMIN
- POST /content/blogs - successful creation by ADMIN
- POST /content/advice - forbidden (non-ADMIN user)
- POST /content/blogs - forbidden (non-ADMIN user)

### Security Tests
- Non-ADMIN user attempting to create content
- Invalid content data attempts

### Test Coverage
- Minimum 85% global coverage
- Minimum 95% coverage in services/ directory
- Use in-memory database for isolation

## Performance Considerations

### Database Indexing
- Index on targetDisease for efficient disease-based queries
- Index on publishedAt for chronological blog ordering

### Query Optimization
- Content queries are simple by targetDisease lookups
- Content targeting requires joining with Conditions module
- Response times should be < 100ms for content retrieval

## Future Enhancements and Planned Features

### Potential Future Work
- Editorial workflow (draft, review, publish states)
- Content versioning and history
- Localization and multi-language support
- Content personalization based on adherence patterns
- Rich media content (images, videos)
- Content search and filtering
- Content ratings and feedback
- Content scheduling (publish at future date)
- Content categories and tags
- Content analytics (views, engagement)

### Out of Scope (Future Phases)
- User-generated content
- Social sharing features
- Content commenting system
- External content syndication

## Related Documentation

- [API Specification](../../../artifact/apiSpecificationDesign.md) - Content endpoint details
- [Database Schema](../../../artifact/db.md) - Disease advice and blog schema definitions
- [Architecture Design](../../../artifact/architecture.md) - Modular monolith architecture
