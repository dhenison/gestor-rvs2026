-- ══════════════════════════════════════════════════════════════════════
--  RVS GESTOR — SCHEMA DE COMUNICAÇÃO E WHATSAPP (MIGRAÇÃO v14)
--  Destino: Supabase / PostgreSQL
--  Descrição: Cria tabelas para gestão de responsáveis (guardians),
--  regras de automação, logs de envios e disparos em massa.
--  Preserva totalmente as tabelas existentes (alunos, frequencia, ocorrencias).
-- ══════════════════════════════════════════════════════════════════════

-- Habilita extensão pgcrypto se não existir
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELA DE RESPONSÁVEIS (Pais / Guardiões vinculados aos alunos)
CREATE TABLE IF NOT EXISTS public.responsaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL, -- Formato: DDI + DDD + Número (ex: 5594987654321)
    parentesco VARCHAR(100) DEFAULT 'Responsável',
    notificacoes_ativas BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE REGRAS DE AUTOMAÇÃO E TEMPLATES
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'ENTRADA', 'SAIDA', 'EVASAO', 'OCORRENCIA'
    message_template TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'whatsapp',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE COMUNICADOS (Campanhas em massa)
CREATE TABLE IF NOT EXISTS public.comunicados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'AGENDADO', -- 'AGENDADO', 'ENVIANDO', 'CONCLUIDO', 'FALHA'
    total_destinatarios INT DEFAULT 0,
    enviados_sucesso INT DEFAULT 0,
    falhas INT DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CONTROLE INDIVIDUAL DE DESTINATÁRIOS DA CAMPANHA
CREATE TABLE IF NOT EXISTS public.comunicado_destinatarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comunicado_id UUID NOT NULL REFERENCES public.comunicados(id) ON DELETE CASCADE,
    responsavel_id UUID NOT NULL REFERENCES public.responsaveis(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDENTE', -- 'PENDENTE', 'ENVIADO', 'FALHA'
    erro_log TEXT,
    enviado_em TIMESTAMP WITH TIME ZONE,
    UNIQUE(comunicado_id, responsavel_id)
);

-- 5. AUDITORIA E LOGS GERAIS DE ENVIOS (WhatsApp Envios / Notification Logs)
CREATE TABLE IF NOT EXISTS public.whatsapp_envios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    responsavel_id UUID REFERENCES public.responsaveis(id) ON DELETE SET NULL,
    tipo_evento VARCHAR(50) NOT NULL, -- 'ENTRADA', 'SAIDA', 'EVASAO', 'OCORRENCIA', 'MASSA'
    mensagem TEXT NOT NULL,
    whatsapp_destino VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE', -- 'PENDENTE', 'ENVIADO', 'FALHA', 'ENTREGUE', 'LIDO'
    mensagem_id_whatsapp VARCHAR(255),
    tentativas INT DEFAULT 0,
    erro_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CRIAR ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_responsaveis_aluno ON public.responsaveis(aluno_id);
CREATE INDEX IF NOT EXISTS idx_comunicado_destinatarios_comp ON public.comunicado_destinatarios(comunicado_id, status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_envios_status ON public.whatsapp_envios(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_envios_responsavel ON public.whatsapp_envios(responsavel_id);

-- 7. ATIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicado_destinatarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_envios ENABLE ROW LEVEL SECURITY;

-- 8. CRIAR POLÍTICAS RLS (Permite acesso amplo e seguro para usuários autenticados e anon com apikey)
DROP POLICY IF EXISTS "Acesso Authenticated responsaveis" ON public.responsaveis;
CREATE POLICY "Acesso Authenticated responsaveis" ON public.responsaveis FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Acesso Authenticated rules" ON public.automation_rules;
CREATE POLICY "Acesso Authenticated rules" ON public.automation_rules FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Acesso Authenticated comunicados" ON public.comunicados;
CREATE POLICY "Acesso Authenticated comunicados" ON public.comunicados FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Acesso Authenticated cd" ON public.comunicado_destinatarios;
CREATE POLICY "Acesso Authenticated cd" ON public.comunicado_destinatarios FOR ALL USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Acesso Authenticated envios" ON public.whatsapp_envios;
CREATE POLICY "Acesso Authenticated envios" ON public.whatsapp_envios FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- 9. INSERÇÃO DE REGRAS DE AUTOMAÇÃO PADRÃO
INSERT INTO public.automation_rules (name, event_type, message_template, channel, active) VALUES
  ('Notificação de Entrada', 'ENTRADA', '🔔 *RVS GESTOR - Alerta de Presença*\n\nOlá, Sr(a). *{{guardian_name}}*,\n\nInformamos que o(a) aluno(a) *{{student_name}}* registrou a *ENTRADA* na escola hoje às *{{time}}*.\n\n_Tenha um excelente dia!_', 'whatsapp', TRUE),
  ('Notificação de Saída', 'SAIDA', '🔔 *RVS GESTOR - Alerta de Saída*\n\nOlá, Sr(a). *{{guardian_name}}*,\n\nConfirmamos que o(a) aluno(a) *{{student_name}}* registrou a *SAÍDA* da escola hoje às *{{time}}* e está devidamente liberado(a).', 'whatsapp', TRUE),
  ('Notificação de Evasão Escolar', 'EVASAO', '⚠️ *ALERTA CRÍTICO - EVASÃO DETECTADA*\n\nPrezado(a) *{{guardian_name}}*,\n\nIdentificamos que o(a) aluno(a) *{{student_name}}* registrou entrada na escola hoje, porém *NÃO FOI LOCALIZADO(A)* no momento da chamada de saída consolidada às *{{time}}*.\n\n🚨 *Por favor, entre em contato imediatamente com a coordenação do colégio!*', 'whatsapp', TRUE),
  ('Notificação de Ocorrência Escolar', 'OCORRENCIA', '📋 *RVS GESTOR - Registro de Ocorrência Escolar*\n\nPrezado(a) *{{guardian_name}}*,\n\nInformamos que foi registrada uma ocorrência escolar relacionada ao(à) aluno(a) *{{student_name}}* {{role_label}}:\n\n📌 *Tipo de Ocorrência:* {{incident_type}}\n📌 *Parecer Pedagógico:* _"{{incident_description}}"_\n\nPedimos que acompanhe pelo portal ou entre em contato com a coordenação pedagógica.', 'whatsapp', TRUE)
ON CONFLICT DO NOTHING;

-- Notifica o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';
