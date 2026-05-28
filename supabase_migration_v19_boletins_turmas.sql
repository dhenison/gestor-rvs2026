-- ==============================================================================
-- RVS ESCOLAR – Migração v19 (Armazenamento do Boletim Completo da Turma)
-- Execute no Supabase: SQL Editor ➔ Cole tudo ➔ Run
-- Última atualização: Maio/2026
-- ==============================================================================

-- 1. Cria a tabela de boletins completos por turma
CREATE TABLE IF NOT EXISTS public.boletins_turmas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma_id        UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    ano             INTEGER NOT NULL,
    periodo         TEXT NOT NULL, -- e.g., '1º Bimestre', '2º Bimestre', etc.
    pdf_completo    TEXT NOT NULL, -- Base64 do PDF completo da turma
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_turma_periodo UNIQUE (turma_id, ano, periodo)
);

-- 2. Habilita RLS para boletins de turmas
ALTER TABLE public.boletins_turmas ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.boletins_turmas;
CREATE POLICY "Gestor pode SELECT" ON public.boletins_turmas
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.boletins_turmas;
CREATE POLICY "Gestor pode INSERT" ON public.boletins_turmas
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.boletins_turmas;
CREATE POLICY "Gestor pode UPDATE" ON public.boletins_turmas
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.boletins_turmas;
CREATE POLICY "Gestor pode DELETE" ON public.boletins_turmas
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Função auxiliar segura para verificar quais turmas têm boletim publicado por bimestre
CREATE OR REPLACE FUNCTION public.obter_status_boletins_turmas(
    p_ano INTEGER,
    p_periodo TEXT
)
RETURNS TABLE (
    turma_id UUID,
    boletim_turma_id UUID,
    tem_boletim BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id AS turma_id,
        bt.id AS boletim_turma_id,
        (bt.id IS NOT NULL) AS tem_boletim
    FROM public.turmas t
    LEFT JOIN public.boletins_turmas bt ON bt.turma_id = t.id AND bt.ano = p_ano AND bt.periodo = p_periodo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.obter_status_boletins_turmas(INTEGER, TEXT) TO authenticated;
