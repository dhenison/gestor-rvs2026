let LOTACAO_PROFESSORES_DATA = [];
let LOTACAO_COMPONENTES_DATA = [];
let LOTACAO_ALOCACOES_DATA = [];
let LOTACAO_DESISTENCIAS_DATA = [];
let LOTACAO_SCHEMA_STATUS = { ready: false, missingTables: [] };
let LOTACAO_TAB_ATUAL = 'resumo';
let LOTACAO_LAST_SCHOOL_ID = null;
let LOTACAO_ALREADY_LOADED = false;

const LOTACAO_STATUS_META = {
  sem_lotacao: { label: 'Sem lotação', bg: '#fee2e2', color: '#b91c1c' },
  parcial: { label: 'Parcial', bg: '#fef3c7', color: '#b45309' },
  lotado: { label: 'Lotado', bg: '#dcfce7', color: '#166534' },
  excedente: { label: 'Excedente', bg: '#dbeafe', color: '#1d4ed8' },
  inativo: { label: 'Inativo', bg: '#e5e7eb', color: '#4b5563' }
};

function lotacaoNormalize(value) {
  if (typeof normalizarTexto === 'function') return normalizarTexto(value);
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function lotacaoEscape(value) {
  if (typeof escapeHtml === 'function') return escapeHtml(value);
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function lotacaoNumber(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function lotacaoToday() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function lotacaoFormatDateBr(value) {
  if (!value) return '—';
  if (typeof formatarDataDocumentoBr === 'function') return formatarDataDocumentoBr(value);
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
}

function lotacaoFormatDateTimeBr(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
}

function lotacaoFormatCarga(value) {
  return `${lotacaoNumber(value)}h`;
}

function lotacaoSchemaReady() {
  return LOTACAO_SCHEMA_STATUS.ready;
}

function lotacaoEnsureSchema() {
  if (lotacaoSchemaReady()) return true;
  showToast('A base da lotação ainda não foi integrada. Execute a migration do módulo.', 'alerta');
  return false;
}

function getLotacaoTurmaById(id) {
  return TURMAS_DATA.find((item) => String(item.id) === String(id)) || null;
}

function getLotacaoProfessorById(id) {
  return LOTACAO_PROFESSORES_DATA.find((item) => String(item.id) === String(id)) || null;
}

function getLotacaoComponenteById(id) {
  return LOTACAO_COMPONENTES_DATA.find((item) => String(item.id) === String(id)) || null;
}

function getLotacaoAlocacaoById(id) {
  return LOTACAO_ALOCACOES_DATA.find((item) => String(item.id) === String(id)) || null;
}

function getLotacaoDesistenciaByAllocId(alocacaoId) {
  return LOTACAO_DESISTENCIAS_DATA.find((item) => String(item.alocacao_id) === String(alocacaoId)) || null;
}

function getLotacaoStudentCount(componente) {
  const turma = getLotacaoTurmaById(componente?.turma_id);
  if (!turma) return 0;
  return ALUNOS_DATA.filter((aluno) => {
    if (aluno.turma_id && String(aluno.turma_id) === String(turma.id)) return true;
    if (aluno.turma && String(aluno.turma) === String(turma.code)) return true;
    return false;
  }).length;
}

function getLotacaoAllocationsByProfessor(professorId) {
  return LOTACAO_ALOCACOES_DATA.filter((item) => String(item.professor_id) === String(professorId));
}

function getLotacaoAllocationsByComponente(componenteId) {
  return LOTACAO_ALOCACOES_DATA.filter((item) => String(item.componente_id) === String(componenteId));
}

function getLotacaoActiveAllocationsByProfessor(professorId) {
  return getLotacaoAllocationsByProfessor(professorId).filter((item) => item.status === 'ativa');
}

function getLotacaoActiveAllocationsByComponente(componenteId) {
  return getLotacaoAllocationsByComponente(componenteId).filter((item) => item.status === 'ativa');
}

function getLotacaoProfessorCargaAtual(professorId) {
  return getLotacaoActiveAllocationsByProfessor(professorId)
    .reduce((sum, item) => sum + lotacaoNumber(item.carga_horaria_semanal), 0);
}

function getLotacaoComponenteStatus(componente) {
  if (!componente?.ativo) {
    return { key: 'inativo', prevista: lotacaoNumber(componente?.carga_horaria_semanal), lotada: 0 };
  }
  const previstas = lotacaoNumber(componente.carga_horaria_semanal);
  const alocacoes = getLotacaoActiveAllocationsByComponente(componente.id);
  const lotada = alocacoes.reduce((sum, item) => sum + lotacaoNumber(item.carga_horaria_semanal), 0);

  if (!alocacoes.length || lotada <= 0) return { key: 'sem_lotacao', prevista: previstas, lotada };
  if (previstas > 0 && lotada < previstas) return { key: 'parcial', prevista: previstas, lotada };
  if (previstas > 0 && lotada > previstas) return { key: 'excedente', prevista: previstas, lotada };
  return { key: 'lotado', prevista: previstas, lotada };
}

function getLotacaoResumo() {
  const professoresAtivos = LOTACAO_PROFESSORES_DATA.filter((item) => item.ativo !== false);
  const componentesAtivos = LOTACAO_COMPONENTES_DATA.filter((item) => item.ativo !== false);
  const alocacoesAtivas = LOTACAO_ALOCACOES_DATA.filter((item) => item.status === 'ativa');
  const pendencias = componentesAtivos.filter((item) => {
    const status = getLotacaoComponenteStatus(item).key;
    return status === 'sem_lotacao' || status === 'parcial';
  });
  const parciais = componentesAtivos.filter((item) => getLotacaoComponenteStatus(item).key === 'parcial');

  return {
    professoresAtivos: professoresAtivos.length,
    componentesAtivos: componentesAtivos.length,
    alocacoesAtivas: alocacoesAtivas.length,
    pendencias: pendencias.length,
    parciais: parciais.length
  };
}

function lotacaoStatusChip(statusKey) {
  const meta = LOTACAO_STATUS_META[statusKey] || LOTACAO_STATUS_META.inativo;
  return `<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:${meta.bg};color:${meta.color};font-size:11px;font-weight:700">${meta.label}</span>`;
}

function lotacaoRenderSetupAlert() {
  const el = document.getElementById('lotacao-setup-alert');
  if (!el) return;
  if (lotacaoSchemaReady()) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  const missing = LOTACAO_SCHEMA_STATUS.missingTables.length
    ? LOTACAO_SCHEMA_STATUS.missingTables.map((item) => `<code>${lotacaoEscape(item)}</code>`).join(', ')
    : '<code>lotacao_professores</code>, <code>lotacao_componentes_turma</code>, <code>lotacao_alocacoes</code>, <code>lotacao_desistencias</code>';

  el.classList.remove('hidden');
  el.innerHTML = `
    <div style="padding:14px 16px;border-radius:12px;border:1px solid #fcd34d;background:#fffbeb;color:#92400e">
      <div style="font-weight:800;margin-bottom:6px">Integração do módulo pendente</div>
      <div style="font-size:13px;line-height:1.55">
        As tabelas da lotação ainda não estão disponíveis nesta base. Aplique o arquivo
        <code>supabase_migration_v27_lotacao_professores.sql</code> e recarregue a página.
        Tabelas ausentes: ${missing}.
      </div>
    </div>
  `;
}

async function carregarDadosLotacao(force = false, silent = false) {
  const escolaId = getActiveSchoolId();
  if (!force && LOTACAO_ALREADY_LOADED && LOTACAO_LAST_SCHOOL_ID === escolaId) return;

  if (!silent) showLoading('Carregando módulo de lotação...');

  try {
    const [professoresResult, componentesResult, alocacoesResult, desistenciasResult] = await Promise.all([
      fetchOptionalRows('lotacao_professores', '*', (q) => q.order('nome', { ascending: true })),
      fetchOptionalRows('lotacao_componentes_turma', '*', (q) => q.order('turno', { ascending: true }).order('turma_codigo', { ascending: true }).order('disciplina', { ascending: true })),
      fetchOptionalRows('lotacao_alocacoes', '*', (q) => q.order('data_inicio', { ascending: false })),
      fetchOptionalRows('lotacao_desistencias', '*', (q) => q.order('data_desistencia', { ascending: false }))
    ]);

    const missingTables = [];
    if (professoresResult.missing) missingTables.push('lotacao_professores');
    if (componentesResult.missing) missingTables.push('lotacao_componentes_turma');
    if (alocacoesResult.missing) missingTables.push('lotacao_alocacoes');
    if (desistenciasResult.missing) missingTables.push('lotacao_desistencias');

    LOTACAO_SCHEMA_STATUS = { ready: missingTables.length === 0, missingTables };
    LOTACAO_PROFESSORES_DATA = professoresResult.data || [];
    LOTACAO_COMPONENTES_DATA = componentesResult.data || [];
    LOTACAO_ALOCACOES_DATA = alocacoesResult.data || [];
    LOTACAO_DESISTENCIAS_DATA = desistenciasResult.data || [];
    LOTACAO_LAST_SCHOOL_ID = escolaId;
    LOTACAO_ALREADY_LOADED = true;
  } catch (error) {
    console.error('[Lotacao] Erro ao carregar dados:', error);
    showToast('Não foi possível carregar o módulo de lotação.', 'erro');
  } finally {
    if (!silent) hideLoading();
  }
}

function renderLotacaoResumoCards() {
  const container = document.getElementById('lotacao-resumo-cards');
  if (!container) return;

  const resumo = getLotacaoResumo();
  container.innerHTML = `
    <div class="metric-card blue">
      <div class="metric-icon"><i data-lucide="users-round"></i></div>
      <div class="metric-label">Professores Ativos</div>
      <div class="metric-value">${resumo.professoresAtivos}</div>
      <div class="metric-sub">Cadastros prontos para lotação</div>
    </div>
    <div class="metric-card green">
      <div class="metric-icon"><i data-lucide="library-big"></i></div>
      <div class="metric-label">Componentes no Mapa</div>
      <div class="metric-value">${resumo.componentesAtivos}</div>
      <div class="metric-sub">Turmas e disciplinas cadastradas</div>
    </div>
    <div class="metric-card red">
      <div class="metric-icon"><i data-lucide="alert-circle"></i></div>
      <div class="metric-label">Pendências</div>
      <div class="metric-value">${resumo.pendencias}</div>
      <div class="metric-sub">Sem lotação ou com carga parcial</div>
    </div>
    <div class="metric-card yellow">
      <div class="metric-icon"><i data-lucide="badge-check"></i></div>
      <div class="metric-label">Lotações Ativas</div>
      <div class="metric-value">${resumo.alocacoesAtivas}</div>
      <div class="metric-sub">${resumo.parciais} registro(s) ainda parcial(is)</div>
    </div>
  `;
}

function renderLotacaoPendencias() {
  const container = document.getElementById('lotacao-pendencias-lista');
  if (!container) return;

  if (!lotacaoSchemaReady()) {
    container.innerHTML = emptyState('🧩', 'Base pendente', 'Aplique a migration do módulo para liberar a lotação.');
    return;
  }

  const pendencias = LOTACAO_COMPONENTES_DATA
    .filter((item) => item.ativo !== false)
    .map((item) => ({ item, status: getLotacaoComponenteStatus(item) }))
    .filter(({ status }) => status.key === 'sem_lotacao' || status.key === 'parcial')
    .sort((a, b) => {
      const order = { sem_lotacao: 0, parcial: 1 };
      return (order[a.status.key] ?? 9) - (order[b.status.key] ?? 9);
    });

  if (!pendencias.length) {
    container.innerHTML = emptyState('✅', 'Nenhuma pendência', 'Todas as turmas cadastradas estão cobertas pela lotação.');
    return;
  }

  container.innerHTML = pendencias.slice(0, 10).map(({ item, status }) => `
    <div style="display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--gray3)">
      <div>
        <div style="font-weight:800;color:var(--gray7)">${lotacaoEscape(item.turma_codigo || 'Turma')} • ${lotacaoEscape(item.disciplina || 'Disciplina')}</div>
        <div style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.turno || 'Turno não informado')} • CH prevista ${lotacaoFormatCarga(item.carga_horaria_semanal)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${lotacaoStatusChip(status.key)}
        <button class="btn btn-outline btn-sm" onclick="abrirModalAlocacaoLotacao('', '${item.id}')">Lotar</button>
      </div>
    </div>
  `).join('');
}

function renderLotacaoCargaProfessores() {
  const container = document.getElementById('lotacao-carga-professores');
  if (!container) return;

  if (!lotacaoSchemaReady()) {
    container.innerHTML = emptyState('📚', 'Base pendente', 'Os dados aparecerão assim que a migration for aplicada.');
    return;
  }

  const professores = LOTACAO_PROFESSORES_DATA
    .filter((item) => item.ativo !== false)
    .map((item) => {
      const atual = getLotacaoProfessorCargaAtual(item.id);
      const max = lotacaoNumber(item.carga_horaria_maxima) || 200;
      const percent = Math.max(0, Math.min(100, Math.round((atual / max) * 100)));
      return { item, atual, max, percent };
    })
    .sort((a, b) => b.atual - a.atual || a.item.nome.localeCompare(b.item.nome));

  if (!professores.length) {
    container.innerHTML = emptyState('👩‍🏫', 'Nenhum professor cadastrado', 'Cadastre os professores para iniciar a lotação.');
    return;
  }

  container.innerHTML = professores.slice(0, 10).map(({ item, atual, max, percent }) => `
    <div style="padding:10px 0;border-bottom:1px solid var(--gray3)">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px">
        <strong style="color:var(--gray7)">${lotacaoEscape(item.nome || 'Professor')}</strong>
        <span style="font-size:12px;color:${atual > max ? '#b91c1c' : 'var(--gray5)'}">${lotacaoFormatCarga(atual)} / ${lotacaoFormatCarga(max)}</span>
      </div>
      <div style="height:10px;border-radius:999px;background:#e5e7eb;overflow:hidden">
        <div style="height:100%;width:${percent}%;background:${atual > max ? '#ef4444' : '#2563eb'}"></div>
      </div>
    </div>
  `).join('');
}

function renderLotacaoResumoMapa() {
  const container = document.getElementById('lotacao-resumo-mapa');
  if (!container) return;

  if (!lotacaoSchemaReady()) {
    container.innerHTML = emptyState('🗂️', 'Base pendente', 'O resumo do mapa ficará disponível após integrar o banco.');
    return;
  }

  const componentes = LOTACAO_COMPONENTES_DATA.filter((item) => item.ativo !== false);
  if (!componentes.length) {
    container.innerHTML = emptyState('🗂️', 'Mapa vazio', 'Cadastre componentes e turmas para montar a lotação.');
    return;
  }

  const porTurno = componentes.reduce((acc, item) => {
    const turno = item.turno || 'Sem turno';
    const status = getLotacaoComponenteStatus(item).key;
    if (!acc[turno]) acc[turno] = { total: 0, lotado: 0, parcial: 0, sem_lotacao: 0, excedente: 0 };
    acc[turno].total += 1;
    acc[turno][status] = (acc[turno][status] || 0) + 1;
    return acc;
  }, {});

  container.innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Turno</th>
            <th>Total</th>
            <th>Lotados</th>
            <th>Parciais</th>
            <th>Sem Lotação</th>
            <th>Excedentes</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(porTurno).map(([turno, dados]) => `
            <tr>
              <td>${lotacaoEscape(turno)}</td>
              <td>${dados.total}</td>
              <td>${dados.lotado || 0}</td>
              <td>${dados.parcial || 0}</td>
              <td>${dados.sem_lotacao || 0}</td>
              <td>${dados.excedente || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function popularFiltroTurnosLotacao() {
  const select = document.getElementById('lotacao-mapa-filtro-turno');
  if (!select) return;
  const selected = select.value;
  const turnos = [...new Set(LOTACAO_COMPONENTES_DATA.map((item) => item.turno).filter(Boolean))].sort();
  select.innerHTML = '<option value="">Todos os turnos</option>' + turnos.map((turno) => `<option ${selected === turno ? 'selected' : ''}>${lotacaoEscape(turno)}</option>`).join('');
}

function renderLotacaoProfessores(reset = false) {
  if (reset === true) {
    const buscaInput = document.getElementById('lotacao-prof-filtro-busca');
    const statusSelect = document.getElementById('lotacao-prof-filtro-status');
    if (buscaInput) buscaInput.value = '';
    if (statusSelect) statusSelect.value = '';
  }

  const tbody = document.getElementById('lotacao-professores-tbody');
  if (!tbody) return;

  if (!lotacaoSchemaReady()) {
    tbody.innerHTML = emptyTr('🧩', 'Base pendente', 'Aplique a migration do módulo para liberar os cadastros.', 6);
    return;
  }

  const busca = lotacaoNormalize(document.getElementById('lotacao-prof-filtro-busca')?.value || '');
  const statusFiltro = document.getElementById('lotacao-prof-filtro-status')?.value || '';

  const rows = LOTACAO_PROFESSORES_DATA
    .filter((item) => {
      const carga = getLotacaoProfessorCargaAtual(item.id);
      const haystack = [
        item.nome,
        item.matricula,
        item.cargo,
        item.tipo_vinculo
      ].map(lotacaoNormalize).join(' ');

      if (busca && !haystack.includes(busca)) return false;
      if (statusFiltro === 'ativo' && item.ativo === false) return false;
      if (statusFiltro === 'inativo' && item.ativo !== false) return false;
      if (statusFiltro === 'com-pendencia' && carga > 0) return false;
      if (statusFiltro === 'com-carga' && carga <= 0) return false;
      return true;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (!rows.length) {
    tbody.innerHTML = emptyTr('👩‍🏫', 'Nenhum professor encontrado', 'Ajuste os filtros ou cadastre um novo professor.', 6);
    return;
  }

  tbody.innerHTML = rows.map((item) => {
    const cargaAtual = getLotacaoProfessorCargaAtual(item.id);
    const cargaMaxima = lotacaoNumber(item.carga_horaria_maxima) || 200;
    const statusKey = item.ativo === false ? 'inativo' : cargaAtual > cargaMaxima ? 'excedente' : cargaAtual > 0 ? 'lotado' : 'parcial';
    const possuiLotacao = getLotacaoActiveAllocationsByProfessor(item.id).length > 0;
    return `
      <tr>
        <td>
          <strong>${lotacaoEscape(item.nome || 'Professor')}</strong>
          <div style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.observacoes || item.tipo_vinculo || 'Sem observações')}</div>
        </td>
        <td>${lotacaoEscape(item.matricula || '—')}</td>
        <td>${lotacaoEscape(item.cargo || '—')}<br><span style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.tipo_vinculo || item.vinculo || '—')}</span></td>
        <td>
          <strong>${lotacaoFormatCarga(cargaAtual)}</strong>
          <div style="font-size:12px;color:var(--gray5)">Máx. ${lotacaoFormatCarga(cargaMaxima)}</div>
        </td>
        <td>${lotacaoStatusChip(statusKey)}</td>
        <td style="text-align:right">
          <div style="display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" onclick="abrirModalAlocacaoLotacao('${item.id}', '')">Lotar</button>
            ${possuiLotacao ? `<button class="btn btn-outline btn-sm" onclick="imprimirFichaLotacaoProfessor('${item.id}')">Ficha</button>` : ''}
            <button class="btn btn-outline btn-sm" onclick="abrirModalLotacaoProfessor('${item.id}')">Editar</button>
            <button class="btn btn-red btn-sm" onclick="excluirProfessorLotacao('${item.id}')">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderLotacaoAlocacoesCell(componente) {
  const alocacoes = getLotacaoActiveAllocationsByComponente(componente.id);
  if (!alocacoes.length) return '<span style="color:var(--gray5)">Nenhum professor lotado</span>';

  return alocacoes.map((item) => {
    const professor = getLotacaoProfessorById(item.professor_id);
    return `
      <div style="padding:8px 0;border-bottom:1px dashed var(--gray3)">
        <div style="font-weight:700;color:var(--gray7)">${lotacaoEscape(professor?.nome || 'Professor não encontrado')}</div>
        <div style="font-size:12px;color:var(--gray5)">${lotacaoFormatCarga(item.carga_horaria_semanal)} • Início ${lotacaoFormatDateBr(item.data_inicio)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
          <button class="btn btn-outline btn-sm" onclick="imprimirFichaLotacaoProfessor('${item.professor_id}')">Ficha</button>
          <button class="btn btn-outline btn-sm" onclick="abrirModalAlocacaoLotacao('', '', '${item.id}')">Editar</button>
          <button class="btn btn-red btn-sm" onclick="abrirModalDesistenciaLotacao('${item.id}')">Desistência</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderLotacaoMapa(reset = false) {
  if (reset === true) {
    const buscaInput = document.getElementById('lotacao-mapa-filtro-busca');
    const turnoSelect = document.getElementById('lotacao-mapa-filtro-turno');
    const statusSelect = document.getElementById('lotacao-mapa-filtro-status');
    if (buscaInput) buscaInput.value = '';
    if (turnoSelect) turnoSelect.value = '';
    if (statusSelect) statusSelect.value = '';
  }

  const tbody = document.getElementById('lotacao-mapa-tbody');
  if (!tbody) return;

  if (!lotacaoSchemaReady()) {
    tbody.innerHTML = emptyTr('🧩', 'Base pendente', 'Aplique a migration do módulo para liberar o mapa de lotação.', 7);
    return;
  }

  popularFiltroTurnosLotacao();
  const busca = lotacaoNormalize(document.getElementById('lotacao-mapa-filtro-busca')?.value || '');
  const turno = document.getElementById('lotacao-mapa-filtro-turno')?.value || '';
  const statusFiltro = document.getElementById('lotacao-mapa-filtro-status')?.value || '';

  const rows = LOTACAO_COMPONENTES_DATA
    .filter((item) => item.ativo !== false)
    .map((item) => ({ item, status: getLotacaoComponenteStatus(item) }))
    .filter(({ item, status }) => {
      const professores = getLotacaoActiveAllocationsByComponente(item.id)
        .map((alocacao) => getLotacaoProfessorById(alocacao.professor_id)?.nome || '')
        .join(' ');
      const haystack = [
        item.turma_codigo,
        item.disciplina,
        item.turno,
        item.serie_modalidade,
        item.localidade,
        professores
      ].map(lotacaoNormalize).join(' ');

      if (busca && !haystack.includes(busca)) return false;
      if (turno && item.turno !== turno) return false;
      if (statusFiltro && status.key !== statusFiltro) return false;
      return true;
    })
    .sort((a, b) => {
      const turmaSort = (a.item.turma_codigo || '').localeCompare(b.item.turma_codigo || '');
      if (turmaSort !== 0) return turmaSort;
      return (a.item.disciplina || '').localeCompare(b.item.disciplina || '');
    });

  if (!rows.length) {
    tbody.innerHTML = emptyTr('🗂️', 'Nenhum registro encontrado', 'Ajuste os filtros ou cadastre novos componentes.', 7);
    return;
  }

  tbody.innerHTML = rows.map(({ item, status }) => `
    <tr>
      <td>
        <strong>${lotacaoEscape(item.turma_codigo || 'Turma')}</strong>
        <div style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.serie_modalidade || item.modalidade || 'Sem série/modalidade')} • ${getLotacaoStudentCount(item)} aluno(s)</div>
      </td>
      <td>
        <strong>${lotacaoEscape(item.disciplina || 'Disciplina')}</strong>
        <div style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.oferta || 'Oferta não informada')}</div>
      </td>
      <td>${lotacaoEscape(item.turno || '—')}<br><span style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.localidade || '—')}</span></td>
      <td>
        <strong>${lotacaoFormatCarga(status.prevista)}</strong>
        <div style="font-size:12px;color:var(--gray5)">Lotada ${lotacaoFormatCarga(status.lotada)}</div>
      </td>
      <td>${renderLotacaoAlocacoesCell(item)}</td>
      <td>${lotacaoStatusChip(status.key)}</td>
      <td style="text-align:right">
        <div style="display:flex;justify-content:flex-end;gap:6px;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="abrirModalAlocacaoLotacao('', '${item.id}')">Lotar</button>
          <button class="btn btn-outline btn-sm" onclick="abrirModalComponenteLotacao('${item.id}')">Editar</button>
          <button class="btn btn-red btn-sm" onclick="excluirComponenteLotacao('${item.id}')">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderLotacaoDesistencias() {
  const tbody = document.getElementById('lotacao-desistencias-tbody');
  if (!tbody) return;

  if (!lotacaoSchemaReady()) {
    tbody.innerHTML = emptyTr('🧩', 'Base pendente', 'Aplique a migration do módulo para liberar o histórico de desistências.', 5);
    return;
  }

  if (!LOTACAO_DESISTENCIAS_DATA.length) {
    tbody.innerHTML = emptyTr('📭', 'Nenhuma desistência registrada', 'Quando houver desligamentos, eles aparecerão aqui.', 5);
    return;
  }

  tbody.innerHTML = LOTACAO_DESISTENCIAS_DATA.map((item) => {
    const professor = getLotacaoProfessorById(item.professor_id);
    const componente = getLotacaoComponenteById(item.componente_id);
    return `
      <tr>
        <td>${lotacaoEscape(professor?.nome || 'Professor não encontrado')}</td>
        <td>${lotacaoEscape(componente?.turma_codigo || 'Turma')} • ${lotacaoEscape(componente?.disciplina || 'Disciplina')}</td>
        <td>${lotacaoFormatDateBr(item.data_desistencia)}</td>
        <td>${lotacaoEscape(item.motivo || '—')}<br><span style="font-size:12px;color:var(--gray5)">${lotacaoEscape(item.observacoes || '')}</span></td>
        <td>${lotacaoFormatDateTimeBr(item.created_at)}</td>
      </tr>
    `;
  }).join('');
}

