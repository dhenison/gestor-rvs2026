-- ============================================================
-- RVS ESCOLAR - IMPORTAÇÃO DE LOTAÇÃO & CARÊNCIAS (2026)
-- Execute este script no SQL Editor do Supabase.
-- ============================================================

DO $$
DECLARE
  v_escola_id UUID;
BEGIN
  -- 1. Garantir que a escola existe e obter o escola_id
  INSERT INTO public.escolas (nome, slug)
  VALUES ('E.E. Dr. Romildo Veloso e Silva', 'romildo-veloso-silva')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_escola_id FROM public.escolas WHERE slug = 'romildo-veloso-silva';

  -- 2. Limpar os dados de lotação antigos da escola
  DELETE FROM public.lotacao_alocacoes WHERE escola_id = v_escola_id;
  DELETE FROM public.lotacao_componentes_turma WHERE escola_id = v_escola_id;
  DELETE FROM public.lotacao_professores WHERE escola_id = v_escola_id;

  -- 3. Inserir/Atualizar turmas se necessário
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('EEMAE01', 'AEE - Atendimento Educacional Especializado', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1MNM01', '1º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1MNM02', '1º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1MNM03', '1º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1MNM04', '1º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1MNM05', '1º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2MNM01', '2º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2MNM02', '2º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2MNM03', '2º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2MNM04', '2º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3MNM01', '3º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3MNM02', '3º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3MNM03', '3º Ano - Ensino Médio', 'Manhã', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1NCF03', '1º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1NNJ01', '1º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1NNJ02', '1º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1NNM01', '1º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1NNM02', '1º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1NNM03', '1º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2NNJ01', '2º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2NNJ02', '2º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2NNM01', '2º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2NNM02', '2º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2NNM03', '2º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3NNM01', '3º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3NNM02', '3º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3NNM03', '3º Ano - Ensino Médio', 'Noite', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('EETAE01', 'AEE - Atendimento Educacional Especializado', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1TNM01', '1º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1TNM02', '1º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1TNM03', '1º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1TNM04', '1º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M1TNM05', '1º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2TNM01', '2º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2TNM02', '2º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2TNM03', '2º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M2TNM04', '2º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3TNM01', '3º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3TNM02', '3º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;
  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)
  VALUES ('M3TNM03', '3º Ano - Ensino Médio', 'Tarde', 'A Definir', v_escola_id)
  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;

  -- 4. Inserir Professores
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'CLEUSIONE CALACIO SANTANA', '5973373-2', 'Professor', 40, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'JAIRO LEITE BARBOSA', '5929941-3', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'ROMULO FRANCA CRUZ', '51855718-2', 'Professor', 35, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'GISELIE DA SILVA PUGAS', '6404470-1', 'Professor', 32, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'CHARLENE SILVA MAIA', '5908639-4', 'Professor', 39, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'LUCIENE DIVINA AFONSO DE SOUSA', '5957224-1', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'FRANCISCA MARIA DA CONCEICAO', '5952068-2', 'Professor', 29, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'MANOEL MESSIAS NERES SILVA', '5948444-1', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'FRANCISCO BENTO DE MORAIS FILHO', '57220557-1', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'MARCIEL APARECIDO DELFINO', '5973374-2', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'GILMAR VIEIRA DE SOUZA', '54187301-2', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'ALDIANE ALVES DE SOUSA TELES', '57190862-1', 'Professor', 42, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'FRANCINALDO OLIVEIRA ARAUJO', '5919993-4', 'Professor', 43, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'TALIANE DE SOUZA DUARTE', '5951608-2', 'Professor', 40, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'RONERIO BEZERRA DE OLIVEIRA', '57195008-1', 'Professor', 43, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'VANUSA MARIA MARQUES', '6001076-2', 'Professor', 33, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'JAQUELINE MENDES GONCALVES', '6300562-1', 'Professor', 27, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'JECONIAS DE SOUZA LEITE', '7566147-1', 'Professor', 38, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'POLIANA PEREIRA ROMUALDO DA SILVA', '5973369-2', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'WANDERSON SANTOS SOUSA COIMBRA', '5998425-1', 'Professor', 30, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'HELICLENE DA SILVA LIMA', '57198307-4', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'CLAEDIS RAFALSKI MARTINS', '55587150-2', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'ROMIS DE SOUSA MORAES', '57204076-1', 'Professor', 30, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'IPOJIANA TAVARES PAIVA', '5973375-2', 'Professor', 43, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'ELIANE ALVES SILVA MOURA', '5998656-1', 'Professor', 25, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'RONALDE RODRIGUES CARDOSO', '57204181-1', 'Professor', 44, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'FRANCO MONTIEL DA SILVA DOS SANTOS', '5998964-1', 'Professor', 28, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'JADNA PEREIRA DA SILVA', '5973737-2', 'Professor', 38, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'DANIEL FERNANDES CARNEIRO', '54192960-2', 'Professor', 38, true);
  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)
  VALUES (v_escola_id, 'LUCIA DA SILVA SANTOS LEITE', '5948546-1', 'Professor', 16, true);

  -- 5. Inserir Componentes Curriculares
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'EEMAE01' LIMIT 1),
    'EEMAE01',
    2026,
    '553596',
    'AEE',
    'AEE - Atendimento Educacional Especializado',
    'Manhã',
    'EDUCACAO ESPECIAL',
    20,
    20,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM01' LIMIT 1),
    'M1MNM01',
    2026,
    '553598',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM02' LIMIT 1),
    'M1MNM02',
    2026,
    '553597',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CNT - APROF DE AREAS DE CIENCIAS DA NATUREZA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CNT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CNT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM03' LIMIT 1),
    'M1MNM03',
    2026,
    '553599',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CNT - CIENCIA, TECNOLOGIA E INOVACAO',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM04' LIMIT 1),
    'M1MNM04',
    2026,
    '553600',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1MNM05' LIMIT 1),
    'M1MNM05',
    2026,
    '553601',
    'REG',
    '1º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM01' LIMIT 1),
    'M2MNM01',
    2026,
    '553602',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM02' LIMIT 1),
    'M2MNM02',
    2026,
    '553604',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM03' LIMIT 1),
    'M2MNM03',
    2026,
    '554342',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2MNM04' LIMIT 1),
    'M2MNM04',
    2026,
    '553603',
    'REG',
    '2º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG LOG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM01' LIMIT 1),
    'M3MNM01',
    2026,
    '554343',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM02' LIMIT 1),
    'M3MNM02',
    2026,
    '553606',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3MNM03' LIMIT 1),
    'M3MNM03',
    2026,
    '553605',
    'REG',
    '3º Ano - Ensino Médio',
    'Manhã',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    5,
    5,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'APROF DE AREAS DE CIENCIAS DA NATUREZA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NCF03' LIMIT 1),
    'M1NCF03',
    2026,
    '554501',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    7,
    7,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    7,
    7,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ01' LIMIT 1),
    'M1NNJ01',
    2026,
    '553828',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    7,
    7,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    7,
    7,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNJ02' LIMIT 1),
    'M1NNJ02',
    2026,
    '554499',
    'EJA',
    '1º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM01' LIMIT 1),
    'M1NNM01',
    2026,
    '553829',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM02' LIMIT 1),
    'M1NNM02',
    2026,
    '554500',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1NNM03' LIMIT 1),
    'M1NNM03',
    2026,
    '559838',
    'REG',
    '1º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'PROJETO DE VIDA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'CIENCIAS DA NATUREZA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'ELETIVA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ01' LIMIT 1),
    'M2NNJ01',
    2026,
    '482669',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'ELETIVA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'PROJETO DE VIDA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNJ02' LIMIT 1),
    'M2NNJ02',
    2026,
    '559524',
    'EJA',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM01' LIMIT 1),
    'M2NNM01',
    2026,
    '554503',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '554504',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM02' LIMIT 1),
    'M2NNM02',
    2026,
    '563508',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2NNM03' LIMIT 1),
    'M2NNM03',
    2026,
    '554502',
    'REG',
    '2º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM01' LIMIT 1),
    'M3NNM01',
    2026,
    '554505',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM02' LIMIT 1),
    'M3NNM02',
    2026,
    '554506',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '559807',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3NNM03' LIMIT 1),
    'M3NNM03',
    2026,
    '563301',
    'REG',
    '3º Ano - Ensino Médio',
    'Noite',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'EETAE01' LIMIT 1),
    'EETAE01',
    2026,
    '554021',
    'AEE',
    'AEE - Atendimento Educacional Especializado',
    'Tarde',
    'EDUCACAO ESPECIAL',
    20,
    20,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM01' LIMIT 1),
    'M1TNM01',
    2026,
    '554661',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM02' LIMIT 1),
    'M1TNM02',
    2026,
    '554662',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CNT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CNT - APROF DE AREAS DE CIENCIAS DA NATUREZA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CNT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CNT - CIENCIA, TECNOLOGIA E INOVACAO',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM03' LIMIT 1),
    'M1TNM03',
    2026,
    '554664',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM04' LIMIT 1),
    'M1TNM04',
    2026,
    '554663',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M1TNM05' LIMIT 1),
    'M1TNM05',
    2026,
    '554022',
    'REG',
    '1º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM01' LIMIT 1),
    'M2TNM01',
    2026,
    '554667',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '554665',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM02' LIMIT 1),
    'M2TNM02',
    2026,
    '563292',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM03' LIMIT 1),
    'M2TNM03',
    2026,
    '554023',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '554666',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M2TNM04' LIMIT 1),
    'M2TNM04',
    2026,
    '563277',
    'REG',
    '2º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM01' LIMIT 1),
    'M3TNM01',
    2026,
    '554025',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LGG - PRODUCAO TEXTUAL',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM02' LIMIT 1),
    'M3TNM02',
    2026,
    '554026',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LINGUA PORTUGUESA E SUAS LITERATURAS',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'LINGUA INGLESA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'SOCIOLOGIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'HISTORIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'FILOSOFIA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MATEMATICA',
    4,
    4,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'GEOGRAFIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'FISICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'QUIMICA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'ARTES',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'EDUCACAO FISICA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA',
    1,
    1,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'BIOLOGIA',
    2,
    2,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS',
    3,
    3,
    true
  );
  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.turmas WHERE code = 'M3TNM03' LIMIT 1),
    'M3TNM03',
    2026,
    '554024',
    'REG',
    '3º Ano - Ensino Médio',
    'Tarde',
    'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS',
    2,
    2,
    true
  );

  -- 6. Inserir Alocações de Professores
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLEUSIONE CALACIO SANTANA' AND matricula = '5973373-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'EEMAE01' AND disciplina = 'EDUCACAO ESPECIAL' AND oferta = '553596' AND escola_id = v_escola_id LIMIT 1),
    20,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'FISICA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'ARTES' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'BIOLOGIA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'QUIMICA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'HISTORIA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM01' AND disciplina = 'FILOSOFIA' AND oferta = '553598' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'HISTORIA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'QUIMICA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'FISICA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'FILOSOFIA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'BIOLOGIA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'ARTES' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '553597' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'BIOLOGIA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'CNT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'CNT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'QUIMICA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'HISTORIA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'ARTES' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'FILOSOFIA' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM03' AND disciplina = 'CNT - CIENCIA, TECNOLOGIA E INOVACAO' AND oferta = '553599' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'ARTES' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'GEOGRAFIA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'BIOLOGIA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'QUIMICA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'FILOSOFIA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'LINGUA INGLESA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'FISICA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'SOCIOLOGIA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'HISTORIA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM04' AND disciplina = 'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA' AND oferta = '553600' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'QUIMICA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'FILOSOFIA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'SOCIOLOGIA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'HISTORIA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'LINGUA INGLESA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'MATEMATICA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'GEOGRAFIA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'ARTES' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1MNM05' AND disciplina = 'BIOLOGIA' AND oferta = '553601' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'FILOSOFIA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'BIOLOGIA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'HISTORIA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'QUIMICA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'MATEMATICA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'ARTES' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM01' AND disciplina = 'FISICA' AND oferta = '553602' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'QUIMICA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'BIOLOGIA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'MATEMATICA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'ARTES' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'HISTORIA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'FISICA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'FILOSOFIA' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553604' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'FILOSOFIA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'ARTES' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'FISICA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'MATEMATICA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'HISTORIA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'QUIMICA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM03' AND disciplina = 'BIOLOGIA' AND oferta = '554342' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'LINGUA INGLESA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'GEOGRAFIA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'MATEMATICA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'QUIMICA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'BIOLOGIA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'FILOSOFIA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'SOCIOLOGIA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'ARTES' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2MNM04' AND disciplina = 'HISTORIA' AND oferta = '553603' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'FILOSOFIA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'HISTORIA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'FISICA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'QUIMICA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'BIOLOGIA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'ARTES' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM01' AND disciplina = 'MATEMATICA' AND oferta = '554343' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'BIOLOGIA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'QUIMICA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'ARTES' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'HISTORIA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'FISICA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'FILOSOFIA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'MATEMATICA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553606' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'HISTORIA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'ARTES' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'MATEMATICA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'QUIMICA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'FILOSOFIA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'BIOLOGIA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'FISICA' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3MNM03' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553605' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    5,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'ARTES' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'GEOGRAFIA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONALDE RODRIGUES CARDOSO' AND matricula = '57204181-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'APROF DE AREAS DE CIENCIAS DA NATUREZA E SUAS TECNOLOGIAS' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'MATEMATICA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'SOCIOLOGIA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'FILOSOFIA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'HISTORIA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'FISICA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONALDE RODRIGUES CARDOSO' AND matricula = '57204181-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'QUIMICA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'PRODUCAO TEXTUAL' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NCF03' AND disciplina = 'BIOLOGIA' AND oferta = '554501' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'QUIMICA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    7,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'ARTES' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'SOCIOLOGIA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'FILOSOFIA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'LINGUA INGLESA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'HISTORIA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'MATEMATICA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    7,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'GEOGRAFIA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'BIOLOGIA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ01' AND disciplina = 'FISICA' AND oferta = '553828' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'ARTES' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'QUIMICA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'BIOLOGIA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'GEOGRAFIA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    7,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'HISTORIA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'FILOSOFIA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNJ02' AND disciplina = 'FISICA' AND oferta = '554499' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'FILOSOFIA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'HISTORIA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'QUIMICA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'ARTES' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'BIOLOGIA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'FISICA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '553829' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'HISTORIA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'FILOSOFIA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'FISICA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'BIOLOGIA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'MATEMATICA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'QUIMICA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'ARTES' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1NNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554500' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'HISTORIA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'SOCIOLOGIA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'FILOSOFIA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'BIOLOGIA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'QUIMICA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'PROJETO DE VIDA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'LINGUA INGLESA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'ARTES' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'ELETIVA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNJ01' AND disciplina = 'GEOGRAFIA' AND oferta = '482669' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'FISICA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'HISTORIA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'MATEMATICA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'BIOLOGIA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'FILOSOFIA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'QUIMICA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'ARTES' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM01' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554503' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'ARTES' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'QUIMICA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'FILOSOFIA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'HISTORIA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'BIOLOGIA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'MATEMATICA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'FISICA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM02' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554504' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'HISTORIA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'ARTES' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'MATEMATICA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'BIOLOGIA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'QUIMICA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIENE DIVINA AFONSO DE SOUSA' AND matricula = '5957224-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'FISICA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMULO FRANCA CRUZ' AND matricula = '51855718-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'FILOSOFIA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2NNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '554502' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'BIOLOGIA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'VANUSA MARIA MARQUES' AND matricula = '6001076-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'QUIMICA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'HISTORIA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'MATEMATICA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'ARTES' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'FILOSOFIA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'FISICA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554505' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'HISTORIA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'FILOSOFIA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'QUIMICA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'MATEMATICA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'ARTES' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'FISICA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM02' AND disciplina = 'BIOLOGIA' AND oferta = '554506' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'FISICA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'HISTORIA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'MATEMATICA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'QUIMICA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'BIOLOGIA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ELIANE ALVES SILVA MOURA' AND matricula = '5998656-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'ARTES' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3NNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '559807' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLEUSIONE CALACIO SANTANA' AND matricula = '5973373-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'EETAE01' AND disciplina = 'EDUCACAO ESPECIAL' AND oferta = '554021' AND escola_id = v_escola_id LIMIT 1),
    20,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'BIOLOGIA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'FISICA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'MATEMATICA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'FILOSOFIA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'QUIMICA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'ARTES' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM01' AND disciplina = 'HISTORIA' AND oferta = '554661' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'BIOLOGIA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'FILOSOFIA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'ARTES' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'QUIMICA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'FISICA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'HISTORIA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'MATEMATICA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554662' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'QUIMICA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCINALDO OLIVEIRA ARAUJO' AND matricula = '5919993-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'CNT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'BIOLOGIA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'CNT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'FISICA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'CNT - CIENCIA, TECNOLOGIA E INOVACAO' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'MATEMATICA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'HISTORIA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'FILOSOFIA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'ARTES' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '554664' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'CHSA - SOCIEDADE, CULTURA E TECNOLOGIA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'CHSA - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'FILOSOFIA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'ARTES' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'CHSA - APROF DE AREAS DE CIENCIAS HUMANAS E SOCIAIS APLICADAS' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'GEOGRAFIA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'HISTORIA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'BIOLOGIA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'SOCIOLOGIA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'FISICA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'CHSA - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'MATEMATICA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'LINGUA INGLESA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM04' AND disciplina = 'QUIMICA' AND oferta = '554663' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'FISICA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'LGG - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'HISTORIA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'FILOSOFIA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'RONERIO BEZERRA DE OLIVEIRA' AND matricula = '57195008-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'MATEMATICA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'ARTES' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'GEOGRAFIA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'QUIMICA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'LINGUA INGLESA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'SOCIOLOGIA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M1TNM05' AND disciplina = 'BIOLOGIA' AND oferta = '554022' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'BIOLOGIA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'QUIMICA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'HISTORIA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'ARTES' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'FILOSOFIA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'MATEMATICA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIA DA SILVA SANTOS LEITE' AND matricula = '5948546-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JECONIAS DE SOUZA LEITE' AND matricula = '7566147-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM01' AND disciplina = 'FISICA' AND oferta = '554667' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'FILOSOFIA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'BIOLOGIA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'HISTORIA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIA DA SILVA SANTOS LEITE' AND matricula = '5948546-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'QUIMICA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'FISICA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'ARTES' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM02' AND disciplina = 'MATEMATICA' AND oferta = '554665' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIA DA SILVA SANTOS LEITE' AND matricula = '5948546-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'BIOLOGIA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'QUIMICA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'FISICA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ROMIS DE SOUSA MORAES' AND matricula = '57204076-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'MATEMATICA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'HISTORIA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'FILOSOFIA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAQUELINE MENDES GONCALVES' AND matricula = '6300562-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'MAT - APROF DE AREAS DE MATEMATICA E SUAS TECNOLOGIAS' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    3,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'ARTES' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '554023' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'LINGUA INGLESA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'FISICA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'HISTORIA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'GEOGRAFIA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'SOCIOLOGIA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'QUIMICA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'MATEMATICA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'BIOLOGIA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'ARTES' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'LUCIA DA SILVA SANTOS LEITE' AND matricula = '5948546-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M2TNM04' AND disciplina = 'FILOSOFIA' AND oferta = '554666' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'HISTORIA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'BIOLOGIA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'FILOSOFIA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GILMAR VIEIRA DE SOUZA' AND matricula = '54187301-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'GEOGRAFIA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'WANDERSON SANTOS SOUSA COIMBRA' AND matricula = '5998425-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JAIRO LEITE BARBOSA' AND matricula = '5929941-3' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'QUIMICA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'MATEMATICA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'LINGUA INGLESA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'SOCIOLOGIA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'ARTES' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'FISICA' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM01' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554025' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'ALDIANE ALVES DE SOUSA TELES' AND matricula = '57190862-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'HISTORIA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'QUIMICA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'LINGUA INGLESA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'ARTES' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'LGG - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'SOCIOLOGIA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'LGG - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'GEOGRAFIA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'FISICA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'LGG - PRODUCAO TEXTUAL' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'FILOSOFIA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'MATEMATICA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'TALIANE DE SOUZA DUARTE' AND matricula = '5951608-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM02' AND disciplina = 'BIOLOGIA' AND oferta = '554026' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CLAEDIS RAFALSKI MARTINS' AND matricula = '55587150-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'LINGUA PORTUGUESA E SUAS LITERATURAS' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MARCIEL APARECIDO DELFINO' AND matricula = '5973374-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'LINGUA INGLESA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'MANOEL MESSIAS NERES SILVA' AND matricula = '5948444-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'SOCIOLOGIA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'JADNA PEREIRA DA SILVA' AND matricula = '5973737-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'HISTORIA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCO MONTIEL DA SILVA DOS SANTOS' AND matricula = '5998964-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'FILOSOFIA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'DANIEL FERNANDES CARNEIRO' AND matricula = '54192960-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'MATEMATICA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    4,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'GEOGRAFIA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'HELICLENE DA SILVA LIMA' AND matricula = '57198307-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'FISICA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'POLIANA PEREIRA ROMUALDO DA SILVA' AND matricula = '5973369-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'QUIMICA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCO BENTO DE MORAIS FILHO' AND matricula = '57220557-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'ARTES' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'IPOJIANA TAVARES PAIVA' AND matricula = '5973375-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'EDUCACAO FISICA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'FRANCISCA MARIA DA CONCEICAO' AND matricula = '5952068-2' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'MAT - EDUCACAO AMBIENTAL, SUSTENTABILIDADE E CLIMA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    1,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'CHARLENE SILVA MAIA' AND matricula = '5908639-4' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'BIOLOGIA' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );
  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)
  VALUES (
    v_escola_id,
    (SELECT id FROM public.lotacao_professores WHERE nome = 'GISELIE DA SILVA PUGAS' AND matricula = '6404470-1' AND escola_id = v_escola_id LIMIT 1),
    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = 'M3TNM03' AND disciplina = 'MAT - APROF DE AREAS DE LINGUAGENS E SUAS TECNOLOGIAS' AND oferta = '554024' AND escola_id = v_escola_id LIMIT 1),
    2,
    CURRENT_DATE,
    'ativa'
  );

END $$;
