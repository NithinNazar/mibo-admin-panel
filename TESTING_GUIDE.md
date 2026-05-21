# Front Desk RBAC Testing Guide

## Prerequisites

### Backend Server

✅ **Status**: Running on port 5000

- Database connected successfully
- All services initialized (Gallabox, Google Meet, Razorpay)

### Test Users Required

You'll need the following test accounts:

1. **Admin User**
   - Role: ADMIN
   - Purpose: Test full access

2. **Front Desk User (Bangalore)**
   - Role: FRONT_DESK
   - Assigned Centre: Bangalore
   - Purpose: Test Bangalore-specific access

3. **Front Desk User (Kochi)**
   - Role: FRONT_DESK
   - Assigned Centre: Kochi
   - Purpose: Test Kochi-specific access

4. **Clinician User**
   - Role: CLINICIAN
   - Purpose: Verify clinician view unchanged

---

## Test Scenarios

### Scenario 1: Admin User - Full Access

**Login:**

```
Username: [admin_username]
Password: [admin_password]
```

**Expected Results:**

#### ✅ Topbar

- [ ] "Admin" badge visible below username
- [ ] Shows role name (e.g., "Admin" or "Manager")
- [ ] User initials displayed in avatar circle

#### ✅ Sidebar Navigation

- [ ] Dashboard
- [ ] Patients
- [ ] Appointments
- [ ] Book Appointment
- [ ] **Slot Management** (visible)
- [ ] **Centres** (visible)
- [ ] Staff section (Managers, Centre Managers, Clinicians, Care Coordinators, Front Desk)
- [ ] Settings
- [ ] Support
- [ ] Profile

#### ✅ Dashboard

- [ ] **Total Patients** stat card
- [ ] **Active Doctors** stat card
- [ ] **Follow Ups Booked** stat card
- [ ] **Total Revenue** stat card (visible with ₹ amount)
- [ ] Leads by Source chart
- [ ] Top Doctors chart
- [ ] **Revenue Analytics** chart (visible)
- [ ] Recent Appointments list

#### ✅ Appointments Page

- [ ] Can view appointments from all centres
- [ ] Centre filter dropdown is **enabled**
- [ ] Can switch between centres (Bangalore, Kochi, Mumbai, etc.)
- [ ] Shows appointments from selected centre
- [ ] Can filter by clinician, status, date, etc.

**Screenshot Checklist:**

- [ ] Topbar with "Admin" badge
- [ ] Sidebar with all menu items
- [ ] Dashboard with 4 stat cards including Total Revenue
- [ ] Revenue Analytics chart
- [ ] Appointments page with enabled centre filter

---

### Scenario 2: Front Desk User (Bangalore) - Restricted Access

**Login:**

```
Username: [frontdesk_bangalore_username]
Password: [frontdesk_bangalore_password]
```

**Expected Results:**

#### ✅ Topbar

- [ ] **NO "Admin" badge** (only username visible)
- [ ] User initials displayed in avatar circle
- [ ] Logout button visible

#### ✅ Sidebar Navigation

- [ ] Dashboard
- [ ] Patients
- [ ] Appointments
- [ ] Book Appointment
- [ ] **Slot Management** (NOT visible) ❌
- [ ] **Centres** (NOT visible) ❌
- [ ] **Staff section** (NOT visible) ❌
- [ ] Profile
- [ ] Support

#### ✅ Dashboard

- [ ] **Total Patients** stat card
- [ ] **Active Doctors** stat card
- [ ] **Follow Ups Booked** stat card
- [ ] **Total Revenue** stat card (NOT visible) ❌
- [ ] Leads by Source chart
- [ ] Top Doctors chart
- [ ] **Revenue Analytics** chart (NOT visible) ❌
- [ ] Recent Appointments list

#### ✅ Appointments Page

- [ ] Appointments **auto-filtered to Bangalore**
- [ ] Centre filter dropdown shows "Bangalore"
- [ ] Centre filter dropdown is **disabled** (greyed out)
- [ ] **Cannot switch to other centres**
- [ ] Only Bangalore appointments visible
- [ ] Can filter by clinician, status, date (other filters work)
- [ ] No Kochi or Mumbai appointments visible

#### ✅ Book Appointment Page

- [ ] Centre pre-selected to Bangalore
- [ ] Cannot change centre selection
- [ ] Can book appointments for Bangalore only

**Screenshot Checklist:**

