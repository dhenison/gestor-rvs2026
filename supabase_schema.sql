-- ============================================================
--  RVS ESCOLAR — Script de criação do banco de dados
--  Execute este SQL no Supabase: SQL Editor → New Query
-- ============================================================

-- ── EXTENSÃO UUID ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TURMAS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS turmas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code       TEXT NOT NULL UNIQUE,
  serie      TEXT NOT NULL,
  turno      TEXT NOT NULL CHECK (turno IN ('Manhã','Tarde','Noite')),
  professor  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ALUNOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alunos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricula       TEXT NOT NULL UNIQUE,
  nome            TEXT NOT NULL,
  data_nascimento DATE,
  turma_id        UUID REFERENCES turmas(id),
  rota            TEXT DEFAULT 'Sem transporte',
  responsavel     TEXT,
  contato         TEXT,
  instagram       TEXT,
  status          TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','transferido','evadido')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── FREQUÊNCIA ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS frequencia (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id   UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id   UUID REFERENCES turmas(id),
  data       DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo       TEXT NOT NULL CHECK (tipo IN ('entrada','saida')),
  status     TEXT NOT NULL CHECK (status IN ('P','F','FJ')),
  consolidado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (aluno_id, data, tipo)
);

-- ── OCORRÊNCIAS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ocorrencias (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo         TEXT NOT NULL CHECK (tipo IN ('evasao','indisciplina','bullying','agressao')),
  aluno_id     UUID REFERENCES alunos(id),
  turma_id     UUID REFERENCES turmas(id),
  participante TEXT,
  descricao    TEXT,
  auto_gerada  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENTOS / AGENDA ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo       TEXT NOT NULL,
  data         DATE NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('letivo','feriado','bimestre','fim_bimestre','evento','prova','ferias')),
  turno        TEXT DEFAULT 'Geral',
  responsavel  TEXT,
  observacoes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (titulo, data)
);