async function renderLotacaoPage(force = false) {
  await carregarDadosLotacao(force === true, false);
  lotacaoRenderSetupAlert();
  renderLotacaoResumoCards();
  renderLotacaoPendencias();
  renderLotacaoCargaProfessores();
  renderLotacaoResumoMapa();
  renderLotacaoProfessores();
  renderLotacaoMapa();
  renderLotacaoDesistencias();
  switchLotacaoTab(LOTACAO_TAB_ATUAL);
  if (window.lucide) window.lucide.createIcons();
}

function switchLotacaoTab(tab, element = null) {
  LOTACAO_TAB_ATUAL = tab;
  const tabs = Array.from(document.querySelectorAll('#page-lotacao-professores .tabs .tab'));
  const tabIndexMap = { resumo: 0, professores: 1, mapa: 2, desistencias: 3 };
  if (!element && Number.isInteger(tabIndexMap[tab])) {
    element = tabs[tabIndexMap[tab]] || null;
  }

  tabs.forEach((item) => item.classList.remove('active'));
  if (element) element.classList.add('active');

  ['resumo', 'professores', 'mapa', 'desistencias'].forEach((item) => {
    document.getElementById(`lotacao-tab-${item}`)?.classList.toggle('hidden', item !== tab);
  });
}

function popularSelectLotacaoTurmas(selectId, selected = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Selecione a turma</option>' + TURMAS_DATA
    .slice()
    .sort((a, b) => (a.code || '').localeCompare(b.code || ''))
    .map((item) => `<option value="${item.id}" ${String(selected) === String(item.id) ? 'selected' : ''}>${lotacaoEscape(item.code)} • ${lotacaoEscape(item.turno || 'Sem turno')}</option>`)
    .join('');
}

