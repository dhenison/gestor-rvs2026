-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v6  (VERSÃO ATUALIZADA)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════

-- ── 1. UNIQUE em configuracoes.chave (para upsert de permissões) ─────────
ALTER TABLE configuracoes
  ADD CONSTRAINT IF NOT EXISTS configuracoes_chave_unique UNIQUE (chave);

-- Garante que valor aceita JSONB (arrays e objetos)
ALTER TABLE configuracoes
  ALTER COLUMN valor TYPE JSONB USING valor::JSONB;

ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- Remove duplicatas em configuracoes (mantém a mais recente)
DELETE FROM configuracoes a USING (
  SELECT MIN(ctid) AS ctid, chave
  FROM configuracoes
  GROUP BY chave
  HAVING COUNT(*) > 1
) b
WHERE a.chave = b.chave AND a.ctid <> b.ctid;

-- ── 2. UNIQUE em usuarios.email (para upsert de perfil) ──────────────────
ALTER TABLE usuarios
  ADD CONSTRAINT IF NOT EXISTS usuarios_email_unique UNIQUE (email);

-- ── 3. Garante colunas de perfil pessoal na tabela usuarios ──────────────
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS formacao  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio       TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS whatsapp  TEXT;

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- ── 4. Verificação ────────────────────────────────────────────────────────
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'usuarios' ORDER BY column_name;

-- SELECT constraint_name, constraint_type FROM information_schema.table_constraints
-- WHERE table_name IN ('usuarios','configuracoes');
