-- =====================================================
-- RBAC POLICIES - Row Level Security for 4-Tier System
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM users 
        WHERE id = auth.uid() 
        AND is_banned = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
        AND is_banned = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is translator or admin
CREATE OR REPLACE FUNCTION is_translator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('translator', 'admin')
        AND is_banned = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is approved (reader, translator, or admin)
CREATE OR REPLACE FUNCTION is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('reader', 'translator', 'admin')
        AND is_banned = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND is_banned = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USERS TABLE POLICIES (Recreated from migration 002)
-- =====================================================

-- Drop any existing policies first (in case of re-run)
DROP POLICY IF EXISTS "Users can view non-banned users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Users can view all non-banned users
CREATE POLICY "Users can view non-banned users"
    ON users FOR SELECT
    USING (is_banned = false);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id AND NOT is_user_banned())
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Admins can update any user
CREATE POLICY "Admins can update any user"
    ON users FOR UPDATE
    USING (is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    USING (is_admin());

-- =====================================================
-- NOVELS TABLE POLICIES (Updated for Approval Workflow)
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view novels" ON novels;
DROP POLICY IF EXISTS "Anyone can view approved novels" ON novels;
DROP POLICY IF EXISTS "Authenticated users can create novels" ON novels;
DROP POLICY IF EXISTS "Approved users can create novels" ON novels;
DROP POLICY IF EXISTS "Users can update own novels" ON novels;
DROP POLICY IF EXISTS "Admins can delete novels" ON novels;

-- Everyone can view approved novels
CREATE POLICY "Anyone can view approved novels"
    ON novels FOR SELECT
    USING (is_approved = true OR created_by = auth.uid() OR is_admin());

-- Approved users can create novels (pending for readers, auto-approved for translators/admins)
CREATE POLICY "Approved users can create novels"
    ON novels FOR INSERT
    WITH CHECK (is_approved_user());

-- Users can update own novels, translators can update own novels, admins can update any
CREATE POLICY "Users can update own novels"
    ON novels FOR UPDATE
    USING (created_by = auth.uid() OR is_admin())
    WITH CHECK (created_by = auth.uid() OR is_admin());

-- Admins can delete any novel
CREATE POLICY "Admins can delete novels"
    ON novels FOR DELETE
    USING (is_admin());

-- =====================================================
-- TAGS TABLE POLICIES (Recreated from migration 002)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;

-- Everyone can view tags
CREATE POLICY "Anyone can view tags"
    ON tags FOR SELECT
    USING (true);

-- Admins can manage tags
CREATE POLICY "Admins can manage tags"
    ON tags FOR ALL
    USING (is_admin());

-- =====================================================
-- NOVEL_TAGS TABLE POLICIES (Recreated from migration 002)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view novel tags" ON novel_tags;
DROP POLICY IF EXISTS "Authenticated users can manage novel tags" ON novel_tags;

-- Everyone can view novel tags
CREATE POLICY "Anyone can view novel tags"
    ON novel_tags FOR SELECT
    USING (true);

-- Novel creators and admins can manage novel tags
CREATE POLICY "Authenticated users can manage novel tags"
    ON novel_tags FOR ALL
    USING (
        auth.uid() IN (SELECT created_by FROM novels WHERE id = novel_id)
        OR is_admin()
    );

-- =====================================================
-- RATINGS TABLE POLICIES (Updated)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view ratings" ON ratings;
DROP POLICY IF EXISTS "Approved users can view ratings" ON ratings;
DROP POLICY IF EXISTS "Authenticated users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Approved users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;

-- Approved users can view all ratings
CREATE POLICY "Approved users can view ratings"
    ON ratings FOR SELECT
    USING (is_approved_user());

-- Approved users can create ratings
CREATE POLICY "Approved users can create ratings"
    ON ratings FOR INSERT
    WITH CHECK (is_approved_user() AND auth.uid() = user_id);

-- Users can update own ratings
CREATE POLICY "Users can update own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id AND is_approved_user());

-- Users can delete own ratings
CREATE POLICY "Users can delete own ratings"
    ON ratings FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- COMMENTS TABLE POLICIES (Updated)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Approved users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Everyone can view comments on approved novels
CREATE POLICY "Anyone can view comments"
    ON comments FOR SELECT
    USING (true);

-- Approved users can create comments
CREATE POLICY "Approved users can create comments"
    ON comments FOR INSERT
    WITH CHECK (is_approved_user() AND auth.uid() = user_id);

-- Users can update own comments
CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id AND is_approved_user());

