-- =====================================================
-- THREADED COMMENT REPLIES FEATURE
-- =====================================================
-- Add parent_comment_id field to comments table
-- to enable nested comment threads (replies)

-- Add parent_comment_id column to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Create index for faster queries on comment replies
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);

-- Add comment for documentation
COMMENT ON COLUMN comments.parent_comment_id IS 'If set, this comment is a reply to another comment. NULL means it is a top-level comment.';

-- Create a view to get comment counts including replies
CREATE OR REPLACE VIEW comments_with_reply_count AS
SELECT 
    c.*,
    COUNT(r.id) as reply_count
FROM comments c
LEFT JOIN comments r ON r.parent_comment_id = c.id
GROUP BY c.id;

-- Add comment for documentation
COMMENT ON VIEW comments_with_reply_count IS 'View that includes reply count for each comment';

