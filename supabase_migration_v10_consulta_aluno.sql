-- ══════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v10 (Acesso do Aluno)
--  OBJETIVO:
--  1. Criar uma tabela separada 'acesso_alunos' contendo:
--     CPF, Nome Completo, E-mail e Senha.
--  2. Criar função segura (RPC) para alunos consultarem seu 
--     e-mail e senha usando apenas o CPF, sem violar RLS.
--
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════

-- Cria a tabela
CREATE TABLE IF NOT EXISTS public.acesso_alunos (
    cpf TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    senha TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilita RLS
ALTER TABLE public.acesso_alunos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (Para permitir que o gestor possa editar/importar se precisar via código depois)
DROP POLICY IF EXISTS "Acesso Gestor na tabela acesso_alunos" ON public.acesso_alunos;
CREATE POLICY "Acesso Gestor na tabela acesso_alunos" ON public.acesso_alunos 
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Função segura (RPC) para consulta pública
CREATE OR REPLACE FUNCTION consultar_acesso_aluno(p_cpf TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Permite a execução ignorando RLS, de forma controlada
AS $$
DECLARE
  v_aluno RECORD;
BEGIN
  -- Busca o aluno pelo CPF
  SELECT nome, email, senha 
  INTO v_aluno 
  FROM public.acesso_alunos 
  WHERE cpf = p_cpf
  LIMIT 1;

  -- Verifica se encontrou
  IF v_aluno.nome IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'CPF não encontrado na nossa base de dados.');
  END IF;

  -- Retorna os dados
  RETURN jsonb_build_object(
    'status', 'success',
    'nome', v_aluno.nome,
    'email', COALESCE(v_aluno.email, 'E-mail não cadastrado'),
    'senha', COALESCE(v_aluno.senha, 'Senha não cadastrada')
  );
END;
$$;
