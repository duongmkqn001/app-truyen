-- =====================================================
-- MIGRATION 024: UPDATE READING LIST VIEW
-- =====================================================
-- Purpose: Add missing statistics fields to user_reading_lists_with_details view
-- Date: 2025-11-09
-- =====================================================

-- Drop the existing view
DROP VIEW IF EXISTS user_reading_lists_with_details;

-- Recreate the view with additional statistics fields
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
    n.extra_chapters,
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
    -- Add comment count (likes are only for comments/reviews, not novels)
    COUNT(DISTINCT c.id) as comment_count,
    -- Get tags as array (matching novels_with_stats view format)
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
    ARRAY_AGG(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors,
    ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids
FROM user_reading_lists rl
JOIN novels n ON rl.novel_id = n.id
LEFT JOIN ratings r ON n.id = r.novel_id
LEFT JOIN nominations nom ON n.id = nom.novel_id
LEFT JOIN comments c ON n.id = c.novel_id
LEFT JOIN novel_tags nt ON n.id = nt.novel_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.is_approved = true
GROUP BY rl.id, rl.user_id, rl.novel_id, rl.created_at, n.id;

-- Grant SELECT permission on the view
GRANT SELECT ON user_reading_lists_with_details TO authenticated;

-- Add comment
COMMENT ON VIEW user_reading_lists_with_details IS 'User reading lists with complete novel details and statistics';

