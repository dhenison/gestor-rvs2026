-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Forçar Recarregamento de Cache (Schema Reload)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════

-- ── 1. Forçar o PostgREST a recarregar o schema e permissões ──
NOTIFY pgrst, 'reload schema';

-- ── 2. Garantir novamente as permissões (GRANT) ─────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE configuracoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE configuracoes TO authenticated;

-- ── 3. Verificar quem tem acesso à tabela configuracoes ─────
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'configuracoes' AND table_schema = 'public';