function popularSelectLotacaoProfessores(selectId, selected = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Selecione o professor</option>' + LOTACAO_PROFESSORES_DATA
    .filter((item) => item.ativo !== false)
    .slice()
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    .map((item) => `<option value="${item.id}" ${String(selected) === String(item.id) ? 'selected' : ''}>${lotacaoEscape(item.nome)}${item.matricula ? ` • ${lotacaoEscape(item.matricula)}` : ''}</option>`)
    .join('');
}

function popularSelectLotacaoComponentes(selectId, selected = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Selecione o componente</option>' + LOTACAO_COMPONENTES_DATA
    .filter((item) => item.ativo !== false)
    .slice()
    .sort((a, b) => `${a.turma_codigo || ''} ${a.disciplina || ''}`.localeCompare(`${b.turma_codigo || ''} ${b.disciplina || ''}`))
    .map((item) => `<option value="${item.id}" ${String(selected) === String(item.id) ? 'selected' : ''}>${lotacaoEscape(item.turma_codigo || 'Turma')} • ${lotacaoEscape(item.disciplina || 'Disciplina')} • ${lotacaoEscape(item.turno || 'Sem turno')}</option>`)
    .join('');
}

function popularSelectLotacaoAlocacoes(selectId, selected = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Selecione a lotação</option>' + LOTACAO_ALOCACOES_DATA
    .filter((item) => item.status === 'ativa')
    .map((item) => {
      const professor = getLotacaoProfessorById(item.professor_id);
      const componente = getLotacaoComponenteById(item.componente_id);
      const label = `${professor?.nome || 'Professor'} • ${componente?.turma_codigo || 'Turma'} • ${componente?.disciplina || 'Disciplina'}`;
      return `<option value="${item.id}" ${String(selected) === String(item.id) ? 'selected' : ''}>${lotacaoEscape(label)}</option>`;
    })
    .join('');
}

