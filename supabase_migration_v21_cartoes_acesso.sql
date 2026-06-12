-- ============================================================
-- RVS ESCOLAR – Migração v21 (Módulo de Cartões de Acesso de Olimpíadas)
-- Execute no Supabase: SQL Editor ➔ Cole tudo ➔ Run
-- Última atualização: Junho/2026
-- ============================================================

-- 1. Cria a tabela de cartões de acesso de olimpíadas
CREATE TABLE IF NOT EXISTS public.cartoes_acesso_olimpiadas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id        UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    olimpiada_id    UUID REFERENCES public.olimpiadas(id) ON DELETE CASCADE,
    pdf_base64      TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_aluno_olimpiada UNIQUE (aluno_id, olimpiada_id)
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.cartoes_acesso_olimpiadas ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS para acesso irrestrito (compatível com as demais tabelas no projeto)
DROP POLICY IF EXISTS "pub_co_r" ON public.cartoes_acesso_olimpiadas;
CREATE POLICY "pub_co_r" ON public.cartoes_acesso_olimpiadas FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "pub_co_w" ON public.cartoes_acesso_olimpiadas;
CREATE POLICY "pub_co_w" ON public.cartoes_acesso_olimpiadas FOR ALL USING (TRUE);

-- 4. Garante permissões de acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cartoes_acesso_olimpiadas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cartoes_acesso_olimpiadas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cartoes_acesso_olimpiadas TO service_role;

COMMENT ON TABLE public.cartoes_acesso_olimpiadas IS 'Tabela que armazena os cartões de acesso individuais dos alunos para as olimpíadas';
