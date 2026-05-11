-- ══════════════════════════════════════════════
--  RVS ESCOLAR – Migração v5
--  Execute no Supabase: SQL Editor → Run
--  Objetivo: Adicionar colunas de perfil pessoal
--  na tabela usuarios
-- ══════════════════════════════════════════════

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS formacao  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio       TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS whatsapp  TEXT;

-- Confirmar colunas adicionadas:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY column_name;
