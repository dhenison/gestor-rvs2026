-- ══════════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v15 (Detalhes e Resultados das Olimpíadas)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna 'descricao' à tabela olimpiadas
ALTER TABLE public.olimpiadas 
ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 2. Adiciona a coluna 'resultados' à tabela olimpiadas
ALTER TABLE public.olimpiadas 
ADD COLUMN IF NOT EXISTS resultados TEXT;

-- 3. Atualiza as políticas de RLS e permissões para garantir acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas TO service_role;

COMMENT ON COLUMN public.olimpiadas.descricao IS 'Descrição detalhada da olimpíada, conteúdos e fases';
COMMENT ON COLUMN public.olimpiadas.resultados IS 'Quadro de medalhas, alunos destacados ou status final da olimpíada';
