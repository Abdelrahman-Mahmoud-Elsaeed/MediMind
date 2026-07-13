# Education Module

## Module Overview and Purpose

The Education module provides personalized health content, blogs, and advice to patients. As defined in the BRD, it filters and displays articles based on the patient's logged medical conditions, offering localized and highly relevant health tips. This module aims to improve long-term health outcomes through education.

## Responsibilities and Scope

The Education module is exclusively responsible for:
- Fetching and displaying educational articles and blog feeds.
- Rendering markdown-based long-form content securely.
- Presenting quick 'Dos and Don'ts' visual components.
- Handling bilingual content display based on user settings.

The module does NOT handle:
- Medical condition management (Condition module).
- Direct prescriptive medical advice (legal disclaimer required).

## Features Owned by the Module

### 1. Targeted Content Feed
- Display an infinite-scroll feed of articles matching the user's logged medical conditions.
- Read full blog posts and advice items dynamically.

### 2. Content Interaction
- Save/bookmark articles for later reading.
- Mark articles as read to track educational progress.

## Functional Requirements

### Targeted Feeds (BRD 4.1)
- The system must fetch content where the target disease metadata matches the patient's current active conditions.

### Markdown Rendering
- Content must be rendered cleanly with proper typography, supporting images and lists securely.

## Business Rules and Validation Rules

### Relevance and Fallbacks
- Articles are filtered dynamically based on the patient's profile conditions.
- If a user has no logged conditions, a generic feed of general wellness and adherence tips is shown.
- All content must respect the application's RTL/LTR layout settings.

## User Workflows

### Read Article Workflow
1. User navigates to the Education tab.
2. System fetches the feed relevant to their conditions.
3. User sees a list of article summary cards.
4. User clicks an article card.
5. System routes to the article detail page and fetches full markdown content.
6. Markdown is rendered securely; user reads the article.

## Components

### ContentFeed
List of article summaries with infinite scroll or pagination.
**Props:**
- `articles` (ArticleSummary[]): Array of summary objects.
- `onLoadMore` (function): Triggered on scroll.

### ArticleView
Renders full markdown content.
**Props:**
- `article` (Article): Full article object including raw markdown.

### DosAndDonts
Visual component displaying rapid-fire advice for a specific condition.
**Props:**
- `items` (AdviceItem[]): Array of quick tips.

## Hooks

### useEducation
Custom hook for fetching educational content and managing read states.

**Returns:**
```javascript
{
  feed: ArticleSummary[],
  currentArticle: Article | null,
  isLoading: boolean,
  fetchFeed: (page: number) => Promise<void>,
  fetchArticle: (id: string) => Promise<void>,
  bookmarkArticle: (id: string) => Promise<void>
}
```

**Usage:**
```javascript
const { feed, fetchFeed, isLoading } = useEducation();

useEffect(() => {
  fetchFeed(1);
}, []);
```

## Services

### EducationService
Service layer for content API calls interacting with the CMS backend.

**Methods:**
- `getFeed(params)`: GET `/api/v1/content/feed` - Fetches personalized feed.
- `getArticle(id)`: GET `/api/v1/content/articles/:id` - Fetches a specific full article.

## State Management

### Education Store
Global state for education content, utilizing aggressive caching.

**State:**
```javascript
{
  feed: ArticleSummary[],
  articlesCache: Record<string, Article>,
  bookmarks: string[]
}
```

**Actions:**
- `appendFeed(items)`: Adds items to feed array.
- `cacheArticle(id, article)`: Stores full article to prevent re-fetching.
- `toggleBookmark(id)`: Updates bookmark state.

## API Integration

### Endpoints Used
- `GET /api/v1/content/feed`
- `GET /api/v1/content/articles/:id`
- `POST /api/v1/content/articles/:id/bookmark`

### Request/Response Handling
- Extensive local caching of markdown content to reduce network load.
- Lazy loading of images within articles to improve render times.

## Routing

### Routes
- `/education` - Main feed view.
- `/education/:id` - Single article detail view.

### Navigation
- Browser 'Back' button must preserve feed scroll position utilizing session storage or cached state.

## Validation

### Client-Side Validation
- **CRITICAL:** Strict sanitization of markdown rendering to prevent Cross-Site Scripting (XSS) attacks.

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
- Minimum 85% statement coverage required for the education module.
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
- Embedded video content support.
- Interactive quizzes based on articles to reinforce learning.

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md)
- [Backend Education Module](../../../backend/src/modules/education/README.md)
- [API Specification](../../../artifact/apiSpecificationDesign.md)
- [Business Requirements Document (BRD)](../../../artifact/BRD.md)
