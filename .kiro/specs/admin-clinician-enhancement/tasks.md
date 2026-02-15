# Implementation Plan: Admin Clinician Enhancement

## Overview

This implementation plan breaks down the admin clinician enhancement feature into discrete, incremental coding tasks. The approach follows a bottom-up strategy: fix backend API issues first, then enhance frontend components, and finally integrate everything together. Each task builds on previous work and includes validation through code execution.

## Tasks

- [x] 1. Fix Backend API Validation and Response Transformation
  - Enhance validation in `backend/src/validations/staff.validation.ts` to properly validate array fields
  - Update `validateCreateClinician` to check for non-empty arrays (specialization, qualification, languages)
  - Update `validateCreateClinician` to validate consultation_fee is positive
  - Update `validateCreateClinician` to validate consultation_modes contains only valid values
  - Ensure `transformClinicianResponse` in `backend/src/utils/caseTransform.ts` correctly transforms all fields including arrays
  - Test validation with various invalid inputs to ensure proper error messages
  - _Requirements: 1.2, 7.2, 7.8, 7.9, 7.10, 7.12_

- [ ]\* 1.1 Write property test for validation
  - **Property 2: Required Field Validation**
  - **Validates: Requirements 1.2, 7.2, 9.1**

- [ ]\* 1.2 Write property test for array field validation
  - **Property 41: Non-Empty Array Validation**
  - **Validates: Requirements 7.8, 7.9, 7.10**

- [x] 2. Enhance Backend Service Layer for Clinician Creation
  - Update `backend/src/services/staff.service.ts` `createClinician` method
  - Improve error handling for duplicate phone numbers and usernames
  - Add support for availability_slots in the request body
  - After creating clinician, call `staffRepository.updateClinicianAvailability` if slots provided
  - Ensure proper error messages for all failure scenarios
  - _Requirements: 1.5, 1.6, 1.7, 8.9_

- [ ]\* 2.1 Write property test for clinician creation round trip
  - **Property 1: Clinician Creation Round Trip**
  - **Validates: Requirements 1.1, 1.8, 1.9, 7.1, 7.3**

- [ ]\* 2.2 Write property test for duplicate prevention
  - **Property 47: Duplicate Prevention**
  - **Validates: Requirements 8.8**

- [x] 3. Test Backend API Against Live Database
  - Create test script `backend/test-clinician-creation-enhanced.js`
  - Test creating clinician with all required fields
  - Test creating clinician with availability slots
  - Test duplicate phone number error
  - Test duplicate username error
  - Test array field storage and retrieval
  - Verify response transformation (snake_case to camelCase)
  - Document any issues found and fix them
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.7_

- [x] 4. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create CalendarPicker Component
  - Create `mibo-admin/src/components/ui/CalendarPicker.tsx`
  - Implement month navigation (previous/next buttons)
  - Implement date selection with click handlers
  - Display current month with day names (Sun, Mon, Tue, etc.)
  - Highlight current date with border
  - Highlight selected date with filled background
  - Add visual indicators (dots/badges) for dates with existing slots
  - Style using Tailwind CSS consistent with existing components
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8_

- [ ]\* 5.1 Write unit tests for CalendarPicker
  - Test month navigation
  - Test date selection
  - Test visual indicators for marked dates
  - _Requirements: 2.2, 2.3, 2.8_

- [x] 6. Create TimeSlider Component
  - Create `mibo-admin/src/components/ui/TimeSlider.tsx`
  - Implement slider for hour selection (1-12)
  - Implement minute selection dropdown (00, 15, 30, 45)
  - Implement AM/PM toggle buttons
  - Display selected time in HH:MM format
  - Auto-calculate end time based on session length (default 30 minutes)
  - Convert between 12-hour and 24-hour formats
  - Style using Tailwind CSS
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8, 3.9_

- [ ]\* 6.1 Write property test for end time calculation
  - **Property 16: End Time Calculation**
  - **Validates: Requirements 3.5**

- [ ]\* 6.2 Write unit tests for TimeSlider
  - Test AM/PM toggle
  - Test time increment granularity
  - Test hour range support
  - _Requirements: 3.3, 3.4, 3.8, 3.9_

