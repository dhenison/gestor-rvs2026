-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v6  (CORRIGIDA)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════

-- ── 1. UNIQUE em configuracoes.chave ─────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'configuracoes' AND constraint_name = 'configuracoes_chave_unique'
  ) THEN
    ALTER TABLE configuracoes ADD CONSTRAINT configuracoes_chave_unique UNIQUE (chave);
  END IF;
END $$;

-- Garante que valor aceita JSONB
ALTER TABLE configuracoes ALTER COLUMN valor TYPE JSONB USING valor::JSONB;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- Remove duplicatas em configuracoes (mantém a mais antiga)
DELETE FROM configuracoes a
USING configuracoes b
WHERE a.ctid > b.ctid AND a.chave = b.chave;

-- ── 2. UNIQUE em usuarios.email ───────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'usuarios' AND constraint_name = 'usuarios_email_unique'
  ) THEN
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
  END IF;
END $$;

-- ── 3. Colunas de perfil pessoal ──────────────────────────
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS formacao  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio       TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS whatsapp  TEXT;

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- ── Verificação ───────────────────────────────────────────
-- SELECT constraint_name FROM information_schema.table_constraints
-- WHERE table_name IN ('usuarios','configuracoes') ORDER BY table_name;
