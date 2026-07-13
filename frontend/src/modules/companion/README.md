# Companion Module

## Module Overview and Purpose

The Companion module manages caregiver-patient relationship flows from the frontend. This module provides UI components for caregivers to manage their relationships with patients, including inviting patients, accepting/rejecting invitations, and viewing relationship status. It serves as the interface for the delegation model that enables caregivers to access and manage patient medication data.

## Responsibilities and Scope

The Companion module is exclusively responsible for:
- Caregiver invitation flow (invite patients by email)
- Relationship status management (accept/reject invitations)
- Relationship listing (view current relationships)
- Relationship removal (revoke/delete relationships)
- Permission display (show granted permissions)
- Relationship state management (loading, error states)

The module does NOT handle:
- Backend relationship logic (handled by backend Relationships module)
- Permission enforcement (handled by backend middleware)
- Patient data (handled by Profile module)
- Medication data (handled by Medication module)
- Notification delivery (handled by Notifications module)

## Features Owned by the Module

### 1. Invitation Flow
- Caregivers can invite patients by email
- Permission selection for the relationship
- Invitation status tracking
- Success/error feedback

### 2. Relationship Management
- View list of current relationships
- Accept pending invitations
- Reject pending invitations
- Revoke active relationships
- View relationship permissions

### 3. Status Display
- Display relationship status (PENDING, ACCEPTED, REJECTED, REVOKED)
- Display granted permissions
- Display patient information

## Functional Requirements

### FR-C-1: Invite Patient
- Caregivers must be able to invite patients by email
- Caregivers must select permissions for the relationship
- System must validate email format
- System must handle invitation success/error states

### FR-C-2: View Relationships
- Caregivers must be able to view all their relationships
- System must display relationship status
- System must display patient information
- System must display granted permissions

### FR-C-3: Accept Invitation
- Caregivers must be able to accept pending invitations
- System must update relationship status to ACCEPTED

### FR-C-4: Reject Invitation
- Caregivers must be able to reject pending invitations
- System must update relationship status to REJECTED

### FR-C-5: Revoke Relationship
- Caregivers must be able to revoke active relationships
- System must update relationship status to REVOKED

## Business Rules and Validation Rules

### Email Validation
- **Format:** Valid email format
- **Validation:** Client-side validation before submission
- **Error messages:** Clear feedback for invalid email

### Permission Selection
- **Options:** canAddMedication, canViewMedicalRecords
- **Default:** canAddMedication = true, canViewMedicalRecords = false
- **Required:** At least one permission must be granted

### Status Transitions
- **PENDING → ACCEPTED:** Caregiver accepts invitation
- **PENDING → REJECTED:** Caregiver rejects invitation
- **ACCEPTED → REVOKED:** Caregiver revokes relationship
- **REVOKED/REJECTED:** Terminal states

### Access Control
- Only caregivers can access this module
- Caregivers can only manage their own relationships
- Patients cannot access caregiver relationship management

## User Workflows

### Invite Patient Workflow
1. Caregiver navigates to companion/relationships page
2. Caregiver clicks "Invite Patient" button
3. Caregiver enters patient email
4. Caregiver selects permissions for the relationship
5. System validates email format
6. Caregiver submits invitation
7. System sends invitation request to backend
8. On success: system displays success message, adds to pending list
9. On error: system displays error message, caregiver can retry

### View Relationships Workflow
1. Caregiver navigates to companion/relationships page
2. System fetches all relationships from backend
3. System displays list of relationships with status
4. System displays patient information and permissions

### Accept Invitation Workflow
1. Caregiver views pending invitations
2. Caregiver clicks "Accept" on a pending invitation
3. System sends accept request to backend
4. On success: system updates status to ACCEPTED
5. On error: system displays error message

### Reject Invitation Workflow
1. Caregiver views pending invitations
2. Caregiver clicks "Reject" on a pending invitation
3. System sends reject request to backend
4. On success: system updates status to REJECTED
5. On error: system displays error message

### Revoke Relationship Workflow
1. Caregiver views active relationships
2. Caregiver clicks "Revoke" on an active relationship
3. System confirms revocation action
4. System sends revoke request to backend
5. On success: system updates status to REVOKED
6. On error: system displays error message

## Components

### InvitationForm
Form for inviting patients with email and permission selection.

**Props:**
- `onSuccess`: Callback function on successful invitation
- `onError`: Callback function on invitation error

**State:**
- Form data (patientEmail, permissions)
- Validation errors
- Loading state

### RelationshipList
List component displaying all caregiver relationships.

**Props:**
- `relationships`: Array of relationship objects
- `onAccept`: Callback for accepting invitation
- `onReject`: Callback for rejecting invitation
- `onRevoke`: Callback for revoking relationship

**State:**
- Loading state
- Error state

### RelationshipCard
Card component displaying individual relationship details.

