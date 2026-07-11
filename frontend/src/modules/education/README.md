# Education Module

## Module Overview and Purpose

The Education module handles delivering tailored educational material, safety notifications, and health blogs to users. This material is dynamically filtered using the patient's active medical conditions to support personalized learning and precise health guidance.

## Responsibilities and Scope

The Education module is responsible for:
- Retrieving and indexing educational items (articles, tips, files).
- Filtering available materials by comparing metadata with active patient conditions.
- Storing user bookmarks/favorites.
- Re-fetching the feed cache when conditions update.

The module does NOT handle:
- Editing or modifying conditions (delegated to the Condition module).
- Clinical diagnoses or professional prescriptions.

## Features Owned by the Module

### 1. Condition-Filtered Feed
- Standard feed page displaying cards for targeted health blogs.
- Quick search bar and category filters.

### 2. Bookmarked Content
- Displaying saved articles for offline or quick reading.

## Functional Requirements

### FR-E-1: Targeted Feeds
- The system must display a list of education tips based on patient conditions.

### FR-E-2: Favorites
- Users must be able to flag specific articles as favorites.

## Business Rules and Validation Rules

### Article Interaction (Zod Schema validation)
- **Bookmark Status:** Required, boolean toggle.
- **Feedback Rating:** Optional, scale from 1 to 5 if provided.

---

## User Workflows

### View Filtered Article Workflow
```mermaid
sequenceFlow
  participant User
  participant EducationFeed
  participant EducationActions (fetchArticlesThunk)
  participant EducationService
  participant ReduxStore

  User->>EducationFeed: Open Education page
  EducationFeed->>EducationActions (fetchArticlesThunk): Dispatch fetchArticles()
  EducationActions (fetchArticlesThunk)->>EducationService: Call getArticles(conditions)
  EducationService->>EducationService: Send GET request via apiClient with active condition query parameters
  EducationService-->>EducationActions (fetchArticlesThunk): Return articles array
  EducationActions (fetchArticlesThunk)-->>ReduxStore: Update state (feed list)
  EducationFeed->>EducationFeed: Render condition-specific lists
```

---

## Components

### EducationFeedComponent
Displays list of articles.
- **State:**
  - `activeCategory` (string).
- **Behavior:** Renders cards for each matching article.

### BookmarkedListComponent
Displays bookmarked items.
- **State:** None.

---

## Hooks

### useEducation
Custom hook wrapping education selectors:
- **Exposes:**
  - `articles`: Filtered list of articles.
  - `bookmarks`: List of bookmarked articles.
  - `loading`: Async status tracker.
  - Action triggers: `fetchArticles()`, `bookmarkArticle()`.

---

## Services

### educationService
Integrates API requests:
- **Methods:**
  - `getArticles(conditions)`: Sends `GET /education?conditions=${conditions}`.
  - `bookmark(id, status)`: Sends `POST /education/${id}/bookmark`.

---

## State Management

### Redux State Slice (`educationSlice`)
- **Initial State:**
  ```javascript
  {
    articles: [],
    bookmarks: [],
    loading: false,
    error: null,
  }
  ```
- **Sync Reducers:**
  - `clearErrors`: Resets API errors.

---

## API Integration

Network requests use the shared Axios `apiClient` defined in `@/shared/lib`.

---

## Routing

Next.js App Router paths:
- `/dashboard/education`: Main feed list.
- `/dashboard/education/saved`: Renders bookmarked view.

---

## Validation

- Interaction triggers use Zod schemas in `validation/educationValidation.js`.
- Errors or rating values conform to schema specifications before API dispatch.
- Save actions disable if parameters are invalid.