function preencherMetadadosTurmaLotacao() {
  const turma = getLotacaoTurmaById(document.getElementById('lot-comp-turma-id')?.value || '');
  if (!turma) return;

  const serieInput = document.getElementById('lot-comp-serie-modalidade');
  const turnoInput = document.getElementById('lot-comp-turno');
  const localidadeInput = document.getElementById('lot-comp-localidade');
  const modalidadeInput = document.getElementById('lot-comp-modalidade');
  const ofertaInput = document.getElementById('lot-comp-oferta');
  const anoInput = document.getElementById('lot-comp-ano');

  if (serieInput && !serieInput.value) serieInput.value = turma.serie || '';
  if (turnoInput) turnoInput.value = turma.turno || '';
  if (localidadeInput) localidadeInput.value = turma.localidade || '';
  if (modalidadeInput && !modalidadeInput.value) modalidadeInput.value = turma.serie || '';
  if (ofertaInput && !ofertaInput.value) ofertaInput.value = 'Regular';
  if (anoInput && !anoInput.value) anoInput.value = new Date().getFullYear();
}

function sincronizarCargaAlocacaoLotacao() {
  const componente = getLotacaoComponenteById(document.getElementById('lot-aloc-componente-id')?.value || '');
  const input = document.getElementById('lot-aloc-ch-semanal');
  if (!componente || !input) return;
  if (!input.value || input.dataset.autofill === 'true') {
    input.value = lotacaoNumber(componente.carga_horaria_semanal);
    input.dataset.autofill = 'true';
  }
}

