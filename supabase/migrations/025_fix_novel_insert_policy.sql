-- =====================================================
-- MIGRATION 025: FIX NOVEL INSERT POLICY
-- =====================================================
-- Purpose: Fix RLS policy blocking novel creation
-- Issue: Users getting 403 error when trying to create novels
-- Date: 2025-11-15
-- =====================================================

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Approved users can create novels" ON novels;
DROP POLICY IF EXISTS "Authenticated users can create novels" ON novels;

-- Recreate a simpler INSERT policy
-- Allow any authenticated user who is not banned to create novels
CREATE POLICY "Authenticated users can create novels"
ON novels
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = created_by
    AND NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND is_banned = true
    )
);

-- Add comment for documentation
COMMENT ON POLICY "Authenticated users can create novels" ON novels IS
'Allow authenticated non-banned users to create novels. Novels will be pending approval unless user is translator/admin/super_admin/sub_admin.';

