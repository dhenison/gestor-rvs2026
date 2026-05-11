-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v6
--  Execute no Supabase: SQL Editor → Cole tudo → Run
--  Objetivo: Garantir UNIQUE em configuracoes.chave para
--  que o upsert com onConflict funcione corretamente.
-- ══════════════════════════════════════════════════════════

-- 1. Garante UNIQUE na coluna chave (necessário para upsert com onConflict)
ALTER TABLE configuracoes
  ADD CONSTRAINT IF NOT EXISTS configuracoes_chave_unique UNIQUE (chave);

-- 2. Garante que a coluna valor seja JSONB (aceita arrays e objetos)
ALTER TABLE configuracoes
  ALTER COLUMN valor TYPE JSONB USING valor::JSONB;

-- 3. Desabilita RLS para acesso sem autenticação Supabase Auth
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- 4. Remove duplicatas antigas de permissoes/links_horarios (keep latest)
DELETE FROM configuracoes a USING (
  SELECT MIN(ctid) as ctid, chave
  FROM configuracoes
  GROUP BY chave
  HAVING COUNT(*) > 1
) b
WHERE a.chave = b.chave AND a.ctid <> b.ctid;

-- 5. Verificação
-- SELECT chave, jsonb_typeof(valor) FROM configuracoes ORDER BY chave;
