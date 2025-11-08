-- =====================================================
-- NOVEL INFORMATION REPORTING
-- Add 'novel_info' to report_type enum
-- =====================================================

-- Add new report type for novel information issues
DO $$ 
BEGIN
    -- Add novel_info if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'novel_info' AND enumtypid = 'report_type'::regtype) THEN
        ALTER TYPE report_type ADD VALUE 'novel_info';
    END IF;
END $$;

-- Add comment to document the new report type
COMMENT ON TYPE report_type IS 'Types of reports: comment (user behavior), review (user behavior), novel_info (missing/inaccurate novel information)';

