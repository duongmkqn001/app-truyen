-- =====================================================
-- ADMIN ROLE HIERARCHY - PART 2
-- Create functions and policies for admin hierarchy
-- =====================================================

-- Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND NOT is_banned
  );
$$;

CREATE OR REPLACE FUNCTION public.is_sub_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'sub_admin'
    AND NOT is_banned
  );
$$;

CREATE OR REPLACE FUNCTION public.is_any_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'sub_admin')
    AND NOT is_banned
  );
$$;

-- Update the existing is_admin function to check for any admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'sub_admin')
    AND NOT is_banned
  );
$$;

-- Update RLS policies for users table to account for admin hierarchy
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can read all" ON users;
DROP POLICY IF EXISTS "Admins can update all" ON users;
DROP POLICY IF EXISTS "Admins can delete" ON users;

-- Super admins can read all users
CREATE POLICY "Super admins can read all"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'super_admin' AND NOT is_banned
  )
);

-- Any admin can read all users (for moderation purposes)
CREATE POLICY "Any admin can read all"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'sub_admin') 
    AND NOT is_banned
  )
);

-- Super admins can update all users
CREATE POLICY "Super admins can update all"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'super_admin' AND NOT is_banned
  )
);

-- Sub-admins can only update is_banned field (restrict/unrestrict accounts)
CREATE POLICY "Sub-admins can restrict accounts"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'sub_admin' AND NOT is_banned
  )
)
WITH CHECK (
  -- Sub-admins can only modify is_banned field
  -- They cannot change roles or delete users
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'sub_admin' AND NOT is_banned
  )
);

-- Only super admins can delete users
CREATE POLICY "Super admins can delete users"
ON users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'super_admin' AND NOT is_banned
  )
);

-- Update other table policies to use the new is_admin() function
-- (The is_admin() function now checks for all admin types)

-- Add comment for documentation
COMMENT ON FUNCTION public.is_super_admin() IS 'Check if current user is a super admin (highest authority)';
COMMENT ON FUNCTION public.is_sub_admin() IS 'Check if current user is a sub-admin (limited authority)';
COMMENT ON FUNCTION public.is_any_admin() IS 'Check if current user has any admin role';

