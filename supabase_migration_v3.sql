-- ============================================================
--  RVS ESCOLAR — Migração v3
--  Execute no Supabase: SQL Editor → Cole tudo → Run
--  Corrige: tabela olimpiadas, colunas rotas (cap→capacidade)
-- ============================================================

-- ── 1. TABELA OLIMPÍADAS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS olimpiadas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        TEXT NOT NULL,
  area        TEXT NOT NULL DEFAULT 'Linguagens',
  insc_inicio DATE,
  insc_fim    DATE,
  dia_prova   DATE,
  qtd_alunos  INTEGER DEFAULT 0,
  link_edital TEXT,
  inscrita    TEXT NOT NULL DEFAULT 'nao',
  flyer_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE olimpiadas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename='olimpiadas' AND policyname='olimpiadas_public_all'
  ) THEN
    EXECUTE 'CREATE POLICY olimpiadas_public_all ON olimpiadas FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ── 2. CORRIGIR TABELA ROTAS ──────────────────────────────────
-- Renomeia coluna "cap" para "capacidade" se ainda existir com nome antigo
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='rotas' AND column_name='cap'
  ) THEN
    ALTER TABLE rotas RENAME COLUMN cap TO capacidade;
  END IF;
END $$;

-- Garante que a coluna capacidade existe (caso tabela seja nova)
ALTER TABLE rotas ADD COLUMN IF NOT EXISTS capacidade    INTEGER DEFAULT 0;
ALTER TABLE rotas ADD COLUMN IF NOT EXISTS motorista     TEXT;
ALTER TABLE rotas ADD COLUMN IF NOT EXISTS veiculo       TEXT;
ALTER TABLE rotas ADD COLUMN IF NOT EXISTS monitora      TEXT;
ALTER TABLE rotas ADD COLUMN IF NOT EXISTS email_monitora TEXT;

-- ── 3. CORRIGIR TABELA USUARIOS ──────────────────────────────
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turno             TEXT DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turma_responsavel TEXT DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url        TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo             TEXT DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo             BOOLEAN DEFAULT TRUE;

-- ── 4. GARANTIR RLS PÚBLICO NAS TABELAS PRINCIPAIS ───────────
ALTER TABLE rotas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rotas' AND policyname='rotas_public_all') THEN
    EXECUTE 'CREATE POLICY rotas_public_all ON rotas FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usuarios' AND policyname='usuarios_public_all') THEN
    EXECUTE 'CREATE POLICY usuarios_public_all ON usuarios FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;
