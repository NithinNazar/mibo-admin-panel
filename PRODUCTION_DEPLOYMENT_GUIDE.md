# Production Deployment Guide - Front Desk Filtering

## Overview

This guide walks you through deploying the front desk staff filtering feature to production safely.

## Prerequisites

- [ ] Access to production database
- [ ] Backup of production database
- [ ] List of all front desk staff users and their assigned centres
- [ ] Admin panel code deployed to production
- [ ] Backend code deployed to production

## ⚠️ IMPORTANT: Backup First!

Before making ANY changes to production:

```bash
# Backup production database
mysqldump -u [username] -p [database_name] > backup_before_frontdesk_fix_$(date +%Y%m%d_%H%M%S).sql

# Or for PostgreSQL
pg_dump -U [username] [database_name] > backup_before_frontdesk_fix_$(date +%Y%m%d_%H%M%S).sql
```

## Deployment Steps

### Step 1: Identify Front Desk Staff in Production

Connect to production database and run:

```sql
-- List all front desk staff users
SELECT
    u.id as user_id,
    u.full_name,
    u.username,
    u.phone,
    ur.centre_id as current_centre_id,
    c.name as current_centre_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN centres c ON ur.centre_id = c.id
WHERE r.name = 'FRONT_DESK'
  AND u.is_active = TRUE
  AND ur.is_active = TRUE
ORDER BY u.id;
```

**Document the results:**

- User ID
- Username
- Full Name
- Which centre they should be assigned to

### Step 2: Review Available Centres

```sql
-- List all centres
SELECT id, name, city FROM centres ORDER BY id;
```

**Note the centre IDs:**

- Bangalore: ID = ?
- Kochi: ID = ?
- Mumbai: ID = ?

### Step 3: Choose Deployment Method

#### Option A: Automated Script (Recommended)

1. **Edit the script** `assign-centres-production.js`:

```javascript
const STAFF_CENTRE_MAPPING = {
  username1: "bangalore",
  username2: "kochi",
  username3: "mumbai",
  // Add all your front desk staff here
};
```

2. **Run in dry-run mode** (preview changes):

```bash
cd /path/to/backend
node assign-centres-production.js --dry-run
```

3. **Review the output** carefully

4. **Apply changes** if everything looks correct:

```bash
node assign-centres-production.js --apply
```

#### Option B: Manual SQL (For Small Number of Users)

Use the migration file `migrations/assign_centres_to_frontdesk_staff.sql`:

1. **Run STEP 1 and STEP 2** (read-only queries)
2. **Review the output**
3. **Uncomment and modify STEP 3** UPDATE statements
4. **Run the UPDATE statements** one by one
5. **Run STEP 4** to verify

Example:

```sql
-- Assign Kochi centre (ID: 2) to user ID 110
UPDATE user_roles
SET centre_id = 2, updated_at = NOW()
WHERE user_id = 110
  AND role_id = (SELECT id FROM roles WHERE name = 'FRONT_DESK')
  AND centre_id IS NULL;
```

### Step 4: Verify Database Changes

After applying changes, verify:

```sql
-- Should return 0 rows (all front desk staff have centres)
SELECT
    u.id as user_id,
    u.full_name,
    u.username
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'FRONT_DESK'
  AND u.is_active = TRUE
  AND ur.is_active = TRUE
  AND ur.centre_id IS NULL;
```

### Step 5: Deploy Frontend Code

1. **Build the admin panel:**

```bash
cd /path/to/admin-panel
npm run build
```

2. **Deploy the build** to your production server

3. **Clear CDN cache** if using one

### Step 6: Test in Production

1. **Login as a front desk staff user**
2. **Navigate to Appointments page**
3. **Verify:**
   - ✅ Only appointments from assigned centre are shown
   - ✅ Centre filter is disabled and shows only assigned centre
   - ✅ Clinician filter shows only clinicians from assigned centre
4. **Navigate to Book Appointment page**
5. **Verify:**
   - ✅ Only assigned centre is shown (auto-selected)
   - ✅ Only clinicians from assigned centre are available
6. **Test booking an appointment**
7. **Test all other features** (search, filter, export, etc.)

