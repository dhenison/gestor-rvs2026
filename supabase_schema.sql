-- ============================================================
--  RVS ESCOLAR — Schema Completo v2.0
--  Escola Estadual Dr. Romildo Veloso e Silva — SEDUC/PA
--  Execute no Supabase: SQL Editor → Cole tudo → Run
--  Última atualização: Mai/2026  (v2.1 — coluna senha adicionada)
-- ============================================================

-- ── EXTENSÃO UUID ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
--  TABELAS PRINCIPAIS
-- ============================================================

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
  turma           TEXT,
  turno           TEXT,
  rota            TEXT DEFAULT 'Sem transporte',
  responsavel     TEXT,
  contato         TEXT,
  instagram       TEXT,
  status          TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','transferido','evadido')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── FREQUÊNCIA ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS frequencia (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id    UUID REFERENCES alunos(id) ON DELETE CASCADE,
  turma_id    UUID REFERENCES turmas(id),
  data        DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('entrada','saida')),
  status      TEXT NOT NULL CHECK (status IN ('P','F','FJ')),
  consolidado BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
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

-- ── EVENTOS / AGENDA / CALENDÁRIO ───────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo      TEXT NOT NULL,
  data        DATE NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN (
                'letivo','feriado','bimestre','fim_bimestre',
                'evento','prova','ferias'
              )),
  turno       TEXT DEFAULT 'Geral',
  responsavel TEXT,
  observacoes TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (titulo, data)
);

-- ── LIVROS DIDÁTICOS ────────────────────────────────────────
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
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  rota_id  UUID REFERENCES rotas(id),
  data     DATE NOT NULL DEFAULT CURRENT_DATE,
  vinda    TEXT CHECK (vinda IN ('P','F')),
  ida      TEXT CHECK (ida IN ('P','F')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (aluno_id, data)
);

-- ── CHAT MENSAGENS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mensagens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segmento     TEXT NOT NULL CHECK (segmento IN ('coord','sec','prof')),
  remetente    TEXT NOT NULL,
  destinatario TEXT,
  conteudo     TEXT NOT NULL,
  lida         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── USUÁRIOS DO SISTEMA ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email              TEXT NOT NULL UNIQUE,
  nome               TEXT NOT NULL,
  cargo              TEXT,
  formacao           TEXT,
  bio                TEXT,
  whatsapp           TEXT,
  instagram          TEXT,
  linkedin           TEXT,
  turno              TEXT,
  turma_responsavel  TEXT,
  avatar_url         TEXT,
  senha              TEXT,  -- senha de acesso do usuário (plain ou hash)
  perfil             TEXT DEFAULT 'professor'
                       CHECK (perfil IN ('admin','coordenador','secretaria','professor')),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── PERMISSÕES RBAC ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionalidade  TEXT NOT NULL UNIQUE,
  coordenador     BOOLEAN DEFAULT TRUE,
  secretaria      BOOLEAN DEFAULT FALSE,
  professor       BOOLEAN DEFAULT FALSE
);

-- ── OLIMPÍADAS — TOPO DO SABER ──────────────────────────────
CREATE TABLE IF NOT EXISTS olimpiadas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        TEXT NOT NULL,
  area        TEXT NOT NULL,
  insc_inicio DATE,
  insc_fim    DATE,
  dia_prova   DATE NOT NULL,
  qtd_alunos  INTEGER DEFAULT 0,
  link_edital TEXT,
  inscrita    TEXT DEFAULT 'nao' CHECK (inscrita IN ('sim','nao')),
  flyer_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── SOLICITAÇÕES PEDAGÓGICAS ────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitacoes_pedagogicas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo        TEXT NOT NULL,
  turno       TEXT NOT NULL,
  turmas      TEXT,
  data        DATE NOT NULL,
  hora_inicio TIME,
  hora_fim    TIME,
  observacoes TEXT,
  status      TEXT DEFAULT 'pendente'
                CHECK (status IN ('pendente','aceita','recusada')),
  responsavel TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE turmas                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencia              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE livros                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequencia_transporte   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens               ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE olimpiadas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_pedagogicas ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon key)
