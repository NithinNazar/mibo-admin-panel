# Front Desk Feature - Deployment Checklist

## Pre-Deployment Checklist

### Database

- [ ] Backup current database
- [ ] Run migration: `ensure_front_desk_support.sql`
- [ ] Verify FRONT_DESK role exists (ID: 6)
- [ ] Verify all tables exist: users, roles, user_roles, staff_profiles, centre_staff_assignments
- [ ] Verify indexes created successfully
- [ ] Test database connection

### Backend

- [ ] Pull latest code changes
- [ ] Install dependencies: `npm install`
- [ ] Check TypeScript compilation: `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Check environment variables
- [ ] Restart backend server
- [ ] Verify server starts without errors
- [ ] Check logs for any warnings

### Frontend (Admin Panel)

- [ ] Pull latest code changes
- [ ] Install dependencies: `npm install`
- [ ] Check TypeScript compilation: `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Verify no console errors in browser
- [ ] Clear browser cache
- [ ] Test in different browsers (Chrome, Firefox, Safari)

---

## Functional Testing Checklist

### 1. Admin - Create Front Desk Staff

- [ ] Login as ADMIN
- [ ] Navigate to Staff → Front Desk
- [ ] Click "Add Front Desk Staff"
- [ ] Test validation:
  - [ ] Empty fields show error
  - [ ] Invalid phone format shows error
  - [ ] Short password shows error
  - [ ] Invalid username shows error
- [ ] Create staff with valid data
- [ ] Verify success message
- [ ] Verify staff appears in table
- [ ] Verify staff has correct centre assignment

### 2. Admin - View Staff Details

- [ ] Click "View" button on a staff member
- [ ] Verify modal opens
- [ ] Verify all fields display correctly:
  - [ ] Full Name
  - [ ] Phone Number
  - [ ] Email
  - [ ] Username
  - [ ] Centre
  - [ ] Status badge
- [ ] Click copy button for username
- [ ] Verify "copied to clipboard" message
- [ ] Paste to verify username was copied
- [ ] Close modal

### 3. Admin - Edit Staff Details

- [ ] Click "Edit" button on a staff member
- [ ] Verify modal opens with pre-filled data
- [ ] Test editing each field:
  - [ ] Change full name
  - [ ] Change phone number
  - [ ] Change email
  - [ ] Change username
  - [ ] Leave password blank (should keep current)
  - [ ] Change centre assignment
- [ ] Click "Update Staff"
- [ ] Verify success message
- [ ] Click "View" to verify changes
- [ ] Verify updated data displays correctly

### 4. Admin - Update Password

- [ ] Click "Edit" on a staff member
- [ ] Enter new password
- [ ] Click "Update Staff"
- [ ] Verify success message
- [ ] Logout
- [ ] Login with staff member's username and NEW password
- [ ] Verify successful login

### 5. Admin - Toggle Active/Inactive

- [ ] Toggle staff to "Inactive"
- [ ] Verify checkbox unchecked
- [ ] Verify status badge shows "Inactive"
- [ ] Logout
- [ ] Try to login with inactive staff credentials
- [ ] Verify login fails with "Account inactive" message
- [ ] Login as ADMIN
- [ ] Toggle staff back to "Active"
- [ ] Logout
- [ ] Login with staff credentials
- [ ] Verify successful login

### 6. Front Desk - Login

- [ ] Logout from admin
- [ ] Go to login page
- [ ] Enter front desk username
- [ ] Enter front desk password
- [ ] Click "Login"
- [ ] Verify successful login
- [ ] Verify redirected to dashboard

### 7. Front Desk - Navigation

After logging in as front desk staff, verify sidebar shows:

- [ ] Dashboard
- [ ] Patients
- [ ] Appointments
- [ ] Book Appointment
- [ ] Slot Management
- [ ] Centres
- [ ] Profile
- [ ] Support

Verify sidebar DOES NOT show:

- [ ] Staff section (Managers, Clinicians, etc.)
- [ ] Settings

### 8. Front Desk - Book Appointment

- [ ] Click "Book Appointment"
- [ ] Step 1: Select Centre
  - [ ] Verify centres load
  - [ ] Select a centre
- [ ] Step 2: Select Clinician
  - [ ] Verify clinicians load for selected centre
  - [ ] Select a clinician
- [ ] Step 3: Select Date
  - [ ] Verify calendar displays
  - [ ] Verify dates with availability are highlighted
  - [ ] Select a date
- [ ] Step 4: Select Time Slot
  - [ ] Verify time slots load
  - [ ] Verify available/booked status
  - [ ] Select an available slot
- [ ] Step 5: Select Patient
  - [ ] Test searching existing patient
  - [ ] Test creating new patient
  - [ ] Select/create patient
- [ ] Step 6: Add Notes (optional)
  - [ ] Add appointment notes
- [ ] Step 7: Confirm Booking
  - [ ] Review booking details
  - [ ] Click "Confirm"
  - [ ] Verify success message
- [ ] Navigate to Appointments
- [ ] Verify appointment appears in list

### 9. Front Desk - View Appointments

- [ ] Navigate to Appointments
- [ ] Verify appointments list loads
- [ ] Verify can see appointment details
- [ ] Verify can filter appointments
- [ ] Verify can search appointments

### 10. Front Desk - Access Restrictions

Try to access admin-only pages:

