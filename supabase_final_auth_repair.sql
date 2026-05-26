-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — CORREÇÃO DEFINITIVA DE AUTH (MIGRAÇÃO v14)
--  Resolve o erro 500 (Database error querying schema / unexpected_failure)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 1: Corrigir campos NULL obrigatórios no auth.users
--  O GoTrue do Supabase espera que estes campos sejam strings vazias ('') 
--  em vez de NULL. Se forem NULL, gera o erro de Schema no login.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  recovery_token = COALESCE(recovery_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE 
  confirmation_token IS NULL OR 
  email_change IS NULL OR 
  email_change_token_new IS NULL OR 
  recovery_token IS NULL OR
  phone_change IS NULL OR
  phone_change_token IS NULL OR
  reauthentication_token IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 2: Alinhar IDs na auth.identities para usuários existentes
--  Garante que a identidade do provedor 'email' use o UID do usuário.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Remove duplicatas de identidade caso existam, mantendo a mais recente
DELETE FROM auth.identities a
WHERE a.provider = 'email' AND a.id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rnum
    FROM auth.identities
    WHERE provider = 'email'
  ) t
  WHERE t.rnum > 1
);

-- Alinha ID e Provider_ID com o UID
UPDATE auth.identities
SET 
  id = user_id::text, -- Garante compatibilidade caso id seja TEXT ou UUID
  provider_id = user_id::text
WHERE provider = 'email' AND (id <> user_id::text OR provider_id <> user_id::text);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 3: Atualizar a função de criação de novos usuários (admin_criar_usuario)
--  Garante que novos usuários inseridos futuramente já nasçam com as strings
--  vazias preenchidas e com a identidade perfeitamente alinhada.
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
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  encrypted_pw TEXT;
  final_email TEXT;
BEGIN
  -- Validação e formatação de domínio oficial
  IF p_email NOT LIKE '%@escola.seduc.pa.gov.br' THEN
    final_email := split_part(p_email, '@', 1) || '@escola.seduc.pa.gov.br';
  ELSE
    final_email := p_email;
  END IF;

  encrypted_pw := crypt(p_senha, gen_salt('bf'));

  -- 1. Insere em auth.users com todas as colunas obrigatórias limpas ('')
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token,
    phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated', final_email, encrypted_pw, 
    NOW(), '{"provider": "email", "providers": ["email"]}', 
    jsonb_build_object('nome', p_nome, 'perfil', p_perfil), 
    NOW(), NOW(),
    '', '', '', '',
    '', '', ''
  );

  -- 2. Insere na auth.identities com o ID e provider_id corretos
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at
  ) VALUES (
    new_uid::text, new_uid, jsonb_build_object('sub', new_uid, 'email', final_email), 'email', new_uid::text, NOW(), NOW()
  );

  -- 3. Insere em public.usuarios
  INSERT INTO public.usuarios (id, nome, email, senha, perfil, turno, cargo)
  VALUES (new_uid, p_nome, final_email, p_senha, p_perfil, p_turno, p_cargo);

  RETURN jsonb_build_object('status', 'success', 'uid', new_uid, 'email', final_email);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  PASSO 4: Limpar a RPC temporária de comparação (opcional, para organização)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROP FUNCTION IF EXISTS public.compare_users();

-- Força o PostgREST a recarregar as definições de schema
NOTIFY pgrst, 'reload schema';
