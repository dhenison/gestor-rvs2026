-- ==============================================================================
-- RVS ESCOLAR - Migracao v23 (Validacao publica de documentos da secretaria)
-- Execute no Supabase: SQL Editor -> Cole tudo -> Run
-- ==============================================================================

-- Reforco: anon/public nao devem consultar a tabela diretamente.
REVOKE ALL ON public.documentos_secretaria FROM anon;
REVOKE ALL ON public.documentos_secretaria FROM public;

CREATE OR REPLACE FUNCTION public.consultar_documento_secretaria_publico(
    p_protocolo TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc RECORD;
    v_documento_valido BOOLEAN;
    v_data_validade DATE;
BEGIN
    IF p_protocolo IS NULL OR length(trim(p_protocolo)) < 10 OR length(trim(p_protocolo)) > 32 THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Protocolo invalido para validacao.'
        );
    END IF;

    IF trim(p_protocolo) !~ '^SEC-(DEC|REQ)-[0-9]{4}-[A-Za-z0-9]{1,10}$' THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Formato de protocolo nao reconhecido.'
        );
    END IF;

    SELECT
        d.protocolo,
        d.tipo,
        d.data_emissao,
        d.status,
        d.solicitante,
        d.motivo,
        d.obs,
        d.responsavel,
        d.cidade_nascimento,
        d.uf_nascimento,
        a.nome AS aluno_nome,
        a.matricula AS aluno_matricula,
        a.data_nascimento AS aluno_data_nascimento,
        COALESCE(t.code, '') AS turma_code,
        COALESCE(t.turno, '') AS turma_turno
    INTO v_doc
    FROM public.documentos_secretaria d
    JOIN public.alunos a
      ON a.id = d.aluno_id
    LEFT JOIN public.turmas t
      ON t.id = a.turma_id
    WHERE d.protocolo = trim(p_protocolo)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Documento nao encontrado para este protocolo.'
        );
    END IF;

    IF v_doc.tipo LIKE 'Requerimento%' THEN
        v_data_validade := NULL;
        v_documento_valido := TRUE;
    ELSE
        v_data_validade := (v_doc.data_emissao + INTERVAL '30 days')::DATE;
        v_documento_valido := CURRENT_DATE <= v_data_validade;
    END IF;

    RETURN jsonb_build_object(
        'status', 'success',
        'protocolo', v_doc.protocolo,
        'tipo', v_doc.tipo,
        'data_emissao', v_doc.data_emissao,
        'data_validade', v_data_validade,
        'documento_valido', v_documento_valido,
        'status_documento', v_doc.status,
        'solicitante', COALESCE(v_doc.solicitante, ''),
        'motivo', COALESCE(v_doc.motivo, ''),
        'observacoes', COALESCE(v_doc.obs, ''),
        'responsavel', COALESCE(v_doc.responsavel, 'Secretaria'),
        'cidade_nascimento', COALESCE(v_doc.cidade_nascimento, ''),
        'uf_nascimento', COALESCE(v_doc.uf_nascimento, ''),
        'aluno', jsonb_build_object(
            'nome', COALESCE(v_doc.aluno_nome, ''),
            'matricula', COALESCE(v_doc.aluno_matricula, ''),
            'data_nascimento', COALESCE(v_doc.aluno_data_nascimento::TEXT, ''),
            'turma', COALESCE(v_doc.turma_code, ''),
            'turno', COALESCE(v_doc.turma_turno, '')
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION public.consultar_documento_secretaria_publico(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consultar_documento_secretaria_publico(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.consultar_documento_secretaria_publico(TEXT) TO authenticated;
