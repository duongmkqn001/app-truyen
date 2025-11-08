-- =====================================================
-- CLEANUP: Remove Duplicate and Conflicting Policies
-- =====================================================

-- The issue is caused by old policies that don't preserve user roles
-- when users update their profiles. We need to remove these old policies.

-- Remove old/duplicate policies from earlier migrations
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admins_delete_all" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create a helper function to check if role is being changed
-- This function checks if the current user is an admin WITHOUT querying users table
-- to avoid infinite recursion
CREATE OR REPLACE FUNCTION check_role_unchanged()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Get the current user's role from OLD record (the user being updated)
  -- If the user being updated is the current user, check their role
  IF NEW.id = auth.uid() THEN
    current_user_role := OLD.role;

    -- Only allow role changes if current user is an admin
    IF current_user_role NOT IN ('admin', 'super_admin', 'sub_admin') THEN
      -- Regular users cannot change their own role
      IF NEW.role != OLD.role THEN
        RAISE EXCEPTION 'Users cannot change their own role';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce role preservation
DROP TRIGGER IF EXISTS prevent_self_role_change ON users;
CREATE TRIGGER prevent_self_role_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_role_unchanged();

-- Recreate simple policies without recursion
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- This ensures users can update their profile,
-- but the trigger prevents them from changing their role.

-- Note: Admin policies (Super admins, Sub-admins) are kept as-is
-- because they have proper permission controls already.