function abrirModalLotacaoProfessor(id = '') {
  if (!lotacaoEnsureSchema()) return;
  const item = id ? getLotacaoProfessorById(id) : null;

  document.getElementById('modal-lotacao-professor-title').textContent = item ? 'Editar Professor' : '+ Novo Professor';
  document.getElementById('lot-prof-edit-id').value = item?.id || '';
  document.getElementById('lot-prof-nome').value = item?.nome || '';
  document.getElementById('lot-prof-matricula').value = item?.matricula || '';
  document.getElementById('lot-prof-cargo').value = item?.cargo || '';
  document.getElementById('lot-prof-tipo-vinculo').value = item?.tipo_vinculo || '';
  document.getElementById('lot-prof-vinculo').value = item?.vinculo || '';
  document.getElementById('lot-prof-carga-maxima').value = lotacaoNumber(item?.carga_horaria_maxima || 200);
  document.getElementById('lot-prof-observacoes').value = item?.observacoes || '';
  document.getElementById('lot-prof-ativo').checked = item ? item.ativo !== false : true;
  openModal('modal-lotacao-professor');
}

function abrirModalComponenteLotacao(id = '') {
  if (!lotacaoEnsureSchema()) return;
  if (!TURMAS_DATA.length) {
    showToast('Cadastre ao menos uma turma antes de montar a lotação.', 'alerta');
    return;
  }

  const item = id ? getLotacaoComponenteById(id) : null;
  document.getElementById('modal-lotacao-componente-title').textContent = item ? 'Editar Componente / Turma' : '+ Novo Componente / Turma';
  document.getElementById('lot-comp-edit-id').value = item?.id || '';
  popularSelectLotacaoTurmas('lot-comp-turma-id', item?.turma_id || '');
  document.getElementById('lot-comp-disciplina').value = item?.disciplina || '';
  document.getElementById('lot-comp-ano').value = item?.ano || new Date().getFullYear();
  document.getElementById('lot-comp-oferta').value = item?.oferta || '';
  document.getElementById('lot-comp-modalidade').value = item?.modalidade || '';
  document.getElementById('lot-comp-serie-modalidade').value = item?.serie_modalidade || '';
  document.getElementById('lot-comp-turno').value = item?.turno || '';
  document.getElementById('lot-comp-localidade').value = item?.localidade || '';
  document.getElementById('lot-comp-ch-semanal').value = lotacaoNumber(item?.carga_horaria_semanal);
  document.getElementById('lot-comp-qtd-aulas').value = lotacaoNumber(item?.quantidade_aulas);
  document.getElementById('lot-comp-observacoes').value = item?.observacoes || '';
  if (!item) preencherMetadadosTurmaLotacao();
  openModal('modal-lotacao-componente');
}

function abrirModalAlocacaoLotacao(professorId = '', componenteId = '', editId = '') {
  if (!lotacaoEnsureSchema()) return;
  if (!LOTACAO_PROFESSORES_DATA.filter((item) => item.ativo !== false).length) {
    showToast('Cadastre ao menos um professor antes de lotar.', 'alerta');
    return;
  }
  if (!LOTACAO_COMPONENTES_DATA.filter((item) => item.ativo !== false).length) {
    showToast('Cadastre ao menos um componente/turma antes de lotar.', 'alerta');
    return;
  }

  const item = editId ? getLotacaoAlocacaoById(editId) : null;
  document.getElementById('modal-lotacao-alocacao-title').textContent = item ? 'Editar Lotação' : 'Lotar Professor';
  document.getElementById('lot-aloc-edit-id').value = item?.id || '';
  popularSelectLotacaoProfessores('lot-aloc-professor-id', item?.professor_id || professorId || '');
  popularSelectLotacaoComponentes('lot-aloc-componente-id', item?.componente_id || componenteId || '');
  const cargaInput = document.getElementById('lot-aloc-ch-semanal');
  cargaInput.value = item ? lotacaoNumber(item.carga_horaria_semanal) : '';
  cargaInput.dataset.autofill = item ? 'false' : 'true';
  document.getElementById('lot-aloc-data-inicio').value = item?.data_inicio || lotacaoToday();
  document.getElementById('lot-aloc-observacoes').value = item?.observacoes || '';
  sincronizarCargaAlocacaoLotacao();
  openModal('modal-lotacao-alocacao');
}

