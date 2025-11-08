-- =====================================================
-- FIX ROLE UPGRADE REQUESTS RLS POLICIES
-- Replace is_current_user_admin() with is_admin()
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own role upgrade requests" ON role_upgrade_requests;
DROP POLICY IF EXISTS "Admins can update role upgrade requests" ON role_upgrade_requests;

-- Users can view their own requests OR admins can view all
CREATE POLICY "Users can view own role upgrade requests"
ON role_upgrade_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Only admins can update role upgrade requests
CREATE POLICY "Admins can update role upgrade requests"
ON role_upgrade_requests
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Add comment
COMMENT ON TABLE role_upgrade_requests IS 'Stores user requests for role upgrades. Users can view their own requests, admins can view and manage all requests.';