CREATE POLICY "pub_r_turmas"    ON turmas                  FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_alunos"    ON alunos                  FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_freq"      ON frequencia              FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_ocorr"     ON ocorrencias             FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_eventos"   ON eventos                 FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_livros"    ON livros                  FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_rotas"     ON rotas                   FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_ft"        ON frequencia_transporte   FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_msgs"      ON mensagens               FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_users"     ON usuarios                FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_perm"      ON permissoes              FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_ol"        ON olimpiadas              FOR SELECT USING (TRUE);
CREATE POLICY "pub_r_sl"        ON solicitacoes_pedagogicas FOR SELECT USING (TRUE);

-- Escrita pública (anon key — ajuste para auth real futuramente)
CREATE POLICY "pub_w_turmas"    ON turmas                  FOR ALL USING (TRUE);
CREATE POLICY "pub_w_alunos"    ON alunos                  FOR ALL USING (TRUE);
CREATE POLICY "pub_w_freq"      ON frequencia              FOR ALL USING (TRUE);
CREATE POLICY "pub_w_ocorr"     ON ocorrencias             FOR ALL USING (TRUE);
CREATE POLICY "pub_w_eventos"   ON eventos                 FOR ALL USING (TRUE);
CREATE POLICY "pub_w_livros"    ON livros                  FOR ALL USING (TRUE);
CREATE POLICY "pub_w_rotas"     ON rotas                   FOR ALL USING (TRUE);
CREATE POLICY "pub_w_ft"        ON frequencia_transporte   FOR ALL USING (TRUE);
CREATE POLICY "pub_w_msgs"      ON mensagens               FOR ALL USING (TRUE);
CREATE POLICY "pub_w_users"     ON usuarios                FOR ALL USING (TRUE);
CREATE POLICY "pub_w_perm"      ON permissoes              FOR ALL USING (TRUE);
CREATE POLICY "pub_w_ol"        ON olimpiadas              FOR ALL USING (TRUE);
CREATE POLICY "pub_w_sl"        ON solicitacoes_pedagogicas FOR ALL USING (TRUE);

-- ============================================================
--  CORREÇÃO DE CONSTRAINTS E COLUNAS (caso a tabela já existia)
-- ============================================================

-- Recria o constraint de tipo da tabela eventos para incluir todos os valores válidos
ALTER TABLE eventos DROP CONSTRAINT IF EXISTS eventos_tipo_check;
ALTER TABLE eventos ADD CONSTRAINT eventos_tipo_check
  CHECK (tipo IN ('letivo','feriado','bimestre','fim_bimestre','evento','prova','ferias'));

-- ── MIGRAÇÕES SEGURAS (colunas opcionais — executar mesmo em bancos existentes) ──
-- Estas instruções são idempotentes: não causam erro se a coluna já existir.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo              TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS formacao           TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio                TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS whatsapp           TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS instagram          TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS linkedin           TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turno              TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS turma_responsavel  TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url         TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil             TEXT DEFAULT 'professor';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha              TEXT;  -- senha de acesso

-- ============================================================
--  DADOS INICIAIS (SEED)
-- ============================================================

-- Turmas da escola
INSERT INTO turmas (code, serie, turno, professor) VALUES
  ('EM-1A',   '1º Ano — Ensino Médio', 'Manhã', 'A Definir'),
  ('EM-2A',   '2º Ano — Ensino Médio', 'Manhã', 'A Definir'),
  ('EM-3A',   '3º Ano — Ensino Médio', 'Manhã', 'A Definir'),
  ('EM-1B',   '1º Ano — Ensino Médio', 'Tarde', 'A Definir'),
  ('EM-2B',   '2º Ano — Ensino Médio', 'Tarde', 'A Definir'),
  ('EM-3B',   '3º Ano — Ensino Médio', 'Tarde', 'A Definir'),
  ('EJA-1',   'EJA — 1ª Etapa',        'Noite', 'A Definir'),
  ('EJA-2',   'EJA — 2ª Etapa',        'Noite', 'A Definir'),
  ('FLUXO-1', 'Projeto Fluxo',          'Tarde', 'A Definir')
ON CONFLICT (code) DO NOTHING;

