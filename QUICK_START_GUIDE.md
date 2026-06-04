# 🚀 Clinician Dashboard - Quick Start Guide

## ⚡ 1-Minute Setup

### Step 1: Verify Backend is Running

```bash
# Backend should already be running on port 5000
# Check terminal - you should see: "🚀 Server running on port 5000"
```

✅ **Status**: Backend is currently running!

### Step 2: Start Admin Panel

```bash
cd c:\Users\nithi\Desktop\admin_mibo\mibo-admin
npm run dev
```

### Step 3: Login as Clinician

- Open browser to admin panel URL (usually http://localhost:5173)
- Login with clinician credentials
- You'll be redirected to `/appointments` (new dashboard)

### Step 4: Test the Dashboard

✅ You should see:

- Stats boxes at top (Total, Waiting, Ongoing, etc.)
- Date filter dropdown (set to "Today" by default)
- List of appointments for today

---

## 🎯 Quick Feature Guide

### View Appointments

- **Default view**: Today's appointments
- **Change dates**: Click dropdown in top-right
  - Today
  - Last 7 days
  - Last 30 days

### Start a Session

1. Click on a **Pending** appointment (yellow/orange badge)
2. Start Session Modal opens
3. Review appointment details
4. Click **"Begin Session"** button
5. Ongoing Session Modal opens automatically

### During Session

1. Type notes in the **Session Notes** textarea
2. Click **"Clinician Note"** to save (saves periodically)
3. Optionally: Expand **"Schedule Follow-Up"** to set future date
4. Optionally: Expand **"Previous Session Notes"** to view history
5. Click **"Mark Complete"** when done

### View Patient Notes

- Click **"Patient Note"** button in any modal
- Shows notes patient added during booking

---

## 📊 Dashboard Stats Explained

| Box           | Meaning                        | Status       |
| ------------- | ------------------------------ | ------------ |
| **Total**     | All appointments in date range | All statuses |
| **Waiting**   | Pending to start               | BOOKED       |
| **Ongoing**   | Currently in progress          | IN_PROGRESS  |
| **Confirmed** | Confirmed by admin             | CONFIRMED    |
| **Completed** | Finished sessions              | COMPLETED    |
| **Cancelled** | Cancelled appointments         | CANCELLED    |

---

## 🔍 Troubleshooting

### "No appointments found"

- Check date filter (may be set to past dates)
- Verify appointments exist in database for this clinician
- Try "Last 30 days" filter

### "Clinician ID not found"

- Logout and login again
- Token may be expired or invalid

### Backend not responding

- Check if backend server is running
- Verify it's on port 5000: `netstat -ano | findstr :5000`
- Restart backend: `npm run dev` in backend folder

### Dashboard won't load

- Check browser console for errors (F12)
- Verify you're logged in as CLINICIAN role
- Clear browser cache and reload

---

## 📞 Quick Help

### Test a Full Session

```
1. Login → Dashboard loads
2. Click pending appointment → Start Session Modal
3. Click "Begin Session" → Ongoing Modal
4. Type notes → Click "Clinician Note" to save
5. Click "Mark Complete" → Dashboard refreshes
6. Verify appointment shows as "Completed" (green)
```

### Servers Running?

- **Backend**: Terminal shows "Server running on port 5000" ✅
- **Admin Panel**: Run `npm run dev` in mibo-admin folder

### Key Files Modified

- **Frontend**: `src/modules/clinician/` (new folder)
- **Backend**: `src/services/appointment.services.ts`
- **Database**: Migration already applied ✅

---

## ✅ Quick Checklist

Before testing:

- [ ] Backend running on port 5000
- [ ] Database migration applied (already done ✅)
- [ ] Admin panel started
- [ ] Logged in as clinician user
- [ ] Dashboard loads with appointments

During testing:

- [ ] Stats show correct counts
- [ ] Date filter works
- [ ] Can click appointment and see modal
- [ ] Can start session
- [ ] Can add and save notes
- [ ] Can view patient notes
- [ ] Can view previous session notes
- [ ] Can schedule follow-up
- [ ] Can mark complete
- [ ] Dashboard refreshes after completion

---

## 🎨 UI Reference

### Status Colors

- 🟡 **Yellow**: Waiting/Pending (BOOKED)
- 🔵 **Blue**: Confirmed
- 🟣 **Purple**: Ongoing (IN_PROGRESS)
- 🟢 **Green**: Completed
- 🔴 **Red**: Cancelled

### Modal Flow

```
Pending Appointment
   ↓ Click
Start Session Modal
   ↓ Begin Session
Ongoing Session Modal
   ↓ Mark Complete
Dashboard (appointment now green)
```

---

## 📖 Full Documentation

For detailed information, see:

- **Implementation Details**: `CLINICIAN_DASHBOARD_IMPLEMENTATION.md`
- **Complete Summary**: `IMPLEMENTATION_COMPLETE.md`
- **This Guide**: `QUICK_START_GUIDE.md`

---

## 🚀 You're All Set!

Everything is ready to go. Just start the admin panel and login as a clinician!

**Happy Testing!** 🎉
