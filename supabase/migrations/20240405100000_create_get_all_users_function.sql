-- Function to get all users from auth.users
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (id UUID, email TEXT, created_at TIMESTAMPTZ, last_sign_in_at TIMESTAMPTZ, raw_user_meta_data JSONB)
LANGUAGE sql
SECURITY DEFINER -- Use definer to potentially bypass RLS issues for this specific function
SET search_path = public -- Explicitly set search_path, although auth schema is usually accessible
AS $$
  SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data
  FROM auth.users u;
$$; 