-- Eventos do calendário escolar
INSERT INTO eventos (titulo, data, tipo, turno, responsavel) VALUES
  ('Dia do Trabalho',       '2026-05-01', 'feriado',      'Geral',  'Sistema'),
  ('Avaliação Bimestral',   '2026-05-05', 'bimestre',     'Geral',  'Coordenação'),
  ('Uso de Chromebooks',    '2026-05-10', 'evento',       'Manhã',  'Coordenação'),
  ('Dia das Mães',          '2026-05-12', 'letivo',       'Geral',  'Coordenação'),
  ('Reserva Auditório',     '2026-05-20', 'evento',       'Noite',  'Coordenação'),
  ('Encerramento 2º Bim.',  '2026-05-28', 'fim_bimestre', 'Geral',  'Coordenação')
ON CONFLICT (titulo, data) DO NOTHING;

-- Rotas de transporte
INSERT INTO rotas (nome, motorista, veiculo, capacidade) VALUES
  ('Rota 01 — Vila Nova', 'José Ferreira',  'Van — PQR-1234',          15),
  ('Rota 02 — Centro',    'Antonio Souza',  'Micro-ônibus — ABX-5678', 25),
  ('Rota 03 — Setor Sul', 'Roberto Melo',   'Ônibus — LMN-9012',       40)
ON CONFLICT (nome) DO NOTHING;

-- Permissões RBAC
INSERT INTO permissoes (funcionalidade, coordenador, secretaria, professor) VALUES
  ('Dashboard',               TRUE,  TRUE,  FALSE),
  ('Frequência — Editar',     TRUE,  FALSE, TRUE),
  ('Frequência — Visualizar', TRUE,  TRUE,  TRUE),
  ('Alunos — Cadastrar',      TRUE,  TRUE,  FALSE),
  ('Alunos — Visualizar',     TRUE,  TRUE,  TRUE),
  ('Ocorrências — Registrar', TRUE,  FALSE, TRUE),
  ('Ocorrências — Visualizar',TRUE,  TRUE,  TRUE),
  ('Livros — Editar',         TRUE,  TRUE,  FALSE),
  ('Transporte — Visualizar', TRUE,  TRUE,  TRUE),
  ('Transporte — Editar',     TRUE,  FALSE, FALSE),
  ('Relatórios — Gerar',      TRUE,  TRUE,  FALSE),
  ('Chat — Acessar',          TRUE,  TRUE,  TRUE),
  ('Olimpíadas — Cadastrar',  TRUE,  FALSE, FALSE),
  ('Solicitações — Criar',    TRUE,  TRUE,  TRUE),
  ('Usuários — Gerenciar',    TRUE,  FALSE, FALSE),
  ('Permissões — Editar',     TRUE,  FALSE, FALSE)
ON CONFLICT (funcionalidade) DO NOTHING;

-- Usuário administrador padrão
INSERT INTO usuarios (email, nome, cargo, perfil, turno, senha) VALUES
  ('dhenison@escola.seduc.pa.gov.br', 'Dhenison Carlos', 'Administrador do Sistema', 'admin', 'Geral', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
--  FUNÇÕES RPC (bypass do schema cache do PostgREST)
-- ============================================================

-- salvar_usuario: Cria ou edita um usuário incluindo a senha
-- Chamada via supabaseClient.rpc('salvar_usuario', {...})
CREATE OR REPLACE FUNCTION salvar_usuario(
  p_id     UUID,
  p_nome   TEXT,
  p_email  TEXT,
  p_perfil TEXT,
  p_turno  TEXT,
  p_cargo  TEXT,
  p_turma  TEXT,
  p_avatar TEXT,
  p_senha  TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_id IS NOT NULL THEN
    -- Editar usuário existente
    UPDATE usuarios SET
      nome              = p_nome,
      email             = p_email,
      perfil            = p_perfil,
      turno             = p_turno,
      cargo             = p_cargo,
      turma_responsavel = p_turma,
      avatar_url        = NULLIF(p_avatar, ''),
      senha             = CASE WHEN p_senha <> '' THEN p_senha ELSE senha END
    WHERE id = p_id;
    v_id := p_id;
  ELSE
    -- Novo usuário
    INSERT INTO usuarios (nome, email, perfil, turno, cargo, turma_responsavel, avatar_url, senha)
    VALUES (p_nome, p_email, p_perfil, p_turno, p_cargo, p_turma, NULLIF(p_avatar,''), p_senha)
    RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$$;
