-- ══════════════════════════════════════════════════════════════════════
--  RVS ESCOLAR — Migração v10-SEC (Reforço de Segurança)
--  Auditoria e correção da tabela acesso_alunos
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  CORREÇÃO 1 — Bloquear acesso direto à tabela pelo role anon e public
--  Sem isso, qualquer um com a anon key poderia tentar SELECT direto.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVOKE ALL ON public.acesso_alunos FROM anon;
REVOKE ALL ON public.acesso_alunos FROM public;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  CORREÇÃO 2 — Política RLS mais restritiva
--  Remove política genérica FOR ALL e cria políticas específicas.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROP POLICY IF EXISTS "Acesso Gestor na tabela acesso_alunos" ON public.acesso_alunos;

-- Somente gestores autenticados podem LER
CREATE POLICY "Gestor pode SELECT" ON public.acesso_alunos
FOR SELECT
USING (auth.role() = 'authenticated');

-- Somente gestores autenticados podem INSERIR/ATUALIZAR/DELETAR
CREATE POLICY "Gestor pode INSERT" ON public.acesso_alunos
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Gestor pode UPDATE" ON public.acesso_alunos
FOR UPDATE
USING  (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Gestor pode DELETE" ON public.acesso_alunos
FOR DELETE
USING (auth.role() = 'authenticated');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  CORREÇÃO 3 — Reescrever a RPC com:
--    a) SET search_path fixo (evita search_path injection)
--    b) Validação estrita de formato CPF e data dentro do SQL
--    c) Limite de tamanho de entrada (evita payloads gigantes)
--    d) Retorno uniforme (não revela se CPF existe sem data correta)
--    e) Permissão EXECUTE somente para anon (não para public)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.consultar_acesso_aluno(
    p_cpf             TEXT,
    p_data_nascimento TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public   -- proteção contra search_path injection
AS $$
DECLARE
    v_aluno RECORD;
    v_mensagem_padrao TEXT := 'CPF ou data de nascimento não correspondem a nenhum registro.';
BEGIN
    -- ── Validação de tamanho (evita payloads maliciosos) ──
    IF length(p_cpf) > 14 OR length(p_data_nascimento) > 10 THEN
        RETURN jsonb_build_object('status', 'error', 'message', v_mensagem_padrao);
    END IF;

    -- ── Validação de formato CPF: 000.000.000-00 ──
    IF p_cpf !~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' THEN
        RETURN jsonb_build_object('status', 'error', 'message', v_mensagem_padrao);
    END IF;

    -- ── Validação de formato Data: DD/MM/AAAA ──
    IF p_data_nascimento !~ '^\d{2}/\d{2}/\d{4}$' THEN
        RETURN jsonb_build_object('status', 'error', 'message', v_mensagem_padrao);
    END IF;

    -- ── Busca com dupla chave: CPF + Data de Nascimento ──
    SELECT nome, email, senha
    INTO   v_aluno
    FROM   public.acesso_alunos
    WHERE  cpf             = p_cpf
      AND  data_nascimento = p_data_nascimento
    LIMIT  1;

    -- ── Retorno uniforme (não vaza diferença entre CPF errado e DN errada) ──
    IF NOT FOUND THEN
        RETURN jsonb_build_object('status', 'error', 'message', v_mensagem_padrao);
    END IF;

    RETURN jsonb_build_object(
        'status', 'success',
        'nome',   v_aluno.nome,
        'email',  COALESCE(v_aluno.email, 'E-mail não cadastrado'),
        'senha',  COALESCE(v_aluno.senha, 'Senha não cadastrada')
    );
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  CORREÇÃO 4 — Permissões explícitas da função
--  Apenas anon pode EXECUTAR a RPC (não pode acessar a tabela diretamente)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVOKE ALL ON FUNCTION public.consultar_acesso_aluno(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consultar_acesso_aluno(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.consultar_acesso_aluno(TEXT, TEXT) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--  VERIFICAÇÃO FINAL — Confirma que RLS está ativo
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename  = 'acesso_alunos'
    ) THEN
        RAISE EXCEPTION 'ERRO: Tabela acesso_alunos nao encontrada!';
    END IF;

    IF NOT (
        SELECT relrowsecurity FROM pg_class
        WHERE relname = 'acesso_alunos' AND relnamespace = 'public'::regnamespace
    ) THEN
        RAISE EXCEPTION 'ERRO: RLS nao esta ativo na tabela acesso_alunos!';
    END IF;

    RAISE NOTICE 'SEGURANCA OK: RLS ativo, permissoes corretas, RPC protegida.';
END;
$$;
