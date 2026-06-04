# 🧪 Quick Testing Guide - Clinician Dashboard

## Prerequisites ✅

- [x] Backend server running on port 5000
- [x] Database migration applied
- [x] Admin panel running on port 5173/5174
- [ ] Clinician user account created

---

## Quick Test Flow (5 Minutes)

### 1. Login as Clinician (1 min)

```
1. Open admin panel
2. Login with clinician credentials
3. Should auto-redirect to /clinician/dashboard
4. Verify 6 stat boxes appear at top
```

### 2. Test Calendar (2 min)

```
1. Click calendar button (top right)
2. Try quick filter: "Today"
   → Should show only today's appointments
3. Try quick filter: "Last 7 days"
   → Should show last week's appointments
4. Click calendar dates to select custom range
5. Click "Apply"
   → Dashboard updates with new date range
6. Test future dates:
   - Navigate to next month
   - Select a future date range
   → Should work without errors
```

### 3. Test Appointment Flow (2 min)

```
1. Book a test appointment for today (if none exist)
2. On dashboard, verify appointment shows as "Waiting"
3. Click appointment card
   → StartSessionModal opens
4. Click "Start Session"
   → Modal closes, appointment now shows "Ongoing"
5. Click ongoing appointment
   → OngoingSessionModal opens
6. Click "Complete Session"
   → Appointment now shows "Completed"
```

---

## Detailed Test Scenarios

### A. Calendar Functionality

#### Test 1: Quick Filters

```
✓ Today
✓ Yesterday
✓ This week (Sun - Today)
✓ Last 7 days
✓ Last week (Sun - Sat)
✓ Last 14 days
✓ This month
✓ Last 30 days
✓ Last month
✓ All time

Expected: Each filter updates dashboard immediately
```

#### Test 2: Custom Date Range

```
1. Click calendar button
2. Click start date (e.g., June 1)
3. Click end date (e.g., June 10)
4. Click "Apply"

Expected: Dashboard shows appointments in range
```

#### Test 3: Future Dates (IMPORTANT!)

```
1. Book appointment for tomorrow or next week
2. Set calendar to "All time" or future date range
3. Verify future appointment appears

Expected: Future appointments are visible ✅
```

#### Test 4: Month Navigation

```
1. Open calendar
2. Click left arrow (◀) to go to previous month
3. Click right arrow (▶) to go to next month
4. Select dates from different month

Expected: Calendar navigates correctly
```

---

### B. Appointment Workflow

#### Test 1: Pending → Ongoing → Completed

```
Status Flow:
BOOKED/CONFIRMED → IN_PROGRESS → COMPLETED

Steps:
1. Create appointment (status: BOOKED)
2. Click appointment → StartSessionModal
3. Click "Start Session" → status: IN_PROGRESS
4. Click appointment → OngoingSessionModal
5. Click "Complete Session" → status: COMPLETED

Expected: Status updates persist in database
```

#### Test 2: Session Persistence

```
1. Start a session (status: IN_PROGRESS)
2. Close modal without completing
3. Refresh page (F5)
4. Click appointment again

Expected: OngoingSessionModal opens (not StartSessionModal)
         Session state is preserved ✅
```

#### Test 3: Patient Notes

```
1. When booking appointment, add patient notes
2. On dashboard, click appointment
3. In modal, click "Patient Notes"

Expected: Patient's notes are visible
```

#### Test 4: Clinician Notes

```
1. During ongoing session, click "Clinician Notes"
2. Add clinical observations
3. View "Previous Notes" section
4. Save notes

Expected: Notes saved to history table
```

#### Test 5: Follow-up Appointments

```
1. During session, click "Clinician Notes"
2. Enable "Schedule Follow-up"
3. Select date and add notes
4. Save

Expected: Follow-up recorded in database
```

---

### C. Stats Accuracy

#### Test Stats Calculation

```
Create test appointments:
- 2 BOOKED
- 1 CONFIRMED
- 1 IN_PROGRESS
- 3 COMPLETED
- 1 CANCELLED

Expected Stats:
Total: 8
Waiting: 2
Ongoing: 1
Confirmed: 1
Completed: 3
Cancelled: 1

Verify: Dashboard stats match these numbers
```

---

### D. UI/UX Testing

#### Test 1: Visual Design

```
Check:
✓ Gradient background (dark theme)
✓ Stat boxes have unique colors
✓ Hover effects on stats and cards
✓ Smooth transitions
✓ Icons display correctly
✓ Status badges color-coded
```

#### Test 2: Responsive Layout

```
Resize browser window:
- Desktop (1920px): 6 stat columns
- Tablet (1024px): 3 stat columns
- Mobile (768px): 2 stat columns

Expected: Layout adapts smoothly
```

#### Test 3: Empty States

```
1. Set date range with no appointments
2. Verify empty state message shows:
   "No appointments found"
   "Try selecting a different date range"

Expected: Friendly empty state, not blank page
```

#### Test 4: Date Grouping

```
Create appointments on:
- June 1 (2 appointments)
- June 2 (1 appointment)
- June 3 (3 appointments)

Expected: Appointments grouped by date with headers:
         "Friday, June 01, 2026"
         "Saturday, June 02, 2026"
         etc.
```

---

### E. Error Handling

#### Test 1: Network Errors

```
1. Stop backend server
2. Try to load dashboard

Expected: Error message displays
         "Failed to load dashboard. Please try again."
```

#### Test 2: Invalid Dates

```
1. Try selecting end date before start date

Expected: Dates auto-correct (end becomes start, vice versa)
```

#### Test 3: Permission Check

```
1. Login as non-clinician (patient/admin)
2. Try to access /clinician/dashboard

Expected: Access denied or redirect
```

