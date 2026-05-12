-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v8 (Segurança e Auth)
--  OBJETIVO:
--  1. Migrar usuários existentes para o auth.users do Supabase
--  2. Ativar Row Level Security (RLS) em TODAS as tabelas
--  3. Criar função segura (RPC) para o Admin criar usuários
--
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════

-- ── 1. Extensão para criptografia (se não existir) ─────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 2. Migrar usuários atuais (public.usuarios -> auth.users)
-- Evita duplicatas usando INSERT ... ON CONFLICT
DO $$
DECLARE
  usr RECORD;
  uid UUID;
  encrypted_pw TEXT;
  final_email TEXT;
BEGIN
  FOR usr IN SELECT * FROM public.usuarios LOOP
    
    -- Se o email não terminar com o domínio oficial, corrige para a migração
    IF usr.email NOT LIKE '%@escola.seduc.pa.gov.br' THEN
      final_email := split_part(usr.email, '@', 1) || '@escola.seduc.pa.gov.br';
    ELSE
      final_email := usr.email;
    END IF;

    -- Gera senha criptografada usando pgcrypto (compatível com Supabase Auth)
    encrypted_pw := crypt(usr.senha, gen_salt('bf'));

    -- Usa o mesmo ID da tabela usuarios se possível, senão um novo
    uid := usr.id;

    -- Tenta inserir no auth.users
    BEGIN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, 
        email_confirmed_at, recovery_sent_at, last_sign_in_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', final_email, encrypted_pw, 
        NOW(), NULL, NULL, 
        '{"provider": "email", "providers": ["email"]}', 
        jsonb_build_object('nome', usr.nome, 'perfil', usr.perfil), 
        NOW(), NOW(), 
        '', '', '', ''
      );
      
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), uid, jsonb_build_object('sub', uid, 'email', final_email), 'email', final_email, NOW(), NOW(), NOW()
      );
      
      -- Atualiza o email no public.usuarios caso tenha sido alterado
      UPDATE public.usuarios SET email = final_email WHERE id = usr.id;
      
    EXCEPTION WHEN unique_violation THEN
      -- Se já existe, ignora e segue para o próximo
      NULL;
    END;
  END LOOP;
END $$;

-- ── 3. Criar função segura (RPC) para Admin criar usuários ─
-- Permite que o Frontend crie usuários passando direto pelo Auth do Supabase
CREATE OR REPLACE FUNCTION admin_criar_usuario(
  p_nome TEXT,
  p_email TEXT,
  p_senha TEXT,
  p_perfil TEXT,
  p_turno TEXT,
  p_cargo TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de superuser (ignora RLS)
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

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid, 'email', final_email), 'email', final_email, NOW(), NOW()
  );

  -- 2. Insere em public.usuarios
  INSERT INTO public.usuarios (id, nome, email, senha, perfil, turno, cargo)
  VALUES (new_uid, p_nome, final_email, p_senha, p_perfil, p_turno, p_cargo);

  RETURN jsonb_build_object('status', 'success', 'uid', new_uid, 'email', final_email);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- ── 4. Ativar RLS (Row Level Security) em todas as tabelas ─
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frequencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obafog_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;

-- ── 5. Criar Políticas de Acesso (Policies) ────────────────
-- Regra geral: Apenas usuários logados via Supabase Auth (role='authenticated') podem ver e alterar dados.

DO $$
DECLARE
  tb TEXT;
  tbs TEXT[] := ARRAY['alunos', 'turmas', 'eventos', 'ocorrencias', 'frequencia', 'rotas', 'configuracoes', 'usuarios', 'obafog_equipes', 'chat_mensagens', 'solicitacoes'];
BEGIN
  FOREACH tb IN ARRAY tbs LOOP
    -- Limpa policies antigas para evitar duplicatas
    EXECUTE format('DROP POLICY IF EXISTS "Acesso Authenticated" ON %I', tb);
    
    -- Cria policy permitindo leitura/escrita total (ALL) apenas para logados
    EXECUTE format('CREATE POLICY "Acesso Authenticated" ON %I FOR ALL USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')', tb);
  END LOOP;
END $$;

-- ── 6. Forçar atualização do cache de permissões ───────────
NOTIFY pgrst, 'reload schema';