**Props:**
- `relationship`: Relationship object
- `onAccept`: Callback for accepting invitation
- `onReject`: Callback for rejecting invitation
- `onRevoke`: Callback for revoking relationship

**Display:**
- Patient information (name, email)
- Relationship status
- Granted permissions
- Action buttons based on status

### PermissionSelector
Component for selecting relationship permissions.

**Props:**
- `permissions`: Current permission state
- `onChange`: Callback for permission changes

**Options:**
- canAddMedication (checkbox)
- canViewMedicalRecords (checkbox)

## Hooks

### useRelationships
Custom hook for relationship data and operations.

**Returns:**
```javascript
{
  relationships: Relationship[],
  isLoading: boolean,
  error: Error | null,
  invitePatient: (email, permissions) => Promise<void>,
  acceptInvitation: (relationshipId) => Promise<void>,
  rejectInvitation: (relationshipId) => Promise<void>,
  revokeRelationship: (relationshipId) => Promise<void>,
  refresh: () => Promise<void>
}
```

**Usage:**
```javascript
const { relationships, isLoading, invitePatient } = useRelationships();
```

## Services

### RelationshipService
Service layer for relationship API calls.

**Methods:**
- `invitePatient(email, permissions)`: POST /api/v1/relationships
- `getRelationships()`: GET /api/v1/relationships
- `acceptInvitation(relationshipId)`: PATCH /api/v1/relationships/:id/status
- `rejectInvitation(relationshipId)`: PATCH /api/v1/relationships/:id/status
- `revokeRelationship(relationshipId)`: DELETE /api/v1/relationships/:id

## State Management

### Relationship Store
Global state for relationship data using Redux/Zustand.

**State:**
```javascript
{
  relationships: Relationship[],
  isLoading: boolean,
  error: Error | null
}
```

**Actions:**
- `setRelationships(relationships)`: Set relationships list
- `addRelationship(relationship)`: Add new relationship
- `updateRelationship(relationshipId, updates)`: Update relationship
- `removeRelationship(relationshipId)`: Remove relationship
- `setError(error)`: Set error state
- `clearError()`: Clear error state

## API Integration

### Endpoints Used
- `POST /api/v1/relationships` - Invite patient
- `GET /api/v1/relationships` - Get relationships
- `PATCH /api/v1/relationships/:id/status` - Update status
- `DELETE /api/v1/relationships/:id` - Revoke relationship

### Request/Response Handling
- Authentication via access token
- Error handling for validation errors
- Optimistic updates for better UX
- Rollback on error

## Routing

### Routes
- `/companion` - Relationships list page
- `/companion/invite` - Invitation page

### Navigation
- Redirect to relationships list after invitation
- Refresh list after status changes

## Validation

### Client-Side Validation
- Email format validation
- Permission selection validation
- Required field validation

### Validation Library
- Uses validation utilities from `shared/validation`
- Form-level validation with clear error messages
- Real-time validation feedback

## Error Handling

### Error States
- Network errors (connection issues)
- Validation errors (invalid email)
- Permission errors (insufficient permissions)
- Server errors (500, etc.)

### Error Display
- User-friendly error messages
- Inline validation errors
- Toast notifications for API errors
- Error boundaries for component errors

## Loading States

### Loading Indicators
- Form submission loading state
- Button disable during submission
- Skeleton loaders for relationship list
- Progress indicators for async operations

## Accessibility

### A11y Considerations
- Form labels and ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management on form errors
- Color contrast compliance

## Styling

### Component Styling
- Uses shared components from `shared/components`
- Consistent design system
- Responsive design for mobile/desktop
- Theme-aware styling

## Testing

### Unit Tests
- Component rendering tests
- Hook behavior tests
- Service function tests
- Validation logic tests

### Integration Tests
- Invitation flow end-to-end
- Relationship listing end-to-end
- Accept/reject flow end-to-end
- Revoke flow end-to-end

### Test Coverage
- Minimum 85% coverage for companion module
- Critical paths (invite, accept, reject, revoke) must have 100% coverage

## Performance Considerations

### Optimization
- Lazy loading of companion components
- Debounced form validation
- Optimized re-renders with memoization
- Efficient state updates
- Pagination for large relationship lists

## Security Considerations

### Client-Side Security
- Access token authentication
- No sensitive data in URL parameters
- HTTPS only for production
- XSS prevention (input sanitization)
- CSRF protection (handled by backend)

## Future Enhancements

### Potential Future Work
- Bulk invitation (multiple patients)
- Relationship history
- Permission editing (update permissions after creation)
- Relationship search/filtering
- Relationship analytics
- Caregiver profile visibility
- Patient request flow (patients request caregivers)

## Related Documentation

- [Frontend Architecture Guide](../../../public/frontend.md) - Overall frontend structure
- [Backend Relationships Module](../../../backend/src/modules/relationships/README.md) - Backend relationships implementation
- [API Specification](../../../artifact/apiSpecificationDesign.md) - Relationships API endpoints
