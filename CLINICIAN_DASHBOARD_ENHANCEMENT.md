# Clinician Dashboard Enhancement

## Overview

Enhanced the clinician dashboard in the admin panel with comprehensive appointment management features for clinicians to view, manage, and track their sessions.

---

## Features Implemented

### 1. **Enhanced Appointment List**

- ✅ Displays only appointments for the logged-in clinician
- ✅ Sorted by nearest upcoming appointment first
- ✅ Shows patient name, session details, date, time, centre, and mode (Online/In-Person)
- ✅ Status badges for each appointment (CONFIRMED, IN_PROGRESS, COMPLETED, etc.)
- ✅ Google Meet links for online appointments

### 2. **Patient Notes**

- ✅ "Patient Note" button on each appointment row
- ✅ Opens modal showing notes added by patient during booking
- ✅ Read-only view (clinicians can view but not edit patient notes)
- ✅ Correctly fetches notes for the specific appointment

### 3. **Clinician Notes**

- ✅ "Clinician Note" button on each appointment row
- ✅ Text area for clinicians to add/edit session notes
- ✅ **Previous Notes History**: Shows all previous notes for the same patient
- ✅ Chronologically sorted (most recent first)
- ✅ Expandable/collapsible previous notes section
- ✅ Character counter for current notes
- ✅ Save functionality with loading states

### 4. **Session Control**

- ✅ "Start Session" button for upcoming appointments
- ✅ "End Session" button for in-progress sessions
- ✅ Updates appointment status:
  - Start Session → Status: IN_PROGRESS, records `session_started_at`
  - End Session → Status: COMPLETED, records `session_ended_at`
- ✅ Session timing information displayed in modal
- ✅ Confirmation modal with session details

### 5. **Advanced Filters**

- ✅ **View Mode Toggle**:
  - Upcoming appointments (default)
  - Past appointments
- ✅ **Date Range Filters**:
  - Next 30 days (default for upcoming)
  - Past 20 days (default for past)
  - Custom date range with start/end date pickers
- ✅ Collapsible filter section
- ✅ Appointment count display
- ✅ Auto-adjusts date range when switching view modes

---

## Files Created

### Frontend (Admin Panel)

1. **`ClinicianDashboardEnhanced.tsx`**
   - Main dashboard component
   - Appointment list with filters
   - View mode toggle (upcoming/past)
   - Date range filters
   - Session control integration

2. **`PatientNotesModal.tsx`**
   - Modal to view patient notes
   - Read-only display
   - Fetches notes from specific appointment

3. **`ClinicianNotesModal.tsx`**
   - Modal to add/edit clinician notes
   - Previous notes history for same patient
   - Expandable previous notes section
   - Save functionality

4. **`SessionControlModal.tsx`**
   - Modal for start/end session
   - Session timing display
   - Status update confirmation
   - Loading states

### Backend

5. **`add_session_tracking.sql`**
   - Migration to add session tracking fields
   - Adds `session_started_at` and `session_ended_at` columns
   - Creates indexes for performance

6. **Updated `booking.repository.ts`**
   - Enhanced `updateAppointmentStatus` method
   - Automatically sets session timestamps based on status:
     - `IN_PROGRESS` → sets `session_started_at`
     - `COMPLETED` → sets `session_ended_at`

---

## Database Schema Changes

### New Columns in `appointments` Table

```sql
session_started_at TIMESTAMP WITH TIME ZONE
session_ended_at TIMESTAMP WITH TIME ZONE
```

**Indexes**:

- `idx_appointments_session_started_at`
- `idx_appointments_session_ended_at`

---

## API Endpoints Used

### Existing Endpoints

- `GET /api/appointments/my-appointments` - Fetch clinician's appointments
- `GET /api/appointments/:id` - Get appointment details (for patient notes)
- `GET /api/appointments?patientId=X` - Get all appointments for a patient (for previous notes)
- `PUT /api/appointments/:id` - Update appointment (notes, status)

### Status Flow

1. **CONFIRMED** → Initial state after booking
2. **IN_PROGRESS** → When clinician starts session
3. **COMPLETED** → When clinician ends session

---

## User Flow

### For Clinician (Dr. Z - doctor1234)

1. **Login**
   - Username: `doctor1234`
   - Password: `Mibo@1234`
   - Redirected to `/appointments`

2. **View Appointments**
   - Default: Next 30 days of upcoming appointments
   - Sorted: Nearest appointment first
   - Can switch to past appointments (past 20 days)
   - Can set custom date range

3. **View Patient Notes**
   - Click "Patient Note" button
   - Modal shows notes patient added during booking
   - Read-only view

4. **Add/Edit Clinician Notes**
   - Click "Clinician Note" button
   - Add notes in text area
   - View previous notes for same patient (expandable)
   - Save notes

5. **Manage Session**
   - Click "Start Session" when patient arrives
   - Status changes to IN_PROGRESS
   - Click "End Session" when session completes
   - Status changes to COMPLETED

---

## Key Features

### ✅ Correct Data Isolation

- Clinicians only see their own appointments
- Backend enforces clinician scope via `enforceClinicianScope()` middleware

