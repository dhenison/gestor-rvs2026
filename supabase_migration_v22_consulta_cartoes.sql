-- ============================================================
-- RVS ESCOLAR – Migração v22 (Consulta de Cartões de Acesso)
-- Execute no Supabase: SQL Editor ➔ Cole tudo ➔ Run
-- Última atualização: Junho/2026
-- ============================================================

CREATE OR REPLACE FUNCTION public.obter_cartoes_aluno(
    p_cpf             TEXT,
    p_data_nascimento TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com permissões elevadas para poder ler alunos e cartões (que têm RLS)
AS $$
DECLARE
    v_aluno_id        UUID;
    v_aluno_nome      TEXT;
    v_cards           JSONB;
    v_cpf_normalizado TEXT;
BEGIN
    -- Normaliza o CPF digitado removendo caracteres não numéricos
    v_cpf_normalizado := regexp_replace(p_cpf, '\D', '', 'g');

    IF v_cpf_normalizado = '' OR p_data_nascimento = '' THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Por favor, informe o CPF e a Data de Nascimento.'
        );
    END IF;

    -- 1. Tenta localizar o aluno diretamente na tabela public.alunos
    -- Compara matricula formatada/limpa e data de nascimento formatada (DD/MM/AAAA) ou ISO (AAAA-MM-DD)
    SELECT id, nome
    INTO   v_aluno_id, v_aluno_nome
    FROM   public.alunos
    WHERE  (matricula = p_cpf OR regexp_replace(matricula, '\D', '', 'g') = v_cpf_normalizado)
      AND  (
           data_nascimento = p_data_nascimento 
           OR 
           -- Se data_nascimento no banco for YYYY-MM-DD e p_data_nascimento for DD/MM/AAAA
           (LENGTH(p_data_nascimento) = 10 AND data_nascimento = 
            SUBSTRING(p_data_nascimento FROM 7 FOR 4) || '-' || 
            SUBSTRING(p_data_nascimento FROM 4 FOR 2) || '-' || 
            SUBSTRING(p_data_nascimento FROM 1 FOR 2))
           OR
           -- Se data_nascimento no banco for DD/MM/AAAA e p_data_nascimento for YYYY-MM-DD
           (LENGTH(p_data_nascimento) = 10 AND REPLACE(data_nascimento, '-', '/') = 
            SUBSTRING(p_data_nascimento FROM 9 FOR 2) || '/' || 
            SUBSTRING(p_data_nascimento FROM 6 FOR 2) || '/' || 
            SUBSTRING(p_data_nascimento FROM 1 FOR 4))
      )
    LIMIT 1;

    -- 2. Se não encontrou, tenta buscar usando a tabela acesso_alunos para validar a data de nascimento
    IF v_aluno_id IS NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.acesso_alunos 
            WHERE (cpf = p_cpf OR regexp_replace(cpf, '\D', '', 'g') = v_cpf_normalizado)
              AND (
                  data_nascimento = p_data_nascimento 
                  OR 
                  REPLACE(data_nascimento, '/', '-') = REPLACE(p_data_nascimento, '/', '-')
              )
        ) THEN
            RETURN jsonb_build_object(
                'status', 'error',
                'message', 'CPF ou data de nascimento inválidos. Verifique os dados e tente novamente.'
            );
        END IF;

        -- Se validou na tabela acesso_alunos, pega o ID correspondente na tabela alunos pelo CPF
        SELECT id, nome
        INTO   v_aluno_id, v_aluno_nome
        FROM   public.alunos
        WHERE  (matricula = p_cpf OR regexp_replace(matricula, '\D', '', 'g') = v_cpf_normalizado)
        LIMIT 1;
    END IF;

    -- Se não encontrar o registro do aluno ativo na tabela alunos
    IF v_aluno_id IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Cadastro do aluno localizado nas credenciais, mas sem matrícula ativa no sistema escolar.'
        );
    END IF;

    -- 3. Carrega todos os cartões de olimpíadas desse aluno
    SELECT jsonb_agg(
        jsonb_build_object(
            'olimpiada_id', o.id,
            'olimpiada_nome', o.nome,
            'olimpiada_dia', o.dia_prova,
            'pdf_base64', c.pdf_base64
        )
    )
    INTO   v_cards
    FROM   public.cartoes_acesso_olimpiadas c
    JOIN   public.olimpiadas o ON o.id = c.olimpiada_id
    WHERE  c.aluno_id = v_aluno_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'nome', v_aluno_nome,
        'cartoes', COALESCE(v_cards, '[]'::jsonb)
    );
END;
$$;

-- Garante as permissões de execução
REVOKE ALL ON FUNCTION public.obter_cartoes_aluno(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obter_cartoes_aluno(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.obter_cartoes_aluno(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.obter_cartoes_aluno(TEXT, TEXT) IS 'Retorna os cartões de acesso de olimpíadas de um aluno validando CPF e Data de Nascimento.';
