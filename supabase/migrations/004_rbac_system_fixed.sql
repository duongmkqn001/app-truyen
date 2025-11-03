-- =====================================================
-- RBAC SYSTEM - PART 1: DROP ALL OLD POLICIES AND FUNCTIONS
-- =====================================================
-- This migration must be run BEFORE the main RBAC migration
-- It drops ALL policies and functions so we can safely alter the enum

-- Drop ALL policies from all tables
DROP POLICY IF EXISTS "Users can view non-banned users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;

DROP POLICY IF EXISTS "Anyone can view novels" ON novels;
DROP POLICY IF EXISTS "Anyone can view approved novels" ON novels;
DROP POLICY IF EXISTS "Authenticated users can create novels" ON novels;
DROP POLICY IF EXISTS "Users can update own novels" ON novels;
DROP POLICY IF EXISTS "Admins can delete novels" ON novels;
DROP POLICY IF EXISTS "Admins can manage all novels" ON novels;

DROP POLICY IF EXISTS "Anyone can view novel tags" ON novel_tags;
DROP POLICY IF EXISTS "Authenticated users can manage novel tags" ON novel_tags;
DROP POLICY IF EXISTS "Admins and creators can manage novel tags" ON novel_tags;

DROP POLICY IF EXISTS "Authenticated users can view ratings" ON ratings;
DROP POLICY IF EXISTS "Authenticated users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON ratings;

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view non-flagged comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view non-flagged reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

DROP POLICY IF EXISTS "Authenticated users can view nominations" ON nominations;
DROP POLICY IF EXISTS "Authenticated users can create nominations" ON nominations;
DROP POLICY IF EXISTS "Users can delete own nominations" ON nominations;

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;

-- Drop helper functions (CASCADE will drop dependent policies if any remain)
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_user_banned() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_translator_or_admin() CASCADE;
DROP FUNCTION IF EXISTS is_approved_user() CASCADE;

-- =====================================================
-- RBAC SYSTEM - PART 2: UPDATE ENUM AND ADD TABLES
-- =====================================================

-- Step 1: Update user_role enum to include new roles
-- We need to add the new values one by one
DO $$ 
BEGIN
    -- Add 'pending_approval' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_approval' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'pending_approval';
    END IF;
    
    -- Add 'translator' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'translator' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'translator';
    END IF;
END $$;

-- Step 2: Create translator_requests table
CREATE TABLE IF NOT EXISTS translator_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_translator_requests_user_id ON translator_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_translator_requests_status ON translator_requests(status);

-- Step 3: Create likes table for comments and reviews
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('comment', 'review')),
    target_id UUID NOT NULL,
    is_like BOOLEAN NOT NULL, -- true = like, false = dislike
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- Step 4: Add approval workflow columns to novels table
ALTER TABLE novels 
    ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- Create index for pending novels
CREATE INDEX IF NOT EXISTS idx_novels_approval_status ON novels(approval_status);

-- Step 5: Add like/dislike counts to comments and reviews
ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0;

ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0;

-- Step 6: Update reports table
-- Add 'user' to report_type enum to support user reports
DO $$
BEGIN
    -- Add 'user' to report_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'user' AND enumtypid = 'report_type'::regtype) THEN
        ALTER TYPE report_type ADD VALUE 'user';
    END IF;
END $$;

-- Add details column to reports table for additional information
ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS details TEXT;

-- =====================================================
-- VIEWS FOR EFFICIENT QUERIES
-- =====================================================

-- View for novels with approval info
CREATE OR REPLACE VIEW novels_with_approval AS
SELECT 
    n.*,
    u.username as creator_username,
    approver.username as approver_username
FROM novels n
LEFT JOIN users u ON n.created_by = u.id
LEFT JOIN users approver ON n.approved_by = approver.id;

-- View for translator requests with user info
CREATE OR REPLACE VIEW translator_requests_with_users AS
SELECT
    tr.*,
    u.username,
    u.role as user_role,
    reviewer.username as reviewer_username