function abrirModalDesistenciaLotacao(alocacaoId = '') {
  if (!lotacaoEnsureSchema()) return;
  if (!LOTACAO_ALOCACOES_DATA.some((item) => item.status === 'ativa')) {
    showToast('Não há lotações ativas para registrar desistência.', 'alerta');
    return;
  }

  popularSelectLotacaoAlocacoes('lot-des-alocacao-id', alocacaoId || '');
  document.getElementById('lot-des-edit-id').value = '';
  document.getElementById('lot-des-data').value = lotacaoToday();
  document.getElementById('lot-des-motivo').value = '';
  document.getElementById('lot-des-observacoes').value = '';
  openModal('modal-lotacao-desistencia');
}

async function salvarProfessorLotacao() {
  if (!lotacaoEnsureSchema()) return;
  const id = document.getElementById('lot-prof-edit-id').value;
  const nome = (document.getElementById('lot-prof-nome').value || '').trim();
  if (!nome) {
    showToast('Informe o nome do professor.', 'alerta');
    return;
  }

  const payload = attachSchoolId({
    nome,
    matricula: (document.getElementById('lot-prof-matricula').value || '').trim() || null,
    cargo: (document.getElementById('lot-prof-cargo').value || '').trim() || null,
    tipo_vinculo: (document.getElementById('lot-prof-tipo-vinculo').value || '').trim() || null,
    vinculo: (document.getElementById('lot-prof-vinculo').value || '').trim() || null,
    carga_horaria_maxima: lotacaoNumber(document.getElementById('lot-prof-carga-maxima').value || 200),
    observacoes: (document.getElementById('lot-prof-observacoes').value || '').trim() || null,
    ativo: !!document.getElementById('lot-prof-ativo').checked,
    created_by: getCurrentUser()?.id || null
  }, 'lotacao_professores');

  showLoading(id ? 'Atualizando professor...' : 'Salvando professor...');
  try {
    let response;
    if (id) {
      let query = supabaseClient.from('lotacao_professores').update(payload).eq('id', id);
      query = applySchoolScope(query, 'lotacao_professores');
      response = await query;
    } else {
      response = await supabaseClient.from('lotacao_professores').insert(payload);
    }

    if (response.error) throw response.error;
    closeModal('modal-lotacao-professor');
    await renderLotacaoPage(true);
    showToast('Professor salvo com sucesso.', 'sucesso');
  } catch (error) {
    console.error('[Lotacao] Erro ao salvar professor:', error);
    showToast('Não foi possível salvar o professor.', 'erro');
  } finally {
    hideLoading();
  }
}

async function salvarComponenteLotacao() {
  if (!lotacaoEnsureSchema()) return;
  const id = document.getElementById('lot-comp-edit-id').value;
  const turmaId = document.getElementById('lot-comp-turma-id').value;
  const disciplina = (document.getElementById('lot-comp-disciplina').value || '').trim();
  const turma = getLotacaoTurmaById(turmaId);

  if (!turma) {
    showToast('Selecione a turma.', 'alerta');
    return;
  }
  if (!disciplina) {
    showToast('Informe a disciplina.', 'alerta');
    return;
  }

  const payload = attachSchoolId({
    turma_id: String(turma.id),
    turma_codigo: turma.code || '',
    ano: Number(document.getElementById('lot-comp-ano').value || new Date().getFullYear()),
    oferta: (document.getElementById('lot-comp-oferta').value || '').trim() || null,
    modalidade: (document.getElementById('lot-comp-modalidade').value || '').trim() || null,
    serie_modalidade: (document.getElementById('lot-comp-serie-modalidade').value || turma.serie || '').trim() || null,
    turno: (document.getElementById('lot-comp-turno').value || turma.turno || '').trim() || null,
    localidade: (document.getElementById('lot-comp-localidade').value || turma.localidade || '').trim() || null,
    disciplina,
    carga_horaria_semanal: lotacaoNumber(document.getElementById('lot-comp-ch-semanal').value || 0),
    quantidade_aulas: lotacaoNumber(document.getElementById('lot-comp-qtd-aulas').value || 0),
    observacoes: (document.getElementById('lot-comp-observacoes').value || '').trim() || null,
    ativo: true,
    created_by: getCurrentUser()?.id || null
  }, 'lotacao_componentes_turma');

  showLoading(id ? 'Atualizando componente...' : 'Salvando componente...');
  try {
    let response;
    if (id) {
      let query = supabaseClient.from('lotacao_componentes_turma').update(payload).eq('id', id);
      query = applySchoolScope(query, 'lotacao_componentes_turma');
      response = await query;
    } else {
      response = await supabaseClient.from('lotacao_componentes_turma').insert(payload);
    }
    if (response.error) throw response.error;
    closeModal('modal-lotacao-componente');
    await renderLotacaoPage(true);
    showToast('Componente salvo com sucesso.', 'sucesso');
  } catch (error) {
    console.error('[Lotacao] Erro ao salvar componente:', error);
    showToast('Não foi possível salvar o componente.', 'erro');
  } finally {
    hideLoading();
  }
}

async function salvarAlocacaoLotacao() {
  if (!lotacaoEnsureSchema()) return;
  const id = document.getElementById('lot-aloc-edit-id').value;
  const professorId = document.getElementById('lot-aloc-professor-id').value;
  const componenteId = document.getElementById('lot-aloc-componente-id').value;
  const dataInicio = document.getElementById('lot-aloc-data-inicio').value;
  const carga = lotacaoNumber(document.getElementById('lot-aloc-ch-semanal').value || 0);

  if (!professorId) {
    showToast('Selecione o professor.', 'alerta');
    return;
  }
  if (!componenteId) {
    showToast('Selecione o componente/turma.', 'alerta');
    return;
  }
  if (!dataInicio) {
    showToast('Informe a data inicial.', 'alerta');
    return;
  }
  if (carga <= 0) {
    showToast('Informe a carga horária semanal.', 'alerta');
    return;
  }

  const payload = attachSchoolId({
    professor_id: professorId,
    componente_id: componenteId,
    carga_horaria_semanal: carga,
    data_inicio: dataInicio,
    status: 'ativa',
    observacoes: (document.getElementById('lot-aloc-observacoes').value || '').trim() || null,
    created_by: getCurrentUser()?.id || null
  }, 'lotacao_alocacoes');

  showLoading(id ? 'Atualizando lotação...' : 'Salvando lotação...');
  try {
    let response;
    if (id) {
      let query = supabaseClient.from('lotacao_alocacoes').update(payload).eq('id', id);
      query = applySchoolScope(query, 'lotacao_alocacoes');
      response = await query;
    } else {
      response = await supabaseClient.from('lotacao_alocacoes').insert(payload);
    }
    if (response.error) throw response.error;
    closeModal('modal-lotacao-alocacao');
    await renderLotacaoPage(true);
    showToast('Lotação registrada com sucesso.', 'sucesso');
  } catch (error) {
    console.error('[Lotacao] Erro ao salvar lotação:', error);
    showToast('Não foi possível salvar a lotação.', 'erro');
  } finally {
    hideLoading();
  }
}

