# Deploy Admin Panel - Quick Guide 🚀

## ✅ Status: READY TO DEPLOY

The admin panel has been rebuilt with all routing fixes!

---

## 📦 What Changed

- ✅ Fixed routing for `/admin` subdirectory
- ✅ Login now redirects to dashboard (not frontend)
- ✅ Logout now redirects to login page (not 404)
- ✅ All navigation uses React Router (no more window.location issues)

---

## 🚀 Deploy Now

### Step 1: Upload the dist/ folder

Upload the contents of `mibo-admin/dist/` to your hosting service at the `/admin` path.

**AWS S3 Example**:

```bash
aws s3 sync dist/ s3://your-bucket-name/admin/ --delete
```

**Vercel/Netlify**:

- Deploy the `dist/` folder
- Configure base path as `/admin`

### Step 2: Configure Server (if needed)

If using S3/CloudFront, ensure all `/admin/*` requests serve `index.html`:

**CloudFront Error Pages**:

- 404 → `/admin/index.html` (return 200)
- 403 → `/admin/index.html` (return 200)

This allows React Router to handle all routes.

### Step 3: Clear Cache

If using CloudFront:

```bash
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/admin/*"
```

---

## ✅ Test After Deployment

### Test 1: Login Flow

1. Visit `mibo.care/admin`
2. Should show login page ✅
3. Enter admin credentials
4. Should redirect to `mibo.care/admin/dashboard` ✅
5. Dashboard should load (not frontend landing page) ✅

### Test 2: Logout Flow

1. Click logout button
2. Should redirect to `mibo.care/admin/login` ✅
3. Login page should display (not 404) ✅

### Test 3: Direct URL

1. Visit `mibo.care/admin/patients` (not logged in)
2. Should redirect to login ✅

### Test 4: Session Persistence

1. Login and refresh page
2. Should stay logged in ✅

---

## 🐛 Troubleshooting

### Issue: Still redirecting to frontend after login

**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: 404 on /admin/login

**Solution**: Check server configuration - ensure `/admin/*` serves `index.html`

### Issue: Assets not loading

**Solution**: Verify `base: "/admin/"` in `vite.config.ts` and rebuild

---

## 📝 Summary

All routing issues are fixed:

- ✅ Login → Dashboard (correct)
- ✅ Logout → Login page (correct)
- ✅ Direct URLs work (correct)
- ✅ Session persistence works (correct)

Just deploy the new `dist/` folder and test!
