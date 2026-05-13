# MRN Feature - Testing Guide

## Quick Start Testing

### Prerequisites

1. ✅ Backend server running with migration applied
2. ✅ Admin panel built and running
3. ✅ Logged in as admin user

---

## Test Scenarios

### 1. Create Patient with MRN

**Steps:**

1. Navigate to Patients page
2. Click "Add Patient" button
3. Fill in required fields (Name, Phone)
4. Scroll down to "MRN (Medical Record Number)" field
5. Enter: `MRN-2024-00001`
6. Click "Create Patient"

**Expected Result:**

- ✅ Patient created successfully
- ✅ Toast notification: "Patient created successfully"
- ✅ Patient appears in table with MRN displayed

---

### 2. Create Patient without MRN

**Steps:**

1. Click "Add Patient" button
2. Fill in required fields (Name, Phone)
3. Leave MRN field empty
4. Click "Create Patient"

**Expected Result:**

- ✅ Patient created successfully
- ✅ MRN column shows "Not Assigned" in italic gray text

---

### 3. Edit Patient to Add MRN

**Steps:**

1. Find patient without MRN (shows "Not Assigned")
2. Click Edit button (pencil icon)
3. Scroll to MRN field
4. Enter: `P12345`
5. Click "Update Patient"

**Expected Result:**

- ✅ Patient updated successfully
- ✅ MRN now displays `P12345` in table
- ✅ "Not Assigned" replaced with actual MRN

---

### 4. Edit Patient to Change MRN

**Steps:**

1. Find patient with existing MRN
2. Click Edit button
3. Change MRN to: `MRN-2024-99999`
4. Click "Update Patient"

**Expected Result:**

- ✅ Patient updated successfully
- ✅ New MRN displays in table

---

### 5. Test MRN Display

**Steps:**

1. Look at the patient table
2. Find the MRN column (second column after Patient name)

**Expected Result:**

- ✅ MRN column visible
- ✅ MRN values displayed in monospace font
- ✅ Empty MRNs show "Not Assigned" in italic gray

---

### 6. Sort by Name

**Steps:**

1. Locate "Sort by:" section above Export buttons
2. Click "Name" button
3. Observe table order
4. Click "Name" button again

**Expected Result:**

- ✅ First click: Patients sorted A-Z (↑ indicator)
- ✅ Second click: Patients sorted Z-A (↓ indicator)
- ✅ "Name" button highlighted in teal color

---

### 7. Sort by MRN

**Steps:**

1. Click "MRN" button in sort section
2. Observe table order
3. Click "MRN" button again

**Expected Result:**

- ✅ First click: MRNs sorted ascending (↑ indicator)
- ✅ Second click: MRNs sorted descending (↓ indicator)
- ✅ Patients without MRN appear at end (empty values sort last)
- ✅ "MRN" button highlighted in teal color

---

### 8. Sort by Centre

**Steps:**

1. Click "Centre" button in sort section
2. Observe table order

**Expected Result:**

- ✅ Patients sorted by their next appointment centre name
- ✅ Patients without upcoming appointments appear at end
- ✅ "Centre" button highlighted in teal color

---

### 9. Clear Sort

**Steps:**

1. Apply any sort (Name, MRN, or Centre)
2. Click "Clear Sort" button

**Expected Result:**

- ✅ Table returns to default order
- ✅ Sort buttons return to gray (secondary) color
- ✅ "Clear Sort" button disappears

---

### 10. Export to CSV

**Steps:**

1. Click "Export CSV" button
2. Open downloaded CSV file

**Expected Result:**

- ✅ CSV file downloads
- ✅ MRN column present (second column)
- ✅ MRN values displayed correctly
- ✅ Empty MRNs show "Not Assigned"

---

### 11. Export to PDF

**Steps:**

1. Click "Export PDF" button
2. Open downloaded PDF file

**Expected Result:**

- ✅ PDF file downloads
- ✅ MRN column present
- ✅ MRN values displayed correctly
- ✅ Empty MRNs show "Not Assigned"

---

### 12. Test MRN Persistence

**Steps:**

1. Create/edit patient with MRN
2. Refresh the page (F5)
3. Find the patient in table

**Expected Result:**

- ✅ MRN still displays correctly after refresh
- ✅ Data persisted in database

---

### 13. Test Duplicate MRN (Should Fail)

**Steps:**

1. Create patient with MRN: `TEST-001`
2. Try to create another patient with same MRN: `TEST-001`

**Expected Result:**

- ✅ Error message displayed
- ✅ Second patient NOT created
- ✅ Database UNIQUE constraint enforced

---