async function salvarDesistenciaLotacao() {
  if (!lotacaoEnsureSchema()) return;
  const alocacaoId = document.getElementById('lot-des-alocacao-id').value;
  const dataDesistencia = document.getElementById('lot-des-data').value;
  const motivo = (document.getElementById('lot-des-motivo').value || '').trim();
  const observacoes = (document.getElementById('lot-des-observacoes').value || '').trim();
  const alocacao = getLotacaoAlocacaoById(alocacaoId);

  if (!alocacao) {
    showToast('Selecione a lotação ativa.', 'alerta');
    return;
  }
  if (!dataDesistencia) {
    showToast('Informe a data da desistência.', 'alerta');
    return;
  }
  if (!motivo) {
    showToast('Informe o motivo da desistência.', 'alerta');
    return;
  }

  showLoading('Registrando desistência...');
  try {
    const desistPayload = attachSchoolId({
      alocacao_id: alocacao.id,
      professor_id: alocacao.professor_id,
      componente_id: alocacao.componente_id,
      data_desistencia: dataDesistencia,
      motivo,
      observacoes: observacoes || null,
      created_by: getCurrentUser()?.id || null
    }, 'lotacao_desistencias');

    const { error: insertError } = await supabaseClient.from('lotacao_desistencias').insert(desistPayload);
    if (insertError) throw insertError;

    let updateQuery = supabaseClient
      .from('lotacao_alocacoes')
      .update({
        status: 'desistencia',
        data_fim: dataDesistencia,
        observacoes: observacoes || alocacao.observacoes || null
      })
      .eq('id', alocacao.id);
    updateQuery = applySchoolScope(updateQuery, 'lotacao_alocacoes');
    const { error: updateError } = await updateQuery;
    if (updateError) throw updateError;

    closeModal('modal-lotacao-desistencia');
    await renderLotacaoPage(true);
    showToast('Desistência registrada com sucesso.', 'sucesso');
  } catch (error) {
    console.error('[Lotacao] Erro ao registrar desistência:', error);
    showToast('Não foi possível registrar a desistência.', 'erro');
  } finally {
    hideLoading();
  }
}

async function excluirProfessorLotacao(id) {
  if (!lotacaoEnsureSchema()) return;
  const professor = getLotacaoProfessorById(id);
  if (!professor) return;

  if (getLotacaoActiveAllocationsByProfessor(id).length) {
    showToast('Este professor possui lotações ativas. Registre a desistência antes de excluir.', 'alerta');
    return;
  }
  if (!confirm(`Excluir o professor ${professor.nome}?`)) return;

  showLoading('Excluindo professor...');
  try {
    let query = supabaseClient.from('lotacao_professores').delete().eq('id', id);
    query = applySchoolScope(query, 'lotacao_professores');
    const { error } = await query;
    if (error) throw error;
    await renderLotacaoPage(true);
    showToast('Professor excluído com sucesso.', 'sucesso');
  } catch (error) {
    console.error('[Lotacao] Erro ao excluir professor:', error);
    showToast('Não foi possível excluir o professor.', 'erro');
  } finally {
    hideLoading();
  }
}

async function excluirComponenteLotacao(id) {
  if (!lotacaoEnsureSchema()) return;
  const componente = getLotacaoComponenteById(id);
  if (!componente) return;

  if (getLotacaoActiveAllocationsByComponente(id).length) {
    showToast('Este componente possui lotações ativas. Registre a desistência antes de excluir.', 'alerta');
    return;
  }
  if (!confirm(`Excluir ${componente.turma_codigo} • ${componente.disciplina}?`)) return;

  showLoading('Excluindo componente...');
  try {
    let query = supabaseClient.from('lotacao_componentes_turma').delete().eq('id', id);
    query = applySchoolScope(query, 'lotacao_componentes_turma');
    const { error } = await query;
    if (error) throw error;
    await renderLotacaoPage(true);
    showToast('Componente excluído com sucesso.', 'sucesso');
  } catch (error) {
    console.error('[Lotacao] Erro ao excluir componente:', error);
    showToast('Não foi possível excluir o componente.', 'erro');
  } finally {
    hideLoading();
  }
}

function lotacaoSchoolMeta(field) {
  if (!ESCOLA_ATUAL || typeof ESCOLA_ATUAL !== 'object') return '';
  return ESCOLA_ATUAL[field] || '';
}

