CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE auth.identities
SET provider_id = user_id::text
WHERE provider = 'email' AND (provider_id IS NULL OR provider_id <> user_id::text);

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

UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

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
  IF p_email NOT LIKE '%@escola.seduc.pa.gov.br' THEN
    final_email := split_part(p_email, '@', 1) || '@escola.seduc.pa.gov.br';
  ELSE
    final_email := p_email;
  END IF;

  encrypted_pw := crypt(p_senha, gen_salt('bf'));

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

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid, 'email', final_email), 'email', new_uid::text, NOW(), NOW()
  );

  INSERT INTO public.usuarios (id, nome, email, senha, perfil, turno, cargo)
  VALUES (new_uid, p_nome, final_email, p_senha, p_perfil, p_turno, p_cargo);

  RETURN jsonb_build_object('status', 'success', 'uid', new_uid, 'email', final_email);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_atualizar_senha(
  p_user_id UUID,
  p_nova_senha TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  encrypted_pw TEXT;
BEGIN
  IF p_nova_senha IS NULL OR length(p_nova_senha) < 6 THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Senha deve ter ao menos 6 caracteres.');
  END IF;

  encrypted_pw := crypt(p_nova_senha, gen_salt('bf'));

  UPDATE auth.users
  SET 
    encrypted_password = encrypted_pw,
    updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Usuário não encontrado no Auth.');
  END IF;

  UPDATE public.usuarios
  SET senha = p_nova_senha
  WHERE id = p_user_id;

  RETURN jsonb_build_object('status', 'success', 'message', 'Senha atualizada com sucesso.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_atualizar_senha(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_atualizar_senha(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_deletar_usuario(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND perfil IN ('admin', 'coordenador')
  ) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Acesso negado: Apenas administradores ou coordenadores podem excluir usuários.');
  END IF;

  IF p_user_id = auth.uid() THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Não é permitido excluir a si mesmo.');
  END IF;

  DELETE FROM public.usuarios WHERE id = p_user_id;
  DELETE FROM auth.identities WHERE user_id = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN jsonb_build_object('status', 'success', 'message', 'Usuário excluído com sucesso.');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_deletar_usuario(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_deletar_usuario(UUID) TO authenticated;

DELETE FROM auth.identities WHERE user_id NOT IN (SELECT id FROM public.usuarios);
DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM public.usuarios);

NOTIFY pgrst, 'reload schema';
