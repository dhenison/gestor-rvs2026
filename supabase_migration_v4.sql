-- ============================================================
--  RVS ESCOLAR – Migração v4
--  Execute no Supabase: SQL Editor → Cole tudo → Run
--  Objetivo: Criar tabelas solicitacoes e livros_alunos,
--  garantir que ocorrencias tenha todos os campos necessários,
--  e desabilitar RLS para acesso de todos os perfis.
-- ============================================================

-- ── 1. TABELA DE SOLICITAÇÕES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitacoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo        TEXT NOT NULL,
  turno       TEXT,
  turmas      TEXT,
  data        DATE,
  hora_ini    TEXT,
  hora_fim    TEXT,
  obs         TEXT,
  link_drive  TEXT,
  status      TEXT NOT NULL DEFAULT 'pendente',
  responsavel TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilita RLS para que qualquer perfil (professor, secretaria, etc.) possa salvar
ALTER TABLE solicitacoes DISABLE ROW LEVEL SECURITY;

-- ── 2. TABELA DE LIVROS DIDÁTICOS (Entregas por aluno) ───────────────────────
CREATE TABLE IF NOT EXISTS livros_alunos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id    UUID REFERENCES alunos(id) ON DELETE CASCADE,
  livro_idx   INTEGER NOT NULL,
  recebeu     BOOLEAN DEFAULT FALSE,
  data_entrega DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (aluno_id, livro_idx)
);

-- Desabilita RLS para acesso público (todos os perfis do sistema)
ALTER TABLE livros_alunos DISABLE ROW LEVEL SECURITY;

-- ── 3. GARANTIR COLUNAS NA TABELA OCORRENCIAS ────────────────────────────────
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS aluno_id      UUID REFERENCES alunos(id) ON DELETE SET NULL;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS turma_id      UUID REFERENCES turmas(id) ON DELETE SET NULL;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS tipo          TEXT;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS descricao     TEXT;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS hora          TEXT;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS data_ocorr    DATE DEFAULT CURRENT_DATE;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS tratada       BOOLEAN DEFAULT FALSE;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS justificativa TEXT;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS aguardando_pais BOOLEAN DEFAULT FALSE;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS auto_gerada   BOOLEAN DEFAULT FALSE;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS responsavel   TEXT;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS envolvidos    TEXT;
ALTER TABLE ocorrencias ADD COLUMN IF NOT EXISTS origem        TEXT DEFAULT 'manual';

-- Desabilita RLS na tabela ocorrencias para acesso de todos os perfis
ALTER TABLE ocorrencias DISABLE ROW LEVEL SECURITY;

-- ── 4. GARANTIR RLS DESABILITADO NAS DEMAIS TABELAS PRINCIPAIS ───────────────
ALTER TABLE alunos        DISABLE ROW LEVEL SECURITY;
ALTER TABLE turmas        DISABLE ROW LEVEL SECURITY;
ALTER TABLE frequencia    DISABLE ROW LEVEL SECURITY;
ALTER TABLE rotas         DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios      DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE eventos       DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mensagens DISABLE ROW LEVEL SECURITY;

-- ── VERIFICAÇÃO: Execute para confirmar que as tabelas foram criadas ──────────
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