-- ── LIVROS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS livros (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disciplina TEXT NOT NULL,
  icon       TEXT DEFAULT '📖',
  turma_id   UUID REFERENCES turmas(id),
  entregues  INTEGER DEFAULT 0,
  total      INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TRANSPORTE (ROTAS) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS rotas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL UNIQUE,
  motorista  TEXT,
  veiculo    TEXT,
  capacidade INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── FREQUÊNCIA TRANSPORTE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS frequencia_transporte (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id   UUID REFERENCES alunos(id) ON DELETE CASCADE,
  rota_id    UUID REFERENCES rotas(id),
  data       DATE NOT NULL DEFAULT CURRENT_DATE,
  vinda      TEXT CHECK (vinda IN ('P','F')),
  ida        TEXT CHECK (ida IN ('P','F')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (aluno_id, data)
);

-- ── CHAT MENSAGENS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mensagens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segmento   TEXT NOT NULL CHECK (segmento IN ('coord','sec','prof')),
  remetente  TEXT NOT NULL,
  destinatario TEXT,
  conteudo   TEXT NOT NULL,
  lida       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── USUÁRIOS / PERFIL ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  cargo      TEXT,
  formacao   TEXT,
  bio        TEXT,
  whatsapp   TEXT,
  instagram  TEXT,
  linkedin   TEXT,
  perfil     TEXT DEFAULT 'professor' CHECK (perfil IN ('admin','coordenador','secretaria','professor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PERMISSÕES RBAC ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissoes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionalidade TEXT NOT NULL UNIQUE,
  coordenador   BOOLEAN DEFAULT TRUE,
  secretaria    BOOLEAN DEFAULT FALSE,
  professor     BOOLEAN DEFAULT FALSE
);

-- ============================================================
--  DADOS INICIAIS (SEED)
-- ============================================================

-- Turmas
INSERT INTO turmas (code, serie, turno, professor) VALUES
  ('EM-1A', '1º Ano - Ensino Médio', 'Manhã', 'A Definir'),
  ('EM-2A', '2º Ano - Ensino Médio', 'Manhã', 'A Definir'),
  ('EM-3A', '3º Ano - Ensino Médio', 'Manhã', 'A Definir'),
  ('EJA-1', 'EJA - 1ª Etapa', 'Noite', 'A Definir'),
  ('EJA-2', 'EJA - 2ª Etapa', 'Noite', 'A Definir'),
  ('FLUXO-1', 'Projeto Fluxo', 'Tarde', 'A Definir')
ON CONFLICT (code) DO NOTHING;

-- Eventos
INSERT INTO eventos (titulo, data, tipo, turno, responsavel) VALUES
  ('Dia do Trabalho',       '2026-05-01', 'feriado',  'Geral',  'Sistema'),
  ('Avaliação Bimestral',   '2026-05-05', 'bimestre', 'Geral',  'Coordenação'),
  ('Uso de Chromebooks',    '2026-05-10', 'evento',   'Manhã',  'Prof. Carlos'),
  ('Dia das Mães',          '2026-05-12', 'letivo',   'Geral',  'Coordenação'),
  ('Reserva Auditório',     '2026-05-20', 'evento',   'Noite',  'Coord. João'),
  ('Encerramento 2º Bim.',  '2026-05-28', 'bimestre', 'Geral',  'Coordenação')
ON CONFLICT (titulo, data) DO NOTHING;

-- Rotas
INSERT INTO rotas (nome, motorista, veiculo, capacidade) VALUES
  ('Rota 01 — Vila Nova', 'José Ferreira',  'Van — PQR-1234',          15),
  ('Rota 02 — Centro',    'Antonio Souza',  'Micro-ônibus — ABX-5678', 25),
  ('Rota 03 — Setor Sul', 'Roberto Melo',   'Ônibus — LMN-9012',       40)
ON CONFLICT (nome) DO NOTHING;

-- Permissões
INSERT INTO permissoes (funcionalidade, coordenador, secretaria, professor) VALUES
  ('Dashboard',               TRUE,  TRUE,  FALSE),
  ('Frequência — Editar',     TRUE,  FALSE, TRUE),
  ('Frequência — Visualizar', TRUE,  TRUE,  TRUE),
  ('Alunos — Cadastrar',      TRUE,  TRUE,  FALSE),
  ('Ocorrências — Registrar', TRUE,  FALSE, TRUE),
  ('Livros — Editar',         TRUE,  TRUE,  FALSE),
  ('Chat — Acessar',          TRUE,  TRUE,  TRUE),
  ('Permissões — Editar',     TRUE,  FALSE, FALSE)
ON CONFLICT (funcionalidade) DO NOTHING;

-- Usuário administrador
INSERT INTO usuarios (email, nome, cargo, formacao, bio, perfil) VALUES
  ('admin@escola.seduc.pa.gov.br', 'João Administrador', 'Coordenador Geral', 'Especialista em Gestão Escolar', 'Coordenador com 12 anos de experiência', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Habilita RLS em todas as tabelas
ALTER TABLE turmas                ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencia            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE livros                ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencia_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes            ENABLE ROW LEVEL SECURITY;

-- Políticas: acesso público de leitura (anon key)
CREATE POLICY "Leitura pública" ON turmas                FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON alunos                FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON frequencia            FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON ocorrencias           FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON eventos               FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON livros                FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON rotas                 FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON frequencia_transporte FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON mensagens             FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON usuarios              FOR SELECT USING (TRUE);
CREATE POLICY "Leitura pública" ON permissoes            FOR SELECT USING (TRUE);

-- Políticas: escrita pública (anon key) — ajuste para auth real futuramente
CREATE POLICY "Escrita pública" ON turmas                FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON alunos                FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON frequencia            FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON ocorrencias           FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON eventos               FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON livros                FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON rotas                 FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON frequencia_transporte FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON mensagens             FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON usuarios              FOR ALL USING (TRUE);
CREATE POLICY "Escrita pública" ON permissoes            FOR ALL USING (TRUE);
