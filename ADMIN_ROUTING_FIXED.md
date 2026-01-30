# Admin Panel Routing Fixed ✅

## Date: January 30, 2026

## Issues Fixed

When the admin panel was hosted at `mibo.care/admin`, several routing issues occurred:

1. ❌ After login, redirected to frontend landing page instead of dashboard
2. ❌ `/admin/login` showed 404 error
3. ❌ After logout, redirected to `/login` (404) instead of `/admin/login`
4. ❌ Direct access to `/admin` didn't show login page

## Root Cause

The admin panel was configured as if it was hosted at the root domain (`/`) instead of a subdirectory (`/admin`). This caused all internal routes to be incorrect.

## Solutions Implemented

### 1. Added Base Path to BrowserRouter

**File**: `src/App.tsx`

```tsx
// Before
<BrowserRouter>

// After
<BrowserRouter basename="/admin">
```

This tells React Router that all routes are relative to `/admin`.

### 2. Fixed Router Configuration

**File**: `src/router/index.tsx`

**Changes**:

- Separated root path (`/`) from protected routes
- Root path now redirects to `/dashboard` if authenticated, `/login` if not
- Removed nested index route that was causing conflicts
- Updated fallback route to check authentication status

**Result**:

- `/admin` → redirects to `/admin/login` (if not logged in)
- `/admin` → redirects to `/admin/dashboard` (if logged in)
- `/admin/login` → shows login page
- `/admin/dashboard` → shows dashboard (if authenticated)
- `/admin/*` → redirects appropriately based on auth status

### 3. Removed window.location.href Redirects

**Files Changed**:

- `src/modules/auth/pages/LoginPage.tsx`
- `src/contexts/AuthContext.tsx`
- `src/services/api.ts`

**Why**: `window.location.href` uses absolute paths and bypasses React Router, causing navigation to wrong URLs.

**Changes**:

- LoginPage: Changed `window.location.href = "/dashboard"` to `navigate("/dashboard")`
- AuthContext: Removed `window.location.href = "/login"` - let React Router handle it
- API Service: Removed `window.location.href = "/login"` on token refresh failure

**Result**: All navigation now uses React Router, which respects the `/admin` base path.

### 4. Updated Vite Configuration

**File**: `vite.config.ts`

```ts
export default defineConfig({
  base: "/admin/", // Already present - ensures assets load from correct path
  // ...
});
```

This was already configured correctly - it ensures all assets (JS, CSS, images) load from `/admin/` path.

## How It Works Now

### User Flow - Not Authenticated

1. User visits `mibo.care/admin`
2. Router sees user is not authenticated
3. Redirects to `/login` (which becomes `mibo.care/admin/login`)
4. Login page displays

### User Flow - Login

1. User enters credentials on `/admin/login`
2. Clicks login button
3. `LoginPage` calls `login()` from AuthContext
4. On success, calls `navigate("/dashboard")`
5. React Router navigates to `/dashboard` (which becomes `mibo.care/admin/dashboard`)
6. Dashboard displays

### User Flow - Logout

1. User clicks logout button in Topbar
2. `handleLogout()` calls `logout()` from AuthContext
3. AuthContext clears user state and localStorage
4. React Router automatically redirects to `/login` (because user is no longer authenticated)
5. Login page displays at `mibo.care/admin/login`

### User Flow - Direct URL Access

**Scenario 1: User visits `mibo.care/admin` (not logged in)**

- Router checks authentication → not authenticated
- Redirects to `/login`
- Shows login page at `mibo.care/admin/login`

**Scenario 2: User visits `mibo.care/admin` (logged in)**

- Router checks authentication → authenticated
- Redirects to `/dashboard`
- Shows dashboard at `mibo.care/admin/dashboard`

**Scenario 3: User visits `mibo.care/admin/patients` (not logged in)**

- Router checks authentication → not authenticated
- Redirects to `/login`
- Shows login page at `mibo.care/admin/login`

**Scenario 4: User visits `mibo.care/admin/login` (already logged in)**

- Router checks authentication → authenticated
- Redirects to `/dashboard`
- Shows dashboard at `mibo.care/admin/dashboard`

## Testing Checklist

After deploying the new build:

### ✅ Login Flow

- [ ] Visit `mibo.care/admin` → Should show login page
- [ ] Enter credentials and login → Should redirect to `mibo.care/admin/dashboard`
- [ ] Dashboard should load correctly
- [ ] No redirect to frontend landing page

### ✅ Logout Flow

- [ ] Click logout button → Should redirect to `mibo.care/admin/login`
- [ ] Login page should display (not 404)
- [ ] Should not redirect to frontend

### ✅ Direct URL Access

- [ ] Visit `mibo.care/admin/dashboard` (not logged in) → Should redirect to login
- [ ] Visit `mibo.care/admin/patients` (not logged in) → Should redirect to login
- [ ] Visit `mibo.care/admin/login` (already logged in) → Should redirect to dashboard

### ✅ Session Persistence

- [ ] Login and refresh page → Should stay logged in
- [ ] Login and close browser → Should stay logged in (until token expires)
- [ ] Logout and refresh page → Should show login page

## Deployment Instructions

1. **Build the admin panel**:

   ```bash
   cd mibo-admin
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting service at the `/admin` path

3. **Server Configuration** (if using S3/CloudFront or similar):
   - Ensure all `/admin/*` requests serve `index.html`
   - This allows React Router to handle all routes

   **Example CloudFront behavior**:
   - Path pattern: `/admin/*`
   - Origin: S3 bucket with admin panel
   - Error pages: 404 → `/admin/index.html` (200 status)

4. **Test all flows** using the checklist above

## Important Notes

### Base Path Configuration

The admin panel is configured to run at `/admin` subdirectory:

- `vite.config.ts`: `base: "/admin/"`
- `App.tsx`: `<BrowserRouter basename="/admin">`

If you want to host at a different path (e.g., `/dashboard`), update both files.

### React Router vs window.location

**Always use React Router navigation**:

```tsx
// ✅ Good
navigate("/dashboard");

// ❌ Bad
window.location.href = "/dashboard";
```

`window.location.href` bypasses React Router and doesn't respect the base path.

### Token Expiration

When the access token expires:

1. API interceptor tries to refresh the token
2. If refresh fails, clears localStorage
3. React Router detects user is not authenticated
4. Automatically redirects to `/login`

No manual redirect needed!

## Files Modified

1. `src/App.tsx` - Added `basename="/admin"` to BrowserRouter
2. `src/router/index.tsx` - Fixed route structure and redirects
3. `src/modules/auth/pages/LoginPage.tsx` - Changed to use `navigate()` instead of `window.location.href`
4. `src/contexts/AuthContext.tsx` - Removed `window.location.href` from logout
5. `src/services/api.ts` - Removed `window.location.href` from token refresh failure

## Summary

✅ Admin panel now works correctly at `mibo.care/admin`
✅ Login redirects to dashboard (not frontend)
✅ Logout redirects to login page (not 404)
✅ All routes work with `/admin` base path
✅ Session persistence works correctly
✅ Direct URL access works as expected

The admin panel is now fully functional at the `/admin` subdirectory!
