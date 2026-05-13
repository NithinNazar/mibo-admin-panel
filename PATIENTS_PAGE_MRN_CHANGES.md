# Remaining Changes for PatientsListPage.tsx

## Changes Completed:

1. ✅ Added `mrn: ""` to formData state initialization
2. ✅ Added sorting state variables (sortBy, sortOrder)
3. ✅ Updated handleOpenModal to include MRN in both edit and create modes

## Changes Still Needed:

### 1. Add MRN Input Field to Modal Form

Add this after the "Blood Group" input field (around line 550):

```tsx
<Input
  label="MRN (Medical Record Number)"
  type="text"
  placeholder="e.g., MRN-2024-00001"
  value={formData.mrn}
  onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
/>
```

### 2. Add MRN Column to Table

Add this column definition after the "name" column (around line 230):

```tsx
{
  key: "mrn",
  header: "MRN",
  render: (patient: Patient) => (
    <div className="text-slate-300 text-sm font-mono">
      {patient.mrn || (
        <span className="text-slate-500 italic">Not Assigned</span>
      )}
    </div>
  ),
},
```

### 3. Add Sorting Functionality

Add these functions after `handlePrint` function (around line 210):

```tsx
// Handle sorting
const handleSort = (field: "name" | "mrn" | "centre") => {
  if (sortBy === field) {
    // Toggle sort order
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
    setSortBy(field);
    setSortOrder("asc");
  }
};

// Apply sorting to filtered patients
const sortedPatients = React.useMemo(() => {
  if (!sortBy) return filteredPatients;

  return [...filteredPatients].sort((a, b) => {
    let aValue: string;
    let bValue: string;

    switch (sortBy) {
      case "name":
        aValue = a.fullName.toLowerCase();
        bValue = b.fullName.toLowerCase();
        break;
      case "mrn":
        aValue = a.mrn?.toLowerCase() || "";
        bValue = b.mrn?.toLowerCase() || "";
        break;
      case "centre":
        // Assuming centre info comes from upcoming appointments
        aValue = a.upcomingAppointments?.[0]?.centreName?.toLowerCase() || "";
        bValue = b.upcomingAppointments?.[0]?.centreName?.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
}, [filteredPatients, sortBy, sortOrder]);
```

### 4. Add Sort Buttons UI

Add this before the "Export Buttons" section (around line 430):

```tsx
{
  /* Sort Buttons */
}
<Card>
  <div className="flex items-center gap-3">
    <span className="text-sm text-slate-400">Sort by:</span>
    <div className="flex gap-2">
      <Button
        variant={sortBy === "name" ? "primary" : "secondary"}
        size="sm"
        onClick={() => handleSort("name")}
        className="flex items-center gap-1"
      >
        Name
        {sortBy === "name" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
      </Button>
      <Button
        variant={sortBy === "mrn" ? "primary" : "secondary"}
        size="sm"
        onClick={() => handleSort("mrn")}
        className="flex items-center gap-1"
      >
        MRN
        {sortBy === "mrn" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
      </Button>
      <Button
        variant={sortBy === "centre" ? "primary" : "secondary"}
        size="sm"
        onClick={() => handleSort("centre")}
        className="flex items-center gap-1"
      >
        Centre
        {sortBy === "centre" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
      </Button>
      {sortBy && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSortBy(null);
            setSortOrder("asc");
          }}
        >
          Clear Sort
        </Button>
      )}
    </div>
  </div>
</Card>;
```

### 5. Update Table Data Source

Change the Table component's data prop from `filteredPatients` to `sortedPatients`:

```tsx
<Table
  columns={columns}
  data={sortedPatients} // Changed from filteredPatients
  keyExtractor={(p) => p.userId}
/>
```

### 6. Update Export Functions

Update the CSV export to include MRN (around line 160):

```tsx
const csvData = filteredPatients.map((patient) => ({
  Name: patient.fullName,
  MRN: patient.mrn || "Not Assigned", // Add this line
  Phone: patient.phone,
  Email: patient.email || "N/A",
  // ... rest of fields
}));
```

Update PDF export to include MRN (around line 180):

```tsx
const headers = [
  "Name",
  "MRN", // Add this
  "Phone",
  "Email",
  // ... rest of headers
];
const rows = filteredPatients.map((patient) => [
  patient.fullName,
  patient.mrn || "Not Assigned", // Add this
  patient.phone,
  // ... rest of fields
]);
```

## Testing Checklist:

- [ ] MRN field appears in edit modal
- [ ] MRN can be entered and saved
- [ ] MRN displays in patient list table
- [ ] "Not Assigned" shows for patients without MRN
- [ ] Sorting by Name works
- [ ] Sorting by MRN works
- [ ] Sorting by Centre works
- [ ] Sort order toggles (asc/desc)
- [ ] Clear Sort button works
- [ ] MRN appears in CSV export
- [ ] MRN appears in PDF export
- [ ] MRN persists in database after save
