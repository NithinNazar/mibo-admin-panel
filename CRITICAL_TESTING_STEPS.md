# CRITICAL: Testing Steps for Front Desk Filtering

## ⚠️ IMPORTANT: You MUST logout and login again!

The old user data in localStorage does NOT have the `assignedCentreId` field. You need to:

### Step 1: Clear Browser Data

**Option A: Clear localStorage (Recommended)**

1. Open browser console (F12)
2. Run this command:

```javascript
localStorage.clear();
location.reload();
```

**Option B: Logout**

1. Click on your profile/user menu
2. Click "Logout"
3. This will clear the old user data

### Step 2: Login Again

1. Login with your front desk credentials
2. The backend will now return the NEW user object with `assignedCentreId`

### Step 3: Check Console Logs

After login, open browser console (F12) and you should see:

```
[AuthContext] Login successful, user data: {...}
[AuthContext] User role: FRONT_DESK
[AuthContext] Assigned centre ID: <your-centre-id>
[AuthContext] Centre IDs: ["<your-centre-id>"]
```

**If you DON'T see "Assigned centre ID", the backend is not returning it!**

### Step 4: Navigate to Appointments Page

You should see in console:

```
[AllAppointmentsPage] Component initialized with user: {
  role: "FRONT_DESK",
  isFrontDesk: true,
  assignedCentreId: "<your-centre-id>",
  fullUser: {...}
}

[AllAppointmentsPage] Fetched data counts: {
  appointments: X,
  centres: Y,
  clinicians: Z
}

[AllAppointmentsPage] Filtering for front desk staff, assigned centre: <your-centre-id>
[AllAppointmentsPage] Filtered appointments: A
[AllAppointmentsPage] Filtered centres: 1
[AllAppointmentsPage] Filtered clinicians: B
```

### Step 5: Verify UI

**Page Header:**

- Title: "Centre Appointments" (not "All Appointments")
- Description: "View and manage bookings for [Your Centre Name]"

**Filters:**

- Centre dropdown: Should show ONLY your centre (disabled)
- Clinician dropdown: Should show ONLY clinicians from your centre
- Should NOT see "All Centres" or "All Clinicians" options

**Appointments Table:**

- Should show ONLY appointments from your centre
- Should NOT see appointments from other centres

### Step 6: Test Book Appointment

1. Click "Book New Appointment"
2. Check console:

```
[BookAppointmentPage] Component initialized with user: {
  role: "FRONT_DESK",
  isFrontDesk: true,
  assignedCentreId: "<your-centre-id>"
}

[BookAppointmentPage] fetchCentres: {
  isFrontDesk: true,
  assignedCentreId: "<your-centre-id>",
  totalCentres: X
}

[BookAppointmentPage] Filtered centres: 1
[BookAppointmentPage] Auto-selected centre: <your-centre-id>
```

3. Step 1 should show:
   - Your centre name in a highlighted box
   - Message: "Your assigned centre (automatically selected)"
   - Should NOT show other centres

## Troubleshooting

### Issue: Still seeing "All Centres" and all appointments

**Cause**: You're still using the old user data from localStorage

**Solution**:

```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem("user"));
console.log("Current user:", user);
console.log("Has assignedCentreId?", user.assignedCentreId);

// If assignedCentreId is undefined:
localStorage.clear();
location.reload();
// Then login again
```

### Issue: assignedCentreId is still undefined after fresh login

**Cause**: Backend might not be returning it

**Check**:

1. Backend is running the latest code (rebuilt with `npm run build`)
2. Check backend logs for any errors
3. Test the API directly:

```bash
# Login and check response
curl -X POST http://localhost:5000/api/auth/login/username-password \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}' \
  | jq '.data.user.assignedCentreId'

# Should return your centre ID, not null
```

### Issue: Console shows assignedCentreId but filtering not working

**Check ID types**:

```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem("user"));
console.log(
  "assignedCentreId:",
  user.assignedCentreId,
  typeof user.assignedCentreId,
);

// Then check an appointment:
// (You'll need to look at the network tab or appointments state)
// The centre_id should be the same type (both strings)
```

### Issue: Backend not returning assignedCentreId

**Verify database**:

```sql
-- Check the front desk user's centre assignment
SELECT u.id, u.full_name, u.phone, r.name as role, ur.centre_id
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.phone = '<front-desk-phone>'
  AND r.name = 'FRONT_DESK';

-- Should return one row with a centre_id
```

If centre_id is NULL, you need to assign a centre to the user:

```sql
-- Update user_roles to assign a centre
UPDATE user_roles
SET centre_id = <kochi-centre-id>
WHERE user_id = <front-desk-user-id>
  AND role_id = (SELECT id FROM roles WHERE name = 'FRONT_DESK');
```

## Quick Verification Script

Run this in browser console after login:

```javascript
// Check user data
const user = JSON.parse(localStorage.getItem("user"));
console.log("=== USER DATA CHECK ===");
console.log("Role:", user.role);
console.log("Is FRONT_DESK?", user.role === "FRONT_DESK");
console.log("assignedCentreId:", user.assignedCentreId);
console.log("centreIds:", user.centreIds);

if (user.role === "FRONT_DESK") {
  if (user.assignedCentreId) {
    console.log("✅ assignedCentreId is set correctly");
  } else {
    console.log(
      "❌ assignedCentreId is MISSING - You need to logout and login again!",
    );
  }
} else {
  console.log("ℹ️ User is not FRONT_DESK, filtering not applicable");
}
```

## Expected vs Actual

### BEFORE Fix (What you're seeing now):

- ❌ Centre dropdown: "All Centres"
- ❌ Clinician dropdown: "All Clinicians"
- ❌ Appointments: Shows Bangalore, Kochi, Mumbai
- ❌ Page title: "All Appointments"

### AFTER Fix (What you should see):

- ✅ Centre dropdown: "Kochi" (disabled)
- ✅ Clinician dropdown: Only Kochi clinicians
- ✅ Appointments: Only Kochi appointments
- ✅ Page title: "Centre Appointments"
- ✅ Description: "View and manage bookings for Kochi"

## Servers Status

Both servers must be running:

- ✅ Backend: http://localhost:5000 (RUNNING)
- ✅ Admin Panel: http://localhost:5174/admin/ (check if running)

## Final Checklist

- [ ] Backend rebuilt and restarted
- [ ] Admin panel running
- [ ] Logged out from admin panel
- [ ] Cleared localStorage
- [ ] Logged in again with front desk credentials
- [ ] Checked console logs for assignedCentreId
- [ ] Verified appointments page shows only assigned centre
- [ ] Verified book appointment shows only assigned centre
