-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — CRIAÇÃO DE ÍNDICES DE DESEMPENHO (OTIMIZAÇÃO)
-- ══════════════════════════════════════════════════════════════════════
--  Objetivo: Resolver o aviso "exhausting multiple resources" no Supabase.
--  Cole este script completo no "SQL Editor" do seu Supabase Dashboard e execute-o.
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  1. ÍNDICES EM TABELAS CRÍTICAS E DE HISTÓRICO (Crescimento Rápido)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Tabela: frequencia (Consultada diariamente para chamadas e relatórios)
CREATE INDEX IF NOT EXISTS idx_frequencia_aluno_id ON public.frequencia(aluno_id);
CREATE INDEX IF NOT EXISTS idx_frequencia_turma_id ON public.frequencia(turma_id);
CREATE INDEX IF NOT EXISTS idx_frequencia_data ON public.frequencia(data);
-- Índice composto para acelerar a query principal da chamada: busca por turma e dia
CREATE INDEX IF NOT EXISTS idx_frequencia_turma_data ON public.frequencia(turma_id, data);

-- Tabela: alunos (Joins frequentes com turmas)
CREATE INDEX IF NOT EXISTS idx_alunos_turma_id ON public.alunos(turma_id);

-- Tabela: ocorrencias (Consultas por aluno e por turma)
CREATE INDEX IF NOT EXISTS idx_ocorrencias_aluno_id ON public.ocorrencias(aluno_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_turma_id ON public.ocorrencias(turma_id);

-- Tabela: frequencia_transporte
CREATE INDEX IF NOT EXISTS idx_freq_transp_aluno ON public.frequencia_transporte(aluno_id);
CREATE INDEX IF NOT EXISTS idx_freq_transp_rota ON public.frequencia_transporte(rota_id);
CREATE INDEX IF NOT EXISTS idx_freq_transp_data ON public.frequencia_transporte(data);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  2. ÍNDICES PARA TABELAS COM ARQUIVOS PESADOS (PDFs Base64)
--  *IMPORTANTE*: Consultas sem índice nestas tabelas forçam um sequential scan,
--  carregando megabytes de PDFs na memória, o que trava instantaneamente o banco.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Tabela: boletins (PDFs individuais dos alunos)
CREATE INDEX IF NOT EXISTS idx_boletins_aluno_id ON public.boletins(aluno_id);
CREATE INDEX IF NOT EXISTS idx_boletins_turma_id ON public.boletins(turma_id);

-- Tabela: boletins_turmas (PDFs completos de turmas)
CREATE INDEX IF NOT EXISTS idx_boletins_turmas_turma_id ON public.boletins_turmas(turma_id);

-- Tabela: cartoes_acesso_olimpiadas (PDFs de cartões de acesso)
CREATE INDEX IF NOT EXISTS idx_cartoes_olimp_aluno ON public.cartoes_acesso_olimpiadas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_olimp_olimpiada ON public.cartoes_acesso_olimpiadas(olimpiada_id);

-- Tabela: livros_alunos
CREATE INDEX IF NOT EXISTS idx_livros_alunos_aluno_id ON public.livros_alunos(aluno_id) WHERE aluno_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_livros_alunos_turma_id ON public.livros_alunos(turma_id) WHERE turma_id IS NOT NULL;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  3. ÍNDICES PARA OUTROS RELACIONAMENTOS E RELATÓRIOS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Tabela: documentos_secretaria
CREATE INDEX IF NOT EXISTS idx_doc_sec_aluno ON public.documentos_secretaria(aluno_id);

-- Tabela: solicitacoes (Seus registros por aluno/status)
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aluno ON public.solicitacoes(aluno_id) WHERE aluno_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes(status);

-- Tabela: mensagens
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON public.mensagens(created_at DESC);

-- Tabela: olimpiadas
CREATE INDEX IF NOT EXISTS idx_olimpiadas_dia_prova ON public.olimpiadas(dia_prova);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  4. RECONSTRUÇÃO DE ESTATÍSTICAS DO POSTGRES
--  Força o otimizador do Postgres a utilizar os novos índices imediatamente
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYZE public.alunos;
ANALYZE public.frequencia;
ANALYZE public.ocorrencias;
ANALYZE public.frequencia_transporte;
ANALYZE public.boletins;
ANALYZE public.boletins_turmas;
ANALYZE public.cartoes_acesso_olimpiadas;
ANALYZE public.documentos_secretaria;

-- Recarrega a configuração do PostgREST
NOTIFY pgrst, 'reload schema';
