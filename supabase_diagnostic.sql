CREATE OR REPLACE FUNCTION public.get_schema_info()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  ret JSONB;
BEGIN
  SELECT jsonb_build_object(
    'identities', (
      SELECT jsonb_agg(jsonb_build_object('column_name', column_name, 'data_type', data_type))
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'identities'
    ),
    'users', (
      SELECT jsonb_agg(jsonb_build_object('column_name', column_name, 'data_type', data_type))
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users'
    )
  ) INTO ret;
  RETURN ret;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_schema_info() TO PUBLIC;

CREATE OR REPLACE FUNCTION public.get_users_identities()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  ret JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'user_id', user_id,
    'provider', provider,
    'provider_id', provider_id,
    'id', id
  )) INTO ret
  FROM auth.identities;
  RETURN ret;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_identities() TO PUBLIC;

NOTIFY pgrst, 'reload schema';
