-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — DIAGNÓSTICO AVANÇADO DE TRIGGERS E FUNÇÕES
--  Execute no Supabase SQL Editor para atualizar a RPC de diagnóstico.
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_schema_info()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  v_triggers JSONB;
  v_functions JSONB;
  v_policies JSONB;
  ret JSONB;
BEGIN
  -- 1. Buscar todos os Triggers não internos nas tabelas de auth e public
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'trigger_name', tg.tgname,
    'table_name', tg.tgrelid::regclass::text,
    'function_name', p.proname,
    'definition', pg_get_triggerdef(tg.oid)
  )), '[]'::jsonb) INTO v_triggers
  FROM pg_trigger tg
  JOIN pg_proc p ON tg.tgfoid = p.oid
  WHERE NOT tg.tgisinternal;

  -- 2. Buscar todas as funções personalizadas no schema public com sua definição
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'proname', p.proname,
    'prosrc', p.prosrc,
    'proconfig', p.proconfig
  )), '[]'::jsonb) INTO v_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.proname NOT IN ('get_schema_info', 'get_users_identities', 'get_auth_users');

  -- 3. Buscar RLS Policies
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'policy_name', pol.polname,
    'table_name', pol.polrelid::regclass::text,
    'roles', pol.polroles,
    'cmd', pol.polcmd,
    'qual', pg_get_expr(pol.polqual, pol.polrelid),
    'with_check', pg_get_expr(pol.polwithcheck, pol.polrelid)
  )), '[]'::jsonb) INTO v_policies
  FROM pg_policy pol;

  SELECT jsonb_build_object(
    'triggers', v_triggers,
    'functions', v_functions,
    'policies', v_policies
  ) INTO ret;
  
  RETURN ret;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_schema_info() TO PUBLIC;

NOTIFY pgrst, 'reload schema';
