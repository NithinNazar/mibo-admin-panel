# Front Desk Staff Centre Filtering - Investigation & Fix

## Issue Summary

Front desk staff assigned to a specific centre (e.g., Kochi) were seeing appointments and clinicians from ALL centres instead of only their assigned centre.

## Root Cause Analysis

The filtering logic was already implemented correctly in the frontend code, but there was a potential **data type mismatch** issue:

1. **Backend** returns `assignedCentreId` as a string (converted from number)
2. **Database** stores centre IDs as integers
3. **Frontend** was comparing IDs without explicit type conversion
4. JavaScript's strict equality (`===`) would fail if one value was a string and the other was a number

## Changes Made

### 1. AllAppointmentsPage.tsx

**File**: `src/modules/appointments/pages/AllAppointmentsPage.tsx`

**Changes**:

- Added explicit type conversion using `String()` for all ID comparisons
- Enhanced console logging to show data types and filtered results
- Added detailed debugging information to track filtering process

**Key improvements**:

```typescript
// Before
const filteredAppointments = appointmentsData.filter(
  (apt) => apt.centre_id === assignedCentreId,
);

// After
const centreIdStr = String(assignedCentreId);
const filteredAppointments = appointmentsData.filter((apt) => {
  const match = String(apt.centre_id) === centreIdStr;
  return match;
});
```

### 2. BookAppointmentPage.tsx

**File**: `src/modules/appointments/pages/BookAppointmentPage.tsx`

**Changes**:

- Added explicit type conversion for centre ID comparison
- Enhanced logging to show data types
- Ensured auto-selected centre uses string type

## Testing Instructions

### Prerequisites

1. Backend server must be running on port 5000
2. Database must have:
   - At least one front desk staff user assigned to a specific centre
   - Appointments from multiple centres
   - Clinicians from multiple centres

### Test Steps

#### 1. Login as Front Desk Staff

- Use credentials for a front desk staff user assigned to Kochi centre
- Check browser console for login logs showing `assignedCentreId`

#### 2. Test Appointments Page

Navigate to "Appointments" page and verify:

**Expected Behavior**:

- ✅ Only appointments from Kochi centre are shown
- ✅ Centre filter dropdown is disabled and shows only "Kochi"
- ✅ Clinician filter dropdown shows only clinicians from Kochi centre
- ✅ No appointments from Bangalore or Mumbai centres are visible

**Console Logs to Check**:

```
[AllAppointmentsPage] Component initialized with user: { role: "FRONT_DESK", assignedCentreId: "1" }
[AllAppointmentsPage] Filtering for front desk staff, assigned centre: 1
[AllAppointmentsPage] Filtered appointments: X out of Y
[AllAppointmentsPage] Filtered centres: 1 ["Kochi"]
[AllAppointmentsPage] Filtered clinicians: X out of Y
```

#### 3. Test Book Appointment Page

Navigate to "Book Appointment" page and verify:

**Expected Behavior**:

- ✅ Centre selection shows only Kochi centre (auto-selected and read-only)
- ✅ Clinician selection shows only clinicians from Kochi centre
- ✅ Cannot select clinicians from other centres

**Console Logs to Check**:

```
[BookAppointmentPage] Component initialized with user: { role: "FRONT_DESK", assignedCentreId: "1" }
[BookAppointmentPage] Filtered centres: 1 ["Kochi"]
[BookAppointmentPage] Auto-selected centre: 1
```

#### 4. Test Different Centres

Repeat tests with front desk staff assigned to:

- Bangalore centre
- Mumbai centre

### Debugging

If filtering still doesn't work, check console logs for:

1. **User Data**:

   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem("user"));
   ```

   - Verify `assignedCentreId` exists and has correct value
   - Verify `role` is "FRONT_DESK"

2. **Data Type Mismatches**:
   - Look for logs showing `centre_id_type` and `assignedCentreIdType`
   - If types don't match, the explicit `String()` conversion should fix it

3. **Backend Response**:
   - Check Network tab in DevTools
   - Verify `/auth/login/*` response includes `assignedCentreId`
   - Verify `/appointments` returns appointments with `centre_id` field

## Backend Verification

The backend correctly sets `assignedCentreId` for FRONT_DESK users:

**File**: `backend/src/services/auth.services.ts`

```typescript
const centreIds = (user.centreIds || []).map((id: number) => id.toString());
const assignedCentreId =
  roleName === "FRONT_DESK" && centreIds.length > 0 ? centreIds[0] : undefined;
```

## Database Schema

Ensure the following tables are correctly set up:

1. **users** table - has user records
2. **roles** table - has "FRONT_DESK" role
3. **user_roles** table - links users to roles
4. **user_centres** table - links users to centres
5. **centres** table - has centre records
6. **appointments** table - has `centre_id` column
7. **clinicians** table - has `primary_centre_id` column

## Known Limitations

1. **Multiple Centre Assignment**: If a front desk staff is assigned to multiple centres, only the first centre in the array is used as `assignedCentreId`
2. **No Centre Assignment**: If a front desk staff has no centres assigned, they will see all data (same as admin)

## Future Improvements

1. **Server-side Filtering**: Move filtering logic to backend API to reduce data transfer
2. **Multiple Centre Support**: Allow front desk staff to switch between assigned centres
3. **Role-based API Endpoints**: Create dedicated endpoints that automatically filter based on user role
4. **Type Safety**: Use TypeScript strict mode to catch type mismatches at compile time

## Files Modified

1. `src/modules/appointments/pages/AllAppointmentsPage.tsx`
2. `src/modules/appointments/pages/BookAppointmentPage.tsx`

## Related Files (No Changes Needed)

- `src/contexts/AuthContext.tsx` - Already handles user data correctly
- `src/services/authService.ts` - Already stores user data correctly
- `src/types/index.ts` - Type definitions are correct
- `backend/src/services/auth.services.ts` - Backend logic is correct