### Step 7: Monitor for Issues

After deployment, monitor:

- User login issues
- Appointment viewing issues
- Booking failures
- Error logs in backend
- Browser console errors

## Rollback Plan

If something goes wrong:

### Rollback Database Changes

```sql
-- Remove centre assignments from front desk staff
UPDATE user_roles
SET centre_id = NULL, updated_at = NOW()
WHERE role_id = (SELECT id FROM roles WHERE name = 'FRONT_DESK')
  AND centre_id IS NOT NULL;
```

### Rollback Frontend Code

1. Deploy previous version of admin panel
2. Clear CDN cache

### Restore from Backup

If major issues occur:

```bash
# Restore from backup
mysql -u [username] -p [database_name] < backup_before_frontdesk_fix_YYYYMMDD_HHMMSS.sql

# Or for PostgreSQL
psql -U [username] [database_name] < backup_before_frontdesk_fix_YYYYMMDD_HHMMSS.sql
```

## Common Issues and Solutions

### Issue 1: Front desk staff sees all centres

**Cause**: Centre not assigned in database  
**Solution**: Run the assignment script or SQL queries

### Issue 2: assignedCentreId is undefined

**Cause**: User has no centre in `user_roles.centre_id`  
**Solution**: Check database and assign centre

### Issue 3: Filtering not working after login

**Cause**: Browser cache  
**Solution**: Ask users to clear cache or hard refresh (Ctrl+Shift+R)

### Issue 4: Cannot book appointments

**Cause**: No clinicians at assigned centre  
**Solution**: Verify clinicians are assigned to the correct centre

## Post-Deployment Checklist

- [ ] Database backup created
- [ ] All front desk staff have centres assigned
- [ ] Verification queries return expected results
- [ ] Frontend code deployed
- [ ] Tested with at least one front desk user per centre
- [ ] All features working (view, book, cancel, export)
- [ ] No errors in backend logs
- [ ] No errors in browser console
- [ ] Users notified of the change
- [ ] Documentation updated

## Communication Template

Send this to front desk staff after deployment:

---

**Subject: Admin Panel Update - Centre-Based Access**

Hi Team,

We've updated the admin panel to improve your experience. Here's what's new:

**What Changed:**

- You now see only appointments and clinicians from your assigned centre
- The centre filter is automatically set to your centre
- When booking appointments, your centre is pre-selected

**What This Means:**

- Faster loading times
- Easier to find relevant appointments
- Less clutter in your view

**Action Required:**

- Clear your browser cache (Ctrl+Shift+Delete)
- Login again to see the changes

**Need Help?**
Contact IT support if you have any issues.

---

## Support Contacts

- **Database Issues**: [DBA Contact]
- **Frontend Issues**: [Frontend Team Contact]
- **Backend Issues**: [Backend Team Contact]
- **User Issues**: [Support Team Contact]

## Files Reference

### Scripts

- `assign-centres-production.js` - Automated assignment script
- `check-and-fix-frontdesk.js` - Development testing script

### SQL Files

- `migrations/assign_centres_to_frontdesk_staff.sql` - Manual SQL migration
- `verify-frontdesk-user.sql` - Verification queries

### Documentation

- `FRONT_DESK_FILTERING_IMPLEMENTATION.md` - Technical implementation details
- `FRONT_DESK_FILTERING_FIX.md` - Original fix documentation
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - This file

## Timeline Estimate

- **Backup**: 5-10 minutes
- **Identify Users**: 10-15 minutes
- **Run Script/SQL**: 5-10 minutes
- **Verify**: 5-10 minutes
- **Deploy Frontend**: 10-20 minutes
- **Testing**: 15-30 minutes
- **Total**: 50-95 minutes

## Success Criteria

✅ All front desk staff have centres assigned in database  
✅ No front desk staff can see other centres' data  
✅ All booking and viewing features work correctly  
✅ No errors in logs  
✅ Users can successfully login and use the system  
✅ Performance is acceptable

## Notes

- This is a **breaking change** for front desk staff without centre assignments
- Users MUST have a centre assigned or they won't see any data
- The feature is **backwards compatible** for ADMIN and MANAGER roles
- No changes needed for clinician or patient users
