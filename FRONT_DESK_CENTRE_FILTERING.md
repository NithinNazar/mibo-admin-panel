# Front Desk Centre-Based Filtering Implementation

## Overview

Implemented centre-based filtering for front desk staff in the admin panel. Front desk staff can now only view and manage appointments, clinicians, and bookings for their assigned centre.

## Changes Made

### 1. AllAppointmentsPage.tsx

**Location:** `src/modules/appointments/pages/AllAppointmentsPage.tsx`

**Changes:**

- Added filtering logic in `fetchData()` to filter appointments, centres, and clinicians based on front desk staff's assigned centre
- Updated centre filter dropdown to only show the assigned centre for front desk staff (disabled dropdown)
- Clinician filter automatically shows only clinicians from the assigned centre
- Updated page title and description to be contextual:
  - Front desk: "Centre Appointments" with centre name
  - Admin/Manager: "All Appointments" with "across centres" description

**Key Features:**

- Front desk staff see only appointments from their assigned centre
- Centre dropdown is disabled and shows only their assigned centre
- Clinician dropdown shows only clinicians associated with their centre
- All other filters (status, time, date, search) work normally within their centre's scope

### 2. CentreAppointmentsPage.tsx

**Location:** `src/modules/appointments/pages/CentreAppointmentsPage.tsx`

**Changes:**

- Added similar filtering logic in `fetchData()` to restrict data to assigned centre
- Filters appointments, centres, and clinicians based on front desk staff's assigned centre

### 3. BookAppointmentPage.tsx

**Location:** `src/modules/appointments/pages/BookAppointmentPage.tsx`

**Changes:**

- Added `useAuth` hook to access user role and assigned centre
- Updated `fetchCentres()` to filter centres and auto-select assigned centre for front desk staff
- Modified Step 1 (Centre Selection) UI to show a read-only display for front desk staff with a message indicating their assigned centre is automatically selected
- Centre is pre-selected for front desk staff, allowing them to proceed directly to clinician selection

**Key Features:**

- Front desk staff see only their assigned centre in the booking flow
- Centre is automatically selected and displayed as read-only
- Visual indicator shows "Your assigned centre (automatically selected)"
- Clinician list automatically shows only clinicians from their centre

## User Experience

### For Front Desk Staff (e.g., Kochi Centre):

1. **Appointments Page:**
   - Page title: "Centre Appointments"
   - Description: "View and manage bookings for Kochi"
   - Centre filter: Shows only "Kochi" (disabled)
   - Clinician filter: Shows only Kochi clinicians
   - Appointments: Shows only Kochi appointments

2. **Book Appointment:**
   - Step 1: Shows Kochi centre as pre-selected with indicator
   - Step 2: Shows only Kochi clinicians
   - Rest of the flow works normally

### For Admin/Manager:

- No changes to existing functionality
- Can view and manage all centres, clinicians, and appointments
- All filters work as before with "All" options available

## Technical Details

### Authentication Context

Uses `useAuth()` hook to access:

- `user.role` - To check if user is "FRONT_DESK"
- `user.assignedCentreId` - The centre ID assigned to the front desk staff

### Filtering Logic

```typescript
if (isFrontDesk && assignedCentreId) {
  // Filter appointments
  const filteredAppointments = appointmentsData.filter(
    (apt) => apt.centre_id === assignedCentreId,
  );

  // Filter centres
  const filteredCentres = centresData.filter(
    (centre) => centre.id === assignedCentreId,
  );

  // Filter clinicians
  const filteredClinicians = cliniciansData.filter(
    (clinician) => clinician.primaryCentreId === assignedCentreId,
  );
}
```

## Testing

### Test Scenarios:

1. **Login as Front Desk (Kochi):**
   - Verify only Kochi appointments are visible
   - Verify centre filter shows only Kochi
   - Verify clinician filter shows only Kochi clinicians
   - Verify booking flow pre-selects Kochi centre

2. **Login as Front Desk (Bangalore):**
   - Verify only Bangalore appointments are visible
   - Verify centre filter shows only Bangalore
   - Verify clinician filter shows only Bangalore clinicians

3. **Login as Front Desk (Mumbai):**
   - Verify only Mumbai appointments are visible
   - Verify centre filter shows only Mumbai
   - Verify clinician filter shows only Mumbai clinicians

4. **Login as Admin/Manager:**
   - Verify all appointments are visible
   - Verify all centres are available in filter
   - Verify all clinicians are available in filter
   - Verify "All Centres" option is available

## Database Schema Reference

### User Table

- `role`: VARCHAR - User role (e.g., "FRONT_DESK", "ADMIN", "MANAGER")
- `assigned_centre_id`: VARCHAR - Centre ID assigned to front desk staff

### Clinician Table

- `primary_centre_id`: VARCHAR - Primary centre where clinician works

### Appointment Table

- `centre_id`: VARCHAR - Centre where appointment is scheduled

## Benefits

1. **Data Isolation:** Front desk staff only see data relevant to their centre
2. **Simplified UI:** Reduced clutter by hiding irrelevant centres and clinicians
3. **Security:** Prevents front desk staff from accessing other centres' data
4. **Better UX:** Auto-selection and pre-filtering speeds up workflows
5. **Consistency:** Same filtering logic applied across all appointment-related pages

## Future Enhancements

Potential improvements:

1. Add centre-based filtering to patient management pages
2. Add centre-based filtering to reports and analytics
3. Allow centre managers to view multiple centres they manage
4. Add audit logging for cross-centre access attempts
