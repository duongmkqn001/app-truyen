-- =====================================================
-- FIX NOVELS_WITH_STATS VIEW TO INCLUDE TAG IDS
-- This fixes the bug where editing a novel doesn't pre-select existing tags
-- =====================================================

-- Drop the old view
DROP VIEW IF EXISTS novels_with_stats;

-- Recreate the view with tag IDs included
CREATE OR REPLACE VIEW novels_with_stats AS
SELECT 
    n.*,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as rating_count,
    COUNT(DISTINCT nom.id) as nomination_count,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
    ARRAY_AGG(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors,
    ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids,
    -- Also create a JSON array of tag objects for easier frontend use
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id', t.id,
                'name', t.name,
                'color', t.color
            )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
    ) as tags
FROM novels n
LEFT JOIN ratings r ON n.id = r.novel_id
LEFT JOIN nominations nom ON n.id = nom.novel_id
LEFT JOIN novel_tags nt ON n.id = nt.novel_id
LEFT JOIN tags t ON nt.tag_id = t.id
GROUP BY n.id;

-- Add comment explaining the view
COMMENT ON VIEW novels_with_stats IS 'Novels with aggregated stats, ratings, nominations, and tags (including tag IDs for editing)';

