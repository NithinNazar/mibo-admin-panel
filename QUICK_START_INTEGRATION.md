# Quick Start: Admin Panel Integration

## ✅ What's Working

- Login with username+password
- Login with phone+OTP
- Backend has 23 doctors, 3 centres
- Backend analytics endpoints exist

## 🎯 Quick Wins (Do These First)

### 1. Create API Services (Frontend)

Create these files in `mibo-admin/src/services/`:

**`cliniciansService.ts`**:

```typescript
import api from "./api";

export const getClinicians = async () => {
  const response = await api.get("/users", {
    params: { type: "STAFF" },
  });
  return response.data;
};
```

**`centresService.ts`**:

```typescript
import api from "./api";

export const getCentres = async () => {
  const response = await api.get("/centres");
  return response.data;
};
```

**`analyticsService.ts`**:

```typescript
import api from "./api";

export const getDashboardMetrics = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};
```

### 2. Update Dashboard Page

File: `mibo-admin/src/modules/dashboard/pages/DashboardPage.tsx`

Replace hardcoded data with:

```typescript
const [metrics, setMetrics] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchMetrics();
}, []);

const fetchMetrics = async () => {
  try {
    const data = await getDashboardMetrics();
    setMetrics(data);
  } catch (error) {
    toast.error("Failed to load dashboard");
  } finally {
    setLoading(false);
  }
};
```

### 3. Update Clinicians Page

File: `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`

Replace hardcoded data with:

```typescript
const [clinicians, setClinicians] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchClinicians();
}, []);

const fetchClinicians = async () => {
  try {
    const data = await getClinicians();
    setClinicians(data);
  } catch (error) {
    toast.error("Failed to load clinicians");
  } finally {
    setLoading(false);
  }
};
```

### 4. Update Centres Page

File: `mibo-admin/src/modules/centres/pages/CentresPage.tsx`

Replace hardcoded data with:

```typescript
const [centres, setCentres] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchCentres();
}, []);

const fetchCentres = async () => {
  try {
    const data = await getCentres();
    setCentres(data);
  } catch (error) {
    toast.error("Failed to load centres");
  } finally {
    setLoading(false);
  }
};
```

---

## 🔧 Backend Checks

### Verify These Endpoints Work:

```bash
# Test with your admin token
TOKEN="your_access_token_here"

# Dashboard metrics
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/analytics/dashboard

# Clinicians list
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users?type=STAFF

# Centres list
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/centres
```

---

## 📝 Implementation Order

1. ✅ Login working
2. 🔄 Create API service files (5 min)
3. 🔄 Update Dashboard (10 min)
4. 🔄 Update Clinicians list (10 min)
5. 🔄 Update Centres list (10 min)
6. ⏳ Test everything (5 min)

**Total Time**: ~40 minutes

---

## 🚀 Let's Start!

I'll now create the service files and update the pages to use real data.
