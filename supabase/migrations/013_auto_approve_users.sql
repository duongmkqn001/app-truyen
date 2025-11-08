-- =====================================================
-- AUTO-APPROVE NEW USERS
-- Change default role from 'pending_approval' to 'reader'
-- =====================================================

-- Update the trigger function to set role as 'reader' instead of 'pending_approval'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, username, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    'reader',  -- Changed from 'pending_approval' to 'reader'
    NOW()
  );
  RETURN NEW;
END;
$$;

