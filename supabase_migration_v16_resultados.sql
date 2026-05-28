-- ══════════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v16 (Colunas do Modelo e Upload de Resultados)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna 'colunas_modelo' à tabela olimpiadas
ALTER TABLE public.olimpiadas 
ADD COLUMN IF NOT EXISTS colunas_modelo TEXT DEFAULT 'Aluno, Escola, Olimpíada, Acertos, Classificação, Nível';

-- 2. Adiciona a coluna 'resultados_dados' à tabela olimpiadas
ALTER TABLE public.olimpiadas 
ADD COLUMN IF NOT EXISTS resultados_dados JSONB DEFAULT '[]'::jsonb;

-- 3. Atualiza as políticas de RLS e permissões para garantir acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.olimpiadas TO service_role;

COMMENT ON COLUMN public.olimpiadas.colunas_modelo IS 'Colunas configuradas para o modelo de planilha de resultados';
COMMENT ON COLUMN public.olimpiadas.resultados_dados IS 'Resultados dos alunos importados da planilha em formato JSON';