### ✅ Patient Notes Integrity

- Patient notes are read-only for clinicians
- Fetched from `patient_notes` column (separate from clinician `notes`)

### ✅ Previous Notes History

- When viewing clinician notes, all previous notes for the same patient are shown
- Sorted chronologically (most recent first)
- Only shows appointments before the current one
- Expandable/collapsible section

### ✅ Session Tracking

- Automatic timestamp recording
- `session_started_at` set when status → IN_PROGRESS
- `session_ended_at` set when status → COMPLETED
- Uses `COALESCE` to prevent overwriting existing timestamps

### ✅ Responsive Design

- Mobile-friendly layout
- Collapsible filters
- Modal overlays
- Loading states

---

## Testing Checklist

### Setup

- [ ] Run migration: `add_session_tracking.sql`
- [ ] Restart backend server
- [ ] Login as clinician (doctor1234 / Mibo@1234)

### Test Cases

#### 1. Appointment List

- [ ] Verify only Dr. Z's appointments are shown
- [ ] Check sorting (nearest upcoming first)
- [ ] Verify all appointment details display correctly
- [ ] Check status badges
- [ ] Verify Google Meet links for online appointments

#### 2. Filters

- [ ] Toggle between Upcoming and Past views
- [ ] Test "Next 30 days" filter
- [ ] Test "Past 20 days" filter
- [ ] Test custom date range
- [ ] Verify appointment count updates

#### 3. Patient Notes

- [ ] Click "Patient Note" button
- [ ] Verify correct notes display
- [ ] Check for appointments without patient notes
- [ ] Verify read-only (no edit capability)

#### 4. Clinician Notes

- [ ] Click "Clinician Note" button
- [ ] Add new notes and save
- [ ] Edit existing notes
- [ ] Expand "Previous Session Notes"
- [ ] Verify previous notes for same patient display
- [ ] Check chronological sorting
- [ ] Verify character counter

#### 5. Session Control

- [ ] Start a session (status → IN_PROGRESS)
- [ ] Verify `session_started_at` is recorded in database
- [ ] End a session (status → COMPLETED)
- [ ] Verify `session_ended_at` is recorded in database
- [ ] Check session timing display in modal

#### 6. Cross-Patient Verification

- [ ] Book multiple appointments for same patient
- [ ] Add notes to first appointment
- [ ] Open clinician notes for second appointment
- [ ] Verify first appointment's notes appear in "Previous Notes"

---

## Deployment Steps

### 1. Backend

```bash
cd c:\Users\nithi\Desktop\backend_mibo\backend

# Run migration
psql -U postgres -d mibo-development-db -f migrations/add_session_tracking.sql

# Restart server
npm run dev
```

### 2. Frontend (Admin Panel)

```bash
cd c:\Users\nithi\Desktop\admin_mibo\mibo-admin

# Install dependencies (if needed)
npm install date-fns lucide-react

# Build
npm run build

# Deploy to AWS
```

---

## Configuration

### Clinician Login Credentials

- **Username**: `doctor1234`
- **Password**: `Mibo@1234`
- **Role**: CLINICIAN
- **Clinician Name**: Dr. Z

### Routes

- **Clinician Dashboard**: `/appointments` (when logged in as clinician)
- **Admin Appointments**: `/appointments` (when logged in as admin/manager)

---

## Technical Notes

### Router Logic

```typescript
// In router/index.tsx
<Route
  path="appointments"
  element={
    isClinician ? (
      <ClinicianDashboardEnhanced />
    ) : (
      <AllAppointmentsPage />
    )
  }
/>
```

### Session Tracking Logic

```typescript
// In booking.repository.ts
if (status === "IN_PROGRESS") {
  // Set session_started_at (only if not already set)
  additionalFields =
    ", session_started_at = COALESCE(session_started_at, NOW())";
} else if (status === "COMPLETED") {
  // Set session_ended_at (only if not already set)
  additionalFields = ", session_ended_at = COALESCE(session_ended_at, NOW())";
}
```

### Previous Notes Query

```typescript
// Fetch all appointments for patient
const allAppointments = await appointmentService.getAppointments({
  patientId: patientId.toString(),
});

// Filter: exclude current appointment, only with notes, before current date
const notesHistory = allAppointments
  .filter(
    (apt) =>
      apt.id !== appointment.id &&
      apt.notes &&
      new Date(apt.scheduled_start_at) <
        new Date(appointment.scheduled_start_at),
  )
  .sort(
    (a, b) => new Date(b.scheduled_start_at) - new Date(a.scheduled_start_at),
  );
```

---

## Future Enhancements (Optional)

- [ ] Export appointment list to PDF/Excel
- [ ] Add search functionality for patient names
- [ ] Add notification when appointment time approaches
- [ ] Add voice-to-text for clinician notes
- [ ] Add templates for common notes
- [ ] Add patient history summary in modal
- [ ] Add prescription management
- [ ] Add follow-up scheduling from dashboard

---

## Support

For issues or questions:

1. Check backend logs for API errors
2. Check browser console for frontend errors
3. Verify database migration ran successfully
4. Ensure clinician user has correct role and permissions
