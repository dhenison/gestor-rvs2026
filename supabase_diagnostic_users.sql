CREATE OR REPLACE FUNCTION public.get_auth_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  ret JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'email', email,
    'email_confirmed_at', email_confirmed_at,
    'confirmed_at', confirmed_at,
    'raw_app_meta_data', raw_app_meta_data,
    'raw_user_meta_data', raw_user_meta_data
  )) INTO ret
  FROM auth.users;
  RETURN ret;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_users() TO PUBLIC;

NOTIFY pgrst, 'reload schema';
