# Clinician Creation Fix ✅

## Date: January 30, 2026

## Issue

When trying to create a clinician from the admin panel, the API returned a **400 Bad Request** error.

### Error in Browser Console

```
POST https://api.mibo.care/api/clinicians 400 (Bad Request)
```

## Root Cause

The frontend was missing the `centre_ids` field when creating a clinician.

When creating a clinician with a new user, the backend requires:

1. User data (name, phone, password, etc.)
2. **`centre_ids`** - Array of centre IDs the user is assigned to
3. **`role_ids`** - Array of role IDs (Clinician = 2)
4. Clinician-specific data (specialization, etc.)

The frontend was only sending `primary_centre_id` but not `centre_ids`.

## Solution

Added `centre_ids` array to the clinician creation payload.

### File Changed

`mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`

### Change Made

```typescript
// Before
const createData = {
  full_name: formData.full_name,
  phone: formData.phone,
  email: formData.email || undefined,
  password: formData.password,
  role_ids: [2], // Clinician role ID
  // ❌ Missing centre_ids
  primary_centre_id: formData.primaryCentreId,
  // ... other fields
};

// After
const createData = {
  full_name: formData.full_name,
  phone: formData.phone,
  email: formData.email || undefined,
  password: formData.password,
  role_ids: [2], // Clinician role ID
  centre_ids: [formData.primaryCentreId], // ✅ Added
  primary_centre_id: formData.primaryCentreId,
  // ... other fields
};
```

## Why This Was Needed

The backend validation (`backend/src/validations/staff.validation.ts`) requires:

```typescript
if (
  !body.centre_ids ||
  !Array.isArray(body.centre_ids) ||
  body.centre_ids.length === 0
) {
  throw ApiError.badRequest("At least one centre must be assigned");
}
```

Without `centre_ids`, the validation fails and returns 400 Bad Request.

## Build Status

✅ **Build Successful**: Admin panel rebuilt with the fix
✅ **Ready to Deploy**: New `dist/` folder ready

## Deployment

Upload the new `mibo-admin/dist/` folder to your hosting:

```bash
cd mibo-admin
aws s3 sync dist/ s3://your-bucket-name/admin/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/admin/*"
```

## Testing

After deployment:

1. Login to admin panel at `mibo.care/admin`
2. Go to Staff > Clinicians
3. Click "Add Clinician"
4. Fill in all required fields
5. Click "Create Clinician"
6. ✅ Should create successfully (no more 400 error)

## Other Staff Types

Other staff types (Manager, Centre Manager, Care Coordinator, Front Desk) use different API endpoints and don't have this issue:

- Managers: `/users/managers`
- Centre Managers: `/users/centre-managers`
- Care Coordinators: `/users/care-coordinators`
- Front Desk: `/users/front-desk`

Only clinicians use `/api/clinicians` endpoint which requires the `centre_ids` field.

## Summary

✅ Fixed clinician creation 400 error
✅ Added missing `centre_ids` field
✅ Admin panel rebuilt and ready to deploy

Upload the new `dist/` folder and clinician creation will work!