- [ ] Topbar WITHOUT "Admin" badge
- [ ] Sidebar WITHOUT Slot Management and Centres
- [ ] Dashboard with only 3 stat cards (no Total Revenue)
- [ ] Dashboard WITHOUT Revenue Analytics chart
- [ ] Appointments page with disabled centre filter showing Bangalore

---

### Scenario 3: Front Desk User (Kochi) - Different Centre

**Login:**

```
Username: [frontdesk_kochi_username]
Password: [frontdesk_kochi_password]
```

**Expected Results:**

#### ✅ Appointments Page

- [ ] Appointments **auto-filtered to Kochi**
- [ ] Centre filter dropdown shows "Kochi"
- [ ] Centre filter dropdown is **disabled**
- [ ] Only Kochi appointments visible
- [ ] **No Bangalore appointments visible**
- [ ] **No Mumbai appointments visible**

#### ✅ Cross-Centre Verification

- [ ] Login as Bangalore Front Desk → See Bangalore appointments
- [ ] Logout
- [ ] Login as Kochi Front Desk → See Kochi appointments
- [ ] Verify different appointment lists
- [ ] Verify no overlap between centres

**Screenshot Checklist:**

- [ ] Appointments page with disabled centre filter showing Kochi
- [ ] Different appointment list than Bangalore Front Desk

---

### Scenario 4: Clinician User - Unchanged Behavior

**Login:**

```
Username: [clinician_username]
Password: [clinician_password]
```

**Expected Results:**

#### ✅ Topbar

- [ ] **NO "Admin" badge**
- [ ] User initials displayed

#### ✅ Sidebar Navigation

- [ ] **Only "My Appointments"**
- [ ] **Only "Profile"**
- [ ] No other menu items

#### ✅ Dashboard

- [ ] Clinician-specific dashboard (different from admin dashboard)
- [ ] Shows clinician's own appointments
- [ ] Shows clinician's schedule

#### ✅ Appointments Page

- [ ] Only shows clinician's own appointments
- [ ] Cannot see other clinicians' appointments

**Screenshot Checklist:**

- [ ] Sidebar with only 2 menu items
- [ ] Clinician-specific dashboard

---

## Detailed Test Steps

### Test 1: Admin Badge Visibility

**Steps:**

1. Login as **Admin**
2. Look at top-right corner of topbar
3. Verify "Admin" text visible below username
4. Logout

5. Login as **Front Desk (Bangalore)**
6. Look at top-right corner of topbar
7. Verify **NO "Admin" text** below username (only username visible)
8. Logout

9. Login as **Clinician**
10. Look at top-right corner of topbar
11. Verify **NO "Admin" text** below username
12. Logout

**Expected:**

- ✅ Admin sees "Admin" badge
- ❌ Front Desk does NOT see "Admin" badge
- ❌ Clinician does NOT see "Admin" badge

---

### Test 2: Sidebar Menu Items

**Steps:**

1. Login as **Admin**
2. Count sidebar menu items
3. Verify "Slot Management" present
4. Verify "Centres" present
5. Verify "Staff" section present
6. Logout

7. Login as **Front Desk (Bangalore)**
8. Count sidebar menu items
9. Verify **NO "Slot Management"**
10. Verify **NO "Centres"**
11. Verify **NO "Staff" section**
12. Verify "Dashboard", "Patients", "Appointments", "Book Appointment" present
13. Logout

**Expected:**

- ✅ Admin sees all menu items (10+ items)
- ❌ Front Desk sees limited menu items (6 items: Dashboard, Patients, Appointments, Book Appointment, Profile, Support)

---

### Test 3: Dashboard Revenue Visibility

**Steps:**

1. Login as **Admin**
2. Navigate to Dashboard
3. Count stat cards at top (should be 4)
4. Verify "Total Revenue" card present with ₹ amount
5. Scroll down
6. Verify "Revenue Analytics" chart present
7. Logout

8. Login as **Front Desk (Bangalore)**
9. Navigate to Dashboard
10. Count stat cards at top (should be 3)
11. Verify **NO "Total Revenue" card**
12. Scroll down
13. Verify **NO "Revenue Analytics" chart**
14. Logout

**Expected:**

- ✅ Admin sees 4 stat cards + Revenue Analytics chart
- ❌ Front Desk sees 3 stat cards, NO Revenue Analytics chart

---

### Test 4: Appointments Centre Filtering

**Steps:**

1. Login as **Admin**
2. Navigate to Appointments page
3. Look at centre filter dropdown
4. Verify dropdown is **enabled** (can click and change)
5. Select "Bangalore" → See Bangalore appointments
6. Select "Kochi" → See Kochi appointments
7. Verify different appointment lists
8. Logout