### 14. Test Alphanumeric MRN

**Steps:**

1. Create patient with MRN: `ABC123XYZ`
2. Create patient with MRN: `2024-P-00001`
3. Create patient with MRN: `MRN_TEST_001`

**Expected Result:**

- ✅ All formats accepted
- ✅ Letters and numbers work
- ✅ Special characters (-, \_) work

---

### 15. Test Search (Verify MRN Not Breaking Search)

**Steps:**

1. Use search bar to search for patient name
2. Use search bar to search for phone number

**Expected Result:**

- ✅ Search still works correctly
- ✅ MRN field doesn't interfere with search

---

## Edge Cases to Test

### Empty MRN Handling

- ✅ Create patient without MRN → Shows "Not Assigned"
- ✅ Edit patient to remove MRN (clear field) → Shows "Not Assigned"

### Long MRN Values

- ✅ Enter 50-character MRN (database limit)
- ✅ Verify it displays without breaking layout

### Special Characters

- ✅ Test MRN with: `MRN-2024/001`
- ✅ Test MRN with: `P.2024.001`
- ✅ Test MRN with: `MRN_2024_001`

### Sorting Edge Cases

- ✅ Sort when all patients have no MRN
- ✅ Sort when mix of patients with/without MRN
- ✅ Sort with only one patient

---

## Visual Verification Checklist

### MRN Column

- [ ] Column header says "MRN"
- [ ] MRN values in monospace font
- [ ] "Not Assigned" in italic gray text
- [ ] Column width appropriate (not too wide/narrow)

### Sort Buttons

- [ ] Buttons grouped together
- [ ] Active button highlighted in teal
- [ ] Inactive buttons in gray
- [ ] Sort indicators (↑/↓) visible
- [ ] "Clear Sort" button appears only when sorting

### Modal Form

- [ ] MRN field labeled clearly
- [ ] Placeholder text helpful
- [ ] Field positioned after Blood Group
- [ ] Field not marked as required

### Export Files

- [ ] CSV has MRN column
- [ ] PDF has MRN column
- [ ] Values aligned properly

---

## Performance Testing

### Large Dataset

1. Create 50+ patients
2. Test sorting performance
3. Test export performance

**Expected Result:**

- ✅ Sorting is instant (client-side)
- ✅ Export completes in < 2 seconds
- ✅ No UI lag or freezing

---

## Browser Compatibility

Test in:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

**Expected Result:**

- ✅ Feature works identically in all browsers
- ✅ No layout issues
- ✅ No JavaScript errors in console

---

## Regression Testing

Verify existing features still work:

- [ ] Create patient (without MRN)
- [ ] Edit patient (other fields)
- [ ] Delete patient
- [ ] View patient details
- [ ] Search patients
- [ ] Filter patients
- [ ] Stats cards display correctly

---

## Database Verification

### Check Migration

```sql
-- Verify column exists
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'patient_profiles' AND column_name = 'mrn';

-- Expected: mrn | character varying | 50 | YES
```

### Check Index

```sql
-- Verify index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'patient_profiles' AND indexname = 'idx_patient_profiles_mrn';

-- Expected: Index on mrn column
```

### Check Unique Constraint

```sql
-- Verify unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'patient_profiles' AND constraint_type = 'UNIQUE';

-- Expected: UNIQUE constraint on mrn
```

### Check Data

```sql
-- View MRN data
SELECT user_id, mrn, created_at
FROM patient_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Expected: MRN values or NULL
```

---

## Troubleshooting

### MRN Field Not Showing in Modal

- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Verify admin panel build completed

### MRN Not Saving

- Check browser console for errors
- Check backend logs
- Verify migration ran successfully

### Sort Not Working

- Check browser console for errors
- Verify React useMemo is working
- Check if filteredPatients has data

### Export Missing MRN

- Verify export functions updated
- Check if MRN field in export data
- Test with patient that has MRN

---

## Success Criteria

All tests pass when:

- ✅ MRN can be created, read, updated
- ✅ MRN displays correctly in table
- ✅ Sorting works for all three options
- ✅ Export includes MRN data
- ✅ No TypeScript errors
- ✅ No runtime errors
- ✅ No layout issues
- ✅ Database constraints enforced
- ✅ Existing features unaffected

---

## Reporting Issues

If you find a bug, report:

1. **What you did** (steps to reproduce)
2. **What you expected** (expected behavior)
3. **What happened** (actual behavior)
4. **Browser/environment** (Chrome, Firefox, etc.)
5. **Console errors** (if any)
6. **Screenshots** (if applicable)

---

**Happy Testing! 🎉**