- [ ] Try to access /staff/managers
  - [ ] Verify redirected or access denied
- [ ] Try to access /staff/clinicians
  - [ ] Verify redirected or access denied
- [ ] Try to access /settings
  - [ ] Verify redirected or access denied

---

## Edge Cases Testing

### Duplicate Prevention

- [ ] Try to create staff with existing phone number
  - [ ] Verify error message
- [ ] Try to create staff with existing username
  - [ ] Verify error message
- [ ] Try to update staff with another staff's phone
  - [ ] Verify error message
- [ ] Try to update staff with another staff's username
  - [ ] Verify error message

### Validation

- [ ] Try phone with less than 10 digits
  - [ ] Verify error
- [ ] Try phone starting with 0-5
  - [ ] Verify error
- [ ] Try password with less than 8 characters
  - [ ] Verify error
- [ ] Try username with special characters
  - [ ] Verify error
- [ ] Try invalid email format
  - [ ] Verify error

### Concurrent Operations

- [ ] Create staff in one browser tab
- [ ] Edit same staff in another tab
- [ ] Verify data consistency
- [ ] Verify no race conditions

### Session Management

- [ ] Login as front desk staff
- [ ] Wait for token expiration (if configured)
- [ ] Try to perform action
- [ ] Verify token refresh works OR redirects to login

---

## Performance Testing

### Load Times

- [ ] Front Desk page loads in < 2 seconds
- [ ] Staff list loads in < 1 second
- [ ] Create modal opens instantly
- [ ] Edit modal opens in < 500ms
- [ ] View details modal opens instantly

### API Response Times

- [ ] POST /api/users/front-desk < 500ms
- [ ] GET /api/users?roleId=6 < 300ms
- [ ] PUT /api/users/:id < 500ms
- [ ] POST /api/auth/login/username-password < 300ms
- [ ] POST /api/booking/front-desk < 1000ms

---

## Security Testing

### Authentication

- [ ] Cannot access endpoints without token
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected
- [ ] Logout invalidates tokens

### Authorization

- [ ] Front desk cannot access admin endpoints
- [ ] Front desk cannot create other staff
- [ ] Front desk cannot edit other staff
- [ ] Front desk cannot access settings

### Password Security

- [ ] Passwords are hashed in database
- [ ] Passwords never returned in API responses
- [ ] Password field is type="password" in forms
- [ ] Old password cannot be reused (if policy exists)

### Input Sanitization

- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are blocked
- [ ] Special characters are handled correctly

---

## Browser Compatibility

Test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Rollback Plan

If issues are found:

### 1. Database Rollback

```sql
-- Remove FRONT_DESK role
UPDATE user_roles SET is_active = FALSE WHERE role_id = 6;
DELETE FROM roles WHERE id = 6;
```

### 2. Code Rollback

```bash
# Revert frontend changes
cd admin_mibo/mibo-admin
git revert <commit-hash>

# Revert backend changes
cd backend_mibo/backend
git revert <commit-hash>

# Restart servers
npm run dev
```

---

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error logs
- [ ] Monitor API response times
- [ ] Monitor database performance
- [ ] Check for any user-reported issues
- [ ] Verify no increase in error rates

### First Week

- [ ] Collect user feedback
- [ ] Monitor usage patterns
- [ ] Check for any edge cases
- [ ] Verify data integrity
- [ ] Review security logs

---

## Documentation Verification

- [ ] FRONT_DESK_FEATURE_IMPLEMENTATION.md is complete
- [ ] QUICK_START_FRONT_DESK.md is accurate
- [ ] IMPLEMENTATION_SUMMARY.md is up to date
- [ ] FRONT_DESK_FLOW_DIAGRAM.md is clear
- [ ] API documentation is updated
- [ ] Database schema documentation is updated

---

## Sign-Off

### Development Team

- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Ready for QA

**Developer:** ******\_\_\_\_****** **Date:** ****\_\_****

### QA Team

- [ ] All test cases passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for staging

**QA Lead:** ******\_\_\_\_****** **Date:** ****\_\_****

### Product Owner

- [ ] Features meet requirements
- [ ] User experience acceptable
- [ ] Ready for production

**Product Owner:** ******\_\_\_\_****** **Date:** ****\_\_****

---

## Deployment Steps

### 1. Backup

```bash
# Backup database
pg_dump -U username database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Deploy Backend

```bash
cd backend_mibo/backend
git pull origin main
npm install
npm run build
pm2 restart backend  # or your process manager
```

### 3. Run Migration

```bash
psql -U username -d database_name -f migrations/ensure_front_desk_support.sql
```

### 4. Deploy Frontend

```bash
cd admin_mibo/mibo-admin
git pull origin main
npm install
npm run build
# Deploy build to hosting
```

### 5. Verify Deployment

- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] Can create front desk staff
- [ ] Can login as front desk staff
- [ ] Can book appointments

---

## Emergency Contacts

**Backend Developer:** ******\_\_\_\_******
**Frontend Developer:** ******\_\_\_\_******
**Database Admin:** ******\_\_\_\_******
**DevOps:** ******\_\_\_\_******
**Product Owner:** ******\_\_\_\_******

---

**Deployment Date:** ****\_\_****
**Deployed By:** ******\_\_\_\_******
**Status:** ☐ Success ☐ Partial ☐ Rollback Required

**Notes:**

---

---

---