-- Users can delete own comments, admins can delete any
CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- REVIEWS TABLE POLICIES (Updated)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Approved users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- Everyone can view reviews
CREATE POLICY "Anyone can view reviews"
    ON reviews FOR SELECT
    USING (true);

-- Approved users can create reviews
CREATE POLICY "Approved users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (is_approved_user() AND auth.uid() = user_id);

-- Users can update own reviews
CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id AND is_approved_user());

-- Users can delete own reviews, admins can delete any
CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- NOMINATIONS TABLE POLICIES (Updated)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view nominations" ON nominations;
DROP POLICY IF EXISTS "Approved users can view nominations" ON nominations;
DROP POLICY IF EXISTS "Authenticated users can create nominations" ON nominations;
DROP POLICY IF EXISTS "Approved users can create nominations" ON nominations;
DROP POLICY IF EXISTS "Users can delete own nominations" ON nominations;

-- Approved users can view nominations
CREATE POLICY "Approved users can view nominations"
    ON nominations FOR SELECT
    USING (is_approved_user());

-- Approved users can create nominations
CREATE POLICY "Approved users can create nominations"
    ON nominations FOR INSERT
    WITH CHECK (is_approved_user() AND auth.uid() = user_id);

-- Users can delete own nominations
CREATE POLICY "Users can delete own nominations"
    ON nominations FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- =====================================================
-- REPORTS TABLE POLICIES (Updated for new target types)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
DROP POLICY IF EXISTS "Approved users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;

-- Approved users can view own reports
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (auth.uid() = reported_by OR is_admin());

-- Approved users can create reports
CREATE POLICY "Approved users can create reports"
    ON reports FOR INSERT
    WITH CHECK (is_approved_user() AND auth.uid() = reported_by);

-- Admins can update reports (for moderation)
CREATE POLICY "Admins can update reports"
    ON reports FOR UPDATE
    USING (is_admin());

-- Admins can delete reports
CREATE POLICY "Admins can delete reports"
    ON reports FOR DELETE
    USING (is_admin());

-- =====================================================
-- TRANSLATOR_REQUESTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own translator requests" ON translator_requests;
DROP POLICY IF EXISTS "Readers can create translator requests" ON translator_requests;
DROP POLICY IF EXISTS "Admins can update translator requests" ON translator_requests;

-- Users can view own requests, admins can view all
CREATE POLICY "Users can view own translator requests"
    ON translator_requests FOR SELECT
    USING (auth.uid() = user_id OR is_admin());

-- Approved users (readers) can create translator requests
CREATE POLICY "Readers can create translator requests"
    ON translator_requests FOR INSERT
    WITH CHECK (
        is_approved_user()
        AND auth.uid() = user_id
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'reader'
    );

-- Admins can update translator requests (for approval/rejection)
CREATE POLICY "Admins can update translator requests"
    ON translator_requests FOR UPDATE
    USING (is_admin());

-- =====================================================
-- LIKES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Approved users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can update own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

-- Everyone can view likes (for displaying counts)
CREATE POLICY "Anyone can view likes"
    ON likes FOR SELECT
    USING (true);

-- Approved users can create likes
CREATE POLICY "Approved users can create likes"
    ON likes FOR INSERT
    WITH CHECK (is_approved_user() AND auth.uid() = user_id);

-- Users can update own likes (for changing vote)
CREATE POLICY "Users can update own likes"
    ON likes FOR UPDATE
    USING (auth.uid() = user_id AND is_approved_user());

-- Users can delete own likes (for removing vote)
CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

