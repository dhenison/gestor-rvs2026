-- ============================================================
-- RVS ESCOLAR - MIGRACAO v25 - MULTI-ESCOLAS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ativa BOOLEAN NOT NULL DEFAULT TRUE,
  modulos_ativos JSONB NOT NULL DEFAULT '{
    "page-dashboard": true,
    "page-agenda": true,
    "page-turmas": true,
    "page-alunos": true,
    "page-boletins": true,
    "page-conselho-classe": true,
    "page-frequencia": true,
    "page-solicitacoes": true,
    "page-rvs-agenda": true,
    "page-horarios": true,
    "page-topo-saber": true,
    "page-transporte": true,
    "page-ocorrencias": true,
    "page-tratamento-ocorrencias": true,
    "page-livros": true,
    "page-relatorios": true,
    "page-documentos-secretaria": true,
    "page-reconhecimento-facial": true,
    "page-usuarios": true,
    "page-permissoes": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.escolas (nome, slug)
VALUES ('E.E. Dr. Romildo Veloso e Silva', 'romildo-veloso-silva')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id BIGSERIAL PRIMARY KEY,
  chave TEXT NOT NULL,
  valor JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.configuracoes
  ADD COLUMN IF NOT EXISTS escola_id UUID;

DO $$
DECLARE
  v_default_school UUID;
BEGIN
  SELECT id
    INTO v_default_school
    FROM public.escolas
   WHERE slug = 'romildo-veloso-silva'
   LIMIT 1;

  IF v_default_school IS NULL THEN
    SELECT id INTO v_default_school FROM public.escolas ORDER BY created_at LIMIT 1;
  END IF;

  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS escola_id UUID;
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS escola_id_ativa UUID;
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS admin_global BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

  UPDATE public.usuarios
     SET escola_id = COALESCE(escola_id, v_default_school),
         escola_id_ativa = COALESCE(escola_id_ativa, escola_id, v_default_school)
   WHERE escola_id IS NULL
      OR escola_id_ativa IS NULL;

  UPDATE public.usuarios
     SET admin_global = CASE
       WHEN lower(email) = 'dhenison@escola.seduc.pa.gov.br' THEN TRUE
       ELSE FALSE
     END
   WHERE admin_global IS DISTINCT FROM CASE
       WHEN lower(email) = 'dhenison@escola.seduc.pa.gov.br' THEN TRUE
       ELSE FALSE
     END;

  UPDATE public.configuracoes
     SET escola_id = COALESCE(escola_id, v_default_school)
   WHERE escola_id IS NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_escola_id_fkey;
  ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_escola_id_ativa_fkey;
  ALTER TABLE public.configuracoes DROP CONSTRAINT IF EXISTS configuracoes_escola_id_fkey;

  ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_escola_id_fkey
    FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

  ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_escola_id_ativa_fkey
    FOREIGN KEY (escola_id_ativa) REFERENCES public.escolas(id);

  ALTER TABLE public.configuracoes
    ADD CONSTRAINT configuracoes_escola_id_fkey
    FOREIGN KEY (escola_id) REFERENCES public.escolas(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.configuracoes DROP CONSTRAINT IF EXISTS configuracoes_chave_unique;
ALTER TABLE public.configuracoes DROP CONSTRAINT IF EXISTS configuracoes_chave_key;
CREATE UNIQUE INDEX IF NOT EXISTS configuracoes_escola_chave_unique
  ON public.configuracoes (escola_id, chave);

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT u.perfil = 'admin'
      FROM public.usuarios u
     WHERE u.id = auth.uid()
     LIMIT 1
  ), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_global()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT u.admin_global
      FROM public.usuarios u
     WHERE u.id = auth.uid()
     LIMIT 1
  ), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.get_current_escola_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT COALESCE(u.escola_id_ativa, u.escola_id)
      FROM public.usuarios u
     WHERE u.id = auth.uid()
     LIMIT 1
  ), NULL::uuid);
$$;

