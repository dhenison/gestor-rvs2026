-- ==============================================================================
-- RVS ESCOLAR – Migração v20 (Módulo de Documentos e Requerimentos da Secretaria)
-- Execute no Supabase: SQL Editor ➔ Cole tudo ➔ Run
-- Última atualização: Junho/2026
-- ==============================================================================

-- 1. Cria a tabela de controle de documentos da secretaria
CREATE TABLE IF NOT EXISTS public.documentos_secretaria (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocolo       TEXT UNIQUE NOT NULL,
    aluno_id        UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    tipo            TEXT NOT NULL,
    data_emissao    DATE NOT NULL DEFAULT CURRENT_DATE,
    status          TEXT NOT NULL DEFAULT 'concluido',
    solicitante     TEXT,
    motivo          TEXT,
    obs             TEXT,
    responsavel     TEXT,
    cidade_nascimento TEXT,
    uf_nascimento     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilita RLS para manter padrão de segurança
ALTER TABLE public.documentos_secretaria ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
DROP POLICY IF EXISTS "Gestor pode SELECT" ON public.documentos_secretaria;
CREATE POLICY "Gestor pode SELECT" ON public.documentos_secretaria FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode INSERT" ON public.documentos_secretaria;
CREATE POLICY "Gestor pode INSERT" ON public.documentos_secretaria FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode UPDATE" ON public.documentos_secretaria;
CREATE POLICY "Gestor pode UPDATE" ON public.documentos_secretaria FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Gestor pode DELETE" ON public.documentos_secretaria;
CREATE POLICY "Gestor pode DELETE" ON public.documentos_secretaria FOR DELETE USING (auth.role() = 'authenticated');