9. Login as **Front Desk (Bangalore)**
10. Navigate to Appointments page
11. Verify centre filter shows "Bangalore"
12. Try to click centre filter dropdown
13. Verify dropdown is **disabled** (greyed out, cannot click)
14. Verify only Bangalore appointments visible
15. Check appointment details → All should be Bangalore centre
16. Logout

17. Login as **Front Desk (Kochi)**
18. Navigate to Appointments page
19. Verify centre filter shows "Kochi"
20. Verify dropdown is **disabled**
21. Verify only Kochi appointments visible
22. Check appointment details → All should be Kochi centre
23. Logout

**Expected:**

- ✅ Admin can switch between centres freely
- ❌ Front Desk (Bangalore) locked to Bangalore, cannot switch
- ❌ Front Desk (Kochi) locked to Kochi, cannot switch
- ✅ Each Front Desk sees different appointment lists

---

### Test 5: Cross-Centre Data Isolation

**Steps:**

1. Login as **Admin**
2. Navigate to Appointments
3. Note down:
   - Total Bangalore appointments count
   - Total Kochi appointments count
   - Sample Bangalore appointment ID
   - Sample Kochi appointment ID
4. Logout

5. Login as **Front Desk (Bangalore)**
6. Navigate to Appointments
7. Count total appointments visible
8. Verify count matches Bangalore appointments from step 3
9. Search for Bangalore appointment ID from step 3 → Should find it
10. Search for Kochi appointment ID from step 3 → Should **NOT** find it
11. Logout

12. Login as **Front Desk (Kochi)**
13. Navigate to Appointments
14. Count total appointments visible
15. Verify count matches Kochi appointments from step 3
16. Search for Kochi appointment ID from step 3 → Should find it
17. Search for Bangalore appointment ID from step 3 → Should **NOT** find it
18. Logout

**Expected:**

- ✅ Front Desk (Bangalore) sees only Bangalore data
- ✅ Front Desk (Kochi) sees only Kochi data
- ❌ No cross-centre data leakage

---

## Browser DevTools Testing

### Test 6: Verify No Console Errors

**Steps:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Login as **Front Desk (Bangalore)**
4. Navigate through all pages:
   - Dashboard
   - Patients
   - Appointments
   - Book Appointment
   - Profile
5. Check console for errors

**Expected:**

- ✅ No red errors in console
- ✅ No "undefined" or "null" errors
- ⚠️ Warnings are acceptable

---

### Test 7: Network Requests Inspection

**Steps:**

1. Open browser DevTools (F12)
2. Go to Network tab
3. Login as **Front Desk (Bangalore)**
4. Navigate to Appointments page
5. Look at API requests
6. Find request to `/appointments` or similar
7. Check request parameters
8. Verify `centreId` or similar parameter is set to Bangalore centre ID

**Expected:**

- ✅ API requests include centre filter
- ✅ Only Bangalore data requested from backend

---

## Edge Cases Testing

### Test 8: Direct URL Access

**Steps:**

1. Login as **Front Desk (Bangalore)**
2. Try to access restricted URLs directly:
   - `/slot-blocking` (Slot Management)
   - `/centres` (Centre Management)
   - `/staff/managers` (Staff Management)
3. Verify behavior

**Expected:**

- ⚠️ **Current**: Pages may load (frontend-only restriction)
- ✅ **Ideal**: Redirect to unauthorized page or dashboard

**Note:** This test reveals that backend RBAC is needed for full security.

---

### Test 9: Browser Back Button

**Steps:**

1. Login as **Admin**
2. Navigate to Slot Management
3. Logout
4. Login as **Front Desk (Bangalore)**
5. Press browser back button
6. Verify behavior

**Expected:**

- ✅ Should redirect to login or dashboard
- ❌ Should NOT show Slot Management page

---

### Test 10: Multiple Tabs

**Steps:**

1. Open 2 browser tabs
2. Tab 1: Login as **Admin**
3. Tab 2: Login as **Front Desk (Bangalore)** (different browser or incognito)
4. Tab 1: Navigate to Appointments → Select "Kochi"
5. Tab 2: Navigate to Appointments → Verify still shows "Bangalore"
6. Verify no cross-contamination

**Expected:**

- ✅ Each session independent
- ✅ No data leakage between sessions

---

## Regression Testing

### Test 11: Existing Features Still Work

**Steps:**

