-- ══════════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v10 (Acesso do Aluno)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Cria a tabela (se não existir)
CREATE TABLE IF NOT EXISTS public.acesso_alunos (
    cpf             TEXT PRIMARY KEY,
    nome            TEXT NOT NULL,
    email           TEXT,
    senha           TEXT,
    data_nascimento TEXT,          -- formato DD/MM/YYYY
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Caso a tabela já existia sem a coluna, adiciona sem erro:
ALTER TABLE public.acesso_alunos
    ADD COLUMN IF NOT EXISTS data_nascimento TEXT;

-- 2. Habilita RLS
ALTER TABLE public.acesso_alunos ENABLE ROW LEVEL SECURITY;

-- Gestores autenticados podem ler/escrever (para futuro import)
DROP POLICY IF EXISTS "Acesso Gestor na tabela acesso_alunos" ON public.acesso_alunos;
CREATE POLICY "Acesso Gestor na tabela acesso_alunos" ON public.acesso_alunos
FOR ALL
USING  (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Função segura (RPC) — requer CPF + Data de Nascimento
CREATE OR REPLACE FUNCTION consultar_acesso_aluno(
    p_cpf             TEXT,
    p_data_nascimento TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- executa com privilégios elevados, mas filtra por AMBOS os campos
AS $$
DECLARE
    v_aluno RECORD;
BEGIN
    -- Busca somente se CPF E data de nascimento coincidem
    SELECT nome, email, senha
    INTO   v_aluno
    FROM   public.acesso_alunos
    WHERE  cpf             = p_cpf
      AND  data_nascimento = p_data_nascimento
    LIMIT  1;

    IF v_aluno.nome IS NULL THEN
        RETURN jsonb_build_object(
            'status',  'error',
            'message', 'CPF ou data de nascimento não correspondem a nenhum registro.'
        );
    END IF;

    RETURN jsonb_build_object(
        'status', 'success',
        'nome',   v_aluno.nome,
        'email',  COALESCE(v_aluno.email, 'E-mail não cadastrado'),
        'senha',  COALESCE(v_aluno.senha, 'Senha não cadastrada')
    );
END;
$$;
