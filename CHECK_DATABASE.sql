-- ============================================
-- DATABASE COMPATIBILITY CHECK
-- ============================================
-- Run these queries to check if your database is compatible with the updated code

-- ============================================
-- ADMIN USER CHECK
-- ============================================

-- 1. Check if admin users exist
SELECT 
  u.id,
  u.username,
  u.phone,
  u.email,
  u.full_name,
  u.user_type,
  u.is_active,
  r.name as role_name,
  u.created_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.user_type = 'STAFF' 
  AND r.name = 'ADMIN'
  AND u.is_active = true
ORDER BY u.created_at;

-- 2. Check all STAFF users with their roles
SELECT 
  u.id,
  u.username,
  u.phone,
  u.email,
  u.full_name,
  r.name as role_name,
  u.is_active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.user_type = 'STAFF'
ORDER BY r.name, u.full_name;

-- 3. Check if roles table is populated
SELECT * FROM roles ORDER BY name;

-- 4. Count users by type and role
SELECT 
  u.user_type,
  r.name as role_name,
  COUNT(*) as user_count
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.user_type, r.name
ORDER BY u.user_type, r.name;

-- ============================================
-- TABLE STRUCTURE CHECKS
-- ============================================

-- 5. Check clinician_profiles table structure
-- 5. Check clinician_profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'clinician_profiles'
ORDER BY ordinal_position;

-- Expected columns:
-- - id
-- - user_id
-- - primary_centre_id
-- - specialization
-- - registration_number
-- - years_of_experience (NOT experience_years)
-- - bio
-- - consultation_modes (JSONB)
-- - default_consultation_duration_minutes (INTEGER)
-- - is_active
-- - created_at
-- - updated_at

-- 6. Check clinician_availability_rules table structure
-- 6. Check clinician_availability_rules table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'clinician_availability_rules'
ORDER BY ordinal_position;

-- Expected columns:
-- - id
-- - clinician_id
-- - centre_id (REQUIRED - must be NOT NULL)
-- - day_of_week
-- - start_time
-- - end_time
-- - slot_duration_minutes
-- - mode (NOT consultation_mode)
-- - is_active
-- - created_at
-- - updated_at

-- 7. Check staff_profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'staff_profiles'
ORDER BY ordinal_position;

-- Expected columns:
-- - id
-- - user_id
-- - designation
-- - profile_picture_url (TEXT)
-- - is_active
-- - created_at
-- - updated_at
