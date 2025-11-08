-- =====================================================
-- FIX LIKES TABLE RLS POLICIES
-- =====================================================
-- The likes table policies were using is_approved_user() which checks
-- for the old role system (pending_approval). This causes 403 errors
-- for users trying to like/dislike comments.
--
-- Fix: Update policies to work with new role system where all users
-- are auto-approved as 'reader' role.

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Approved users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can update own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

-- Recreate policies with correct logic
-- Everyone can view likes (for displaying counts)
CREATE POLICY "Anyone can view likes"
ON likes FOR SELECT
USING (true);

-- Authenticated users can create likes (no approval check needed)
CREATE POLICY "Authenticated users can create likes"
ON likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own likes (for changing vote)
CREATE POLICY "Users can update own likes"
ON likes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete own likes (for removing vote)
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all likes
CREATE POLICY "Admins can manage all likes"
ON likes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin', 'sub_admin')
    )
);

-- Add comment for documentation
COMMENT ON TABLE likes IS 'Stores like/dislike votes for comments and reviews. Users can like/dislike any comment or review.';

