# Testing Guide for Session Management Fixes

## Prerequisites

- Backend server is running on port 5000
- Admin panel is running
- PostgreSQL database is connected
- You have a clinician account to test with

## Test Scenario 1: Session Start Time Validation

### Steps:

1. Log in as a clinician
2. Navigate to "My Appointments" dashboard
3. Find an appointment scheduled for a future time (e.g., 10:00 AM on May 25, 2026)
4. Click the "Start Session" button **before** the scheduled time

### Expected Result:

- ❌ Error notification appears
- Message: "Session can only be started at the scheduled time: 10:00 AM, May 25, 2026"
- Session does NOT start
- Status remains unchanged

### Steps (continued):

5. Wait until the scheduled time (or change system time for testing)
6. Click "Start Session" button again

### Expected Result:

- ✅ Session starts successfully
- Status changes to "IN_PROGRESS"
- Button changes to "End Session"
- `session_started_at` timestamp is recorded in database
- Modal closes and dashboard refreshes

## Test Scenario 2: Session End Anytime

### Steps:

1. Start a session (following Scenario 1)
2. Immediately click "End Session" button (without waiting)

### Expected Result:

- ✅ Session ends successfully
- Status changes to "COMPLETED"
- `session_ended_at` timestamp is recorded in database
- Button disappears (session is completed)
- Modal closes and dashboard refreshes

## Test Scenario 3: Patient Notes

### Steps:

1. Find any appointment in the dashboard
2. Click "Patient Notes" button

### Expected Result:

- ✅ Modal opens
- Patient notes are displayed (or "No notes provided by patient")
- Notes are read-only (no edit capability)
- Modal has a "Close" button
- Clicking "Close" closes the modal

## Test Scenario 4: Clinician Notes - Create

### Steps:

1. Find any appointment in the dashboard
2. Click "Clinician Notes" button
3. Type some notes in the text area (e.g., "Patient showed improvement in mood")
4. Click "Save Notes"

### Expected Result:

- ✅ Notes save successfully
- Modal closes
- Dashboard refreshes
- Green indicator dot appears next to "Clinician Notes" button
- Notes are stored in database

## Test Scenario 5: Clinician Notes - View Previous

### Steps:

1. Find an appointment for a patient who has had previous appointments
2. Click "Clinician Notes" button
3. Click "Previous Session Notes" to expand

### Expected Result:

- ✅ Previous notes section expands
- Shows all previous session notes for this patient
- Notes are sorted by date (most recent first)
- Each note shows date, time, and status
- Current appointment's notes are NOT shown in previous notes

## Test Scenario 6: Complete Session Flow

### Steps:

1. Log in as clinician
2. Find an appointment scheduled for current time
3. Click "Start Session" button
4. Verify status changes to "IN_PROGRESS"
5. Click "Patient Notes" and review patient's concerns
6. Click "Clinician Notes" and add session notes
7. Save clinician notes
8. Click "End Session" button
9. Verify status changes to "COMPLETED"

### Expected Result:

- ✅ Complete flow works smoothly
- All timestamps are recorded correctly
- Notes are saved
- Session cannot be restarted after completion

## Database Verification

### Check Session Timestamps:

```sql
SELECT
  id,
  patient_id,
  status,
  scheduled_start_at,
  session_started_at,
  session_ended_at,
  notes,
  patient_notes
FROM appointments
WHERE id = <appointment_id>;
```

### Expected Database State:

**Before Session Start:**

- `status`: 'CONFIRMED' or 'BOOKED'
- `session_started_at`: NULL
- `session_ended_at`: NULL

**After Session Start:**

- `status`: 'IN_PROGRESS'
- `session_started_at`: <timestamp>
- `session_ended_at`: NULL

**After Session End:**

- `status`: 'COMPLETED'
- `session_started_at`: <timestamp>
- `session_ended_at`: <timestamp>

## API Testing with Postman/cURL

### Start Session (should fail before scheduled time):

```bash
curl -X PUT http://localhost:5000/api/appointments/123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

### End Session:

```bash
curl -X PUT http://localhost:5000/api/appointments/123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

### Update Clinician Notes:

```bash
curl -X PUT http://localhost:5000/api/appointments/123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Patient showed significant improvement"}'
```

## Common Issues and Solutions

### Issue: "Failed to start session"

**Solution**: Check that:

- Backend server is running
- Database connection is active
- Clinician has permission to access this appointment
- Appointment status is valid for starting session

### Issue: Time validation not working

**Solution**: Check that:

- Client and server times are synchronized
- Appointment `scheduled_start_at` is in correct timezone
- Date comparison logic is working correctly

### Issue: Notes not saving

**Solution**: Check that:

- Clinician has permission to update notes
- Appointment ID is valid
- Backend endpoint is receiving the request
- Database connection is active

## Status Badge Colors

The dashboard should display these colors for different statuses:

- **BOOKED**: Gray
- **CONFIRMED**: Green
- **IN_PROGRESS**: Purple
- **COMPLETED**: Blue
- **CANCELLED**: Red
- **NO_SHOW**: Gray

## Next Steps After Testing

1. Test with real appointments in staging environment
2. Verify timezone handling for different regions
3. Test with multiple concurrent sessions
4. Verify notification system (if applicable)
5. Test session timeout scenarios (if applicable)
6. Load test with multiple clinicians
