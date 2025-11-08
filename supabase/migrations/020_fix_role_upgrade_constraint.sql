-- =====================================================
-- FIX ROLE UPGRADE REQUESTS CHECK CONSTRAINT
-- =====================================================
-- The role_upgrade_requests table has a CHECK constraint that only allows
-- old role names ('member', 'contributor', 'admin').
-- This migration updates it to allow the new role system:
-- 'reader' → 'translator' → 'admin'/'super_admin'/'sub_admin'

-- Step 1: Update existing rows with old role names to new role names
UPDATE role_upgrade_requests
SET to_role = 'translator'
WHERE to_role = 'contributor';

UPDATE role_upgrade_requests
SET to_role = 'reader'
WHERE to_role = 'member';

UPDATE role_upgrade_requests
SET from_role = 'translator'
WHERE from_role = 'contributor';

UPDATE role_upgrade_requests
SET from_role = 'reader'
WHERE from_role = 'member';

-- Step 2: Drop the old constraint
ALTER TABLE role_upgrade_requests
DROP CONSTRAINT IF EXISTS role_upgrade_requests_to_role_check;

-- Step 3: Add new constraint with updated role names
ALTER TABLE role_upgrade_requests
ADD CONSTRAINT role_upgrade_requests_to_role_check
CHECK (to_role IN ('reader', 'translator', 'admin', 'super_admin', 'sub_admin'));

-- Step 4: Update table comment
COMMENT ON TABLE role_upgrade_requests IS 'Stores user requests for role upgrades (reader → translator → admin/super_admin/sub_admin)';

