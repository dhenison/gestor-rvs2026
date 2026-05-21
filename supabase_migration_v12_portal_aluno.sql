-- ══════════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v12 (Portal do Aluno - Login)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════

-- Função de login do Portal do Aluno (e-mail + senha institucional)
CREATE OR REPLACE FUNCTION public.login_portal_aluno(
    p_email TEXT,
    p_senha TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_aluno RECORD;
    v_turma TEXT;
    v_foto  TEXT;
BEGIN
    -- Busca por e-mail + senha em acesso_alunos
    SELECT cpf, nome, email, senha
    INTO   v_aluno
    FROM   public.acesso_alunos
    WHERE  LOWER(TRIM(email)) = LOWER(TRIM(p_email))
      AND  TRIM(senha)        = TRIM(p_senha)
    LIMIT  1;

    IF v_aluno.nome IS NULL THEN
        RETURN jsonb_build_object(
            'status',  'error',
            'message', 'E-mail ou senha incorretos. Verifique suas credenciais.'
        );
    END IF;

    -- Tenta buscar turma e foto na tabela alunos (por CPF/Matricula)
    SELECT COALESCE(t.code, 'Não informada'), COALESCE(a.foto_url, '')
    INTO   v_turma, v_foto
    FROM   public.alunos a
    LEFT JOIN public.turmas t ON t.id = a.turma_id
    WHERE  a.matricula = v_aluno.cpf
    LIMIT  1;

    RETURN jsonb_build_object(
        'status', 'success',
        'cpf',    v_aluno.cpf,
        'nome',   v_aluno.nome,
        'email',  v_aluno.email,
        'turma',  COALESCE(v_turma, 'Não informada'),
        'foto',   COALESCE(v_foto, '')
    );
END;
$$;

-- Permissão para função anon chamar a RPC
GRANT EXECUTE ON FUNCTION public.login_portal_aluno(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.login_portal_aluno(TEXT, TEXT) TO authenticated;
