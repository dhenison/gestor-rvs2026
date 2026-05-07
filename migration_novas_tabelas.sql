-- ══════════════════════════════════════════════════════════
-- MIGRATION COMPLETA — Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════

-- 1. Tabela: olimpiadas (Topo do Saber)
CREATE TABLE IF NOT EXISTS olimpiadas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT NOT NULL,
  area         TEXT NOT NULL,
  insc_inicio  DATE,
  insc_fim     DATE,
  dia_prova    DATE NOT NULL,
  qtd_alunos   INTEGER DEFAULT 0,
  link_edital  TEXT,
  inscrita     TEXT DEFAULT 'nao' CHECK (inscrita IN ('sim','nao')),
  flyer_url    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE olimpiadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pub_ol_r" ON olimpiadas;
DROP POLICY IF EXISTS "pub_ol_w" ON olimpiadas;
CREATE POLICY "pub_ol_r" ON olimpiadas FOR SELECT USING (TRUE);
CREATE POLICY "pub_ol_w" ON olimpiadas FOR ALL USING (TRUE);

-- 2. Tabela: solicitacoes_pedagogicas
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
DROP POLICY IF EXISTS "pub_sl_r" ON solicitacoes_pedagogicas;
DROP POLICY IF EXISTS "pub_sl_w" ON solicitacoes_pedagogicas;
CREATE POLICY "pub_sl_r" ON solicitacoes_pedagogicas FOR SELECT USING (TRUE);
CREATE POLICY "pub_sl_w" ON solicitacoes_pedagogicas FOR ALL USING (TRUE);

-- 3. Adicionar coluna email UNIQUE na tabela usuarios (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='email') THEN
    ALTER TABLE usuarios ADD COLUMN email TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='avatar_url') THEN
    ALTER TABLE usuarios ADD COLUMN avatar_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='turma_responsavel') THEN
    ALTER TABLE usuarios ADD COLUMN turma_responsavel TEXT;
  END IF;
END $$;
