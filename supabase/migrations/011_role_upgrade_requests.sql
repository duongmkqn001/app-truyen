-- =====================================================
-- ROLE UPGRADE REQUESTS TABLE
-- Allows users to request role upgrades from admins
-- =====================================================

-- Create role_upgrade_requests table
CREATE TABLE IF NOT EXISTS role_upgrade_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_role TEXT NOT NULL,  -- Changed from current_role (reserved keyword)
    to_role TEXT NOT NULL CHECK (to_role IN ('member', 'contributor', 'admin')),  -- Changed from requested_role
    request_message TEXT,

    -- Verification fields for contributor/translator requests
    website_url TEXT,  -- Link to website/Wattpad where user translates
    proof_image_url TEXT,  -- URL to proof image (screenshot showing ownership)

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_role_upgrade_requests_user_id ON role_upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_role_upgrade_requests_status ON role_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_upgrade_requests_created_at ON role_upgrade_requests(created_at DESC);

-- Enable RLS
ALTER TABLE role_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own role upgrade requests" ON role_upgrade_requests;
DROP POLICY IF EXISTS "Users can create role upgrade requests" ON role_upgrade_requests;
DROP POLICY IF EXISTS "Admins can update role upgrade requests" ON role_upgrade_requests;

-- Users can view their own requests (using helper function to avoid recursion)
CREATE POLICY "Users can view own role upgrade requests"
ON role_upgrade_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_current_user_admin());

-- Users can create role upgrade requests
CREATE POLICY "Users can create role upgrade requests"
ON role_upgrade_requests
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_banned = true
    )
);

-- Only admins can update role upgrade requests (using helper function)
CREATE POLICY "Admins can update role upgrade requests"
ON role_upgrade_requests
FOR UPDATE
TO authenticated
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Function to approve role upgrade request
CREATE OR REPLACE FUNCTION approve_role_upgrade_request(
    request_uuid UUID,
    admin_uuid UUID,
    notes TEXT DEFAULT ''
)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
    new_role TEXT;
BEGIN
    -- Get the user_id and to_role from the request
    SELECT user_id, to_role INTO user_uuid, new_role
    FROM role_upgrade_requests
    WHERE id = request_uuid AND status = 'pending';

    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update the request
    UPDATE role_upgrade_requests
    SET status = 'approved',
        admin_notes = notes,
        reviewed_by = admin_uuid,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = request_uuid;

    -- Update user role
    UPDATE users
    SET role = new_role,
        updated_at = NOW()
    WHERE id = user_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject role upgrade request
CREATE OR REPLACE FUNCTION reject_role_upgrade_request(
    request_uuid UUID,
    admin_uuid UUID,
    notes TEXT DEFAULT ''
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE role_upgrade_requests
    SET status = 'rejected',
        admin_notes = notes,
        reviewed_by = admin_uuid,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = request_uuid AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to table
COMMENT ON TABLE role_upgrade_requests IS 'Stores user requests for role upgrades (pending_approval → member → contributor → admin)';

