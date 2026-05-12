/* supabase_migration_v10_frequencias.sql */
-- Cria tabela para registrar frequência de alunos por data e turno
-- Esta migração deve ser executada após as demais migrações de estrutura.

CREATE TABLE IF NOT EXISTS public.frequencias (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id    uuid        NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id    uuid        NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    data_frequencia date    NOT NULL,
    turno        text        NOT NULL,                -- Manhã, Tarde ou Noite
    tipo         text        NOT NULL,                -- "entrada" ou "saida"
    presente     boolean     NOT NULL DEFAULT true,   -- true = presente, false = ausente
    criado_em    timestamp   NOT NULL DEFAULT now(),
    atualizado_em timestamp   NOT NULL DEFAULT now()
);

-- Trigger para atualizar coluna atualizado_em
CREATE OR REPLACE FUNCTION trigger_atualiza_frequencias()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_frequencias_update
BEFORE UPDATE ON public.frequencias
FOR EACH ROW EXECUTE FUNCTION trigger_atualiza_frequencias();

-- Indexes para consultas rápidas por data e turno
CREATE INDEX idx_frequencias_aluno ON public.frequencias (aluno_id);
CREATE INDEX idx_frequencias_data ON public.frequencias (data_frequencia);
CREATE INDEX idx_frequencias_turno ON public.frequencias (turno);