---

### F. Performance Testing

#### Test 1: Large Dataset

```
Create 50+ appointments across 30 days
Load dashboard with "Last 30 days"

Expected:
- Loads within 2 seconds
- Smooth scrolling
- No lag on date changes
```

#### Test 2: Rapid Interactions

```
1. Rapidly click different date ranges
2. Quickly open/close modals
3. Fast navigation between dates

Expected: UI remains responsive
```

---

## API Endpoint Testing

### Test with cURL/Postman

#### 1. Get Dashboard Stats

```bash
GET /api/appointments/dashboard/stats?startDate=2026-06-03&endDate=2026-06-03
Authorization: Bearer YOUR_TOKEN

Expected Response:
{
  "total": 5,
  "waiting": 2,
  "ongoing": 1,
  "confirmed": 1,
  "completed": 1,
  "cancelled": 0
}
```

#### 2. Get Dashboard Appointments

```bash
GET /api/appointments/dashboard/appointments?startDate=2026-06-03&endDate=2026-06-03
Authorization: Bearer YOUR_TOKEN

Expected Response: Array of appointment objects
```

#### 3. Start Session

```bash
POST /api/appointments/:id/start-session
Authorization: Bearer YOUR_TOKEN

Expected Response:
{
  "message": "Session started successfully",
  "appointment": { ...updated appointment }
}
```

#### 4. End Session

```bash
POST /api/appointments/:id/end-session
Authorization: Bearer YOUR_TOKEN

Expected Response:
{
  "message": "Session completed successfully",
  "appointment": { ...updated appointment }
}
```

#### 5. Save Clinician Notes

```bash
POST /api/appointments/:id/clinician-notes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "notes": "Patient shows improvement...",
  "followUp": {
    "date": "2026-06-10",
    "notes": "Review medication effectiveness"
  }
}

Expected Response:
{
  "message": "Notes saved successfully",
  "noteId": 123
}
```

---

## Common Issues & Solutions

### Issue 1: Future Appointments Not Showing

**Solution:**

- Open calendar and select "All time" or future date range
- Calendar now supports future dates ✅

### Issue 2: Stats Not Updating

**Solution:**

- Refresh the page
- Check if date range includes the appointment date
- Verify appointment status in database

### Issue 3: Modal Won't Open

**Solution:**

- Check browser console for errors
- Verify appointment has required fields
- Check if user has clinician role

### Issue 4: Calendar Dropdown Stays Open

**Solution:**

- Click outside calendar to close
- Click "Apply" button
- This is by design; dropdown closes on Apply or outside click

### Issue 5: Backend Errors

**Solution:**

- Check backend terminal for error logs
- Verify database migration was applied
- Check database connection
- Restart backend server

---

## Database Verification Queries

### Check Migration Applied

```sql
-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
AND column_name IN ('session_started_at', 'session_ended_at', 'patient_notes');

-- Should return 3 rows
```

### Check New Tables

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('clinician_notes_history', 'follow_up_appointments');

-- Should return 2 rows
```

### Check Session Data

```sql
-- View appointments with session data
SELECT
  id,
  patient_id,
  status,
  session_started_at,
  session_ended_at
FROM appointments
WHERE clinician_id = YOUR_CLINICIAN_ID
ORDER BY scheduled_start_at DESC;
```

### Check Clinician Notes

```sql
-- View all clinician notes
SELECT
  id,
  appointment_id,
  patient_id,
  session_notes,
  created_at
FROM clinician_notes_history
WHERE clinician_id = YOUR_CLINICIAN_ID
ORDER BY created_at DESC;
```

---

## Success Criteria Checklist

### Core Functionality ✅

- [ ] Dashboard loads without errors
- [ ] Stats display correctly
- [ ] Appointments list shows properly
- [ ] Calendar opens and closes
- [ ] Date range filtering works
- [ ] Future dates are selectable
- [ ] Modals open for appointments
- [ ] Session workflow completes
- [ ] Notes save successfully
- [ ] Follow-ups can be scheduled

### UI/UX ✅

- [ ] Modern gradient design
- [ ] Smooth animations
- [ ] Hover effects work
- [ ] Status colors correct
- [ ] Typography is readable
- [ ] Layout is responsive
- [ ] Empty states display
- [ ] Error messages show

### Data Integrity ✅

- [ ] Session state persists
- [ ] Notes saved to database
- [ ] Follow-ups recorded
- [ ] Stats calculate correctly
- [ ] Date filtering accurate
- [ ] Status updates persist

### Performance ✅

- [ ] Page loads < 2 seconds
- [ ] Smooth scrolling
- [ ] No UI lag
- [ ] API calls efficient
- [ ] Calendar renders quickly

---

## Report Format

After testing, report issues in this format:

```
Issue: [Brief description]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [What should happen]
Actual: [What actually happened]
Browser: [Chrome/Firefox/Safari/Edge]
Console Errors: [Any error messages]
```

---

## Quick Verification (30 seconds)

**The Absolute Minimum Test:**

1. ✅ Login as clinician
2. ✅ Dashboard loads with stats
3. ✅ Click calendar button
4. ✅ Select "Today"
5. ✅ Verify appointments show

**If all 5 steps work: Implementation is functional! ✓**

---

## Testing Priority

**Must Test (P0):**

1. Calendar date selection (especially future dates)
2. Appointment session workflow
3. Stats accuracy
4. Modal interactions

**Should Test (P1):** 5. Empty states 6. Error handling 7. Visual design 8. Responsive layout

**Nice to Test (P2):** 9. Performance with large dataset 10. Edge cases 11. Rapid interactions 12. Different browsers

---

_Start with the 5-minute quick test, then dive into detailed scenarios as needed._