1. Login as **Admin**
2. Test core features:
   - [ ] Create new patient
   - [ ] Book appointment
   - [ ] View patient details
   - [ ] Update appointment status
   - [ ] Cancel appointment
   - [ ] Create front desk staff
   - [ ] Assign centre to front desk staff
3. Verify all features work as before

**Expected:**

- ✅ No existing features broken
- ✅ All CRUD operations work

---

## Performance Testing

### Test 12: Page Load Times

**Steps:**

1. Login as **Front Desk (Bangalore)**
2. Measure page load times:
   - Dashboard load time
   - Appointments page load time
   - Patients page load time
3. Compare with Admin user load times

**Expected:**

- ✅ Similar load times (no performance degradation)
- ✅ Appointments page may be faster (less data to load)

---

## Accessibility Testing

### Test 13: Disabled Centre Filter Accessibility

**Steps:**

1. Login as **Front Desk (Bangalore)**
2. Navigate to Appointments page
3. Tab to centre filter dropdown using keyboard
4. Verify visual indication that it's disabled
5. Try to activate with Enter/Space key
6. Verify it doesn't open

**Expected:**

- ✅ Visually appears disabled (greyed out)
- ✅ Cursor shows "not-allowed" on hover
- ✅ Cannot be activated via keyboard
- ✅ Screen readers announce as "disabled"

---

## Bug Reporting Template

If you find issues, report using this template:

```
**Bug Title:** [Brief description]

**User Role:** [ADMIN / FRONT_DESK / CLINICIAN]

**Steps to Reproduce:**
1. Login as [role]
2. Navigate to [page]
3. [Action taken]
4. [Observed behavior]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[Attach screenshots]

**Browser:**
[Chrome / Firefox / Safari / Edge]

**Console Errors:**
[Any errors from browser console]

**Severity:**
- [ ] Critical (blocks core functionality)
- [ ] High (major feature broken)
- [ ] Medium (minor feature issue)
- [ ] Low (cosmetic issue)
```

---

## Success Criteria

All tests pass when:

✅ **Admin users:**

- See "Admin" badge
- See all sidebar menu items
- See Total Revenue and Revenue Analytics
- Can view all centres' appointments

✅ **Front Desk users:**

- Do NOT see "Admin" badge
- Do NOT see Slot Management or Centres in sidebar
- Do NOT see Total Revenue or Revenue Analytics
- Can ONLY see their assigned centre's appointments
- Centre filter is disabled

✅ **Clinician users:**

- Behavior unchanged from before
- See only their own appointments

✅ **No regressions:**

- All existing features work
- No console errors
- No performance degradation

---

## Test Results Log

| Test # | Test Name              | Status | Notes | Tester | Date |
| ------ | ---------------------- | ------ | ----- | ------ | ---- |
| 1      | Admin Badge Visibility | ⬜     |       |        |      |
| 2      | Sidebar Menu Items     | ⬜     |       |        |      |
| 3      | Dashboard Revenue      | ⬜     |       |        |      |
| 4      | Appointments Filtering | ⬜     |       |        |      |
| 5      | Cross-Centre Isolation | ⬜     |       |        |      |
| 6      | Console Errors         | ⬜     |       |        |      |
| 7      | Network Requests       | ⬜     |       |        |      |
| 8      | Direct URL Access      | ⬜     |       |        |      |
| 9      | Browser Back Button    | ⬜     |       |        |      |
| 10     | Multiple Tabs          | ⬜     |       |        |      |
| 11     | Regression Testing     | ⬜     |       |        |      |
| 12     | Performance            | ⬜     |       |        |      |
| 13     | Accessibility          | ⬜     |       |        |      |

**Legend:**

- ⬜ Not tested
- ✅ Passed
- ❌ Failed
- ⚠️ Passed with issues

---

## Quick Test Commands

### Start Admin Panel (Development):

```bash
cd c:\Users\nithi\Desktop\admin_mibo\mibo-admin
npm run dev
```

### Start Backend Server:

```bash
cd c:\Users\nithi\Desktop\backend_mibo\backend
npm run dev
```

### Build for Production:

```bash
cd c:\Users\nithi\Desktop\admin_mibo\mibo-admin
npm run build
```

---

## Contact

For questions or issues during testing:

- Check `FRONT_DESK_RBAC_IMPLEMENTATION.md` for implementation details
- Review console logs for debugging
- Check backend logs for API errors

---

**Testing Date**: ******\_******  
**Tester Name**: ******\_******  
**Overall Status**: ⬜ Pass / ⬜ Fail  
**Notes**: ******\_******
