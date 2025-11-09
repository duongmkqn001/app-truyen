-- =====================================================
-- MIGRATION 023: CREATE READING LISTS TABLE
-- =====================================================
-- Purpose: Allow users to bookmark novels to their personal reading list
-- Date: 2025-11-09
-- =====================================================

-- Create user_reading_lists table
CREATE TABLE IF NOT EXISTS user_reading_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure a user can only bookmark a novel once
    UNIQUE(user_id, novel_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reading_lists_user 
    ON user_reading_lists(user_id);

CREATE INDEX IF NOT EXISTS idx_reading_lists_novel 
    ON user_reading_lists(novel_id);

CREATE INDEX IF NOT EXISTS idx_reading_lists_created_at 
    ON user_reading_lists(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_reading_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own reading list
CREATE POLICY "Users can view own reading list"
    ON user_reading_lists FOR SELECT
    USING (user_id = auth.uid());

-- RLS Policy: Users can add novels to their own reading list
CREATE POLICY "Users can add to own reading list"
    ON user_reading_lists FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can remove novels from their own reading list
CREATE POLICY "Users can remove from own reading list"
    ON user_reading_lists FOR DELETE
    USING (user_id = auth.uid());

-- Create a view to get reading list with novel details
CREATE OR REPLACE VIEW user_reading_lists_with_details AS
SELECT
    rl.id,
    rl.user_id,
    rl.novel_id,
    rl.created_at,
    n.title,
    n.author_name,
    n.editor_name,
    n.chapter_count,
    n.summary,
    n.cover_image_url,
    n.novel_url,
    n.status,
    n.is_approved,
    n.created_by,
    -- Calculate aggregated statistics
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as rating_count,
    COUNT(DISTINCT nom.id) as nomination_count,
    -- Get tags as array (matching novels_with_stats view format)
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
    ARRAY_AGG(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors
FROM user_reading_lists rl
JOIN novels n ON rl.novel_id = n.id
LEFT JOIN ratings r ON n.id = r.novel_id
LEFT JOIN nominations nom ON n.id = nom.novel_id
LEFT JOIN novel_tags nt ON n.id = nt.novel_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.is_approved = true
GROUP BY rl.id, rl.user_id, rl.novel_id, rl.created_at, n.id;

-- Grant SELECT permission on the view
GRANT SELECT ON user_reading_lists_with_details TO authenticated;

-- Add comment to table
COMMENT ON TABLE user_reading_lists IS 'Stores user bookmarks/reading lists for novels';
COMMENT ON COLUMN user_reading_lists.user_id IS 'User who bookmarked the novel';
COMMENT ON COLUMN user_reading_lists.novel_id IS 'Novel that was bookmarked';
COMMENT ON COLUMN user_reading_lists.created_at IS 'When the novel was added to reading list';

