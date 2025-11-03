-- =====================================================
-- ADD EXTRA CHAPTERS COLUMN TO NOVELS TABLE
-- For storing "Ngoại truyện" (side story chapters)
-- =====================================================

-- Add extra_chapters column to novels table
ALTER TABLE novels 
ADD COLUMN IF NOT EXISTS extra_chapters INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN novels.extra_chapters IS 'Number of extra/side story chapters (Ngoại truyện)';