FROM translator_requests tr
LEFT JOIN users u ON tr.user_id = u.id
LEFT JOIN users reviewer ON tr.reviewed_by = reviewer.id;

-- View for comments with engagement metrics
CREATE OR REPLACE VIEW comments_with_engagement AS
SELECT 
    c.*,
    u.username as commenter_username,
    u.role as commenter_role
FROM comments c
LEFT JOIN users u ON c.user_id = u.id;

-- View for reviews with engagement metrics
CREATE OR REPLACE VIEW reviews_with_engagement AS
SELECT 
    r.*,
    u.username as reviewer_username,
    u.role as reviewer_role
FROM reviews r
LEFT JOIN users u ON r.user_id = u.id;

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function to update like counts automatically
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment count
        IF NEW.target_type = 'comment' THEN
            IF NEW.is_like THEN
                UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.target_id;
            ELSE
                UPDATE comments SET dislike_count = dislike_count + 1 WHERE id = NEW.target_id;
            END IF;
        ELSIF NEW.target_type = 'review' THEN
            IF NEW.is_like THEN
                UPDATE reviews SET like_count = like_count + 1 WHERE id = NEW.target_id;
            ELSE
                UPDATE reviews SET dislike_count = dislike_count + 1 WHERE id = NEW.target_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote change
        IF NEW.target_type = 'comment' THEN
            IF OLD.is_like AND NOT NEW.is_like THEN
                UPDATE comments SET like_count = like_count - 1, dislike_count = dislike_count + 1 WHERE id = NEW.target_id;
            ELSIF NOT OLD.is_like AND NEW.is_like THEN
                UPDATE comments SET like_count = like_count + 1, dislike_count = dislike_count - 1 WHERE id = NEW.target_id;
            END IF;
        ELSIF NEW.target_type = 'review' THEN
            IF OLD.is_like AND NOT NEW.is_like THEN
                UPDATE reviews SET like_count = like_count - 1, dislike_count = dislike_count + 1 WHERE id = NEW.target_id;
            ELSIF NOT OLD.is_like AND NEW.is_like THEN
                UPDATE reviews SET like_count = like_count + 1, dislike_count = dislike_count - 1 WHERE id = NEW.target_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement count
        IF OLD.target_type = 'comment' THEN
            IF OLD.is_like THEN
                UPDATE comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.target_id;
            ELSE
                UPDATE comments SET dislike_count = GREATEST(0, dislike_count - 1) WHERE id = OLD.target_id;
            END IF;
        ELSIF OLD.target_type = 'review' THEN
            IF OLD.is_like THEN
                UPDATE reviews SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.target_id;
            ELSE
                UPDATE reviews SET dislike_count = GREATEST(0, dislike_count - 1) WHERE id = OLD.target_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for like count updates
DROP TRIGGER IF EXISTS trigger_update_like_counts ON likes;
CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR UPDATE OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_counts();

-- =====================================================
-- RPC FUNCTIONS FOR COMPLEX OPERATIONS
-- =====================================================

-- Function to approve translator request and update user role
CREATE OR REPLACE FUNCTION approve_translator_request(
    request_uuid UUID,
    admin_uuid UUID,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the user_id from the request
    SELECT user_id INTO user_uuid
    FROM translator_requests
    WHERE id = request_uuid AND status = 'pending';
    
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update the request
    UPDATE translator_requests
    SET status = 'approved',
        admin_notes = notes,
        reviewed_by = admin_uuid,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = request_uuid;
    
    -- Update user role to translator
    UPDATE users
    SET role = 'translator',
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject translator request
CREATE OR REPLACE FUNCTION reject_translator_request(
    request_uuid UUID,
    admin_uuid UUID,
    notes TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE translator_requests
    SET status = 'rejected',
        admin_notes = notes,
        reviewed_by = admin_uuid,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = request_uuid AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE translator_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