- [x] 7. Create FieldLockInput Component
  - Create `mibo-admin/src/components/ui/FieldLockInput.tsx`
  - Implement lock/unlock state management
  - Display "Add" button when unlocked
  - Display "Edit" button when locked
  - Grey out field when locked (disabled or readonly)
  - Maintain value display when locked
  - Support text, number, email, and tel input types
  - Style using Tailwind CSS
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]\* 7.1 Write unit tests for FieldLockInput
  - Test locking action
  - Test unlocking action
  - Test value preservation
  - Test edit prevention when locked
  - _Requirements: 5.2, 5.3, 5.4, 5.6_

- [x] 8. Create LoadingOverlay Component
  - Create `mibo-admin/src/components/ui/LoadingOverlay.tsx`
  - Implement minimum display time logic (3 seconds)
  - Use useRef to track start time
  - Use setTimeout to enforce minimum duration
  - Display dark blue spinning circle (#1e40af)
  - Center overlay on screen with semi-transparent backdrop
  - Accept optional message prop
  - Style using Tailwind CSS
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.10_

- [ ]\* 8.1 Write unit tests for LoadingOverlay timing
  - Test minimum display duration
  - Test dismissal after operation completes
  - Test dismissal timing logic
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 9. Update CliniciansPage to Use CalendarPicker and TimeSlider
  - Update `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Replace AvailabilityScheduleBuilder with CalendarPicker + TimeSlider
  - Add state for selected date and time slots map
  - Implement date selection handler
  - Implement time slot addition handler
  - Display added slots grouped by date
  - Allow removing slots
  - Convert calendar-based slots to API format (day_of_week, start_time, end_time)
  - _Requirements: 2.2, 2.4, 2.5, 2.6, 2.9, 3.1, 3.10_

- [ ]\* 9.1 Write property test for slot date association
  - **Property 9: Time Slot Date Association**
  - **Validates: Requirements 2.5**

- [ ]\* 9.2 Write property test for multiple slot associations
  - **Property 10: Multiple Slot Associations**
  - **Validates: Requirements 2.6**

- [x] 10. Implement Password Visibility for All Forms
  - Update all password input fields in `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Change password input type from "password" to "text"
  - Remove any password visibility toggle buttons if present
  - Apply same change to other staff creation forms (Manager, Centre Manager, etc.)
  - Ensure styling remains consistent with other text inputs
  - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]\* 10.1 Write unit tests for password visibility
  - Test password fields have type="text"
  - Test no toggle button present
  - Test styling consistency
  - _Requirements: 4.1, 4.6, 4.7_

- [x] 11. Implement Field Locking in Clinician Creation Form
  - Update `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Wrap all input fields with FieldLockInput component
  - Add state to track locked fields
  - Implement lock/unlock handlers
  - Disable "Create Clinician" button until all required fields are locked
  - Apply to text, number, and select fields
  - _Requirements: 5.1, 5.2, 5.7, 5.8, 5.9, 5.10_

- [ ]\* 11.1 Write property test for submit button enablement
  - **Property 29: Submit Button Enablement**
  - **Validates: Requirements 5.10**

- [x] 12. Integrate LoadingOverlay in Clinician Creation
  - Update `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Add LoadingOverlay component to the page
  - Add loading state (isLoading)
  - Set isLoading to true when "Create Clinician" is clicked
  - Disable submit button while loading
  - Set isLoading to false after API response (success or error)
  - LoadingOverlay will handle minimum 3-second display
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]\* 12.1 Write unit tests for loading state
  - Test loading indicator display
  - Test button disablement during loading
  - Test loading dismissal on success
  - Test loading dismissal on error
  - _Requirements: 6.1, 6.5, 6.8, 6.9_

- [x] 13. Apply Loading State to All Role Creation Operations
  - Update Manager creation form
  - Update Centre Manager creation form
  - Update Care Coordinator creation form
  - Update Front Desk creation form
  - Apply same LoadingOverlay integration as clinician creation
  - _Requirements: 6.7_

