-- ============================================================
-- RVS ESCOLAR – Migração v24 (Módulo de Reconhecimento Facial & Storage)
-- Execute no Supabase: SQL Editor ➔ Cole tudo ➔ Run
-- Última atualização: Julho/2026
-- ============================================================

-- 1. Habilita a extensão de vetores (pgvector) se não estiver ativa
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Cria a tabela para guardar os vetores faciais (embeddings) dos alunos
CREATE TABLE IF NOT EXISTS public.aluno_faces (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id    UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    embedding   vector(128) NOT NULL, -- Vetor gerado pelo dlib (128 dimensões)
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_aluno_face UNIQUE (aluno_id)
);

-- 3. Habilita Row Level Security (RLS) para aluno_faces
ALTER TABLE public.aluno_faces ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS para aluno_faces (acesso público para simplificação)
DROP POLICY IF EXISTS "pub_faces_r" ON public.aluno_faces;
CREATE POLICY "pub_faces_r" ON public.aluno_faces FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "pub_faces_w" ON public.aluno_faces;
CREATE POLICY "pub_faces_w" ON public.aluno_faces FOR ALL USING (TRUE);

-- 5. Garante permissões de acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aluno_faces TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aluno_faces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aluno_faces TO service_role;

-- 6. Cria índice para busca vetorial rápida (distância L2 / Euclidiana)
CREATE INDEX IF NOT EXISTS idx_aluno_faces_l2 ON public.aluno_faces USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- 7. Função de busca por proximidade vetorial (RPC)
CREATE OR REPLACE FUNCTION public.buscar_aluno_por_face(
    p_embedding vector(128),
    p_limite_distancia FLOAT DEFAULT 0.6
)
RETURNS TABLE (
    aluno_id UUID,
    nome TEXT,
    foto_url TEXT,
    turma_nome TEXT,
    distancia FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS aluno_id,
        a.nome,
        a.foto_url,
        t.nome AS turma_nome,
        (f.embedding <-> p_embedding) AS distancia
    FROM public.aluno_faces f
    JOIN public.alunos a ON a.id = f.aluno_id
    LEFT JOIN public.turmas t ON t.id = a.turma_id
    WHERE (f.embedding <-> p_embedding) < p_limite_distancia
    ORDER BY f.embedding <-> p_embedding
    LIMIT 1;
END;
$$;

-- 8. Configuração do Bucket no Supabase Storage
-- Cria o bucket 'fotos-sistema' para salvar fotos de alunos e usuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-sistema', 'fotos-sistema', true)
ON CONFLICT (id) DO NOTHING;

-- Habilita políticas de acesso público para o storage
DROP POLICY IF EXISTS "Acesso Publico Leitura" ON storage.objects;
CREATE POLICY "Acesso Publico Leitura" ON storage.objects FOR SELECT USING (bucket_id = 'fotos-sistema');

DROP POLICY IF EXISTS "Permitir Upload" ON storage.objects;
CREATE POLICY "Permitir Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos-sistema');

DROP POLICY IF EXISTS "Permitir Update" ON storage.objects;
CREATE POLICY "Permitir Update" ON storage.objects FOR UPDATE USING (bucket_id = 'fotos-sistema');

DROP POLICY IF EXISTS "Permitir Delete" ON storage.objects;
CREATE POLICY "Permitir Delete" ON storage.objects FOR DELETE USING (bucket_id = 'fotos-sistema');

COMMENT ON TABLE public.aluno_faces IS 'Tabela que armazena os embeddings faciais dos alunos para reconhecimento facial';
