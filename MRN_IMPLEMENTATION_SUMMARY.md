# MRN (Medical Record Number) Implementation Summary

## Status: IN PROGRESS

### ✅ Completed Steps:

1. **Database Migration** - DONE
   - Added `mrn` column to `patient_profiles` table
   - Column type: VARCHAR(50) UNIQUE
   - Created index for faster lookups
   - Migration file: `backend/migrations/add_mrn_to_patient_profiles.sql`

2. **Backend Types** - DONE
   - Updated `PatientProfile` interface in `backend/src/repositories/patient.repository.ts`
   - Added `mrn: string | null` field

3. **Backend Repository** - DONE
   - Updated `updatePatientProfile()` method to handle MRN updates
   - Added MRN to return object

4. **Admin Panel Types** - DONE
   - Updated `Patient` interface in `mibo-admin/src/types/index.ts`
   - Added `mrn?: string` field

5. **Admin Panel Service** - DONE
   - Updated `CreatePatientRequest` interface to include `mrn?: string`
   - Updated `UpdatePatientRequest` interface to include `mrn?: string`

### 🔄 Remaining Steps:

6. **Admin Panel - PatientsListPage.tsx**
   - Add MRN to formData state initialization
   - Add MRN column to table
   - Add MRN input field to edit modal
   - Add sorting functionality (by name, MRN, centre)
   - Handle "Not Assigned" display for empty MRN

7. **Backend - Case Transform Utility**
   - Ensure MRN is properly transformed between snake_case and camelCase

8. **Testing**
   - Test MRN assignment through admin panel
   - Test MRN display in patient list
   - Test sorting functionality
   - Verify database persistence

### Files Modified:

- ✅ `backend/migrations/add_mrn_to_patient_profiles.sql`
- ✅ `backend/src/repositories/patient.repository.ts`
- ✅ `mibo-admin/src/types/index.ts`
- ✅ `mibo-admin/src/services/patientService.ts`
- 🔄 `mibo-admin/src/modules/patients/pages/PatientsListPage.tsx` (IN PROGRESS)

### Next Actions:

1. Update PatientsListPage to add MRN field to form
2. Add MRN column to patient table
3. Implement sorting functionality
4. Test end-to-end functionality