- [x] 14. Enhance Frontend Form Validation
  - Update `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Add client-side validation for phone number format
  - Add client-side validation for email format
  - Add client-side validation for positive consultation fee
  - Add client-side validation for non-negative years of experience
  - Add client-side validation for non-empty array fields
  - Display all validation errors simultaneously
  - Clear error when field is corrected
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_

- [ ]\* 14.1 Write property tests for validation
  - **Property 48: Phone Number Validation**
  - **Property 49: Email Format Validation**
  - **Property 50: Positive Fee Validation**
  - **Property 51: Non-Negative Experience Validation**
  - **Property 52: Required Array Field Validation**
  - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9**

- [x] 15. Enhance Backend Error Response Handling
  - Update `mibo-admin/src/services/clinicianService.ts`
  - Improve error message extraction from API responses
  - Handle different error status codes (400, 409, 500)
  - Format error messages for user-friendly display
  - Update CliniciansPage to display formatted error messages
  - _Requirements: 1.4, 9.12_

- [ ]\* 15.1 Write property test for error display
  - **Property 3: Validation Error Display**
  - **Validates: Requirements 1.4, 9.12**

- [x] 16. Implement Availability Slot Overlap Validation
  - Add validation function in `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Check for overlapping time ranges when adding a slot
  - Display warning or prevent addition if overlap detected
  - Consider same day and same consultation mode for overlap check
  - _Requirements: 10.10_

- [ ]\* 16.1 Write property test for overlap detection
  - **Property 63: Availability Slot Overlap Validation**
  - **Validates: Requirements 10.10**

- [x] 17. Update Clinician List Refresh Logic
  - Update `mibo-admin/src/modules/staff/pages/CliniciansPage.tsx`
  - Ensure `fetchData()` is called after successful clinician creation
  - Verify newly created clinician appears in the list
  - Close modal after successful creation and refresh
  - _Requirements: 1.10_

- [ ]\* 17.1 Write property test for list refresh
  - **Property 5: Clinician List Refresh**
  - **Validates: Requirements 1.10**

- [x] 18. Implement Availability Slot Storage and Retrieval
  - Update `mibo-admin/src/services/clinicianService.ts` if needed
  - Ensure availability_slots are included in create request payload
  - Verify backend stores slots correctly (already implemented in task 2)
  - Test retrieving clinician with availability slots
  - Display slots in clinician details view
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]\* 18.1 Write property tests for slot storage
  - **Property 55: Availability Slots in Request**
  - **Property 56: Availability Slot Storage**
  - **Property 57: Availability Slot Data Completeness**
  - **Property 58: Availability Slots in Response**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [x] 19. Implement Availability Slot Update and Delete
  - Update clinician details modal to allow editing availability
  - Implement slot update functionality
  - Implement slot delete functionality
  - Ensure changes persist to database
  - _Requirements: 10.7, 10.8_

- [ ]\* 19.1 Write property tests for slot operations
  - **Property 60: Availability Slot Update**
  - **Property 61: Availability Slot Deletion**
  - **Validates: Requirements 10.7, 10.8**

- [x] 20. Implement Availability Slot Sorting
  - Update backend `backend/src/repositories/staff.repository.ts`
  - Ensure availability slots are returned sorted by day_of_week, then start_time
  - Add ORDER BY clause to availability query
  - Test that slots are returned in correct order
  - _Requirements: 10.9_

- [ ]\* 20.1 Write property test for slot ordering
  - **Property 62: Availability Slot Ordering**
  - **Validates: Requirements 10.9**

- [x] 21. Checkpoint - Integration testing
  - Test complete clinician creation flow end-to-end
  - Test calendar date selection → time slot addition → clinician creation
  - Test field locking → form submission
  - Test loading state timing
  - Test error handling for various scenarios
  - Test against live PostgreSQL database
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Final Testing and Bug Fixes
  - Run all unit tests and property tests
  - Fix any failing tests
  - Test all features manually in the admin panel
  - Verify API endpoints work correctly
  - Check database records for correctness
  - Test edge cases (duplicate phone, invalid data, etc.)
  - Document any remaining issues

## Notes

- Tasks marked with `*` are optional property-based tests and unit tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Backend fixes are prioritized before frontend enhancements
- Calendar and time selection components are built before integration
- Loading states and field locking are added after core functionality works
- Final integration testing validates the complete flow
