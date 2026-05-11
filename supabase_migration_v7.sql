-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v7 (versão final)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════

-- ── 1. Verificar estrutura atual da tabela ────────────────
-- (apenas para diagnóstico — não altera nada)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'configuracoes' AND table_schema = 'public';

-- ── 2. Garantir tipo JSONB na coluna valor ────────────────
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'configuracoes' AND column_name = 'valor' AND table_schema = 'public'
  ) THEN
    ALTER TABLE configuracoes ALTER COLUMN valor TYPE JSONB USING valor::JSONB;
  END IF;
END $$;

-- ── 3. Garantir constraint UNIQUE no chave ────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'configuracoes' 
      AND constraint_name = 'configuracoes_chave_unique'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE configuracoes ADD CONSTRAINT configuracoes_chave_unique UNIQUE (chave);
  END IF;
END $$;

-- ── 4. Desabilitar RLS ────────────────────────────────────
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

-- ── 5. GRANT somente na tabela (sem sequence) ─────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE configuracoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE configuracoes TO authenticated;

-- ── 6. Remover policies conflitantes ─────────────────────
DROP POLICY IF EXISTS "pub_r_config" ON configuracoes;
DROP POLICY IF EXISTS "pub_w_config" ON configuracoes;

-- ── 7. Garantir registro inicial de permissões ────────────
INSERT INTO configuracoes (chave, valor)
VALUES ('permissoes', '[]'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- ── 8. Verificar resultado final ──────────────────────────
SELECT chave, pg_typeof(valor) AS tipo, valor IS NOT NULL AS tem_valor
FROM configuracoes
WHERE chave = 'permissoes';
