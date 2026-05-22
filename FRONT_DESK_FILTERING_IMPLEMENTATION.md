# Front Desk Staff Centre Filtering - Implementation Summary

## Overview

Implemented centre-based filtering for front desk staff in the admin panel, ensuring they can only view and manage appointments, clinicians, and bookings for their assigned centre.

## Problem Statement

Front desk staff users were seeing appointments, clinicians, and centres from ALL locations instead of only their assigned centre. This was a security and usability issue.

## Root Cause

The front desk user in the database had **no centre assigned** in the `user_roles` table (`centre_id` was NULL). The backend logic correctly returns `assignedCentreId` only when a centre is assigned, so without the database assignment, the frontend filtering couldn't work.

## Solution

### 1. Database Fix

**Table**: `user_roles`  
**Action**: Set `centre_id` for front desk staff users

```sql
UPDATE user_roles
SET centre_id = 2, updated_at = NOW()
WHERE user_id = 110 AND role_id = (SELECT id FROM roles WHERE name = 'FRONT_DESK');
```

### 2. Frontend Implementation

#### Files Modified:

1. `src/modules/appointments/pages/AllAppointmentsPage.tsx`
2. `src/modules/appointments/pages/BookAppointmentPage.tsx`
3. `src/contexts/AuthContext.tsx` (debug logs only, removed later)

#### Key Changes:

**AllAppointmentsPage.tsx**:

- Detects if user is FRONT_DESK role
- Filters appointments to show only those from assigned centre
- Filters centres dropdown to show only assigned centre (disabled)
- Filters clinicians dropdown to show only clinicians from assigned centre
- Uses explicit type conversion (`String()`) to ensure ID comparisons work correctly

**BookAppointmentPage.tsx**:

- Auto-selects assigned centre for front desk staff
- Shows only assigned centre (read-only with indicator)
- Fetches only clinicians from assigned centre via API params
- Prevents booking at other centres

## Implementation Details

### Type Safety

All ID comparisons use explicit `String()` conversion to handle potential type mismatches between database (integers) and frontend (strings):

```typescript
const centreIdStr = String(assignedCentreId);
const filteredAppointments = appointmentsData.filter(
  (apt) => String(apt.centre_id) === centreIdStr,
);
```

### Backend Logic

The backend (`src/services/auth.services.ts`) automatically sets `assignedCentreId` for FRONT_DESK users:

```typescript
const centreIds = (user.centreIds || []).map((id: number) => id.toString());
const assignedCentreId =
  roleName === "FRONT_DESK" && centreIds.length > 0 ? centreIds[0] : undefined;
```

### Database Schema

Centres are assigned to users via the `user_roles` table:

- `user_roles.user_id` - Links to users table
- `user_roles.role_id` - Links to roles table
- `user_roles.centre_id` - Links to centres table (can be NULL for non-centre-specific roles)

## Features Implemented

### Appointments Page

✅ Only shows appointments from assigned centre  
✅ Centre filter is disabled and shows only assigned centre  
✅ Clinician filter shows only clinicians from assigned centre  
✅ Page title changes to "Centre Appointments" for front desk staff  
✅ All filtering, sorting, and export features work correctly

### Book Appointment Page

✅ Auto-selects assigned centre (read-only)  
✅ Shows visual indicator "Your assigned centre (automatically selected)"  
✅ Only shows clinicians from assigned centre  
✅ Prevents booking at other centres  
✅ All booking steps work correctly

### Security

✅ Client-side filtering prevents viewing other centres' data  
✅ API calls still fetch all data (server-side filtering recommended for future)  
✅ No way for front desk staff to bypass the filtering via UI

## Testing

### Test User

- **Username**: `front999`
- **Role**: FRONT_DESK
- **Assigned Centre**: Mibo Kochi (ID: 2)

### Test Scenarios

1. ✅ Login as front desk staff
2. ✅ Navigate to Appointments page - only Kochi appointments shown
3. ✅ Centre filter disabled and shows "Mibo Kochi"
4. ✅ Clinician filter shows only Kochi clinicians
5. ✅ Navigate to Book Appointment - Kochi centre auto-selected
6. ✅ Only Kochi clinicians available for booking
7. ✅ Cannot select other centres
8. ✅ All filters, search, and export features work

## Files Changed

### Frontend (Admin Panel)

- `src/modules/appointments/pages/AllAppointmentsPage.tsx` - Added filtering logic
- `src/modules/appointments/pages/BookAppointmentPage.tsx` - Added auto-selection and filtering

### Backend (No Changes Required)

- Backend logic was already correct
- Only database data needed to be fixed

### Database

- `user_roles` table - Set `centre_id` for front desk users

## Utility Scripts Created

1. **check-and-fix-frontdesk.js** - Script to assign centres to front desk users
2. **verify-frontdesk-user.sql** - SQL queries to verify user setup
3. **fix-frontdesk-centre-assignment.sql** - Manual SQL fix script

## Future Improvements

### Server-Side Filtering

Currently, filtering is done client-side. For better security and performance:

- Add `centreId` parameter to `/api/appointments` endpoint
- Add `centreId` parameter to `/api/users/clinicians` endpoint
- Backend should automatically filter based on user's role and assigned centre

### Multiple Centre Support

If front desk staff need to manage multiple centres:

- Allow multiple centre assignments in `user_roles`
- Add centre switcher in UI
- Update filtering logic to support selected centre from list

### Role-Based API Endpoints

Create dedicated endpoints that automatically filter based on user role:

- `/api/appointments/my-centre` - Returns only assigned centre's appointments
- `/api/clinicians/my-centre` - Returns only assigned centre's clinicians

### Audit Logging

Log when front desk staff:

- View appointments
- Book appointments
- Cancel appointments
- This helps track which staff member performed which action

## Maintenance Notes

### Adding New Front Desk Staff

When creating a new front desk staff user:

1. Create user in `users` table
2. Assign FRONT_DESK role in `user_roles` table
3. **IMPORTANT**: Set `centre_id` in `user_roles` table
4. Verify assignment using the verification script

Example:

```sql
-- After creating user and assigning role
UPDATE user_roles
SET centre_id = <centre_id>
WHERE user_id = <user_id> AND role_id = (SELECT id FROM roles WHERE name = 'FRONT_DESK');
```

### Troubleshooting

**Issue**: Front desk staff sees all centres  
**Solution**: Check if `centre_id` is set in `user_roles` table

**Issue**: assignedCentreId is undefined  
**Solution**: User has no centre assigned in database

**Issue**: Filtering not working after login  
**Solution**: Clear browser cache and localStorage, login again

## Code Quality

- ✅ Type-safe ID comparisons
- ✅ Explicit type conversions
- ✅ Clean, maintainable code
- ✅ No breaking changes to existing functionality
- ✅ Works for all user roles (ADMIN, MANAGER, FRONT_DESK)
- ✅ Debug logs removed for production

## Deployment Checklist

- [x] Database updated with centre assignments
- [x] Frontend code updated and tested
- [x] Debug logs removed
- [x] All features tested and working
- [x] No breaking changes
- [x] Documentation updated

## Support

For issues or questions:

1. Check browser console for errors
2. Verify user has `assignedCentreId` in localStorage
3. Check database `user_roles` table for `centre_id`
4. Run verification script: `node check-and-fix-frontdesk.js`
