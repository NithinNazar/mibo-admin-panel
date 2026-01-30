# Staff Creation with Username & Password - Implementation Plan

## Overview

Implementing the ability for admins to create all staff roles (Manager, Centre Manager, Care Coordinator, Front Desk, Clinician) with admin-provided username and password fields.

## Backend Implementation - ✅ COMPLETE

### New API Endpoints Added

1. **POST /api/users/managers** - Create Manager
   - Fields: full_name, phone, email (optional), username, password
   - Role ID: 2 (MANAGER)
   - No centre assignment

2. **POST /api/users/centre-managers** - Create Centre Manager
   - Fields: full_name, phone, email (optional), username, password, centreId
   - Role ID: 3 (CENTRE_MANAGER)
   - Centre assignment required

3. **POST /api/users/care-coordinators** - Create Care Coordinator
   - Fields: full_name, phone, email (optional), username, password, centreId
   - Role ID: 5 (CARE_COORDINATOR)
   - Centre assignment required

4. **POST /api/users/front-desk** - Create Front Desk
   - Fields: full_name, phone, email (optional), username, password, centreId
   - Role ID: 6 (FRONT_DESK)
   - Centre assignment required

5. **POST /api/clinicians** - Create Clinician (Updated)
   - Added username and password fields to existing clinician creation
   - Role ID: 2 (CLINICIAN - assuming based on typical setup)
   - All existing clinician fields remain

### Backend Files Modified

- `backend/src/services/staff.service.ts` - Added creation methods for all roles
- `backend/src/controllers/staff.controller.ts` - Added controller methods
- `backend/src/routes/staff.routes.ts` - Added route definitions
- `backend/src/validations/staff.validation.ts` - Added qualification, expertise, languages fields

### Validation Rules

- **Username**: 3-50 alphanumeric characters, must be unique
- **Password**: Minimum 8 characters
- **Phone**: 10 digits, Indian format (6-9 start)
- **Email**: Optional, valid email format
- **Centre**: Required for Centre Manager, Care Coordinator, Front Desk

## Frontend Implementation - TODO

### Pages to Update

1. **ManagersPage.tsx**
   - Add "Create Manager" button
   - Add creation modal with fields: name, phone, email, username, password
   - Add view details functionality to show username/password
   - Toggle active/inactive already implemented ✅

2. **CentreManagersPage.tsx**
   - Add "Create Centre Manager" button
   - Add creation modal with fields: name, phone, email, centre, username, password
   - Add view details functionality
   - Toggle active/inactive already implemented ✅

3. **CareCoordinatorsPage.tsx**
   - Add "Create Care Coordinator" button
   - Add creation modal with fields: name, phone, email, centre, username, password
   - Add view details functionality
   - Toggle active/inactive already implemented ✅

4. **FrontDeskPage.tsx**
   - Update creation modal to use admin-provided username/password instead of auto-generated
   - Add view details functionality
   - Toggle active/inactive already implemented ✅

5. **CliniciansPage.tsx**
   - Add username and password fields to creation form
   - Add view details functionality to show username/password
   - Toggle active/inactive already implemented ✅

### UI Components Needed

1. **Creation Modal** (for each role)
   - Form fields for user information
   - Username and password inputs
   - Centre dropdown (where applicable)
   - Submit button

2. **View Details Modal**
   - Display all user information
   - Show username (read-only)
   - Show password with show/hide toggle
   - Copy to clipboard buttons

### Frontend Service Updates

Update `staffService.ts` to add methods:

- `createManager(data)`
- `createCentreManager(data)`
- `createCareCoordinator(data)`
- `createFrontDeskStaff(data)` - update to use new endpoint
- `createClinician(data)` - already exists, ensure username/password included

## Database Schema

No changes needed - uses existing tables:

- `users` table - stores username, password_hash
- `staff_profiles` table - stores designation
- `user_roles` table - stores role assignments
- `centre_staff_assignments` table - stores centre assignments
- `clinician_profiles` table - stores clinician-specific data

## Security Considerations

- Passwords are hashed using bcrypt before storage
- Username uniqueness enforced at service layer
- Phone number uniqueness enforced
- Role-based access: Only ADMIN can create staff (except Front Desk which MANAGER can also create)

## Testing Checklist

- [ ] Create Manager with valid data
- [ ] Create Centre Manager with centre assignment
- [ ] Create Care Coordinator with centre assignment
- [ ] Create Front Desk with centre assignment
- [ ] Create Clinician with all fields including username/password
- [ ] Verify username uniqueness validation
- [ ] Verify password minimum length validation
- [ ] Verify phone number format validation
- [ ] Test toggle active/inactive for all roles
- [ ] Test view details shows username and password
- [ ] Test copy to clipboard functionality

## Next Steps

1. Update frontend staffService.ts with new API methods
2. Update each staff page with creation modals
3. Add view details functionality to all pages
4. Test all creation flows
5. Test toggle active/inactive
6. Deploy backend changes
7. Deploy frontend changes

---

**Status**: Backend Complete ✅ | Frontend In Progress 🔄
**Date**: January 30, 2026
