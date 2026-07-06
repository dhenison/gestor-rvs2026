-- ==============================================================================
-- RVS ESCOLAR - Migracao v24 (Modulo de Conselho de Classe)
-- Execute no Supabase: SQL Editor -> Cole tudo -> Run
-- Ultima atualizacao: Julho/2026
-- ==============================================================================

-- 1. Notas estruturadas por componente e bimestre
CREATE TABLE IF NOT EXISTS public.notas_bimestrais (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id            UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id            UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    ano                 INTEGER NOT NULL,
    periodo             TEXT NOT NULL,
    componente          TEXT NOT NULL,
    nota                NUMERIC(5,2),
    faltas_componente   INTEGER DEFAULT 0,
    origem              TEXT DEFAULT 'manual',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_nota_bimestral UNIQUE (aluno_id, ano, periodo, componente)
);

ALTER TABLE public.notas_bimestrais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.notas_bimestrais;
CREATE POLICY "Gestor pode SELECT" ON public.notas_bimestrais
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.notas_bimestrais;
CREATE POLICY "Gestor pode INSERT" ON public.notas_bimestrais
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.notas_bimestrais;
CREATE POLICY "Gestor pode UPDATE" ON public.notas_bimestrais
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.notas_bimestrais;
CREATE POLICY "Gestor pode DELETE" ON public.notas_bimestrais
FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_notas_bimestrais_aluno_periodo
ON public.notas_bimestrais (aluno_id, ano, periodo);

CREATE INDEX IF NOT EXISTS idx_notas_bimestrais_turma_periodo
ON public.notas_bimestrais (turma_id, ano, periodo);

-- 2. Cabecalho do conselho de classe por turma e bimestre
CREATE TABLE IF NOT EXISTS public.conselhos_classe (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma_id            UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    ano                 INTEGER NOT NULL,
    periodo             TEXT NOT NULL,
    data_reuniao        DATE,
    status              TEXT DEFAULT 'Em preparação',
    componentes         JSONB DEFAULT '[]'::jsonb,
    ata_texto           TEXT,
    criado_por          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_conselho_turma_periodo UNIQUE (turma_id, ano, periodo)
);

ALTER TABLE public.conselhos_classe ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.conselhos_classe;
CREATE POLICY "Gestor pode SELECT" ON public.conselhos_classe
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.conselhos_classe;
CREATE POLICY "Gestor pode INSERT" ON public.conselhos_classe
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.conselhos_classe;
CREATE POLICY "Gestor pode UPDATE" ON public.conselhos_classe
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.conselhos_classe;
CREATE POLICY "Gestor pode DELETE" ON public.conselhos_classe
FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_conselhos_classe_turma_periodo
ON public.conselhos_classe (turma_id, ano, periodo);

-- 3. Parecer individual por aluno analisado no conselho
CREATE TABLE IF NOT EXISTS public.conselho_classe_alunos (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conselho_id                 UUID NOT NULL REFERENCES public.conselhos_classe(id) ON DELETE CASCADE,
    aluno_id                    UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    media_geral                 NUMERIC(5,2),
    frequencia_percentual       NUMERIC(5,2),
    qtd_componentes_abaixo_media INTEGER DEFAULT 0,
    qtd_ocorrencias             INTEGER DEFAULT 0,
    situacao                    TEXT,
    observacao_automatica       TEXT,
    observacao_pedagogica       TEXT,
    parecer_final               TEXT,
    encaminhamento              TEXT,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_conselho_aluno UNIQUE (conselho_id, aluno_id)
);

ALTER TABLE public.conselho_classe_alunos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.conselho_classe_alunos;
CREATE POLICY "Gestor pode SELECT" ON public.conselho_classe_alunos
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.conselho_classe_alunos;
CREATE POLICY "Gestor pode INSERT" ON public.conselho_classe_alunos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.conselho_classe_alunos;
CREATE POLICY "Gestor pode UPDATE" ON public.conselho_classe_alunos
FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.conselho_classe_alunos;
CREATE POLICY "Gestor pode DELETE" ON public.conselho_classe_alunos
FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_conselho_classe_alunos_conselho
ON public.conselho_classe_alunos (conselho_id);

CREATE INDEX IF NOT EXISTS idx_conselho_classe_alunos_aluno
ON public.conselho_classe_alunos (aluno_id);

-- 4. Trigger simples para updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notas_bimestrais_updated_at ON public.notas_bimestrais;
CREATE TRIGGER trg_notas_bimestrais_updated_at
BEFORE UPDATE ON public.notas_bimestrais
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_conselhos_classe_updated_at ON public.conselhos_classe;
CREATE TRIGGER trg_conselhos_classe_updated_at
BEFORE UPDATE ON public.conselhos_classe
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_conselho_classe_alunos_updated_at ON public.conselho_classe_alunos;
CREATE TRIGGER trg_conselho_classe_alunos_updated_at
BEFORE UPDATE ON public.conselho_classe_alunos
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
