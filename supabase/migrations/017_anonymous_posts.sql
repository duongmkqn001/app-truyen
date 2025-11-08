-- =====================================================
-- ANONYMOUS POSTS FEATURE
-- =====================================================
-- Add is_anonymous field to comments, reviews, and nominations
-- to allow users to post anonymously

-- Add is_anonymous column to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false NOT NULL;

-- Add is_anonymous column to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false NOT NULL;

-- Add is_anonymous column to nominations table
ALTER TABLE nominations
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false NOT NULL;

-- Create indexes for faster queries on anonymous posts
CREATE INDEX IF NOT EXISTS idx_comments_anonymous ON comments(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_reviews_anonymous ON reviews(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_nominations_anonymous ON nominations(is_anonymous);

-- Add comment for documentation
COMMENT ON COLUMN comments.is_anonymous IS 'If true, the username is hidden from regular users (shown as "Ẩn danh"). Admins can still see the real user.';
COMMENT ON COLUMN reviews.is_anonymous IS 'If true, the username is hidden from regular users (shown as "Ẩn danh"). Admins can still see the real user.';
COMMENT ON COLUMN nominations.is_anonymous IS 'If true, the username is hidden from regular users. Admins can still see the real user.';

