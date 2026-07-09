-- ============================================================
-- RVS ESCOLAR - MIGRACAO v26 - FIX DOCUMENTOS SECRETARIA MULTI-ESCOLA
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.documentos_secretaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT UNIQUE NOT NULL,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'concluido',
  solicitante TEXT,
  motivo TEXT,
  obs TEXT,
  responsavel TEXT,
  cidade_nascimento TEXT,
  uf_nascimento TEXT,
  escola_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documentos_secretaria
  ADD COLUMN IF NOT EXISTS cidade_nascimento TEXT,
  ADD COLUMN IF NOT EXISTS uf_nascimento TEXT,
  ADD COLUMN IF NOT EXISTS escola_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.routines
     WHERE routine_schema = 'public'
       AND routine_name = 'get_current_escola_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.documentos_secretaria ALTER COLUMN escola_id SET DEFAULT public.get_current_escola_id()';
  END IF;
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'escolas'
  ) THEN
    ALTER TABLE public.documentos_secretaria DROP CONSTRAINT IF EXISTS documentos_secretaria_escola_id_fkey;
    ALTER TABLE public.documentos_secretaria
      ADD CONSTRAINT documentos_secretaria_escola_id_fkey
      FOREIGN KEY (escola_id) REFERENCES public.escolas(id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
DECLARE
  v_default_school UUID;
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'escolas'
  ) THEN
    SELECT id
      INTO v_default_school
      FROM public.escolas
     WHERE slug = 'romildo-veloso-silva'
     LIMIT 1;

    IF v_default_school IS NULL THEN
      SELECT id INTO v_default_school FROM public.escolas ORDER BY created_at LIMIT 1;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = 'alunos'
  ) THEN
    UPDATE public.documentos_secretaria ds
       SET escola_id = COALESCE(ds.escola_id, a.escola_id, v_default_school)
      FROM public.alunos a
     WHERE ds.aluno_id = a.id
       AND ds.escola_id IS NULL;
  END IF;

  IF v_default_school IS NOT NULL THEN
    UPDATE public.documentos_secretaria
       SET escola_id = v_default_school
     WHERE escola_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.documentos_secretaria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.documentos_secretaria;
DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.documentos_secretaria;
DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.documentos_secretaria;
DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.documentos_secretaria;
DROP POLICY IF EXISTS documentos_secretaria_select_policy ON public.documentos_secretaria;
DROP POLICY IF EXISTS documentos_secretaria_insert_policy ON public.documentos_secretaria;
DROP POLICY IF EXISTS documentos_secretaria_update_policy ON public.documentos_secretaria;
DROP POLICY IF EXISTS documentos_secretaria_delete_policy ON public.documentos_secretaria;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.routines
     WHERE routine_schema = 'public'
       AND routine_name = 'get_current_escola_id'
  ) THEN
    EXECUTE 'CREATE POLICY documentos_secretaria_select_policy ON public.documentos_secretaria FOR SELECT TO authenticated USING (escola_id = public.get_current_escola_id())';
    EXECUTE 'CREATE POLICY documentos_secretaria_insert_policy ON public.documentos_secretaria FOR INSERT TO authenticated WITH CHECK (escola_id = public.get_current_escola_id())';
    EXECUTE 'CREATE POLICY documentos_secretaria_update_policy ON public.documentos_secretaria FOR UPDATE TO authenticated USING (escola_id = public.get_current_escola_id()) WITH CHECK (escola_id = public.get_current_escola_id())';
    EXECUTE 'CREATE POLICY documentos_secretaria_delete_policy ON public.documentos_secretaria FOR DELETE TO authenticated USING (escola_id = public.get_current_escola_id())';
  ELSE
    EXECUTE 'CREATE POLICY "Gestor pode SELECT" ON public.documentos_secretaria FOR SELECT TO authenticated USING (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Gestor pode INSERT" ON public.documentos_secretaria FOR INSERT TO authenticated WITH CHECK (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Gestor pode UPDATE" ON public.documentos_secretaria FOR UPDATE TO authenticated USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')';
    EXECUTE 'CREATE POLICY "Gestor pode DELETE" ON public.documentos_secretaria FOR DELETE TO authenticated USING (auth.role() = ''authenticated'')';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documentos_secretaria_escola_data
  ON public.documentos_secretaria (escola_id, data_emissao DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documentos_secretaria_aluno_escola
  ON public.documentos_secretaria (aluno_id, escola_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_secretaria TO authenticated;

NOTIFY pgrst, 'reload schema';
