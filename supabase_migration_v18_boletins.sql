-- ============================================================
-- RVS ESCOLAR – Migração v18 (Módulo de Boletins Inteligentes)
-- Execute no Supabase: SQL Editor ➔ Cole tudo ➔ Run
-- Última atualização: Maio/2026
-- ============================================================

-- 1. Cria a tabela de boletins individuais
CREATE TABLE IF NOT EXISTS public.boletins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id        UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id        UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    ano             INTEGER NOT NULL,
    periodo         TEXT NOT NULL, -- e.g., '1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre', 'Recuperação', 'Final'
    pdf_base64      TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_aluno_periodo UNIQUE (aluno_id, ano, periodo)
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.boletins ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS para administradores e gestores autenticados
DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.boletins;
CREATE POLICY "Gestor pode SELECT" ON public.boletins
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.boletins;
CREATE POLICY "Gestor pode INSERT" ON public.boletins
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.boletins;
CREATE POLICY "Gestor pode UPDATE" ON public.boletins
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.boletins;
CREATE POLICY "Gestor pode DELETE" ON public.boletins
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Função segura (RPC) com SECURITY DEFINER para o aluno obter seus boletins
CREATE OR REPLACE FUNCTION public.obter_boletim_aluno(
    p_matricula TEXT
)
RETURNS TABLE (
    id UUID,
    ano INTEGER,
    periodo TEXT,
    pdf_base64 TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validação de entrada
    IF p_matricula IS NULL OR TRIM(p_matricula) = '' THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT b.id, b.ano, b.periodo, b.pdf_base64, b.created_at
    FROM public.boletins b
    JOIN public.alunos a ON a.id = b.aluno_id
    WHERE LOWER(TRIM(a.matricula)) = LOWER(TRIM(p_matricula))
    ORDER BY b.ano DESC, b.periodo ASC;
END;
$$;

-- Permissões de execução para anon (portal de acesso público do aluno) e authenticated
GRANT EXECUTE ON FUNCTION public.obter_boletim_aluno(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.obter_boletim_aluno(TEXT) TO authenticated;