DO $$
DECLARE
  v_default_school UUID;
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'automation_rules',
    'boletins',
    'boletins_turmas',
    'cartoes_acesso_olimpiadas',
    'comunicados',
    'conselho_classe_alunos',
    'conselhos_classe',
    'documentos_secretaria',
    'eventos',
    'frequencia',
    'livros_alunos',
    'notas_bimestrais',
    'obafog_equipes',
    'ocorrencias',
    'olimpiadas',
    'responsaveis',
    'rotas',
    'solicitacoes',
    'turmas',
    'whatsapp_envios',
    'alunos'
  ];
BEGIN
  SELECT id
    INTO v_default_school
    FROM public.escolas
   WHERE slug = 'romildo-veloso-silva'
   LIMIT 1;

  IF v_default_school IS NULL THEN
    SELECT id INTO v_default_school FROM public.escolas ORDER BY created_at LIMIT 1;
  END IF;

  FOREACH v_table IN ARRAY v_tables LOOP
    IF EXISTS (
      SELECT 1
        FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name = v_table
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS escola_id UUID', v_table);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN escola_id SET DEFAULT public.get_current_escola_id()', v_table);
      BEGIN
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (escola_id) REFERENCES public.escolas(id)',
          v_table,
          v_table || '_escola_id_fkey'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
      EXECUTE format('UPDATE public.%I SET escola_id = $1 WHERE escola_id IS NULL', v_table) USING v_default_school;
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  v_default_school UUID;
BEGIN
  SELECT id
    INTO v_default_school
    FROM public.escolas
   WHERE slug = 'romildo-veloso-silva'
   LIMIT 1;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'turmas') THEN
    UPDATE public.turmas
       SET escola_id = COALESCE(escola_id, v_default_school)
     WHERE escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alunos') THEN
    UPDATE public.alunos a
       SET escola_id = COALESCE(a.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE a.turma_id = t.id
       AND a.escola_id IS NULL;

    UPDATE public.alunos
       SET escola_id = COALESCE(escola_id, v_default_school)
     WHERE escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'frequencia') THEN
    UPDATE public.frequencia f
       SET escola_id = COALESCE(f.escola_id, a.escola_id, t.escola_id, v_default_school)
      FROM public.alunos a
      LEFT JOIN public.turmas t ON t.id = a.turma_id
     WHERE f.aluno_id = a.id
       AND f.escola_id IS NULL;

    UPDATE public.frequencia f
       SET escola_id = COALESCE(f.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE f.turma_id = t.id
       AND f.escola_id IS NULL;

    UPDATE public.frequencia
       SET escola_id = COALESCE(escola_id, v_default_school)
     WHERE escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ocorrencias') THEN
    UPDATE public.ocorrencias o
       SET escola_id = COALESCE(o.escola_id, a.escola_id, t.escola_id, v_default_school)
      FROM public.alunos a
      LEFT JOIN public.turmas t ON t.id = a.turma_id
     WHERE o.aluno_id = a.id
       AND o.escola_id IS NULL;

    UPDATE public.ocorrencias o
       SET escola_id = COALESCE(o.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE o.turma_id = t.id
       AND o.escola_id IS NULL;

    UPDATE public.ocorrencias
       SET escola_id = COALESCE(escola_id, v_default_school)
     WHERE escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notas_bimestrais') THEN
    UPDATE public.notas_bimestrais n
       SET escola_id = COALESCE(n.escola_id, a.escola_id, t.escola_id, v_default_school)
      FROM public.alunos a
      LEFT JOIN public.turmas t ON t.id = a.turma_id
     WHERE n.aluno_id = a.id
       AND n.escola_id IS NULL;

    UPDATE public.notas_bimestrais n
       SET escola_id = COALESCE(n.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE n.turma_id = t.id
       AND n.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conselhos_classe') THEN
    UPDATE public.conselhos_classe c
       SET escola_id = COALESCE(c.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE c.turma_id = t.id
       AND c.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conselho_classe_alunos') THEN
    UPDATE public.conselho_classe_alunos cca
       SET escola_id = COALESCE(cca.escola_id, cc.escola_id, a.escola_id, v_default_school)
      FROM public.conselhos_classe cc,
           public.alunos a
     WHERE cca.conselho_id = cc.id
       AND cca.aluno_id = a.id
       AND cca.escola_id IS NULL;

    UPDATE public.conselho_classe_alunos cca
       SET escola_id = COALESCE(cca.escola_id, cc.escola_id, v_default_school)
      FROM public.conselhos_classe cc
     WHERE cca.conselho_id = cc.id
       AND cca.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boletins') THEN
    UPDATE public.boletins b
       SET escola_id = COALESCE(b.escola_id, a.escola_id, t.escola_id, v_default_school)
      FROM public.alunos a
      LEFT JOIN public.turmas t ON t.id = a.turma_id
     WHERE b.aluno_id = a.id
       AND b.escola_id IS NULL;

    UPDATE public.boletins b
       SET escola_id = COALESCE(b.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE b.turma_id = t.id
       AND b.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'boletins_turmas') THEN
    UPDATE public.boletins_turmas bt
       SET escola_id = COALESCE(bt.escola_id, t.escola_id, v_default_school)
      FROM public.turmas t
     WHERE bt.turma_id = t.id
       AND bt.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documentos_secretaria') THEN
    UPDATE public.documentos_secretaria ds
       SET escola_id = COALESCE(ds.escola_id, a.escola_id, v_default_school)
      FROM public.alunos a
     WHERE ds.aluno_id = a.id
       AND ds.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'responsaveis') THEN
    UPDATE public.responsaveis r
       SET escola_id = COALESCE(r.escola_id, a.escola_id, v_default_school)
      FROM public.alunos a
     WHERE r.aluno_id = a.id
       AND r.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'livros_alunos') THEN
    UPDATE public.livros_alunos la
       SET escola_id = COALESCE(la.escola_id, a.escola_id, v_default_school)
      FROM public.alunos a
     WHERE la.aluno_id = a.id
       AND la.escola_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cartoes_acesso_olimpiadas') THEN
    UPDATE public.cartoes_acesso_olimpiadas ca
       SET escola_id = COALESCE(ca.escola_id, a.escola_id, v_default_school)
      FROM public.alunos a
     WHERE ca.aluno_id = a.id
       AND ca.escola_id IS NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.consultar_acesso_servidor(
  p_matricula TEXT,
  p_cpf TEXT,
  p_data_nascimento TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matricula_col TEXT;
  v_cpf_col TEXT;
  v_nasc_col TEXT;
  v_nome TEXT;
  v_email TEXT;
  v_senha TEXT;
  v_sql TEXT;
BEGIN
  SELECT column_name
    INTO v_matricula_col
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'usuarios'
     AND column_name IN ('matricula_sem_vinculo', 'matriculasemvinculo', 'matricula', 'registro_funcional', 'registro')
   ORDER BY CASE column_name
     WHEN 'matricula_sem_vinculo' THEN 1
     WHEN 'matriculasemvinculo' THEN 2
     WHEN 'matricula' THEN 3
     WHEN 'registro_funcional' THEN 4
     ELSE 5
   END
   LIMIT 1;

  SELECT column_name
    INTO v_cpf_col
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'usuarios'
     AND column_name IN ('cpf', 'cpf_servidor')
   ORDER BY CASE column_name WHEN 'cpf' THEN 1 ELSE 2 END
   LIMIT 1;

  SELECT column_name
    INTO v_nasc_col
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'usuarios'
     AND column_name IN ('data_nascimento', 'data_nasc', 'nascimento')
   ORDER BY CASE column_name
     WHEN 'data_nascimento' THEN 1
     WHEN 'data_nasc' THEN 2
     ELSE 3
   END
   LIMIT 1;

  IF v_matricula_col IS NULL OR v_cpf_col IS NULL OR v_nasc_col IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'O cadastro de servidores ainda nao possui os campos necessarios para a recuperacao automatica.'
    );
  END IF;

  v_sql := format(
    'SELECT nome, email, senha
       FROM public.usuarios
      WHERE lower(coalesce(%1$I::text, '''')) = lower($1)
        AND regexp_replace(coalesce(%2$I::text, ''''), ''\D'', '''', ''g'') = regexp_replace(coalesce($2, ''''), ''\D'', '''', ''g'')
        AND to_char((%3$I)::date, ''DD/MM/YYYY'') = $3
        AND coalesce(ativo, TRUE) = TRUE
      LIMIT 1',
    v_matricula_col,
    v_cpf_col,
    v_nasc_col
  );

  EXECUTE v_sql INTO v_nome, v_email, v_senha
    USING lower(trim(p_matricula)), p_cpf, p_data_nascimento;

  IF v_email IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Nao localizamos um servidor com os dados informados.');
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'nome', v_nome,
    'email', v_email,
    'senha', v_senha
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consultar_acesso_servidor(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consultar_acesso_servidor(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.consultar_acesso_servidor(TEXT, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_criar_usuario(
  p_nome TEXT,
  p_email TEXT,
  p_senha TEXT,
  p_perfil TEXT,
  p_turno TEXT,
  p_cargo TEXT,
  p_escola_id UUID DEFAULT NULL,
  p_admin_global BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  encrypted_pw TEXT;
  final_email TEXT;
  v_target_escola_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM public.usuarios u
     WHERE u.id = auth.uid()
       AND u.perfil = 'admin'
  ) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Acesso negado para criar usuarios.');
  END IF;

  IF p_email NOT LIKE '%@escola.seduc.pa.gov.br' THEN
    final_email := split_part(p_email, '@', 1) || '@escola.seduc.pa.gov.br';
  ELSE
    final_email := p_email;
  END IF;

  IF p_admin_global IS TRUE AND public.is_admin_global() IS DISTINCT FROM TRUE THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Somente administradores globais podem criar outro administrador global.');
  END IF;

  v_target_escola_id := COALESCE(
    p_escola_id,
    public.get_current_escola_id(),
    (SELECT id FROM public.escolas ORDER BY created_at LIMIT 1)
  );

  encrypted_pw := crypt(p_senha, gen_salt('bf'));

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

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at
  ) VALUES (
    new_uid, new_uid, jsonb_build_object('sub', new_uid, 'email', final_email), 'email', new_uid::text, NOW(), NOW()
  );

  INSERT INTO public.usuarios (
    id, nome, email, senha, perfil, turno, cargo, ativo, escola_id, escola_id_ativa, admin_global
  ) VALUES (
    new_uid, p_nome, final_email, p_senha, p_perfil, p_turno, p_cargo, TRUE, v_target_escola_id, v_target_escola_id, COALESCE(p_admin_global, FALSE)
  );

  RETURN jsonb_build_object('status', 'success', 'uid', new_uid, 'email', final_email);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_criar_usuario(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_criar_usuario(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_usuarios_multi_escola()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF public.is_admin_global() IS DISTINCT FROM TRUE THEN
      NEW.admin_global := FALSE;
      NEW.escola_id := COALESCE(NEW.escola_id, public.get_current_escola_id());
      NEW.escola_id_ativa := COALESCE(NEW.escola_id_ativa, NEW.escola_id, public.get_current_escola_id());
    END IF;
    RETURN NEW;
  END IF;

  IF public.is_admin_global() IS DISTINCT FROM TRUE THEN
    NEW.admin_global := COALESCE(OLD.admin_global, FALSE);

    IF auth.uid() = OLD.id THEN
      NEW.escola_id := OLD.escola_id;
      NEW.escola_id_ativa := OLD.escola_id_ativa;
      NEW.perfil := OLD.perfil;
    ELSE
      NEW.escola_id := OLD.escola_id;
      NEW.escola_id_ativa := OLD.escola_id_ativa;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_usuarios_multi_escola ON public.usuarios;
CREATE TRIGGER trg_guard_usuarios_multi_escola
BEFORE INSERT OR UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.guard_usuarios_multi_escola();

DO $$
DECLARE
  v_table TEXT;
  v_policy RECORD;
  v_tables TEXT[] := ARRAY[
    'escolas',
    'usuarios',
    'configuracoes',
    'turmas',
    'alunos',
    'frequencia',
    'ocorrencias',
    'eventos',
    'rotas',
    'solicitacoes',
    'olimpiadas',
    'obafog_equipes',
    'livros_alunos',
    'notas_bimestrais',
    'conselhos_classe',
    'conselho_classe_alunos',
    'boletins_turmas',
    'boletins',
    'documentos_secretaria',
    'responsaveis',
    'comunicados',
    'whatsapp_envios',
    'automation_rules',
    'cartoes_acesso_olimpiadas'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name = v_table
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);

      FOR v_policy IN
        SELECT policyname
          FROM pg_policies
         WHERE schemaname = 'public'
           AND tablename = v_table
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', v_policy.policyname, v_table);
      END LOOP;

      IF v_table = 'escolas' THEN
        EXECUTE 'CREATE POLICY escolas_select_policy ON public.escolas FOR SELECT TO authenticated USING (public.is_admin_global() OR id = public.get_current_escola_id())';
        EXECUTE 'CREATE POLICY escolas_insert_policy ON public.escolas FOR INSERT TO authenticated WITH CHECK (public.is_admin_global())';
        EXECUTE 'CREATE POLICY escolas_update_policy ON public.escolas FOR UPDATE TO authenticated USING (public.is_admin_global()) WITH CHECK (public.is_admin_global())';
        EXECUTE 'CREATE POLICY escolas_delete_policy ON public.escolas FOR DELETE TO authenticated USING (public.is_admin_global())';
      ELSIF v_table = 'usuarios' THEN
        EXECUTE 'CREATE POLICY usuarios_select_policy ON public.usuarios FOR SELECT TO authenticated USING (id = auth.uid() OR escola_id = public.get_current_escola_id() OR public.is_admin_global())';
        EXECUTE 'CREATE POLICY usuarios_insert_policy ON public.usuarios FOR INSERT TO authenticated WITH CHECK (public.current_user_is_admin() AND (escola_id = public.get_current_escola_id() OR public.is_admin_global()) AND (public.is_admin_global() OR COALESCE(admin_global, FALSE) = FALSE))';
        EXECUTE 'CREATE POLICY usuarios_update_policy ON public.usuarios FOR UPDATE TO authenticated USING (id = auth.uid() OR (public.current_user_is_admin() AND (escola_id = public.get_current_escola_id() OR public.is_admin_global()) AND (public.is_admin_global() OR COALESCE(admin_global, FALSE) = FALSE))) WITH CHECK ((id = auth.uid() AND (public.is_admin_global() OR COALESCE(admin_global, FALSE) = FALSE)) OR (public.current_user_is_admin() AND (escola_id = public.get_current_escola_id() OR public.is_admin_global()) AND (public.is_admin_global() OR COALESCE(admin_global, FALSE) = FALSE)))';
        EXECUTE 'CREATE POLICY usuarios_delete_policy ON public.usuarios FOR DELETE TO authenticated USING (public.current_user_is_admin() AND (escola_id = public.get_current_escola_id() OR public.is_admin_global()) AND id <> auth.uid())';
      ELSE
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (escola_id = public.get_current_escola_id())', v_table || '_select_policy', v_table);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (escola_id = public.get_current_escola_id())', v_table || '_insert_policy', v_table);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (escola_id = public.get_current_escola_id()) WITH CHECK (escola_id = public.get_current_escola_id())', v_table || '_update_policy', v_table);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (escola_id = public.get_current_escola_id())', v_table || '_delete_policy', v_table);
      END IF;
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.escolas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;

NOTIFY pgrst, 'reload schema';
