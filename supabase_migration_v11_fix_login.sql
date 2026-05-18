-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — Migração v11 (Correção Crítica de Login)
--  Corrige erro 500 no Supabase Auth ("Database error querying schema")
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  1. CORREÇÃO DE USUÁRIOS EXISTENTES
--  O Supabase Auth exige que o provider_id seja um UUID em texto.
--  Anteriormente o e-mail foi inserido, causando o crash no GoTrue.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE auth.identities
SET provider_id = user_id::text
WHERE provider = 'email' AND provider_id LIKE '%@%';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  2. CORREÇÃO DA FUNÇÃO DE CRIAÇÃO DE NOVOS USUÁRIOS
--  Garante que novos usuários inseridos pelo admin também usem UUID.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.admin_criar_usuario(
  p_nome TEXT,
  p_email TEXT,
  p_senha TEXT,
  p_perfil TEXT,
  p_turno TEXT,
  p_cargo TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de superuser
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  encrypted_pw TEXT;
  final_email TEXT;
BEGIN
  -- Validação de domínio
  IF p_email NOT LIKE '%@escola.seduc.pa.gov.br' THEN
    final_email := split_part(p_email, '@', 1) || '@escola.seduc.pa.gov.br';
  ELSE
    final_email := p_email;
  END IF;

  encrypted_pw := crypt(p_senha, gen_salt('bf'));

  -- 1. Insere em auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated', final_email, encrypted_pw, 
    NOW(), '{"provider": "email", "providers": ["email"]}', 
    jsonb_build_object('nome', p_nome, 'perfil', p_perfil), 
    NOW(), NOW()
  );

  -- 2. Insere na auth.identities com o provider_id CORRETO (user_id::text)
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid, 'email', final_email), 'email', new_uid::text, NOW(), NOW()
  );

  -- 3. Insere em public.usuarios
  INSERT INTO public.usuarios (id, nome, email, senha, perfil, turno, cargo)
  VALUES (new_uid, p_nome, final_email, p_senha, p_perfil, p_turno, p_cargo);

  RETURN jsonb_build_object('status', 'success', 'uid', new_uid, 'email', final_email);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'LOGIN CORRIGIDO COM SUCESSO: Identidades atualizadas e RPC consertada.';
END;
$$;
