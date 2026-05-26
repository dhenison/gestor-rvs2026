-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — Migração v13 (Exclusão Segura e Correção Geral de Login)
--  PROBLEMAS: 
--    1. Exclusão de usuário no painel não o remove do Supabase Auth (e-mail duplicado)
--    2. Usuários cadastrados não conseguem logar (erro 500 ou senha rejeitada)
--    3. Erro "function gen_salt(unknown) does not exist" ao cadastrar ou atualizar senha
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  1. GARANTE EXTENSÃO DE CRIPTOGRAFIA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  2. CORREÇÃO DE IDENTIDADES E CONFIRMAÇÕES DE LOGIN EXISTENTES
--  Garante que todos os usuários tenham sua identidade e status de confirmação corretos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- A) Atualiza o provider_id para user_id::text (evita crash do GoTrue/Auth)
UPDATE auth.identities
SET provider_id = user_id::text
WHERE provider = 'email' AND (provider_id IS NULL OR provider_id <> user_id::text);

-- B) Cria identidade faltante para usuários que por ventura estejam sem registro na auth.identities
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  u.id, 
  jsonb_build_object('sub', u.id, 'email', u.email), 
  'email', 
  u.id::text, 
  NOW(), 
  NOW()
FROM auth.users u
LEFT JOIN auth.identities i ON u.id = i.user_id
WHERE i.user_id IS NULL;

-- C) Garante que a coluna confirmed_at esteja preenchida para todos os usuários ativos logarem
UPDATE auth.users
SET 
  confirmed_at = COALESCE(confirmed_at, email_confirmed_at, NOW()),
  email_confirmed_at = COALESCE(email_confirmed_at, confirmed_at, NOW())
WHERE confirmed_at IS NULL OR email_confirmed_at IS NULL;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  3. RECRIA A FUNÇÃO DE CRIAÇÃO DE USUÁRIOS GARANTINDO CONFIRMAÇÃO E SCHEMA CORRETOS
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
SET search_path = public, auth, extensions -- Adiciona extensions para localizar gen_salt e crypt
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

  -- 1. Insere em auth.users (Garantindo confirmed_at e email_confirmed_at)
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated', final_email, encrypted_pw, 
    NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', 
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


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  4. RECRIA A FUNÇÃO DE ATUALIZAÇÃO DE SENHA GARANTINDO SCHEMA CORRETO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.admin_atualizar_senha(
  p_user_id UUID,
  p_nova_senha TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de superuser
SET search_path = public, auth, extensions -- Adiciona extensions para localizar gen_salt e crypt
AS $$
DECLARE
  encrypted_pw TEXT;
BEGIN
  -- Validação mínima
  IF p_nova_senha IS NULL OR length(p_nova_senha) < 6 THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Senha deve ter ao menos 6 caracteres.');
  END IF;

  -- Criptografa com bcrypt (mesmo algoritmo do Supabase Auth)
  encrypted_pw := crypt(p_nova_senha, gen_salt('bf'));

  -- 1. Atualiza a senha real no Supabase Auth
  UPDATE auth.users
  SET 
    encrypted_password = encrypted_pw,
    updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Usuário não encontrado no Auth.');
  END IF;

  -- 2. Atualiza também na tabela pública (referência)
  UPDATE public.usuarios
  SET senha = p_nova_senha
  WHERE id = p_user_id;

  RETURN jsonb_build_object('status', 'success', 'message', 'Senha atualizada com sucesso.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Garante permissões de execução
REVOKE ALL ON FUNCTION public.admin_atualizar_senha(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_atualizar_senha(UUID, TEXT) TO authenticated;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  5. RECRIA A FUNÇÃO DE EXCLUSÃO DE USUÁRIO GARANTINDO SCHEMA CORRETO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.admin_deletar_usuario(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de superuser
SET search_path = public, auth, extensions
AS $$
BEGIN
  -- Segurança: verifica se o usuário executor está autenticado e é coordenador/admin
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND perfil IN ('admin', 'coordenador')
  ) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Acesso negado: Apenas administradores ou coordenadores podem excluir usuários.');
  END IF;

  -- Impede exclusão própria acidental
  IF p_user_id = auth.uid() THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Não é permitido excluir a si mesmo.');
  END IF;

  -- 1. Remove da tabela pública de usuários
  DELETE FROM public.usuarios WHERE id = p_user_id;

  -- 2. Remove da auth.identities
  DELETE FROM auth.identities WHERE user_id = p_user_id;

  -- 3. Remove de auth.users (isso automaticamente libera o e-mail para novo cadastro)
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN jsonb_build_object('status', 'success', 'message', 'Usuário excluído com sucesso.');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Garante permissões de execução
REVOKE ALL ON FUNCTION public.admin_deletar_usuario(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_deletar_usuario(UUID) TO authenticated;

-- Força reload do schema do Supabase
NOTIFY pgrst, 'reload schema';
