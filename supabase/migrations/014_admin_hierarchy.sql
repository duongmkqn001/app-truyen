-- =====================================================
-- ADMIN ROLE HIERARCHY - PART 1
-- Add super_admin and sub_admin enum values only
-- =====================================================

-- Add new role values if they don't exist
-- Note: Must be in separate transaction from usage due to PostgreSQL enum limitations
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sub_admin';

