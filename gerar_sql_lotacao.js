const fs = require('fs');
const path = require('path');

function inferirSerie(codigo) {
  if (codigo.startsWith('M1') || codigo.startsWith('EM-1')) return '1º Ano - Ensino Médio';
  if (codigo.startsWith('M2') || codigo.startsWith('EM-2')) return '2º Ano - Ensino Médio';
  if (codigo.startsWith('M3') || codigo.startsWith('EM-3')) return '3º Ano - Ensino Médio';
  if (codigo.startsWith('EJA-1')) return 'EJA - 1ª Etapa';
  if (codigo.startsWith('EJA-2')) return 'EJA - 2ª Etapa';
  if (codigo.startsWith('EE') || codigo.startsWith('EEM')) return 'AEE - Atendimento Educacional Especializado';
  return 'Ensino Médio';
}

function normalizarTurno(turno) {
  if (turno.toUpperCase() === 'MANHA') return 'Manhã';
  if (turno.toUpperCase() === 'TARDE') return 'Tarde';
  if (turno.toUpperCase() === 'NOITE') return 'Noite';
  return turno;
}

function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function main() {
  const recordsPath = 'C:/Users/USER/.gemini/antigravity/scratch/records.json';
  if (!fs.existsSync(recordsPath)) {
    console.error(`Erro: Arquivo records.json não encontrado no caminho: ${recordsPath}`);
    return;
  }

  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  console.log(`Carregados ${records.length} registros de disciplinas do JSON.`);

  const sqlLines = [];
  sqlLines.push('-- ============================================================');
  sqlLines.push('-- RVS ESCOLAR - IMPORTAÇÃO DE LOTAÇÃO & CARÊNCIAS (2026)');
  sqlLines.push('-- Execute este script no SQL Editor do Supabase.');
  sqlLines.push('-- ============================================================');
  sqlLines.push('');
  sqlLines.push('DO $$');
  sqlLines.push('DECLARE');
  sqlLines.push('  v_escola_id UUID;');
  sqlLines.push('BEGIN');
  sqlLines.push('  -- 1. Garantir que a escola existe e obter o escola_id');
  sqlLines.push("  INSERT INTO public.escolas (nome, slug)");
  sqlLines.push("  VALUES ('E.E. Dr. Romildo Veloso e Silva', 'romildo-veloso-silva')");
  sqlLines.push("  ON CONFLICT (slug) DO NOTHING;");
  sqlLines.push('');
  sqlLines.push("  SELECT id INTO v_escola_id FROM public.escolas WHERE slug = 'romildo-veloso-silva';");
  sqlLines.push('');
  sqlLines.push('  -- 2. Limpar os dados de lotação antigos da escola');
  sqlLines.push('  DELETE FROM public.lotacao_alocacoes WHERE escola_id = v_escola_id;');
  sqlLines.push('  DELETE FROM public.lotacao_componentes_turma WHERE escola_id = v_escola_id;');
  sqlLines.push('  DELETE FROM public.lotacao_professores WHERE escola_id = v_escola_id;');
  sqlLines.push('');
  sqlLines.push('  -- 3. Inserir/Atualizar turmas se necessário');
  
  // Turmas Únicas
  const uniqueTurmas = {};
  records.forEach(r => {
    uniqueTurmas[r.turma] = {
      code: r.turma,
      turno: normalizarTurno(r.turno),
      modal: r.modal
    };
  });

  Object.values(uniqueTurmas).forEach(t => {
    sqlLines.push(`  INSERT INTO public.turmas (code, serie, turno, professor, escola_id)`);
    sqlLines.push(`  VALUES (${escapeSql(t.code)}, ${escapeSql(inferirSerie(t.code))}, ${escapeSql(t.turno)}, 'A Definir', v_escola_id)`);
    sqlLines.push(`  ON CONFLICT (code) DO UPDATE SET escola_id = v_escola_id;`);
  });
  
  sqlLines.push('');
  sqlLines.push('  -- 4. Inserir Professores');
  
  // Professores Únicos
  const uniqueTeachers = {};
  records.forEach(r => {
    if (r.teacher) {
      const key = `${r.teacher}_${r.matricula}`;
      uniqueTeachers[key] = {
        nome: r.teacher,
        matricula: r.matricula,
        carga_horaria_maxima: r.ch_prof || 40
      };
    }
  });

  Object.values(uniqueTeachers).forEach(prof => {
    sqlLines.push(`  INSERT INTO public.lotacao_professores (escola_id, nome, matricula, cargo, carga_horaria_maxima, ativo)`);
    sqlLines.push(`  VALUES (v_escola_id, ${escapeSql(prof.nome)}, ${escapeSql(prof.matricula)}, 'Professor', ${prof.carga_horaria_maxima}, true);`);
  });

  sqlLines.push('');
  sqlLines.push('  -- 5. Inserir Componentes Curriculares');
  
  records.forEach(r => {
    const ch = r.ch_discipline || 0;
    sqlLines.push(`  INSERT INTO public.lotacao_componentes_turma (escola_id, turma_id, turma_codigo, ano, oferta, modalidade, serie_modalidade, turno, disciplina, carga_horaria_semanal, quantidade_aulas, ativo)`);
    sqlLines.push(`  VALUES (`);
    sqlLines.push(`    v_escola_id,`);
    sqlLines.push(`    (SELECT id FROM public.turmas WHERE code = ${escapeSql(r.turma)} LIMIT 1),`);
    sqlLines.push(`    ${escapeSql(r.turma)},`);
    sqlLines.push(`    2026,`);
    sqlLines.push(`    ${escapeSql(r.oferta)},`);
    sqlLines.push(`    ${escapeSql(r.modal)},`);
    sqlLines.push(`    ${escapeSql(inferirSerie(r.turma))},`);
    sqlLines.push(`    ${escapeSql(normalizarTurno(r.turno))},`);
    sqlLines.push(`    ${escapeSql(r.discipline)},`);
    sqlLines.push(`    ${ch},`);
    sqlLines.push(`    ${ch},`);
    sqlLines.push(`    true`);
    sqlLines.push(`  );`);
  });

  sqlLines.push('');
  sqlLines.push('  -- 6. Inserir Alocações de Professores');
  
  records.forEach(r => {
    if (r.teacher) {
      const ch = r.ch_discipline || 0;
      sqlLines.push(`  INSERT INTO public.lotacao_alocacoes (escola_id, professor_id, componente_id, carga_horaria_semanal, data_inicio, status)`);
      sqlLines.push(`  VALUES (`);
      sqlLines.push(`    v_escola_id,`);
      sqlLines.push(`    (SELECT id FROM public.lotacao_professores WHERE nome = ${escapeSql(r.teacher)} AND matricula = ${escapeSql(r.matricula)} AND escola_id = v_escola_id LIMIT 1),`);
      sqlLines.push(`    (SELECT id FROM public.lotacao_componentes_turma WHERE turma_codigo = ${escapeSql(r.turma)} AND disciplina = ${escapeSql(r.discipline)} AND oferta = ${escapeSql(r.oferta)} AND escola_id = v_escola_id LIMIT 1),`);
      sqlLines.push(`    ${ch},`);
      sqlLines.push(`    CURRENT_DATE,`);
      sqlLines.push(`    'ativa'`);
      sqlLines.push(`  );`);
    }
  });

  sqlLines.push('');
  sqlLines.push('END $$;');
  sqlLines.push('');

  const destPath = 'C:/Users/USER/Documents/copia rvs escolar notebook/rvs_gestor/inserir_dados_lotacao.sql';
  fs.writeFileSync(destPath, sqlLines.join('\n'), 'utf8');
  console.log(`Sucesso: Arquivo SQL gerado em: ${destPath}`);
}

main();
