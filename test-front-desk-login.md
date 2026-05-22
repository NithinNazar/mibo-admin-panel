# Test Front Desk Login

## Quick Test in Browser Console

After logging in as front desk staff, run these commands in the browser console:

```javascript
// 1. Check localStorage for user data
const user = JSON.parse(localStorage.getItem("user"));
console.log("User from localStorage:", user);
console.log("Role:", user.role);
console.log("Assigned Centre ID:", user.assignedCentreId);
console.log("Centre IDs:", user.centreIds);

// 2. Check if assignedCentreId is set
if (user.assignedCentreId) {
  console.log("✅ assignedCentreId is set:", user.assignedCentreId);
} else {
  console.log("❌ assignedCentreId is NOT set");
}

// 3. Check if role is FRONT_DESK
if (user.role === "FRONT_DESK") {
  console.log("✅ User role is FRONT_DESK");
} else {
  console.log("❌ User role is:", user.role);
}
```

## Expected Output

For a front desk user assigned to Kochi:

```javascript
{
  id: "123",
  name: "Front Desk User",
  email: "frontdesk@example.com",
  phone: "9876543210",
  username: "kochi_frontdesk",
  role: "FRONT_DESK",
  avatar: null,
  centreIds: ["<kochi-centre-id>"],
  assignedCentreId: "<kochi-centre-id>",  // ✅ This should be present
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## Test API Endpoint Directly

You can also test the backend API directly:

```bash
# 1. Login and get token
curl -X POST http://localhost:5000/api/auth/login/username-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kochi_frontdesk",
    "password": "your_password"
  }'

# Response should include:
# {
#   "success": true,
#   "data": {
#     "user": {
#       "id": "123",
#       "role": "FRONT_DESK",
#       "assignedCentreId": "<kochi-centre-id>",  <-- Check this
#       ...
#     },
#     "accessToken": "...",
#     "refreshToken": "..."
#   }
# }

# 2. Test /auth/me endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-access-token>"

# Response should include assignedCentreId
```

## Verification Checklist

- [ ] Backend server is running (port 5000)
- [ ] Admin panel is running (port 5174)
- [ ] Browser localStorage is cleared before login
- [ ] Logged in as front desk user
- [ ] Console shows user data with assignedCentreId
- [ ] Appointments page shows only assigned centre's data
- [ ] Centre filter is disabled and shows only assigned centre
- [ ] Clinician filter shows only assigned centre's clinicians

## Common Issues

### assignedCentreId is undefined

**Cause**: Backend not returning the field

**Fix**:

1. Ensure backend is rebuilt: `cd backend && npm run build`
2. Restart backend server
3. Clear browser cache and localStorage
4. Login again

### Filtering not working

**Cause**: ID type mismatch (string vs number)

**Check**:

```javascript
// In browser console
const user = JSON.parse(localStorage.getItem("user"));
console.log("assignedCentreId type:", typeof user.assignedCentreId);
console.log("assignedCentreId value:", user.assignedCentreId);

// Then check appointments
fetch("http://localhost:5000/api/appointments", {
  headers: {
    Authorization: "Bearer " + localStorage.getItem("accessToken"),
  },
})
  .then((r) => r.json())
  .then((data) => {
    console.log("Sample appointment centre_id:", data.data[0]?.centre_id);
    console.log("centre_id type:", typeof data.data[0]?.centre_id);
  });
```

Both should be strings for comparison to work.
