-- ══════════════════════════════════════════════════════════════
--  RVS ESCOLAR – Migração v17 (Segurança e Privacidade dos Resultados com Smart Name Matching)
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
  
  -- Variáveis para o Smart Name Matching (evita falhas de acentos, abreviações ou nomes do meio omitidos)
  v_busca_arr TEXT[];
  v_planilha_arr TEXT[];
  v_matches INT := 0;
  v_i INT;
  v_j INT;
  v_match_ok BOOLEAN := FALSE;
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
    
    -- a) Verificar se é a linha do próprio aluno (Smart Name Matching inteligente)
    v_match_ok := FALSE;
    IF v_nome_busca <> '' AND v_nome_planilha <> '' THEN
      -- Se houver match exato simples ou contém parcial simples
      IF v_nome_busca = v_nome_planilha OR v_nome_busca LIKE '%' || v_nome_planilha || '%' OR v_nome_planilha LIKE '%' || v_nome_busca || '%' THEN
        v_match_ok := TRUE;
      ELSE
        -- Quebrar os nomes em palavras para comparar abreviações ou nomes do meio ausentes
        v_busca_arr := regexp_split_to_array(v_nome_busca, '\s+');
        v_planilha_arr := regexp_split_to_array(v_nome_planilha, '\s+');
        
        -- O primeiro nome deve coincidir exatamente
        IF array_length(v_busca_arr, 1) > 0 AND array_length(v_planilha_arr, 1) > 0 AND v_busca_arr[1] = v_planilha_arr[1] THEN
          v_matches := 0;
          
          -- Comparar os sobrenomes (ignora conectores curtos como 'de', 'da', 'do' de tamanho <= 2)
          FOR v_i IN 2..coalesce(array_length(v_busca_arr, 1), 0) LOOP
            FOR v_j IN 2..coalesce(array_length(v_planilha_arr, 1), 0) LOOP
              IF v_busca_arr[v_i] = v_planilha_arr[v_j] AND length(v_busca_arr[v_i]) > 2 THEN
                v_matches := v_matches + 1;
              END IF;
            END LOOP;
          END LOOP;
          
          -- Se coincidir o primeiro nome + pelo menos 1 sobrenome, ou se um dos nomes for composto de apenas uma palavra
          IF v_matches >= 1 OR array_length(v_busca_arr, 1) = 1 OR array_length(v_planilha_arr, 1) = 1 THEN
            v_match_ok := TRUE;
          END IF;
        END IF;
      END IF;
    END IF;
    
    IF v_match_ok THEN
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
