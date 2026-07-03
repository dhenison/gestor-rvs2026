-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — COMPARAÇÃO DETALHADA DE USUÁRIOS
--  Execute no Supabase SQL Editor para criar a RPC de comparação.
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.compare_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_working JSONB;
  v_failing JSONB;
  v_working_identity JSONB;
  v_failing_identity JSONB;
BEGIN
  -- 1. Detalhes de auth.users
  SELECT row_to_json(u) INTO v_working
  FROM auth.users u
  WHERE email = 'carlosdhenison@escola.seduc.pa.gov.br';

  SELECT row_to_json(u) INTO v_failing
  FROM auth.users u
  WHERE email = 'eliete.miranda@escola.seduc.pa.gov.br';

  -- 2. Detalhes de auth.identities
  SELECT jsonb_agg(row_to_json(i)) INTO v_working_identity
  FROM auth.identities i
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'carlosdhenison@escola.seduc.pa.gov.br');

  SELECT jsonb_agg(row_to_json(i)) INTO v_failing_identity
  FROM auth.identities i
  WHERE user_id = (SELECT id FROM auth.users WHERE email = 'eliete.miranda@escola.seduc.pa.gov.br');

  RETURN jsonb_build_object(
    'working_user', v_working,
    'failing_user', v_failing,
    'working_identity', v_working_identity,
    'failing_identity', v_failing_identity
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.compare_users() TO PUBLIC;

NOTIFY pgrst, 'reload schema';
