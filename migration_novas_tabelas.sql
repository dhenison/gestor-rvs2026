-- ══════════════════════════════════════════════════════════
-- MIGRATION: Criar tabela olimpiadas para o Topo do Saber
-- Execute este script no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS olimpiadas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT NOT NULL,
  area         TEXT NOT NULL CHECK (area IN ('Linguagens','Natureza','Matematica','Humanas')),
  insc_inicio  DATE,
  insc_fim     DATE,
  dia_prova    DATE NOT NULL,
  qtd_alunos   INTEGER DEFAULT 0,
  link_edital  TEXT,
  inscrita     TEXT DEFAULT 'nao' CHECK (inscrita IN ('sim','nao')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE olimpiadas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (mesma abordagem das outras tabelas)
CREATE POLICY "Leitura publica olimpiadas" ON olimpiadas FOR SELECT USING (TRUE);
CREATE POLICY "Escrita publica olimpiadas" ON olimpiadas FOR ALL USING (TRUE);

-- ══════════════════════════════════════════════════════════
-- MIGRATION: Criar tabela solicitacoes_pedagogicas
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS solicitacoes_pedagogicas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo         TEXT NOT NULL,
  turno        TEXT NOT NULL,
  turmas       TEXT,
  data         DATE NOT NULL,
  hora_inicio  TIME,
  hora_fim     TIME,
  observacoes  TEXT,
  status       TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aceita','recusada')),
  responsavel  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE solicitacoes_pedagogicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura publica solicitacoes" ON solicitacoes_pedagogicas FOR SELECT USING (TRUE);
CREATE POLICY "Escrita publica solicitacoes" ON solicitacoes_pedagogicas FOR ALL USING (TRUE);

-- ══════════════════════════════════════════════════════════
-- VERIFICAÇÃO: Ver area constraint de olimpiadas
-- O valor 'Matemática' tem acento - use a versão sem acento: 'Matematica'
-- No frontend já está mapeado corretamente
-- ══════════════════════════════════════════════════════════
