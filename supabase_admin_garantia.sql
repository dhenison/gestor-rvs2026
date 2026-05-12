-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Criar/Garantir Conta de Administrador
--  OBJETIVO: Se a sua conta master não existia na tabela de
--  usuários, o script v8 não a migrou. Este script garante que 
--  você terá o acesso principal ativo.
-- ══════════════════════════════════════════════════════════

DO $$
DECLARE
  new_uid UUID := gen_random_uuid();
  final_email TEXT := 'dhenison@escola.seduc.pa.gov.br';
  encrypted_pw TEXT := crypt('RVS@gestor#', gen_salt('bf'));
BEGIN
  -- Tenta inserir o administrador no auth.users
  BEGIN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated', final_email, encrypted_pw, 
      NOW(), '{"provider": "email", "providers": ["email"]}', 
      jsonb_build_object('nome', 'Dhenison Carlos', 'perfil', 'admin'), 
      NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid, 'email', final_email), 'email', final_email, NOW(), NOW()
    );

    -- Insere na tabela pública
    INSERT INTO public.usuarios (id, nome, email, senha, perfil, cargo)
    VALUES (new_uid, 'Dhenison Carlos', final_email, 'RVS@gestor#', 'admin', 'Administrador do Sistema');
    
  EXCEPTION WHEN unique_violation THEN
    -- Se a conta já existe, atualiza a senha dela para RVS@gestor# por segurança
    UPDATE auth.users SET encrypted_password = encrypted_pw WHERE email = final_email;
    UPDATE public.usuarios SET senha = 'RVS@gestor#' WHERE email = final_email;
  END;
END $$;