function imprimirRelatorioLotacaoGeral() {
  if (!lotacaoEnsureSchema()) return;
  const rows = LOTACAO_COMPONENTES_DATA
    .filter((item) => item.ativo !== false)
    .map((item) => {
      const status = getLotacaoComponenteStatus(item);
      const professores = getLotacaoActiveAllocationsByComponente(item.id)
        .map((alocacao) => {
          const professor = getLotacaoProfessorById(alocacao.professor_id);
          return `${professor?.nome || 'Professor'} (${lotacaoFormatCarga(alocacao.carga_horaria_semanal)})`;
        })
        .join(', ') || 'Sem lotação';
      return `
        <tr>
          <td>${lotacaoEscape(item.ano || new Date().getFullYear())}</td>
          <td>${lotacaoEscape(item.oferta || '—')}</td>
          <td>${lotacaoEscape(item.modalidade || item.serie_modalidade || '—')}</td>
          <td>${lotacaoEscape(item.turno || '—')}</td>
          <td>${lotacaoEscape(item.turma_codigo || '—')}</td>
          <td>${getLotacaoStudentCount(item)}</td>
          <td>${lotacaoEscape(item.disciplina || '—')}</td>
          <td>${lotacaoFormatCarga(item.carga_horaria_semanal)}</td>
          <td>${lotacaoEscape(professores)}</td>
          <td>${lotacaoStatusChip(status.key)}</td>
        </tr>
      `;
    })
    .join('');

  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) {
    showToast('Libere o pop-up para emitir o relatório.', 'alerta');
    return;
  }

  popup.document.write(`
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório de Lotação</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
          h1, h2, p { margin: 0; }
          .topo { margin-bottom: 20px; }
          .topo h1 { font-size: 22px; margin-bottom: 6px; }
          .topo p { font-size: 12px; color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 11px; vertical-align: top; text-align: left; }
          th { background: #f3f4f6; }
          .resumo { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px; }
          .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 12px; }
          .card strong { display: block; font-size: 22px; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="topo">
          <h1>Relatório Geral de Lotação</h1>
          <p>${lotacaoEscape(getCurrentSchoolName() || 'Escola')} • Emitido em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <div class="resumo">
          <div class="card">Professores ativos<strong>${getLotacaoResumo().professoresAtivos}</strong></div>
          <div class="card">Componentes no mapa<strong>${getLotacaoResumo().componentesAtivos}</strong></div>
          <div class="card">Pendências<strong>${getLotacaoResumo().pendencias}</strong></div>
          <div class="card">Lotações ativas<strong>${getLotacaoResumo().alocacoesAtivas}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ano</th>
              <th>Oferta</th>
              <th>Modalidade</th>
              <th>Turno</th>
              <th>Turma</th>
              <th>Alunos</th>
              <th>Disciplina</th>
              <th>CH</th>
              <th>Professor(es)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="10">Nenhum registro cadastrado.</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  setTimeout(() => popup.print(), 250);
}

function imprimirFichaLotacaoProfessor(professorId) {
  if (!lotacaoEnsureSchema()) return;
  const professor = getLotacaoProfessorById(professorId);
  if (!professor) {
    showToast('Professor não encontrado.', 'alerta');
    return;
  }

  const alocacoes = getLotacaoActiveAllocationsByProfessor(professorId)
    .map((item) => ({ item, componente: getLotacaoComponenteById(item.componente_id) }))
    .sort((a, b) => `${a.componente?.turma_codigo || ''}${a.componente?.disciplina || ''}`.localeCompare(`${b.componente?.turma_codigo || ''}${b.componente?.disciplina || ''}`));

  if (!alocacoes.length) {
    showToast('Este professor ainda não possui lotação ativa para impressão.', 'alerta');
    return;
  }

  const linhasDocencia = Array.from({ length: 10 }, (_, index) => {
    const registro = alocacoes[index];
    if (!registro) {
      return `<tr><td>${index + 1}</td><td></td><td></td><td></td><td></td></tr>`;
    }
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${lotacaoEscape(registro.componente?.turma_codigo || '')}</td>
        <td>${lotacaoEscape(registro.componente?.disciplina || '')}</td>
        <td>${lotacaoFormatCarga(registro.item.carga_horaria_semanal)}</td>
        <td>${lotacaoFormatDateBr(registro.item.data_inicio)}</td>
      </tr>
    `;
  }).join('');

  const linhasApoio = Array.from({ length: 5 }, (_, index) => `
    <tr><td>${index + 1}</td><td></td><td></td><td></td><td></td><td></td></tr>
  `).join('');

  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) {
    showToast('Libere o pop-up para imprimir a ficha.', 'alerta');
    return;
  }

  popup.document.write(`
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Ficha Avulsa de Lotação</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 22px; color: #111; }
          .sheet { border: 2px solid #111; padding: 16px; }
          .header { display: grid; grid-template-columns: 90px 1fr; gap: 14px; align-items: center; border-bottom: 2px solid #111; padding-bottom: 12px; }
          .header img { width: 86px; height: auto; }
          .header-copy { text-align: center; line-height: 1.35; }
          .header-copy strong { display: block; font-size: 14px; }
          .header-copy span { display: block; font-size: 12px; }
          .title { margin: 14px 0 12px; text-align: center; font-size: 18px; font-weight: 800; letter-spacing: .4px; }
          .section-label { margin: 14px 0 8px; font-weight: 700; font-size: 12px; background: #f3f4f6; border: 1px solid #111; padding: 6px 8px; }
          .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; margin-bottom: 8px; }
          .field { border: 1px solid #111; min-height: 44px; padding: 6px 8px; }
          .field span { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
          .field strong { display: block; font-size: 12px; min-height: 14px; }
          .col-2 { grid-column: span 2; }
          .col-3 { grid-column: span 3; }
          .col-4 { grid-column: span 4; }
          .col-5 { grid-column: span 5; }
          .col-6 { grid-column: span 6; }
          .col-7 { grid-column: span 7; }
          .col-8 { grid-column: span 8; }
          .col-9 { grid-column: span 9; }
          .col-12 { grid-column: span 12; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #111; padding: 6px; font-size: 11px; min-height: 28px; }
          th { background: #f9fafb; text-transform: uppercase; font-size: 10px; }
          .footer { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: end; }
          .sign { text-align: center; margin-top: 34px; }
          .sign div { border-top: 1px solid #111; padding-top: 6px; font-size: 11px; font-weight: 700; }
          .date { text-align: right; margin-top: 18px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <img src="assets/cabecalho_logo.png" alt="Cabeçalho">
            <div class="header-copy">
              <strong>GOVERNO DO ESTADO DO PARÁ</strong>
              <span>SECRETARIA DE ESTADO DE EDUCAÇÃO</span>
              <span>SISTEMA DE GESTÃO ESCOLAR</span>
            </div>
          </div>

          <div class="title">FORMULÁRIO AVULSO DE LOTAÇÃO</div>

          <div class="section-label">INFORMAÇÕES DA NOVA LOTAÇÃO</div>

          <div class="grid">
            <div class="field col-2"><span>Ano</span><strong>${lotacaoEscape(String(alocacoes[0]?.componente?.ano || new Date().getFullYear()))}</strong></div>
            <div class="field col-3"><span>URE / USE</span><strong>${lotacaoEscape(lotacaoSchoolMeta('ure') || '')}</strong></div>
            <div class="field col-4"><span>Município</span><strong>${lotacaoEscape(lotacaoSchoolMeta('municipio') || '')}</strong></div>
            <div class="field col-3"><span>CódMEC</span><strong>${lotacaoEscape(lotacaoSchoolMeta('codigo_mec') || '')}</strong></div>
          </div>
          <div class="grid">
            <div class="field col-3"><span>Setor</span><strong>${lotacaoEscape(lotacaoSchoolMeta('setor') || '')}</strong></div>
            <div class="field col-9"><span>Escola</span><strong>${lotacaoEscape(getCurrentSchoolName() || '')}</strong></div>
          </div>
          <div class="grid">
            <div class="field col-3"><span>T. de vínculo</span><strong>${lotacaoEscape(professor.tipo_vinculo || '')}</strong></div>
            <div class="field col-3"><span>Matrícula</span><strong>${lotacaoEscape(professor.matricula || '')}</strong></div>
            <div class="field col-2"><span>V</span><strong>${lotacaoEscape(professor.vinculo || '')}</strong></div>
            <div class="field col-4"><span>Cargo</span><strong>${lotacaoEscape(professor.cargo || '')}</strong></div>
          </div>
          <div class="grid">
            <div class="field col-12"><span>Nome</span><strong>${lotacaoEscape(professor.nome || '')}</strong></div>
          </div>

          <div class="section-label">INCLUSÕES DE DOCÊNCIA</div>
          <table>
            <thead>
              <tr>
                <th style="width:8%">Nº Seq</th>
                <th style="width:18%">Turma</th>
                <th>Disciplina</th>
                <th style="width:14%">CH Semanal</th>
                <th style="width:18%">Data Inicial</th>
              </tr>
            </thead>
            <tbody>${linhasDocencia}</tbody>
          </table>

          <div class="section-label">INCLUSÕES DE APOIO</div>
          <table>
            <thead>
              <tr>
                <th style="width:8%">Nº Seq</th>
                <th style="width:14%">Código</th>
                <th>Atividade</th>
                <th style="width:14%">Turno</th>
                <th style="width:14%">CH Semanal</th>
                <th style="width:18%">Data Inicial</th>
              </tr>
            </thead>
            <tbody>${linhasApoio}</tbody>
          </table>

          <div class="date">${lotacaoEscape(lotacaoSchoolMeta('municipio') || getCurrentSchoolName() || 'Local')}, ${typeof formatarDataPorExtenso === 'function' ? formatarDataPorExtenso(lotacaoToday()) : lotacaoFormatDateBr(lotacaoToday())}.</div>

          <div class="footer">
            <div class="sign"><div>${lotacaoEscape(professor.nome || 'Servidor(a)')}</div></div>
            <div class="sign"><div>Direção / Responsável pela Lotação</div></div>
          </div>
        </div>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  setTimeout(() => popup.print(), 250);
}
