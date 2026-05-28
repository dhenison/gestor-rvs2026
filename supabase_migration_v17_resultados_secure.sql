-- ══════════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v17 (Segurança e Privacidade dos Resultados)
--  Execute no Supabase: SQL Editor → Cole tudo → Run
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.consultar_resultados_olimpiada(
  p_olimpiada_id UUID,
  p_aluno_nome TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dados JSONB;
  v_colunas TEXT;
  v_resultado_pessoal JSONB := NULL;
  v_medalhistas JSONB := '[]'::jsonb;
  v_linha JSONB;
  v_classif TEXT;
  v_nome_planilha TEXT;
  v_nome_busca TEXT := lower(trim(p_aluno_nome));
BEGIN
  -- 1. Buscar os dados brutos e colunas da olimpíada
  SELECT resultados_dados, colunas_modelo
  INTO v_dados, v_colunas
  FROM public.olimpiadas
  WHERE id = p_olimpiada_id;
  
  IF v_dados IS NULL OR jsonb_array_length(v_dados) = 0 THEN
    RETURN jsonb_build_object(
      'sucesso', true,
      'dados_pessoais', NULL,
      'medalhistas', '[]'::jsonb
    );
  END IF;

  -- 2. Processar a planilha linha por linha no banco de dados para segurança
  FOR v_linha IN SELECT * FROM jsonb_array_elements(v_dados) LOOP
    v_classif := lower(trim(coalesce(v_linha->>'Classificação', v_linha->>'Medalha', '')));
    v_nome_planilha := lower(trim(coalesce(v_linha->>'Aluno', '')));
    
    -- a) Verificar se é a linha do próprio aluno (match inteligente de nome)
    IF v_nome_busca <> '' AND v_nome_planilha <> '' AND (v_nome_busca LIKE '%' || v_nome_planilha || '%' OR v_nome_planilha LIKE '%' || v_nome_busca || '%') THEN
      v_resultado_pessoal := v_linha;
    END IF;
    
    -- b) Verificar se é medalhista para incluir no quadro geral
    IF v_classif LIKE '%ouro%' OR v_classif LIKE '%prata%' OR v_classif LIKE '%bronze%' OR v_classif LIKE '%honra%' OR v_classif LIKE '%destaque%' THEN
      v_medalhistas := v_medalhistas || jsonb_build_array(v_linha);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'sucesso', true,
    'dados_pessoais', v_resultado_pessoal,
    'medalhistas', v_medalhistas
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.consultar_resultados_olimpiada(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.consultar_resultados_olimpiada(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consultar_resultados_olimpiada(UUID, TEXT) TO service_role;
