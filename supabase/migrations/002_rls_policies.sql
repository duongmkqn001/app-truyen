-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

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
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view all non-banned users
CREATE POLICY "Users can view non-banned users"
    ON users FOR SELECT
    USING (is_banned = false OR id = auth.uid() OR is_admin());

-- Users can update their own profile (except role and is_banned)
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (id = auth.uid() AND NOT is_user_banned())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Admins can do everything
CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- New users can insert their profile
CREATE POLICY "New users can create profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id AND role = 'reader');

-- =====================================================
-- TAGS TABLE POLICIES
-- =====================================================

-- Everyone can view tags
CREATE POLICY "Anyone can view tags"
    ON tags FOR SELECT
    USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can manage tags"
    ON tags FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- NOVELS TABLE POLICIES
-- =====================================================

-- Everyone can view approved novels
CREATE POLICY "Anyone can view approved novels"
    ON novels FOR SELECT
    USING (is_approved = true OR is_admin() OR created_by = auth.uid());

-- Authenticated users can insert novels (pending approval)
CREATE POLICY "Authenticated users can create novels"
    ON novels FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND NOT is_user_banned());

-- Users can update their own unapproved novels
CREATE POLICY "Users can update own unapproved novels"
    ON novels FOR UPDATE
    USING (created_by = auth.uid() AND is_approved = false AND NOT is_user_banned())
    WITH CHECK (created_by = auth.uid() AND is_approved = false);

-- Admins can do everything with novels
CREATE POLICY "Admins can manage all novels"
    ON novels FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- =====================================================
-- NOVEL_TAGS TABLE POLICIES
-- =====================================================

-- Everyone can view novel tags
CREATE POLICY "Anyone can view novel tags"
    ON novel_tags FOR SELECT
    USING (true);

-- Admins and novel creators can manage tags
CREATE POLICY "Admins and creators can manage novel tags"
    ON novel_tags FOR ALL
    USING (
        is_admin() OR 
        EXISTS (SELECT 1 FROM novels WHERE id = novel_id AND created_by = auth.uid())
    )
    WITH CHECK (
        is_admin() OR 
        EXISTS (SELECT 1 FROM novels WHERE id = novel_id AND created_by = auth.uid())
    );

-- =====================================================
-- RATINGS TABLE POLICIES
-- =====================================================

-- Everyone can view ratings
CREATE POLICY "Anyone can view ratings"
    ON ratings FOR SELECT
    USING (true);

-- Authenticated users can insert their own ratings
CREATE POLICY "Users can create ratings"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id AND NOT is_user_banned());

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
    ON ratings FOR UPDATE
    USING (user_id = auth.uid() AND NOT is_user_banned())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
    ON ratings FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- =====================================================
-- COMMENTS TABLE POLICIES
-- =====================================================

-- Everyone can view non-flagged comments
CREATE POLICY "Anyone can view non-flagged comments"
    ON comments FOR SELECT
    USING (is_flagged = false OR user_id = auth.uid() OR is_admin());

-- Authenticated users can create comments
CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id AND NOT is_user_banned());

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    USING (user_id = auth.uid() AND NOT is_user_banned())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments, admins can delete any
CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================

-- Everyone can view non-flagged reviews
CREATE POLICY "Anyone can view non-flagged reviews"
    ON reviews FOR SELECT
    USING (is_flagged = false OR user_id = auth.uid() OR is_admin());

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id AND NOT is_user_banned());

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (user_id = auth.uid() AND NOT is_user_banned())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own reviews, admins can delete any
CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- =====================================================
-- NOMINATIONS TABLE POLICIES
-- =====================================================

-- Everyone can view nominations (for counting)
CREATE POLICY "Anyone can view nominations"
    ON nominations FOR SELECT
    USING (true);

-- Authenticated users can nominate
CREATE POLICY "Users can create nominations"
    ON nominations FOR INSERT
    WITH CHECK (auth.uid() = user_id AND NOT is_user_banned());

-- Users can remove their own nominations
CREATE POLICY "Users can delete own nominations"
    ON nominations FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- =====================================================
-- REPORTS TABLE POLICIES
-- =====================================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (reported_by = auth.uid() OR is_admin());

-- Authenticated users can create reports
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reported_by AND NOT is_user_banned());

-- Only admins can update/delete reports
CREATE POLICY "Admins can manage reports"
    ON reports FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete reports"
    ON reports FOR DELETE
    USING (is_admin());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

