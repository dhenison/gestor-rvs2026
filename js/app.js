/* ============================================================
   RVS ESCOLAR — app.js — versão definitiva
   ============================================================ */

// ─── SUPABASE CLIENT ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── OFFLINE QUEUE — sync automático sem botão ───────────────────────────────
// Estratégia: online → Supabase direto | offline → IndexedDB fila local
// Ao reconectar: evento 'online' dispara sincronização automática

const OFFLINE_DB_NAME = 'rvs_offline_queue';
const OFFLINE_DB_VER  = 1;
let _offlineQueueDB   = null;

function _abrirOfflineDB() {
  return new Promise((resolve, reject) => {
    if (_offlineQueueDB) { resolve(_offlineQueueDB); return; }
    const req = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('fila')) {
        db.createObjectStore('fila', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = e => { _offlineQueueDB = e.target.result; resolve(_offlineQueueDB); };
    req.onerror   = e => reject(e.target.error);
  });
}

async function _enfileirarOp(tabela, operacao, dados, conflito) {
  const db = await _abrirOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fila', 'readwrite');
    tx.objectStore('fila').add({ tabela, operacao, dados, conflito, ts: Date.now() });
    tx.oncomplete = () => {
      // Registra Background Sync para sincronizar mesmo com o app fechado
      if (typeof window.registerBackgroundSync === 'function') {
        window.registerBackgroundSync();
      }
      resolve();
    };
    tx.onerror    = e => reject(e.target.error);
  });
}

async function _obterFila() {
  const db = await _abrirOfflineDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction('fila', 'readonly');
    const req = tx.objectStore('fila').getAll();
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

async function _removerDaFila(id) {
  const db = await _abrirOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fila', 'readwrite');
    tx.objectStore('fila').delete(id);
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

// Sincroniza fila offline → Supabase (chamado automaticamente ao reconectar)
async function sincronizarFilaOffline() {
  if (!navigator.onLine) return;
  let fila;
  try { fila = await _obterFila(); } catch(e) { return; }
  if (!fila || !fila.length) return;

  console.log(`[Sync] ${fila.length} operação(ões) pendente(s) — sincronizando...`);
  let sucesso = 0;

  for (const item of fila) {
    try {
      let resultado;
      if (item.operacao === 'upsert') {
        resultado = await supabaseClient
          .from(item.tabela)
          .upsert(item.dados, item.conflito ? { onConflict: item.conflito } : undefined);
      } else if (item.operacao === 'insert') {
        resultado = await supabaseClient.from(item.tabela).insert(item.dados);
      }
      if (resultado && !resultado.error) {
        await _removerDaFila(item.id);
        sucesso++;
      } else {
        console.warn('[Sync] Falha no item:', resultado?.error);
      }
    } catch(e) { console.warn('[Sync] Erro:', e); }
  }

  if (sucesso > 0) {
    showToast(`✅ ${sucesso} registro(s) sincronizado(s) automaticamente`, 'sucesso');
    console.log(`[Sync] ${sucesso}/${fila.length} itens sincronizados com sucesso.`);
  }
}

// Wrapper inteligente: salva no Supabase ou enfileira se offline
async function supabaseSalvar(tabela, dados, conflito = null) {
  if (navigator.onLine) {
    const { error } = await supabaseClient
      .from(tabela)
      .upsert(dados, conflito ? { onConflict: conflito } : undefined);
    if (error) {
      console.error('[Supabase] Erro ao salvar, enfileirando:', error);
      await _enfileirarOp(tabela, 'upsert', dados, conflito);
      showToast('⚠️ Salvo localmente — será sincronizado em breve', 'alerta');
    }
  } else {
    await _enfileirarOp(tabela, 'upsert', dados, conflito);
    showToast('📵 Sem internet — salvo localmente, sync automático ao conectar', 'alerta');
  }
}

// Sync automático ao reconectar (sem botão)
window.addEventListener('online', () => {
  console.log('[Rede] Conexão restaurada — sincronizando fila offline...');
  setTimeout(sincronizarFilaOffline, 1500); // pequeno delay para a rede estabilizar
});

// Tenta sincronizar itens pendentes ao carregar a página
window.addEventListener('load', () => {
  if (navigator.onLine) setTimeout(sincronizarFilaOffline, 4000);
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── ESTADO GLOBAL ────────────────────────────────────────────────────────────
const ADMIN_SENHA = 'RVS@gestor2026';
let PERFIL_ATUAL  = 'professor';

let TURMAS_DATA  = [];
let ALUNOS_DATA  = [];
let OCORR_DATA   = [];
let ROTAS_DATA   = [];
let CALENDARIO   = {};
let HORARIOS_LINKS = {};
let TURMAS_LOCALIDADES = {};
let OBAFOG_DATA = [];
let NOTAS_BIMESTRAIS_DATA = [];
let CONSELHOS_CLASSE_DATA = [];
let CONSELHO_CLASSE_ALUNOS_DATA = [];
let CONSELHO_SCHEMA_STATUS = { ready: false, missingTables: [] };

let conselhoClasseAtual = null;
let conselhoClasseLinhas = [];

const CONSELHO_COMPONENTES_PADRAO = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências',
  'História',
  'Geografia',
  'Arte',
  'Educação Física',
  'Inglês'
];

const CONSELHO_MEDIA_MINIMA = 6;
const CONSELHO_COMPONENTE_ALIAS_MAP = {
  'Língua Portuguesa': ['lingua portuguesa', 'língua portuguesa', 'portugues', 'português', 'lp'],
  'Matemática': ['matematica', 'matemática'],
  'Ciências': ['ciencias', 'ciências', 'ciencias naturais', 'ciências naturais'],
  'História': ['historia', 'história'],
  'Geografia': ['geografia'],
  'Arte': ['arte', 'artes'],
  'Educação Física': ['educacao fisica', 'educação física', 'ed fisica', 'ed. fisica'],
  'Inglês': ['ingles', 'inglês', 'lingua inglesa', 'língua inglesa'],
  'Ensino Religioso': ['ensino religioso', 'religiao', 'religião'],
  'Projeto de Vida': ['projeto de vida'],
  'Física': ['fisica', 'física'],
  'Química': ['quimica', 'química'],
  'Biologia': ['biologia'],
  'Filosofia': ['filosofia'],
  'Sociologia': ['sociologia'],
  'Redação': ['redacao', 'redação', 'produção textual', 'producao textual'],
  'Literatura': ['literatura'],
  'Espanhol': ['espanhol']
};

const CHAT_DATA = { coord:[], sec:[], prof:[] };
const freq = { entrada:{}, saida:{} };
let envolvidos = [];
let chatSegment = 'coord', chatContact = 0;
let calYear = 2026, calMonth = 4;
let clickTimer = null;
let turmaChamadaAtual = '';
const chamadaConsolidada = { entrada:false, saida:false };
let chamadaDesbloqueadaTemporaria = { entrada:false, saida:false };

const LIVROS = [
  {nome:'Língua Portuguesa',icon:'📖',entregues:0,total:0},
  {nome:'Matemática',icon:'📐',entregues:0,total:0},
  {nome:'Física',icon:'⚡',entregues:0,total:0},
  {nome:'Química',icon:'🧪',entregues:0,total:0},
  {nome:'Biologia',icon:'🧬',entregues:0,total:0},
  {nome:'História',icon:'🏛️',entregues:0,total:0},
  {nome:'Geografia',icon:'🌍',entregues:0,total:0},
  {nome:'Inglês',icon:'🇺🇸',entregues:0,total:0},
  {nome:'Artes',icon:'🎨',entregues:0,total:0},
  {nome:'Educação Física',icon:'⚽',entregues:0,total:0},
  {nome:'Sociologia',icon:'👥',entregues:0,total:0},
  {nome:'Filosofia',icon:'💭',entregues:0,total:0},
  {nome:'Educação Ambiental',icon:'🌱',entregues:0,total:0},
  {nome:'Prepara Matemática',icon:'🔢',entregues:0,total:0},
  {nome:'Prepara Língua Portuguesa',icon:'📝',entregues:0,total:0},
];

let PERMS = [
  {func:'Dashboard',                id:'page-dashboard',    coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'Agenda Pedagógica',         id:'page-agenda',       coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:false, editar_prof:false},
  {func:'Turmas',                   id:'page-turmas',       coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:false, editar_prof:false},
  {func:'Alunos',                   id:'page-alunos',       coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:false, editar_prof:false},
  {func:'Ficha do Aluno',           id:'page-ficha-aluno',  coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:false, editar_prof:false},
  {func:'Frequência',               id:'page-frequencia',   coord:true, sec:false, prof:true,  editar_coord:true,  editar_sec:false, editar_prof:true},
  {func:'Solicitações Pedagógicas', id:'page-solicitacoes', coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'RVS Agenda',               id:'page-rvs-agenda',   coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Horário de Aula',           id:'page-horarios',     coord:true, sec:true,  prof:true,  editar_coord:false, editar_sec:false, editar_prof:false},
  {func:'Topo do Saber',            id:'page-topo-saber',   coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Transporte',               id:'page-transporte',   coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'Ocorrências',              id:'page-ocorrencias',  coord:true, sec:false, prof:true,  editar_coord:true,  editar_sec:false, editar_prof:true},
  {func:'Livros Didáticos',          id:'page-livros',       coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'Relatórios',               id:'page-relatorios',   coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'Tratamento Ocorr.',        id:'page-tratamento-ocorrencias', coord:true, sec:false, prof:false, editar_coord:true,  editar_sec:false, editar_prof:false},
  {func:'Permissões',               id:'page-permissoes',   coord:false,sec:false, prof:false, editar_coord:false, editar_sec:false, editar_prof:false},
  {func:'Usuários',                 id:'page-usuarios',     coord:false,sec:false, prof:false, editar_coord:false, editar_sec:false, editar_prof:false},
  {func:'Boletins',                 id:'page-boletins',     coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Conselho de Classe',       id:'page-conselho-classe', coord:true, sec:true, prof:false, editar_coord:true, editar_sec:true, editar_prof:false},
  {func:'Documentos Secretaria',    id:'page-documentos-secretaria', coord:true, sec:true, prof:false, editar_coord:true, editar_sec:true, editar_prof:false},
  {func:'Reconhecimento Facial',    id:'page-reconhecimento-facial', coord:true, sec:true, prof:false, editar_coord:true, editar_sec:true, editar_prof:false}
];

let ESCOLAS_DATA = [];
let ESCOLA_ATUAL_ID = null;
let ESCOLA_ATUAL = null;
let MULTI_ESCOLA_ATIVO = false;
let AUTO_SAVE_READY = false;

const ESCOLA_CONTEXT_KEY = 'rvs_school_context';
const ACTIVE_PAGE_CONTEXT_KEY = 'rvs_active_page';
const TURMA_SERIES_BASE = [
  '1º Ano — Ensino Médio',
  '2º Ano — Ensino Médio',
  '3º Ano — Ensino Médio',
  'EJA — Primeira Etapa',
  'EJA — Segunda Etapa',
  'Fluxo'
];
const TURMA_SERIES_RURAL_EXTRA = [
  'Educação Indígena',
  'SOME',
  'SOMEI',
  'CEMEP'
];
const TURMA_LOCALIDADES_RURAL = [
  'FOGAO QUEIMADO',
  'COMUNIDADE SANTA RITA',
  'CAMPINHO',
  'ALDEIA TUREDJAN',
  'ALDEIA AUKRE',
  'ALDEIA KRANHKRO'
];
const TABELAS_COM_ESCOLA = new Set([
  'alunos',
  'automation_rules',
  'boletins',
  'boletins_turmas',
  'cartoes_acesso_olimpiadas',
  'comunicados',
  'configuracoes',
  'conselho_classe_alunos',
  'conselhos_classe',
  'documentos_secretaria',
  'eventos',
  'frequencia',
  'livros_alunos',
  'notas_bimestrais',
  'obafog_equipes',
  'ocorrencias',
  'olimpiadas',
  'responsaveis',
  'rotas',
  'solicitacoes',
  'turmas',
  'usuarios',
  'whatsapp_envios'
]);

const MODULOS_ESCOLA_PADRAO = Object.freeze({
  'page-dashboard': true,
  'page-agenda': true,
  'page-turmas': true,
  'page-alunos': true,
  'page-boletins': true,
  'page-conselho-classe': true,
  'page-frequencia': true,
  'page-solicitacoes': true,
  'page-rvs-agenda': true,
  'page-horarios': true,
  'page-topo-saber': true,
  'page-transporte': true,
  'page-ocorrencias': true,
  'page-tratamento-ocorrencias': true,
  'page-livros': true,
  'page-relatorios': true,
  'page-documentos-secretaria': true,
  'page-reconhecimento-facial': true,
  'page-usuarios': true,
  'page-permissoes': true
});

const MODULO_LABELS = Object.freeze({
  'page-dashboard': 'Dashboard',
  'page-agenda': 'Agenda Pedagógica',
  'page-turmas': 'Turmas',
  'page-alunos': 'Alunos',
  'page-boletins': 'Boletins',
  'page-conselho-classe': 'Conselho de Classe',
  'page-frequencia': 'Frequência',
  'page-solicitacoes': 'Solicitações Pedagógicas',
  'page-rvs-agenda': 'RVS Agenda',
  'page-horarios': 'Horário de Aula',
  'page-topo-saber': 'Topo do Saber',
  'page-transporte': 'Transporte',
  'page-ocorrencias': 'Ocorrências',
  'page-tratamento-ocorrencias': 'Tratamento de Ocorrências',
  'page-livros': 'Livros Didáticos',
  'page-relatorios': 'Relatórios',
  'page-documentos-secretaria': 'Documentos Secretaria',
  'page-reconhecimento-facial': 'Reconhecimento Facial',
  'page-usuarios': 'Usuários',
  'page-permissoes': 'Permissões'
});

function cloneSchoolModules() {
  return JSON.parse(JSON.stringify(MODULOS_ESCOLA_PADRAO));
}

function mergeSchoolModules(rawModules) {
  const base = cloneSchoolModules();
  if (!rawModules || typeof rawModules !== 'object') return base;
  Object.keys(base).forEach((key) => {
    if (rawModules[key] !== undefined) base[key] = !!rawModules[key];
  });
  return base;
}

function normalizeSchoolSlug(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

function isMissingRelationError(error) {
  if (!error) return false;
  return error.code === '42P01' || /does not exist/i.test(error.message || '');
}

function isAdminGlobal(user = null) {
  const alvo = user || getCurrentUser?.();
  return !!alvo?.admin_global;
}

function getActiveSchoolId(user = null) {
  const alvo = user || getCurrentUser?.();
  return ESCOLA_ATUAL_ID || alvo?.escola_id_ativa || alvo?.escola_id || null;
}

function getCurrentSchoolName() {
  return ESCOLA_ATUAL?.nome || '';
}

function isSchoolScopedTable(tableName) {
  return TABELAS_COM_ESCOLA.has(tableName);
}

function applySchoolScope(query, tableName, user = null) {
  if (!MULTI_ESCOLA_ATIVO || !isSchoolScopedTable(tableName)) return query;
  const escolaId = getActiveSchoolId(user);
  if (!escolaId) return query;
  return query.eq('escola_id', escolaId);
}

function attachSchoolId(payload, tableName, user = null) {
  if (!MULTI_ESCOLA_ATIVO || !isSchoolScopedTable(tableName)) return payload;
  const escolaId = getActiveSchoolId(user);
  if (!escolaId) return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => {
      if (!item || typeof item !== 'object' || item.escola_id) return item;
      return { ...item, escola_id: escolaId };
    });
  }

  if (!payload || typeof payload !== 'object' || payload.escola_id) return payload;
  return { ...payload, escola_id: escolaId };
}

function getCurrentSchoolModules() {
  return ESCOLA_ATUAL?.modulos_ativos || cloneSchoolModules();
}

function isSchoolModuleEnabled(pageId, user = null) {
  const alvo = user || getCurrentUser?.();
  const fullPageId = String(pageId || '').startsWith('page-') ? String(pageId) : `page-${pageId}`;
  if (fullPageId === 'page-perfil') return true;
  if (fullPageId === 'page-escolas') return isAdminGlobal(alvo);
  if (!MULTI_ESCOLA_ATIVO) return true;
  if (isAdminGlobal(alvo)) return true;
  const modules = getCurrentSchoolModules();
  return modules[fullPageId] !== false;
}

function getConfigUpsertOptions() {
  return { onConflict: MULTI_ESCOLA_ATIVO ? 'escola_id,chave' : 'chave' };
}

function buildConfigPayload(chave, valor) {
  return attachSchoolId({ chave, valor }, 'configuracoes');
}

function getSchoolNameById(escolaId) {
  if (!escolaId) return 'Sem escola';
  return ESCOLAS_DATA.find((item) => item.id === escolaId)?.nome || 'Escola não encontrada';
}

function persistActivePage(pageId) {
  try {
    if (pageId) sessionStorage.setItem(ACTIVE_PAGE_CONTEXT_KEY, pageId);
  } catch (_) {}
}

function getPersistedActivePage() {
  try {
    return sessionStorage.getItem(ACTIVE_PAGE_CONTEXT_KEY) || '';
  } catch (_) {
    return '';
  }
}

function restaurarPaginaAtiva() {
  const storedPage = getPersistedActivePage();
  const targetPage = storedPage || 'dashboard';
  if (targetPage !== 'perfil' && !podeVer(targetPage)) {
    persistActivePage('dashboard');
    return;
  }
  const navItem = document.querySelector(`.nav-item[onclick*="showPage('${targetPage}'"]`);
  showPage(targetPage, navItem || null);
}

function isRuralOurilandiaSchool() {
  const nome = normalizarTexto(ESCOLA_ATUAL?.nome || '');
  const slug = normalizarTexto(ESCOLA_ATUAL?.slug || '');
  return (
    (nome.includes('rural') && nome.includes('ourilandia do norte')) ||
    (slug.includes('rural') && slug.includes('ourilandia'))
  );
}

function getTurmaSerieOptions() {
  return isRuralOurilandiaSchool()
    ? [...TURMA_SERIES_BASE, ...TURMA_SERIES_RURAL_EXTRA]
    : [...TURMA_SERIES_BASE];
}

function getTurmaLocalidadeOptions() {
  return isRuralOurilandiaSchool() ? [...TURMA_LOCALIDADES_RURAL] : [];
}

function popularSelectSerieTurma(selectId, selectedValue = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  const options = getTurmaSerieOptions();
  if (selectedValue && !options.includes(selectedValue)) options.push(selectedValue);
  select.innerHTML = options.map((option) => `<option value="${option}">${option}</option>`).join('');
  select.value = options.includes(selectedValue) ? selectedValue : options[0] || '';
}

function popularSelectLocalidadeTurma(selectId, selectedValue = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  const options = getTurmaLocalidadeOptions();
  if (selectedValue && !options.includes(selectedValue)) options.push(selectedValue);
  select.innerHTML = '<option value="">Selecione a localidade</option>' +
    options.map((option) => `<option value="${option}">${option}</option>`).join('');
  select.value = options.includes(selectedValue) ? selectedValue : '';
}

function sincronizarSelectsSerieTurma(createValue = '', editValue = '') {
  popularSelectSerieTurma('input-turma-serie', createValue);
  popularSelectSerieTurma('edit-turma-serie', editValue);
}

function sincronizarSelectsLocalidadeTurma(createValue = '', editValue = '') {
  const showLocalidade = isRuralOurilandiaSchool();
  const rowCreate = document.getElementById('row-turma-localidade');
  const rowEdit = document.getElementById('row-edit-turma-localidade');
  if (rowCreate) rowCreate.classList.toggle('hidden', !showLocalidade);
  if (rowEdit) rowEdit.classList.toggle('hidden', !showLocalidade);
  if (!showLocalidade) {
    const createSelect = document.getElementById('input-turma-localidade');
    const editSelect = document.getElementById('edit-turma-localidade');
    if (createSelect) createSelect.innerHTML = '<option value="">Selecione a localidade</option>';
    if (editSelect) editSelect.innerHTML = '<option value="">Selecione a localidade</option>';
    return;
  }
  popularSelectLocalidadeTurma('input-turma-localidade', createValue);
  popularSelectLocalidadeTurma('edit-turma-localidade', editValue);
}

async function salvarConfigTurmasLocalidades() {
  const payload = buildConfigPayload('turmas_localidades', TURMAS_LOCALIDADES);
  const { error } = await supabaseClient
    .from('configuracoes')
    .upsert(payload, getConfigUpsertOptions());
  if (error) throw error;
}

function popularEscolasUsuario(selectedId = '') {
  const select = document.getElementById('usr-escola');
  if (!select) return;
  const options = ESCOLAS_DATA.map((escola) => `<option value="${escola.id}">${escola.nome}</option>`).join('');
  select.innerHTML = '<option value="">Selecione a escola</option>' + options;
  select.value = selectedId || getActiveSchoolId() || '';
  select.disabled = !MULTI_ESCOLA_ATIVO || !ESCOLAS_DATA.length;
}

async function carregarContextoEscolas(user = null) {
  const usuario = user || getCurrentUser?.();
  if (!usuario) {
    MULTI_ESCOLA_ATIVO = false;
    ESCOLAS_DATA = [];
    ESCOLA_ATUAL = null;
    ESCOLA_ATUAL_ID = null;
    return;
  }

  let query = supabaseClient
    .from('escolas')
    .select('id, nome, slug, ativa, modulos_ativos, created_at')
    .order('nome');

  if (!isAdminGlobal(usuario)) {
    const escolaAlvo = usuario.escola_id_ativa || usuario.escola_id;
    if (escolaAlvo) query = query.eq('id', escolaAlvo);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingRelationError(error)) {
      MULTI_ESCOLA_ATIVO = false;
      ESCOLAS_DATA = [];
      ESCOLA_ATUAL = null;
      ESCOLA_ATUAL_ID = null;
      return;
    }
    console.error('[carregarContextoEscolas] Erro ao buscar escolas:', error);
    return;
  }

  MULTI_ESCOLA_ATIVO = true;
  ESCOLAS_DATA = (data || []).map((escola) => ({
    ...escola,
    modulos_ativos: mergeSchoolModules(escola.modulos_ativos)
  }));

  let escolaDesejada = '';
  try { escolaDesejada = sessionStorage.getItem(ESCOLA_CONTEXT_KEY) || ''; } catch (_) {}
  if (!escolaDesejada) escolaDesejada = usuario.escola_id_ativa || usuario.escola_id || '';
  if (!ESCOLAS_DATA.some((escola) => escola.id === escolaDesejada)) {
    escolaDesejada = ESCOLAS_DATA[0]?.id || usuario.escola_id_ativa || usuario.escola_id || null;
  }

  ESCOLA_ATUAL_ID = escolaDesejada || null;
  ESCOLA_ATUAL = ESCOLAS_DATA.find((escola) => escola.id === ESCOLA_ATUAL_ID) || null;

  try {
    if (ESCOLA_ATUAL_ID) sessionStorage.setItem(ESCOLA_CONTEXT_KEY, ESCOLA_ATUAL_ID);
  } catch (_) {}
}

function renderSchoolSwitcher() {
  const shell = document.getElementById('school-switcher-shell');
  const select = document.getElementById('school-switcher-select');
  const label = document.getElementById('school-current-label');
  if (!shell || !select || !label) return;

  if (!MULTI_ESCOLA_ATIVO || !ESCOLAS_DATA.length) {
    shell.style.display = 'none';
    return;
  }

  label.textContent = ESCOLA_ATUAL?.nome || 'Escola';
  select.innerHTML = ESCOLAS_DATA.map((escola) => `<option value="${escola.id}">${escola.nome}</option>`).join('');
  select.value = ESCOLA_ATUAL_ID || ESCOLAS_DATA[0]?.id || '';
  select.disabled = !isAdminGlobal() || ESCOLAS_DATA.length < 2;
  shell.style.display = 'flex';
}

async function trocarEscolaAtiva(escolaId) {
  const user = getCurrentUser?.();
  if (!user || !MULTI_ESCOLA_ATIVO || !escolaId || escolaId === ESCOLA_ATUAL_ID) return;

  if (!isAdminGlobal(user)) {
    const select = document.getElementById('school-switcher-select');
    if (select) select.value = ESCOLA_ATUAL_ID || '';
    return;
  }

  const select = document.getElementById('school-switcher-select');
  const currentPage = document.querySelector('.page.active')?.id?.replace('page-', '') || 'dashboard';
  persistActivePage(currentPage);
  showLoading(`Atualizando dados de ${getSchoolNameById(escolaId)}...`);
  if (select) select.disabled = true;

  const { error } = await supabaseClient
    .from('usuarios')
    .update({ escola_id_ativa: escolaId })
    .eq('id', user.id);

  if (error) {
    console.error('[trocarEscolaAtiva] Erro ao trocar escola:', error);
    showToast('Não foi possível trocar a escola ativa.', 'alerta');
    hideLoading();
    renderSchoolSwitcher();
    return;
  }

  const mergedUser = { ...user, escola_id_ativa: escolaId };
  try { sessionStorage.setItem('rvs_user', JSON.stringify(mergedUser)); } catch (_) {}
  try { sessionStorage.setItem(ESCOLA_CONTEXT_KEY, escolaId); } catch (_) {}
  ESCOLA_ATUAL_ID = escolaId;
  ESCOLA_ATUAL = ESCOLAS_DATA.find((escola) => escola.id === escolaId) || null;
  location.reload();
}

const TIPO_LETIVO_FLAG = {letivo:true, prova:true, evento:true, bimestre:true, fim_bimestre:true, feriado:false, ferias:false};
const TIPO_LABEL = {letivo:'Dia Letivo', feriado:'Feriado', prova:'Prova', evento:'Evento', bimestre:'Início de Bimestre', fim_bimestre:'Fim de Bimestre', ferias:'Férias Escolares'};
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ─── PERSISTÊNCIA ─────────────────────────────────────────────────────────────
const DB_KEY = 'rvs_escolar_db';
const DRAFTS_KEY = 'rvs_form_drafts';

function toggleAutoSave() {
  const isEnabled = document.getElementById('toggle-autosave').checked;
  localStorage.setItem('rvs_autosave_enabled', isEnabled);
  if (isEnabled) showToast('Auto-Salvar ativado!', 'sucesso');
  else showToast('Auto-Salvar desativado', 'alerta');
}

function initAutoSave() {
  if (AUTO_SAVE_READY) return;
  AUTO_SAVE_READY = true;
  const isEnabled = localStorage.getItem('rvs_autosave_enabled') !== 'false';
  const toggle = document.getElementById('toggle-autosave');
  if(toggle) toggle.checked = isEnabled;
  
  // Restore drafts
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
    Object.keys(drafts).forEach(id => {
      const el = document.getElementById(id);
      if(el && el.type !== 'file' && el.type !== 'checkbox') {
        el.value = drafts[id];
      }
    });
  } catch(e){}

  // Save drafts on input
  document.addEventListener('input', e => {
    const el = e.target;
    if(['INPUT','SELECT','TEXTAREA'].includes(el.tagName) && el.id && !el.id.includes('senha') && !el.id.includes('importar') && el.type !== 'file' && el.type !== 'checkbox') {
      if(document.getElementById('toggle-autosave')?.checked) {
        try {
          const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
          drafts[el.id] = el.value;
          localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
        } catch(e){}
      }
    }
  });

  // Auto-save DB loop
  setInterval(() => {
    if(document.getElementById('toggle-autosave')?.checked) {
      salvarDados();
      // Salvar frequencia atual se houver
      try {
        const hist = localStorage.getItem('rvs_freq_hist');
        if(hist) {
          // just touching to make sure it's valid, the main saving logic for Freq happens elsewhere, 
          // but we can ensure memory is safe
        }
      } catch(e){}
    }
  }, 3000);
}

function salvarDados(){
  try{
    // Removing TURMAS_DATA and ALUNOS_DATA because they are synced via Supabase now.
    // Keeping other data locally until next phases.
    localStorage.setItem(DB_KEY, JSON.stringify({
      OCORR_DATA, ROTAS_DATA, SOLICIT_DATA,
      CALENDARIO, LIVROS_DATA:LIVROS, CHAT_DATA, freq,
      savedAt: new Date().toISOString()
    }));
  }catch(e){ console.warn('Erro ao salvar:',e); }
}

async function fetchAllRows(tableName, select = '*', builderFn = (q)=>q) {
  let allData = [];
  let from = 0;
  const step = 1000;
  while(true) {
    let query = supabaseClient.from(tableName).select(select).range(from, from + step - 1);
    query = builderFn(query);
    query = applySchoolScope(query, tableName);
    const { data, error } = await query;
    if(error) { console.error(`Erro ao buscar ${tableName}:`, error); break; }
    if(data) allData = allData.concat(data);
    if(!data || data.length < step) break;
    from += step;
  }
  return { data: allData };
}

async function fetchOptionalRows(tableName, select = '*', builderFn = (q)=>q) {
  let allData = [];
  let from = 0;
  const step = 1000;

  while (true) {
    let query = supabaseClient.from(tableName).select(select).range(from, from + step - 1);
    query = builderFn(query);
    query = applySchoolScope(query, tableName);
    const { data, error } = await query;

    if (error) {
      const missing = error.code === '42P01' || /does not exist/i.test(error.message || '');
      if (missing) {
        return { data: [], missing: true };
      }

      console.error(`Erro ao buscar ${tableName}:`, error);
      return { data: [], error, missing: false };
    }

    if (data) allData = allData.concat(data);
    if (!data || data.length < step) break;
    from += step;
  }

  return { data: allData, missing: false };
}

async function carregarDados(){
  try {
    const [
      {data: turmas}, 
      {data: alunos}, 
      {data: ocorrencias}, 
      {data: eventos}, 
      {data: rotas}, 
      configResult, // Capture full result instead of destructuring data
      {data: obafogEq},
      notasResult,
      conselhosResult,
      conselhoAlunosResult
    ] = await Promise.all([
      fetchAllRows('turmas'),
      fetchAllRows('alunos'),
      fetchAllRows('ocorrencias'),
      fetchAllRows('eventos'),
      fetchAllRows('rotas'),
      applySchoolScope(
        supabaseClient.from('configuracoes').select('*').in('chave', ['permissoes', 'links_horarios', 'turmas_localidades']),
        'configuracoes'
      ),
      fetchAllRows('obafog_equipes', '*', q => q.order('created_at', {ascending:false})),
      fetchOptionalRows('notas_bimestrais', '*', q => q.order('ano', { ascending: false }).order('periodo', { ascending: true })),
      fetchOptionalRows('conselhos_classe', '*', q => q.order('ano', { ascending: false }).order('periodo', { ascending: true })),
      fetchOptionalRows('conselho_classe_alunos', '*')
    ]);

    if (configResult.error) {
      console.error('[carregarDados] ERRO ao buscar configuracoes:', configResult.error);
    }
    
    const configData = configResult.data;

    if (configData && Array.isArray(configData)) {
      console.log('[carregarDados] configData raw:', configData);
      const permsObj = configData.find(c => c.chave === 'permissoes');
      if (permsObj && permsObj.valor) {
        console.log('[carregarDados] Permissões carregadas do banco:', permsObj.valor.length, 'itens');
        const loaded = permsObj.valor;
        // Fusão robusta de permissões para garantir que novos módulos no código (como page-boletins) não sumam
        const defaultPerms = [
          {func:'Dashboard',                id:'page-dashboard',    coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
          {func:'Agenda Pedagógica',         id:'page-agenda',       coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:false, editar_prof:false},
          {func:'Turmas',                   id:'page-turmas',       coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:false, editar_prof:false},
          {func:'Alunos',                   id:'page-alunos',       coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:false, editar_prof:false},
          {func:'Ficha do Aluno',           id:'page-ficha-aluno',  coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:false, editar_prof:false},
          {func:'Boletins',                 id:'page-boletins',     coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
          {func:'Conselho de Classe',       id:'page-conselho-classe', coord:true, sec:true, prof:false, editar_coord:true, editar_sec:true, editar_prof:false},
          {func:'Frequência',               id:'page-frequencia',   coord:true, sec:false, prof:true,  editar_coord:true,  editar_sec:false, editar_prof:true},
          {func:'Solicitações Pedagógicas', id:'page-solicitacoes', coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
          {func:'RVS Agenda',               id:'page-rvs-agenda',   coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
          {func:'Horário de Aula',           id:'page-horarios',     coord:true, sec:true,  prof:true,  editar_coord:false, editar_sec:false, editar_prof:false},
          {func:'Topo do Saber',            id:'page-topo-saber',   coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
          {func:'Transporte',               id:'page-transporte',   coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
          {func:'Ocorrências',              id:'page-ocorrencias',  coord:true, sec:false, prof:true,  editar_coord:true,  editar_sec:false, editar_prof:true},
          {func:'Livros Didáticos',          id:'page-livros',       coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
          {func:'Relatórios',               id:'page-relatorios',   coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
          {func:'Tratamento Ocorr.',        id:'page-tratamento-ocorrencias', coord:true, sec:false, prof:false, editar_coord:true,  editar_sec:false, editar_prof:false},
          {func:'Permissões',               id:'page-permissoes',   coord:false,sec:false, prof:false, editar_coord:false, editar_sec:false, editar_prof:false},
          {func:'Usuários',                 id:'page-usuarios',     coord:false,sec:false, prof:false, editar_coord:false, editar_sec:false, editar_prof:false},
          {func:'Documentos Secretaria',    id:'page-documentos-secretaria', coord:true, sec:true, prof:false, editar_coord:true, editar_sec:true, editar_prof:false},
          {func:'Reconhecimento Facial',    id:'page-reconhecimento-facial', coord:true, sec:true, prof:false, editar_coord:true, editar_sec:true, editar_prof:false}
        ];
        PERMS = defaultPerms.map(def => {
          const found = loaded.find(l => l.id === def.id);
          return found ? { ...def, ...found } : def;
        });

        // Auto-correção/Self-healing para garantir que o módulo page-boletins esteja ativo para professores, coordenadores e secretaria no banco
        const bPerm = PERMS.find(p => p.id === 'page-boletins');
        if (bPerm && (!bPerm.prof || !bPerm.editar_prof || !bPerm.coord || !bPerm.sec)) {
          bPerm.coord = true;
          bPerm.sec = true;
          bPerm.prof = true;
          bPerm.editar_coord = true;
          bPerm.editar_sec = true;
          bPerm.editar_prof = true;
        }

        // Auto-correção/Self-healing para garantir que o módulo page-documentos-secretaria esteja no banco
        const dPerm = PERMS.find(p => p.id === 'page-documentos-secretaria');
        if (dPerm && (!dPerm.coord || !dPerm.sec)) {
          dPerm.coord = true;
          dPerm.sec = true;
          dPerm.editar_coord = true;
          dPerm.editar_sec = true;
        }

        const fPerm = PERMS.find(p => p.id === 'page-ficha-aluno');
        if (fPerm && (!fPerm.coord || !fPerm.sec)) {
          fPerm.coord = true;
          fPerm.sec = true;
          fPerm.editar_coord = true;
          fPerm.editar_sec = false;
        }

        const hasMissing = defaultPerms.some(def => !loaded.some(l => l.id === def.id));
        const needsSync = hasMissing || (bPerm && (!bPerm.prof || !bPerm.editar_prof)) || (dPerm && (!dPerm.coord || !dPerm.sec)) || (fPerm && (!fPerm.coord || !fPerm.sec));
        if (needsSync) {
          supabaseClient
            .from('configuracoes')
            .upsert(buildConfigPayload('permissoes', PERMS), getConfigUpsertOptions())
            .then(({ error }) => {
              if (!error) console.log('[Permissões] Banco de dados sincronizado com novas permissões');
            });
        }
      } else {
        console.warn('[carregarDados] Permissões não encontradas no banco, usando padrão.');
      }
      
      const linksObj = configData.find(c => c.chave === 'links_horarios');
      if (linksObj && linksObj.valor) HORARIOS_LINKS = linksObj.valor;
      const localObj = configData.find(c => c.chave === 'turmas_localidades');
      TURMAS_LOCALIDADES = localObj && localObj.valor && typeof localObj.valor === 'object'
        ? localObj.valor
        : {};
    } else {
      console.warn('[carregarDados] configData é nulo ou inválido:', configData);
      TURMAS_LOCALIDADES = {};
    }

    if (turmas) {
      TURMAS_DATA = turmas.map(t => ({
        id: t.id,
        code: t.code,
        serie: t.serie,
        turno: t.turno,
        professor: t.professor,
        localidade: TURMAS_LOCALIDADES[t.id] || TURMAS_LOCALIDADES[t.code] || '',
        presentes: 0
      }));
    }
    
    if (alunos) {
      const turmaMap = {};
      const turnoMap = {};
      const serieMap = {};
      if (turmas) {
        turmas.forEach(t => {
          turmaMap[t.id] = t.code;
          turnoMap[t.id] = t.turno;
          serieMap[t.id] = t.serie;
        });
      }
      
      ALUNOS_DATA = alunos.map(a => ({
        id: a.id, cpf: formatarCPF(a.matricula), nome: a.nome, turma: turmaMap[a.turma_id] || '', turma_id: a.turma_id,
        turno: turnoMap[a.turma_id] || '', serie: serieMap[a.turma_id] || '',
        rota: a.rota || 'Sem transporte', resp: a.responsavel || '',
        contato: a.contato || '', email: a.instagram || '', nasc: a.data_nascimento || '',
        idade: a.data_nascimento ? Math.floor((new Date() - new Date(a.data_nascimento))/(1000*60*60*24*365.25)) : 0,
        status: a.status || 'ativo', historico: [], foto_url: a.foto_url || ''
      }));
    }
    
    if (rotas) {
      ROTAS_DATA = rotas.map(r => ({ id: r.id, nome: r.nome, motorista: r.motorista, veiculo: r.veiculo, cap: r.capacidade }));
    }

    CONSELHO_SCHEMA_STATUS = {
      ready: !notasResult?.missing && !conselhosResult?.missing && !conselhoAlunosResult?.missing,
      missingTables: [
        notasResult?.missing ? 'notas_bimestrais' : null,
        conselhosResult?.missing ? 'conselhos_classe' : null,
        conselhoAlunosResult?.missing ? 'conselho_classe_alunos' : null
      ].filter(Boolean)
    };

    NOTAS_BIMESTRAIS_DATA = (notasResult?.data || []).map(n => ({
      id: n.id,
      aluno_id: n.aluno_id,
      turma_id: n.turma_id,
      ano: n.ano,
      periodo: n.periodo,
      componente: canonicalizarComponenteCurricular(n.componente),
      nota: n.nota == null ? null : Number(n.nota),
      faltas_componente: Number(n.faltas_componente || 0),
      origem: n.origem || 'manual',
      created_at: n.created_at
    }));

    CONSELHOS_CLASSE_DATA = (conselhosResult?.data || []).map(c => ({
      id: c.id,
      turma_id: c.turma_id,
      ano: c.ano,
      periodo: c.periodo,
      data_reuniao: c.data_reuniao || '',
      status: c.status || 'Em preparação',
      componentes: Array.isArray(c.componentes) ? c.componentes : [],
      ata_texto: c.ata_texto || '',
      criado_por: c.criado_por || '',
      created_at: c.created_at
    }));

    CONSELHO_CLASSE_ALUNOS_DATA = (conselhoAlunosResult?.data || []).map(item => ({
      id: item.id,
      conselho_id: item.conselho_id,
      aluno_id: item.aluno_id,
      media_geral: item.media_geral == null ? null : Number(item.media_geral),
      frequencia_percentual: item.frequencia_percentual == null ? null : Number(item.frequencia_percentual),
      qtd_componentes_abaixo_media: Number(item.qtd_componentes_abaixo_media || 0),
      qtd_ocorrencias: Number(item.qtd_ocorrencias || 0),
      situacao: item.situacao || '',
      observacao_automatica: item.observacao_automatica || '',
      observacao_pedagogica: item.observacao_pedagogica || '',
      parecer_final: item.parecer_final || '',
      encaminhamento: item.encaminhamento || ''
    }));

    // ── OBAFOG: atribuir dados carregados do banco ──
    if (obafogEq) {
      OBAFOG_DATA = obafogEq;
    }

    if (ocorrencias) {
      OCORR_DATA = ocorrencias.map(o => {
         let tipoView = o.tipo;
         let descView = o.descricao || '';
         if (descView.startsWith('[ATRASO]')) {
             tipoView = 'atraso';
             descView = descView.replace('[ATRASO] ', '').replace('[ATRASO]\n', '').trim();
         } else if (descView.startsWith('[LIBERADO]')) {
             tipoView = 'liberado_coord';
             descView = descView.replace('[LIBERADO] ', '').replace('[LIBERADO]\n', '').trim();
         } else if (descView.startsWith('[SUSP_CELULAR]')) {
             tipoView = 'suspensao_celular';
             descView = descView.replace('[SUSP_CELULAR] ', '').replace('[SUSP_CELULAR]\n', '').trim();
         }

         const al = ALUNOS_DATA.find(a => a.id === o.aluno_id);
         const tu = TURMAS_DATA.find(t => t.id === o.turma_id);
         return {
            id: o.id,
            aluno_id: o.aluno_id,
            tipo: tipoView,
            icon: tipoView === 'evasao' ? '🚨' : tipoView === 'indisciplina' ? '⚠️' : tipoView === 'atraso' ? '⏰' : tipoView === 'liberado_coord' ? '🟢' : tipoView === 'suspensao_celular' ? '📵' : '❌',
            aluno: o.participante || (al ? al.nome : '—'),
            cpf: al ? al.cpf : '',
            turma: tu ? tu.code : '',
            desc: descView,
            hora: new Date(o.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
            data: new Date(o.created_at).toLocaleDateString('pt-BR'),
            tratada: o.descricao && o.descricao.includes('[TRATADA]'),
            aguardandoPais: false,
            origem: o.auto_gerada ? 'frequencia' : 'manual'
         };
      });
    }

    if (eventos) {
      CALENDARIO = {};
      eventos.forEach(ev => {
         let dKey = '';
         if (ev.data) {
             const [y, m, d] = ev.data.split('-');
             if (y && m && d) dKey = `${y}-${parseInt(m)}-${parseInt(d)}`;
         }
         if (dKey) {
             // Restaurar subtipo real a partir de observacoes (ex: 'subtipo:fim_bimestre')
             let tipoReal = ev.tipo;
             if (ev.observacoes && ev.observacoes.startsWith('subtipo:')) {
                 tipoReal = ev.observacoes.replace('subtipo:', '').split('|')[0];
             }
             let parsedObs = ev.observacoes || '';
             let extra = {};
             let isRVS = false;
             if (parsedObs.startsWith('{')) {
               try {
                 const obj = JSON.parse(parsedObs);
                 parsedObs = obj.desc || '';
                 extra = obj;
                 isRVS = true; // Identifica que foi criado via RVS Agenda
               } catch(e){}
             }
             CALENDARIO[dKey] = {
                 id: ev.id,
                 tipo: tipoReal,
                 label: ev.titulo,
                 responsavel: ev.responsavel,
                 desc: parsedObs,
                 isRVS: isRVS,
                 ...extra
             };
         }
      });
    }

    // ── Carregar Solicitações do Supabase ──
    const {data: solicits} = await applySchoolScope(
      supabaseClient.from('solicitacoes').select('*').order('created_at', {ascending: false}),
      'solicitacoes'
    );
    if (solicits) {
      SOLICIT_DATA = solicits.map(s => ({
        id: s.id,
        tipo: s.tipo,
        turno: s.turno,
        turmas: s.turmas,
        data: s.data,
        hIni: s.hora_ini,
        hFim: s.hora_fim,
        obs: s.obs,
        linkDrive: s.link_drive,
        status: s.status,
        responsavel: s.responsavel,
        criadoEm: s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR') : '—'
      }));
    }

    // ── Carregar Livros Didáticos do Supabase ──
    const {data: livrosDB} = await applySchoolScope(
      supabaseClient.from('livros_alunos').select('*'),
      'livros_alunos'
    );
    if (livrosDB) {
      livrosDB.forEach(l => {
        const al = ALUNOS_DATA.find(a => a.id === l.aluno_id);
        if (al) {
          if (!al.livros) al.livros = {};
          al.livros[l.livro_idx] = l.recebeu ? 'sim' : 'nao';
          if (l.data_entrega) al.livros[l.livro_idx + '_data'] = new Date(l.data_entrega).toLocaleDateString('pt-BR');
        }
      });
    }

    // ── Manter apenas freq temporária do localStorage (não migrada) ──
    const raw = localStorage.getItem(DB_KEY);
    if(raw) {
      try {
        const d = JSON.parse(raw);
        if(d.freq) {
           if(d.freq.entrada) Object.assign(freq.entrada, d.freq.entrada);
           if(d.freq.saida) Object.assign(freq.saida, d.freq.saida);
        }
      } catch(e) {}
    }
  } catch(e) {
    console.warn('Erro ao carregar do Supabase:', e);
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
async function doLogin(){
  let email = (document.getElementById('email-input').value||'').trim();
  const pass  = (document.getElementById('pass-input').value||'');
  const errEl = document.getElementById('login-error');
  const btn   = document.querySelector('#login-screen button');

  if(!email || !pass){ errEl.style.display='block'; return; }
  errEl.style.display='none';

  if(!email.includes('@')) {
    email += '@escola.seduc.pa.gov.br';
  }

  if(btn){ btn.disabled=true; btn.textContent='Verificando...'; }

  try {
    // Autenticação oficial via Supabase Auth
    const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: pass,
    });

    if(authErr) {
      console.error('[login] authErr:', authErr.message, authErr.status, authErr);
      errEl.style.display='block';
      // Diferencia os tipos de erro para facilitar diagnóstico
      if (authErr.message && authErr.message.toLowerCase().includes('invalid login')) {
        errEl.textContent = 'E-mail ou senha incorretos. Verifique e tente novamente.';
      } else if (authErr.message && authErr.message.toLowerCase().includes('email not confirmed')) {
        errEl.textContent = 'E-mail não confirmado. Contate o administrador do sistema.';
      } else if (authErr.status === 500 || (authErr.message && authErr.message.toLowerCase().includes('database'))) {
        errEl.textContent = 'Erro interno no servidor. Contate o administrador (código 500).';
      } else {
        errEl.textContent = 'Erro ao autenticar: ' + (authErr.message || 'Verifique suas credenciais.');
      }
      if(btn){ btn.disabled=false; btn.textContent='Entrar no Sistema'; }
      return;
    }

    // Busca os dados adicionais do usuário na tabela pública
    const { data: userData, error: userErr } = await supabaseClient
      .from('usuarios')
      .select('id, nome, perfil, email, turno, cargo, foto_url, formacao, bio, whatsapp, ativo, escola_id, escola_id_ativa, admin_global')
      .eq('id', authData.user.id)
      .maybeSingle();

    if(userErr) throw userErr;

    // Verifica se está ativo
    if(userData && userData.ativo === false) {
      errEl.style.display='block';
      errEl.textContent = 'Acesso negado: Usuário inativo.';
      if(btn){ btn.disabled=false; btn.textContent='Entrar no Sistema'; }
      await supabaseClient.auth.signOut();
      return;
    }

    // Se userData for nulo, cria um fallback com os dados do Auth
    const user = userData || {
      id: authData.user.id,
      nome: authData.user.user_metadata?.nome || 'Usuário',
      perfil: authData.user.user_metadata?.perfil || 'professor',
      email: authData.user.email
    };

    _entrarNoSistema(user);
  } catch(err){
    console.error('[login exception]', err);
    errEl.style.display='block';
    errEl.textContent = 'Erro de conexão. Tente novamente.';
  }

  if(btn){ btn.disabled=false; btn.textContent='Entrar'; }
}

async function _entrarNoSistema(usuario){
  // Atualiza variável global de perfil
  PERFIL_ATUAL = usuario.perfil || 'professor';
  
  // Guarda usuário logado na sessão
  try { sessionStorage.setItem('rvs_user', JSON.stringify(usuario)); } catch(_){}
  
  const ls = document.getElementById('login-screen');
  ls.classList.add('hidden');
  setTimeout(()=>ls.style.display='none', 500);
  document.getElementById('app').classList.add('visible');
  
  await carregarContextoEscolas(usuario);
  updateSidebarProfile();
  await initApp(); // Agora espera carregar permissões do banco
  restaurarPaginaAtiva();
  initPresenceRealtime();
  initOcorrenciaRealtime(); // Notificações em tempo real de ocorrências
}

function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem('rvs_user');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function updateSidebarProfile() {
  const user = getCurrentUser();
  if(!user) return;
  const nameEl  = document.getElementById('sidebar-user-name');
  const roleEl  = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');

  if(nameEl) nameEl.textContent = user.nome || 'Usuário';
  if(roleEl) {
    const pLabel = {admin:'Administrador',coordenador:'Coordenador',secretaria:'Secretaria',professor:'Professor'};
    const roleText = pLabel[user.perfil] || 'Membro';
    roleEl.textContent = getCurrentSchoolName() ? `${roleText} • ${getCurrentSchoolName()}` : roleText;
  }
  if(avatarEl) {
    if (user.foto_url) {
      avatarEl.innerHTML = `<img src="${user.foto_url}" alt="${user.nome || ''}" 
        style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`;
    } else {
      const parts = (user.nome || 'U').split(' ');
      let init = parts[0].charAt(0);
      if(parts.length > 1) init += parts[parts.length-1].charAt(0);
      avatarEl.textContent = init.toUpperCase();
    }
  }
}

async function doLogout(){
  try { sessionStorage.removeItem('rvs_user'); } catch(_){}
  try { sessionStorage.removeItem(ESCOLA_CONTEXT_KEY); } catch(_){}
  try { sessionStorage.removeItem(ACTIVE_PAGE_CONTEXT_KEY); } catch(_){}
  await supabaseClient.auth.signOut();
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  // Ao recarregar a página, verifica a sessão ativa do Supabase
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session && session.user) {
      // Rebusca dados adicionais na tabela pública
      supabaseClient
        .from('usuarios')
        .select('id, nome, perfil, email, foto_url, formacao, bio, whatsapp, cargo, turno, escola_id, escola_id_ativa, admin_global, ativo')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            _entrarNoSistema(data);
          } else {
            // Se falhar na pública, usa metadados
            _entrarNoSistema({
              id: session.user.id,
              nome: session.user.user_metadata?.nome || 'Usuário',
              perfil: session.user.user_metadata?.perfil || 'professor',
              email: session.user.email
            });
          }
        })
        .catch(() => doLogout());
    }
  });

  ['pass-input','email-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
  });
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function initApp(){
  await carregarContextoEscolas();
  await carregarDados();
  sincronizarSelectsSerieTurma();
  sincronizarSelectsLocalidadeTurma();
  renderSchoolSwitcher();
  initAutoSave();
  updateSidebarProfile();
  atualizarSelectTurmas();
  renderMetricasDash();
  renderTurmasTable();
  renderDashOcorr();
  renderTurmaGrid();
  renderAlunos();
  updateConsolidado();
  renderTransporte();
  renderOcorrencias();
  renderLivros();
  renderPermissoes();
  renderEscolasPage();
  renderCalendar();
  setupSidebarDropdowns();
  
  aplicarPermissoesUI(); 
  console.log('[initApp] UI de permissões aplicada.');
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────
function setNavDropdownState(group, shouldOpen) {
  if (!group) return;
  group.classList.toggle('open', shouldOpen);
  const toggle = group.querySelector('.nav-dropdown-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
}

function setLegacyNavSectionState(title, shouldOpen) {
  if (!title) return;
  title.classList.toggle('open', shouldOpen);
  title.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
}

function collapseOtherNavGroups(except = null) {
  document.querySelectorAll('.nav-dropdown').forEach(group => {
    if (group !== except) setNavDropdownState(group, false);
  });

  document.querySelectorAll('.nav-section-title').forEach(title => {
    if (title !== except) setLegacyNavSectionState(title, false);
  });
}

function toggleNavGroup(button) {
  const group = button?.closest('.nav-dropdown');
  if (!group) return;

  const shouldOpen = !group.classList.contains('open');
  if (shouldOpen) collapseOtherNavGroups(group);
  setNavDropdownState(group, shouldOpen);
}

function toggleLegacyNavGroup(title) {
  const menu = title?.nextElementSibling;
  if (!title || !menu || !menu.classList.contains('nav-dropdown-menu')) return;

  const shouldOpen = !title.classList.contains('open');
  if (shouldOpen) collapseOtherNavGroups(title);
  setLegacyNavSectionState(title, shouldOpen);
}

function setupSidebarDropdowns() {
  document.querySelectorAll('.nav-section-title').forEach(title => {
    title.classList.add('nav-section-toggle');

    let menu = title.nextElementSibling;
    if (!menu || !menu.classList.contains('nav-dropdown-menu')) {
      menu = document.createElement('div');
      menu.className = 'nav-dropdown-menu';

      while (title.nextElementSibling) {
        const next = title.nextElementSibling;
        const isNextSection = next.classList?.contains('nav-section-title');
        const isStandaloneProfile = next.classList?.contains('nav-item') && next.getAttribute('onclick')?.includes('perfil');
        if (isNextSection || isStandaloneProfile) break;
        menu.appendChild(next);
      }

      title.insertAdjacentElement('afterend', menu);
    }

    if (title.dataset.dropdownReady === 'true') return;

    title.dataset.dropdownReady = 'true';
    title.tabIndex = 0;
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', 'false');
    title.addEventListener('click', () => toggleLegacyNavGroup(title));
    title.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLegacyNavGroup(title);
      }
    });
  });

  syncNavGroupVisibility();
  syncOpenNavGroupsFromActive();
}

function syncNavGroupVisibility() {
  document.querySelectorAll('.nav-dropdown').forEach(group => {
    const hasVisibleItems = [...group.querySelectorAll('.nav-item[onclick]')].some(item => item.style.display !== 'none');
    group.style.display = hasVisibleItems ? '' : 'none';
    if (!hasVisibleItems) setNavDropdownState(group, false);
  });

  document.querySelectorAll('.nav-section-title').forEach(title => {
    const menu = title.nextElementSibling;
    const hasVisibleItems = menu?.classList.contains('nav-dropdown-menu')
      ? [...menu.querySelectorAll('.nav-item[onclick]')].some(item => item.style.display !== 'none')
      : false;

    title.style.display = hasVisibleItems ? '' : 'none';
    if (menu) menu.style.display = hasVisibleItems ? '' : 'none';
    if (!hasVisibleItems) setLegacyNavSectionState(title, false);
  });
}

function syncOpenNavGroupsFromActive() {
  const activeNav = document.querySelector('.sidebar-nav .nav-item.active');
  if (!activeNav) return;

  const modernGroup = activeNav.closest('.nav-dropdown');
  const legacyMenu = activeNav.closest('.nav-dropdown-menu');
  if (!modernGroup && !legacyMenu) return;

  collapseOtherNavGroups(modernGroup || legacyMenu.previousElementSibling || null);

  if (modernGroup) {
    setNavDropdownState(modernGroup, true);
    return;
  }

  const title = legacyMenu.previousElementSibling;
  if (title?.classList.contains('nav-section-title')) {
    setLegacyNavSectionState(title, true);
  }
}

function showPage(p, el) {
  if (p === 'obafog') {
    showPage('dashboard');
    return;
  }
  if (p !== 'perfil' && !podeVer(p)) {
    console.warn(`[showPage] Acesso NEGADO: página="${p}"`);
    showToast('Você não tem permissão para acessar esta página.', 'alerta');
    return;
  }

  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p)?.classList.add('active');
  persistActivePage(p);

  const titles = {
    dashboard: 'Dashboard', agenda: 'Agenda Pedagógica', turmas: 'Turmas', alunos: 'Alunos', 'ficha-aluno': 'Ficha do Aluno', boletins: 'Boletins Escolares',
    'conselho-classe': 'Conselho de Classe', frequencia: 'Frequência Escolar', solicitacoes: 'Solicitações Pedagógicas', transporte: 'Transporte Escolar', ocorrencias: 'Ocorrências',
    livros: 'Livros Didáticos', chat: 'Chat RVS', permissoes: 'Permissões', usuarios: 'Usuários do Sistema', perfil: 'Meu Perfil',
    horarios: 'HorÃ¡rio de Aula', obafog: 'OBAFOG RVS', escolas: 'GestÃ£o de Escolas', 'tratamento-ocorrencias': 'Tratamento de OcorrÃªncias', 'reconhecimento-facial': 'Reconhecimento Facial'
  };
  document.getElementById('page-title').textContent = titles[p] || p;
  
  // Se não passou o elemento, tenta achar o item no menu lateral para ativar
  if (!el) {
    const selector = `.nav-item[onclick*="showPage('${p}'"]`;
    el = document.querySelector(selector);
  }
  if (el) el.classList.add('active');
  syncOpenNavGroupsFromActive();
  
  // Close mobile menu if open
  document.querySelector('.sidebar').classList.remove('sidebar-open');
  const overlay = document.getElementById('sidebar-overlay');
  if(overlay) overlay.classList.remove('show');
  if(p==='solicitacoes') renderSolicitacoes();
  if(p==='boletins') { switchBoletinsSubTab('listagem'); renderStatusBoletinsTurmas(); }
  if(p==='topo-saber'){ carregarOlimpiadas().then(()=>renderTopoSaber()); }
  if(p==='usuarios'){ carregarUsuarios(); }
  if(p==='rvs-agenda'){ popularDatasAtividade(); popularTurmasAtividade(); renderAgendaMural(); }
  if(p==='conselho-classe') renderConselhoClassePage();
  if(p==='horarios') carregarLinksHorario();
  if(p==='permissoes') renderPermissoes();
  if(p==='escolas') renderEscolasPage();
  if(p==='perfil') renderPerfil();
  if(p==='tratamento-ocorrencias') initTratamentoOcorrenciasPage();
  if(p==='documentos-secretaria') carregarDocumentosSecretaria();
  if(p==='reconhecimento-facial') carregarReconhecimentoFacial();
  if(p==='frequencia'){
    // Sempre mostra etapa1 se não houver chamada em andamento
    if(!turmaChamadaAtual){
      document.getElementById('freq-etapa1')?.classList.remove('hidden');
      document.getElementById('freq-etapa2')?.classList.add('hidden');
    }
    // Popula select de turma com dados já carregados
    popularSelectTurmaFreq();
  }
}

let dashTurnoAtual = '';
let dashDiaAtual = '';

function setTurno(btn, turno){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  dashTurnoAtual = turno;
  renderDashCompleto();
}

function renderDashCompleto(){
  renderMetricasDash();
  renderTurmasTable();
  renderDashOcorr();
}

// ─── SISTEMA DE NOTIFICAÇÕES ─────────────────────────────────────────────────
const NOTIFICATIONS = []; // store em memória
let notifPanelOpen = false;
let ocorrenciaRealtimeSubscription = null;

function addNotification({ type, title, body, action }) {
  const notif = {
    id: Date.now() + Math.random(),
    type,       // 'chat' | 'ocorrencia' | 'alerta'
    title,
    body,
    action,     // função chamada ao clicar
    time: new Date(),
    read: false
  };
  NOTIFICATIONS.unshift(notif); // mais recente primeiro
  updateNotifBadge();
  renderNotifPanel(); // re-render se painel aberto
  return notif;
}

function updateNotifBadge() {
  const badge = document.getElementById('notif-badge');
  const btn   = document.getElementById('notif-bell-btn');
  const unread = NOTIFICATIONS.filter(n => !n.read).length;
  if (!badge) return;
  if (unread > 0) {
    badge.textContent = unread > 99 ? '99+' : unread;
    badge.style.display = 'flex';
    btn?.classList.add('has-notif');
  } else {
    badge.style.display = 'none';
    btn?.classList.remove('has-notif');
  }
}

function toggleNotifPanel() {
  const wrapper = document.getElementById('notif-bell-wrapper');
  const existing = document.getElementById('notif-panel');
  if (existing) {
    existing.remove();
    notifPanelOpen = false;
    return;
  }
  notifPanelOpen = true;
  // Marcar todas como lidas ao abrir
  NOTIFICATIONS.forEach(n => n.read = true);
  updateNotifBadge();
  renderNotifPanel();
  // Fechar ao clicar fora
  setTimeout(() => {
    document.addEventListener('click', closeNotifPanelOutside, { once: true });
  }, 100);
}

function closeNotifPanelOutside(e) {
  const panel = document.getElementById('notif-panel');
  const wrapper = document.getElementById('notif-bell-wrapper');
  if (panel && !wrapper?.contains(e.target)) {
    panel.remove();
    notifPanelOpen = false;
  }
}

function renderNotifPanel() {
  const wrapper = document.getElementById('notif-bell-wrapper');
  if (!wrapper) return;
  let panel = document.getElementById('notif-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.className = 'notif-panel';
    wrapper.appendChild(panel);
  }

  const typeIcons = { chat: '💬', ocorrencia: '📋', alerta: '🚨' };
  const typeLabels = { chat: 'Chat RVS', ocorrencia: 'Ocorrência', alerta: 'Alerta Crítico' };
  const typeIconClass = { chat: 'notif-icon-chat', ocorrencia: 'notif-icon-ocorrencia', alerta: 'notif-icon-alerta' };

  const formatTime = (date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const items = NOTIFICATIONS.slice(0, 30);
  panel.innerHTML = `
    <div class="notif-panel-header">
      <h4>🔔 Notificações <span style="font-weight:400;color:var(--gray4);font-size:12px">(${items.length})</span></h4>
      <button class="notif-clear-btn" onclick="clearAllNotifs()">Limpar tudo</button>
    </div>
    <div class="notif-list" id="notif-list">
      ${items.length === 0 ? `
        <div class="notif-empty">
          <span>🔕</span>
          Nenhuma notificação ainda
        </div>
      ` : items.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}')">
          <div class="notif-item-icon ${typeIconClass[n.type] || 'notif-icon-alerta'}">
            ${typeIcons[n.type] || '📌'}
          </div>
          <div class="notif-item-body">
            <h5>${n.title}</h5>
            <p>${n.body}</p>
            <div class="notif-item-time">${formatTime(n.time)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function handleNotifClick(id) {
  const notif = NOTIFICATIONS.find(n => String(n.id) === String(id));
  if (!notif) return;
  notif.read = true;
  document.getElementById('notif-panel')?.remove();
  notifPanelOpen = false;
  if (notif.action) notif.action();
}

function clearAllNotifs() {
  NOTIFICATIONS.length = 0;
  updateNotifBadge();
  renderNotifPanel();
}

// ── Realtime: escuta novas ocorrências inseridas por qualquer usuário ──
function initOcorrenciaRealtime() {
  if (ocorrenciaRealtimeSubscription) return;
  ocorrenciaRealtimeSubscription = supabaseClient
    .channel('public:ocorrencias:insert')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ocorrencias' }, payload => {
      const o = payload.new;
      const aluno = ALUNOS_DATA.find(a => a.id === o.aluno_id);
      const nomeAluno = aluno ? aluno.nome : 'Aluno';
      const titulo = `Nova Ocorrência: ${nomeAluno}`;
      const corpo = o.descricao ? o.descricao.substring(0, 60) + (o.descricao.length > 60 ? '...' : '') : 'Sem descrição';

      addNotification({
        type: 'ocorrencia',
        title: titulo,
        body: corpo,
        action: () => showPage('ocorrencias', document.querySelector(".nav-item[onclick*=\"'ocorrencias'\"]"))
      });

      showToast(`📋 ${titulo}`, 'ocorrencia', () => {
        showPage('ocorrencias', document.querySelector(".nav-item[onclick*=\"'ocorrencias'\"]"));
      });
    })
    .subscribe();
}

// ─── TOASTS / ALERTAS ────────────────────────────────────────────────────────
function showToast(msg, type='alerta', onClickAction=null) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;

  if (onClickAction) {
    t.style.cursor = 'pointer';
    t.onclick = function(e) {
      if (!e.target.classList.contains('toast-close')) {
        onClickAction();
        t.remove();
      }
    };
  }

  const icons  = { evasao:'🚨', alerta:'ℹ️', sucesso:'✅', chat:'💬', ocorrencia:'📋' };
  const labels = { evasao:'Alerta de Evasão', alerta:'Notificação', sucesso:'Sucesso', chat:'Chat RVS', ocorrencia:'Ocorrência' };
  t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <div class="toast-body"><h4>${labels[type]||'Aviso'}</h4><p>${msg}</p></div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);

  // auto-dismiss depois de 6s com fade-out
  setTimeout(() => {
    if (t.parentElement) {
      t.style.animation = 'slide-out 0.3s ease-in forwards';
      setTimeout(() => t.remove(), 300);
    }
  }, 6000);
}
function triggerAlert(){ document.getElementById('alert-bar').classList.add('show'); showToast('Aluno fora da sala detectado','evasao'); }
function dismissAlert(){ document.getElementById('alert-bar').classList.remove('show'); }

// ─── MODAIS ───────────────────────────────────────────────────────────────────
function openModal(id){ document.getElementById(id)?.classList.add('open'); }
function closeModal(id){ document.getElementById(id)?.classList.remove('open'); }
function confirmarSenhaAdmin(cb){
  const s=prompt('⚠️ Ação restrita ao Administrador.\nDigite a senha:');
  if(s===ADMIN_SENHA){ cb(); } else { showToast('Senha incorreta. Acesso negado.','evasao'); }
}

function normalizeTurno(t) {
  if(!t) return '';
  const s = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if(s.includes('manha')) return 'Manhã';
  if(s.includes('tarde')) return 'Tarde';
  if(s.includes('noite')) return 'Noite';
  return t.trim();
}

// ─── EMPTY STATES ────────────────────────────────────────────────────────────
function emptyState(icon,titulo,sub){
  return`<div class="empty-state"><div class="empty-icon">${icon}</div><h4>${titulo}</h4><p>${sub}</p></div>`;
}
function emptyTr(icon,titulo,sub,cols=8){
  return`<tr><td colspan="${cols}">${emptyState(icon,titulo,sub)}</td></tr>`;
}

// ─── SELECTS ─────────────────────────────────────────────────────────────────
function abrirExcluirAluno(){
  const s=prompt('🔐 Excluir aluno requer senha do administrador:');
  if(s!==ADMIN_SENHA){ if(s!==null) showToast('Senha incorreta','evasao'); return; }
  const sel=document.getElementById('select-excluir-aluno');
  if(sel){
    sel.innerHTML='<option value="">— Selecione o aluno —</option>'+
      ALUNOS_DATA.map(a=>`<option value="${a.cpf}">${a.nome} — ${a.turma}</option>`).join('');
  }
  openModal('modal-excluir-aluno');
}

async function excluirAluno(){
  const cpf=document.getElementById('select-excluir-aluno')?.value;
  if(!cpf){ showToast('Selecione um aluno','alerta'); return; }
  const al=ALUNOS_DATA.find(a=>a.cpf===cpf || a.matricula===cpf);
  if(!al || !al.id){ showToast('Aluno não encontrado no banco de dados.', 'alerta'); return; }
  
  const { error } = await supabaseClient.from('alunos').delete().eq('id', al.id);
  if (error) {
      console.error("[excluirAluno] Erro Supabase:", error);
      showToast('Erro no banco de dados: ' + error.message, 'evasao');
      return;
  }
  
  closeModal('modal-excluir-aluno');
  showToast(al.nome+' excluído do sistema.','sucesso');
  
  await carregarDados();
  renderAlunos(); renderMetricasDash(); renderTurmasTable(); renderTurmaGrid();
}

function atualizarSelectTurmas(){
  // Popula todos os selects com classe select-turmas
  document.querySelectorAll('.select-turmas').forEach(sel=>{
    const val=sel.value;
    sel.innerHTML=TURMAS_DATA.length===0
      ?'<option value="">— Cadastre turmas primeiro —</option>'
      :['<option value="">Selecione a turma</option>',...TURMAS_DATA.map(t=>`<option value="${t.code}">${t.code} — ${t.turno}</option>`)].join('');
    if(val) sel.value=val;
  });
  // Select excluir turma
  const se=document.getElementById('select-excluir-turma');
  if(se) se.innerHTML=TURMAS_DATA.length===0
    ?'<option value="">— Nenhuma turma —</option>'
    :TURMAS_DATA.map(t=>`<option value="${t.code}">${t.code} — ${t.turno}</option>`).join('');
  // Select frequência etapa1 (pode não ter classe select-turmas)
  popularSelectTurmaFreq();
  // Select filtro alunos
  const fa=document.getElementById('filtro-turma-alunos');
  if(fa){
    const v=fa.value;
    fa.innerHTML='<option value="">Todas as turmas</option>'+TURMAS_DATA.map(t=>`<option value="${t.code}">${t.code} — ${t.turno}</option>`).join('');
    if(v) fa.value=v;
  }
  // Select rota alunos
  const ra=document.getElementById('input-aluno-rota');
  if(ra){
    const v=ra.value;
    const base='<option value="Sem transporte">Sem transporte</option>';
    ra.innerHTML=base+ROTAS_DATA.map(r=>`<option value="${r.nome}">${r.nome}</option>`).join('');
    if(v) ra.value=v;
  }
}

function popularSelectTurmaFreq(){
  const sel=document.getElementById('turma-select-freq');
  if(!sel) return;
  if(!TURMAS_DATA.length){
    sel.innerHTML='<option value="">Nenhuma turma cadastrada</option>';
    return;
  }
  const turno=document.getElementById('sel-turno-freq')?.value||'';
  const turnoNorm=normalizeTurno(turno);
  const turmas=turnoNorm?TURMAS_DATA.filter(t=>normalizeTurno(t.turno)===turnoNorm):TURMAS_DATA;
  const val=sel.value;
  sel.innerHTML='<option value="">Selecione a turma</option>'+
    turmas.map(t=>`<option value="${t.code}">${t.code} - ${t.turno}</option>`).join('');
  if(val && turmas.find(t=>t.code===val)) sel.value=val;
}

function onTurnoFreqChange(){
  popularSelectTurmaFreq();
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function getDashFiltros(){
  const dia = document.getElementById('dash-filtro-dia')?.value || '';
  return { turno: dashTurnoAtual, dia };
}

async function renderMetricasDash(){
  const el = id => document.getElementById(id);
  const {turno, dia} = getDashFiltros();
  const alunos = turno ? ALUNOS_DATA.filter(a => a.turno===turno) : ALUNOS_DATA;
  const turmas = turno ? TURMAS_DATA.filter(t => t.turno===turno) : TURMAS_DATA;
  const ocorrs = OCORR_DATA.filter(o => {
    if(turno){const al=ALUNOS_DATA.find(a=>a.nome===o.aluno||a.cpf===o.cpf); if(!al||al.turno!==turno) return false;}
    if(dia && o.data !== new Date(dia+'T12:00:00').toLocaleDateString('pt-BR')) return false;
    return true;
  });

  if(el('dash-total'))  el('dash-total').textContent  = alunos.length;
  if(el('dash-turmas')) el('dash-turmas').textContent = turmas.length;
  if(el('dash-faltas')) el('dash-faltas').textContent = ocorrs.filter(o=>o.tipo==='evasao'&&!o.tratada).length;

  // Busca presentes de hoje direto do Supabase via fetchAllRows para não esbarrar em limite (ex: 1500 alunos)
  try {
    // Corrige fuso horário para garantir a data local correta
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const hoje = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
    const targetDate = dia || hoje;
    const alunoIdsStr = alunos.map(a => String(a.id));

    if(alunoIdsStr.length > 0) {
      const { data: fqHoje, error } = await fetchAllRows('frequencia', 'aluno_id, status', q => q.eq('data', targetDate).eq('tipo', 'entrada'));
      if(error) throw error;

      // Filtra apenas os que pertencem aos alunos do turno/filtro atual
      const fqValida = (fqHoje || []).filter(f => alunoIdsStr.includes(String(f.aluno_id)));

      const presentes = fqValida.filter(f => f.status === 'P').length;
      const faltas    = fqValida.filter(f => f.status === 'F' || f.status?.startsWith('FJ')).length;
      
      if(el('dash-presentes')) el('dash-presentes').textContent = presentes;
      if(el('dash-faltas'))    el('dash-faltas').textContent    = faltas;
    } else {
      if(el('dash-presentes')) el('dash-presentes').textContent = 0;
    }
  } catch(e) {
    // fallback: conta alunos ativos
    if(el('dash-presentes')) el('dash-presentes').textContent = alunos.filter(a=>a.status==='ativo').length;
    console.warn('[renderMetricasDash] Supabase error:', e);
  }
}
async function renderTurmasTable(){
  const b=document.getElementById('turmas-table-body'); if(!b)return;
  const {turno} = getDashFiltros();
  let turmas = turno ? TURMAS_DATA.filter(t=>t.turno===turno) : TURMAS_DATA;
  if(!turmas.length){b.innerHTML=emptyTr('🏷️','Nenhuma turma encontrada','Cadastre turmas ou altere o filtro',8);return;}

  // Busca frequência do Supabase respeitando o filtro de data (ou hoje)
  const {dia} = getDashFiltros();
  // Corrige fuso horário para garantir a data local correta
  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const hoje = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  const targetDate = dia || hoje;
  
  let freqData = {}; // aluno_id → {entrada, saida}
  try{
    const {data:fq} = await fetchAllRows('frequencia', 'aluno_id,tipo,status', q => q.eq('data',targetDate));
    if(fq) fq.forEach(f=>{
      if(!freqData[f.aluno_id]) freqData[f.aluno_id]={};
      freqData[f.aluno_id][f.tipo]=f.status;
    });
  }catch(e){console.warn('freq fetch:',e);}

  b.innerHTML=turmas.map(t=>{
    const alunosTurma=ALUNOS_DATA.filter(a=>a.turma===t.code);
    const total=alunosTurma.length;
    
    // Conta por freq real
    let entP=0,saiP=0,evasoes=0;
    let entTotal=0, saiTotal=0; // Total de registros para saber se já foi lançada
    
    alunosTurma.forEach(a=>{
      const fq=freqData[a.id]||{};
      if(fq.entrada) entTotal++;
      if(fq.saida) saiTotal++;
      
      if(fq.entrada==='P') entP++;
      if(fq.saida==='P') saiP++;
      if(fq.entrada==='P'&&fq.saida==='F') evasoes++;
    });
    
    // Fallback: usa chamada em memória se não há dados no Supabase e a data é hoje
    if(total>0 && entTotal===0 && saiTotal===0 && targetDate === hoje){
      entP=t.entradaQtd||0;
      saiP=t.saidaQtd||0;
      entTotal = t.entradaConsolidada ? total : 0;
      saiTotal = t.saidaConsolidada ? total : 0;
    }
    
    const faltas=total-entP;
    const entPct=total>0?Math.round(entP/total*100):0;
    const saiPct=total>0?Math.round(saiP/total*100):0;
    
    const stEnt=entTotal>0?`<span class="metric-badge badge-green">${entPct}% pres.</span>`:`<span class="metric-badge badge-yellow">Pendente</span>`;
    const stSai=saiTotal>0?`<span class="metric-badge badge-green">${saiPct}% pres.</span>`:`<span class="metric-badge badge-yellow">Pendente</span>`;
    const evasBadge=evasoes>0?`<span class="metric-badge badge-red">⚠ ${evasoes}</span>`:'';
    return`<tr>
      <td><strong style="cursor:pointer;color:var(--blue)" onclick="abrirEditarTurma('${t.id}')" title="Clique para editar">${t.code} ✏️</strong></td>
      <td>${t.turno}</td>
      <td>${total}</td>
      <td><span class="metric-badge badge-blue">${entPct}%</span></td>
      <td>${stEnt}</td>
      <td><span class="metric-badge badge-blue">${saiPct}%</span></td>
      <td>${stSai}</td>
      <td><span class="metric-badge ${faltas>4?'badge-red':'badge-green'}">${faltas}</span> ${evasBadge}</td>
    </tr>`;
  }).join('');
}
function renderDashOcorr(){
  const cont=document.getElementById('dash-ocorr'); if(!cont)return;
  const {turno, dia} = getDashFiltros();
  
  // Define targetDate string no padrão DD/MM/YYYY (do filtro ou hoje)
  const hojeDate = new Date();
  const targetDateStr = dia ? new Date(dia+'T12:00:00').toLocaleDateString('pt-BR') : hojeDate.toLocaleDateString('pt-BR');

  let data=[...OCORR_DATA].reverse();
  if(turno){
    const als=ALUNOS_DATA.filter(a=>a.turno===turno).map(a=>a.nome); 
    data=data.filter(o=>als.includes(o.aluno));
  }
  
  // As ocorrências no dashboard são espelho do dia letivo (para bater com a frequência)
  data=data.filter(o=>o.data===targetDateStr);
  data=data.slice(0,5);
  
  cont.innerHTML=data.length?data.map(o=>ocorrItemHTML(o)).join(''):emptyState('✅','Nenhuma ocorrência','Tudo tranquilo neste dia');
}

// ─── TURMAS ───────────────────────────────────────────────────────────────────
let TURMA_ACAO_ATUAL_ID = null;
const ESCOLA_NOME_TURMAS = 'Escola Dr. Romildo Veloso e Silva';

function getTurmaById(id){
  return TURMAS_DATA.find(t => String(t.id) === String(id)) || null;
}

function getAlunosDaTurmaPorCodigo(turmaCode){
  return ALUNOS_DATA
    .filter(a => a.turma === turmaCode)
    .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }));
}

function abrirAcoesTurma(id){
  const turma = getTurmaById(id);
  if(!turma) return;
  TURMA_ACAO_ATUAL_ID = turma.id;
  const alunos = getAlunosDaTurmaPorCodigo(turma.code);
  const setText = (elId, value) => {
    const elRef = document.getElementById(elId);
    if(elRef) elRef.textContent = value;
  };
  setText('acao-turma-code', turma.code || '-');
  setText('acao-turma-turno', turma.turno || '-');
  setText('acao-turma-total', String(alunos.length));
  openModal('modal-acoes-turma');
}

function abrirListaAlunosTurma(id = TURMA_ACAO_ATUAL_ID){
  const turma = getTurmaById(id);
  if(!turma){
    showToast('Turma nao encontrada.', 'alerta');
    return;
  }
  TURMA_ACAO_ATUAL_ID = turma.id;
  const alunos = getAlunosDaTurmaPorCodigo(turma.code);
  const subtitulo = document.getElementById('lista-turma-subtitulo');
  const resumo = document.getElementById('lista-turma-resumo');
  const container = document.getElementById('lista-alunos-turma-container');
  if(subtitulo) subtitulo.textContent = `${ESCOLA_NOME_TURMAS} - ${turma.turno || '-'} - Turma ${turma.code}`;
  if(resumo) resumo.textContent = `${alunos.length} aluno(s) listado(s) para assinatura.`;
  if(container){
    container.innerHTML = alunos.length
      ? alunos.map((aluno, idx) => `
          <div class="turma-aluno-item">
            <div class="turma-aluno-indice">Nº ${String(idx + 1).padStart(2, '0')}</div>
            <div class="turma-aluno-nome">${aluno.nome || '-'}</div>
            <div class="turma-aluno-assinatura" title="Assinatura do aluno"></div>
          </div>
        `).join('')
      : `<div class="turma-lista-vazia">Nenhum aluno encontrado nesta turma.</div>`;
  }
  closeModal('modal-acoes-turma');
  openModal('modal-lista-alunos-turma');
}

function solicitarEdicaoTurma(id = TURMA_ACAO_ATUAL_ID){
  const turma = getTurmaById(id);
  if(!turma){
    showToast('Turma nao encontrada.', 'alerta');
    return;
  }
  confirmarSenhaAdmin(() => {
    closeModal('modal-acoes-turma');
    abrirEditarTurma(turma.id);
  });
}

async function baixarListaAlunosTurmaPDF(id = TURMA_ACAO_ATUAL_ID){
  const turma = getTurmaById(id);
  if(!turma){
    showToast('Turma nao encontrada.', 'alerta');
    return;
  }

  const alunos = getAlunosDaTurmaPorCodigo(turma.code);
  if(!alunos.length){
    showToast('Nao ha alunos cadastrados nesta turma para gerar o PDF.', 'alerta');
    return;
  }

  try{
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const signatureStartX = 380;
    const signatureEndX = pageWidth - margin;
    const rowHeight = 24;
    let page;
    let y;

    const drawHeader = () => {
      page.drawText(ESCOLA_NOME_TURMAS, {
        x: margin,
        y,
        size: 16,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16)
      });
      y -= 24;
      page.drawText(`Turno: ${turma.turno || '-'}`, {
        x: margin,
        y,
        size: 11,
        font,
        color: rgb(0.35, 0.4, 0.48)
      });
      page.drawText(`Turma: ${turma.code || '-'}`, {
        x: 250,
        y,
        size: 11,
        font,
        color: rgb(0.35, 0.4, 0.48)
      });
      y -= 18;
      page.drawText(`Total de alunos: ${alunos.length}`, {
        x: margin,
        y,
        size: 11,
        font,
        color: rgb(0.35, 0.4, 0.48)
      });
      y -= 24;
      page.drawText('Nº', { x: margin, y, size: 11, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
      page.drawText('Nome do Aluno', { x: margin + 36, y, size: 11, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
      page.drawText('Assinatura', { x: signatureStartX, y, size: 11, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
      y -= 8;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.84, 0.9)
      });
      y -= 18;
    };

    const addPage = () => {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      drawHeader();
    };

    addPage();

    alunos.forEach((aluno, idx) => {
      if(y < 70) addPage();

      page.drawText(String(idx + 1).padStart(2, '0'), {
        x: margin,
        y,
        size: 10.5,
        font,
        color: rgb(0.25, 0.29, 0.35)
      });

      page.drawText(String(aluno.nome || '-').slice(0, 55), {
        x: margin + 36,
        y,
        size: 10.5,
        font,
        color: rgb(0.06, 0.09, 0.16)
      });

      page.drawLine({
        start: { x: signatureStartX, y: y + 2 },
        end: { x: signatureEndX, y: y + 2 },
        thickness: 0.8,
        color: rgb(0.55, 0.6, 0.68)
      });

      y -= rowHeight;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista_alunos_${String(turma.code || 'turma').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`PDF da turma ${turma.code} gerado com sucesso.`, 'sucesso');
  }catch(err){
    console.error('[baixarListaAlunosTurmaPDF]', err);
    showToast('Nao foi possivel gerar o PDF da lista da turma.', 'erro');
  }
}

function renderTurmaGrid(){
  const g=document.getElementById('turma-grid'); if(!g)return;
  if(!TURMAS_DATA.length){g.innerHTML=emptyState('🏷️','Nenhuma turma cadastrada','Clique em "+ Nova Turma"');return;}
  g.innerHTML=TURMAS_DATA.map(t=>{
    const total=ALUNOS_DATA.filter(a=>a.turma===t.code).length;
    const pres=t.presentes||0, pct=total>0?Math.round(pres/total*100):0;
    const color=pct>=90?'var(--green)':pct>=75?'var(--yellow)':'var(--red)';
    return`<div class="turma-card" onclick="abrirEditarTurma('${t.id}')" title="Clique para editar a turma" style="cursor:pointer;transition:box-shadow 0.2s" onmouseenter="this.style.boxShadow='0 4px 18px rgba(0,0,0,0.13)'" onmouseleave="this.style.boxShadow=''">
      <div class="turma-code">${t.code}</div>
      <div class="turma-info">${t.serie} — ${t.turno}</div>
      <div class="turma-progress"><div class="turma-progress-bar" style="width:${pct}%;background:${color}"></div></div>
      <div class="turma-stats">
        <span style="color:var(--gray5)">👥 ${total}</span>
        <span style="color:var(--green-dark)">✓ ${pres}</span>
        <span style="color:var(--red)">✗ ${total-pres}</span>
      </div>
      <div style="font-size:10px;color:var(--gray4);text-align:center;margin-top:4px">✏️ clique para editar</div>
    </div>`;
  }).join('');
}

function abrirModalNovaTurma(){
  const currentValue = document.getElementById('input-turma-serie')?.value || '';
  const currentLocalidade = document.getElementById('input-turma-localidade')?.value || '';
  popularSelectSerieTurma('input-turma-serie', currentValue);
  sincronizarSelectsLocalidadeTurma(currentLocalidade);
  openModal('modal-turma');
}

function abrirEditarTurma(id){
  const t=TURMAS_DATA.find(x=>x.id===id); if(!t)return;
  document.getElementById('edit-turma-id').value=t.id;
  document.getElementById('edit-turma-code').value=t.code;
  document.getElementById('edit-turma-turno').value=t.turno||'Manhã';
  popularSelectSerieTurma('edit-turma-serie', t.serie || '');
  sincronizarSelectsLocalidadeTurma('', t.localidade || '');
  document.getElementById('edit-turma-professor').value=t.professor||'';
  openModal('modal-editar-turma');
}

async function salvarEdicaoTurma(){
  const id=document.getElementById('edit-turma-id')?.value;
  const code=(document.getElementById('edit-turma-code')?.value||'').trim().toUpperCase();
  const turno=document.getElementById('edit-turma-turno')?.value||'Manhã';
  const serie=document.getElementById('edit-turma-serie')?.value||'';
  const localidade=document.getElementById('edit-turma-localidade')?.value||'';
  const professor=(document.getElementById('edit-turma-professor')?.value||'').trim();
  if(isRuralOurilandiaSchool() && !localidade){showToast('Selecione a localidade da turma.','alerta');return;}
  if(!id||!code){showToast('Preencha o código da turma','alerta');return;}
  const {error}=await supabaseClient.from('turmas').update({code,turno,serie,professor}).eq('id',id);
  if(error){showToast('Erro ao salvar: '+error.message,'evasao');return;}
  if(isRuralOurilandiaSchool()){
    TURMAS_LOCALIDADES[id]=localidade;
    TURMAS_LOCALIDADES[code]=localidade;
    try {
      await salvarConfigTurmasLocalidades();
    } catch(err){
      console.error('[salvarEdicaoTurma] Erro ao salvar localidade:', err);
      showToast('A turma foi atualizada, mas houve erro ao salvar a localidade.','alerta');
    }
  }
  closeModal('modal-editar-turma');
  showToast('Turma atualizada com sucesso!','sucesso');
  await carregarDados();
  atualizarSelectTurmas();
  renderTurmaGrid(); renderTurmasTable(); renderMetricasDash();
}

async function saveTurma(){
  const code  = document.getElementById('input-turma-code')?.value.trim().toUpperCase();
  const turno = document.getElementById('input-turma-turno')?.value;
  const serie = document.getElementById('input-turma-serie')?.value;
  const localidade = document.getElementById('input-turma-localidade')?.value || '';
  if(!code){ showToast('Informe o código da turma!','alerta'); return; }
  if(TURMAS_DATA.find(t=>t.code===code)){ showToast('Turma '+code+' já existe!','alerta'); return; }
  if(isRuralOurilandiaSchool() && !localidade){ showToast('Selecione a localidade da turma!','alerta'); return; }
  
  const {data: turmaInserida, error} = await supabaseClient.from('turmas').insert({
      code: code,
      serie: serie || code,
      turno: turno || 'Manhã',
      professor: 'A Definir'
  }).select().single();
  
  if (error) {
     console.error(error); showToast('Erro no banco de dados', 'evasao'); return;
  }
  if (isRuralOurilandiaSchool() && turmaInserida) {
    TURMAS_LOCALIDADES[turmaInserida.id]=localidade;
    TURMAS_LOCALIDADES[code]=localidade;
    try {
      await salvarConfigTurmasLocalidades();
    } catch(err){
      console.error('[saveTurma] Erro ao salvar localidade:', err);
      showToast('A turma foi criada, mas houve erro ao salvar a localidade.','alerta');
    }
  }
  
  closeModal('modal-turma');
  showToast('Turma '+code+' criada!','sucesso');
  await carregarDados();
  atualizarSelectTurmas();
  renderTurmaGrid(); renderTurmasTable(); renderMetricasDash();
}

function abrirExcluirTurma(){
  confirmarSenhaAdmin(()=>{ atualizarSelectTurmas(); openModal('modal-excluir-turma'); });
}
async function excluirTurma(){
  const code=document.getElementById('select-excluir-turma')?.value;
  if(!code){ showToast('Selecione uma turma','alerta'); return; }
  if(ALUNOS_DATA.filter(a=>a.turma===code).length>0){ showToast('Mova os alunos antes de excluir!','evasao'); return; }
  
  const tObj = TURMAS_DATA.find(t=>t.code===code);
  if(tObj && tObj.id) {
     const {error} = await supabaseClient.from('turmas').delete().eq('id', tObj.id);
     if(error) { console.error(error); showToast('Erro ao excluir no banco', 'evasao'); return; }
  }
  
  closeModal('modal-excluir-turma');
  showToast('Turma '+code+' excluída.','sucesso');
  await carregarDados();
  atualizarSelectTurmas();
  renderTurmaGrid(); renderTurmasTable(); renderMetricasDash();
}

// ─── ALUNOS ───────────────────────────────────────────────────────────────────
function renderAlunos(filter=''){
  const b=document.getElementById('alunos-tbody'); if(!b)return;
  let data=filter
    ?ALUNOS_DATA.filter(a=>a.nome.toLowerCase().includes(filter.toLowerCase())||a.turma.toLowerCase().includes(filter.toLowerCase())||a.cpf.includes(filter))
    :ALUNOS_DATA;
  const tf=document.getElementById('filtro-turma-alunos')?.value;
  if(tf) data=data.filter(a=>a.turma===tf);
  if(!data.length){b.innerHTML=emptyTr('👥','Nenhum aluno encontrado','Ajuste filtros ou cadastre alunos',8);return;}
  b.innerHTML=data.map(a=>`<tr>
    <td><code>${a.cpf}</code></td>
    <td><strong>${a.nome}</strong></td>
    <td><span class="metric-badge badge-blue">${a.turma}</span></td>
    <td>${a.turno}</td>
    <td>${a.rota||'Sem transporte'}</td>
    <td>${a.resp||'—'}</td>
    <td><span class="metric-badge ${a.status==='ativo'?'badge-green':'badge-yellow'}">${a.status}</span></td>
    <td><button class="btn btn-outline btn-xs" onclick="verFicha('${a.cpf}')">📋 Ficha</button></td>
  </tr>`).join('');
}
function filterAlunos(v){ renderAlunos(v); }

function calcularIdade(){
  const nasc=document.getElementById('input-aluno-nasc')?.value;
  const idadeEl=document.getElementById('input-aluno-idade');
  if(!nasc||!idadeEl) return;
  const hoje=new Date(), nascDate=new Date(nasc);
  let idade=hoje.getFullYear()-nascDate.getFullYear();
  const m=hoje.getMonth()-nascDate.getMonth();
  if(m<0||(m===0&&hoje.getDate()<nascDate.getDate())) idade--;
  idadeEl.value=idade>0?idade+' anos':'—';
}

function getAlunoAvatarPlaceholder() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%234f46e5'/%3E%3Ctext x='50' y='64' text-anchor='middle' font-size='40' fill='white'%3E%3F%3C/text%3E%3C/svg%3E";
}

function setAlunoFotoOrigem(origem = 'cadastro') {
  _alunoFotoOrigem = origem === 'ficha' ? 'ficha' : 'cadastro';
}

function getAlunoFotoRefs(origem = _alunoFotoOrigem) {
  if (origem === 'ficha') {
    return {
      status: document.getElementById('ficha-foto-status'),
      input: document.getElementById('ficha-foto-input'),
      img: document.getElementById('ficha-avatar'),
      fallback: document.getElementById('ficha-avatar-fallback'),
      saveBtn: document.getElementById('ficha-foto-salvar-btn')
    };
  }

  return {
    status: document.getElementById('aluno-foto-status'),
    input: document.getElementById('aluno-foto-input'),
    preview: document.getElementById('aluno-avatar-preview')
  };
}

function setAlunoFotoStatus(texto, cor = 'var(--gray4)', origem = _alunoFotoOrigem) {
  const refs = getAlunoFotoRefs(origem);
  if (!refs.status) return;
  refs.status.style.color = cor;
  refs.status.textContent = texto;
}

function setSalvarFotoFichaHabilitado(habilitado) {
  const btn = document.getElementById('ficha-foto-salvar-btn');
  if (btn) btn.disabled = !habilitado;
}

function resetarEstadoFotoFichaAluno() {
  const refs = getAlunoFotoRefs('ficha');
  if (refs.input) refs.input.value = '';
  setSalvarFotoFichaHabilitado(false);
  setAlunoFotoStatus('A foto será salva no Google Drive e vinculada ao cadastro do aluno.', 'rgba(255,255,255,.78)', 'ficha');
}

function atualizarPreviewFotoAluno(src, origem = _alunoFotoOrigem) {
  const refs = getAlunoFotoRefs(origem);

  if (origem === 'ficha') {
    if (refs.img) {
      refs.img.src = src;
      refs.img.style.display = 'block';
    }
    if (refs.fallback) refs.fallback.style.display = 'none';
    setSalvarFotoFichaHabilitado(true);
    return;
  }

  if (refs.preview) refs.preview.src = src || getAlunoAvatarPlaceholder();
}

async function enviarFotoAlunoParaDrive(file, alunoRef = {}) {
  const nomeBase = (alunoRef.nome || alunoRef.cpf || 'aluno')
    .replace(/[^a-zA-Z0-9\u00C0-\u00FA\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'aluno';
  const ext = ((file.name || 'jpg').split('.').pop() || 'jpg').toLowerCase();
  
  const cpfLimpo = (alunoRef.cpf || '').replace(/\D/g, '') || 'sem_cpf';
  const filename = `alunos/${cpfLimpo}_${Date.now()}.${ext}`;

  const { data, error } = await supabaseClient.storage
    .from('fotos-sistema')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Erro no Supabase Storage:', error);
    throw new Error(error.message || 'Erro ao salvar foto no Supabase');
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from('fotos-sistema')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

function abrirModalNovoAluno() {
  _alunoFotoPendente = null;
  setAlunoFotoOrigem('cadastro');
  const prev = document.getElementById('aluno-avatar-preview');
  if(prev) prev.src = getAlunoAvatarPlaceholder();
  const refs = getAlunoFotoRefs('cadastro');
  if (refs.input) refs.input.value = '';
  setAlunoFotoStatus('Máximo 5MB. Arquivo será salvo no Supabase Storage.', 'var(--gray4)', 'cadastro');
  openModal('modal-aluno');
}

// ─── CÂMERA E FOTO DO ALUNO ────────────────────────────────────────────────────────
async function abrirCameraAluno(origem = 'cadastro') {
  setAlunoFotoOrigem(origem);
  const erroEl = document.getElementById('camera-aluno-erro');
  if (erroEl) erroEl.style.display = 'none';
  const constraints = { video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false };
  try {
    _cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    const video = document.getElementById('camera-aluno-video');
    if (video) { video.srcObject = _cameraStream; }
    openModal('modal-camera-aluno');
  } catch (err) {
    console.error('[Camera Aluno] Erro:', err);
    if (err.name === 'NotAllowedError') showToast('Permissão de câmera negada. Selecione da galeria.', 'alerta');
    else getAlunoFotoRefs(_alunoFotoOrigem).input?.click();
  }
}

function fecharCameraAluno() {
  if (_cameraStream) { _cameraStream.getTracks().forEach(t => t.stop()); _cameraStream = null; }
  const video = document.getElementById('camera-aluno-video');
  if (video) video.srcObject = null;
  closeModal('modal-camera-aluno');
}

function tirarFotoAluno() {
  const video = document.getElementById('camera-aluno-video');
  const canvas = document.getElementById('camera-aluno-canvas');
  if (!video || !canvas) return;
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    if (!blob) { showToast('Erro ao capturar foto.', 'evasao'); return; }
    const file = new File([blob], `aluno_${Date.now()}.jpg`, { type: 'image/jpeg' });
    selecionarFotoAluno({ files: [file] }, _alunoFotoOrigem);
    fecharCameraAluno();
  }, 'image/jpeg', 0.9);
}

function selecionarFotoAluno(input, origem = 'cadastro') {
  setAlunoFotoOrigem(origem);
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Foto muito grande! Máximo 5MB.', 'alerta'); input.value = ''; return; }
  _alunoFotoPendente = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    atualizarPreviewFotoAluno(e.target.result, _alunoFotoOrigem);
  };
  reader.readAsDataURL(file);
  const msg = _alunoFotoOrigem === 'ficha'
    ? 'Foto selecionada. Clique em "Salvar foto" para atualizar o cadastro.'
    : 'Foto selecionada.';
  const cor = _alunoFotoOrigem === 'ficha' ? '#dbeafe' : 'var(--blue-dark)';
  setAlunoFotoStatus(msg, cor, _alunoFotoOrigem);
}

async function saveAluno(){
  const nome   =document.getElementById('input-aluno-nome')?.value.trim();
  const cpf    =formatarCPF(document.getElementById('input-aluno-cpf')?.value.trim());
  const turmaCode =document.getElementById('input-aluno-turma')?.value;
  const turno  =document.getElementById('input-aluno-turno')?.value;
  const resp   =document.getElementById('input-aluno-resp')?.value.trim();
  const contato=document.getElementById('input-aluno-contato')?.value.trim();
  const rota   =document.getElementById('input-aluno-rota')?.value;
  const email  =document.getElementById('input-aluno-email')?.value.trim();
  const nasc   =document.getElementById('input-aluno-nasc')?.value;
  const idade  =document.getElementById('input-aluno-idade')?.value;
  
  if(!nome||!cpf||!turmaCode){ showToast('Preencha nome, CPF e turma!','alerta'); return; }
  if(normalizarCPF(cpf).length !== 11){ showToast('Informe um CPF válido com 11 dígitos!','alerta'); return; }
  if(ALUNOS_DATA.find(a => normalizarCPF(a.cpf) === normalizarCPF(cpf))){ showToast('CPF já cadastrado!','alerta'); return; }
  
  const tObj = TURMAS_DATA.find(t => t.code === turmaCode);
  if (!tObj) { showToast('Turma não encontrada no sistema.', 'alerta'); return; }

  let fotoUrl = null;
  if (_alunoFotoPendente) {
    setAlunoFotoStatus('⏳ Enviando foto ao Google Drive...', 'var(--blue-dark)', 'cadastro');
    try {
      fotoUrl = await enviarFotoAlunoParaDrive(_alunoFotoPendente, { cpf, nome });
      setAlunoFotoStatus('✅ Foto salva no Google Drive!', 'var(--green-dark)', 'cadastro');
    } catch(err) {
      console.error('[Drive Upload Aluno]', err);
      showToast('Aviso: Foto falhou, mas aluno será salvo. ' + err.message, 'evasao');
    }
  }

  const payload = {
      matricula: cpf,
      nome: nome,
      turma_id: tObj.id,
      rota: rota || 'Sem transporte',
      responsavel: resp,
      contato: contato,
      instagram: email,
      data_nascimento: nasc || null,
      status: 'ativo'
  };
  if (fotoUrl) payload.foto_url = fotoUrl;

  const { data, error } = await supabaseClient.from('alunos').insert(payload);

  if (error) {
      console.error("[saveAluno] Erro Supabase:", error);
      showToast('Erro no banco: ' + error.message, 'evasao');
      return;
  }

  closeModal('modal-aluno');
  _alunoFotoPendente = null;
  showToast(nome+' cadastrado!','sucesso');
  
  await carregarDados();
  atualizarSelectTurmas();
  renderAlunos(); renderMetricasDash(); renderTurmasTable(); renderTurmaGrid();
}

async function salvarFotoAlunoFicha() {
  const cpf = getFichaCpfAtual();
  const a = ALUNOS_DATA.find(x => x.cpf === cpf);
  if (!a || !a.id) { showToast('Aluno não localizado para salvar a foto.', 'alerta'); return; }
  if (!_alunoFotoPendente || _alunoFotoOrigem !== 'ficha') { showToast('Selecione uma foto na ficha antes de salvar.', 'alerta'); return; }

  const btn = document.getElementById('ficha-foto-salvar-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Salvando...';
  }

  setAlunoFotoStatus('⏳ Enviando foto ao Google Drive...', '#dbeafe', 'ficha');

  try {
    const fotoUrl = await enviarFotoAlunoParaDrive(_alunoFotoPendente, { cpf: a.cpf, nome: a.nome });
    const { error } = await supabaseClient.from('alunos').update({ foto_url: fotoUrl }).eq('id', a.id);
    if (error) throw error;

    a.foto_url = fotoUrl;
    _alunoFotoPendente = null;
    const refs = getAlunoFotoRefs('ficha');
    if (refs.input) refs.input.value = '';
    setAlunoFotoStatus('✅ Foto atualizada e salva no cadastro do aluno.', '#bbf7d0', 'ficha');
    setSalvarFotoFichaHabilitado(false);
    verFicha(cpf);
    renderAlunos();
    salvarDados();
    showToast('Foto do aluno atualizada com sucesso!', 'sucesso');
  } catch (err) {
    console.error('[salvarFotoAlunoFicha] Erro:', err);
    setAlunoFotoStatus('Erro ao salvar a foto. Tente novamente.', '#fecaca', 'ficha');
    setSalvarFotoFichaHabilitado(true);
    showToast('Erro ao salvar foto: ' + err.message, 'evasao');
  } finally {
    if (btn) btn.textContent = 'Salvar foto';
  }
}

function verFichaLegacy(cpf){
  verFicha(cpf);
}

function renderFichaOcorrencias(a){
  const el=document.getElementById('ficha-ocorrencias'); if(!el)return;
  // Filtra ocorrências onde o aluno é envolvido (pelo nome ou cpf)
  const ocorrs=OCORR_DATA.filter(o=>
    o.aluno===a.nome || o.aluno===a.cpf ||
    o.aluno.includes(a.nome) || (a.cpf && o.cpf===a.cpf)
  );
  if(!ocorrs.length){
    el.innerHTML='<div style="font-size:12.5px;color:var(--gray4);padding:8px 0">Nenhuma ocorrência registrada.</div>';
    return;
  }
  el.innerHTML=ocorrs.map(o=>{
    const label={evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso',liberado_coord:'Liberado pela Coord.',suspensao_celular:'Suspensão Uso Celular'}[o.tipo]||o.tipo;
    const cor=o.tratada?'var(--green-light)':'var(--red-light)';
    const txt=o.tratada?'var(--green-dark)':'var(--red-dark)';
    return`<div style="background:${cor};border-radius:8px;padding:8px 12px;margin-bottom:6px;font-size:12px">
      <strong style="color:${txt}">${label}</strong> — ${o.data} ${o.hora}
      <div style="color:var(--gray6);margin-top:2px">${o.desc}</div>
      ${o.tratada?'<div style="color:var(--green-dark);font-size:11px;margin-top:2px">✓ Tratada'+( o.justificativa?' — '+o.justificativa:'')+'</div>':''}
    </div>`;
  }).join('');
}

function renderTimeline(a){
  const tl=document.getElementById('ficha-timeline'); if(!tl)return;
  if(!(a.historico||[]).length){tl.innerHTML=emptyState('📋','Sem histórico','Nenhuma movimentação');return;}
  const cores={presenca:'var(--green)',falta:'var(--red)',ocorrencia:'var(--yellow)',mudanca:'var(--blue)'};
  tl.innerHTML=a.historico.map((h,i)=>`
    <div class="tl-item">
      <div class="tl-line">
        <div class="tl-dot" style="background:${cores[h.tipo]||'var(--gray4)'}"></div>
        ${i<a.historico.length-1?'<div class="tl-connector"></div>':''}
      </div>
      <div class="tl-content"><h4>${h.titulo}</h4><p>${h.desc}</p><div class="tl-date">${h.data}</div></div>
    </div>`).join('');
}

function setFichaText(id, value){
  const el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

function setFichaBadge(id, value, badgeClass){
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || '—';
  el.className = `metric-badge ${badgeClass}`;
}

function setFichaCounter(id, count, singular, plural){
  const el = document.getElementById(id);
  if (!el) return;
  if (typeof count === 'string') {
    el.textContent = count;
    return;
  }
  const total = Number(count);
  if (!Number.isFinite(total)) {
    el.textContent = '—';
    return;
  }
  el.textContent = `${total} ${total === 1 ? singular : plural}`;
}

function getOcorrenciasAluno(aluno){
  const nome = String(aluno?.nome || '');
  const cpf = String(aluno?.cpf || '');
  return OCORR_DATA.filter(o => {
    const alvo = String(o?.aluno || '');
    return alvo === nome || alvo === cpf || (nome && alvo.includes(nome)) || (cpf && o?.cpf === cpf);
  });
}

function formatarStatusFicha(status){
  const chave = String(status || 'ativo').trim().toLowerCase();
  const mapa = {
    ativo: { label: 'Ativo', badge: 'badge-green' },
    inativo: { label: 'Inativo', badge: 'badge-red' },
    pendente: { label: 'Pendente', badge: 'badge-yellow' },
    transferido: { label: 'Transferido', badge: 'badge-blue' }
  };
  if (mapa[chave]) return mapa[chave];
  const label = chave ? chave.charAt(0).toUpperCase() + chave.slice(1) : 'Ativo';
  return { label, badge: 'badge-blue' };
}

function getFichaContainer(){
  return document.getElementById('ficha-aluno-page');
}

function getAlunosNavItem(){
  return document.querySelector(".nav-item[onclick*=\"showPage('alunos',this)\"]");
}

function getFichaCpfAtual(){
  return getFichaContainer()?.dataset.cpf || '';
}

function exibirFichaInline(){
  const ficha = getFichaContainer();
  if (!ficha) return;
  showPage('ficha-aluno', getAlunosNavItem());
  requestAnimationFrame(() => {
    document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('page-ficha-aluno')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function fecharFichaInline(){
  const ficha = getFichaContainer();
  if (ficha) ficha.dataset.cpf = '';
  _alunoFotoPendente = null;
  resetarEstadoFotoFichaAluno();
  showPage('alunos', getAlunosNavItem());
  requestAnimationFrame(() => {
    document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('page-alunos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function verFicha(cpf){
  const a = ALUNOS_DATA.find(x => x.cpf === cpf); if(!a) return;
  _alunoFotoPendente = null;
  setAlunoFotoOrigem('ficha');
  resetarEstadoFotoFichaAluno();
  const faltas = (a.historico || []).filter(h => h.tipo === 'falta').length;
  const ocorrs = getOcorrenciasAluno(a);
  const statusInfo = formatarStatusFicha(a.status);
  const turmaText = [a.turma, a.turno].filter(Boolean).join(' — ') || '—';
  const transporteText = a.rota || 'Sem transporte';
  const transporteBadge = transporteText === 'Sem transporte' ? 'badge-yellow' : 'badge-blue';

  setFichaText('ficha-nome', a.nome);
  setFichaText('ficha-subtitulo', `${turmaText} • ${a.resp || 'Responsável não informado'}`);
  setFichaText('ficha-cpf', a.cpf || '—');
  setFichaText('ficha-matricula', formatarCPF(a.matricula || a.cpf || '—'));
  setFichaText('ficha-turma', turmaText);
  setFichaText('ficha-resp', a.resp || '—');
  setFichaText('ficha-contato', a.contato || '—');
  setFichaText('ficha-email', a.email || '—');
  setFichaText('ficha-rota', transporteText);
  setFichaText('ficha-nasc', a.nasc ? new Date(a.nasc).toLocaleDateString('pt-BR') : '—');
  setFichaText('ficha-idade', a.idade || '—');
  setFichaText('ficha-faltas', String(faltas));
  setFichaText('ficha-total-ocorrencias', String(ocorrs.length));
  setFichaText('ficha-total-responsaveis', '...');
  setFichaText('ficha-total-boletins', '...');
  setFichaBadge('ficha-status', statusInfo.label, statusInfo.badge);
  setFichaBadge('ficha-turno', a.turno || 'Turno não informado', 'badge-blue');
  setFichaBadge('ficha-rota-badge', transporteText === 'Sem transporte' ? 'Sem transporte' : 'Transporte ativo', transporteBadge);
  setFichaCounter('ficha-ocorrencias-count', ocorrs.length, 'registro', 'registros');
  setFichaCounter('ficha-timeline-count', (a.historico || []).length, 'item', 'itens');
  setFichaCounter('ficha-responsaveis-count', 'Carregando...');
  setFichaCounter('ficha-boletins-count', 'Carregando...');

  const imgEl = document.getElementById('ficha-avatar');
  const fallbackEl = document.getElementById('ficha-avatar-fallback');
  if (a.foto_url) {
    if (imgEl) {
      imgEl.src = a.foto_url;
      imgEl.style.display = 'block';
    }
    if (fallbackEl) fallbackEl.style.display = 'none';
  } else {
    if (imgEl) imgEl.style.display = 'none';
    if (fallbackEl) {
      fallbackEl.textContent = a.nome.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();
      fallbackEl.style.display = 'flex';
    }
  }

  renderTimeline(a);
  renderFichaOcorrencias(a);
  renderResponsaveisFicha(a.id);
  renderFichaBoletins(a);
  const ficha = getFichaContainer();
  if (ficha) ficha.dataset.cpf = cpf;
  exibirFichaInline();
}

function renderFichaOcorrencias(a){
  const el = document.getElementById('ficha-ocorrencias'); if(!el) return;
  const ocorrs = getOcorrenciasAluno(a);
  setFichaText('ficha-total-ocorrencias', String(ocorrs.length));
  setFichaCounter('ficha-ocorrencias-count', ocorrs.length, 'registro', 'registros');
  if(!ocorrs.length){
    el.innerHTML = '<div class="ficha-empty-inline">Nenhuma ocorrência registrada para este aluno até o momento.</div>';
    return;
  }
  el.innerHTML = ocorrs.map(o => {
    const label = {evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso',liberado_coord:'Liberado pela Coordenação',suspensao_celular:'Suspensão de Celular'}[o.tipo] || o.tipo;
    const tratada = !!o.tratada;
    return `
      <div class="ficha-occ-card ${tratada ? 'resolved' : 'pending'}">
        <div class="ficha-occ-copy">
          <div class="ficha-occ-meta">
            <span class="metric-badge ${tratada ? 'badge-green' : 'badge-red'}">${tratada ? 'Tratada' : 'Pendente'}</span>
            <span class="metric-badge badge-gray">${label}</span>
          </div>
          <strong>${o.data || 'Data não informada'}${o.hora ? ' • ' + o.hora : ''}</strong>
          <span>${o.desc || 'Sem descrição informada.'}</span>
          ${o.justificativa ? `<span>Tratativa: ${o.justificativa}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderTimeline(a){
  const tl = document.getElementById('ficha-timeline'); if(!tl) return;
  const historico = a.historico || [];
  setFichaCounter('ficha-timeline-count', historico.length, 'item', 'itens');
  if(!historico.length){
    tl.innerHTML = '<div class="ficha-empty-inline">Sem movimentações registradas para compor a timeline do aluno.</div>';
    return;
  }
  const cores = {presenca:'var(--green)',falta:'var(--red)',ocorrencia:'var(--yellow)',mudanca:'var(--blue)'};
  tl.innerHTML = historico.map((h, i) => `
    <div class="tl-item">
      <div class="tl-line">
        <div class="tl-dot" style="background:${cores[h.tipo] || 'var(--gray4)'}"></div>
        ${i < historico.length - 1 ? '<div class="tl-connector"></div>' : ''}
      </div>
      <div class="tl-content"><h4>${h.titulo}</h4><p>${h.desc}</p><div class="tl-date">${h.data}</div></div>
    </div>`).join('');
}

function abrirMudancaTurma(){
  confirmarSenhaAdmin(()=>{ atualizarSelectTurmas(); openModal('modal-mudar-turma'); });
}
async function salvarMudancaTurma(){
  const cpf=getFichaCpfAtual();
  const novaTurma=document.getElementById('select-nova-turma')?.value;
  if(!novaTurma){ showToast('Selecione a nova turma','alerta'); return; }
  
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  const tObj = TURMAS_DATA.find(t=>t.code===novaTurma);
  if(!tObj) return;
  
  if (a.id) {
     const {error} = await supabaseClient.from('alunos').update({
        turma_id: tObj.id
     }).eq('id', a.id);
     if(error) console.error("Erro mudando turma:", error);

     // Migra os boletins individuais do aluno para a nova turma
     const { error: boletinsError } = await supabaseClient
        .from('boletins')
        .update({ turma_id: tObj.id })
        .eq('aluno_id', a.id);
     if(boletinsError) console.error("Erro migrando boletins do aluno:", boletinsError);
  }
  
  closeModal('modal-mudar-turma');
  showToast('Aluno movido para '+novaTurma,'sucesso');
  await carregarDados();
  verFicha(cpf); renderAlunos(); renderTurmasTable(); renderTurmaGrid();
}

function abrirOcorrDaFicha(){
  const cpf=getFichaCpfAtual();
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  envolvidos=[{nome:a.nome}];
  document.getElementById('envolvidos-list-ocorr').innerHTML=`<div class="envolvido-tag"><span>👤 ${a.nome}</span></div>`;
  if(document.getElementById('input-ocorr-turma')) document.getElementById('input-ocorr-turma').value=a.turma;
  atualizarAlunosPorTurmaOcorr();
  openModal('modal-ocorr');
}

function abrirEditarFicha(){
  const cpf=getFichaCpfAtual();
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  const s=prompt('🔐 Edição de dados requer senha do administrador:');
  if(s!==ADMIN_SENHA){ if(s!==null) showToast('Senha incorreta','evasao'); return; }
  // Preenche o modal de edição
  document.getElementById('edit-aluno-nome').value=a.nome||'';
  document.getElementById('edit-aluno-cpf').value=a.cpf||'';
  document.getElementById('edit-aluno-turno').value=a.turno||'Manhã';
  document.getElementById('edit-aluno-nasc').value=a.nasc||'';
  document.getElementById('edit-aluno-resp').value=a.resp||'';
  document.getElementById('edit-aluno-contato').value=a.contato||'';
  document.getElementById('edit-aluno-email').value=a.email||'';
  document.getElementById('edit-aluno-idade').value=a.idade||'';
  // Popula select de rota
  const sr=document.getElementById('edit-aluno-rota');
  if(sr){
    sr.innerHTML='<option value="Sem transporte">Sem transporte</option>'+
      ROTAS_DATA.map(r=>`<option value="${r.nome}">${r.nome}</option>`).join('');
    sr.value=a.rota||'Sem transporte';
  }
  openModal('modal-editar-ficha');
}

function calcularIdadeEdit(){
  const nasc=document.getElementById('edit-aluno-nasc')?.value;
  const idadeEl=document.getElementById('edit-aluno-idade');
  if(!nasc||!idadeEl) return;
  const hoje=new Date(), nascDate=new Date(nasc);
  let idade=hoje.getFullYear()-nascDate.getFullYear();
  const m=hoje.getMonth()-nascDate.getMonth();
  if(m<0||(m===0&&hoje.getDate()<nascDate.getDate())) idade--;
  idadeEl.value=idade>0?idade+' anos':'—';
}

async function salvarEdicaoFicha(){
  const cpf=formatarCPF(document.getElementById('edit-aluno-cpf')?.value);
  const a=ALUNOS_DATA.find(x=>normalizarCPF(x.cpf)===normalizarCPF(cpf)); if(!a)return;
  a.nome   =document.getElementById('edit-aluno-nome')?.value.trim()||a.nome;
  a.turno  =document.getElementById('edit-aluno-turno')?.value||a.turno;
  a.nasc   =document.getElementById('edit-aluno-nasc')?.value||a.nasc;
  a.resp   =document.getElementById('edit-aluno-resp')?.value.trim()||a.resp;
  a.contato=document.getElementById('edit-aluno-contato')?.value.trim()||a.contato;
  a.email  =document.getElementById('edit-aluno-email')?.value.trim()||a.email;
  a.rota   =document.getElementById('edit-aluno-rota')?.value||a.rota;
  a.idade  =document.getElementById('edit-aluno-idade')?.value||a.idade;
  (a.historico=a.historico||[]).push({tipo:'mudanca',titulo:'Dados editados',desc:'Informações do cadastro atualizadas pelo administrador.',data:new Date().toLocaleDateString('pt-BR')});
  
  if (a.id) {
     let dataNasc = null;
     if (a.nasc && a.nasc.includes('/')) {
        const [d,m,y] = a.nasc.split('/');
        if(d&&m&&y) dataNasc = `${y}-${m}-${d}`;
     } else if (a.nasc && a.nasc.includes('-')) {
        dataNasc = a.nasc;
     }

     const { error } = await supabaseClient.from('alunos').update({
        nome: a.nome,
        data_nascimento: dataNasc,
        rota: a.rota,
        responsavel: a.resp,
        contato: a.contato,
        instagram: a.email
     }).eq('id', a.id);
     
     if (error) console.error("Erro editando ficha:", error);
  }

  closeModal('modal-editar-ficha');
  showToast('Dados atualizados com sucesso!','sucesso');
  verFicha(cpf); renderAlunos(); salvarDados();
}

// IMPORTAÇÃO
function carregarSheetJS(cb){
  if(window.XLSX){cb();return;}
  const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  s.onload=cb; document.head.appendChild(s);
}

function downloadModelo(){
  carregarSheetJS(()=>{
    const dados=[
      ['Nome Completo','CPF','Data de Nascimento','Idade','Turma','Turno','Responsável','Contato','Rota','Email Institucional'],
      ['Maria da Silva','111.222.333-44','15/03/2008','17 anos','1A','Manhã','José da Silva','(91) 99999-0001','Sem transporte','maria@escola.seduc.pa.gov.br'],
    ];
    const wb=XLSX.utils.book_new();
    const ws=XLSX.utils.aoa_to_sheet(dados);
    ws['!cols']=[{wch:30},{wch:18},{wch:18},{wch:10},{wch:10},{wch:10},{wch:25},{wch:20},{wch:25},{wch:35}];
    XLSX.utils.book_append_sheet(wb,ws,'Alunos');
    XLSX.writeFile(wb,'modelo_importacao_alunos.xlsx');
    showToast('Modelo baixado!','sucesso');
  });
}

function importarAlunos(){
  const input=document.getElementById('input-importar');
  const file=input?.files?.[0];
  if(!file){ showToast('Selecione um arquivo .xlsx','alerta'); return; }
  carregarSheetJS(()=>{
    const reader=new FileReader();
    reader.onload= async (e)=>{
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{defval:''});

        if(rows.length === 0){ showToast('Planilha vazia!','evasao'); return; }

        // Debug: mostra as colunas encontradas
        const colunas = Object.keys(rows[0]);
        console.log('[importarAlunos] Colunas encontradas:', colunas);
        console.log('[importarAlunos] Primeira linha:', rows[0]);

        // Função auxiliar: encontra a primeira chave que bata com o padrão
        const col = (r, ...patterns) => {
          const key = Object.keys(r).find(k => patterns.some(p => p.test(k)));
          return key ? r[key].toString().trim() : '';
        };

        // --- 1. Descobrir e criar Turmas Ausentes ---
        const turmasNoExcel = new Set();
        rows.forEach(r => {
           const t = col(r, /^turma$/i, /turma/i);
           if(t) turmasNoExcel.add(t.toUpperCase());
        });

        const novasTurmasDB = [];
        turmasNoExcel.forEach(tName => {
           if(tName && !TURMAS_DATA.find(t => t.code === tName)) {
               novasTurmasDB.push({ code: tName, serie: tName, turno: 'Manhã', professor: 'A Definir' });
           }
        });

        if (novasTurmasDB.length > 0) {
            showToast('Criando '+novasTurmasDB.length+' turma(s) nova(s)... aguarde', 'sucesso');
            const {error: eTurma} = await supabaseClient.from('turmas').upsert(novasTurmasDB, {onConflict:'code'});
            if(eTurma) console.error("Erro criando turmas:", eTurma);
            await carregarDados();
        }

        // --- 2. Preparar Alunos ---
        let count=0, erros=0;
        const novosAlunosDB = [];

        rows.forEach(r=>{
          const nome    = col(r, /nome.compl/i, /nome/i, /aluno/i);
          const cpf     = formatarCPF(col(r, /^cpf$/i, /matr/i, /registro/i, /cpf/i));
          const turma   = col(r, /^turma$/i, /turma/i).toUpperCase();
          const resp    = col(r, /respons/i, /pai|mae/i);
          const contato = col(r, /contato|fone|tel|cel|whats/i);
          const rota    = col(r, /rota/i) || 'Sem transporte';
          const email   = col(r, /email|e-mail/i);
          const nascStr = col(r, /nasc/i, /data.nasc/i);

          if(!nome || !cpf || !turma){
            console.log('[importarAlunos] Linha ignorada:', {nome, cpf, turma});
            erros++; return;
          }
          if(normalizarCPF(cpf).length !== 11){ erros++; return; }
          if(ALUNOS_DATA.find(a => normalizarCPF(a.cpf) === normalizarCPF(cpf))){erros++; return;}

          let turmaId = null;
          const tObj = TURMAS_DATA.find(t => t.code === turma);
          if (tObj) turmaId = tObj.id;

          let dataNasc = null;
          if (nascStr && nascStr.includes('/')) {
             const parts = nascStr.split('/');
             if(parts.length === 3) dataNasc = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          }

          novosAlunosDB.push({
             matricula: cpf, nome, turma_id: turmaId,
             rota, responsavel: resp, contato, instagram: email,
             data_nascimento: dataNasc || null, status: 'ativo'
          });
        });

        // --- Deduplicar por matricula (evita "ON CONFLICT row a second time") ---
        const seen = new Set();
        const alunosFinal = novosAlunosDB.filter(a => {
           if(seen.has(a.matricula)){ erros++; return false; }
           seen.add(a.matricula); return true;
        });

        console.log('[importarAlunos] Após deduplicação:', alunosFinal.length, '| Ignorados total:', erros);

        if (alunosFinal.length === 0) {
           showToast('Nenhum aluno válido encontrado! ('+erros+' ignorados) — Verifique as colunas da planilha.', 'evasao');
           return;
        }

        const { data, error } = await supabaseClient.from('alunos').upsert(alunosFinal, { onConflict: 'matricula' }).select();
        if (error) {
            console.error("[importarAlunos] Erro Supabase:", error);
            showToast('Erro banco: ' + error.message, 'evasao');
            return;
        }


        console.log('[importarAlunos] Sucesso:', data?.length, 'alunos.');
        await carregarDados();
        count = novosAlunosDB.length;
        showToast(count+' aluno(s) importado(s)!'+(erros?' ('+erros+' ignorados)':''),'sucesso');
        renderAlunos(); renderMetricasDash(); renderTurmasTable(); renderTurmaGrid();
        input.value='';
      }catch(err){
        console.error('[importarAlunos] Erro geral:', err);
        showToast('Erro ao ler arquivo: '+err.message,'evasao');
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function downloadModeloTurmas(){
  carregarSheetJS(()=>{
    // Modelo simples com colunas diretas
    const ws = XLSX.utils.json_to_sheet([
      { 'Codigo': 'EM-1A', 'Serie': '1º Ano - Ensino Médio', 'Turno': 'Manhã' },
      { 'Codigo': 'EM-2A', 'Serie': '2º Ano - Ensino Médio', 'Turno': 'Manhã' },
      { 'Codigo': 'EJA-1', 'Serie': 'EJA - 1ª Etapa', 'Turno': 'Noite' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Turmas");
    XLSX.writeFile(wb, "RVS_Modelo_Turmas.xlsx");
  });
}

function importarTurmas(){
  const input=document.getElementById('input-importar-turmas');
  const file=input?.files?.[0];
  if(!file){ showToast('Selecione um arquivo .xlsx','alerta'); return; }
  carregarSheetJS(()=>{
    const reader=new FileReader();
    reader.onload= async (e)=>{
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
        
        if(rows.length === 0){
           showToast('Planilha vazia ou sem dados!', 'evasao'); return;
        }

        // Debug: loga as colunas encontradas na planilha
        const colunas = Object.keys(rows[0]);
        console.log('[importarTurmas] Colunas encontradas:', colunas);
        console.log('[importarTurmas] Primeira linha:', rows[0]);

        let count=0, erros=0;
        const novasTurmasDB = [];

        rows.forEach(r=>{
          // Busca flexivel: procura qualquer coluna que contenha "cod" ou "turma" (case-insensitive)
          const codKey = Object.keys(r).find(k => /cod|code|turma/i.test(k));
          const serKey = Object.keys(r).find(k => /ser|ano|descri/i.test(k));
          const turKey = Object.keys(r).find(k => /turn/i.test(k));

          const code = (codKey ? r[codKey] : '').toString().trim().toUpperCase();
          const serie = (serKey ? r[serKey] : '').toString().trim();
          const turno = (turKey ? r[turKey] : '').toString().trim();

          if(!code){ erros++; return; }
          if(TURMAS_DATA.find(t=>t.code===code)){ erros++; return; }
          if(novasTurmasDB.find(t=>t.code===code)){ erros++; return; }

          novasTurmasDB.push({
             code: code,
             serie: serie || code,
             turno: turno || 'Manhã',
             professor: 'A Definir'
          });
          count++;
        });

        console.log('[importarTurmas] Para inserir:', novasTurmasDB);

        if(novasTurmasDB.length === 0){
           showToast('Nenhuma turma nova encontrada. ('+erros+' já existiam ou inválidas)', 'alerta');
           return;
        }

        const {data, error} = await supabaseClient.from('turmas').insert(novasTurmasDB).select();
        if(error){
           console.error('[importarTurmas] Erro Supabase:', error);
           showToast('Erro no banco: ' + error.message, 'evasao');
           return;
        }

        console.log('[importarTurmas] Inserido com sucesso:', data);
        await carregarDados();
        showToast(count+' turma(s) importada(s) com sucesso!', 'sucesso');
        atualizarSelectTurmas(); renderTurmaGrid(); renderTurmasTable(); renderMetricasDash();
        input.value='';
      }catch(err){
         console.error('[importarTurmas] Erro geral:', err);
         showToast('Erro ao ler arquivo: ' + err.message, 'evasao');
      }
    };
    reader.readAsArrayBuffer(file);
  });
}


// ─── CALENDÁRIO ───────────────────────────────────────────────────────────────
function calKey(y,m,d){ return`${y}-${m+1}-${d}`; }
function formatarDataKey(k){
  const [y,m,d]=k.split('-').map(Number);
  return`${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
}
function diasLetivosDisponiveis(){
  return Object.entries(CALENDARIO)
    .filter(([,ev])=>TIPO_LETIVO_FLAG[ev.tipo])
    .map(([k])=>({key:k,sort:`${k.split('-')[0]}-${String(k.split('-')[1]).padStart(2,'0')}-${String(k.split('-')[2]).padStart(2,'0')}`}))
    .sort((a,b)=>a.sort.localeCompare(b.sort))
    .map(x=>x.key);
}

function renderCalendar(){
  const c=document.getElementById('cal-days'); if(!c)return;
  document.getElementById('cal-month-title').textContent=`${MONTHS[calMonth]} ${calYear}`;
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const hoje=new Date();
  let html='';
  for(let i=0;i<firstDay;i++) html+='<div class="cal-day empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const key=calKey(calYear,calMonth,d);
    const ev=CALENDARIO[key];
    const isToday=calYear===hoje.getFullYear()&&calMonth===hoje.getMonth()&&d===hoje.getDate();
    const tipoCls=ev?'tipo-'+ev.tipo:'';
    const cls=['cal-day',tipoCls,isToday?'today':''].filter(Boolean).join(' ');
    const title=ev?(TIPO_LABEL[ev.tipo]+(ev.label?': '+ev.label:'')):'Clique para marcar letivo';
    html+=`<div class="${cls}" onclick="calClick('${key}')" ondblclick="calDblClick('${key}')" title="${title}">${d}</div>`;
  }
  c.innerHTML=html;
  renderEventosMes();
}

async function calClick(key){
  if(PERFIL_ATUAL!=='admin'){ showToast('Apenas o Administrador pode editar o calendário','evasao'); return; }

  if(CALENDARIO[key]?.tipo==='letivo'){
    // Desmarcar: deletar do Supabase se tiver ID
    if(CALENDARIO[key].id){
      await supabaseClient.from('eventos').delete().eq('id', CALENDARIO[key].id);
    }
    delete CALENDARIO[key];
    showToast('Dia desmarcado','alerta');
  } else if(!CALENDARIO[key]){
    // Marcar como Letivo: inserir no Supabase
    const [y,m,d] = key.split('-').map(Number);
    const dataISO = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const {data, error} = await supabaseClient.from('eventos').insert({
      titulo: 'Dia Letivo',
      tipo: 'letivo',
      data: dataISO,
      turno: 'Geral',
      responsavel: 'Dhenison Carlos'
    }).select().single();
    if(error){ console.error(error); showToast('Erro ao salvar no banco','evasao'); return; }
    CALENDARIO[key] = {id: data.id, tipo:'letivo', label:'Dia Letivo', turno:'Geral'};
    showToast('Dia marcado como Letivo ✅','sucesso');
  }
  renderCalendar(); renderFiltrosDiaFreq();
}

function calDblClick(key){
  if(PERFIL_ATUAL!=='admin'){ showToast('Apenas o Administrador pode editar o calendário','evasao'); return; }
  document.getElementById('modal-cal-key').value=key;
  const [y,m,d]=key.split('-').map(Number);
  document.getElementById('modal-cal-d').textContent=`Dia ${d} de ${MONTHS[m-1]} de ${y}`;
  // Pré-preenche se já tiver tipo
  if(CALENDARIO[key]){
    document.getElementById('input-cal-tipo').value=CALENDARIO[key].tipo||'letivo';
    document.getElementById('input-cal-turno').value=CALENDARIO[key].turno||'Geral';
    document.getElementById('input-cal-label').value=CALENDARIO[key].label||'';
    document.getElementById('input-cal-bimestre').value=CALENDARIO[key].bimestre||'1º Bimestre';
  }
  toggleBimestreSelect();
  openModal('modal-cal-tipo');
}

async function salvarTipoCal(){
  const key=document.getElementById('modal-cal-key').value;
  const tipo=document.getElementById('input-cal-tipo').value;
  const turno=document.getElementById('input-cal-turno').value;
  const label=document.getElementById('input-cal-label').value.trim();
  const bimestre=document.getElementById('input-cal-bimestre').value;
  const hIni=document.getElementById('input-cal-hini').value;
  const hFim=document.getElementById('input-cal-hfim').value;
  const labelFinal = tipo==='bimestre'||tipo==='fim_bimestre' ? bimestre : tipo==='evento' ? label : TIPO_LABEL[tipo];

  const [y,m,d] = key.split('-').map(Number);
  const dataISO = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  // Mapear tipos que não existem no constraint do banco
  // fim_bimestre → bimestre | ferias → feriado
  // O tipo real é guardado em observacoes com prefixo 'subtipo:'
  const tipoMap = { fim_bimestre: 'bimestre', ferias: 'feriado' };
  const tipoDB = tipoMap[tipo] || tipo;
  const obsReal = (tipoMap[tipo] ? `subtipo:${tipo}` : null);

  const payload = {
    titulo: labelFinal,
    tipo: tipoDB,
    data: dataISO,
    turno: turno,
    responsavel: 'Dhenison Carlos',
    observacoes: obsReal
  };

  let savedId = CALENDARIO[key]?.id || null;

  if(savedId){
    // Atualizar evento existente
    const {error} = await supabaseClient.from('eventos').update(payload).eq('id', savedId);
    if(error){ console.error(error); showToast('Erro ao atualizar: '+error.message,'evasao'); return; }
  } else {
    // Criar novo evento
    const {data, error} = await supabaseClient.from('eventos').insert(payload).select().single();
    if(error){ console.error(error); showToast('Erro ao salvar: '+error.message,'evasao'); return; }
    savedId = data.id;
  }

  CALENDARIO[key] = {id: savedId, tipo, turno, label: labelFinal, bimestre, hIni, hFim, responsavel: getCurrentUser()?.nome || 'Gestão'};
  closeModal('modal-cal-tipo');
  renderCalendar(); renderFiltrosDiaFreq();
  showToast('Calendário atualizado e salvo no banco!','sucesso');
}

function toggleBimestreSelect(){
  const tipo=document.getElementById('input-cal-tipo')?.value;
  // Mostrar o select de bimestre para Início E Fim de Bimestre
  document.getElementById('row-bimestre')?.classList.toggle('hidden', tipo!=='bimestre' && tipo!=='fim_bimestre');
  document.getElementById('row-evento-label')?.classList.toggle('hidden',tipo!=='evento');
  document.getElementById('row-horario')?.classList.toggle('hidden',tipo==='letivo'||tipo==='feriado'||tipo==='ferias'||tipo==='bimestre'||tipo==='fim_bimestre');
}

function renderEventosMes(){
  const sb=document.getElementById('cal-eventos-mes'); if(!sb)return;
  const eventos=Object.entries(CALENDARIO)
    .filter(([k])=>{ const[y,m]=k.split('-').map(Number); return y===calYear&&m===calMonth+1; })
    .sort(([a],[b])=>Number(a.split('-')[2])-Number(b.split('-')[2]));
  if(!eventos.length){sb.innerHTML=emptyState('📅','Sem eventos neste mês','Clique nos dias para marcar');return;}
  sb.innerHTML=eventos.map(([k,ev])=>{
    const d=String(k.split('-')[2]).padStart(2,'0');
    const m=String(calMonth+1).padStart(2,'0');
    return`<div class="event-item event-${ev.tipo}">
      <div class="event-title">${d}/${m} — ${ev.label||TIPO_LABEL[ev.tipo]}</div>
      <div class="event-desc">${ev.turno}${ev.hIni?' | '+ev.hIni+' às '+ev.hFim:''}${ev.responsavel?' | '+ev.responsavel:''}</div>
    </div>`;
  }).join('');
}

function changeMonth(dir){
  calMonth+=dir;
  if(calMonth>11){calMonth=0;calYear++;}
  if(calMonth<0){calMonth=11;calYear--;}
  renderCalendar();
}

function salvarAgendamento(){
  const titulo=document.getElementById('input-ag-titulo')?.value.trim();
  const data=document.getElementById('input-ag-data')?.value;
  const tipo=document.getElementById('input-ag-tipo')?.value;
  const turno=document.getElementById('input-ag-turno')?.value;
  const hIni=document.getElementById('input-ag-hini')?.value;
  const hFim=document.getElementById('input-ag-hfim')?.value;
  const obs=document.getElementById('input-ag-obs')?.value.trim();
  if(!titulo||!data){ showToast('Informe título e data','alerta'); return; }
  const [y,m,d]=data.split('-').map(Number);
  const key=`${y}-${m}-${d}`;
  if(!CALENDARIO[key]||!TIPO_LETIVO_FLAG[CALENDARIO[key].tipo]){
    showToast('Só é possível agendar em dias letivos já cadastrados','evasao'); return;
  }
  CALENDARIO[key].agendamento={titulo,tipo,turno,hIni,hFim,obs,responsavel: getCurrentUser()?.nome || 'Gestão'};
  closeModal('modal-event');
  showToast('Agendamento registrado! — '+titulo,'sucesso');
  renderCalendar(); salvarDados();
}

// ─── FREQUÊNCIA ───────────────────────────────────────────────────────────────
function renderFiltrosDiaFreq(){
  const sel=document.getElementById('sel-dia-freq'); if(!sel)return;
  const valAtual=sel.value;
  const dias=diasLetivosDisponiveis();
  if(!dias.length){
    sel.innerHTML='<option value="">— Cadastre dias letivos na Agenda —</option>';
    return;
  }
  sel.innerHTML='<option value="">Selecione o dia letivo</option>'+
    dias.map(k=>{
      const ev=CALENDARIO[k];
      const label=ev?.label||TIPO_LABEL[ev?.tipo]||'Letivo';
      return`<option value="${k}">${formatarDataKey(k)} — ${label}</option>`;
    }).join('');
  if(valAtual&&dias.includes(valAtual)) sel.value=valAtual;
}

async function carregarDadosFrequencia(turmaSel, diaSel) {
  turmaChamadaAtual = turmaSel;
  chamadaConsolidada.entrada = false;
  chamadaConsolidada.saida = false;
  chamadaDesbloqueadaTemporaria.entrada = false;
  chamadaDesbloqueadaTemporaria.saida = false;
  if (!turmaSel || !diaSel) return;
  const turmaObj = TURMAS_DATA.find(t=>t.code===turmaSel);
  if(!turmaObj) return;

  try {
    const {data: fq, error} = await supabaseClient.from('frequencia')
      .select('aluno_id, tipo, status, consolidado')
      .eq('turma_id', turmaObj.id)
      .eq('data', diaSel);

    if (error) throw error;

    const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaSel);

    if(fq && fq.length > 0) {
      fq.forEach(f => {
        const idx = alunos.findIndex(a => a.id === f.aluno_id);
        if(idx !== -1) {
          freq[f.tipo][idx] = f.status;
          if (f.consolidado) {
            chamadaConsolidada[f.tipo] = true;
          }
        }
      });
      const ent=document.getElementById('entrada-status');
      const sai=document.getElementById('saida-status');
      if(ent && chamadaConsolidada.entrada){ent.textContent='Consolidado';ent.className='chamada-status status-consolidado';}
      if(sai && chamadaConsolidada.saida){sai.textContent='Consolidado';sai.className='chamada-status status-consolidado';}
    }
  } catch (err) {
    console.error('Erro ao buscar frequencia:', err);
  }
}

async function carregarChamada(){
  // Força popular o select antes de ler o valor
  popularSelectTurmaFreq();

  const sel=document.getElementById('turma-select-freq');
  const turmaSel=sel?sel.value:'';
  const turnoSel=document.getElementById('sel-turno-freq')?.value||'';

  if(!TURMAS_DATA.length){
    showToast('Nenhuma turma cadastrada. Vá em Turmas e cadastre primeiro.','evasao'); return;
  }
  if(!turmaSel){
    showToast('Selecione uma turma para continuar','alerta'); return;
  }
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaSel);
  if(!alunos.length){
    showToast('Nenhum aluno nesta turma. Vá em Alunos e cadastre primeiro.','alerta'); return;
  }

  turmaChamadaAtual=turmaSel;
  const turmaObj=TURMAS_DATA.find(t=>t.code===turmaSel);

  // Reseta estado
  freq.entrada={}; freq.saida={};
  chamadaConsolidada.entrada=false; chamadaConsolidada.saida=false;

  // Títulos
  const titulo=document.getElementById('freq-titulo-turma');
  const sub=document.getElementById('freq-subtitulo');
  if(titulo) titulo.textContent=`Frequência — Turma ${turmaSel}`;
  if(sub) sub.textContent=`${turmaObj?.serie||''} — ${turmaObj?.turno||turnoSel||''}  •  ${alunos.length} alunos`;

  // Status badges
  const ent=document.getElementById('entrada-status');
  const sai=document.getElementById('saida-status');
  if(ent){ent.textContent='Pendente';ent.className='chamada-status status-pendente';}
  if(sai){sai.textContent='Pendente';sai.className='chamada-status status-pendente';}

  // Popula dias letivos
  renderFiltrosDiaFreq();

  const diaSel = document.getElementById('sel-dia-freq')?.value;
  if(diaSel) {
    await carregarDadosFrequencia(turmaChamadaAtual, diaSel);
  }

  // Mostra estado inicial das listas
  ['entrada','saida'].forEach(tipo=>{
    const cont=document.getElementById('chamada-'+tipo);
    if(cont) cont.innerHTML=msgVazia('📅','Selecione o dia letivo acima');
  });
  updateConsolidado();
  atualizarBloqueioSaida();

  // Troca etapas
  document.getElementById('freq-etapa1')?.classList.add('hidden');
  document.getElementById('freq-etapa2')?.classList.remove('hidden');
}

function voltarEtapa1(){
  document.getElementById('freq-etapa2')?.classList.add('hidden');
  document.getElementById('freq-etapa1')?.classList.remove('hidden');
  turmaChamadaAtual='';
  freq.entrada={}; freq.saida={};
  chamadaConsolidada.entrada=false; chamadaConsolidada.saida=false;
}

async function onDiaFreqChange(){
  freq.entrada={}; freq.saida={};
  chamadaConsolidada.entrada=false; chamadaConsolidada.saida=false;
  const ent=document.getElementById('entrada-status');
  const sai=document.getElementById('saida-status');
  if(ent){ent.textContent='Pendente';ent.className='chamada-status status-pendente';}
  if(sai){sai.textContent='Pendente';sai.className='chamada-status status-pendente';}

  const diaSel=document.getElementById('sel-dia-freq')?.value;
  if(diaSel) {
    await carregarDadosFrequencia(turmaChamadaAtual, diaSel);
  }

  renderChamada();
}

function renderChamada(){
  const diaSel=document.getElementById('sel-dia-freq')?.value;
  const badge=document.getElementById('badge-dia-freq');
  if(badge){
    if(diaSel&&CALENDARIO[diaSel]){
      const ev=CALENDARIO[diaSel];
      badge.textContent='📅 '+formatarDataKey(diaSel)+' — '+(ev.label||TIPO_LABEL[ev.tipo]||'Letivo');
      badge.style.display='inline-block';
    } else { badge.style.display='none'; }
  }
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual);
  ['entrada','saida'].forEach(tipo=>{
    const container=document.getElementById('chamada-'+tipo); if(!container)return;
    if(tipo==='saida'&&!chamadaConsolidada.entrada){
      container.innerHTML=`<div style="text-align:center;padding:40px 20px;color:var(--gray5)">
        <div style="font-size:36px;margin-bottom:10px">🔒</div>
        <div style="font-size:14px;font-weight:700;color:var(--gray6)">Saída bloqueada</div>
        <div style="font-size:12px;margin-top:6px;color:var(--gray4)">Consolide a <strong>Entrada</strong> primeiro</div>
      </div>`;
      atualizarBloqueioSaida(); return;
    }
    if(!diaSel){container.innerHTML=msgVazia('📅','Selecione o dia letivo acima');return;}
    if(!alunos.length){container.innerHTML=msgVazia('👥','Nenhum aluno nesta turma');return;}
    // Pré-marca P para todos
    alunos.forEach((_,i)=>{ if(!freq[tipo][i]) freq[tipo][i]='P'; });
    const consolidado=chamadaConsolidada[tipo];
    const temporario=chamadaDesbloqueadaTemporaria[tipo];
    const bgLista=consolidado && !temporario ? 'var(--green-light)' : 'var(--red-light)';
    const podeEditarFreq = !consolidado || temporario;
    
    // Controle de exibição dos botões Consolidar / Desbloquear
    const btnConsolidar = document.getElementById('btn-consolidar-' + tipo);
    const btnDesbloquear = document.getElementById('btn-desbloquear-' + tipo);
    if(btnConsolidar) btnConsolidar.style.display = (consolidado && !temporario) ? 'none' : 'inline-block';
    if(btnDesbloquear) btnDesbloquear.style.display = (consolidado && !temporario) ? 'inline-block' : 'none';

    container.innerHTML=alunos.map((al,i)=>{
      const cur=freq[tipo][i]||'P';
      const evasao=freq.entrada[i]==='P'&&freq.saida[i]==='F';
      const bg=evasao?'#ffe4e4':bgLista;
      const lockStyle=podeEditarFreq?'':'opacity:0.55;cursor:not-allowed;pointer-events:none';
      const lockTag=consolidado && !temporario?'<span style="font-size:10px;color:var(--gray5);margin-left:4px">🔒</span>':'';
      return`<div class="aluno-row" style="background:${bg};transition:background .35s">
        <span class="aluno-name">${i+1}. ${al.nome}${lockTag}</span>
        <div class="freq-btn-group" style="${lockStyle}">
          <button class="freq-btn P ${cur==='P'?'selected':''}" ${podeEditarFreq?`onclick="markFreq('${tipo}',${i},'P',this)"`:''}>P</button>
          <button class="freq-btn F ${cur==='F'?'selected':''}" ${podeEditarFreq?`onclick="markFreq('${tipo}',${i},'F',this)"`:''}>F</button>
          <button class="freq-btn FJ ${cur==='FJ'||cur==='FJ-Atestado'||cur==='FJ-Pais'||cur==='FJ-Coord'?'selected':''}" ${podeEditarFreq?`onclick="abrirModalFJ('${tipo}',${i},this)"`:''}>FJ</button>
        </div>
      </div>`;
    }).join('');
  });
  atualizarBloqueioSaida();
  updateConsolidado();
}

function msgVazia(icon,txt){
  return`<div style="text-align:center;padding:30px;color:var(--gray4)">
    <div style="font-size:32px">${icon}</div>
    <div style="font-size:13px;margin-top:8px;font-weight:600;color:var(--gray5)">${txt}</div>
  </div>`;
}

function atualizarBloqueioSaida(){
  const btn=document.getElementById('btn-consolidar-saida');
  if(!btn)return;
  const bloqueado=!chamadaConsolidada.entrada;
  btn.disabled=bloqueado;
  btn.style.opacity=bloqueado?'0.4':'1';
  btn.title=bloqueado?'Consolide a Entrada primeiro':'Consolidar Saída';
}

async function presencaTodos(tipo){
  if(tipo==='saida'&&!chamadaConsolidada.entrada){showToast('Consolide a Entrada primeiro','alerta');return;}
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual);
  if(!alunos.length){showToast('Nenhum aluno','alerta');return;}
  
  const dataFreq = document.getElementById('sel-dia-freq')?.value;
  if(!dataFreq) { showToast('Selecione o dia letivo','alerta'); return; }
  const turmaObj = TURMAS_DATA.find(t => t.code === turmaChamadaAtual);

  alunos.forEach((_,i)=>{ freq[tipo][i]='P'; });
  const container=document.getElementById('chamada-'+tipo);
  if(container){
    container.querySelectorAll('.aluno-row').forEach((row,i)=>{
      row.querySelectorAll('.freq-btn').forEach(b=>b.classList.remove('selected'));
      row.querySelector('.freq-btn.P')?.classList.add('selected');
      const evasao=freq.entrada[i]==='P'&&freq.saida[i]==='F';
      row.style.background=evasao?'#ffe4e4':chamadaConsolidada[tipo]?'var(--green-light)':'var(--red-light)';
    });
  }

  const payload = alunos.map(a => ({
    aluno_id: a.id,
    turma_id: turmaObj?.id || a.turma_id,
    data: dataFreq,
    tipo: tipo,
    status: 'P'
  }));
  await supabaseSalvar('frequencia', payload, 'aluno_id,data,tipo');

  showToast('Todos marcados como Presentes ✅','sucesso');
  updateConsolidado();
}

// Armazena referência ao botão FJ pendente
let fjBtnRef=null;

function abrirModalFJ(tipo,idx,btn){
  document.getElementById('fj-tipo-chamada').value=tipo;
  document.getElementById('fj-idx').value=idx;
  fjBtnRef=btn;
  openModal('modal-fj');
}

function confirmarFJ(fjTipo){
  const tipo=document.getElementById('fj-tipo-chamada').value;
  const idx=parseInt(document.getElementById('fj-idx').value);
  closeModal('modal-fj');
  if(fjBtnRef) markFreq(tipo,idx,fjTipo,fjBtnRef);
  fjBtnRef=null;
}

async function markFreq(tipo,idx,val,btn){
  freq[tipo][idx]=val;
  btn.closest('.aluno-row').querySelectorAll('.freq-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  if(val.startsWith('FJ')) btn.classList.add('FJ');
  const rowEl=btn.closest('.aluno-row');
  const evasao=freq.entrada[idx]==='P'&&freq.saida[idx]==='F';
  rowEl.style.background=evasao?'#ffe4e4':chamadaConsolidada[tipo]?'var(--green-light)':'var(--red-light)';
  
  let fjLabel=rowEl.querySelector('.fj-label');
  if(val.startsWith('FJ')){
    const labels={'FJ-Atestado':'🏥 Atestado','FJ-Pais':'👨‍👩‍👧 Pais','FJ-Coord':'🏫 Coordenação','FJ':'FJ'};
    if(!fjLabel){ fjLabel=document.createElement('span'); fjLabel.className='fj-label'; fjLabel.style.cssText='font-size:10.5px;color:var(--yellow-dark);font-weight:600;white-space:nowrap'; rowEl.insertBefore(fjLabel,rowEl.querySelector('.freq-btn-group')); }
    fjLabel.textContent=labels[val]||'FJ';
  } else if(fjLabel){ fjLabel.remove(); }
  
  const aluno=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual)[idx];
  
  // -- SYNC SUPABASE (offline-first) --
  if (aluno && aluno.id) {
    const dataFreq   = document.getElementById('sel-dia-freq')?.value
                       || new Date().toISOString().split('T')[0];
    const turmaObj   = TURMAS_DATA.find(t => t.code === turmaChamadaAtual);
    
    await supabaseSalvar('frequencia', {
      aluno_id:        aluno.id,
      turma_id:        turmaObj?.id || aluno.turma_id,
      data:            dataFreq,
      tipo:            tipo,      // 'entrada' ou 'saida'
      status:          val
    }, 'aluno_id,data,tipo');
  }

  if(evasao){
    showToast('⚠️ Evasão: '+(aluno?.nome||'Aluno'),'evasao');
    const agora = new Date();
    const novaOcorr = {
      id: Date.now(),
      tipo: 'evasao',
      icon: '🚨',
      aluno: aluno?.nome||'—',
      cpf: aluno?.cpf||'',
      turma: aluno?.turma||'',
      desc: 'Presente na entrada, ausente na saída — gerado automaticamente pela frequência',
      hora: agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
      data: agora.toLocaleDateString('pt-BR'),
      tratada: false,
      aguardandoPais: false,
      origem: 'frequencia',
      auto_gerada: true
    };
    OCORR_DATA.push(novaOcorr);
    // Adiciona ao histórico do aluno em memória
    if(aluno){
      (aluno.historico=aluno.historico||[]).unshift({
        tipo:'ocorrencia',
        titulo:'⚠️ Evasão detectada',
        desc:'Presente na entrada, ausente na saída — '+agora.toLocaleDateString('pt-BR'),
        data:agora.toLocaleDateString('pt-BR')
      });
    }
    // Persiste no Supabase
    if (aluno && aluno.id) {
      supabaseClient.from('ocorrencias').insert({
          tipo: 'evasao',
          aluno_id: aluno.id,
          turma_id: aluno.turma_id,
          descricao: novaOcorr.desc,
          auto_gerada: true
      }).then(({error}) => { if(error) console.error(error); });
    }
    renderDashOcorr(); renderOcorrencias(); salvarDados();
  }
  updateConsolidado();
}

async function consolidar(tipo){
  if(tipo==='saida'&&!chamadaConsolidada.entrada){showToast('Consolide a Entrada primeiro','alerta');return;}
  // Verifica se está consolidada e não está desbloqueada temporariamente
  if(chamadaConsolidada[tipo] && !chamadaDesbloqueadaTemporaria[tipo]){
    showToast('Frequência trancada. É necessário desbloquear primeiro.','alerta');
    return;
  }
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual);
  if(!alunos.length){showToast('Nenhum aluno para consolidar','alerta');return;}
  
  const dataFreq = document.getElementById('sel-dia-freq')?.value;
  if(!dataFreq) { showToast('Selecione o dia letivo','alerta'); return; }

  const turmaObj = TURMAS_DATA.find(t => t.code === turmaChamadaAtual);
  const payload = alunos.map((a, i) => ({
    aluno_id: a.id,
    turma_id: turmaObj?.id || a.turma_id,
    data: dataFreq,
    tipo: tipo,
    status: freq[tipo][i] || 'P',
    consolidado: true
  }));
  await supabaseSalvar('frequencia', payload, 'aluno_id,data,tipo');

  chamadaConsolidada[tipo]=true;
  chamadaDesbloqueadaTemporaria[tipo]=false; // Remove estado temporário
  const s=document.getElementById(tipo+'-status');
  if(s){s.textContent='Consolidado';s.className='chamada-status status-consolidado';}
  showToast('Chamada de '+tipo+' consolidada! ✅','sucesso');
  const container=document.getElementById('chamada-'+tipo);
  if(container){
    container.querySelectorAll('.aluno-row').forEach((row,i)=>{
      const evasao=freq.entrada[i]==='P'&&freq.saida[i]==='F';
      row.style.background=evasao?'#ffe4e4':'var(--green-light)';
    });
  }
  if(tipo==='entrada') renderChamada();
  atualizarBloqueioSaida();
  // Atualiza o Dashboard em tempo real após consolidação
  renderTurmasTable();
  renderMetricasDash();


}

function desbloquearFrequencia(tipo){
  const senhaMestra = 'RVS@gestor#2026';
  const digitada = prompt('Frequência trancada.\\nDigite a senha de Administrador para desbloquear:');
  if(digitada === senhaMestra){
    chamadaDesbloqueadaTemporaria[tipo] = true;
    showToast('Edição desbloqueada!', 'sucesso');
    renderChamada();
  } else if(digitada !== null) {
    showToast('Senha incorreta!', 'erro');
  }
}

function updateConsolidado(){
  const b=document.getElementById('consolidado-tbody'); if(!b)return;
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual);
  if(!alunos.length){b.innerHTML=emptyTr('👥','Selecione turma e dia','',5);return;}
  b.innerHTML=alunos.map((al,i)=>{
    const e=freq.entrada[i]||'—',s=freq.saida[i]||'—';
    let res='Aguardando',rc='',obs='';
    if(e!=='—'&&s!=='—'){
      if(e==='P'&&s==='P'){res='Presente';rc='badge-green';}
      else if(e==='P'&&s==='F'){res='Evasão';rc='badge-red';obs='⚠ Verificar';}
      else if(e==='F'||s==='F'){res='Falta';rc='badge-red';}
      else{res='F.Justificada';rc='badge-yellow';}
    }
    const eb=e==='P'?'badge-green':e==='F'?'badge-red':e==='FJ'?'badge-yellow':'';
    const sb=s==='P'?'badge-green':s==='F'?'badge-red':s==='FJ'?'badge-yellow':'';
    return`<tr>
      <td>${al.nome}</td>
      <td>${eb?`<span class="metric-badge ${eb}">${e}</span>`:e}</td>
      <td>${sb?`<span class="metric-badge ${sb}">${s}</span>`:s}</td>
      <td>${rc?`<span class="metric-badge ${rc}">${res}</span>`:res}</td>
      <td style="font-size:11.5px;color:var(--red)">${obs}</td>
    </tr>`;
  }).join('');
}

// ─── OCORRÊNCIAS ──────────────────────────────────────────────────────────────
function ocorrItemHTML(o){
  const cls=o.tratada?'tratada':o.aguardandoPais?'aguardando-pais':'nao-tratada';
  const label={evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso',liberado_coord:'Liberado pela Coord.',suspensao_celular:'Suspensão Uso Celular'}[o.tipo]||o.tipo;
  const clicavel=o.cpf?`onclick="verFicha('${o.cpf}')" style="cursor:pointer" title="Ver ficha de ${o.aluno}"`:
                 `onclick="showPage('ocorrencias',null)" style="cursor:pointer" title="Ver todas as ocorrências"`;
  return`<div class="ocorr-item ${cls}" ${clicavel}>
    <div class="ocorr-icon ocorr-${o.tipo}">${o.icon||'⚠️'}</div>
    <div class="ocorr-content">
      <h4>${label} — ${o.aluno}${o.turma?' ('+o.turma+')':''}</h4>
      <p>${o.desc}</p>
      ${o.aguardandoPais?'<span class="metric-badge badge-yellow" style="margin-top:4px">Aguardando pais</span>':''}
      ${o.origem==='frequencia'?'<span class="metric-badge badge-red" style="margin-top:4px">Originada na Frequência</span>':''}
    </div>
    <div class="ocorr-time">
      <div>${o.hora}</div><div style="margin-top:4px">${o.data||''}</div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;align-items:flex-end">
        ${!o.tratada?`<button class="btn btn-xs btn-outline" onclick="event.stopPropagation();abrirTratarOcorr('${o.id}')">Tratar</button>`
          :'<span style="color:var(--green-dark);font-size:11px;font-weight:600">✓ Tratada</span>'}
        <button class="btn btn-xs btn-outline" style="border-color:var(--blue);color:var(--blue)" onclick="event.stopPropagation();gerarPDFIndividual('${o.id}')">🖨️ PDF</button>
      </div>
    </div>
  </div>`;
}

function renderOcorrencias(){
  const c=document.getElementById('ocorr-list-full'); if(!c)return;
  const turnoF=document.getElementById('filtro-ocorr-turno')?.value||'';
  const diaF=document.getElementById('filtro-ocorr-dia')?.value||'';
  const statusF=document.getElementById('filtro-ocorr-status')?.value||'';
  const tipoF=document.getElementById('filtro-ocorr-tipo')?.value||'';
  let data=[...OCORR_DATA].reverse();
  if(turnoF){const als=ALUNOS_DATA.filter(a=>a.turno===turnoF).map(a=>a.nome);data=data.filter(o=>als.includes(o.aluno));}
  if(diaF) data=data.filter(o=>o.data===diaF);
  if(tipoF) data=data.filter(o=>o.tipo===tipoF);
  if(statusF==='tratada') data=data.filter(o=>o.tratada);
  if(statusF==='nao-tratada') data=data.filter(o=>!o.tratada);
  c.innerHTML=data.length?data.map(o=>ocorrItemHTML(o)).join(''):emptyState('✅','Nenhuma ocorrência','Sem registros');
}

async function saveOcorrencia(){
  const btn = document.querySelector('button[onclick="saveOcorrencia()"]');
  if (btn && btn.disabled) return; // Evita reentrada se já estiver salvando
  
  if (btn) { btn.disabled = true; btn.textContent = 'Gravando...'; }

  try {
    const tipo=document.getElementById('input-ocorr-tipo')?.value;
    const turma=document.getElementById('input-ocorr-turma')?.value;
    const desc=document.getElementById('input-ocorr-desc')?.value.trim();
    const comunicarPais=document.querySelector('input[name="comunicar-pais"]:checked')?.value==='sim';
    const icons={evasao:'🚨',indisciplina:'📵',bullying:'⚡',agressao:'👊',atraso:'⏰',liberado_coord:'🟢',suspensao_celular:'📵'};
    const alunoSel=document.getElementById('sel-aluno-principal')?.value;
    const nomes=[alunoSel,...envolvidos.map(e=>e.nome)].filter(Boolean).join(', ');
    const user = getCurrentUser();
    
    // Buscar aluno principal e turma no banco
    const alunoObj = ALUNOS_DATA.find(a => a.nome === alunoSel);
    const turmaObj = TURMAS_DATA.find(t => t.code === turma);
    
    let tipoDb = tipo;
    let prefixoOcorr = '';
    if (tipo === 'atraso') {
      tipoDb = 'indisciplina'; // Mapeia para uma categoria existente no banco
      prefixoOcorr = '[ATRASO] ';
    } else if (tipo === 'liberado_coord') {
      tipoDb = 'indisciplina';
      prefixoOcorr = '[LIBERADO] ';
    } else if (tipo === 'suspensao_celular') {
      tipoDb = 'indisciplina';
      prefixoOcorr = '[SUSP_CELULAR] ';
    }

    const descFinal = prefixoOcorr + desc + 
      (comunicarPais ? '\n[AGUARDANDO PAIS]' : '') + 
      '\nResponsável: ' + (user?.nome || 'Usuário');

    const payload = {
      tipo: tipoDb,
      aluno_id: alunoObj?.id || null,
      turma_id: turmaObj?.id || null,
      participante: nomes,
      descricao: descFinal,
      auto_gerada: false
    };
    
    const { data: insertedOcorr, error } = await supabaseClient.from('ocorrencias').insert(payload).select().single();
    
    if (error) throw error;


    
    // Atualiza cache local com os dados reais do banco
    const oData = new Date().toLocaleDateString('pt-BR');
    const oHora = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    OCORR_DATA.push({
      id: insertedOcorr?.id || Date.now(),
      tipo, icon: icons[tipo]||'⚠️', aluno: nomes||'—', turma,
      desc: descFinal, hora: oHora, data: oData,
      tratada: false, aguardandoPais: comunicarPais, origem: 'manual'
    });

    envolvidos=[];
    const el=document.getElementById('envolvidos-list-ocorr');
    if(el) el.innerHTML='';
    closeModal('modal-ocorr');
    showToast('Ocorrência registrada! ✅','sucesso');
    renderOcorrencias(); renderDashOcorr();
  } catch (error) {
    console.error('[saveOcorrencia] Erro:', error);
    showToast('Erro ao salvar ocorrência: ' + error.message, 'evasao');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Registrar Ocorrência'; }
  }
}

function abrirTratarOcorr(id){
  document.getElementById('modal-tratar-id').value=id;
  openModal('modal-tratar-ocorr');
}
async function salvarTratamento(manter){
  const id = document.getElementById('modal-tratar-id').value; // pode ser UUID string
  const just = document.getElementById('input-justificativa')?.value.trim();
  
  // Busca no cache local (id pode ser UUID ou Number)
  const o = OCORR_DATA.find(x => String(x.id) === String(id));
  if(!o) return;
  
  if(!manter){
    o.tratada = true;
    o.justificativa = just;
    
    // Anexa a tag [TRATADA] e a justificativa à descrição original
    const novaDesc = o.desc + '\n[TRATADA] ' + just;
    o.desc = novaDesc; // atualiza na memória
    
    // Persiste no Supabase
    const { error } = await supabaseClient
      .from('ocorrencias')
      .update({ descricao: novaDesc })
      .eq('id', id);
    
    if(error) {
      console.error('[salvarTratamento] Erro:', error);
      showToast('Aviso: tratamento salvo localmente, mas não sincronizado.', 'alerta');
    } else {
      showToast('Ocorrência tratada ✅','sucesso');
    }
  } else {
    showToast('Mantida sem tratamento','alerta');
  }
  closeModal('modal-tratar-ocorr');
  renderOcorrencias(); renderDashOcorr();
}

function filtrarHistoricoOcorr(status){
  const sel=document.getElementById('filtro-ocorr-status');
  if(sel) sel.value=status;
  renderOcorrencias();
}

function atualizarAlunosPorTurmaOcorr(){
  const turma=document.getElementById('input-ocorr-turma')?.value;
  const sel=document.getElementById('sel-aluno-principal');
  if(!sel)return;
  const alunos=turma ? ALUNOS_DATA.filter(a=> (a.turma||'').trim() === turma.trim()) : [];
  sel.innerHTML=['<option value="">Selecione o aluno principal</option>',...alunos.map(a=>`<option value="${a.nome}">${a.nome}</option>`)].join('');
}

function toggleProfIncluso(){
  const tipo=document.getElementById('input-ocorr-tipo')?.value;
  document.getElementById('row-prof-incluso')?.classList.toggle('hidden',tipo!=='indisciplina');
}
function toggleProfInclusoOcorr(){
  toggleProfIncluso();
}

function abrirAddEnvolvido(listId){
  document.getElementById('modal-env-lista-id').value=listId;
  const turma=document.getElementById('input-ocorr-turma')?.value;
  const sel=document.getElementById('sel-envolvido-aluno');
  const alunos=turma?ALUNOS_DATA.filter(a=>a.turma===turma):ALUNOS_DATA;
  if(sel) sel.innerHTML=['<option value="">Selecione...</option>',...alunos.map(a=>`<option value="${a.nome}">${a.nome}</option>`)].join('');
  openModal('modal-add-envolvido');
}
function confirmarEnvolvido(){
  const nome=document.getElementById('sel-envolvido-aluno')?.value;
  if(!nome){showToast('Selecione um aluno','alerta');return;}
  if(envolvidos.find(e=>e.nome===nome)){showToast('Já adicionado','alerta');return;}
  envolvidos.push({nome});
  const listId=document.getElementById('modal-env-lista-id')?.value;
  const ul=document.getElementById(listId);
  if(ul){
    const li=document.createElement('div'); li.className='envolvido-tag';
    li.innerHTML=`<span>👤 ${nome}</span><button onclick="removerEnvolvido('${nome}',this)">✕</button>`;
    ul.appendChild(li);
  }
  closeModal('modal-add-envolvido');
}
function removerEnvolvido(nome,btn){
  envolvidos=envolvidos.filter(e=>e.nome!==nome);
  btn.parentElement.remove();
}

// ─── TRANSPORTE ───────────────────────────────────────────────────────────────
// Frequência de transporte por rota
const freqTransp = {}; // cpf → {vinda, ida}
const transpConsolidado = {}; // rotaNome → {vinda:bool, ida:bool}

function popularDiasFiltroTransp(){
  const sel=document.getElementById('filtro-transp-dia'); if(!sel)return;
  const dias=diasLetivosDisponiveis();
  sel.innerHTML='<option value="">Selecione o dia letivo</option>'+
    dias.map(k=>`<option value="${k}">${formatarDataKey(k)} — ${(CALENDARIO[k]?.label||'Letivo')}</option>`).join('');
}

function renderTransporte(){
  const cont=document.getElementById('rotas-container'); if(!cont)return;
  const turnoF=document.getElementById('filtro-transp-turno')?.value||'';
  const rotaF=document.getElementById('filtro-transp-rota')?.value||'';
  const diaF=document.getElementById('filtro-transp-dia')?.value||'';

  // Atualiza select rota
  const sr=document.getElementById('filtro-transp-rota');
  if(sr){
    const cur=sr.value;
    sr.innerHTML='<option value="">Todas as rotas</option>'+ROTAS_DATA.map(r=>`<option value="${r.nome}">${r.nome}</option>`).join('');
    if(cur) sr.value=cur;
  }
  // Popula dias letivos
  popularDiasFiltroTransp();

  let rotas=ROTAS_DATA;
  if(rotaF) rotas=rotas.filter(r=>r.nome===rotaF);
  if(!rotas.length){cont.innerHTML=emptyState('🚌','Nenhuma rota cadastrada','Clique em "+ Nova Rota"');return;}

  cont.innerHTML=rotas.map(r=>{
    let alunos=ALUNOS_DATA.filter(a=>a.rota===r.nome);
    if(turnoF) alunos=alunos.filter(a=>a.turno===turnoF);
    const tc=transpConsolidado[r.nome]||{};
    const bgVinda=tc.vinda?'var(--green-light)':'var(--red-light)';
    const bgIda=tc.ida?'var(--green-light)':'var(--red-light)';
    const monitora=r.monitora||'—';
    const diaLabel=diaF?(' — '+formatarDataKey(diaF)):'';
    return`<div class="rota-card">
      <div class="rota-header">
        <div>
          <span class="rota-title">🚌 ${r.nome}${diaLabel}</span>
          <span style="font-size:12px;color:var(--gray5);margin-left:12px">${r.motorista||'—'} — ${r.veiculo||'—'}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="metric-badge badge-blue">${alunos.length} alunos</span>
          ${diaF?`<span class="metric-badge badge-gray" style="font-size:11px">👩‍🏫 Monitora: ${monitora}</span>`:''}
          <button class="btn btn-green btn-xs" onclick="consolidarTransp('${r.nome}','vinda')">✓ Consolidar Vinda</button>
          <button class="btn btn-green btn-xs" onclick="consolidarTransp('${r.nome}','ida')">✓ Consolidar Ida</button>
          <button class="btn btn-red btn-xs" onclick="excluirRota('${r.id||''}','${r.nome}')">🗑 Excluir Rota</button>
        </div>
      </div>
      ${diaF?`<div style="padding:6px 16px;background:var(--blue-light);font-size:12px;color:var(--blue-dark);font-weight:600">
        📅 Frequência do dia ${formatarDataKey(diaF)} | Responsável: ${monitora}
      </div>`:''}
      <div style="padding:12px 16px">
        ${!alunos.length?'<div style="text-align:center;padding:20px;color:var(--gray4);font-size:13px">Nenhum aluno nesta rota com os filtros selecionados</div>':
        `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
          ${alunos.map(a=>{
            if(!freqTransp[a.cpf]) freqTransp[a.cpf]={vinda:'P',ida:'P'};
            const ft=freqTransp[a.cpf];
            const evasaoTransp=ft.vinda==='P'&&ft.ida==='F';
            const bgAluno=evasaoTransp?'#ffe4e4':'var(--gray2)';
            return`<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:8px;background:${bgAluno};cursor:pointer" onclick="verFicha('${a.cpf}')" title="Ver ficha de ${a.nome}">
              <span style="font-size:12.5px;flex:1;font-weight:500">👤 ${a.nome}${evasaoTransp?' 🚨':''}</span>
              <span style="font-size:10px;font-weight:700;color:var(--blue-dark)">V</span>
              <div style="display:flex;gap:2px;background:${bgVinda};border-radius:5px;padding:1px">
                <button class="freq-btn P btn-xs ${ft.vinda==='P'?'selected':''}" onclick="event.stopPropagation();markFreqTransp('${a.cpf}','vinda','P',this,'${r.nome}')">P</button>
                <button class="freq-btn F btn-xs ${ft.vinda==='F'?'selected':''}" onclick="event.stopPropagation();markFreqTransp('${a.cpf}','vinda','F',this,'${r.nome}')">F</button>
              </div>
              <span style="font-size:10px;font-weight:700;color:var(--green-dark)">I</span>
              <div style="display:flex;gap:2px;background:${bgIda};border-radius:5px;padding:1px">
                <button class="freq-btn P btn-xs ${ft.ida==='P'?'selected':''}" onclick="event.stopPropagation();markFreqTransp('${a.cpf}','ida','P',this,'${r.nome}')">P</button>
                <button class="freq-btn F btn-xs ${ft.ida==='F'?'selected':''}" onclick="event.stopPropagation();markFreqTransp('${a.cpf}','ida','F',this,'${r.nome}')">F</button>
              </div>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>`;
  }).join('');
}

function markFreqTransp(cpf, tipo, val, btn, rotaNome){
  if(!freqTransp[cpf]) freqTransp[cpf]={vinda:'P',ida:'P'};
  freqTransp[cpf][tipo]=val;
  btn.closest('div[style*="display:flex;gap:2px"]').querySelectorAll('.freq-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');

  // Detecta evasão no transporte (Vinda P + Ida F)
  const ft=freqTransp[cpf];
  if(ft.vinda==='P' && ft.ida==='F'){
    const aluno=ALUNOS_DATA.find(a=>a.cpf===cpf);
    const diaF=document.getElementById('filtro-transp-dia')?.value||'';
    const rota=ROTAS_DATA.find(r=>r.nome===rotaNome);
    showToast('🚨 Evasão no Transporte: '+(aluno?.nome||'Aluno'),'evasao');
    const ocorrId=Date.now();
    OCORR_DATA.push({
      id:ocorrId, tipo:'evasao', icon:'🚌',
      aluno:aluno?.nome||'—', cpf, turma:aluno?.turma||'—',
      desc:`Evasão no transporte escolar — Rota: ${rotaNome}. Presente na Vinda, ausente na Ida. Monitora: ${rota?.monitora||'—'}`,
      hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
      data:diaF?formatarDataKey(diaF):new Date().toLocaleDateString('pt-BR'),
      tratada:false, aguardandoPais:false, origem:'transporte', rota:rotaNome
    });
    // Registra na ficha do aluno
    if(aluno){
      (aluno.historico=aluno.historico||[]).push({
        tipo:'ocorrencia', titulo:'Evasão no Transporte',
        desc:`Vinda: P — Ida: F — Rota: ${rotaNome}`,
        data:new Date().toLocaleDateString('pt-BR')
      });
    }
    if (aluno && aluno.id) {
      supabaseClient.from('ocorrencias').insert({
          tipo: 'evasao',
          aluno_id: aluno.id,
          turma_id: aluno.turma_id,
          descricao: `Evasão no transporte escolar — Rota: ${rotaNome}. Presente na Vinda, ausente na Ida. Monitora: ${rota?.monitora||'—'}`,
          hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
          data_ocorr: new Date().toISOString().split('T')[0],
          tratada: false,
          auto_gerada: true,
          origem: 'transporte'
      }).then(({error}) => { if(error) console.error('Erro transporte ocorr:', error); });
    }
    renderDashOcorr(); renderOcorrencias();
    // Atualiza fundo da linha
    const rowEl=btn.closest('[style*="border-radius:8px"]');
    if(rowEl) rowEl.style.background='#ffe4e4';
  } else {
    const rowEl=btn.closest('[style*="border-radius:8px"]');
    if(rowEl) rowEl.style.background='var(--gray2)';
  }
  renderTransporte();
}

function consolidarTransp(rotaNome, tipo){
  if(!transpConsolidado[rotaNome]) transpConsolidado[rotaNome]={};
  transpConsolidado[rotaNome][tipo]=true;
  showToast('Frequência de '+tipo+' consolidada — '+rotaNome+' ✅','sucesso');
  renderTransporte(); salvarDados();
}

function toggleSel(btn){
  btn.closest('div[style*="display:flex;gap:3px"]').querySelectorAll('.freq-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}

async function saveRota(){
  const nome=document.getElementById('input-rota-nome')?.value.trim();
  const motorista=document.getElementById('input-rota-motorista')?.value.trim();
  const veiculo=document.getElementById('input-rota-veiculo')?.value.trim();
  const monitora=document.getElementById('input-rota-monitora')?.value.trim();
  const emailMon=document.getElementById('input-rota-email-monitora')?.value.trim();
  const capacidade=parseInt(document.getElementById('input-rota-capacidade')?.value||'0',10);
  if(!nome){showToast('Informe o nome da rota','alerta');return;}
  const {data, error} = await supabaseClient.from('rotas').insert({
    nome, motorista, veiculo, capacidade, monitora, email_monitora: emailMon
  }).select().single();
  if(error){ showToast('Erro ao salvar rota: '+error.message,'evasao'); return; }
  ROTAS_DATA.push({id: data.id, nome, motorista, veiculo, monitora, emailMon, cap: capacidade});
  closeModal('modal-rota');
  // limpar campos
  ['input-rota-nome','input-rota-motorista','input-rota-veiculo','input-rota-monitora','input-rota-email-monitora','input-rota-capacidade']
    .forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  showToast('Rota '+nome+' criada!','sucesso');
  atualizarSelectTurmas();
  renderTransporte();
}

async function excluirRota(id, nome){
  if(!confirm('Excluir a rota "'+nome+'"? Esta ação é irreversível.')) return;
  const {error} = await supabaseClient.from('rotas').delete().eq('id', id);
  if(error){ showToast('Erro ao excluir: '+error.message,'evasao'); return; }
  ROTAS_DATA = ROTAS_DATA.filter(r => r.id !== id);
  showToast('Rota "'+nome+'" excluída!','alerta');
  atualizarSelectTurmas();
  renderTransporte();
}

// ─── LIVROS ───────────────────────────────────────────────────────────────────
function renderLivros(){
  const g=document.getElementById('livros-grid'); if(!g)return;
  const turnoF=document.getElementById('livros-filtro-turno')?.value||'';
  const turmaF=document.getElementById('livros-filtro-turma')?.value||'';

  // Calcula total de alunos filtrados para cada livro
  const alunosFiltrados=ALUNOS_DATA.filter(a=>{
    if(turnoF && a.turno!==turnoF) return false;
    if(turmaF && a.turma!==turmaF) return false;
    return true;
  });
  const totalAlunos=alunosFiltrados.length;

  g.innerHTML=LIVROS.map((l,li)=>{
    // Conta quantos alunos filtrados receberam este livro
    const entregues=alunosFiltrados.filter(a=>(a.livros||{})[li]==='sim').length;
    const pct=totalAlunos>0?Math.round(entregues/totalAlunos*100):0;
    const color=pct>=90?'var(--green)':pct>=70?'var(--yellow)':'var(--red)';
    return`<div class="livro-card" onclick="abrirLivroAlunos(${li},'${l.nome}')" style="cursor:pointer">
      <div class="livro-icon">${l.icon}</div>
      <div class="livro-name">${l.nome}</div>
      <div class="livro-bar"><div class="livro-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="livro-info">${entregues}/${totalAlunos} entregues — <strong>${pct}%</strong></div>
      <div style="font-size:11px;color:var(--blue-dark);margin-top:6px">▶ Ver lista de alunos</div>
    </div>`;
  }).join('');
}

let livroAtualIdx = -1;
function abrirLivroAlunos(liIdx, liNome){
  livroAtualIdx=liIdx;
  const turnoF=document.getElementById('livros-filtro-turno')?.value||'';
  const turmaF=document.getElementById('livros-filtro-turma')?.value||'';
  const alunos=ALUNOS_DATA.filter(a=>{
    if(turnoF && a.turno!==turnoF) return false;
    if(turmaF && a.turma!==turmaF) return false;
    return true;
  });
  document.getElementById('livros-alunos-titulo').textContent='📚 '+liNome+' — Lista de Alunos';
  const tbody=document.getElementById('livros-alunos-tbody');
  if(!tbody)return;
  if(!alunos.length){tbody.innerHTML=emptyTr('👥','Nenhum aluno com os filtros aplicados','',5);
  } else {
    tbody.innerHTML=alunos.map(a=>{
      const recebeu=(a.livros||{})[liIdx]==='sim';
      const dataEntrega=(a.livros||{})[liIdx+'_data']||'';
      return`<tr>
        <td><strong>${a.nome}</strong></td>
        <td><span class="metric-badge badge-blue">${a.turma}</span></td>
        <td>${a.turno}</td>
        <td>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" ${recebeu?'checked':''} onchange="toggleLivroAluno('${a.cpf}',${liIdx},this)"
              style="width:16px;height:16px;cursor:pointer">
            <span style="font-size:13px;color:${recebeu?'var(--green-dark)':'var(--gray4)'}">
              ${recebeu?'✓ Recebeu':'Não recebeu'}
            </span>
          </label>
        </td>
        <td style="font-size:12px;color:var(--gray5)">${dataEntrega}</td>
      </tr>`;
    }).join('');
  }
  document.getElementById('livros-grid').classList.add('hidden');
  document.getElementById('livros-alunos-section').classList.remove('hidden');
}

async function toggleLivroAluno(cpf, liIdx, checkbox){
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  if(!a.livros) a.livros={};
  const recebeu = checkbox.checked;
  const dataEntrega = recebeu ? new Date().toISOString().split('T')[0] : null;
  
  if(recebeu){
    a.livros[liIdx]='sim';
    a.livros[liIdx+'_data']=new Date().toLocaleDateString('pt-BR');
  } else {
    delete a.livros[liIdx];
    delete a.livros[liIdx+'_data'];
  }
  const span=checkbox.nextElementSibling;
  if(span){span.style.color=recebeu?'var(--green-dark)':'var(--gray4)';span.textContent=recebeu?'✓ Recebeu':'Não recebeu';}
  const td=checkbox.closest('td').nextElementSibling;
  if(td) td.textContent=recebeu?new Date().toLocaleDateString('pt-BR'):'';
  
  // Persiste no Supabase
  if (a.id) {
    const { error } = await supabaseClient.from('livros_alunos').upsert({
      aluno_id: a.id,
      livro_idx: parseInt(liIdx),
      recebeu: recebeu,
      data_entrega: dataEntrega
    }, { onConflict: 'aluno_id,livro_idx' });
    if(error) console.error('[toggleLivroAluno] Erro:', error);
  }
  renderLivros();
}

function fecharLivroAlunos(){
  document.getElementById('livros-grid').classList.remove('hidden');
  document.getElementById('livros-alunos-section').classList.remove('hidden');
  livroAtualIdx=-1;
}

// ─── CHAT RVS (Removido por solicitação) ───────────────────────────────────────
let chatSubscription = null;
let currentChatMessages = [];
function renderChatContacts() {}
function initChatRealtime() {}
async function carregarMensagensSegmento() {}
function renderChat(seg) {}
function setChatSegment(seg, tab) {}
function renderChatMsgsUI() {}
async function sendChatMsg() {}
function toggleAlertaFiltros() {}
async function popularAlunosAlerta() {}
async function enviarAlertaChat() {}

// ─── PERFIL DO USUÁRIO ────────────────────────────────────────────────────────
const DRIVE_FOTO_URL = 'https://script.google.com/macros/s/AKfycbxVz3gcJOntx68lHersXxdSqtIuBgmf36fawG3NAKToZxHAMOSFjtIewhV-3oGWC_k/exec';
let _perfilFotoPendente = null;
let _alunoFotoPendente = null;
let _alunoFotoOrigem = 'cadastro';
let _cameraStream = null; // guarda o stream ativo da webcam

// Abre o modal com a câmera (getUserMedia — funciona em desktop e celular)
async function abrirCameraPerfil() {
  const erroEl = document.getElementById('camera-perfil-erro');
  if (erroEl) erroEl.style.display = 'none';

  // Em celular, prefere câmera frontal; em desktop, abre a webcam
  const constraints = {
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false
  };

  try {
    _cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    const video = document.getElementById('camera-perfil-video');
    if (video) { video.srcObject = _cameraStream; }
    openModal('modal-camera-perfil');
  } catch (err) {
    console.error('[Camera] Erro:', err);
    // Se câmera negada/indisponível, cai para o seletor de arquivo
    if (err.name === 'NotAllowedError') {
      showToast('Permissão de câmera negada. Selecione da galeria.', 'alerta');
    } else if (err.name === 'NotFoundError') {
      showToast('Nenhuma câmera encontrada. Use "Da Galeria".', 'alerta');
    } else {
      // Fallback: abre o file picker com capture
      document.getElementById('perfil-foto-input')?.click();
    }
  }
}

// Fecha o modal e para o stream da câmera
function fecharCameraPerfil() {
  if (_cameraStream) {
    _cameraStream.getTracks().forEach(t => t.stop());
    _cameraStream = null;
  }
  const video = document.getElementById('camera-perfil-video');
  if (video) { video.srcObject = null; }
  closeModal('modal-camera-perfil');
}

// Captura o frame atual do vídeo e converte em File
function tirarFotoPerfil() {
  const video = document.getElementById('camera-perfil-video');
  const canvas = document.getElementById('camera-perfil-canvas');
  if (!video || !canvas) return;

  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  // Espelha horizontalmente (mais natural para selfie)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) { showToast('Erro ao capturar foto.', 'evasao'); return; }
    const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
    perfilSelecionarFoto({ files: [file] });
    fecharCameraPerfil();
  }, 'image/jpeg', 0.9);
}

function renderPerfil() {
  const user = getCurrentUser();
  if (!user) return;

  // Preencher campos
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
  set('perfil-nome', user.nome);
  set('perfil-email', user.email);
  set('perfil-cargo', user.perfil ? (user.perfil.charAt(0).toUpperCase() + user.perfil.slice(1)) : '');
  set('perfil-formacao', user.formacao);
  set('perfil-bio', user.bio);
  set('perfil-whatsapp', user.whatsapp);

  // Avatar: foto ou iniciais
  const iniciais = (user.nome || '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const iniciaisEl = document.getElementById('perfil-avatar-iniciais');
  const imgEl = document.getElementById('perfil-avatar-img');
  if (iniciaisEl) iniciaisEl.textContent = iniciais;

  if (user.foto_url && imgEl) {
    imgEl.src = user.foto_url;
    imgEl.style.display = 'block';
    if(iniciaisEl) iniciaisEl.style.display = 'none';
  } else {
    if(imgEl) imgEl.style.display = 'none';
    if(iniciaisEl) iniciaisEl.style.display = 'block';
  }

  // Atualiza sidebar também
  const sideAvatar = document.getElementById('sidebar-user-avatar');
  if (sideAvatar) {
    if (user.foto_url) {
      sideAvatar.innerHTML = `<img src="${user.foto_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt="${user.nome}">`;
    } else {
      sideAvatar.textContent = iniciais;
    }
  }
}

function perfilSelecionarFoto(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast('Foto muito grande! Máximo 5MB.', 'alerta');
    input.value = '';
    return;
  }
  _perfilFotoPendente = file;

  // Preview imediato
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgEl = document.getElementById('perfil-avatar-img');
    const iniciaisEl = document.getElementById('perfil-avatar-iniciais');
    if (imgEl) { imgEl.src = e.target.result; imgEl.style.display = 'block'; }
    if (iniciaisEl) iniciaisEl.style.display = 'none';
  };
  reader.readAsDataURL(file);

  const status = document.getElementById('perfil-foto-status');
  if (status) {
    status.style.display = 'block';
    status.style.color = 'var(--blue-dark)';
    status.textContent = '📎 Foto selecionada — clique em "Salvar Alterações" para enviar ao Drive.';
  }
}

async function localizarUsuarioPublicoPerfil(user) {
  const camposUsuario = 'id, nome, perfil, email, foto_url, formacao, bio, whatsapp, cargo, turno, ativo';

  const porId = await supabaseClient
    .from('usuarios')
    .select(camposUsuario)
    .eq('id', user.id)
    .maybeSingle();

  if (porId.error || porId.data) return porId;

  const emailNormalizado = (user.email || '').trim().toLowerCase();
  if (!emailNormalizado) return { data: null, error: null };

  return supabaseClient
    .from('usuarios')
    .select(camposUsuario)
    .ilike('email', emailNormalizado)
    .maybeSingle();
}

async function salvarPerfil() {
  const user = getCurrentUser();
  if (!user) { showToast('Sessão expirada. Faça login novamente.', 'alerta'); return; }

  const nome     = (document.getElementById('perfil-nome')?.value     || '').trim() || user.nome;
  const formacao = (document.getElementById('perfil-formacao')?.value || '').trim();
  const bio      = (document.getElementById('perfil-bio')?.value      || '').trim();
  const whatsapp = (document.getElementById('perfil-whatsapp')?.value || '').trim();

  if (!user.email) {
    showToast('Usuário sem e-mail na sessão. Faça logout e login novamente.', 'alerta');
    return;
  }

  const btn = document.querySelector('#page-perfil .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Salvando…'; }

  let fotoUrl = user.foto_url || null;

  // ── Upload da foto para o Google Drive (subpasta com nome da pessoa) ──
  if (_perfilFotoPendente) {
    const status = document.getElementById('perfil-foto-status');
    if (status) { status.style.color = 'var(--blue-dark)'; status.textContent = '⏳ Enviando foto ao Google Drive…'; }

    try {
      const base64 = await fileParaBase64(_perfilFotoPendente);
      const nomeSafe = nome.replace(/[^a-zA-Z0-9\u00C0-\u00FA\s]/g, '').trim();
      const ext = (_perfilFotoPendente.name || 'jpg').split('.').pop();

      const userEmail = (user.email || '').replace(/[^a-zA-Z0-9]/g, '_') || 'user';
      const filename = `perfis/${userEmail}_${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('fotos-sistema')
        .upload(filename, _perfilFotoPendente, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient.storage
        .from('fotos-sistema')
        .getPublicUrl(filename);

      fotoUrl = publicUrlData.publicUrl;
      
      // ── Corrige links do Google Drive para evitar bloqueio de imagem (CORS/Cookies) ──
      if(fotoUrl.includes('drive.google.com')){
        const match = fotoUrl.match(/id=([^&]+)/) || fotoUrl.match(/d\/([a-zA-Z0-9_-]+)/);
        if(match && match[1]){
          fotoUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
      }

      _perfilFotoPendente = null;
      if (status) { status.style.color = 'var(--green-dark)'; status.textContent = '✅ Foto salva no Google Drive!'; }

    } catch(err) {
      console.error('[Foto Perfil] Erro:', err);
      showToast('Erro ao enviar foto: ' + err.message, 'evasao');
      if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }
      return;
    }
  }

  // ── Salvar no banco usando update pelo ID ──
  const updateData = {
    nome,
    formacao,
    bio,
    whatsapp,
    foto_url: fotoUrl,
  };

  const { data: usuarioPublico, error: lookupError } = await localizarUsuarioPublicoPerfil(user);

  if (lookupError) {
    if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }
    console.error('[salvarPerfil] Erro ao localizar registro público:', lookupError);
    showToast('Erro ao localizar perfil público: ' + lookupError.message, 'evasao');
    return;
  }

  let savedUser = null;
  let dbError = null;

  if (usuarioPublico) {
    ({ data: savedUser, error: dbError } = await supabaseClient
      .from('usuarios')
      .update(updateData)
      .eq('id', usuarioPublico.id)
      .select('id, nome, perfil, email, foto_url, formacao, bio, whatsapp, cargo, turno')
      .maybeSingle());
  } else {
    ({ data: savedUser, error: dbError } = await supabaseClient
      .from('usuarios')
      .insert({
        id: user.id,
        email: user.email,
        nome,
        perfil: user.perfil || 'professor',
        cargo: user.cargo || '',
        turno: user.turno || '',
        ativo: true,
        ...updateData
      })
      .select('id, nome, perfil, email, foto_url, formacao, bio, whatsapp, cargo, turno')
      .maybeSingle());
  }

  if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }

  if (dbError) {
    console.error('[salvarPerfil] Erro no banco:', dbError);
    showToast('Erro ao salvar perfil: ' + dbError.message, 'evasao');
    return;
  }

  if (!savedUser) {
    console.error('[salvarPerfil] Nenhum registro público retornado após salvar.', { user });
    showToast('Perfil não foi sincronizado no cadastro geral. Tente sair e entrar novamente.', 'alerta');
    return;
  }

  // Atualiza sessão com dados devolvidos pelo banco (inclui id gerado)
  const userAtual = getCurrentUser();
  if (userAtual) {
    const merged = { ...userAtual, ...(savedUser || {}), nome, formacao, bio, whatsapp };
    if (fotoUrl) merged.foto_url = fotoUrl;
    try { sessionStorage.setItem('rvs_user', JSON.stringify(merged)); } catch(_){}
  }

  const idxUsuario = USUARIOS_DATA.findIndex(u =>
    u.id === savedUser.id || ((u.email || '').toLowerCase() === (savedUser.email || '').toLowerCase())
  );
  if (idxUsuario >= 0) USUARIOS_DATA[idxUsuario] = { ...USUARIOS_DATA[idxUsuario], ...savedUser };

  renderPerfil();
  updateSidebarProfile();
  showToast('Perfil atualizado! ✅', 'sucesso');
}

// ─── PERMISSÕES ───────────────────────────────────────────────────────────────
function renderPermissoes(){
  const b=document.getElementById('perm-tbody'); if(!b)return;
  
  b.innerHTML = PERMS.map((p, i) => {
    return `<tr>
      <td>
        <div style="font-weight:700;color:var(--gray7)">${p.func}</div>
        <div style="font-size:10px;color:var(--gray4)">${p.id}</div>
      </td>
      
      <!-- Coord -->
      <td style="text-align:center">
        <div style="display:flex;gap:10px;justify-content:center;align-items:center">
          <input type="checkbox" title="Ver" onchange="togglePermissao(${i}, 'coord')" ${p.coord?'checked':''}>
          <input type="checkbox" title="Editar" onchange="togglePermissao(${i}, 'editar_coord')" ${p.editar_coord?'checked':''}>
        </div>
      </td>
      
      <!-- Sec -->
      <td style="text-align:center">
        <div style="display:flex;gap:10px;justify-content:center;align-items:center">
          <input type="checkbox" title="Ver" onchange="togglePermissao(${i}, 'sec')" ${p.sec?'checked':''}>
          <input type="checkbox" title="Editar" onchange="togglePermissao(${i}, 'editar_sec')" ${p.editar_sec?'checked':''}>
        </div>
      </td>
      
      <!-- Prof -->
      <td style="text-align:center">
        <div style="display:flex;gap:10px;justify-content:center;align-items:center">
          <input type="checkbox" title="Ver" onchange="togglePermissao(${i}, 'prof')" ${p.prof?'checked':''}>
          <input type="checkbox" title="Editar" onchange="togglePermissao(${i}, 'editar_prof')" ${p.editar_prof?'checked':''}>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function togglePermissao(index, role) {
  PERMS[index][role] = !PERMS[index][role];
  renderPermissoes();
  aplicarPermissoesUI();

  const { error } = await supabaseClient
    .from('configuracoes')
    .upsert(buildConfigPayload('permissoes', PERMS), getConfigUpsertOptions());

  if (error) {
    console.error('[togglePermissao] Erro:', error);
    showToast('Erro ao salvar permissão: ' + error.message, 'alerta');
  } else {
    showToast('Permissões atualizadas!', 'sucesso');
  }
}

// ─── SISTEMA DE PERMISSÕES (reescrito v7) ──────────────────────────────────────

/**
 * Normaliza o string do perfil para comparação segura.
 * Converte 'Secretária', 'PROFESSOR', 'Coordenador' → lowercase sem acento.
 */
function normalizeRole(role) {
  if (!role) return '';
  return String(role).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Retorna a chave do PERMS (coord/sec/prof/admin) para o perfil do usuário.
 */
function getRoleKey(role) {
  const n = normalizeRole(role);
  if (n === 'admin') return 'admin';
  if (n === 'coordenador') return 'coord';
  if (n === 'secretaria' || n === 'secretario') return 'sec';
  if (n === 'professor') return 'prof';
  return 'prof'; // default seguro: acesso mínimo
}

/**
 * Verifica se o usuário atual pode VER uma página.
 */
function podeVer(pageId) {
  const user = getCurrentUser();
  if (!user) return false;
  const fullPageId = String(pageId || '').startsWith('page-') ? String(pageId) : `page-${pageId}`;
  if (fullPageId === 'page-perfil') return true;
  if (fullPageId === 'page-escolas') return isAdminGlobal(user);
  if (!isSchoolModuleEnabled(fullPageId, user)) return false;
  const rKey = getRoleKey(user.perfil);
  if (rKey === 'admin') return true;

  const perm = PERMS.find(p => p.id === fullPageId);
  if (!perm) return false;
  return !!perm[rKey];
}

/**
 * Verifica se o usuário atual pode EDITAR em uma página.
 */
function podeEditar(pageId) {
  const user = getCurrentUser();
  if (!user) return false;
  const fullPageId = String(pageId || '').startsWith('page-') ? String(pageId) : `page-${pageId}`;
  if (fullPageId === 'page-perfil') return true;
  if (fullPageId === 'page-escolas') return isAdminGlobal(user);
  if (!isSchoolModuleEnabled(fullPageId, user)) return false;
  const rKey = getRoleKey(user.perfil);
  if (rKey === 'admin') return true;

  const perm = PERMS.find(p => p.id === fullPageId);
  if (!perm) return false;
  return !!perm['editar_' + rKey];
}

/**
 * Aplica as permissões na UI: mostra/oculta itens do menu e redireciona se necessário.
 * DEVE ser chamado DEPOIS que PERMS foi carregado do banco.
 */
function aplicarPermissoesUI() {
  const user = getCurrentUser();
  if (!user) return;

  const rKey = getRoleKey(user.perfil);
  console.log(`[aplicarPermissoesUI] perfil="${user.perfil}" → rKey="${rKey}" | PERMS.length=${PERMS.length}`);

  const navItems = document.querySelectorAll('.nav-item[onclick]');
  let firstAllowedNav = null;
  let activePageIsAllowed = false;

  navItems.forEach(nav => {
    const match = nav.getAttribute('onclick').match(/showPage\(['"]([^'"]+)['"]/);
    if (!match) return;
    const pID = match[1];
    const fullPageId = 'page-' + pID;

    if (pID === 'perfil') {
      nav.style.display = '';
      return;
    }

    let isAllowed;
    if (pID === 'escolas') {
      isAllowed = isAdminGlobal(user);
    } else if (rKey === 'admin') {
      isAllowed = isSchoolModuleEnabled(fullPageId, user);
    } else {
      const perm = PERMS.find(p => p.id === fullPageId);
      isAllowed = !!(perm && perm[rKey] && isSchoolModuleEnabled(fullPageId, user));
    }

    nav.style.display = isAllowed ? '' : 'none';

    if (isAllowed) {
      const excludeAsLanding = ['chat', 'permissoes', 'usuarios', 'perfil'];
      if (!firstAllowedNav && !excludeAsLanding.includes(pID)) {
        firstAllowedNav = nav;
      }
      if (nav.classList.contains('active')) {
        activePageIsAllowed = true;
      }
    } else {
      // Garante que page oculta não fique active
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
      }
    }
  });

  // Se a página atual não é permitida → redireciona para a primeira permitida
  syncNavGroupVisibility();

  if (!activePageIsAllowed && firstAllowedNav) {
    console.log(`[aplicarPermissoesUI] Página ativa não permitida. Redirecionando para: ${firstAllowedNav.getAttribute('onclick')}`);
    firstAllowedNav.click();
  } else {
    syncOpenNavGroupsFromActive();
  }
}

// ─── CONSELHO DE CLASSE ───────────────────────────────────────────────────────
function parseBrDateToDate(value) {
  if (!value || !value.includes('/')) return null;
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function keyToDate(value) {
  if (!value || !value.includes('-')) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function dateToKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function normalizePeriodoTexto(value = '') {
  return String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getConselhoFilters() {
  const turmaCode = document.getElementById('conselho-turma-select')?.value || '';
  const turmaObj = TURMAS_DATA.find(t => t.code === turmaCode) || null;
  const anoInput = document.getElementById('conselho-ano');
  const periodoInput = document.getElementById('conselho-periodo');
  const dataInput = document.getElementById('conselho-data');
  const statusInput = document.getElementById('conselho-status');
  const analiseInput = document.getElementById('conselho-analise-filtro');
  return {
    ano: parseInt(anoInput?.value, 10) || new Date().getFullYear(),
    periodo: periodoInput?.value || '1º Bimestre',
    turmaCode,
    turmaObj,
    dataReuniao: dataInput?.value || '',
    status: statusInput?.value || 'Em preparação',
    analiseFiltro: analiseInput?.value || 'todos'
  };
}

function popularTurmasConselhoClasse() {
  const select = document.getElementById('conselho-turma-select');
  if (!select) return;
  const previous = select.value;
  select.innerHTML = '<option value="">Selecione a turma</option>' +
    TURMAS_DATA.map(t => `<option value="${t.code}">${t.code} — ${t.turno}</option>`).join('');
  if (previous && TURMAS_DATA.some(t => t.code === previous)) select.value = previous;
}

function getConselhoPeriodoRange(ano, periodo) {
  const normalized = normalizePeriodoTexto(periodo);
  const entries = Object.entries(CALENDARIO)
    .map(([key, ev]) => ({ key, ev }))
    .filter(item => item.ev)
    .sort((a, b) => keyToDate(a.key) - keyToDate(b.key));

  const samePeriodo = item =>
    normalizePeriodoTexto(item.ev?.bimestre || item.ev?.label || '') === normalized;

  const startEvent = entries.find(item => item.ev?.tipo === 'bimestre' && samePeriodo(item));
  const endEvent = entries.find(item => item.ev?.tipo === 'fim_bimestre' && samePeriodo(item));

  let startDate = startEvent ? keyToDate(startEvent.key) : null;
  let endDate = endEvent ? keyToDate(endEvent.key) : null;
  let warning = '';

  if (!startDate || !endDate) {
    const fallback = {
      '1º bimestre': [0, 2],
      '2º bimestre': [3, 5],
      '3º bimestre': [6, 8],
      '4º bimestre': [9, 11]
    }[normalized];

    if (fallback) {
      startDate = new Date(ano, fallback[0], 1);
      endDate = new Date(ano, fallback[1] + 1, 0);
      warning = 'Calendário sem início/fim de bimestre configurado. A frequência foi estimada por bloco mensal.';
    }
  }

  const dias = Object.entries(CALENDARIO)
    .filter(([, ev]) => ['letivo', 'prova', 'evento', 'bimestre'].includes(ev.tipo))
    .map(([key]) => key)
    .filter(key => {
      const date = keyToDate(key);
      if (!date) return false;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    })
    .sort((a, b) => keyToDate(a) - keyToDate(b));

  return { startDate, endDate, dias, warning };
}

function agruparNotasPorAlunoComponente(notas) {
  return notas.reduce((acc, nota) => {
    if (!acc[nota.aluno_id]) acc[nota.aluno_id] = {};
    const componente = canonicalizarComponenteCurricular(nota.componente);
    acc[nota.aluno_id][componente] = { ...nota, componente };
    return acc;
  }, {});
}

function calcularMediaAluno(componentes, mapaAluno) {
  const notas = componentes
    .map(comp => mapaAluno?.[comp]?.nota)
    .filter(nota => typeof nota === 'number' && !Number.isNaN(nota));

  if (!notas.length) return null;
  return Number((notas.reduce((sum, nota) => sum + nota, 0) / notas.length).toFixed(2));
}

function getComponentesAbaixoDaMedia(componentes, mapaAluno) {
  return componentes.filter(comp => {
    const nota = mapaAluno?.[comp]?.nota;
    return typeof nota === 'number' && nota < CONSELHO_MEDIA_MINIMA;
  });
}

function classificarSituacaoConselho({ mediaGeral, frequenciaPercentual, qtdAbaixo, qtdOcorrencias }) {
  if (mediaGeral == null) return 'Sem notas';
  if (mediaGeral < 5 || qtdAbaixo >= 3 || (frequenciaPercentual != null && frequenciaPercentual < 75) || qtdOcorrencias >= 4) return 'Crítico';
  if (mediaGeral < CONSELHO_MEDIA_MINIMA || qtdAbaixo >= 1 || (frequenciaPercentual != null && frequenciaPercentual < 85) || qtdOcorrencias >= 2) return 'Atenção';
  return 'Adequado';
}

function gerarObservacaoAutomaticaConselho({ mediaGeral, frequenciaPercentual, componentesAbaixo, qtdOcorrencias }) {
  if (mediaGeral == null) {
    return 'Sem notas estruturadas lançadas para este bimestre. Recomenda-se registrar os componentes antes do conselho.';
  }

  const partes = [];

  if (mediaGeral < 5) partes.push(`desempenho crítico com média geral ${mediaGeral.toFixed(1)}`);
  else if (mediaGeral < CONSELHO_MEDIA_MINIMA) partes.push(`média geral abaixo do esperado (${mediaGeral.toFixed(1)})`);
  else partes.push(`desempenho geral satisfatório (${mediaGeral.toFixed(1)})`);

  if (componentesAbaixo.length) {
    partes.push(`necessita atenção em ${componentesAbaixo.join(', ')}`);
  }

  if (frequenciaPercentual != null && frequenciaPercentual < 75) partes.push(`frequência crítica (${frequenciaPercentual.toFixed(0)}%)`);
  else if (frequenciaPercentual != null && frequenciaPercentual < 85) partes.push(`frequência em atenção (${frequenciaPercentual.toFixed(0)}%)`);

  if (qtdOcorrencias >= 3) partes.push(`recorrência disciplinar com ${qtdOcorrencias} ocorrência(s)`);
  else if (qtdOcorrencias > 0) partes.push(`${qtdOcorrencias} ocorrência(s) registrada(s) no período`);

  return partes.join('; ') + '.';
}

async function obterMapaFrequenciaConselho(turmaId, dias) {
  if (!turmaId || !dias.length) return {};

  const { data } = await fetchAllRows('frequencia', 'aluno_id, data, tipo, status, consolidado', q =>
    q.eq('turma_id', turmaId).eq('consolidado', true).in('data', dias)
  );

  const mapa = {};
  (data || []).forEach(item => {
    const [year, month, day] = String(item.data).split('-');
    const key = `${parseInt(year, 10)}-${parseInt(month, 10)}-${parseInt(day, 10)}`;
    if (!mapa[item.aluno_id]) mapa[item.aluno_id] = {};
    if (!mapa[item.aluno_id][key]) mapa[item.aluno_id][key] = {};
    mapa[item.aluno_id][key][item.tipo] = item.status;
  });
  return mapa;
}

function calcularFrequenciaAlunoConselho(alunoId, dias, mapaFrequencia) {
  if (!dias.length) {
    return { percentual: null, presencas: 0, faltas: 0, justificadas: 0 };
  }

  let presencas = 0;
  let faltas = 0;
  let justificadas = 0;

  dias.forEach(dia => {
    const entrada = mapaFrequencia[alunoId]?.[dia]?.entrada || null;
    const saida = mapaFrequencia[alunoId]?.[dia]?.saida || null;
    let status = '—';

    if (entrada || saida) {
      const evasao = entrada === 'P' && saida === 'F';
      if (entrada?.startsWith('FJ') || saida?.startsWith('FJ')) status = 'FJ';
      else if (entrada === 'F' || evasao) status = 'F';
      else if (entrada === 'P' && (saida === 'P' || saida === null)) status = 'P';
      else if (entrada === 'P') status = 'P';
    }

    if (status === 'P') presencas++;
    if (status === 'F') faltas++;
    if (status === 'FJ') justificadas++;
  });

  const percentual = Number(((presencas / dias.length) * 100).toFixed(1));
  return { percentual, presencas, faltas, justificadas };
}

function contarOcorrenciasConselho(alunoId, startDate, endDate) {
  return OCORR_DATA.filter(item => {
    if (String(item.aluno_id) !== String(alunoId)) return false;
    const data = parseBrDateToDate(item.data);
    if (!data) return false;
    if (startDate && data < startDate) return false;
    if (endDate && data > endDate) return false;
    return true;
  }).length;
}

function getSituacaoBadgeClass(situacao) {
  if (situacao === 'Crítico') return 'badge-red';
  if (situacao === 'Atenção' || situacao === 'Sem notas') return 'badge-yellow';
  return 'badge-green';
}

function getConselhoAtualSalvo(turmaId, ano, periodo) {
  return CONSELHOS_CLASSE_DATA.find(item =>
    String(item.turma_id) === String(turmaId) &&
    Number(item.ano) === Number(ano) &&
    item.periodo === periodo
  ) || null;
}

function getConselhoComponentesAtual(conselhoSalvo, notasTurma) {
  const componentesNotas = [...new Set((notasTurma || []).map(item => canonicalizarComponenteCurricular(item.componente)).filter(Boolean))];
  const componentesSalvos = Array.isArray(conselhoSalvo?.componentes)
    ? conselhoSalvo.componentes.map(item => canonicalizarComponenteCurricular(item)).filter(Boolean)
    : [];
  return [...new Set([...componentesSalvos, ...componentesNotas, ...CONSELHO_COMPONENTES_PADRAO])];
}

function updateConselhoLinhaField(index, field, value) {
  const row = conselhoClasseLinhas[index];
  if (!row) return;
  row[field] = value;
}

function gerarAtaConselhoClasse() {
  if (!conselhoClasseAtual || !conselhoClasseLinhas.length) {
    showToast('Carregue uma turma antes de gerar a ata.', 'alerta');
    return;
  }

  const criticos = conselhoClasseLinhas.filter(item => item.situacao === 'Crítico');
  const atencao = conselhoClasseLinhas.filter(item => item.situacao === 'Atenção' || item.situacao === 'Sem notas');
  const mediaTurma = conselhoClasseLinhas
    .map(item => item.mediaGeral)
    .filter(value => typeof value === 'number');
  const mediaConsolidada = mediaTurma.length
    ? (mediaTurma.reduce((sum, value) => sum + value, 0) / mediaTurma.length).toFixed(1)
    : 'sem notas';

  const texto = [
    `Ata prévia do Conselho de Classe - Turma ${conselhoClasseAtual.turmaCode} - ${conselhoClasseAtual.periodo}/${conselhoClasseAtual.ano}.`,
    `Reunião prevista para ${conselhoClasseAtual.dataReuniao ? new Date(conselhoClasseAtual.dataReuniao + 'T12:00:00').toLocaleDateString('pt-BR') : 'data não informada'}.`,
    `A turma possui ${conselhoClasseLinhas.length} aluno(s) analisado(s), com média geral consolidada de ${mediaConsolidada}.`,
    `${criticos.length} aluno(s) foram classificados em situação crítica e ${atencao.length} em situação de atenção.`,
    criticos.length ? `Alunos em situação crítica: ${criticos.map(item => item.nome).join(', ')}.` : 'Não houve alunos em situação crítica nesta consolidação.',
    atencao.length ? `Alunos em atenção: ${atencao.map(item => item.nome).join(', ')}.` : 'Não houve alunos em situação de atenção nesta consolidação.',
    'Deliberações: registrar pareceres individuais, definir encaminhamentos pedagógicos e pactuar devolutiva às famílias quando necessário.'
  ].join('\n');

  const textarea = document.getElementById('conselho-ata-texto');
  if (textarea) textarea.value = texto;
  if (conselhoClasseAtual) conselhoClasseAtual.ata_texto = texto;
  showToast('Ata preliminar gerada. Revise o texto antes de salvar.', 'sucesso');
}

function renderConselhoClasseIdentificacao({ turmaObj, ano, periodo, alunosTurma, componentes, notasTurma }) {
  const componentesNotas = [...new Set((notasTurma || []).map(item => canonicalizarComponenteCurricular(item.componente)).filter(Boolean))];
  const alunosComNotas = new Set((notasTurma || []).map(item => item.aluno_id).filter(Boolean));
  const origens = {};
  (notasTurma || []).forEach(item => {
    const chave = item.origem || 'manual';
    origens[chave] = (origens[chave] || 0) + 1;
  });

  const origemLabels = {
    manual: 'Lançamento manual',
    boletim_pdf_upload: 'Upload do boletim',
    boletim_pdf_manual: 'Mapeamento do boletim',
    boletim_compilado: 'Pacote compilado'
  };

  const fontesNotas = Object.entries(origens).length
    ? Object.entries(origens).map(([origem, total]) => `${origemLabels[origem] || origem}: ${total}`).join(' • ')
    : 'Nenhuma nota estruturada identificada ainda';

  const statusNotas = !notasTurma.length
    ? 'Nenhuma nota estruturada encontrada para esta turma e bimestre.'
    : alunosComNotas.size < alunosTurma.length
      ? `Análise parcial: ${alunosComNotas.size} de ${alunosTurma.length} aluno(s) já possuem notas.`
      : 'Análise pronta: todos os alunos da turma possuem notas estruturadas.';

  return `
    <div class="conselho-ident-grid">
      <div class="conselho-ident-card">
        <span>Turma identificada</span>
        <strong>${escapeHtml(turmaObj?.code || '—')}</strong>
        <small>${escapeHtml(turmaObj?.serie || '')} • ${escapeHtml(turmaObj?.turno || '')} • ${escapeHtml(periodo || '')}/${escapeHtml(String(ano || ''))}</small>
      </div>
      <div class="conselho-ident-card">
        <span>Alunos encontrados</span>
        <strong>${alunosTurma.length}</strong>
        <small>${alunosComNotas.size} com notas estruturadas para análise</small>
      </div>
      <div class="conselho-ident-card">
        <span>Disciplinas identificadas</span>
        <strong>${componentesNotas.length}</strong>
        <small>${escapeHtml(componentesNotas.join(', ') || 'Aguardando identificação pelas notas estruturadas')}</small>
      </div>
      <div class="conselho-ident-card">
        <span>Notas reconhecidas</span>
        <strong>${notasTurma.length}</strong>
        <small>${escapeHtml(fontesNotas)}</small>
      </div>
    </div>
    <div class="conselho-ident-status ${notasTurma.length ? (alunosComNotas.size < alunosTurma.length ? 'is-warning' : 'is-ready') : 'is-danger'}">
      ${escapeHtml(statusNotas)}
    </div>
  `;
}

function getConselhoAnaliseStatus(linha, totalComponentes) {
  const notasRegistradas = Object.values(linha?.notas || {}).filter(item => typeof item?.nota === 'number').length;
  if (!notasRegistradas) return 'sem_notas';
  if (totalComponentes > 0 && notasRegistradas < totalComponentes) return 'parcial';
  return 'completa';
}

function filtrarConselhoClasseLinhas(linhas, analiseFiltro, totalComponentes) {
  if (!analiseFiltro || analiseFiltro === 'todos') return linhas;
  return linhas.filter(linha => getConselhoAnaliseStatus(linha, totalComponentes) === analiseFiltro);
}

function renderConselhoClasseFiltroResumo(linhasFiltradas, totalLinhas, analiseFiltro) {
  const labels = {
    todos: 'Todos os alunos',
    sem_notas: 'Sem notas',
    parcial: 'Notas parciais',
    completa: 'Análise completa'
  };
  return `
    <div class="conselho-filter-summary">
      <strong>Filtro ativo:</strong> ${labels[analiseFiltro] || labels.todos} • exibindo ${linhasFiltradas.length} de ${totalLinhas} aluno(s)
    </div>
  `;
}

function renderConselhoClasseResumo(linhas, dias, periodoInfo) {
  const comNotas = linhas.filter(item => item.mediaGeral != null);
  const mediaTurma = comNotas.length
    ? (comNotas.reduce((sum, item) => sum + item.mediaGeral, 0) / comNotas.length).toFixed(1)
    : '—';
  const criticos = linhas.filter(item => item.situacao === 'Crítico').length;
  const atencao = linhas.filter(item => item.situacao === 'Atenção' || item.situacao === 'Sem notas').length;
  const baixaFreq = linhas.filter(item => item.frequenciaPercentual != null && item.frequenciaPercentual < 75).length;
  const comOcorr = linhas.filter(item => item.qtdOcorrencias > 0).length;

  return `
    <div class="conselho-meta">
      <div>
        <strong>Período analisado</strong>
        <span>${dias.length ? `${formatarDataKey(dias[0])} até ${formatarDataKey(dias[dias.length - 1])}` : 'Sem dias letivos configurados no calendário'}</span>
      </div>
      <div>
        <strong>Componentes considerados</strong>
        <span>${conselhoClasseAtual.componentes.join(', ')}</span>
      </div>
    </div>
    ${periodoInfo.warning ? `<div class="conselho-warning">${escapeHtml(periodoInfo.warning)}</div>` : ''}
    <div class="conselho-summary-grid">
      <div class="conselho-summary-card">
        <span>Total de alunos</span>
        <strong>${linhas.length}</strong>
        <small>Participantes da turma neste conselho</small>
      </div>
      <div class="conselho-summary-card">
        <span>Média da turma</span>
        <strong>${mediaTurma}</strong>
        <small>Calculada com as notas estruturadas</small>
      </div>
      <div class="conselho-summary-card is-warning">
        <span>Em atenção</span>
        <strong>${atencao}</strong>
        <small>Inclui sem notas lançadas</small>
      </div>
      <div class="conselho-summary-card is-danger">
        <span>Críticos</span>
        <strong>${criticos}</strong>
        <small>Demandam encaminhamento prioritário</small>
      </div>
      <div class="conselho-summary-card">
        <span>Baixa frequência</span>
        <strong>${baixaFreq}</strong>
        <small>Alunos abaixo de 75% no período</small>
      </div>
      <div class="conselho-summary-card">
        <span>Com ocorrências</span>
        <strong>${comOcorr}</strong>
        <small>Registros disciplinares no bimestre</small>
      </div>
    </div>
  `;
}

function renderConselhoClasseTabela(linhas) {
  const rows = linhas.map(item => {
    const sourceIndex = conselhoClasseLinhas.findIndex(row => String(row.aluno_id) === String(item.aluno_id));
    const notasHtml = conselhoClasseAtual.componentes.map(comp => {
      const nota = item.notas?.[comp]?.nota;
      return `<span class="conselho-chip ${typeof nota === 'number' && nota < CONSELHO_MEDIA_MINIMA ? 'is-danger' : ''}">${escapeHtml(comp)}: ${typeof nota === 'number' ? nota.toFixed(1) : '—'}</span>`;
    }).join('');

    return `
      <tr>
        <td>
          <div class="conselho-student-name">${escapeHtml(item.nome)}</div>
          <div class="conselho-student-meta">${escapeHtml(item.turma || '')} • ${escapeHtml(item.turno || '')}</div>
        </td>
        <td><span class="metric-badge badge-blue">${item.mediaGeral != null ? item.mediaGeral.toFixed(1) : '—'}</span></td>
        <td>${notasHtml}</td>
        <td><span class="metric-badge ${item.frequenciaPercentual == null ? 'badge-blue' : item.frequenciaPercentual < 75 ? 'badge-red' : item.frequenciaPercentual < 85 ? 'badge-yellow' : 'badge-green'}">${item.frequenciaPercentual == null ? '—' : `${item.frequenciaPercentual.toFixed(1)}%`}</span></td>
        <td style="text-align:center">${item.qtdOcorrencias}</td>
        <td>
          <select class="form-input form-select conselho-inline-select" onchange="updateConselhoLinhaField(${sourceIndex}, 'situacao', this.value)">
            ${['Adequado', 'Atenção', 'Crítico', 'Sem notas'].map(op =>
              `<option value="${op}" ${item.situacao === op ? 'selected' : ''}>${op}</option>`
            ).join('')}
          </select>
        </td>
        <td class="conselho-auto-text">${escapeHtml(item.observacaoAutomatica)}</td>
        <td><textarea class="form-input conselho-inline-textarea" oninput="updateConselhoLinhaField(${sourceIndex}, 'observacaoPedagogica', this.value)">${escapeHtml(item.observacaoPedagogica || '')}</textarea></td>
        <td>
          <select class="form-input form-select conselho-inline-select" onchange="updateConselhoLinhaField(${sourceIndex}, 'parecerFinal', this.value)">
            ${['', 'Manter acompanhamento', 'Reforço', 'Recuperação paralela', 'Contato com responsável', 'Encaminhar orientação', 'Sem encaminhamento'].map(op =>
              `<option value="${op}" ${item.parecerFinal === op ? 'selected' : ''}>${op || 'Selecione'}</option>`
            ).join('')}
          </select>
        </td>
        <td><textarea class="form-input conselho-inline-textarea" oninput="updateConselhoLinhaField(${sourceIndex}, 'encaminhamento', this.value)">${escapeHtml(item.encaminhamento || '')}</textarea></td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-card conselho-table-card">
      <div class="table-scroll">
        <table class="table conselho-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Média</th>
              <th>Notas por componente</th>
              <th>Frequência</th>
              <th>Ocorr.</th>
              <th>Situação</th>
              <th>Observação automática</th>
              <th>Observação pedagógica</th>
              <th>Parecer</th>
              <th>Encaminhamento</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderConselhoClassePage(forceReload = false) {
  const content = document.getElementById('conselho-classe-content');
  if (!content) return;

  popularTurmasConselhoClasse();

  if (!CONSELHO_SCHEMA_STATUS.ready) {
    content.innerHTML = `
      <div class="conselho-empty-card">
        <h3>Estrutura do Conselho ainda não ativada no banco</h3>
        <p>Execute a migração <code>supabase_migration_v24_conselho_classe.sql</code> para liberar notas estruturadas, ata do conselho e pareceres individuais.</p>
        <p>Tabelas pendentes: ${CONSELHO_SCHEMA_STATUS.missingTables.join(', ') || 'não identificadas'}.</p>
      </div>
    `;
    return;
  }

  const filters = getConselhoFilters();
  if (!filters.turmaObj) {
    content.innerHTML = `
      <div class="conselho-empty-card">
        <h3>Selecione a turma e o bimestre</h3>
        <p>O sistema vai cruzar notas estruturadas, frequência consolidada e ocorrências do período para montar o Conselho de Classe.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="conselho-empty-card">
      <h3>Preparando análise do conselho...</h3>
      <p>Consolidando notas, frequência e ocorrências do período selecionado.</p>
    </div>
  `;

  const alunosTurma = ALUNOS_DATA
    .filter(aluno => String(aluno.turma_id) === String(filters.turmaObj.id))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (!alunosTurma.length) {
    content.innerHTML = `
      <div class="conselho-empty-card">
        <h3>Sem alunos nesta turma</h3>
        <p>Cadastre ou vincule alunos à turma selecionada antes de preparar o Conselho de Classe.</p>
      </div>
    `;
    return;
  }

  const conselhoSalvo = getConselhoAtualSalvo(filters.turmaObj.id, filters.ano, filters.periodo);
  const notasTurma = NOTAS_BIMESTRAIS_DATA.filter(item =>
    String(item.turma_id) === String(filters.turmaObj.id) &&
    Number(item.ano) === Number(filters.ano) &&
    item.periodo === filters.periodo
  );
  const statusAtual = (filters.status && (filters.status !== 'Em preparação' || !conselhoSalvo?.status))
    ? filters.status
    : (conselhoSalvo?.status || 'Em preparação');
  const dataAtual = filters.dataReuniao || conselhoSalvo?.data_reuniao || '';

  const componentes = getConselhoComponentesAtual(conselhoSalvo, notasTurma);
  const periodoInfo = getConselhoPeriodoRange(filters.ano, filters.periodo);
  const mapaFrequencia = await obterMapaFrequenciaConselho(filters.turmaObj.id, periodoInfo.dias);
  const notasPorAluno = agruparNotasPorAlunoComponente(notasTurma);
  const registrosSalvos = conselhoSalvo
    ? CONSELHO_CLASSE_ALUNOS_DATA.filter(item => String(item.conselho_id) === String(conselhoSalvo.id))
    : [];
  const registrosMap = registrosSalvos.reduce((acc, item) => {
    acc[item.aluno_id] = item;
    return acc;
  }, {});

  conselhoClasseAtual = {
    id: conselhoSalvo?.id || null,
    turma_id: filters.turmaObj.id,
    turmaCode: filters.turmaCode,
    ano: filters.ano,
    periodo: filters.periodo,
    dataReuniao: dataAtual,
    status: statusAtual,
    componentes,
    ata_texto: conselhoSalvo?.ata_texto || '',
    forceReload
  };

  const dataInput = document.getElementById('conselho-data');
  if (dataInput && dataInput.value !== dataAtual) dataInput.value = dataAtual;
  const statusInput = document.getElementById('conselho-status');
  if (statusInput && statusInput.value !== statusAtual) statusInput.value = statusAtual;

  conselhoClasseLinhas = alunosTurma.map(aluno => {
    const notasAluno = notasPorAluno[aluno.id] || {};
    const mediaGeral = calcularMediaAluno(componentes, notasAluno);
    const componentesAbaixo = getComponentesAbaixoDaMedia(componentes, notasAluno);
    const frequencia = calcularFrequenciaAlunoConselho(aluno.id, periodoInfo.dias, mapaFrequencia);
    const qtdOcorrencias = contarOcorrenciasConselho(aluno.id, periodoInfo.startDate, periodoInfo.endDate);
    const registroSalvo = registrosMap[aluno.id] || {};

    const situacaoBase = classificarSituacaoConselho({
      mediaGeral,
      frequenciaPercentual: frequencia.percentual,
      qtdAbaixo: componentesAbaixo.length,
      qtdOcorrencias
    });

    return {
      aluno_id: aluno.id,
      nome: aluno.nome,
      turma: aluno.turma,
      turno: aluno.turno,
      notas: notasAluno,
      mediaGeral,
      frequenciaPercentual: frequencia.percentual,
      qtdComponentesAbaixoMedia: componentesAbaixo.length,
      qtdOcorrencias,
      componentesAbaixo,
      situacao: registroSalvo.situacao || situacaoBase,
      observacaoAutomatica: gerarObservacaoAutomaticaConselho({
        mediaGeral,
        frequenciaPercentual: frequencia.percentual,
        componentesAbaixo,
        qtdOcorrencias
      }),
      observacaoPedagogica: registroSalvo.observacao_pedagogica || '',
      parecerFinal: registroSalvo.parecer_final || '',
      encaminhamento: registroSalvo.encaminhamento || ''
    };
  });

  const linhasFiltradas = filtrarConselhoClasseLinhas(
    conselhoClasseLinhas,
    filters.analiseFiltro,
    conselhoClasseAtual.componentes.length
  );

  content.innerHTML = `
    ${renderConselhoClasseIdentificacao({
      turmaObj: filters.turmaObj,
      ano: filters.ano,
      periodo: filters.periodo,
      alunosTurma,
      componentes,
      notasTurma
    })}
    ${renderConselhoClasseFiltroResumo(linhasFiltradas, conselhoClasseLinhas.length, filters.analiseFiltro)}
    ${renderConselhoClasseResumo(linhasFiltradas, periodoInfo.dias, periodoInfo)}
    ${linhasFiltradas.length
      ? renderConselhoClasseTabela(linhasFiltradas)
      : `<div class="conselho-empty-card"><h3>Nenhum aluno neste filtro</h3><p>Altere o filtro da análise para visualizar outros grupos da turma neste bimestre.</p></div>`}
    <div class="table-card conselho-ata-card">
      <div class="section-header" style="margin-bottom:12px">
        <div class="section-title" style="font-size:18px">Ata e Resumo do Conselho</div>
        <button class="btn btn-outline btn-sm" onclick="gerarAtaConselhoClasse()">Gerar Texto Base</button>
      </div>
      <textarea id="conselho-ata-texto" class="form-input conselho-ata-textarea" placeholder="Registre aqui a síntese do conselho, os principais pontos discutidos e os encaminhamentos gerais.">${escapeHtml(conselhoClasseAtual.ata_texto || '')}</textarea>
    </div>
  `;
}

async function saveConselhoClasseCabecalho(silent = false) {
  if (!CONSELHO_SCHEMA_STATUS.ready) {
    if (!silent) showToast('Execute a migração do Conselho de Classe no banco antes de salvar.', 'alerta');
    return null;
  }

  const filters = getConselhoFilters();
  if (!filters.turmaObj) {
    if (!silent) showToast('Selecione uma turma antes de salvar o conselho.', 'alerta');
    return null;
  }

  if (!conselhoClasseAtual) {
    await renderConselhoClassePage(true);
  }

  const ataTexto = document.getElementById('conselho-ata-texto')?.value || conselhoClasseAtual?.ata_texto || '';
  const payload = {
    turma_id: filters.turmaObj.id,
    ano: filters.ano,
    periodo: filters.periodo,
    data_reuniao: filters.dataReuniao || null,
    status: filters.status || 'Em preparação',
    componentes: (conselhoClasseAtual?.componentes || CONSELHO_COMPONENTES_PADRAO).map(item => canonicalizarComponenteCurricular(item)),
    ata_texto: ataTexto,
    criado_por: getCurrentUser()?.nome || 'Sistema'
  };

  const { data, error } = await supabaseClient
    .from('conselhos_classe')
    .upsert(payload, { onConflict: 'turma_id,ano,periodo' })
    .select()
    .single();

  if (error) {
    console.error('[saveConselhoClasseCabecalho] Erro:', error);
    if (!silent) showToast('Erro ao salvar o cabeçalho do conselho: ' + error.message, 'erro');
    return null;
  }

  const normalized = {
    id: data.id,
    turma_id: data.turma_id,
    ano: data.ano,
    periodo: data.periodo,
    data_reuniao: data.data_reuniao || '',
    status: data.status || 'Em preparação',
    componentes: Array.isArray(data.componentes) ? data.componentes : [],
    ata_texto: data.ata_texto || '',
    criado_por: data.criado_por || ''
  };

  conselhoClasseAtual.id = normalized.id;
  conselhoClasseAtual.ata_texto = normalized.ata_texto;

  const idx = CONSELHOS_CLASSE_DATA.findIndex(item => item.id === normalized.id);
  if (idx >= 0) CONSELHOS_CLASSE_DATA[idx] = { ...CONSELHOS_CLASSE_DATA[idx], ...normalized };
  else CONSELHOS_CLASSE_DATA.push(normalized);

  if (!silent) showToast('Cabeçalho do conselho salvo.', 'sucesso');
  return normalized;
}

async function salvarConselhoClasse() {
  if (!conselhoClasseLinhas.length) {
    showToast('Carregue uma turma antes de salvar.', 'alerta');
    return;
  }

  const cabecalho = await saveConselhoClasseCabecalho(true);
  if (!cabecalho?.id) return;

  const payload = conselhoClasseLinhas.map(item => ({
    conselho_id: cabecalho.id,
    aluno_id: item.aluno_id,
    media_geral: item.mediaGeral,
    frequencia_percentual: item.frequenciaPercentual,
    qtd_componentes_abaixo_media: item.qtdComponentesAbaixoMedia,
    qtd_ocorrencias: item.qtdOcorrencias,
    situacao: item.situacao,
    observacao_automatica: item.observacaoAutomatica,
    observacao_pedagogica: item.observacaoPedagogica || '',
    parecer_final: item.parecerFinal || '',
    encaminhamento: item.encaminhamento || ''
  }));

  const { data, error } = await supabaseClient
    .from('conselho_classe_alunos')
    .upsert(payload, { onConflict: 'conselho_id,aluno_id' })
    .select();

  if (error) {
    console.error('[salvarConselhoClasse] Erro:', error);
    showToast('Erro ao salvar os pareceres do conselho: ' + error.message, 'erro');
    return;
  }

  if (Array.isArray(data)) {
    data.forEach(item => {
      const normalized = {
        id: item.id,
        conselho_id: item.conselho_id,
        aluno_id: item.aluno_id,
        media_geral: item.media_geral == null ? null : Number(item.media_geral),
        frequencia_percentual: item.frequencia_percentual == null ? null : Number(item.frequencia_percentual),
        qtd_componentes_abaixo_media: Number(item.qtd_componentes_abaixo_media || 0),
        qtd_ocorrencias: Number(item.qtd_ocorrencias || 0),
        situacao: item.situacao || '',
        observacao_automatica: item.observacao_automatica || '',
        observacao_pedagogica: item.observacao_pedagogica || '',
        parecer_final: item.parecer_final || '',
        encaminhamento: item.encaminhamento || ''
      };
      const idx = CONSELHO_CLASSE_ALUNOS_DATA.findIndex(row => row.id === normalized.id);
      if (idx >= 0) CONSELHO_CLASSE_ALUNOS_DATA[idx] = { ...CONSELHO_CLASSE_ALUNOS_DATA[idx], ...normalized };
      else CONSELHO_CLASSE_ALUNOS_DATA.push(normalized);
    });
  }

  showToast('Conselho de Classe salvo com sucesso!', 'sucesso');
}

function fecharConselhoNotasModal() {
  document.getElementById('conselho-notas-modal')?.remove();
}

function renderConselhoNotasGrid(componentes) {
  const grid = document.getElementById('conselho-notas-grid');
  if (!grid) return;

  const head = componentes.map(comp => `<th>${escapeHtml(comp)}</th>`).join('');
  const body = conselhoClasseLinhas.map(item => `
    <tr>
      <td>${escapeHtml(item.nome)}</td>
      ${componentes.map(comp => {
        const nota = item.notas?.[comp]?.nota;
        return `
          <td>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              class="form-input conselho-nota-input"
              data-aluno="${item.aluno_id}"
              data-componente="${escapeHtml(comp)}"
              value="${typeof nota === 'number' ? nota : ''}"
            >
          </td>
        `;
      }).join('')}
    </tr>
  `).join('');

  grid.innerHTML = `
    <div class="table-scroll">
      <table class="table conselho-table">
        <thead>
          <tr>
            <th>Aluno</th>
            ${head}
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function atualizarGradeConselhoNotas() {
  const input = document.getElementById('conselho-componentes-input');
  if (!input) return;
  const componentes = input.value.split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (!componentes.length) {
    showToast('Informe ao menos um componente curricular.', 'alerta');
    return;
  }

  conselhoClasseAtual.componentes = [...new Set(componentes.map(item => canonicalizarComponenteCurricular(item)).filter(Boolean))];
  renderConselhoNotasGrid(conselhoClasseAtual.componentes);
}

async function abrirModalNotasConselho() {
  if (!CONSELHO_SCHEMA_STATUS.ready) {
    showToast('Execute a migração do Conselho de Classe no banco antes de lançar notas.', 'alerta');
    return;
  }

  if (!conselhoClasseLinhas.length) {
    const filters = getConselhoFilters();
    if (!filters.turmaObj) {
      showToast('Selecione uma turma antes de lançar notas.', 'alerta');
      return;
    }
    await renderConselhoClassePage(true);
    if (!conselhoClasseLinhas.length) return;
  }

  fecharConselhoNotasModal();

  const modal = document.createElement('div');
  modal.id = 'conselho-notas-modal';
  modal.className = 'modal-overlay open';
  modal.innerHTML = `
    <div class="modal modal-lg conselho-modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div>
          <div class="modal-title">Notas Estruturadas do Bimestre</div>
          <p class="conselho-modal-subtitle">Defina os componentes e registre as notas para alimentar a análise automática do Conselho de Classe.</p>
        </div>
        <button class="modal-close" type="button" onclick="fecharConselhoNotasModal()">×</button>
      </div>
      <div class="form-group">
        <label class="form-label">Componentes curriculares</label>
        <div class="conselho-componentes-row">
          <input id="conselho-componentes-input" class="form-input" value="${escapeHtml(conselhoClasseAtual.componentes.join(', '))}">
          <button class="btn btn-outline btn-sm" type="button" onclick="atualizarGradeConselhoNotas()">Atualizar grade</button>
        </div>
      </div>
      <div id="conselho-notas-grid"></div>
      <div class="modal-footer">
        <button class="btn btn-outline" type="button" onclick="fecharConselhoNotasModal()">Cancelar</button>
        <button class="btn btn-primary" type="button" onclick="salvarNotasConselho()">Salvar notas</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', fecharConselhoNotasModal);
  document.body.appendChild(modal);

  renderConselhoNotasGrid(conselhoClasseAtual.componentes);
}

async function salvarNotasConselho() {
  if (!conselhoClasseAtual?.turma_id) {
    showToast('Carregue o conselho antes de salvar as notas.', 'alerta');
    return;
  }

  const componentes = (document.getElementById('conselho-componentes-input')?.value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  if (!componentes.length) {
    showToast('Informe ao menos um componente curricular.', 'alerta');
    return;
  }

  conselhoClasseAtual.componentes = [...new Set(componentes.map(item => canonicalizarComponenteCurricular(item)).filter(Boolean))];
  const inputs = [...document.querySelectorAll('#conselho-notas-grid input[data-aluno][data-componente]')];

  const payload = inputs
    .filter(input => input.value !== '')
    .map(input => ({
      aluno_id: input.dataset.aluno,
      turma_id: conselhoClasseAtual.turma_id,
      ano: conselhoClasseAtual.ano,
      periodo: conselhoClasseAtual.periodo,
      componente: canonicalizarComponenteCurricular(input.dataset.componente),
      nota: Number(String(input.value).replace(',', '.')),
      origem: 'manual'
    }));

  if (!payload.length) {
    showToast('Preencha pelo menos uma nota para salvar.', 'alerta');
    return;
  }

  const { data, error } = await supabaseClient
    .from('notas_bimestrais')
    .upsert(payload, { onConflict: 'aluno_id,ano,periodo,componente' })
    .select();

  if (error) {
    console.error('[salvarNotasConselho] Erro:', error);
    showToast('Erro ao salvar notas estruturadas: ' + error.message, 'erro');
    return;
  }

  mergeNotasBimestraisCache(data || []);

  await saveConselhoClasseCabecalho(true);
  fecharConselhoNotasModal();
  await renderConselhoClassePage(true);
  showToast('Notas estruturadas salvas com sucesso!', 'sucesso');
}

function prepararConselhoClasse() {
  renderConselhoClassePage(true);
}

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
let relDadosCache = {};

function setRelTab(tab, el){
  document.querySelectorAll('#page-relatorios .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  ['freq','transp','ocorr','livros'].forEach(t=>{
    document.getElementById('rel-'+t)?.classList.toggle('hidden', t!==tab);
  });
  // Popula selects ao abrir aba
  if(tab==='freq'||tab==='livros') filtrarTurmasRel(tab);
  if(tab==='transp'){
    const sr=document.getElementById('rel-transp-rota');
    if(sr){ sr.innerHTML='<option value="">Todas as rotas</option>'+ROTAS_DATA.map(r=>`<option value="${r.nome}">${r.nome}</option>`).join(''); }
  }
}

function filtrarTurmasRel(tipo){
  const turno=document.getElementById('rel-'+tipo+'-turno')?.value||'';
  const sel=document.getElementById('rel-'+tipo+'-turma');
  if(!sel)return;
  const turnoNorm=normalizeTurno(turno);
  const turmas=turnoNorm?TURMAS_DATA.filter(t=>normalizeTurno(t.turno)===turnoNorm):TURMAS_DATA;
  const base=tipo==='livros'?'<option value="">Todas as turmas</option>':'<option value="">Selecione a turma</option>';
  sel.innerHTML=base+turmas.map(t=>`<option value="${t.code}">${t.code} — ${t.turno}</option>`).join('');
}

function getDiasLetivos(periodo, prefixo){
  const diasLetivos=Object.entries(CALENDARIO)
    .filter(([,ev])=>['letivo','prova','evento','bimestre'].includes(ev.tipo))
    .map(([k])=>k).sort();
  const hoje=new Date();
  if(periodo==='data' && prefixo){
    const unica=document.getElementById('rel-'+prefixo+'-data-especifica')?.value;
    if(unica){
      const [yU, mU, dU] = unica.split('-');
      const target = `${parseInt(yU, 10)}-${parseInt(mU, 10)}-${parseInt(dU, 10)}`;
      return diasLetivos.filter(k => k === target);
    }
  }
  if(periodo==='custom' && prefixo){
    const ini=document.getElementById('rel-'+prefixo+'-data-ini')?.value;
    const fim=document.getElementById('rel-'+prefixo+'-data-fim')?.value;
    if(ini&&fim){
      const dtIni=new Date(ini+'T00:00:00'), dtFim=new Date(fim+'T23:59:59');
      return diasLetivos.filter(k=>{ const[y,m,d]=k.split('-').map(Number); const dt=new Date(y,m-1,d); return dt>=dtIni&&dt<=dtFim; });
    }
  }
  if(periodo==='semanal'){
    const inicio=new Date(hoje); inicio.setDate(hoje.getDate()-7);
    return diasLetivos.filter(k=>{ const[y,m,d]=k.split('-').map(Number); const dt=new Date(y,m-1,d); return dt>=inicio&&dt<=hoje; });
  }
  if(periodo==='mensal'){
    return diasLetivos.filter(k=>{ const[y,m]=k.split('-').map(Number); return y===hoje.getFullYear()&&m===hoje.getMonth()+1; });
  }
  const bi=new Date(hoje); bi.setMonth(hoje.getMonth()-2);
  return diasLetivos.filter(k=>{ const[y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d)>=bi; });
}

function toggleCustomDatas(tipo){
  const periodo=document.getElementById('rel-'+tipo+'-periodo')?.value;
  const divCustom=document.getElementById('rel-'+tipo+'-custom');
  const divData=document.getElementById('rel-'+tipo+'-data-unica');
  if(divCustom) divCustom.style.display=periodo==='custom'?'flex':'none';
  if(divData)   divData.style.display=periodo==='data'?'flex':'none';
}

async function gerarRelFreq(){
  const turma = document.getElementById('rel-freq-turma')?.value;
  const periodo = document.getElementById('rel-freq-periodo')?.value || 'mensal';
  if(!turma){ showToast('Selecione uma turma','alerta'); return; }

  const alunos = ALUNOS_DATA.filter(a => a.turma === turma);
  if(!alunos.length){ showToast('Nenhum aluno nesta turma','alerta'); return; }

  const turmaObj = TURMAS_DATA.find(t => t.code === turma);
  const dias = getDiasLetivos(periodo, 'freq');

  // Feedback visual de carregamento
  const resultado = document.getElementById('rel-freq-resultado');
  resultado.innerHTML = `<div style="text-align:center;padding:32px;color:var(--gray5)">
    <div style="font-size:28px;margin-bottom:10px">⏳</div>
    <div style="font-size:14px;font-weight:600">Buscando dados consolidados do banco...</div>
  </div>`;

  // Garante ordem cronológica para pegar o início e fim reais
  const diasChronological = [...dias].sort((a, b) => {
    const [yA, mA, dA] = a.split('-').map(Number);
    const [yB, mB, dB] = b.split('-').map(Number);
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  const pad = (n) => n.toString().padStart(2, '0');
  
  let diasIni = null;
  let diasFim = null;
  let diasIniDb = null;
  let diasFimDb = null;

  if (diasChronological.length > 0) {
    diasIni = diasChronological[0];
    diasFim = diasChronological[diasChronological.length - 1];
    
    const [yI, mI, dI] = diasIni.split('-');
    diasIniDb = `${yI}-${pad(mI)}-${pad(dI)}`;
    
    const [yF, mF, dF] = diasFim.split('-');
    diasFimDb = `${yF}-${pad(mF)}-${pad(dF)}`;
  }

  // Busca TODOS os registros de frequência consolidados da turma no período
  let freqDB = {};
  let numRegistrosBanco = 0; // Para debug

  try {
    if(turmaObj) {
      // Usando fetchAllRows para não esbarrar no limite de 1000 da API
      // IMPORTANTE: datas são salvas COM zero-padding (ex: '2026-05-19') no banco agora, usamos os dias normalmente.
      const { data: fqRows, error } = await fetchAllRows('frequencia', 'aluno_id, data, tipo, status, consolidado', q => {
        let qFilter = q.eq('turma_id', turmaObj.id).eq('consolidado', true);
        if(dias && dias.length > 0) {
          qFilter = qFilter.in('data', dias);
        }
        return qFilter;
      });

      if(error) throw error;
      
      numRegistrosBanco = fqRows ? fqRows.length : 0;

      // Monta índice: freqDB[aluno_id][data_unpadded][tipo] = status
      (fqRows || []).forEach(f => {
        // Remove padding do Supabase (YYYY-MM-DD -> YYYY-M-D) para bater com 'dias'
        const [y, m, d] = f.data.split('-');
        const unpaddedData = `${y}-${parseInt(m)}-${parseInt(d)}`;

        if(!freqDB[f.aluno_id]) freqDB[f.aluno_id] = {};
        if(!freqDB[f.aluno_id][unpaddedData]) freqDB[f.aluno_id][unpaddedData] = {};
        freqDB[f.aluno_id][unpaddedData][f.tipo] = f.status;
      });
    }
  } catch(err) {
    console.error('[gerarRelFreq] Erro ao buscar Supabase:', err);
  }

  // Monta dados por aluno
  const dados = alunos.map(al => {
    let presencas = 0, faltas = 0, fjs = 0;
    const porDia = {};

    dias.forEach(dia => {
      const ent = freqDB[al.id]?.[dia]?.['entrada'] || null;
      const sai = freqDB[al.id]?.[dia]?.['saida'] || null;

      let status = '—';

      if(ent || sai) {
        // Regra de negócio: P = presente nos dois; F = falta em algum; FJ = falta justificada
        const evasao = ent === 'P' && sai === 'F';
        if(ent?.startsWith('FJ') || sai?.startsWith('FJ')) status = 'FJ';
        else if(ent === 'F' || evasao) status = 'F';
        else if(ent === 'P' && (sai === 'P' || sai === null)) status = 'P';
        else if(ent === 'P') status = 'P';
        else status = ent || sai || '—';
      }

      porDia[dia] = status;
      if(status === 'P') presencas++;
      else if(status === 'F') faltas++;
      else if(status?.startsWith('FJ')) fjs++;
    });

    const total = dias.length;
    const pctP = total > 0 ? Math.round(presencas / total * 100) : 0;
    const pctF = total > 0 ? Math.round(faltas / total * 100) : 0;
    return { nome: al.nome, porDia, presencas, faltas, fjs, pctP, pctF };
  });

  relDadosCache.freq = { alunos: dados, dias, turma, periodo };

  // Verifica se há dados consolidados
  const totalRegistros = dados.reduce((s, d) => s + Object.values(d.porDia).filter(v => v !== '—').length, 0);

  if(totalRegistros === 0) {
    resultado.innerHTML = `<div style="text-align:center;padding:40px;color:var(--gray5)">
      <div style="font-size:36px;margin-bottom:12px">📭</div>
      <div style="font-size:15px;font-weight:700;color:var(--gray6)">Nenhuma frequência consolidada encontrada</div>
      <div style="font-size:12px;margin-top:8px">Certifique-se de que a chamada foi <strong>consolidada</strong> na aba Frequência.</div>
      <div style="margin-top:20px;padding:15px;background:#fff3cd;color:#856404;border-radius:6px;font-size:12px;text-align:left;border:1px solid #ffeeba">
        <strong>Debug Técnico:</strong><br>
        Turma Code: ${turma}<br>
        Turma ID: ${turmaObj?.id}<br>
        Dias Buscados: ${dias.join(', ')}<br>
        DiasIni: ${diasIni || 'null'}, DiasFim: ${diasFim || 'null'}<br>
        Alunos na Turma: ${alunos.length}<br>
        Dias letivos encontrados para este período: ${dias.length}<br>
        Registros retornados do Banco: ${numRegistrosBanco} (cru) / ${dados.reduce((s, d) => s + Object.keys(d.porDia).length, 0)} (processados)<br>
        FreqDB Keys (Alunos c/ Freq): ${Object.keys(freqDB).length}<br>
      </div>
    </div>`;
    document.getElementById('rel-freq-actions')?.classList.remove('hidden');
    return;
  }

  // Renderiza tabela
  const tHead = `<tr><th>Aluno</th>${dias.map(d => `<th style="font-size:10px;white-space:nowrap">${formatarDataKey(d).slice(0,5)}</th>`).join('')}<th>%P</th><th>%F</th><th>✅ Pres.</th><th>❌ Falt.</th><th>📝 FJ</th></tr>`;
  const tBody = dados.map(d => `<tr>
    <td style="font-size:12px;font-weight:600;white-space:nowrap">${d.nome}</td>
    ${dias.map(dia => {
      const v = d.porDia[dia];
      const bg = v === 'P' ? 'var(--green-light)' : v === 'F' ? 'var(--red-light)' : v?.startsWith('FJ') ? 'var(--yellow-light)' : 'var(--gray2)';
      const color = v === 'P' ? 'var(--green-dark)' : v === 'F' ? 'var(--red-dark)' : v?.startsWith('FJ') ? 'var(--yellow-dark)' : 'var(--gray5)';
      return `<td style="text-align:center;background:${bg};color:${color};font-size:11px;font-weight:700">${v || '—'}</td>`;
    }).join('')}
    <td style="text-align:center"><span class="metric-badge badge-green">${d.pctP}%</span></td>
    <td style="text-align:center"><span class="metric-badge badge-red">${d.pctF}%</span></td>
    <td style="text-align:center;font-weight:700;color:var(--green-dark)">${d.presencas}</td>
    <td style="text-align:center;font-weight:700;color:var(--red)">${d.faltas}</td>
    <td style="text-align:center;font-weight:700;color:var(--yellow-dark)">${d.fjs}</td>
  </tr>`).join('');

  const html = `<div style="background:white;border-radius:var(--radius2);border:1px solid var(--gray3);overflow:auto;padding:16px">
    <div style="font-size:14px;font-weight:700;margin-bottom:4px">📊 Relatório de Frequência — Turma ${turma}</div>
    <div style="font-size:12px;color:var(--gray5);margin-bottom:12px">Período: ${periodo.charAt(0).toUpperCase()+periodo.slice(1)} · ${totalRegistros} registro(s) consolidado(s)</div>
    <div style="overflow:auto">
      <table style="min-width:600px"><thead style="background:var(--gray2)">${tHead}</thead><tbody>${tBody}</tbody></table>
    </div>
  </div>`;

  resultado.innerHTML = html;
  document.getElementById('rel-freq-actions')?.classList.remove('hidden');
}

function gerarRelTransp(){
  const turno=document.getElementById('rel-transp-turno')?.value||'';
  const rota=document.getElementById('rel-transp-rota')?.value||'';
  const periodo=document.getElementById('rel-transp-periodo')?.value||'mensal';
  let alunos=ALUNOS_DATA.filter(a=>a.rota&&a.rota!=='Sem transporte');
  if(turno) alunos=alunos.filter(a=>a.turno===turno);
  if(rota) alunos=alunos.filter(a=>a.rota===rota);
  if(!alunos.length){showToast('Nenhum aluno encontrado','alerta');return;}
  const dias=getDiasLetivos(periodo,'transp');
  const transpHist=JSON.parse(localStorage.getItem('rvs_transp_hist')||'{}');
  const dados=alunos.map(al=>{
    let presencas=0,faltas=0;
    const porDia={};
    dias.forEach(dia=>{
      // Histórico salvo ou dados atuais
      const hist=transpHist[al.cpf]?.[dia]||null;
      let v='—';
      if(hist){ v=hist; }
      else {
        const ft=freqTransp[al.cpf]||{};
        const diaAtual=document.getElementById('filtro-transp-dia')?.value||'';
        if(diaAtual===dia) v=(ft.vinda==='P'&&ft.ida==='P')?'P':ft.vinda==='F'||ft.ida==='F'?'F':'—';
        // Verifica ocorrência de evasão no transporte
        const dataFmt=formatarDataKey(dia);
        if(OCORR_DATA.find(o=>o.origem==='transporte'&&o.aluno===al.nome&&o.data===dataFmt)) v='Evasão';
      }
      porDia[dia]=v;
      if(v==='P') presencas++; else if(v==='F'||v==='Evasão') faltas++;
    });
    const total=Math.max(presencas+faltas,1);
    const pct=Math.round(presencas/total*100);
    return{nome:al.nome,rota:al.rota,porDia,presencas,faltas,pct};
  });
  // Inclui evasões de transporte nos dados
  dados.forEach(d=>{
    const al=ALUNOS_DATA.find(a=>a.nome===d.nome);
    d.evasoesTransp=OCORR_DATA.filter(o=>o.origem==='transporte'&&(o.aluno===d.nome||(al&&o.cpf===al.cpf))).length;
  });
  relDadosCache.transp={alunos:dados,dias,rota,periodo};
  const tHead=`<tr><th>Aluno</th><th>Rota</th>${dias.map(d=>`<th style="font-size:10px">${formatarDataKey(d).slice(0,5)}</th>`).join('')}<th>%Uso</th><th>Presenças</th><th>Faltas</th></tr>`;
  const tBody=dados.map(d=>`<tr>
    <td style="font-size:12px;font-weight:600">${d.nome}</td>
    <td style="font-size:11px">${d.rota}</td>
    ${dias.map(dia=>{ const v=d.porDia[dia]; const bg=v==='P'?'var(--green-light)':v==='F'?'var(--red-light)':'var(--gray2)'; return`<td style="text-align:center;background:${bg};font-size:11px;font-weight:600">${v}</td>`; }).join('')}
    <td style="text-align:center"><span class="metric-badge badge-green">${d.pct}%</span></td>
    <td style="text-align:center;font-weight:700">${d.presencas}</td>
    <td style="text-align:center;font-weight:700;color:var(--red)">${d.faltas}</td>
  </tr>`).join('');
  const html=`<div style="background:white;border-radius:var(--radius2);border:1px solid var(--gray3);overflow:auto;padding:16px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px">Relatório de Transporte${rota?' — '+rota:''} — ${periodo.charAt(0).toUpperCase()+periodo.slice(1)}</div>
    <table style="min-width:500px"><thead style="background:var(--gray2)">${tHead}</thead><tbody>${tBody}</tbody></table>
  </div>`;
  document.getElementById('rel-transp-resultado').innerHTML=html;
  document.getElementById('rel-transp-actions').classList.remove('hidden');
}

function gerarRelOcorr(){
  const turno=document.getElementById('rel-ocorr-turno')?.value||'';
  const tipo=document.getElementById('rel-ocorr-tipo')?.value||'';
  const periodo=document.getElementById('rel-ocorr-periodo')?.value||'mensal';
  const dias=getDiasLetivos(periodo,'ocorr');
  let ocorrs=[...OCORR_DATA];
  if(turno){ const als=ALUNOS_DATA.filter(a=>a.turno===turno).map(a=>a.nome); ocorrs=ocorrs.filter(o=>als.includes(o.aluno)); }
  if(tipo){ ocorrs=ocorrs.filter(o=>o.tipo===tipo); }
  // Filtra pelo período
  if(dias.length){
    const datas=new Set(dias.map(k=>{ const[y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('pt-BR'); }));
    ocorrs=ocorrs.filter(o=>datas.has(o.data));
  }
  relDadosCache.ocorr={ocorrs,turno,periodo};
  if(!ocorrs.length){
    document.getElementById('rel-ocorr-resultado').innerHTML=emptyState('✅','Nenhuma ocorrência no período','');
    document.getElementById('rel-ocorr-actions').classList.remove('hidden');
    return;
  }
  const labels={evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso',liberado_coord:'Liberado pela Coord.',suspensao_celular:'Suspensão Uso Celular'};
  const rows=ocorrs.map(o=>`<tr>
    <td style="font-size:12px;font-weight:600">${o.aluno}</td>
    <td><span class="metric-badge ${o.tratada?'badge-green':'badge-red'}">${labels[o.tipo]||o.tipo}</span></td>
    <td>${o.turma}</td>
    <td style="font-size:12px">${o.data} ${o.hora}</td>
    <td style="font-size:11.5px;color:var(--gray5)">${o.desc}</td>
    <td><span class="metric-badge ${o.tratada?'badge-green':'badge-red'}">${o.tratada?'Tratada':'Pendente'}</span></td>
  </tr>`).join('');
  const html=`<div style="background:white;border-radius:var(--radius2);border:1px solid var(--gray3);overflow:auto;padding:16px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px">Relatório de Ocorrências${turno?' — '+turno:''} — ${periodo.charAt(0).toUpperCase()+periodo.slice(1)}</div>
    <table><thead style="background:var(--gray2)"><tr><th>Aluno</th><th>Tipo</th><th>Turma</th><th>Data/Hora</th><th>Descrição</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
  document.getElementById('rel-ocorr-resultado').innerHTML=html;
  document.getElementById('rel-ocorr-actions').classList.remove('hidden');
}

function gerarRelLivros(){
  const turno=document.getElementById('rel-livros-turno')?.value||'';
  const turma=document.getElementById('rel-livros-turma')?.value||'';
  let alunos=ALUNOS_DATA;
  if(turno) alunos=alunos.filter(a=>a.turno===turno);
  if(turma) alunos=alunos.filter(a=>a.turma===turma);
  if(!alunos.length){showToast('Nenhum aluno encontrado','alerta');return;}
  relDadosCache.livros={alunos,turno,turma};
  const head=`<tr><th>Aluno</th><th>Turma</th>${LIVROS.map(l=>`<th style="font-size:10px">${l.icon} ${l.nome}</th>`).join('')}<th>Total</th></tr>`;
  const rows=alunos.map(a=>{
    const cells=LIVROS.map((_,li)=>{
      const rec=(a.livros||{})[li]==='sim';
      return`<td style="text-align:center;background:${rec?'var(--green-light)':'var(--red-light)'}"><span style="font-size:12px">${rec?'✓':'✗'}</span></td>`;
    }).join('');
    const total=LIVROS.filter((_,li)=>(a.livros||{})[li]==='sim').length;
    return`<tr><td style="font-weight:600;font-size:12px">${a.nome}</td><td><span class="metric-badge badge-blue">${a.turma}</span></td>${cells}<td style="text-align:center;font-weight:700">${total}/${LIVROS.length}</td></tr>`;
  }).join('');
  const html=`<div style="background:white;border-radius:var(--radius2);border:1px solid var(--gray3);overflow:auto;padding:16px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px">Relatório de Livros${turma?' — '+turma:''}${turno?' ('+turno+')':''}</div>
    <table style="min-width:600px"><thead style="background:var(--gray2)">${head}</thead><tbody>${rows}</tbody></table>
  </div>`;
  document.getElementById('rel-livros-resultado').innerHTML=html;
  document.getElementById('rel-livros-actions').classList.remove('hidden');
}

// Downloads
function downloadRelPDF(divId, filename){
  const el=document.getElementById(divId);
  if(!el||!el.innerHTML.trim()){showToast('Gere o relatório primeiro','alerta');return;}
  const conteudo=el.innerHTML;
  const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+filename+'</title>'
    +'<style>'
    +'@page { size: landscape; margin: 10mm; }'
    +'body{font-family:Arial,sans-serif;font-size:10px;padding:10px}'
    +'table{width:100%;border-collapse:collapse;page-break-inside:auto}'
    +'tr{page-break-inside:avoid;page-break-after:auto}'
    +'th,td{border:1px solid #ccc;padding:4px;text-align:center;word-wrap:break-word}'
    +'th:first-child,td:first-child{text-align:left;min-width:120px}'
    +'th{background:#f0f0f0;font-weight:bold}'
    +'.metric-badge{padding:2px 4px;border-radius:4px;font-size:9px}'
    +'.badge-green{background:#dcfce7;color:#15803d}'
    +'.badge-red{background:#fee2e2;color:#b91c1c}'
    +'.badge-blue{background:#dbeafe;color:#1d4ed8}'
    +'</style></head><body>'+conteudo+'</body></html>';
  const w=window.open('','_blank');
  w.document.write(html); w.document.close();
  setTimeout(()=>w.print(),500);
}

async function salvarAtividade(){
  const tipo=document.getElementById('ativ-tipo')?.value;
  const data=document.getElementById('ativ-data')?.value; // YYYY-MM-DD
  const hIni=document.getElementById('ativ-hini')?.value;
  const hFim=document.getElementById('ativ-hfim')?.value;
  const desc=(document.getElementById('ativ-desc')?.value||'').trim();
  const selT=document.getElementById('ativ-turmas');
  const turmas=selT?Array.from(selT.selectedOptions).map(o=>o.value):[];
  if(!tipo||!data){showToast('Informe o tipo e a data','alerta');return;}

  const tipoLabel = {evento:'Evento Especial',prova:'Prova / Avaliação',letivo:'Dia Letivo Especial',
    feriado:'Feriado / Recesso',bimestre:'Início de Bimestre',fim_bimestre:'Fim de Bimestre'};
  const obsData = JSON.stringify({ hIni, hFim, turmas, desc });

  const {error} = await supabaseClient.from('eventos').insert({
     titulo: tipoLabel[tipo] || tipo,
     data: data,
     tipo: tipo,
     turno: turmas.length===1 ? turmas[0] : 'Geral',
     responsavel: 'Coordenação',
     observacoes: obsData
  });

  if(error) {
     console.error(error);
     showToast('Erro ao salvar: '+error.message, 'alerta');
  } else {
     closeModal('modal-nova-atividade');
     showToast('Atividade incluída na agenda!','sucesso');
     await carregarDados();
     renderCalendar();
     renderAgendaMural();
  }
}

async function excluirAtividade(id){
  if(!confirm('Tem certeza que deseja excluir esta atividade?')) return;
  
  // Excluir do Supabase (eventos criados via RVS Agenda)
  if (id && id.length > 10) { // UUID do Supabase
    const {error} = await supabaseClient.from('eventos').delete().eq('id', id);
    if(error){
      console.error(error);
      showToast('Erro ao excluir: ' + error.message, 'evasao');
      return;
    }
  }

  // Fallback para itens legados no localStorage
  RVS_ATIVIDADES = RVS_ATIVIDADES.filter(a => a.id !== id);
  localStorage.setItem('rvs_atividades', JSON.stringify(RVS_ATIVIDADES));
  
  showToast('Atividade excluída!', 'sucesso');
  await carregarDados();
  renderCalendar();
  renderAgendaMural();
}

function setHorarioTab(tab,el){
  document.querySelectorAll('#page-horarios .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('horario-geral')?.classList.toggle('hidden',tab!=='geral');
  document.getElementById('horario-prof')?.classList.toggle('hidden',tab!=='prof');
}

function carregarLinksHorario(){
  const isAdm = PERFIL_ATUAL === 'admin';
  const chaves = ['geral-manha', 'geral-tarde', 'geral-noite', 'prof-manha', 'prof-tarde', 'prof-noite'];
  
  chaves.forEach(chave => {
    const inp = document.getElementById('link-' + chave);
    if (!inp) return;
    
    // Configura o valor no input
    const url = HORARIOS_LINKS[chave] || localStorage.getItem('rvs_link_'+chave) || '';
    inp.value = url;
    
    const parent = inp.parentElement;
    
    // Obter ou criar o container de view do aluno/professor
    let userView = parent.querySelector('.horario-user-view');
    if (!userView) {
      userView = document.createElement('div');
      userView.className = 'horario-user-view';
      parent.appendChild(userView);
    }
    
    // Elementos de Admin
    const labelLink = inp.previousElementSibling;
    const divBotoes = inp.nextElementSibling;
    
    if (isAdm) {
      // Visão de Admin
      if(labelLink) labelLink.style.display = 'block';
      inp.style.display = 'block';
      if(divBotoes) divBotoes.style.display = 'flex';
      userView.style.display = 'none';
    } else {
      // Visão de Usuário Comum
      if(labelLink) labelLink.style.display = 'none';
      inp.style.display = 'none';
      if(divBotoes) divBotoes.style.display = 'none';
      
      const turno = chave.split('-')[1];
      const emoji = turno === 'manha' ? '☀️' : turno === 'tarde' ? '🌤️' : '🌙';
      
      if (url) {
        userView.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:10px;">
            <div onclick="abrirLink('${chave}')" style="cursor:pointer; width:64px; height:64px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.15); transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-size:28px">${emoji}</span>
            </div>
            <button class="btn btn-primary" style="width:100%" onclick="abrirLink('${chave}')">Acessar Aula</button>
          </div>
        `;
      } else {
        userView.innerHTML = `<div style="text-align:center; padding:20px 0; color:var(--gray4); font-size:13px;">Nenhum link configurado</div>`;
      }
      userView.style.display = 'block';
    }
  });
}

async function salvarLink(chave){
  const inp=document.getElementById('link-'+chave);
  if(!inp)return;
  const val=inp.value.trim();
  if(!val){showToast('Cole um link antes de salvar','alerta');return;}
  
  // Atualiza memória
  HORARIOS_LINKS[chave] = val;
  
  // Salva no banco
  const { error } = await supabaseClient
    .from('configuracoes')
    .upsert(buildConfigPayload('links_horarios', HORARIOS_LINKS), getConfigUpsertOptions());
  
  if (error) {
    console.error('Erro ao salvar link:', error);
    showToast('Erro ao salvar no banco!', 'alerta');
    return;
  }
  
  localStorage.setItem('rvs_link_'+chave,val);
  showToast('Link salvo no banco de dados!','sucesso');
  carregarLinksHorario();
}

function abrirLink(chave){
  const url = HORARIOS_LINKS[chave] || localStorage.getItem('rvs_link_'+chave);
  if(!url){showToast('Nenhum link cadastrado ainda','alerta');return;}
  const finalUrl = url.startsWith('http') ? url : 'https://' + url;
  window.open(finalUrl,'_blank');
}
// --- WIPE SYSTEM ---
async function zerarSistema() {
  confirmarSenhaAdmin(async () => {
      const confirmacao = confirm("CUIDADO: Você está prestes a DELETAR permanentemente TODOS os Alunos, Turmas, Frequências e Ocorrências. O sistema ficará totalmente vazio. Tem certeza?");
      if(!confirmacao) return;
      
      showToast('Deletando banco de dados... Por favor, aguarde.', 'sucesso');
      
      try {
          await supabaseClient.from('ocorrencias').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseClient.from('frequencia').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseClient.from('eventos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseClient.from('alunos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabaseClient.from('turmas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          alert("Sistema zerado com sucesso! A página será recarregada.");
          window.location.reload();
      } catch (err) {
          console.error(err);
          showToast('Erro crítico ao zerar o banco', 'evasao');
      }
  });
}


// ─── RVS AGENDA ──────────────────────────────────────────────────────────────
let RVS_ATIVIDADES = JSON.parse(localStorage.getItem('rvs_atividades')||'[]');

function popularDatasAtividade(){
  const sel = document.getElementById('ativ-data');
  if(!sel) return;
  // Popula com dias letivos do calendário
  const hoje = new Date();
  const dias = Object.entries(CALENDARIO)
    .filter(([,ev]) => ev && TIPO_LETIVO_FLAG[ev.tipo])
    .map(([k]) => {
      const [y,m,d] = k.split('-').map(Number);
      return new Date(y, m-1, d);
    })
    .filter(dt => dt >= hoje)
    .sort((a,b) => a-b)
    .slice(0, 60);
  sel.innerHTML = '<option value="">Selecione a data</option>' +
    dias.map(dt => {
      const iso = dt.toISOString().split('T')[0];
      const fmt = dt.toLocaleDateString('pt-BR', {weekday:'short',day:'2-digit',month:'2-digit'});
      return '<option value="'+iso+'">'+fmt+'</option>';
    }).join('');
  // Alternativa: campo date livre se calendário vazio
  if(dias.length === 0){
    const parent = sel.parentElement;
    const input = document.createElement('input');
    input.type = 'date'; input.className = 'form-input'; input.id = 'ativ-data';
    parent.replaceChild(input, sel);
  }
}

function popularTurmasAtividade(){
  const sel = document.getElementById('ativ-turmas');
  if(!sel) return;
  sel.innerHTML = TURMAS_DATA.map(t =>
    '<option value="'+t.code+'">'+t.code+' — '+t.turno+'</option>'
  ).join('');
}

function renderAgendaMural(){
  const mural = document.getElementById('rvs-agenda-mural');
  if(!mural) return;
  
  const filtroTurno = document.getElementById('filtro-agenda-turno')?.value ||
                      document.querySelector('#page-rvs-agenda .filter-btn.active')?.dataset?.turno || '';

  // Buscar eventos do CALENDARIO que são tipo agenda ou evento
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  
  let eventos = Object.entries(CALENDARIO)
    .filter(([,ev]) => ev && (ev.tipo === 'evento' || ev.tipo === 'prova' || ev.tipo === 'bimestre' || ev.tipo === 'fim_bimestre'))
    .map(([key, ev]) => {
      const [y,m,d] = key.split('-').map(Number);
      return { ...ev, key, date: new Date(y, m-1, d) };
    })
    .sort((a,b) => a.date - b.date);

  // Também incluir RVS_ATIVIDADES locais
  const atvsLocais = RVS_ATIVIDADES.map(a => ({
    ...a,
    date: a.data ? new Date(a.data+'T00:00:00') : new Date()
  })).sort((a,b) => a.date - b.date);

  const todos = [...eventos, ...atvsLocais]
    .filter(ev => ev.date >= hoje)
    .sort((a,b) => a.date - b.date);

  if(todos.length === 0){
    mural.innerHTML = '<div style="text-align:center;padding:60px;color:#9ca3af">'+
      '<div style="font-size:48px;margin-bottom:12px">🗓️</div>'+
      '<div style="font-size:16px;font-weight:700">Nenhuma atividade agendada</div>'+
      '<div style="font-size:13px;margin-top:6px">Adicione eventos no Calendário ou clique em "+ Nova Atividade"</div></div>';
    return;
  }

  const tipoIcon = {evento:'🟠',prova:'🔵',bimestre:'⚫',fim_bimestre:'🟣',letivo:'🟢',ferias:'🏖️',feriado:'🔴'};
  const tipoLabel = {evento:'Evento',prova:'Prova',bimestre:'Início de Bimestre',fim_bimestre:'Fim de Bimestre',letivo:'Dia Letivo',ferias:'Férias',feriado:'Feriado'};

  let lastMonth = '';
  let html = '';
  todos.forEach(ev => {
    const mes = ev.date.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    if(mes !== lastMonth){
      html += '<div style="font-size:13px;font-weight:700;color:#6b7280;margin:18px 0 10px;text-transform:uppercase;letter-spacing:1px">'+mes+'</div>';
      lastMonth = mes;
    }
    const dtFmt = ev.date.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'});
    const diasRestantes = Math.ceil((ev.date - hoje)/(1000*60*60*24));
    const urgente = diasRestantes <= 7;
    html += '<div class="table-card" style="padding:14px 18px;margin-bottom:10px;border-left:4px solid '+(urgente?'#ef4444':'#3b82f6')+'">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">'+
        '<div>'+
          '<div style="font-size:14px;font-weight:700">'+(tipoIcon[ev.tipo]||'📅')+' '+(ev.label||ev.titulo||ev.tipo||'Evento')+'</div>'+
          '<div style="font-size:12px;color:#6b7280;margin-top:3px">'+dtFmt+(ev.turmas?' · '+ev.turmas:'')+'</div>'+
          (ev.desc||ev.obs?'<div style="font-size:11.5px;color:#9ca3af;margin-top:3px">'+(ev.desc||ev.obs)+'</div>':'')+ 
        '</div>'+
        '<div style="display:flex;align-items:center;gap:8px">'+
          '<div style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;background:'+(urgente?'#fee2e2':'#dbeafe')+';color:'+(urgente?'#991b1b':'#1d4ed8')+'">'+
            (diasRestantes===0?'Hoje':diasRestantes===1?'Amanhã':diasRestantes+' dias')+
          '</div>'+
          (ev.isRVS || (ev.id && !ev.id.includes('-')) ? `<button class="btn btn-outline btn-sm" style="margin:0;padding:2px 8px;font-size:11px;color:#ef4444;border-color:#ef4444" onclick="excluirAtividade('${ev.id}')">Excluir</button>` : '') +
        '</div>'+
      '</div></div>';
  });
  mural.innerHTML = html;
}

let agendaTurnoFiltro = '';
function setAgendaTurno(el, turno){
  document.querySelectorAll('#page-rvs-agenda .filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  agendaTurnoFiltro = turno;
  renderAgendaMural();
}

// ─── SOLICITAÇÕES PEDAGÓGICAS ────────────────────────────────────────────────
let SOLICIT_DATA = [];

function popularTurmasSolicit(){
  const turno = document.getElementById('solicit-turno')?.value;
  const sel = document.getElementById('solicit-turmas');
  if(!sel) return;
  const lista = (turno && turno !== 'Geral') ? TURMAS_DATA.filter(t => t.turno === turno) : TURMAS_DATA;
  const prefix = turno === 'Geral' ? '<option value="Geral">Todas as Turmas</option>' : '';
  sel.innerHTML = prefix + lista.map(t => '<option value="' + t.code + '">' + t.code + ' — ' + t.serie + '</option>').join('');
}

// ─── UPLOAD GOOGLE DRIVE via Apps Script ─────────────────────────────────────
const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbxVz3gcJOntx68lHersXxdSqtIuBgmf36fawG3NAKToZxHAMOSFjtIewhV-3oGWC_k/exec';
let _solicitArquivoPendente = null; // guarda o File selecionado

function solicitPreviewArquivo(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showToast('Arquivo muito grande! Máximo 10MB.', 'alerta');
    input.value = '';
    return;
  }
  _solicitArquivoPendente = file;
  document.getElementById('solicit-arquivo-nome').textContent = file.name;
  const prev = document.getElementById('solicit-arquivo-preview');
  prev.style.display = 'flex';
  const area = document.getElementById('solicit-upload-area');
  area.style.borderColor = 'var(--green)';
  area.style.background = '#f0fdf4';
}

function solicitDropFile(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (!file) return;
  solicitPreviewArquivo({ files: [file] });
}

function solicitRemoverArquivo() {
  _solicitArquivoPendente = null;
  const input = document.getElementById('solicit-arquivo');
  if(input) input.value = '';
  document.getElementById('solicit-arquivo-preview').style.display = 'none';
  const area = document.getElementById('solicit-upload-area');
  area.style.borderColor = 'var(--gray3)';
  area.style.background = 'var(--gray2)';
}

// Converte File para base64 string
function fileParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove o prefixo "data:...;base64," para enviar só o base64 puro
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function salvarSolicitacao(){
  const tipo = document.getElementById('solicit-tipo')?.value;
  const turno = document.getElementById('solicit-turno')?.value;
  const data = document.getElementById('solicit-data')?.value;
  const hIni = document.getElementById('solicit-hora-ini')?.value;
  const hFim = document.getElementById('solicit-hora-fim')?.value;
  const obs = (document.getElementById('solicit-obs')?.value || '').trim();
  const turmaSel = document.getElementById('solicit-turmas');
  const turmas = turmaSel ? Array.from(turmaSel.selectedOptions).map(o => o.value).join(', ') : '';
  if(!tipo || !turno || !data){ showToast('Preencha Tipo, Turno e Data!','alerta'); return; }
  
  const user = getCurrentUser();
  let linkDrive = '';

  // ── Upload para o Google Drive via Apps Script ──
  if (_solicitArquivoPendente) {
    const file = _solicitArquivoPendente;
    
    // Mudar botão para estado de carregamento
    const btnEnviar = document.querySelector('#modal-nova-solicit .btn-primary');
    if(btnEnviar){ btnEnviar.disabled = true; btnEnviar.textContent = '⏳ Enviando arquivo…'; }
    
    try {
      showToast('Enviando arquivo para o Google Drive… ⏳', 'alerta');
      
      const base64 = await fileParaBase64(file);
      
      const response = await fetch(DRIVE_UPLOAD_URL, {
        method: 'POST',
        body: JSON.stringify({
          nome: file.name,
          tipo: file.type || 'application/octet-stream',
          arquivo: base64
        })
      });
      
      const resultado = await response.json();
      
      if (!resultado.ok) {
        throw new Error(resultado.erro || 'Resposta inválida do servidor');
      }
      
      linkDrive = resultado.url;
      showToast('Arquivo enviado ao Drive! ✅', 'sucesso');
      
    } catch(err) {
      console.error('[Drive Upload] Erro:', err);
      showToast('Erro ao enviar para o Drive: ' + err.message, 'evasao');
      const btnEnviar = document.querySelector('#modal-nova-solicit .btn-primary');
      if(btnEnviar){ btnEnviar.disabled = false; btnEnviar.textContent = 'Enviar Solicitação'; }
      return;
    }
    
    const btnEnviar2 = document.querySelector('#modal-nova-solicit .btn-primary');
    if(btnEnviar2){ btnEnviar2.disabled = false; btnEnviar2.textContent = 'Enviar Solicitação'; }
  }

  // ── Salvar solicitação no banco (com link do Drive) ──
  const { data: inserted, error } = await supabaseClient.from('solicitacoes').insert({
    tipo, turno, turmas, data, hora_ini: hIni, hora_fim: hFim,
    obs, link_drive: linkDrive, status: 'aceita',
    responsavel: user?.nome || 'Usuário'
  }).select().single();
  
  if (error) {
    console.error('[salvarSolicitacao] Erro:', error);
    showToast('Erro ao salvar solicitação: ' + error.message, 'evasao');
    return;
  }
  
  // Atualiza cache local
  SOLICIT_DATA.unshift({
    id: inserted.id, tipo, turno, turmas, data, hIni, hFim, obs,
    linkDrive,
    status: 'aceita',
    responsavel: user?.nome || 'Usuário',
    criadoEm: new Date().toLocaleDateString('pt-BR')
  });

  solicitRemoverArquivo();
  closeModal('modal-nova-solicit');
  showToast('Solicitação enviada! ✅','sucesso');
  renderSolicitacoes();
}


function renderSolicitacoes(){
  const container = document.getElementById('solicit-lista');
  if(!container) return;
  const filtroTipo = (document.getElementById('filtro-solicit-tipo')?.value) || '';
  const filtroDia  = (document.getElementById('filtro-solicit-dia')?.value)  || '';
  const filtroSt   = (document.getElementById('filtro-solicit-status')?.value) || '';

  let lista = SOLICIT_DATA.slice();
  if(filtroTipo) lista = lista.filter(function(s){ return s.tipo === filtroTipo; });
  if(filtroDia)  lista = lista.filter(function(s){ return s.data === filtroDia; });
  if(filtroSt)   lista = lista.filter(function(s){ return s.status === filtroSt; });

  if(lista.length === 0){
    container.innerHTML = '<div style="text-align:center;padding:60px;color:#9ca3af">' +
      '<div style="font-size:48px;margin-bottom:12px">📋</div>' +
      '<div style="font-size:16px;font-weight:700">Nenhuma solicitação encontrada</div>' +
      '<div style="font-size:13px;margin-top:6px">Clique em &quot;+ Nova Solicitação&quot; para criar</div></div>';
    return;
  }

  var html = '';
  lista.forEach(function(s){
    var dataFmt = s.data ? s.data.split('-').reverse().join('/') : '—';
    var horario = s.hIni ? ' · ⏰ ' + s.hIni + (s.hFim ? ' – ' + s.hFim : '') : '';
    var borderColor = s.status === 'aceita' ? '#22c55e' : s.status === 'recusada' ? '#ef4444' : '#f97316';
    var badgeBg  = s.status === 'aceita' ? '#dcfce7' : s.status === 'recusada' ? '#fee2e2' : '#fff3cd';
    var badgeTxt = s.status === 'aceita' ? '#166534' : s.status === 'recusada' ? '#991b1b' : '#856404';
    var badgeLabel = s.status === 'aceita' ? '✅ Aceita' : s.status === 'recusada' ? '🔴 Recusada' : '🟡 Pendente';
    var acoes = '';
    if(s.status === 'pendente'){
      acoes = '<button class="btn btn-green btn-xs" onclick="atualizarStatusSolicit(\'' + s.id + '\', \'aceita\')">&#9989; Aceitar</button>' +
              '<button class="btn btn-red btn-xs"   onclick="atualizarStatusSolicit(\'' + s.id + '\', \'recusada\')">&#10060; Recusar</button>';
    }
    var linkBtn = s.linkDrive ? '<a href="' + s.linkDrive + '" target="_blank" class="btn btn-primary btn-xs" style="text-decoration:none">📂 Abrir Drive</a>' : '';
    html += '<div class="table-card" style="padding:16px;margin-bottom:12px;border-left:4px solid ' + borderColor + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">' +
      '<div>' +
        '<div style="font-size:15px;font-weight:700">' + s.tipo + '</div>' +
        '<div style="font-size:12.5px;color:#6b7280;margin-top:3px">📅 ' + dataFmt + horario + ' · 🏫 ' + s.turno + (s.turmas ? ' · ' + s.turmas : '') + '</div>' +
        (s.obs ? '<div style="font-size:12px;color:#6b7280;margin-top:6px;font-style:italic">&quot;' + s.obs + '&quot;</div>' : '') +
        '<div style="font-size:11px;color:#9ca3af;margin-top:4px">Por: ' + s.responsavel + ' · ' + s.criadoEm + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
        linkBtn +
        '<span style="font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;background:' + badgeBg + ';color:' + badgeTxt + '">' + badgeLabel + '</span>' +
        acoes +
        '<button class="btn btn-gray btn-xs" onclick="excluirSolicit(\'' + s.id + '\')">🗑</button>' +
      '</div></div></div>';
  });
  container.innerHTML = html;
}

async function atualizarStatusSolicit(id, novoStatus){
  var s = SOLICIT_DATA.find(function(x){ return x.id === id; });
  if(!s) return;
  s.status = novoStatus;
  
  const { error } = await supabaseClient.from('solicitacoes').update({ status: novoStatus }).eq('id', id);
  if(error) {
    console.error('[atualizarStatusSolicit] Erro:', error);
    showToast('Erro ao atualizar status.', 'evasao');
    return;
  }
  renderSolicitacoes();
  showToast('Status atualizado: ' + novoStatus,'sucesso');
}

async function excluirSolicit(id){
  if(!confirm('Excluir esta solicitação?')) return;
  
  const { error } = await supabaseClient.from('solicitacoes').delete().eq('id', id);
  if(error) {
    console.error('[excluirSolicit] Erro:', error);
    showToast('Erro ao excluir solicitação.', 'evasao');
    return;
  }
  SOLICIT_DATA = SOLICIT_DATA.filter(function(s){ return s.id !== id; });
  renderSolicitacoes();
  showToast('Solicitação excluída','alerta');
}


// ─── OLIMPÍADAS (TOPO DO SABER) ──────────────────────────────────────────────
let OLIMPIADAS_DATA = [];
let olResultadosDadosPendente = [];

async function carregarOlimpiadas(){
  try {
    const {data, error} = await supabaseClient.from('olimpiadas').select('*').order('dia_prova', {ascending: true});
    if(error) { console.error('Erro ao carregar olimpíadas:', error); return; }
    OLIMPIADAS_DATA = data || [];
  } catch(e){ console.warn(e); }
}

async function salvarOlimpiada(){
  const nome      = (document.getElementById('ol-nome')?.value||'').trim();
  const area      = document.getElementById('ol-area')?.value||'';
  const inscIni   = document.getElementById('ol-inscr-ini')?.value||null;
  const inscFim   = document.getElementById('ol-inscr-fim')?.value||null;
  const diaProva  = document.getElementById('ol-dia-prova')?.value||null;
  const qtdAlunos = parseInt(document.getElementById('ol-qtd-alunos')?.value||'0',10);
  const linkEdital= (document.getElementById('ol-link-edital')?.value||'').trim();
  const inscrita  = document.getElementById('ol-inscrita')?.value||'nao';

  const descricao = (document.getElementById('ol-descricao')?.value||'').trim();
  const resultados = (document.getElementById('ol-resultados')?.value||'').trim();
  const flyerData = (document.getElementById('ol-flyer-data')?.value||'').trim();
  const colunasModelo = (document.getElementById('ol-colunas-modelo')?.value || 'Aluno, Escola, Olimpíada, Acertos, Classificação, Nível').trim();

  if(!nome || !area || !diaProva){ showToast('Preencha Nome, Área e Dia da Prova!','alerta'); return; }

  const payload = { nome, area, insc_inicio: inscIni, insc_fim: inscFim, dia_prova: diaProva,
                    qtd_alunos: qtdAlunos, link_edital: linkEdital, inscrita,
                    flyer_url: flyerData || null,
                    descricao: descricao || null,
                    resultados: resultados || null,
                    colunas_modelo: colunasModelo,
                    resultados_dados: olResultadosDadosPendente || [] };

  const editId = document.getElementById('ol-edit-id')?.value||'';
  let error;
  let olimpiadaId = editId;
  
  if(editId){
    ({error} = await supabaseClient.from('olimpiadas').update(payload).eq('id', editId));
  } else {
    const { data: insData, error: insErr } = await supabaseClient.from('olimpiadas').insert(payload).select('id').single();
    error = insErr;
    if (insData) {
      olimpiadaId = insData.id;
    }
  }

  if(error){ showToast('Erro: '+error.message,'evasao'); return; }

  if (olCartoesPdfBytesPendente && olimpiadaId) {
    try {
      await processarEUploadCartoesAcesso(olimpiadaId, olCartoesPdfBytesPendente);
    } catch (err) {
      console.error('Erro ao processar cartões de acesso:', err);
      showToast('Olimpíada salva, mas houve erro ao processar os cartões de acesso.', 'alerta');
    }
    olCartoesPdfBytesPendente = null;
    const cartoesInput = document.getElementById('ol-cartoes-file');
    if (cartoesInput) cartoesInput.value = '';
    const statusEl = document.getElementById('ol-cartoes-status');
    if (statusEl) statusEl.innerHTML = 'Nenhum arquivo de cartões selecionado.';
  }

  await carregarOlimpiadas();
  closeModal('modal-olimpiada');
  showToast('Olimpíada salva com sucesso!','sucesso');
  renderTopoSaber();
}

function baixarModeloResultados(event) {
  if (event) event.preventDefault();
  const colunasInput = document.getElementById('ol-colunas-modelo')?.value || '';
  const headers = colunasInput.split(',').map(s => s.trim()).filter(Boolean);
  if (headers.length === 0) {
    showToast('Configure ao menos uma coluna para o modelo!', 'alerta');
    return;
  }
  
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Resultados");
  
  const nomeOl = (document.getElementById('ol-nome')?.value || 'olimpiada').trim().replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `modelo_resultados_${nomeOl}.xlsx`);
  showToast('Modelo de planilha baixado com sucesso!', 'sucesso');
}

function importarPlanilhaResultados(input) {
  const file = input.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const sheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, {defval: ''});
      
      if (rows.length === 0) {
        showToast('A planilha está vazia!', 'alerta');
        input.value = '';
        return;
      }
      
      const colunasInput = document.getElementById('ol-colunas-modelo')?.value || '';
      const colunasEsperadas = colunasInput.split(',').map(s => s.trim()).filter(Boolean);
      if (colunasEsperadas.length === 0) {
        showToast('Configure as colunas do modelo primeiro!', 'alerta');
        input.value = '';
        return;
      }
      
      const firstRowKeys = Object.keys(rows[0]);
      const colunasFaltando = colunasEsperadas.filter(col => !firstRowKeys.includes(col));
      
      if (colunasFaltando.length > 0) {
        showToast('A planilha não possui as seguintes colunas: ' + colunasFaltando.join(', '), 'evasao');
        input.value = '';
        return;
      }
      
      olResultadosDadosPendente = rows;
      document.getElementById('ol-resultados-status').innerHTML = `<span style="color:#16a34a">✅ Planilha carregada: ${rows.length} alunos prontos para importar! Salve para confirmar.</span>`;
      showToast(`Planilha carregada: ${rows.length} registros prontos!`, 'sucesso');
    } catch (err) {
      console.error('[importarPlanilhaResultados]', err);
      showToast('Erro ao ler a planilha: ' + err.message, 'evasao');
    }
    input.value = '';
  };
  reader.readAsArrayBuffer(file);
}

let olCartoesPdfBytesPendente = null;

function handleCartoesFileSelected(input) {
  const file = input.files[0];
  const statusEl = document.getElementById('ol-cartoes-status');
  if (!file) {
    olCartoesPdfBytesPendente = null;
    if (statusEl) statusEl.innerHTML = 'Nenhum arquivo de cartões selecionado.';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    olCartoesPdfBytesPendente = e.target.result;
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:#16a34a">✅ PDF de Cartões Carregado: "${file.name}" (salve para processar e migrar para os portais).</span>`;
    }
    showToast('PDF de cartões carregado com sucesso!', 'sucesso');
  };
  reader.onerror = function() {
    olCartoesPdfBytesPendente = null;
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--red)">❌ Erro ao ler arquivo PDF.</span>';
    showToast('Erro ao ler PDF de cartões.', 'erro');
  };
  reader.readAsArrayBuffer(file);
}

async function processarEUploadCartoesAcesso(olimpiadaId, fileBytes) {
  showLoading('Buscando alunos ativos e analisando PDF de cartões...');
  
  let alunos = [];
  try {
    const { data, error } = await supabaseClient
      .from('alunos')
      .select('id, nome, matricula')
      .eq('status', 'ativo');
      
    if (error) throw error;
    alunos = data || [];
  } catch (err) {
    hideLoading();
    console.error('Erro ao carregar alunos para cartões:', err);
    showToast('Erro ao buscar alunos para associar os cartões.', 'erro');
    return;
  }
  
  if (alunos.length === 0) {
    hideLoading();
    showToast('Nenhum aluno ativo encontrado no sistema.', 'alerta');
    return;
  }
  
  const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
  if (!lib) {
    hideLoading();
    showToast('Biblioteca PDF.js não carregada. Recarregue a página.', 'erro');
    return;
  }
  
  try {
    if (window.location.protocol !== 'file:') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
    } else {
      delete pdfjsLib.GlobalWorkerOptions.workerSrc;
    }
  } catch (e) {
    console.warn("GlobalWorkerOptions workerSrc error:", e);
  }
  
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileBytes.slice(0)) }).promise;
  } catch (err) {
    hideLoading();
    console.error('Erro ao ler PDF de cartões com PDF.js:', err);
    showToast('Erro ao analisar a estrutura do arquivo PDF.', 'erro');
    return;
  }
  
  const numPages = pdf.numPages;
  const matches = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    const normalizedPageText = normalizarTexto(pageText);
    
    let matchedAluno = null;
    
    // A) Busca por Matrícula
    for (const al of alunos) {
      if (al.matricula && normalizedPageText.includes(normalizarTexto(al.matricula))) {
        matchedAluno = al;
        break;
      }
    }
    
    // B) Busca por Nome Completo
    if (!matchedAluno) {
      for (const al of alunos) {
        const nomeNorm = normalizarTexto(al.nome);
        if (nomeNorm.length > 5 && normalizedPageText.includes(nomeNorm)) {
          matchedAluno = al;
          break;
        }
      }
    }
    
    // C) Busca resiliente por palavras principais
    if (!matchedAluno) {
      for (const al of alunos) {
        const nomeNorm = normalizarTexto(al.nome);
        const palavras = nomeNorm.split(/\s+/).filter(p => {
          return p.length > 2 && !['de', 'da', 'do', 'dos', 'das', 'com', 'para'].includes(p);
        });
        if (palavras.length > 0 && palavras.every(p => normalizedPageText.includes(p))) {
          matchedAluno = al;
          break;
        }
      }
    }
    
    if (matchedAluno) {
      matches.push({ pageNum: i, matchedAluno });
    }
  }
  
  hideLoading();
  
  if (matches.length === 0) {
    showToast('Não foi possível associar nenhuma página aos alunos ativos.', 'alerta');
    return;
  }
  
  // Exibe barra de progresso
  const progressModal = document.createElement('div');
  progressModal.id = 'cartao-progress-modal';
  progressModal.style = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:20000; display:flex; align-items:center; justify-content:center; padding:20px;';
  progressModal.innerHTML = `
    <div style="background:white; border:1px solid var(--gray3); border-radius:16px; max-width:400px; width:100%; padding:25px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <h4 style="font-size:15px; font-weight:800; color:#000000 !important; margin:0 0 10px;">💾 Gravando Cartões de Acesso...</h4>
      <p style="font-size:12.5px; color:#000000 !important; font-weight:700; margin-bottom:20px;" id="cartao-progress-text">Codificando páginas...</p>
      
      <div style="width:100%; height:8px; background:var(--gray); border-radius:4px; overflow:hidden; margin-bottom:10px;">
        <div id="cartao-progress-bar" style="width:0%; height:100%; background:var(--blue); transition:width 0.1s ease;"></div>
      </div>
      <div style="font-size:11px; color:var(--gray5);" id="cartao-progress-counter">Preparando upload...</div>
    </div>
  `;
  document.body.appendChild(progressModal);
  
  const { PDFDocument } = PDFLib;
  const srcDoc = await PDFDocument.load(fileBytes);
  
  let sucessos = 0;
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const pageIndex = match.pageNum - 1;
    
    document.getElementById('cartao-progress-text').textContent = `Salvando: ${match.matchedAluno.nome}`;
    const pct = Math.round((i / matches.length) * 100);
    document.getElementById('cartao-progress-bar').style.width = `${pct}%`;
    document.getElementById('cartao-progress-counter').textContent = `${i} de ${matches.length} cartões salvos`;
    
    try {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex]);
      newDoc.addPage(copiedPage);
      const pdfBytes = await newDoc.save();
      
      let binary = '';
      const len = pdfBytes.byteLength;
      for (let j = 0; j < len; j++) {
        binary += String.fromCharCode(pdfBytes[j]);
      }
      const base64String = window.btoa(binary);
      
      const payload = {
        aluno_id: match.matchedAluno.id,
        olimpiada_id: olimpiadaId,
        pdf_base64: base64String
      };
      
      const { error: indErr } = await supabaseClient
        .from('cartoes_acesso_olimpiadas')
        .upsert(payload, { onConflict: 'aluno_id,olimpiada_id' });
        
      if (indErr) throw indErr;
      sucessos++;
    } catch (err) {
      console.error(`Erro ao salvar cartão para ${match.matchedAluno.nome}:`, err);
    }
  }
  
  progressModal.remove();
  showToast(`Sucesso! ${sucessos} cartões de acesso vinculados aos alunos.`, 'sucesso');
}

function handleFlyerUpload(input){
  const file = input.files[0]; if(!file) return;
  if(file.size > 2*1024*1024){ showToast('Imagem muito grande (máx 2MB)','alerta'); return; }
  const reader = new FileReader();
  reader.onload = function(e){
    const b64 = e.target.result;
    document.getElementById('ol-flyer-data').value = b64;
    const prev = document.getElementById('ol-flyer-preview');
    prev.src = b64; prev.style.display = 'block';
    document.getElementById('ol-flyer-nome').textContent = file.name;
  };
  reader.readAsDataURL(file);
}

async function excluirOlimpiada(id){
  if(!confirm('Excluir esta olimpíada?')) return;
  const {error} = await supabaseClient.from('olimpiadas').delete().eq('id', id);
  if(error){ showToast('Erro: '+error.message,'evasao'); return; }
  await carregarOlimpiadas();
  renderTopoSaber();
  showToast('Olimpíada removida.','alerta');
}

function abrirModalOlimpiada(id){
  document.getElementById('ol-edit-id').value = '';
  document.getElementById('ol-nome').value = '';
  document.getElementById('ol-area').value = 'Linguagens';
  document.getElementById('ol-inscr-ini').value = '';
  document.getElementById('ol-inscr-fim').value = '';
  document.getElementById('ol-dia-prova').value = '';
  document.getElementById('ol-qtd-alunos').value = '0';
  document.getElementById('ol-link-edital').value = '';
  document.getElementById('ol-inscrita').value = 'nao';
  
  // Limpar flyer, textareas, colunas e resultados pendentes
  document.getElementById('ol-flyer-data').value = '';
  const prev = document.getElementById('ol-flyer-preview');
  if(prev) { prev.src = ''; prev.style.display = 'none'; }
  const nameEl = document.getElementById('ol-flyer-nome');
  if(nameEl) nameEl.textContent = '';
  
  document.getElementById('ol-descricao').value = '';
  document.getElementById('ol-resultados').value = '';
  document.getElementById('ol-colunas-modelo').value = 'Aluno, Escola, Olimpíada, Acertos, Classificação, Nível';
  
  olResultadosDadosPendente = [];
  document.getElementById('ol-resultados-status').innerHTML = '<span style="color:#6b7280">Nenhum resultado importado por planilha.</span>';
  
  olCartoesPdfBytesPendente = null;
  const cartoesFile = document.getElementById('ol-cartoes-file'); if (cartoesFile) cartoesFile.value = '';
  const cartoesStatus = document.getElementById('ol-cartoes-status'); if (cartoesStatus) cartoesStatus.innerHTML = '<span style="color:#6b7280">Nenhum arquivo de cartões selecionado.</span>';
  
  document.getElementById('modal-olimpiada-title').textContent = '+ Nova Olimpíada';

  if(id){
    const ol = OLIMPIADAS_DATA.find(o => o.id === id);
    if(!ol) return;
    document.getElementById('ol-edit-id').value     = ol.id;
    document.getElementById('ol-nome').value        = ol.nome||'';
    document.getElementById('ol-area').value        = ol.area||'Linguagens';
    document.getElementById('ol-inscr-ini').value   = ol.insc_inicio||'';
    document.getElementById('ol-inscr-fim').value   = ol.insc_fim||'';
    document.getElementById('ol-dia-prova').value   = ol.dia_prova||'';
    document.getElementById('ol-qtd-alunos').value  = ol.qtd_alunos||0;
    document.getElementById('ol-link-edital').value = ol.link_edital||'';
    document.getElementById('ol-inscrita').value    = ol.inscrita||'nao';
    document.getElementById('ol-descricao').value   = ol.descricao||'';
    document.getElementById('ol-resultados').value  = ol.resultados||'';
    document.getElementById('ol-colunas-modelo').value = ol.colunas_modelo || 'Aluno, Escola, Olimpíada, Acertos, Classificação, Nível';
    
    // Carregar flyer preview se existir
    if(ol.flyer_url) {
      document.getElementById('ol-flyer-data').value = ol.flyer_url;
      if(prev) { prev.src = ol.flyer_url; prev.style.display = 'block'; }
      if(nameEl) nameEl.textContent = 'Flyer carregado';
    }
    
    olResultadosDadosPendente = ol.resultados_dados || [];
    document.getElementById('ol-resultados-status').innerHTML = olResultadosDadosPendente.length > 0
      ? `<span style="color:#16a34a">✅ Total de ${olResultadosDadosPendente.length} resultados importados da planilha.</span>`
      : '<span style="color:#6b7280">Nenhum resultado importado por planilha.</span>';
    
    document.getElementById('modal-olimpiada-title').textContent = '✏️ Editar Olimpíada';
  }
  openModal('modal-olimpiada');
}

function renderTopoSaber(){
  const container = document.getElementById('topo-saber-container');
  if(!container) return;

  const filtroArea   = document.getElementById('filtro-ol-area')?.value||'';
  const filtroInscr  = document.getElementById('filtro-ol-inscrita')?.value||'';

  let lista = OLIMPIADAS_DATA.slice().sort((a,b) => {
    const da = a.dia_prova ? new Date(a.dia_prova) : new Date('9999');
    const db = b.dia_prova ? new Date(b.dia_prova) : new Date('9999');
    return da - db;
  });
  if(filtroArea)  lista = lista.filter(o => o.area === filtroArea);
  if(filtroInscr) lista = lista.filter(o => o.inscrita === filtroInscr);

  if(lista.length === 0){
    container.innerHTML = '<div style="text-align:center;padding:60px;color:#9ca3af"><div style="font-size:56px;margin-bottom:12px">🏆</div><div style="font-size:17px;font-weight:700">Nenhuma olimpíada cadastrada</div><div style="font-size:13px;margin-top:6px">Clique em &quot;+ Nova Olimpíada&quot; para adicionar</div></div>';
    return;
  }

  const areaCor = { 'Linguagens':'#3b82f6', 'Natureza':'#22c55e', 'Matemática':'#f97316', 'Humanas':'#8b5cf6' };
  const areaIcon = { 'Linguagens':'📖', 'Natureza':'🔬', 'Matemática':'📐', 'Humanas':'🌍' };

  const hoje = new Date(); hoje.setHours(0,0,0,0);

  container.innerHTML = lista.map(ol => {
    const cor = areaCor[ol.area] || '#6b7280';
    const icon = areaIcon[ol.area] || '🏆';
    const fmtDate = d => d ? d.split('-').reverse().join('/') : '—';
    const diaProva = ol.dia_prova ? new Date(ol.dia_prova+'T00:00:00') : null;
    const diasRestantes = diaProva ? Math.ceil((diaProva - hoje)/(1000*60*60*24)) : null;
    const passou = diasRestantes !== null && diasRestantes < 0;
    const urgente = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 30;

    let badge = '';
    if(passou) badge = '<span style="background:#fee2e2;color:#991b1b;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px">✓ Realizada</span>';
    else if(urgente) badge = '<span style="background:#fff3cd;color:#856404;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px">⚡ '+diasRestantes+' dias</span>';
    else if(diasRestantes !== null) badge = '<span style="background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px">📅 '+diasRestantes+' dias</span>';

    const inscritaBadge = ol.inscrita === 'sim'
      ? '<span style="background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px">✅ Inscrita</span>'
      : '<span style="background:#f3f4f6;color:#6b7280;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px">❌ Não inscrita</span>';

    return '<div class="table-card" style="padding:0;margin-bottom:16px;overflow:hidden;border-top:4px solid '+cor+';opacity:'+(passou?'0.7':'1')+'">' +
      '<div style="padding:16px 20px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">' +
          '<div style="flex:1;min-width:200px">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
              '<span style="font-size:20px">'+icon+'</span>' +
              '<span style="font-size:16px;font-weight:700;color:#1f2937">'+ol.nome+'</span>' +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' +
              '<span style="background:'+cor+'22;color:'+cor+';font-size:12px;font-weight:700;padding:3px 10px;border-radius:12px">'+ol.area+'</span>' +
              inscritaBadge + badge +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;font-size:12.5px;color:#6b7280">' +
              '<div>📋 <b>Inscrições:</b><br>'+fmtDate(ol.insc_inicio)+' a '+fmtDate(ol.insc_fim)+'</div>' +
              '<div>📅 <b>Dia da Prova:</b><br>'+fmtDate(ol.dia_prova)+'</div>' +
              '<div>👥 <b>Alunos Inscritos:</b><br>'+( ol.qtd_alunos||0 )+'</div>' +
              (ol.link_edital ? '<div>🔗 <a href="'+ol.link_edital+'" target="_blank" style="color:#3b82f6;font-weight:600">Ver Edital</a></div>' : '') +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn btn-outline btn-xs" onclick="abrirModalOlimpiada(\'' + ol.id + '\')">✏️</button>' +
            '<button class="btn btn-red btn-xs" onclick="excluirOlimpiada(\'' + ol.id + '\')">🗑</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}


// ─── USUÁRIOS ─────────────────────────────────────────────────────────────────
let USUARIOS_DATA = [];

function obterFotoUsuario(usuario){
  return usuario?.foto_url || usuario?.avatar_url || '';
}

async function carregarUsuarios(){
  const {data, error} = await applySchoolScope(
    supabaseClient.from('usuarios').select('*').order('nome'),
    'usuarios'
  );
  if(error){ console.error('Erro ao carregar usuários:', error); return; }
  USUARIOS_DATA = data || [];
  renderUsuarios();
}

async function salvarUsuario(){
  const currentUser = getCurrentUser();
  const canManageGlobal = isAdminGlobal(currentUser);
  const id     = document.getElementById('usr-edit-id')?.value || '';
  const nome   = (document.getElementById('usr-nome')?.value||'').trim();
  const email  = (document.getElementById('usr-email')?.value||'').trim();
  const perfil = document.getElementById('usr-perfil')?.value || 'professor';
  const selectedEscolaId = document.getElementById('usr-escola')?.value || '';
  const escolaId = MULTI_ESCOLA_ATIVO ? (selectedEscolaId || getActiveSchoolId(currentUser) || '') : '';
  const adminGlobal = canManageGlobal ? !!document.getElementById('usr-admin-global')?.checked : false;
  const turno  = document.getElementById('usr-turno')?.value || '';
  const turma  = document.getElementById('usr-turma')?.value || '';
  const cargo  = (document.getElementById('usr-cargo')?.value||'').trim();
  const avatar = document.getElementById('usr-avatar-data')?.value || '';
  const ativo  = document.getElementById('usr-ativo') ? document.getElementById('usr-ativo').checked : true;
  const senha        = (document.getElementById('usr-senha')?.value||'');
  const senhaConfirm = (document.getElementById('usr-senha-confirm')?.value||'');

  if(!nome || !email){ showToast('Preencha Nome e E-mail!','alerta'); return; }
  if (MULTI_ESCOLA_ATIVO && !escolaId) { showToast('Selecione a escola do usuário.','alerta'); return; }

  // Validação de senha
  if(!id){
    if(!senha){ showToast('Defina uma senha para o novo usuário!','alerta'); return; }
    if(senha.length < 6){ showToast('A senha deve ter ao menos 6 caracteres.','alerta'); return; }
    if(senha !== senhaConfirm){ showToast('As senhas não coincidem!','alerta'); return; }
  } else if(senha){
    if(senha.length < 6){ showToast('A nova senha deve ter ao menos 6 caracteres.','alerta'); return; }
    if(senha !== senhaConfirm){ showToast('As senhas não coincidem!','alerta'); return; }
  }

  // ── Se for NOVO USUÁRIO, usa o RPC seguro para Supabase Auth ─────────
  if (!id) {
    const { data: rpcResp, error: rpcErr } = await supabaseClient.rpc('admin_criar_usuario', {
      p_nome:   nome,
      p_email:  email,
      p_senha:  senha,
      p_perfil: perfil,
      p_turno:  turno,
      p_cargo:  cargo,
      p_escola_id: escolaId || null,
      p_admin_global: adminGlobal
    });

    if(!rpcErr && rpcResp?.status === 'success'){
      if (rpcResp.uid) {
        const updatePayload = {
          ativo: ativo,
          turma_responsavel: turma || null,
          escola_id: escolaId || null,
          escola_id_ativa: escolaId || null,
          admin_global: adminGlobal
        };
        await supabaseClient.from('usuarios').update(updatePayload).eq('id', rpcResp.uid);
      }
      closeModal('modal-usuario');
      showToast('Usuário cadastrado com segurança!','sucesso');
      await carregarUsuarios();
      return;
    }
    console.error('[RPC admin_criar_usuario]', rpcErr || rpcResp);
    showToast('Erro ao criar usuário: ' + (rpcErr?.message || rpcResp?.message || 'Verifique o console.'), 'evasao');
  }
  // ── Se for EDIÇÃO, atualiza a tabela pública normalmente ──────────────
  else {
    const payload = {
      nome: nome,
      email: email,
      perfil: perfil,
      turno: turno,
      turma_responsavel: turma || null,
      cargo: cargo,
      foto_url: avatar,
      ativo: ativo,
      escola_id: escolaId || null,
      escola_id_ativa: escolaId || null,
      admin_global: adminGlobal
    };
    
    // Se digitou uma nova senha, chama o RPC para atualizar a senha no Auth primeiro
    if(senha) {
      const { data: passData, error: passErr } = await supabaseClient.rpc('admin_atualizar_senha', {
        p_user_id: id,
        p_nova_senha: senha
      });
      if(passErr || passData?.status === 'error') {
        console.error('[Update Senha]', passErr || passData);
        showToast('Erro ao atualizar senha no sistema de autenticação: ' + (passErr?.message || passData?.message), 'evasao');
        return; // Interrompe se não conseguiu atualizar a senha no Auth
      }
      payload.senha = senha;
    }

    const { error } = await supabaseClient.from('usuarios').update(payload).eq('id', id);
    if (!error) {
      closeModal('modal-usuario');
      showToast('Usuário atualizado com sucesso!','sucesso');
      await carregarUsuarios();
    } else {
      console.error('[Update Usuario]', error);
      showToast('Erro ao atualizar os dados do usuário: ' + error.message, 'evasao');
    }
  }
}

async function excluirUsuario(id, nome){
  if(!confirm('Excluir o usuário "'+nome+'"?')) return;
  
  // Chama o RPC seguro para deletar o usuário do Auth e da tabela pública
  const { data, error } = await supabaseClient.rpc('admin_deletar_usuario', {
    p_user_id: id
  });
  
  if (error || data?.status === 'error') {
    console.error('[RPC admin_deletar_usuario]', error || data);
    showToast('Erro ao excluir usuário: ' + (error?.message || data?.message), 'evasao');
    return;
  }
  
  USUARIOS_DATA = USUARIOS_DATA.filter(u => u.id !== id);
  renderUsuarios();
  showToast('Usuário excluído com sucesso do sistema e da autenticação.','sucesso');
}

function abrirModalUsuario(id){
  const canManageGlobal = isAdminGlobal();
  document.getElementById('usr-edit-id').value = '';
  document.getElementById('usr-nome').value = '';
  document.getElementById('usr-email').value = '';
  document.getElementById('usr-perfil').value = 'professor';
  document.getElementById('usr-turno').value = '';
  popularEscolasUsuario();
  const escolaEl = document.getElementById('usr-escola');
  if (escolaEl) escolaEl.value = getActiveSchoolId() || '';
  const adminGlobalEl = document.getElementById('usr-admin-global');
  const adminGlobalGroup = adminGlobalEl?.closest('.form-group');
  if (adminGlobalEl) {
    adminGlobalEl.checked = false;
    adminGlobalEl.disabled = !canManageGlobal;
  }
  if (adminGlobalGroup) adminGlobalGroup.style.display = canManageGlobal ? '' : 'none';
  const cargoEl = document.getElementById('usr-cargo');
  if(cargoEl) cargoEl.value = '';
  document.getElementById('usr-avatar-data').value = '';
  // Clear password fields
  const senhaEl = document.getElementById('usr-senha');
  const senhaConfirmEl = document.getElementById('usr-senha-confirm');
  const senhaInfoEl = document.getElementById('usr-senha-info');
  if(senhaEl) senhaEl.value = '';
  if(senhaConfirmEl) senhaConfirmEl.value = '';
  const prev = document.getElementById('usr-avatar-preview');
  if(prev) prev.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%234f46e5'/%3E%3Ctext x='50' y='64' text-anchor='middle' font-size='40' fill='white'%3E%3F%3C/text%3E%3C/svg%3E";
  document.getElementById('modal-usuario-title').textContent = '+ Novo Usuário';
  if(senhaInfoEl) senhaInfoEl.style.display = 'none'; // Hide hint for new users
  const ativoEl = document.getElementById('usr-ativo');
  if(ativoEl) ativoEl.checked = true;
  popularTurmasUsuario();

  if(id){
    const u = USUARIOS_DATA.find(u => u.id === id);
    if(!u) return;
    document.getElementById('usr-edit-id').value = u.id;
    document.getElementById('usr-nome').value    = u.nome||'';
    document.getElementById('usr-email').value   = u.email||'';
    document.getElementById('usr-perfil').value  = u.perfil||'professor';
    document.getElementById('usr-turno').value   = u.turno||'';
    popularEscolasUsuario(u.escola_id || u.escola_id_ativa || '');
    if (escolaEl) escolaEl.value = u.escola_id || u.escola_id_ativa || '';
    if (adminGlobalEl) adminGlobalEl.checked = canManageGlobal ? !!u.admin_global : false;
    if(cargoEl) cargoEl.value = u.cargo||'';
    if(ativoEl) ativoEl.checked = u.ativo !== false;
    popularTurmasUsuario();
    document.getElementById('usr-turma').value   = u.turma_responsavel||'';
    document.getElementById('modal-usuario-title').textContent = '✏️ Editar Usuário';
    if(senhaInfoEl) senhaInfoEl.style.display = 'block'; // Show 'leave blank' hint when editing
    const fotoUsuario = obterFotoUsuario(u);
    if(fotoUsuario){
      document.getElementById('usr-avatar-data').value = fotoUsuario;
      if(prev) prev.src = fotoUsuario;
    }
  }
  openModal('modal-usuario');
}

function popularTurmasUsuario(){
  const sel = document.getElementById('usr-turma');
  if(!sel) return;
  sel.innerHTML = '<option value="">Nenhuma (turma geral)</option>' +
    TURMAS_DATA.map(t => '<option value="'+t.code+'">'+t.code+' — '+t.turno+'</option>').join('');
}

function baixarModeloUsuarios(){
  // UTF-8 BOM so Excel opens correctly
  const BOM = '\uFEFF';
  const header = 'Nome,Email,Perfil,Turno,Turma,Senha';
  const ex1   = 'Jo\u00e3o Silva,joao@escola.pa.gov.br,professor,Manh\u00e3,9A,senha123';
  const ex2   = 'Maria Souza,maria@escola.pa.gov.br,coordenador,Geral,,senha456';
  const ex3   = 'Carlos Lima,carlos@escola.pa.gov.br,secretaria,Tarde,,senha789';
  const note  = '# Perfis v\u00e1lidos: admin | coordenador | secretaria | professor';
  const note2 = '# Turnos v\u00e1lidos: Manh\u00e3 | Tarde | Noite | Geral';
  const note3 = '# Senha \u00e9 obrigat\u00f3ria para novos usu\u00e1rios (m\u00edn. 6 caracteres)';
  const csv = BOM + [header, ex1, ex2, ex3, note, note2, note3].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'modelo_usuarios_rvs.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Modelo CSV baixado! Preencha e importe.','sucesso');
}

function importarPlanilhaUsuarios(input){
  const file = input.files[0];
  if(!file){ return; }
  // Reset the input so the same file can be re-selected
  input.value = '';
  const reader = new FileReader();
  reader.onload = async function(e){
    let text = e.target.result;
    // Strip BOM if present
    if(text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    // Support both comma and semicolon delimiters (Brazilian Excel uses ;)
    const delimiter = text.includes(';') ? ';' : ',';
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#')); // skip blanks and comment lines
    if(lines.length < 2){
      showToast('Planilha vazia ou sem dados!','alerta');
      return;
    }
    // First line = header (skip it)
    const dataLines = lines.slice(1);
    let count = 0, erros = 0, senhaFaltando = 0;
    for(const line of dataLines){
      const cols  = line.split(delimiter).map(s => s.trim().replace(/^"|"$/g,''));
      const [nome, email, perfil, turno, turma, senha] = cols;
      if(!nome || !email) continue;
      if(!senha || senha.length < 6){
        senhaFaltando++;
        continue; // skip rows without a valid password
      }
      const payload = {
        nome,
        email,
        perfil:           (perfil||'professor').toLowerCase(),
        turno:            turno||'',
        turma_responsavel: turma||'',
        senha
      };
      const {error} = await supabaseClient
        .from('usuarios')
        .upsert(payload, {onConflict:'email'});
      if(error){ console.warn('Erro importando', email, error.message); erros++; }
      else count++;
    }
    let msg = count + ' usu\u00e1rio(s) importado(s).';
    if(senhaFaltando) msg += ' ' + senhaFaltando + ' linha(s) ignorada(s) por falta de senha.';
    if(erros)         msg += ' ' + erros + ' erro(s).';
    showToast(msg, erros || senhaFaltando ? 'alerta' : 'sucesso');
    await carregarUsuarios();
  };
  reader.readAsText(file, 'UTF-8');
}

function handleAvatarUpload(input){
  const file = input.files[0];
  if(!file) return;
  if(file.size > 2*1024*1024){ showToast('Foto muito grande (máx. 2MB)','alerta'); return; }
  const reader = new FileReader();
  reader.onload = function(e){
    const base64 = e.target.result;
    document.getElementById('usr-avatar-data').value = base64;
    document.getElementById('usr-avatar-preview').src = base64;
  };
  reader.readAsDataURL(file);
}

function abrirCameraUsuario(){
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'user';
  input.onchange = () => handleAvatarUpload(input);
  input.click();
}

function renderUsuarios(){
  const container = document.getElementById('usuarios-lista');
  if(!container) return;

  const filtroP = document.getElementById('filtro-usr-perfil')?.value||'';
  const filtroT = document.getElementById('filtro-usr-turno')?.value||'';
  const busca   = (document.getElementById('filtro-usr-busca')?.value||'').toLowerCase();

  let lista = USUARIOS_DATA.slice();
  if(filtroP) lista = lista.filter(u => u.perfil === filtroP);
  if(filtroT) lista = lista.filter(u => u.turno === filtroT);
  if(busca)   lista = lista.filter(u => (u.nome||'').toLowerCase().includes(busca) || (u.email||'').toLowerCase().includes(busca));

  if(lista.length === 0){
    container.innerHTML = '<div style="text-align:center;padding:60px;color:#9ca3af"><div style="font-size:48px;margin-bottom:12px">👥</div><div style="font-size:16px;font-weight:700">Nenhum usuário encontrado</div><div style="font-size:13px;margin-top:6px">Clique em &quot;+ Novo Usuário&quot; para adicionar</div></div>';
    return;
  }

  const perfilCor  = {admin:'#7c3aed',coordenador:'#2563eb',secretaria:'#059669',professor:'#d97706'};
  const perfilIcon = {admin:'👑',coordenador:'🎓',secretaria:'📋',professor:'📚'};
  const perfilLabel= {admin:'Administrador',coordenador:'Coordenador',secretaria:'Secretaria',professor:'Professor'};

  container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">' +
    lista.map(u => {
      const cor = perfilCor[u.perfil]||'#6b7280';
      const initials = (u.nome||'?').split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
      const ativoBadge = u.ativo !== false
        ? '<span style="background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 6px;border-radius:12px;margin-left:6px;vertical-align:middle;">Ativo</span>'
        : '<span style="background:#fee2e2;color:#991b1b;font-size:10px;font-weight:700;padding:2px 6px;border-radius:12px;margin-left:6px;vertical-align:middle;">Inativo</span>';
      const globalBadge = u.admin_global
        ? '<span style="background:#ede9fe;color:#5b21b6;font-size:10px;font-weight:700;padding:2px 6px;border-radius:12px;margin-left:6px;vertical-align:middle;">Global</span>'
        : '';
      const escolaLabel = MULTI_ESCOLA_ATIVO ? getSchoolNameById(u.escola_id || u.escola_id_ativa) : '';
      const fotoUsuario = obterFotoUsuario(u);
      const avatarHtml = fotoUsuario
        ? '<img src="'+fotoUsuario+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid '+cor+'">'
        : '<div style="width:56px;height:56px;border-radius:50%;background:'+cor+';display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;border:3px solid '+cor+'">'+initials+'</div>';
      return '<div class="table-card" style="padding:16px;border-top:3px solid '+cor+'">'+
        '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">'+
          avatarHtml+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+u.nome+ativoBadge+globalBadge+'</div>'+
            '<div style="font-size:11.5px;color:#6b7280;margin-top:2px">'+u.email+'</div>'+
            '<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+cor+'22;color:'+cor+';margin-top:4px;display:inline-block">'+
              (perfilIcon[u.perfil]||'👤')+' '+(perfilLabel[u.perfil]||u.perfil)+
            '</span>'+
            (escolaLabel ? '<div style="font-size:11px;color:#4b5563;margin-top:6px">🏫 '+escolaLabel+'</div>' : '')+
          '</div>'+
        '</div>'+
        '<div style="font-size:11.5px;color:#6b7280;margin-bottom:10px">'+
          (u.turno ? '🕐 '+u.turno : '')+(u.turma_responsavel ? ' · 🏫 '+u.turma_responsavel : '')+
        '</div>'+
        '<div style="display:flex;gap:6px;justify-content:flex-end">'+
          '<button class="btn btn-outline btn-xs" onclick="abrirModalUsuario(\'' + u.id + '\')">✏️ Editar</button>'+
          '<button class="btn btn-red btn-xs" onclick="excluirUsuario(\'' + u.id + '\',\'' + u.nome.replace(/'/g,'') + '\')">&#128465;</button>'+
        '</div>'+
      '</div>';
    }).join('')+
  '</div>';
}

function baixarModeloUsuarios(){
  const csv = 'Nome,Email,Perfil (admin/coordenador/secretaria/professor),Turno (Manha/Tarde/Noite),Turma Responsavel\nJoao Silva,joao@escola.pa.gov.br,professor,Manha,9A\nMaria Souza,maria@escola.pa.gov.br,coordenador,Geral,';
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='modelo_usuarios.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('Modelo baixado!','sucesso');
}

function importarPlanilhaUsuarios(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(e){
    const lines = e.target.result.split('\n').filter(l=>l.trim()).slice(1);
    let count = 0, erros = 0;
    for(const line of lines){
      const [nome,email,perfil,turno,turma] = line.split(',').map(s=>s.trim());
      if(!nome||!email) continue;
      const payload = attachSchoolId({
        nome,
        email,
        perfil: perfil||'professor',
        turno: turno||'',
        turma_responsavel: turma||''
      }, 'usuarios');
      const {error} = await supabaseClient.from('usuarios').upsert(payload, { onConflict:'email' });
      if(error) erros++;
      else count++;
    }
    showToast(count+' usuários importados'+(erros?' ('+erros+' erros)':''),'sucesso');
    await carregarUsuarios();
  };
  reader.readAsText(file);
}

function coletarModulosEscolaFormulario() {
  const modulos = cloneSchoolModules();
  Object.keys(modulos).forEach((pageId) => {
    const input = document.getElementById(`esc-mod-${pageId}`);
    modulos[pageId] = input ? !!input.checked : modulos[pageId];
  });
  return modulos;
}

function preencherChecklistModulosEscola(modulos = null) {
  const container = document.getElementById('esc-modulos-lista');
  if (!container) return;
  const ativos = mergeSchoolModules(modulos);
  container.innerHTML = Object.entries(MODULO_LABELS).map(([pageId, label]) => `
    <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--gray3);border-radius:12px;background:white;cursor:pointer">
      <input type="checkbox" id="esc-mod-${pageId}" ${ativos[pageId] ? 'checked' : ''} style="width:16px;height:16px;">
      <span style="font-size:13px;color:var(--gray7);font-weight:600">${label}</span>
    </label>
  `).join('');
}

function abrirModalEscola(id = '') {
  document.getElementById('esc-edit-id').value = '';
  document.getElementById('esc-nome').value = '';
  document.getElementById('esc-slug').value = '';
  document.getElementById('esc-ativa').checked = true;
  document.getElementById('modal-escola-title').textContent = '+ Nova Escola';
  preencherChecklistModulosEscola();

  if (id) {
    const escola = ESCOLAS_DATA.find((item) => item.id === id);
    if (!escola) return;
    document.getElementById('esc-edit-id').value = escola.id;
    document.getElementById('esc-nome').value = escola.nome || '';
    document.getElementById('esc-slug').value = escola.slug || '';
    document.getElementById('esc-ativa').checked = escola.ativa !== false;
    document.getElementById('modal-escola-title').textContent = '✏️ Editar Escola';
    preencherChecklistModulosEscola(escola.modulos_ativos);
  }

  openModal('modal-escola');
}

async function salvarEscola() {
  const id = document.getElementById('esc-edit-id')?.value || '';
  const nome = (document.getElementById('esc-nome')?.value || '').trim();
  const slugInput = (document.getElementById('esc-slug')?.value || '').trim();
  const slug = normalizeSchoolSlug(slugInput || nome);
  const ativa = !!document.getElementById('esc-ativa')?.checked;
  const modulos = coletarModulosEscolaFormulario();

  if (!nome) {
    showToast('Informe o nome da escola.', 'alerta');
    return;
  }
  if (!slug) {
    showToast('Não foi possível gerar o identificador da escola.', 'alerta');
    return;
  }

  const payload = {
    nome,
    slug,
    ativa,
    modulos_ativos: modulos
  };

  const query = id
    ? supabaseClient.from('escolas').update(payload).eq('id', id)
    : supabaseClient.from('escolas').insert(payload);

  const { error } = await query;
  if (error) {
    console.error('[salvarEscola] Erro:', error);
    showToast('Erro ao salvar escola: ' + error.message, 'alerta');
    return;
  }

  await carregarContextoEscolas();
  renderSchoolSwitcher();
  renderEscolasPage();
  popularEscolasUsuario();
  updateSidebarProfile();
  closeModal('modal-escola');
  showToast('Escola salva com sucesso!', 'sucesso');
}

function renderEscolasPage() {
  const container = document.getElementById('escolas-lista');
  if (!container) return;

  if (!MULTI_ESCOLA_ATIVO) {
    container.innerHTML = '<div class="table-card" style="padding:24px;text-align:center;color:var(--gray5)">Execute a migração multi-escola no banco para habilitar o cadastro de escolas.</div>';
    return;
  }

  if (!ESCOLAS_DATA.length) {
    container.innerHTML = '<div class="table-card" style="padding:24px;text-align:center;color:var(--gray5)">Nenhuma escola cadastrada ainda.</div>';
    return;
  }

  container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px">' +
    ESCOLAS_DATA.map((escola) => {
      const modulos = mergeSchoolModules(escola.modulos_ativos);
      const modulosAtivos = Object.keys(modulos).filter((key) => modulos[key]).length;
      const badgeAtiva = escola.ativa !== false
        ? '<span style="background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px">Ativa</span>'
        : '<span style="background:#fee2e2;color:#991b1b;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px">Inativa</span>';
      const badgeAtual = escola.id === ESCOLA_ATUAL_ID
        ? '<span style="background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px">Painel atual</span>'
        : '';
      return '<div class="table-card" style="padding:18px;border-top:3px solid var(--blue)">'+
        '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px">'+
          '<div>'+
            '<div style="font-size:16px;font-weight:700;color:var(--gray7)">'+escola.nome+'</div>'+
            '<div style="font-size:12px;color:var(--gray5);margin-top:4px">Slug: '+(escola.slug || '—')+'</div>'+
          '</div>'+
          '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">'+badgeAtiva+badgeAtual+'</div>'+
        '</div>'+
        '<div style="font-size:12px;color:var(--gray5);margin-bottom:12px">'+modulosAtivos+' módulo(s) habilitado(s)</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">'+
          Object.entries(modulos)
            .filter(([, enabled]) => enabled)
            .slice(0, 6)
            .map(([pageId]) => '<span style="font-size:10px;padding:4px 8px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-weight:700">'+MODULO_LABELS[pageId]+'</span>')
            .join('')+
        '</div>'+
        '<div style="display:flex;justify-content:flex-end;gap:8px">'+
          '<button class="btn btn-outline btn-xs" onclick="abrirModalEscola(\''+escola.id+'\')">✏️ Editar</button>'+
        '</div>'+
      '</div>';
    }).join('') +
  '</div>';
}


/* ============================================================
   OBAFOG RVS
   ============================================================ */
let obafogAlunosSelecionados = [];

function buscarAlunoObafog(term){
  const res = document.getElementById('obafog-busca-resultados');
  term = term.trim().toLowerCase();
  
  if(!term || term.length < 2) {
    res.style.display = 'none';
    return;
  }
  
  const filtrados = ALUNOS_DATA.filter(a => a.nome.toLowerCase().includes(term)).slice(0, 5);
  
  if(filtrados.length === 0) {
    res.innerHTML = '<div style="padding:10px; font-size:12px; color:var(--gray5)">Nenhum aluno encontrado</div>';
  } else {
    res.innerHTML = filtrados.map(a => `
      <div style="padding:10px; cursor:pointer; font-size:13px; border-bottom:1px solid var(--gray2); display:flex; justify-content:space-between; align-items:center;" onclick="addAlunoObafog('${a.id}', '${a.nome.replace(/'/g, "\'")}', '${a.turma||''}')">
        <span>${a.nome}</span>
        <span class="badge">${a.turma}</span>
      </div>
    `).join('');
  }
  res.style.display = 'block';
}

function addAlunoObafog(id, nome, turma){
  if(obafogAlunosSelecionados.length >= 3) {
    showToast('Máximo de 3 alunos por equipe!', 'alerta');
    return;
  }
  if(obafogAlunosSelecionados.some(a => a.id === id)){
    showToast('Aluno já adicionado na equipe!', 'alerta');
    return;
  }
  
  obafogAlunosSelecionados.push({ id, nome, turma });
  renderObafogSelecionados();
  document.getElementById('obafog-busca-aluno').value = '';
  document.getElementById('obafog-busca-resultados').style.display = 'none';
}

function removeAlunoObafog(id){
  obafogAlunosSelecionados = obafogAlunosSelecionados.filter(a => a.id !== id);
  renderObafogSelecionados();
}

function renderObafogSelecionados(){
  const div = document.getElementById('obafog-alunos-selecionados');
  const count = document.getElementById('obafog-count');
  count.textContent = obafogAlunosSelecionados.length;
  
  if(obafogAlunosSelecionados.length === 0){
    div.innerHTML = '<div style="color:var(--gray4); font-size:12px; text-align:center">Nenhum aluno selecionado</div>';
    return;
  }
  
  div.innerHTML = obafogAlunosSelecionados.map(a => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:6px 10px; border-radius:4px; border:1px solid var(--gray3)">
      <div style="font-size:13px"><b>${a.nome}</b> <span class="badge">${a.turma}</span></div>
      <button class="btn btn-sm" style="color:var(--red); padding:2px 6px" onclick="removeAlunoObafog('${a.id}')">✕</button>
    </div>
  `).join('');
}

async function salvarEquipeObafog(){
  const nome = document.getElementById('obafog-equipe-nome').value.trim();
  const numero = document.getElementById('obafog-equipe-numero')?.value.trim() || '';
  if(!nome){ showToast('Digite o nome da equipe!', 'alerta'); return; }
  if(obafogAlunosSelecionados.length < 1){ showToast('Selecione pelo menos 1 aluno!', 'alerta'); return; }
  
  const equipe = {
    nome: nome,
    numero: numero,
    alunos: obafogAlunosSelecionados,
    lancamento1: 0,
    lancamento2: 0
  };
  
  const { data, error } = await supabaseClient.from('obafog_equipes').insert([equipe]).select();
  if(error){
    console.error('Erro ao salvar equipe:', error);
    showToast('Erro ao salvar no banco!', 'alerta');
    return;
  }
  
  if(data && data[0]) OBAFOG_DATA.unshift(data[0]);
  
  showToast('Equipe cadastrada!', 'sucesso');
  document.getElementById('obafog-equipe-nome').value = '';
  if(document.getElementById('obafog-equipe-numero')) document.getElementById('obafog-equipe-numero').value = '';
  obafogAlunosSelecionados = [];
  renderObafogSelecionados();
  renderObafog();
}

async function renderObafog(){
  const grid = document.getElementById('obafog-equipes-grid');
  if(!grid) return;
  
  // Busca os dados mais recentes do banco sempre que abrir a aba
  const { data, error } = await supabaseClient.from('obafog_equipes').select('*').order('created_at', {ascending:false});
  if(!error && data) {
    OBAFOG_DATA = data;
  }
  
  if(OBAFOG_DATA.length === 0){
    grid.innerHTML = '<div style="font-size:13px; color:var(--gray5)">Nenhuma equipe cadastrada.</div>';
    renderRankingObafog();
    return;
  }
  
  grid.innerHTML = OBAFOG_DATA.map(eq => {
    const l1 = parseFloat(eq.lancamento1||0).toFixed(2);
    const l2 = parseFloat(eq.lancamento2||0).toFixed(2);
    const best = Math.max(eq.lancamento1||0, eq.lancamento2||0).toFixed(2);
    const numTag = eq.numero ? ` Eq. ${eq.numero} - ` : ' ';
    return `
    <div onclick="abrirMetragemObafog('${eq.id}')" style="cursor:pointer; background:var(--white); border:1px solid #fca5a5; border-radius:8px; padding:15px; box-shadow:0 2px 5px rgba(220,38,38,0.1); transition:transform 0.2s" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
      <div style="font-weight:700; color:var(--red); font-size:15px; margin-bottom:10px">🚀${numTag}${eq.nome}</div>
      <div style="font-size:12px; color:var(--gray6); margin-bottom:12px">
        ${(eq.alunos||[]).map(a => `<div>• ${a.nome.split(' ')[0]} (${a.turma})</div>`).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--gray5)">
        <div>L1: <b>${l1}m</b></div>
        <div>L2: <b>${l2}m</b></div>
      </div>
      <div style="margin-top:6px; font-size:12px; font-weight:700; color:#d97706">Melhor: ${best}m</div>
    </div>
  `}).join('');
  
  renderRankingObafog();
}

function renderRankingObafog(){
  const rankingDiv = document.getElementById('obafog-ranking');
  if(!rankingDiv) return;
  
  const rankeado = [...OBAFOG_DATA].sort((a,b) => {
    const bestA = Math.max(a.lancamento1||0, a.lancamento2||0);
    const bestB = Math.max(b.lancamento1||0, b.lancamento2||0);
    return bestB - bestA;
  });
  
  if(rankeado.length === 0){
    rankingDiv.innerHTML = '<div style="font-size:13px; color:var(--gray5)">Sem dados para ranking.</div>';
    return;
  }
  
  rankingDiv.innerHTML = rankeado.map((eq, i) => {
    const best = Math.max(eq.lancamento1||0, eq.lancamento2||0).toFixed(2);
    let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)+'º';
    const numTag = eq.numero ? ` (Eq. ${eq.numero})` : '';
    return `
    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--white); padding:10px 15px; border-radius:6px; border:1px solid #fde68a">
      <div style="font-weight:700; font-size:14px; width:30px; text-align:center">${medal}</div>
      <div style="flex:1; margin-left:10px">
        <div style="font-weight:700; font-size:14px; color:var(--gray8)">${eq.nome}${numTag}</div>
        <div style="font-size:11px; color:var(--gray5)">${(eq.alunos||[]).map(a=>a.nome.split(' ')[0]).join(', ')}</div>
      </div>
      <div style="font-weight:900; color:#b45309; font-size:16px">${best}m</div>
    </div>
  `}).join('');
}

function abrirMetragemObafog(id){
  const eq = OBAFOG_DATA.find(e => e.id === id);
  if(!eq) return;
  document.getElementById('obafog-modal-id').value = id;
  document.getElementById('obafog-modal-equipe').textContent = eq.nome;
  document.getElementById('obafog-modal-lanc1').value = eq.lancamento1 || 0;
  document.getElementById('obafog-modal-lanc2').value = eq.lancamento2 || 0;
  openModal('modal-obafog-metragem');
}

async function salvarMetragemObafog(){
  const id = document.getElementById('obafog-modal-id').value;
  const l1 = parseFloat(document.getElementById('obafog-modal-lanc1').value) || 0;
  const l2 = parseFloat(document.getElementById('obafog-modal-lanc2').value) || 0;
  
  const { error } = await supabaseClient.from('obafog_equipes').update({
    lancamento1: l1,
    lancamento2: l2
  }).eq('id', id);
  
  if(error){
    console.error('Erro ao atualizar metragem:', error);
    showToast('Erro ao atualizar no banco!', 'alerta');
    return;
  }
  
  // Atualiza memória
  const eq = OBAFOG_DATA.find(e => e.id === id);
  if(eq) {
    eq.lancamento1 = l1;
    eq.lancamento2 = l2;
  }
  
  showToast('Metragens atualizadas!', 'sucesso');
  closeModal('modal-obafog-metragem');
  renderObafog();
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  document.querySelector('.sidebar').classList.toggle('sidebar-open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
// [OBAFOG] Download Excel
function downloadObafogXLSX() {
  if (typeof XLSX === 'undefined') {
    showToast('A biblioteca Excel ainda está carregando. Tente novamente em alguns segundos.', 'alerta');
    return;
  }
  if (!OBAFOG_DATA || OBAFOG_DATA.length === 0) {
    showToast('Nenhuma equipe cadastrada para exportar.', 'alerta');
    return;
  }

  // Ordena os dados pelo melhor lançamento
  const rankeado = [...OBAFOG_DATA].sort((a,b) => {
    const bestA = Math.max(a.lancamento1||0, a.lancamento2||0);
    const bestB = Math.max(b.lancamento1||0, b.lancamento2||0);
    return bestB - bestA;
  });

  const exportData = rankeado.map((eq, index) => {
    const al1 = eq.alunos[0] ? eq.alunos[0].nome : '';
    const al2 = eq.alunos[1] ? eq.alunos[1].nome : '';
    const al3 = eq.alunos[2] ? eq.alunos[2].nome : '';
    
    // Obter as turmas únicas dos alunos envolvidos
    const turmasArray = eq.alunos.map(a => a.turma).filter(Boolean);
    const turmasUnicas = [...new Set(turmasArray)].join(', ');

    return {
      "Colocação": (index + 1) + 'º',
      "Nome da Equipe": eq.nome || '',
      "Número da Equipe": eq.numero || '',
      "Turma(s)": turmasUnicas,
      "Aluno 1": al1,
      "Aluno 2": al2,
      "Aluno 3": al3,
      "Lançamento 1 (m)": parseFloat(eq.lancamento1||0).toFixed(2).replace('.', ','),
      "Lançamento 2 (m)": parseFloat(eq.lancamento2||0).toFixed(2).replace('.', ','),
      "Melhor Marca (m)": Math.max(eq.lancamento1||0, eq.lancamento2||0).toFixed(2).replace('.', ',')
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ranking OBAFOG");

  // Ajustar a largura das colunas
  const colWidths = [
    { wch: 12 }, // Colocação
    { wch: 25 }, // Equipe
    { wch: 18 }, // Número
    { wch: 15 }, // Turma(s)
    { wch: 30 }, // Aluno 1
    { wch: 30 }, // Aluno 2
    { wch: 30 }, // Aluno 3
    { wch: 18 }, // Lançamento 1
    { wch: 18 }, // Lançamento 2
    { wch: 18 }  // Melhor Marca
  ];
  ws['!cols'] = colWidths;

  const dataAtual = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Ranking_OBAFOG_${dataAtual}.xlsx`);
}


// PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
//  CONSULTA DO ALUNO - Acesso ao e-mail e senha institucional via CPF + DN
// PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

/** Máscara CPF: 000.000.000-00 */
function normalizarCPF(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 11);
}

function formatarCPF(value) {
  const digits = normalizarCPF(value);
  if (digits.length !== 11) return String(value || '').trim();
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function mascaraCPF(input) {
  let v = normalizarCPF(input.value);
  if (v.length > 9)      v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
  input.value = v;
}

/** Máscara Data de Nascimento: DD/MM/AAAA */
function mascaraData(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 4)      v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
  input.value = v;
}

/** Abre o modal e limpa o estado anterior */
function abrirConsultaAluno() {
  const overlay = document.getElementById('modal-consulta-aluno');
  if (!overlay) return;
  document.getElementById('cpf-consulta-input').value = '';
  const dn = document.getElementById('dn-consulta-input');
  if (dn) dn.value = '';
  document.getElementById('consulta-erro').style.display = 'none';
  document.getElementById('consulta-resultado').style.display = 'none';
  document.getElementById('consulta-btn-texto').textContent = String.fromCodePoint(0x1F50D) + ' Procurar';
  document.getElementById('consulta-btn').disabled = false;
  overlay.classList.add('aberto');
  setTimeout(() => document.getElementById('cpf-consulta-input').focus(), 200);
}

/** Fecha o modal (só ao clicar no overlay externo) */
function fecharConsultaAluno(event) {
  if (event && event.target !== document.getElementById('modal-consulta-aluno')) return;
  const overlay = document.getElementById('modal-consulta-aluno');
  if (overlay) overlay.classList.remove('aberto');
}

/** Busca o aluno validando CPF + Data de Nascimento (DD/MM/AAAA) */
async function buscarAluno() {
  const input    = document.getElementById('cpf-consulta-input');
  const dnInput  = document.getElementById('dn-consulta-input');
  const erroEl   = document.getElementById('consulta-erro');
  const resultEl = document.getElementById('consulta-resultado');
  const btn      = document.getElementById('consulta-btn');
  const btnTxt   = document.getElementById('consulta-btn-texto');

  erroEl.style.display   = 'none';
  resultEl.style.display = 'none';

  const cpf = (input.value || '').trim();
  const dn  = (dnInput ? dnInput.value : '').trim();

  // Validação CPF
  if (cpf.replace(/\D/g, '').length < 11) {
    erroEl.textContent   = '\u26A0\uFE0F Preencha seu CPF completo (000.000.000-00).';
    erroEl.style.display = 'block';
    input.focus();
    return;
  }

  // Validação Data de Nascimento (DD/MM/AAAA = 10 caracteres)
  if (dn.replace(/\D/g, '').length < 8) {
    erroEl.textContent   = '\u26A0\uFE0F Preencha a Data de Nascimento completa (DD/MM/AAAA).';
    erroEl.style.display = 'block';
    if (dnInput) dnInput.focus();
    return;
  }

  btn.disabled       = true;
  btnTxt.textContent = '\u23F3 Buscando...';

  try {
    const { data, error } = await supabaseClient.rpc('consultar_acesso_aluno', {
      p_cpf:             cpf,
      p_data_nascimento: dn
    });
    if (error) throw error;

    if (!data || data.status === 'error') {
      erroEl.textContent   = (data && data.message)
        ? data.message
        : '\u274C CPF ou data de nascimento n\u00E3o correspondem a nenhum registro.';
      erroEl.style.display = 'block';
    } else {
      document.getElementById('resultado-nome').textContent  = data.nome  || '\u2014';
      document.getElementById('resultado-email').textContent = data.email || '\u2014';
      document.getElementById('resultado-senha').textContent = data.senha || '\u2014';
      resultEl.style.display = 'block';
    }
  } catch (err) {
    console.error('[buscarAluno]', err);
    erroEl.textContent   = '\u274C N\u00E3o foi poss\u00EDvel realizar a consulta. Tente novamente.';
    erroEl.style.display = 'block';
  } finally {
    btn.disabled       = false;
    btnTxt.textContent = String.fromCodePoint(0x1F50D) + ' Procurar';
  }
}

// Ficha de Ocorrência Individual em PDF
function gerarPDFIndividual(oId) {
  let o = OCORR_DATA.find(item => String(item.id) === String(oId));
  
  if (!o) {
    for (const item of TO_ALUNOS_CRITICOS) {
      const found = item.ocorrencias.find(x => String(x.id) === String(oId));
      if (found) {
        const al = item.aluno;
        o = {
          id: found.id,
          aluno_id: found.aluno_id,
          tipo: found.tipo,
          aluno: found.participante || al.nome,
          cpf: al.cpf || '',
          turma: al.turma || '',
          desc: found.descricao || '',
          hora: new Date(found.created_at || found.data_ocorr).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
          data: new Date(found.created_at || found.data_ocorr).toLocaleDateString('pt-BR'),
          tratada: found.descricao && found.descricao.includes('[TRATADA]')
        };
        break;
      }
    }
  }

  if (!o) { showToast('Ocorrência não encontrada', 'alerta'); return; }

  // Buscar dados completos do aluno
  const al = ALUNOS_DATA.find(a => a.id === o.aluno_id || a.cpf === o.cpf || a.nome === o.aluno);
  
  const label = {
    evasao: 'Evasão Escolar',
    indisciplina: 'Indisciplina',
    bullying: 'Bullying',
    agressao: 'Agressão Física',
    atraso: 'Atraso',
    liberado_coord: 'Liberado pela Coordenação',
    suspensao_celular: 'Suspensão por Uso de Celular'
  }[o.tipo] || o.tipo;

  const statusTexto = o.tratada ? 'TRATADA' : 'PENDENTE';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ficha de Ocorrência Disciplinar - ${o.aluno}</title>
      <style>
        @page { size: portrait; margin: 15mm; margin-top: 8mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; font-size: 13px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; margin-top: -20px; }
        .logo-escola { max-height: 120px; width: auto; object-fit: contain; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; position: relative; z-index: 10; }
        .header h2 { font-size: 16px; margin: 0 0 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .header .subtitle { font-size: 11.5px; text-transform: uppercase; color: #666; font-weight: bold; }
        
        .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; background: #f2f2f2; padding: 6px 10px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #333; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .label { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #555; display: block; }
        .value { font-size: 13px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
        
        .description-box { border: 1px solid #ccc; padding: 12px; min-height: 120px; border-radius: 4px; background: #fafafa; margin-top: 10px; white-space: pre-wrap; font-size: 12.5px; }
        
        .signatures { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature-line { text-align: center; margin-top: 30px; }
        .signature-line div { border-top: 1px solid #333; width: 80%; margin: 0 auto; padding-top: 5px; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #555; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; font-size: 10px; color: #888; }
        .logo-seduc { max-height: 38px; width: auto; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="header">
        <img class="logo-escola" src="assets/marca_dagua.png" alt="Escola Dr. Romildo Veloso e Silva">
        <h2>Ficha de Ocorrência Disciplinar</h2>
        <div class="subtitle">Controle Interno de Ocorrências e Medidas Disciplinares</div>
      </div>
      
      <div class="section-title">Dados do Aluno Envolvido</div>
      <div class="grid">
        <div class="field"><span class="label">Nome Completo</span><div class="value">${al ? al.nome : o.aluno}</div></div>
        <div class="field"><span class="label">CPF / Matrícula</span><div class="value">${al ? al.cpf || '—' : o.cpf || '—'}</div></div>
      </div>
      <div class="grid-3">
        <div class="field"><span class="label">Turma</span><div class="value">${al ? al.turma || '—' : o.turma || '—'}</div></div>
        <div class="field"><span class="label">Turno</span><div class="value">${al ? al.turno || '—' : '—'}</div></div>
        <div class="field"><span class="label">Transporte / Rota</span><div class="value">${al ? al.rota || 'Sem transporte' : '—'}</div></div>
      </div>
      <div class="grid">
        <div class="field"><span class="label">Responsável Legal</span><div class="value">${al ? al.resp || '—' : '—'}</div></div>
        <div class="field"><span class="label">Contato do Responsável</span><div class="value">${al ? al.contato || '—' : '—'}</div></div>
      </div>
      
      <div class="section-title">Informações do Registro</div>
      <div class="grid-3">
        <div class="field"><span class="label">Tipo de Ocorrência</span><div class="value"><strong>${label}</strong></div></div>
        <div class="field"><span class="label">Data / Hora</span><div class="value">${o.data} às ${o.hora}</div></div>
        <div class="field"><span class="label">Status do Registro</span><div class="value"><strong>${statusTexto}</strong></div></div>
      </div>
      
      <div class="section-title">Descrição Detalhada do Ocorrido</div>
      <div class="description-box">${o.desc}</div>
      
      <div class="signatures">
        <div class="signature-line">
          <br><br>
          <div>Assinatura do Aluno</div>
        </div>
        <div class="signature-line">
          <br><br>
          <div>Assinatura do Responsável</div>
        </div>
      </div>
      
      <div class="signatures" style="margin-top: 30px;">
        <div class="signature-line" style="grid-column: span 2; max-width: 300px; margin: 0 auto;">
          <br><br>
          <div>Assinatura da Coordenação / Direção</div>
        </div>
      </div>
      
      <div class="footer">
        <img class="logo-seduc" src="assets/cabecalho_logo.png" alt="Governo do Pará - SEDUC">
        <div>Ficha gerada eletronicamente pelo Sistema RVS Gestor em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
      </div>
    </body>
    </html>
  `;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  } else {
    showToast('Bloqueador de pop-ups ativo. Permita pop-ups para imprimir.', 'alerta');
  }
}

// Ficha de Registro de Aluno em PDF
function gerarPDFFichaAluno() {
  const cpf = getFichaCpfAtual();
  if (!cpf) return;
  const a = ALUNOS_DATA.find(x => x.cpf === cpf);
  if (!a) return;

  // Filtrar ocorrências deste aluno
  const ocorrs = OCORR_DATA.filter(o => 
    o.aluno === a.nome || o.aluno === a.cpf ||
    o.aluno.includes(a.nome) || (a.cpf && o.cpf === a.cpf)
  );

  const numFaltas = (a.historico || []).filter(h => h.tipo === 'falta').length;

  const ocorrsHtml = ocorrs.length === 0 
    ? '<p style="color:#666; font-style:italic; font-size:12px;">Nenhuma ocorrência registrada para este aluno.</p>'
    : ocorrs.map(o => {
        const label = {
          evasao: 'Evasão Escolar',
          indisciplina: 'Indisciplina',
          bullying: 'Bullying',
          agressao: 'Agressão Física',
          atraso: 'Atraso',
          liberado_coord: 'Liberado pela Coordenação',
          suspensao_celular: 'Suspensão por Uso de Celular'
        }[o.tipo] || o.tipo;
        const status = o.tratada ? 'Tratada' : 'Pendente';
        return `
          <div style="background:#fafafa; border:1px solid #ddd; border-radius:6px; padding:10px; margin-bottom:8px; page-break-inside:avoid;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11.5px;">
              <strong>${label}</strong>
              <span style="color:#555;">${o.data} às ${o.hora} | Status: <strong>${status}</strong></span>
            </div>
            <div style="font-size:12px; color:#444;">${o.desc}</div>
          </div>
        `;
      }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ficha Individual - ${a.nome}</title>
      <style>
        @page { size: portrait; margin: 15mm; margin-top: 8mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; font-size: 13px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; margin-top: -20px; }
        .logo-escola { max-height: 90px; width: auto; object-fit: contain; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; }
        .header h2 { font-size: 16px; margin: 0 0 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .header .subtitle { font-size: 11.5px; text-transform: uppercase; color: #666; font-weight: bold; }
        
        .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; background: #f2f2f2; padding: 6px 10px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #333; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .field { margin-bottom: 8px; }
        .label { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #555; display: block; }
        .value { font-size: 13px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
        
        .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; page-break-inside:avoid; }
        .signature-line { text-align: center; margin-top: 20px; }
        .signature-line div { border-top: 1px solid #333; width: 80%; margin: 0 auto; padding-top: 5px; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #555; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 8px; font-size: 10px; color: #888; }
        .logo-seduc { max-height: 38px; width: auto; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="header">
        <img class="logo-escola" src="assets/marca_dagua.png" alt="Escola Dr. Romildo Veloso e Silva">
        <h2>Ficha Individual do Aluno</h2>
        <div class="subtitle">Dossiê Escolar e Histórico Disciplinar</div>
      </div>
      
      <div class="section-title">Dados de Identificação</div>
      <div class="grid">
        <div class="field"><span class="label">Nome Completo</span><div class="value"><strong>${a.nome}</strong></div></div>
        <div class="field"><span class="label">CPF / Matrícula</span><div class="value">${a.cpf || '—'}</div></div>
      </div>
      <div class="grid-3">
        <div class="field"><span class="label">Turma</span><div class="value">${a.turma || '—'}</div></div>
        <div class="field"><span class="label">Turno</span><div class="value">${a.turno || '—'}</div></div>
        <div class="field"><span class="label">Transporte / Rota</span><div class="value">${a.rota || 'Sem transporte'}</div></div>
      </div>
      <div class="grid-3">
        <div class="field"><span class="label">Data de Nascimento</span><div class="value">${a.nasc ? new Date(a.nasc).toLocaleDateString('pt-BR') : '—'}</div></div>
        <div class="field"><span class="label">Idade</span><div class="value">${a.idade ? a.idade + ' anos' : '—'}</div></div>
        <div class="field"><span class="label">Total de Faltas</span><div class="value" style="color:#b91c1c; font-weight:bold;">${numFaltas} faltas</div></div>
      </div>
      <div class="grid">
        <div class="field"><span class="label">Responsável Legal</span><div class="value">${a.resp || '—'}</div></div>
        <div class="field"><span class="label">Contato do Responsável</span><div class="value">${a.contato || '—'}</div></div>
      </div>
      
      <div class="section-title">Histórico de Ocorrências Disciplinares</div>
      <div style="margin-top: 10px;">
        ${ocorrsHtml}
      </div>
      
      <div class="signatures">
        <div class="signature-line">
          <br><br>
          <div>Assinatura do Aluno</div>
        </div>
        <div class="signature-line">
          <br><br>
          <div>Assinatura do Responsável</div>
        </div>
      </div>
      
      <div class="signatures" style="margin-top: 20px;">
        <div class="signature-line" style="grid-column: span 2; max-width: 300px; margin: 0 auto;">
          <br><br>
          <div>Assinatura da Coordenação / Direção</div>
        </div>
      </div>
      
      <div class="footer">
        <img class="logo-seduc" src="assets/cabecalho_logo.png" alt="Governo do Pará - SEDUC">
        <div>Ficha gerada eletronicamente pelo Sistema RVS Gestor em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
      </div>
    </body>
    </html>
  `;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  } else {
    showToast('Bloqueador de pop-ups ativo. Permita pop-ups para imprimir.', 'alerta');
  }
}

// ============================================================================
// WHATSAPP AND AUTOMATED COMMUNICATION SYSTEM LOGIC
// ============================================================================
let WA_RESPONSAIVEIS = [];
let WA_RULES = [];
let WA_HISTORY = [];

// Inject custom CSS styling for switches seamlessly
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--gray3); transition: .3s; border-radius: 20px; }
    .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--green); }
    input:checked + .slider:before { transform: translateX(14px); }
  `;
  document.head.appendChild(style);
})();

function switchWaSubTab(btn, subtabId) {
  document.querySelectorAll('.wa-subtab').forEach(x => x.style.display = 'none');
  document.querySelectorAll('#page-whatsapp .tab-menu .tab-btn').forEach(x => x.classList.remove('active'));
  const target = document.getElementById(subtabId);
  if (target) target.style.display = 'block';
  btn.classList.add('active');
}

async function initWhatsAppPage() {
  console.log('[initWhatsAppPage] Initializing WhatsApp tab...');
  const btnResp = document.getElementById('btn-wa-subtab-responsaveis');
  if (btnResp) switchWaSubTab(btnResp, 'wa-subtab-responsaveis');
  
  await Promise.all([
    loadResponsaveisWa(),
    loadWaRules(),
    loadWaHistory(),
    loadWhatsAppStats()
  ]);
  popularWaAlunosSelect();
  popularWaCampanhaTurmas();
}

async function loadWhatsAppStats() {
  try {
    const res = await fetch('http://localhost:3001/api/whatsapp/stats');
    if (res.ok) {
      const stats = await res.json();
      const env = document.getElementById('ws-stats-enviados');
      const fal = document.getElementById('ws-stats-falhas');
      const pen = document.getElementById('ws-stats-pendentes');
      const tax = document.getElementById('ws-stats-taxa');
      if (env) env.textContent = stats.enviados || 0;
      if (fal) fal.textContent = stats.falhas || 0;
      if (pen) pen.textContent = stats.pendentes || 0;
      if (tax) tax.textContent = (stats.sucesso_percent !== undefined ? stats.sucesso_percent : 100) + '%';
    }
  } catch (err) {
    console.error('[loadWhatsAppStats] Error:', err);
  }
}

async function retryFailedNotifications() {
  showToast('Iniciando reenvio de falhas...', 'sucesso');
  try {
    const res = await fetch('http://localhost:3001/api/whatsapp/reenviar', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.sucesso) {
        showToast('Fila de reenvio processada!', 'sucesso');
        await loadWhatsAppStats();
        await loadWaHistory();
      } else {
        showToast('Erro ao reprocessar: ' + (data.mensagem || 'erro'), 'erro');
      }
    }
  } catch (err) {
    console.error('[retryFailedNotifications] Error:', err);
    showToast('Falha de conexão com o servidor WhatsApp.', 'erro');
  }
}

async function loadResponsaveisWa() {
  const { data, error } = await supabaseClient.from('responsaveis').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('[loadResponsaveisWa] Error:', error);
    showToast('Erro ao carregar responsáveis.', 'erro');
    return;
  }
  WA_RESPONSAIVEIS = data || [];
  renderResponsaveisWa();
}

function renderResponsaveisWa() {
  const tbody = document.getElementById('wa-responsaveis-tbody');
  if (!tbody) return;
  if (WA_RESPONSAIVEIS.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--gray5)">Nenhum responsável cadastrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = WA_RESPONSAIVEIS.map(r => {
    const aluno = ALUNOS_DATA.find(a => a.id === r.aluno_id);
    const alunoNome = aluno ? aluno.nome : 'Aluno não localizado';
    const activeChecked = r.notificacoes_ativas ? 'checked' : '';
    return `
      <tr>
        <td style="font-weight:600; color:var(--gray7)">${alunoNome}</td>
        <td>${r.nome}</td>
        <td><a href="https://wa.me/${r.whatsapp}" target="_blank" style="color:var(--green); text-decoration:none; display:inline-flex; align-items:center; gap:4px">
          <i data-lucide="phone" style="width:12px; height:12px"></i> ${r.whatsapp}
        </a></td>
        <td><span class="badge" style="background:var(--gray3); color:var(--gray6)">${r.parentesco || 'Responsável'}</span></td>
        <td>
          <label class="switch">
            <input type="checkbox" ${activeChecked} onchange="toggleWaNotif('${r.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td style="text-align:right">
          <button class="btn btn-outline btn-xs" onclick="editarWaResponsavel('${r.id}')" style="margin-right:4px">Editar</button>
          <button class="btn btn-red btn-xs" onclick="excluirWaResponsavel('${r.id}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

function filtrarWaResponsaveis() {
  const q = document.getElementById('wa-filtro-responsavel').value.toLowerCase().trim();
  const tbody = document.getElementById('wa-responsaveis-tbody');
  if (!tbody) return;
  const filtered = WA_RESPONSAIVEIS.filter(r => {
    const aluno = ALUNOS_DATA.find(a => a.id === r.aluno_id);
    const alunoNome = aluno ? aluno.nome.toLowerCase() : '';
    return r.nome.toLowerCase().includes(q) || r.whatsapp.includes(q) || alunoNome.includes(q);
  });
  tbody.innerHTML = filtered.map(r => {
    const aluno = ALUNOS_DATA.find(a => a.id === r.aluno_id);
    const alunoNome = aluno ? aluno.nome : 'Aluno não localizado';
    const activeChecked = r.notificacoes_ativas ? 'checked' : '';
    return `
      <tr>
        <td style="font-weight:600; color:var(--gray7)">${alunoNome}</td>
        <td>${r.nome}</td>
        <td><a href="https://wa.me/${r.whatsapp}" target="_blank" style="color:var(--green); text-decoration:none; display:inline-flex; align-items:center; gap:4px">
          <i data-lucide="phone" style="width:12px; height:12px"></i> ${r.whatsapp}
        </a></td>
        <td><span class="badge" style="background:var(--gray3); color:var(--gray6)">${r.parentesco || 'Responsável'}</span></td>
        <td>
          <label class="switch">
            <input type="checkbox" ${activeChecked} onchange="toggleWaNotif('${r.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td style="text-align:right">
          <button class="btn btn-outline btn-xs" onclick="editarWaResponsavel('${r.id}')" style="margin-right:4px">Editar</button>
          <button class="btn btn-red btn-xs" onclick="excluirWaResponsavel('${r.id}')">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
  if (window.lucide) window.lucide.createIcons();
}

async function toggleWaNotif(id, active) {
  const { error } = await supabaseClient.from('responsaveis').update({ notificacoes_ativas: active }).eq('id', id);
  if (error) {
    console.error('[toggleWaNotif] Error:', error);
    showToast('Erro ao atualizar notificação.', 'erro');
    return;
  }
  const r = WA_RESPONSAIVEIS.find(x => x.id === id);
  if (r) r.notificacoes_ativas = active;
  showToast('Notificação atualizada!', 'sucesso');
}

function popularWaAlunosSelect() {
  const select = document.getElementById('wa-resp-aluno-id');
  if (!select) return;
  const sorted = [...ALUNOS_DATA].sort((a,b) => a.nome.localeCompare(b.nome));
  select.innerHTML = sorted.map(a => `<option value="${a.id}">${a.nome} (${a.turma || 'Sem turma'})</option>`).join('');
}

function openWaNovoResponsavelModal() {
  document.getElementById('wa-resp-id').value = '';
  document.getElementById('wa-resp-nome').value = '';
  document.getElementById('wa-resp-phone').value = '';
  document.getElementById('wa-resp-parentesco').value = '';
  document.getElementById('wa-resp-notif').checked = true;
  document.getElementById('wa-resp-aluno-group').style.display = 'block';
  openModal('modal-wa-responsavel');
}

function editarWaResponsavel(id) {
  const r = WA_RESPONSAIVEIS.find(x => x.id === id);
  if (!r) return;
  document.getElementById('wa-resp-id').value = r.id;
  document.getElementById('wa-resp-nome').value = r.nome;
  document.getElementById('wa-resp-phone').value = r.whatsapp;
  document.getElementById('wa-resp-parentesco').value = r.parentesco || '';
  document.getElementById('wa-resp-notif').checked = r.notificacoes_ativas;
  document.getElementById('wa-resp-aluno-group').style.display = 'none';
  openModal('modal-wa-responsavel');
}

async function salvarResponsavelWa() {
  const id = document.getElementById('wa-resp-id').value;
  const aluno_id = document.getElementById('wa-resp-aluno-id').value;
  const nome = document.getElementById('wa-resp-nome').value.trim();
  const whatsapp = document.getElementById('wa-resp-phone').value.trim();
  const parentesco = document.getElementById('wa-resp-parentesco').value.trim();
  const notificacoes_ativas = document.getElementById('wa-resp-notif').checked;

  if (!nome || !whatsapp) {
    showToast('Nome e WhatsApp são obrigatórios!', 'alerta');
    return;
  }

  const payload = { nome, whatsapp, parentesco, notificacoes_ativas };

  if (id) {
    const { error } = await supabaseClient.from('responsaveis').update(payload).eq('id', id);
    if (error) {
      console.error('[salvarResponsavelWa] Update error:', error);
      showToast('Erro ao atualizar: ' + error.message, 'erro');
      return;
    }
    showToast('Responsável atualizado! ✅', 'sucesso');
  } else {
    payload.aluno_id = aluno_id;
    const { error } = await supabaseClient.from('responsaveis').insert(payload);
    if (error) {
      console.error('[salvarResponsavelWa] Insert error:', error);
      showToast('Erro ao cadastrar: ' + error.message, 'erro');
      return;
    }
    showToast('Responsável cadastrado! ✅', 'sucesso');
  }

  closeModal('modal-wa-responsavel');
  await loadResponsaveisWa();
  
  const fichaAlunoId = document.getElementById('ficha-aluno-id')?.value;
  if (fichaAlunoId) renderResponsaveisFicha(fichaAlunoId);
}

async function excluirWaResponsavel(id) {
  if (!confirm('Deseja realmente excluir este responsável?')) return;
  const { error } = await supabaseClient.from('responsaveis').delete().eq('id', id);
  if (error) {
    console.error('[excluirWaResponsavel] Error:', error);
    showToast('Erro ao excluir responsável.', 'erro');
    return;
  }
  showToast('Responsável excluído! 🗑', 'sucesso');
  await loadResponsaveisWa();
  
  const fichaAlunoId = document.getElementById('ficha-aluno-id')?.value;
  if (fichaAlunoId) renderResponsaveisFicha(fichaAlunoId);
}

async function renderResponsaveisFicha(alunoId) {
  const container = document.getElementById('ficha-responsaveis-lista');
  if (!container) return;
  
  container.innerHTML = '<div style="font-size:12px;color:var(--gray5)">Carregando...</div>';
  const { data, error } = await supabaseClient.from('responsaveis').select('*').eq('aluno_id', alunoId);
  
  if (error) {
    console.error('[renderResponsaveisFicha] Error:', error);
    container.innerHTML = '<div style="font-size:12px;color:var(--red)">Erro ao carregar responsáveis.</div>';
    return;
  }
  
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div style="font-size:12.5px;color:var(--gray5);display:flex;justify-content:space-between;align-items:center;width:100%">
        <span>Nenhum responsável cadastrado.</span>
        <button class="btn btn-outline btn-xs" onclick="abrirAddResponsavelFicha('${alunoId}')">+ Vincular</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = data.map(r => `
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--gray2);padding:6px 10px;border-radius:8px;font-size:12px;width:100%">
      <div>
        <span style="font-weight:600;color:var(--gray8)">${r.nome}</span>
        <span style="color:var(--gray5);font-size:11px"> (${r.parentesco || 'Responsável'})</span>
        <div style="color:var(--green);font-size:11px;margin-top:2px;display:flex;align-items:center;gap:4px">
          <i data-lucide="phone" style="width:10px;height:10px"></i> ${r.whatsapp}
        </div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn btn-outline btn-xs" style="padding:2px 4px;font-size:10px" onclick="editarWaResponsavel('${r.id}')">✏️</button>
        <button class="btn btn-red btn-xs" style="padding:2px 4px;font-size:10px" onclick="excluirWaResponsavel('${r.id}')">🗑</button>
      </div>
    </div>
  `).join('') + `
    <div style="text-align:right;margin-top:4px;width:100%">
      <button class="btn btn-outline btn-xs" onclick="abrirAddResponsavelFicha('${alunoId}')">+ Novo Responsável</button>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

async function renderResponsaveisFicha(alunoId) {
  const container = document.getElementById('ficha-responsaveis-lista');
  if (!container) return;

  setFichaCounter('ficha-responsaveis-count', 'Carregando...');
  setFichaText('ficha-total-responsaveis', '...');
  container.innerHTML = '<div class="ficha-empty-inline">Carregando responsáveis vinculados...</div>';

  const { data, error } = await supabaseClient.from('responsaveis').select('*').eq('aluno_id', alunoId);

  if (error) {
    console.error('[renderResponsaveisFicha] Error:', error);
    setFichaCounter('ficha-responsaveis-count', 'Erro');
    setFichaText('ficha-total-responsaveis', '—');
    container.innerHTML = '<div class="ficha-empty-inline" style="color:var(--red-dark)">Não foi possível carregar os responsáveis deste aluno.</div>';
    return;
  }

  const lista = data || [];
  setFichaText('ficha-total-responsaveis', String(lista.length));
  setFichaCounter('ficha-responsaveis-count', lista.length, 'contato', 'contatos');

  if (!lista.length) {
    container.innerHTML = `
      <div class="ficha-empty-inline">Nenhum responsável cadastrado para este aluno.</div>
      <div class="ficha-section-cta">
        <button class="btn btn-outline btn-xs" onclick="abrirAddResponsavelFicha('${alunoId}')">+ Vincular Responsável</button>
      </div>
    `;
    return;
  }

  container.innerHTML = lista.map(r => {
    const telefone = String(r.whatsapp || '').trim();
    const telefoneLink = telefone ? telefone.replace(/\D/g, '') : '';
    const contatoHtml = telefoneLink
      ? `<a class="ficha-contact-link" href="https://wa.me/${telefoneLink}" target="_blank" rel="noopener noreferrer"><i data-lucide="phone" style="width:12px;height:12px"></i>${telefone}</a>`
      : `<span style="margin-top:8px;display:block">Telefone não informado.</span>`;

    return `
      <div class="ficha-contact-card">
        <div class="ficha-contact-copy">
          <strong>${r.nome}</strong>
          <span>${r.parentesco || 'Responsável'} • ${r.notificacoes_ativas ? 'Recebe notificações' : 'Notificações desativadas'}</span>
          ${contatoHtml}
        </div>
        <div class="ficha-contact-actions">
          <button class="btn btn-outline btn-xs" onclick="editarWaResponsavel('${r.id}')">Editar</button>
          <button class="btn btn-red btn-xs" onclick="excluirWaResponsavel('${r.id}')">Excluir</button>
        </div>
      </div>`;
  }).join('') + `
    <div class="ficha-section-cta">
      <button class="btn btn-outline btn-xs" onclick="abrirAddResponsavelFicha('${alunoId}')">+ Novo Responsável</button>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

function abrirAddResponsavelFicha(alunoId) {
  openWaNovoResponsavelModal();
  document.getElementById('wa-resp-aluno-id').value = alunoId;
  document.getElementById('wa-resp-aluno-group').style.display = 'none';
}

async function loadWaRules() {
  const { data, error } = await supabaseClient.from('automation_rules').select('*').order('name');
  if (error) {
    console.error('[loadWaRules] Error:', error);
    return;
  }
  WA_RULES = data || [];
  renderWaRules();
}

function renderWaRules() {
  const grid = document.getElementById('wa-automacoes-grid');
  if (!grid) return;
  if (WA_RULES.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--gray5)">Nenhuma regra configurada.</div>`;
    return;
  }
  grid.innerHTML = WA_RULES.map(r => {
    const icon = r.event_type === 'ENTRADA' ? '🔔' : (r.event_type === 'SAIDA' ? '🔕' : (r.event_type === 'EVASAO' ? '⚠️' : '📋'));
    const statusLabel = r.active ? '<span class="metric-badge badge-green">Ativo</span>' : '<span class="metric-badge badge-red">Inativo</span>';
    return `
      <div class="profile-card" style="margin:0; display:flex; flex-direction:column; justify-content:space-between">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
            <span style="font-weight:700; font-size:14px; color:var(--gray7)">${icon} ${r.name}</span>
            ${statusLabel}
          </div>
          <div style="background:var(--gray2); padding:10px; border-radius:8px; font-family:monospace; font-size:11px; white-space:pre-wrap; color:var(--gray6); margin-top:8px; max-height:120px; overflow-y:auto; border:1px solid var(--gray3)">${r.message_template}</div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="openWaEditRule('${r.id}')" style="margin-top:12px; width:100%">⚙️ Ajustar Template</button>
      </div>
    `;
  }).join('');
}

function openWaEditRule(id) {
  const r = WA_RULES.find(x => x.id === id);
  if (!r) return;
  document.getElementById('wa-rule-id').value = r.id;
  document.getElementById('wa-rule-name').value = r.name;
  document.getElementById('wa-rule-template').value = r.message_template;
  document.getElementById('wa-rule-active').checked = r.active;
  openModal('modal-wa-edit-rule');
}

async function salvarRuleWa() {
  const id = document.getElementById('wa-rule-id').value;
  const message_template = document.getElementById('wa-rule-template').value.trim();
  const active = document.getElementById('wa-rule-active').checked;

  if (!message_template) {
    showToast('O template da mensagem não pode ser vazio!', 'alerta');
    return;
  }

  const { error } = await supabaseClient.from('automation_rules').update({ message_template, active }).eq('id', id);
  if (error) {
    console.error('[salvarRuleWa] Error:', error);
    showToast('Erro ao salvar regra: ' + error.message, 'erro');
    return;
  }

  showToast('Regra de automação atualizada! ✅', 'sucesso');
  closeModal('modal-wa-edit-rule');
  await loadWaRules();
}

function popularWaCampanhaTurmas() {
  const select = document.getElementById('wa-campanha-turmas');
  if (!select) return;
  const turmas = [...new Set(ALUNOS_DATA.map(a => a.turma).filter(Boolean))].sort();
  select.innerHTML = '<option value="TODOS" selected>Todos os Responsáveis Cadastrados</option>' + 
    turmas.map(t => {
      const tObj = TURMAS_DATA.find(x => x.code === t);
      const desc = tObj ? ` (${tObj.serie} - ${tObj.turno})` : '';
      return `<option value="${t}">${t}${desc}</option>`;
    }).join('');
}

async function iniciarDisparoMassa() {
  const titulo = document.getElementById('wa-campanha-titulo').value.trim();
  const mensagem = document.getElementById('wa-campanha-mensagem').value.trim();
  const selectTurmas = document.getElementById('wa-campanha-turmas');
  
  if (!titulo || !mensagem) {
    showToast('Título e Mensagem são obrigatórios!', 'alerta');
    return;
  }

  let destTurmas = 'TODOS';
  const selectedOptions = Array.from(selectTurmas.selectedOptions).map(o => o.value);
  if (selectedOptions.length > 0 && !selectedOptions.includes('TODOS')) {
    destTurmas = selectedOptions.map(code => {
      const tObj = TURMAS_DATA.find(x => x.code === code);
      return tObj ? tObj.id : null;
    }).filter(Boolean);
    
    if (destTurmas.length === 0) {
      showToast('Erro ao resolver turmas selecionadas.', 'erro');
      return;
    }
  }

  const btn = document.querySelector('button[onclick="iniciarDisparoMassa()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando disparos...'; }

  try {
    const res = await fetch('http://localhost:3001/api/comunicados/disparar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, mensagem, destinatariosTurmas: destTurmas })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.sucesso) {
        showToast('Disparos em massa iniciados! 🚀', 'sucesso');
        const container = document.getElementById('wa-campanha-progresso-container');
        if (container) container.style.display = 'block';
        
        monitorarProgressoCampanha(data.campanhaId);
        
        document.getElementById('wa-campanha-titulo').value = '';
        document.getElementById('wa-campanha-mensagem').value = '';
      } else {
        showToast('Nenhum destinatário elegível encontrado.', 'alerta');
        if (btn) { btn.disabled = false; btn.textContent = '🚀 Iniciar Disparos (background)'; }
      }
    } else {
      const errData = await res.json();
      showToast('Erro no servidor: ' + (errData.erro || 'erro'), 'erro');
      if (btn) { btn.disabled = false; btn.textContent = '🚀 Iniciar Disparos (background)'; }
    }
  } catch (err) {
    console.error('[iniciarDisparoMassa] Error:', err);
    showToast('Erro ao conectar com o servidor WhatsApp local.', 'erro');
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Iniciar Disparos (background)'; }
  }
}

function monitorarProgressoCampanha(campanhaId) {
  const statusEl = document.getElementById('wa-campanha-status');
  const percentEl = document.getElementById('wa-campanha-progresso-percent');
  const barEl = document.getElementById('wa-campanha-progresso-bar');
  const sucessosEl = document.getElementById('wa-campanha-progresso-sucessos');
  const falhasEl = document.getElementById('wa-campanha-progresso-falhas');
  const btn = document.querySelector('button[onclick="iniciarDisparoMassa()"]');

  const pollInterval = setInterval(async () => {
    try {
      const { data, error } = await supabaseClient.from('comunicados').select('*').eq('id', campanhaId).single();
      if (error) {
        console.error('[monitorarProgressoCampanha] Supabase fetch error:', error);
        return;
      }

      if (data) {
        const total = data.total_destinatarios || 0;
        const sucessos = data.enviados_sucesso || 0;
        const falhas = data.falhas || 0;
        const processed = sucessos + falhas;
        const percent = total > 0 ? Math.round((processed / total) * 100) : 100;

        if (statusEl) statusEl.textContent = `Status: ${data.status || 'Processando'}`;
        if (percentEl) percentEl.textContent = `${percent}%`;
        if (barEl) barEl.style.width = `${percent}%`;
        if (sucessosEl) sucessosEl.textContent = `Sucesso: ${sucessos}`;
        if (falhasEl) falhasEl.textContent = `Falhas: ${falhas}`;

        if (data.status === 'CONCLUIDO' || data.status === 'FALHA' || percent >= 100) {
          clearInterval(pollInterval);
          if (statusEl) statusEl.textContent = 'Disparos finalizados!';
          showToast('Campanha de WhatsApp finalizada com sucesso! ✅', 'sucesso');
          if (btn) { btn.disabled = false; btn.textContent = '🚀 Iniciar Disparos (background)'; }
          
          await loadWhatsAppStats();
          await loadWaHistory();
        }
      }
    } catch (err) {
      console.error('[monitorarProgressoCampanha] Error:', err);
    }
  }, 3000);
}

async function loadWaHistory() {
  const { data, error } = await supabaseClient
    .from('whatsapp_envios')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('[loadWaHistory] Error:', error);
    return;
  }
  WA_HISTORY = data || [];
  renderWaHistory();
}

function renderWaHistory() {
  const tbody = document.getElementById('wa-historico-tbody');
  if (!tbody) return;
  if (WA_HISTORY.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--gray5)">Nenhum log de disparo encontrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = WA_HISTORY.map(h => {
    const dateFormatted = new Date(h.created_at).toLocaleString('pt-BR');
    const statusClass = h.status === 'ENVIADO' ? 'badge-green' : (h.status === 'PENDENTE' ? 'badge-yellow' : 'badge-red');
    
    const resp = WA_RESPONSAIVEIS.find(x => x.id === h.responsavel_id);
    const respNome = resp ? resp.nome : 'Responsável';

    return `
      <tr>
        <td style="color:var(--gray5); font-size:12px">${dateFormatted}</td>
        <td>
          <span style="font-weight:600">${respNome}</span>
          <div style="font-size:11px; color:var(--gray4)">${h.whatsapp_destino}</div>
        </td>
        <td><span class="badge" style="background:var(--gray3); color:var(--gray6)">${h.tipo_evento}</span></td>
        <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title="${h.mensagem}">${h.mensagem}</td>
        <td><span class="metric-badge ${statusClass}">${h.status}</span></td>
        <td style="color:var(--red); font-size:11.5px; max-width:200px; word-wrap:break-word">${h.erro_log || '—'}</td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// TRATAMENTO DE OCORRÊNCIAS & ALERTAS (≥ 3 OCORRÊNCIAS)
// ============================================================================
let TO_ALUNOS_CRITICOS = [];

async function initTratamentoOcorrenciasPage() {
  console.log('[initTratamentoOcorrenciasPage] Initializing Treatment tab...');
  if (WA_RESPONSAIVEIS.length === 0) {
    const { data: resps } = await supabaseClient.from('responsaveis').select('*');
    if (resps) WA_RESPONSAIVEIS = resps;
  }
  popularToSelectTurmas();
  await loadTratamentoOcorrencias();
}

function popularToSelectTurmas() {
  const select = document.getElementById('to-filtro-turma');
  if (!select) return;
  const codes = [...new Set(ALUNOS_DATA.map(a => a.turma).filter(Boolean))].sort();
  select.innerHTML = '<option value="">Todas as turmas</option>' + 
    codes.map(c => `<option value="${c}">${c}</option>`).join('');
}

async function loadTratamentoOcorrencias() {
  const toLista = document.getElementById('to-alunos-alertas-lista');
  if (toLista) toLista.innerHTML = '<div style="padding:20px; text-align:center; color:var(--gray5)">Calculando limites e carregando dados...</div>';

  const ocorrsPorAluno = {};
  
  const { data: ocorrsDb, error: errOcorrs } = await supabaseClient
    .from('ocorrencias')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (errOcorrs) {
    console.error('[loadTratamentoOcorrencias] Error fetching occurrences:', errOcorrs);
    showToast('Erro ao atualizar ocorrências.', 'erro');
    return;
  }

  const listOcorrs = ocorrsDb || [];
  listOcorrs.forEach(o => {
    if (!o.aluno_id) return;
    if (!ocorrsPorAluno[o.aluno_id]) {
      ocorrsPorAluno[o.aluno_id] = [];
    }
    ocorrsPorAluno[o.aluno_id].push(o);
  });

  TO_ALUNOS_CRITICOS = [];
  let totalOcorrsCriticas = 0;

  ALUNOS_DATA.forEach(a => {
    const alunoOcorrs = ocorrsPorAluno[a.id] || [];
    if (alunoOcorrs.length >= 3 && a.status === 'ativo') {
      TO_ALUNOS_CRITICOS.push({
        aluno: a,
        ocorrencias: alunoOcorrs
      });
      totalOcorrsCriticas += alunoOcorrs.length;
    }
  });

  const statsCriticos = document.getElementById('to-stats-criticos');
  const statsTotal = document.getElementById('to-stats-total');
  if (statsCriticos) statsCriticos.textContent = TO_ALUNOS_CRITICOS.length;
  if (statsTotal) statsTotal.textContent = totalOcorrsCriticas;

  renderTratamentoOcorrencias();
}

function renderTratamentoOcorrencias() {
  const container = document.getElementById('to-alunos-alertas-lista');
  if (!container) return;

  if (TO_ALUNOS_CRITICOS.length === 0) {
    container.innerHTML = emptyState('🛡️', 'Nenhum Aluno Crítico', 'Todos os alunos estão em conformidade com o regimento escolar (menos de 3 ocorrências).');
    return;
  }

  container.innerHTML = TO_ALUNOS_CRITICOS.map(item => {
    const a = item.aluno;
    const ocorrs = item.ocorrencias;
    const count = ocorrs.length;
    
    const recentes = ocorrs.slice(0, 3);
    const ocorrsHtml = recentes.map(o => {
      const data = new Date(o.created_at || o.data_ocorr).toLocaleDateString('pt-BR');
      const tipoLabel = { evasao: '🚨 Evasão', indisciplina: '⚠️ Indisciplina', atraso: '⏰ Atraso', liberado_coord: '🟢 Liberado', suspensao_celular: '📵 Celular' }[o.tipo] || o.tipo;
      
      let desc = o.descricao || '';
      const isSuspensa = desc.includes('[SUSPENSÃO]');
      
      return `
        <div style="background:var(--gray1); padding:10px; border-radius:8px; margin-bottom:8px; border-left:3px solid ${isSuspensa ? 'var(--red)' : 'var(--orange)'}; font-size:12.5px">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:center">
            <span style="font-weight:600; color:var(--gray7)">${tipoLabel}</span>
            <div style="display:flex; align-items:center; gap:8px">
              <span style="color:var(--gray4); font-size:11px">${data}</span>
              <button class="btn btn-xs btn-outline" style="padding:2px 6px; font-size:10px; height:auto; border-color:var(--blue); color:var(--blue)" onclick="event.stopPropagation();gerarPDFIndividual('${o.id}')" title="Imprimir Ocorrência Individual">🖨️ PDF</button>
            </div>
          </div>
          <p style="color:var(--gray5); font-size:12px; margin:0">${desc}</p>
        </div>
      `;
    }).join('');

    const responsavelFicha = WA_RESPONSAIVEIS.find(r => r.aluno_id === a.id);
    const respContatoStr = responsavelFicha ? `${responsavelFicha.nome} (${responsavelFicha.parentesco}) - ${responsavelFicha.whatsapp}` : 'Nenhum vinculado';

    return `
      <div class="profile-card" style="margin:0; padding:20px; border:1px solid rgba(220, 38, 38, 0.2); border-left:6px solid var(--red); background:rgba(220, 38, 38, 0.02)">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px">
          
          <div style="flex:1; min-width:280px">
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:12px">
              <div style="position:relative">
                <div class="user-avatar" style="width:48px; height:48px; background:var(--red-light); color:var(--red); font-size:18px; font-weight:700">
                  ${a.nome.substring(0, 2).toUpperCase()}
                </div>
                <span style="position:absolute; top:-6px; right:-6px; background:var(--red); color:white; font-size:11px; font-weight:700; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; border:2px solid #fff" title="Total de Ocorrências">
                  ${count}
                </span>
              </div>
              <div>
                <h4 style="margin:0; font-size:16px; color:var(--gray8); font-weight:700">${a.nome}</h4>
                <p style="margin:2px 0 0 0; font-size:12px; color:var(--gray5)">Turma: <strong>${a.turma || '—'}</strong> | Turno: ${a.turno || '—'} | Rota: ${a.rota || '—'}</p>
                <p style="margin:4px 0 0 0; font-size:11px; color:var(--green); font-weight:600">👤 Resp: ${respContatoStr}</p>
              </div>
            </div>
            
            <div style="margin-top:16px">
              <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; color:var(--gray4); margin-bottom:8px">Últimas 3 Ocorrências do Aluno:</div>
              ${ocorrsHtml}
              ${count > 3 ? `<div style="font-size:11px; color:var(--gray4); text-align:right">+ ${count - 3} ocorrências mais antigas registradas no dossiê...</div>` : ''}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:200px">
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--gray4); text-align:center">Ações Recomendadas</div>
            <button class="btn btn-red btn-sm" onclick="abrirSuspensaoOcorr('${a.id}')" style="width:100%; justify-content:center; background:var(--red)">
              🚫 Aplicar Suspensão
            </button>
            <button class="btn btn-outline btn-sm" onclick="gerarPDFTratamento('${a.id}')" style="width:100%; justify-content:center; border-color:var(--orange); color:var(--orange)">
              🖨️ Imprimir Termo/Ata
            </button>
            <button class="btn btn-outline btn-xs" onclick="verFicha('${a.cpf}')" style="width:100%; justify-content:center; margin-top:8px">
              🔍 Ver Ficha Completa
            </button>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

function filtrarTratamentoOcorrencias() {
  const busca = document.getElementById('to-filtro-busca').value.toLowerCase().trim();
  const turma = document.getElementById('to-filtro-turma').value;
  
  const cards = document.querySelectorAll('#to-alunos-alertas-lista > .profile-card');
  TO_ALUNOS_CRITICOS.forEach((item, index) => {
    const a = item.aluno;
    const matchesBusca = a.nome.toLowerCase().includes(busca);
    const matchesTurma = !turma || a.turma === turma;
    
    const card = cards[index];
    if (card) {
      card.style.display = (matchesBusca && matchesTurma) ? 'block' : 'none';
    }
  });
}

function abrirGerarComunicadoOcorr(alunoId) {
  const item = TO_ALUNOS_CRITICOS.find(x => x.aluno.id === alunoId);
  if (!item) return;

  const a = item.aluno;
  document.getElementById('to-comunicado-aluno-id').value = a.id;
  
  const select = document.getElementById('to-comunicado-responsavel-select');
  if (select) {
    const resps = WA_RESPONSAIVEIS.filter(r => r.aluno_id === a.id);
    if (resps.length === 0) {
      select.innerHTML = '<option value="">Nenhum responsável cadastrado</option>';
    } else {
      select.innerHTML = resps.map(r => `<option value="${r.id}">${r.nome} (${r.parentesco}) - ${r.whatsapp}</option>`).join('');
    }
  }

  const msgTextarea = document.getElementById('to-comunicado-mensagem');
  if (msgTextarea) {
    const listTipos = item.ocorrencias.slice(0, 3).map(o => {
      const label = { evasao: 'Evasão', indisciplina: 'Indisciplina', atraso: 'Atraso', liberado_coord: 'Liberado', suspensao_celular: 'Uso de Celular' }[o.tipo] || o.tipo;
      const data = new Date(o.created_at || o.data_ocorr).toLocaleDateString('pt-BR');
      return `• ${label} (em ${data})`;
    }).join('\n');

    msgTextarea.value = `Prezado(a) responsável,\n\nEntramos em contato para alertar que o(a) aluno(a) *${a.nome}* atingiu um limite crítico de *${item.ocorrencias.length} ocorrências* disciplinares registradas em nosso sistema pedagógico.\n\nÚltimos registros:\n${listTipos}\n\nJustificativa: Solicitamos o seu comparecimento ao colégio com urgência para conversarmos com a coordenação e alinharmos o plano de acompanhamento pedagógico do estudante.\n\nAtenciosamente,\nCoordenação Pedagógica RVS.`;
  }

  openModal('modal-wa-comunicado-alerta');
}

async function salvarComunicadoPaisOcorr() {
  const alunoId = document.getElementById('to-comunicado-aluno-id').value;
  const respId = document.getElementById('to-comunicado-responsavel-select').value;
  const mensagem = document.getElementById('to-comunicado-mensagem').value.trim();

  if (!respId) {
    showToast('Adicione ou selecione um responsável antes de enviar!', 'alerta');
    return;
  }
  if (!mensagem) {
    showToast('A mensagem não pode estar vazia!', 'alerta');
    return;
  }

  const resp = WA_RESPONSAIVEIS.find(x => x.id === respId);
  if (!resp) return;

  const btn = document.querySelector('button[onclick="salvarComunicadoPaisOcorr()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  try {
    const { data: logData, error: logErr } = await supabaseClient
      .from('whatsapp_envios')
      .insert({
        responsavel_id: resp.id,
        tipo_evento: 'OCORRENCIA',
        mensagem: mensagem,
        whatsapp_destino: resp.whatsapp,
        status: 'PENDENTE'
      }).select().single();

    if (logErr) throw logErr;

    const res = await fetch('http://localhost:3001/api/comunicados/disparar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: `Comunicado Crítico - Aluno: ${TO_ALUNOS_CRITICOS.find(x => x.aluno.id === alunoId)?.aluno.nome}`,
        mensagem: mensagem,
        destinatariosTurmas: 'TODOS'
      })
    });

    if (res.ok) {
      showToast('Comunicado de alerta disparado com sucesso! 🚀', 'sucesso');
      if (logData) {
        await supabaseClient.from('whatsapp_envios').update({ status: 'ENVIADO', updated_at: new Date().toISOString() }).eq('id', logData.id);
      }
    } else {
      showToast('Alerta enfileirado para reenvio. Verifique o servidor local.', 'alerta');
      if (logData) {
        await supabaseClient.from('whatsapp_envios').update({ status: 'FALHA', erro_log: 'Servidor local offline', updated_at: new Date().toISOString() }).eq('id', logData.id);
      }
    }
  } catch (err) {
    console.error('[salvarComunicadoPaisOcorr] Error:', err);
    showToast('Falha na transmissão. Fila de disparos atualizada.', 'alerta');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Enviar via WhatsApp'; }
    closeModal('modal-wa-comunicado-alerta');
    await loadTratamentoOcorrencias();
  }
}

function abrirSuspensaoOcorr(alunoId) {
  const item = TO_ALUNOS_CRITICOS.find(x => x.aluno.id === alunoId);
  if (!item) return;

  document.getElementById('to-suspensao-aluno-id').value = alunoId;
  document.getElementById('to-suspensao-data-inicio').value = new Date().toISOString().split('T')[0];
  document.getElementById('to-suspensao-data-fim').value = '';
  document.getElementById('to-suspensao-motivo').value = '';

  openModal('modal-aplicar-suspensao');
}

async function salvarSuspensaoOcorr() {
  const alunoId = document.getElementById('to-suspensao-aluno-id').value;
  const dataInicio = document.getElementById('to-suspensao-data-inicio').value;
  const dataFim = document.getElementById('to-suspensao-data-fim').value;
  const motivo = document.getElementById('to-suspensao-motivo').value.trim();

  if (!dataInicio || !dataFim || !motivo) {
    showToast('Preencha todas as datas e o motivo da suspensão!', 'alerta');
    return;
  }

  const item = TO_ALUNOS_CRITICOS.find(x => x.aluno.id === alunoId);
  if (!item) return;

  const a = item.aluno;
  const dataInicioBr = new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR');
  const dataFimBr = new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR');

  const descFinal = `[SUSPENSÃO] Aluno suspenso no período de ${dataInicioBr} a ${dataFimBr}.\nMotivo: ${motivo}\nAutorizado por: Coordenação Pedagógica`;

  const payload = {
    tipo: 'indisciplina',
    aluno_id: a.id,
    turma_id: TURMAS_DATA.find(t => t.code === a.turma)?.id || null,
    participante: a.nome,
    descricao: descFinal,
    auto_gerada: false
  };

  const btn = document.querySelector('button[onclick="salvarSuspensaoOcorr()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Gravando...'; }

  try {
    const { data: insertedOcorr, error } = await supabaseClient.from('ocorrencias').insert(payload).select().single();
    if (error) throw error;

    showToast('Suspensão registrada com sucesso no dossiê! 🚫', 'sucesso');
    
    const oData = new Date().toLocaleDateString('pt-BR');
    const oHora = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
    OCORR_DATA.push({
      id: insertedOcorr?.id || Date.now(),
      tipo: 'indisciplina', icon: '📵', aluno: a.nome, turma: a.turma,
      desc: descFinal, hora: oHora, data: oData,
      tratada: false, aguardandoPais: true, origem: 'manual'
    });



    if (insertedOcorr && insertedOcorr.id) {
      setTimeout(() => {
        gerarPDFIndividual(insertedOcorr.id);
      }, 800);
    }

  } catch (err) {
    console.error('[salvarSuspensaoOcorr] Error:', err);
    showToast('Erro ao salvar suspensão disciplinar: ' + err.message, 'erro');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar Suspensão'; }
    closeModal('modal-aplicar-suspensao');
    await loadTratamentoOcorrencias();
    renderOcorrencias();
    renderDashOcorr();
  }
}

// Relatório Consolidado de Ocorrências e Acompanhamento Disciplinar (PDF)
function gerarPDFTratamento(alunoId) {
  const item = TO_ALUNOS_CRITICOS.find(x => x.aluno.id === alunoId);
  if (!item) { showToast('Ficha não encontrada', 'alerta'); return; }

  const a = item.aluno;
  const ocorrs = item.ocorrencias;
  
  const listHtml = ocorrs.map((o, index) => {
    const data = new Date(o.created_at || o.data_ocorr).toLocaleDateString('pt-BR');
    const label = {
      evasao: 'Evasão Escolar',
      indisciplina: 'Indisciplina',
      bullying: 'Bullying',
      agressao: 'Agressão Física',
      atraso: 'Atraso',
      liberado_coord: 'Liberado pela Coordenação',
      suspensao_celular: 'Suspensão por Uso de Celular'
    }[o.tipo] || o.tipo;
    return `
      <tr>
        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #ccc; padding: 6px; text-align: center;">${data}</td>
        <td style="border: 1px solid #ccc; padding: 6px; font-weight: bold;">${label}</td>
        <td style="border: 1px solid #ccc; padding: 6px; font-size: 11px;">${o.descricao || ''}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Termo de Alerta e Acompanhamento Pedagógico - ${a.nome}</title>
      <style>
        @page { size: portrait; margin: 15mm; margin-top: 8mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; margin-top: -20px; }
        .logo-escola { max-height: 100px; width: auto; object-fit: contain; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto; }
        .header h2 { font-size: 15px; margin: 0 0 4px; font-weight: bold; text-transform: uppercase; }
        .header .subtitle { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
        
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; background: #f2f2f2; padding: 5px 10px; margin-top: 15px; margin-bottom: 8px; border-left: 4px solid #333; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .field { margin-bottom: 6px; }
        .label { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #555; display: block; }
        .value { font-size: 12px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; font-size: 11.5px; }
        th { background: #e6e6e6; border: 1px solid #ccc; padding: 6px; font-weight: bold; text-transform: uppercase; font-size: 10px; }
        
        .signatures { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .signature-line { text-align: center; margin-top: 25px; }
        .signature-line div { border-top: 1px solid #333; width: 85%; margin: 0 auto; padding-top: 4px; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #555; }
        
        .footer { position: fixed; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 6px; font-size: 9px; color: #888; }
        .logo-seduc { max-height: 35px; width: auto; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="header">
        <img class="logo-escola" src="assets/marca_dagua.png" alt="Escola Dr. Romildo Veloso e Silva">
        <h2>Ata de Acompanhamento Pedagógico e Alerta Disciplinar</h2>
        <div class="subtitle">Coordenação de Disciplina e Apoio Pedagógico</div>
      </div>
      
      <p style="text-align: justify; text-indent: 30px; font-size: 12.5px; margin-bottom: 15px;">
        Ao(s) <strong>${new Date().getDate()}</strong> dia(s) do mês de <strong>${new Date().toLocaleString('pt-BR', {month: 'long'})}</strong> de <strong>${new Date().getFullYear()}</strong>, na Coordenação Pedagógica da <strong>Escola Dr. Romildo Veloso e Silva</strong>, reuniram-se os membros do corpo docente, coordenação e o responsável legal do estudante abaixo identificado, a fim de tratar de medidas orientadoras referentes ao excessivo acúmulo de infrações disciplinares registradas no regimento escolar.
      </p>

      <div class="section-title">Identificação do Estudante</div>
      <div class="grid">
        <div class="field"><span class="label">Nome do Aluno</span><div class="value">${a.nome}</div></div>
        <div class="field"><span class="label">CPF / Matrícula</span><div class="value">${a.cpf || '—'}</div></div>
      </div>
      <div class="grid-3">
        <div class="field"><span class="label">Turma</span><div class="value">${a.turma || '—'}</div></div>
        <div class="field"><span class="label">Turno</span><div class="value">${a.turno || '—'}</div></div>
        <div class="field"><span class="label">Rota / Transporte</span><div class="value">${a.rota || '—'}</div></div>
      </div>
      
      <div class="section-title">Ocorrências Disciplinares Registradas (Acumulado Crítico)</div>
      <p style="margin-top: 4px; margin-bottom: 8px; color: #666; font-size: 11px;">O estudante citado apresenta o seguinte histórico de registros pedagógicos/disciplinares ativos:</p>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">Item</th>
            <th style="width: 15%;">Data</th>
            <th style="width: 25%;">Infração</th>
            <th style="width: 55%;">Parecer Descritivo / Motivo</th>
          </tr>
        </thead>
        <tbody>
          ${listHtml}
        </tbody>
      </table>
      
      <div class="section-title">Resoluções e Encaminhamentos da Coordenação</div>
      <p style="margin-top: 4px; margin-bottom: 4px;">Fica acordado entre as partes as seguintes condutas e providências:</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 11.5px; line-height: 1.6;">
        <li>O aluno assume formalmente o compromisso de respeitar as normas escolares descritas no regimento da instituição.</li>
        <li>O responsável legal compromete-se a acompanhar diariamente a assiduidade e a conduta disciplinar do estudante.</li>
        <li>Fica a coordenação autorizada a aplicar penalidades regulamentares mais severas, incluindo suspensão escolar imediata, no caso de reincidência de conduta inadequada.</li>
        <li>Encaminhamento pedagógico complementar para acompanhamento da coordenação e orientação psicológica, se necessário.</li>
      </ul>
      
      <div class="signatures" style="margin-top: 35px;">
        <div class="signature-line">
          <br><br>
          <div>Assinatura do Aluno</div>
        </div>
        <div class="signature-line">
          <br><br>
          <div>Assinatura do Responsável Legal</div>
        </div>
      </div>
      
      <div class="signatures" style="margin-top: 25px;">
        <div class="signature-line">
          <br><br>
          <div>Assinatura da Coordenação Pedagógica</div>
        </div>
        <div class="signature-line">
          <br><br>
          <div>Assinatura da Direção Escolar</div>
        </div>
      </div>
      
      <div class="footer">
        <img class="logo-seduc" src="assets/cabecalho_logo.png" alt="Governo do Pará - SEDUC">
        <div>Relatório consolidado via RVS Gestor em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
      </div>
    </body>
    </html>
  `;

  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  } else {
    showToast('Bloqueador de pop-ups ativo. Permita pop-ups para imprimir.', 'alerta');
  }
}



// Exibe um modal de carregamento bonito e moderno com spinner CSS
function showLoading(msg = 'Carregando...') {
  hideLoading(); // Garante que não duplique

  const overlay = document.createElement('div');
  overlay.id = 'rvs-loading-overlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 15px;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(4px);
  `;

  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      max-width: 320px;
      width: 90%;
      text-align: center;
    ">
      <div class="spinner-loader" style="
        width: 40px;
        height: 40px;
        border: 4px solid #cbd5e1;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: rvs-spin 0.8s linear infinite;
      "></div>
      <span style="
        font-family: 'Outfit', sans-serif;
        font-size: 13.5px;
        font-weight: 700;
        color: #000000 !important;
        margin: 0;
      " id="rvs-loading-text">${msg}</span>
    </div>
  `;

  if (!document.getElementById('rvs-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'rvs-spinner-style';
    style.innerHTML = `
      @keyframes rvs-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);
}

// Oculta o modal de carregamento
function hideLoading() {
  const overlay = document.getElementById('rvs-loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

let currentUploadedPdfBytes = null; // ArrayBuffer do PDF original
let currentMatches = [];            // Mapeamento atual de pág ➔ aluno
let currentAlunosTurma = [];        // Alunos carregados da turma
let currentBoletimProcessedPackage = null;
const BOLETINS_SUBTABS = ['listagem', 'upload', 'processado'];

// Alterna entre a Aba de Status das Turmas e o Envio de Boletim
function switchBoletinsSubTab(tabId) {
  BOLETINS_SUBTABS.forEach(id => {
    const btn = document.getElementById(`btn-boletins-${id}`);
    const pane = document.getElementById(`subtab-boletins-${id}`);
    if (btn) btn.classList.remove('active');
    if (pane) pane.style.display = 'none';
  });

  const activeBtn = document.getElementById(`btn-boletins-${tabId}`);
  const activePane = document.getElementById(`subtab-boletins-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (activePane) activePane.style.display = 'block';
  
  // Força cor de texto do contêiner geral em preto
  document.getElementById('page-boletins').style.color = '#000000';
  
  if (tabId === 'listagem') {
    renderStatusBoletinsTurmas();
  }
}

function buildPdfTextLines(textContent) {
  const items = (textContent?.items || [])
    .filter(item => item?.str && item.str.trim())
    .map(item => ({
      text: item.str.trim(),
      x: Array.isArray(item.transform) ? item.transform[4] : 0,
      y: Array.isArray(item.transform) ? item.transform[5] : 0
    }))
    .sort((a, b) => (b.y - a.y) || (a.x - b.x));

  const grouped = [];
  items.forEach(item => {
    const last = grouped[grouped.length - 1];
    if (last && Math.abs(last.y - item.y) <= 2.5) {
      last.items.push(item);
      last.y = (last.y + item.y) / 2;
    } else {
      grouped.push({ y: item.y, items: [item] });
    }
  });

  return grouped
    .map(group => group.items.sort((a, b) => a.x - b.x).map(item => item.text).join(' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function normalizarNumeroDocumentoBoletim(valor) {
  return (valor || '').toString().replace(/\D+/g, '');
}

function getConselhoComponenteCanonicoMap() {
  const mapa = {};
  Object.entries(CONSELHO_COMPONENTE_ALIAS_MAP || {}).forEach(([canonico, aliases]) => {
    [canonico, ...(aliases || [])].forEach(alias => {
      mapa[normalizarTexto(alias)] = canonico;
    });
  });
  (CONSELHO_COMPONENTES_PADRAO || []).forEach(item => {
    mapa[normalizarTexto(item)] = item;
  });
  return mapa;
}

function canonicalizarComponenteCurricular(valor) {
  const texto = (valor || '').toString().trim();
  if (!texto) return '';
  const mapa = getConselhoComponenteCanonicoMap();
  return mapa[normalizarTexto(texto)] || formatarTituloSimples(texto);
}

function formatarTituloSimples(valor) {
  return (valor || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, letra => letra.toUpperCase());
}

function getBoletimComponentAliases() {
  const baseAliases = {
    ...CONSELHO_COMPONENTE_ALIAS_MAP,
    'Alfabetização': ['alfabetizacao', 'alfabetização'],
    'Leitura': ['leitura'],
    'Escrita': ['escrita']
  };

  if (typeof CONSELHO_COMPONENTES_PADRAO !== 'undefined' && Array.isArray(CONSELHO_COMPONENTES_PADRAO)) {
    CONSELHO_COMPONENTES_PADRAO.forEach(item => {
      const nome = (item || '').toString().trim();
      if (!nome) return;
      const titulo = canonicalizarComponenteCurricular(nome);
      if (!baseAliases[titulo]) {
        baseAliases[titulo] = [normalizarTexto(nome)];
      }
    });
  }

  return Object.entries(baseAliases).map(([componente, aliases]) => ({
    componente,
    aliases: Array.from(new Set([componente, ...(aliases || [])])).map(alias => normalizarTexto(alias))
  }));
}

function parseBoletimNumero(valor) {
  if (valor === null || valor === undefined) return null;
  const normalizado = valor.toString().replace(/\s+/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  if (!normalizado || normalizado === '-' || normalizado === '.') return null;
  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) return null;
  if (numero < 0 || numero > 100) return null;
  return numero;
}

function extrairComponentesBoletim(pageLines = [], pageText = '') {
  const aliases = getBoletimComponentAliases();
  const encontrados = new Map();
  const linhas = Array.isArray(pageLines) && pageLines.length
    ? pageLines
    : pageText.split(/\r?\n/).map(linha => linha.trim()).filter(Boolean);

  linhas.forEach((linha, index) => {
    const linhaLimpa = (linha || '').replace(/\s+/g, ' ').trim();
    if (!linhaLimpa) return;

    const linhaNorm = normalizarTexto(linhaLimpa);
    const candidato = aliases.find(item => item.aliases.some(alias => alias && linhaNorm.includes(alias)));
    if (!candidato) return;

    const numerosBrutos = linhaLimpa.match(/\d+(?:[.,]\d+)?/g) || [];
    const numeros = numerosBrutos
      .map(parseBoletimNumero)
      .filter(numero => numero !== null);

    if (!numeros.length) return;

    const faltasMatch = linhaNorm.match(/faltas?\s*[:\-]?\s*(\d{1,2})/);
    const faltas = faltasMatch ? parseInt(faltasMatch[1], 10) : 0;
    const nota = numeros[0];

    const atual = encontrados.get(candidato.componente);
    const entrada = {
      componente: candidato.componente,
      nota,
      faltas_componente: Number.isFinite(faltas) ? faltas : 0,
      confidence: faltasMatch ? 0.96 : (numeros.length > 1 ? 0.88 : 0.8),
      raw_line: linhaLimpa,
      line_index: index + 1
    };

    if (!atual || ((entrada.nota !== null) && (atual.nota === null || entrada.confidence >= atual.confidence))) {
      encontrados.set(candidato.componente, entrada);
    }
  });

  if (encontrados.size > 0) {
    return Array.from(encontrados.values());
  }

  const fallback = [];
  linhas.forEach((linha, index) => {
    const texto = (linha || '').replace(/\s+/g, ' ').trim();
    if (!texto) return;
    const match = texto.match(/^([\p{L}][\p{L}\s]{3,40})\s+(\d+(?:[.,]\d+)?)(?:\s+(\d{1,2}))?$/u);
    if (!match) return;
    const componente = canonicalizarComponenteCurricular(match[1]);
    if (componente.length < 4) return;
    fallback.push({
      componente,
      nota: parseBoletimNumero(match[2]),
      faltas_componente: parseInt(match[3] || '0', 10) || 0,
      confidence: 0.6,
      raw_line: texto,
      line_index: index + 1
    });
  });

  return fallback;
}

async function salvarNotasEstruturadasBoletim(matches, turmaId, ano, periodo, origem = 'boletim_pdf') {
  const linhasAtivas = (matches || []).filter(match => !match.ignored && match.matchedAluno?.id);
  const mapaPayload = new Map();

  linhasAtivas.forEach(match => {
    const componentes = Array.isArray(match.extractedComponents) && match.extractedComponents.length
      ? match.extractedComponents
      : extrairComponentesBoletim(match.pageLines, match.pageText);

    componentes.forEach(item => {
      if (!item?.componente || item.nota === null || item.nota === undefined) return;
      const chave = `${match.matchedAluno.id}::${ano}::${periodo}::${normalizarTexto(item.componente)}`;
      mapaPayload.set(chave, {
        aluno_id: match.matchedAluno.id,
        turma_id: turmaId,
        ano,
        periodo,
        componente: canonicalizarComponenteCurricular(item.componente),
        nota: item.nota,
        faltas_componente: item.faltas_componente || 0,
        origem
      });
    });
  });

  const payload = Array.from(mapaPayload.values());
  if (!payload.length) {
    return { saved: 0, componentes: 0, alunos: 0 };
  }

  const { data, error } = await supabaseClient
    .from('notas_bimestrais')
    .upsert(payload, { onConflict: 'aluno_id,ano,periodo,componente' })
    .select();

  if (error) {
    return { saved: 0, componentes: payload.length, alunos: linhasAtivas.length, error };
  }

  mergeNotasBimestraisCache(data || payload);
  return { saved: payload.length, componentes: payload.length, alunos: linhasAtivas.length };
}

function mergeNotasBimestraisCache(rows = []) {
  rows.forEach(item => {
    const normalized = {
      id: item.id || null,
      aluno_id: item.aluno_id,
      turma_id: item.turma_id,
      ano: item.ano,
      periodo: item.periodo,
      componente: canonicalizarComponenteCurricular(item.componente),
      nota: item.nota == null ? null : Number(item.nota),
      faltas_componente: Number(item.faltas_componente || 0),
      origem: item.origem || 'manual',
      created_at: item.created_at || ''
    };

    const idx = normalized.id
      ? NOTAS_BIMESTRAIS_DATA.findIndex(row => row.id === normalized.id)
      : -1;

    if (idx >= 0) {
      NOTAS_BIMESTRAIS_DATA[idx] = { ...NOTAS_BIMESTRAIS_DATA[idx], ...normalized };
      return;
    }

    const sameUnique = NOTAS_BIMESTRAIS_DATA.findIndex(row =>
      String(row.aluno_id) === String(normalized.aluno_id) &&
      Number(row.ano) === Number(normalized.ano) &&
      row.periodo === normalized.periodo &&
      canonicalizarComponenteCurricular(row.componente) === normalized.componente
    );

    if (sameUnique >= 0) NOTAS_BIMESTRAIS_DATA[sameUnique] = { ...NOTAS_BIMESTRAIS_DATA[sameUnique], ...normalized };
    else NOTAS_BIMESTRAIS_DATA.push(normalized);
  });
}

function getBoletimPackageStudents(pkg) {
  if (Array.isArray(pkg?.students)) return pkg.students;
  if (Array.isArray(pkg?.alunos)) return pkg.alunos;
  if (Array.isArray(pkg?.entries)) return pkg.entries;
  return [];
}

function getBoletimPackageComponents(student) {
  if (Array.isArray(student?.components)) return student.components;
  if (Array.isArray(student?.componentes)) return student.componentes;
  if (Array.isArray(student?.subjects)) return student.subjects;
  return [];
}

function getBoletimStudentPackageLabel(student) {
  return student?.student_name || student?.nome_aluno || student?.nome || 'Aluno sem identificação';
}

function localizarAlunoDoPacoteBoletim(item, alunos) {
  const registro = normalizarNumeroDocumentoBoletim(item?.student_registry || item?.matricula || item?.registro || '');
  if (registro) {
    const porMatricula = alunos.find(aluno => normalizarNumeroDocumentoBoletim(aluno.matricula) === registro);
    if (porMatricula) return porMatricula;
  }

  const cpfPacote = normalizarNumeroDocumentoBoletim(item?.student_cpf || item?.cpf || '');
  if (cpfPacote) {
    const porCpf = alunos.find(aluno => normalizarNumeroDocumentoBoletim(aluno.cpf) === cpfPacote);
    if (porCpf) return porCpf;
  }

  const nomeNorm = normalizarTexto(getBoletimStudentPackageLabel(item));
  if (!nomeNorm) return null;

  const porNomeExato = alunos.find(aluno => normalizarTexto(aluno.nome) === nomeNorm);
  if (porNomeExato) return porNomeExato;

  const tokens = nomeNorm.split(/\s+/).filter(token => token.length > 2 && !['de', 'da', 'do', 'dos', 'das'].includes(token));
  if (!tokens.length) return null;

  return alunos.find(aluno => {
    const alunoNorm = normalizarTexto(aluno.nome);
    return tokens.every(token => alunoNorm.includes(token));
  }) || null;
}

function renderBoletimProcessadoPreview(pkg) {
  const container = document.getElementById('boletim-processado-preview');
  if (!container) return;

  const students = getBoletimPackageStudents(pkg);
  const totalComponentes = students.reduce((acc, student) => acc + getBoletimPackageComponents(student).length, 0);
  const resumoImportacao = pkg?.__lastImport || null;

  const linhasTabela = students.slice(0, 8).map(student => {
    const componentes = getBoletimPackageComponents(student);
    const primeiraLinha = componentes[0];
    return `
      <tr style="border-bottom:1px solid var(--gray3);">
        <td style="padding:11px; font-weight:700; color:#000000;">${getBoletimStudentPackageLabel(student)}</td>
        <td style="padding:11px; color:#000000;">${student?.student_registry || student?.matricula || '—'}</td>
        <td style="padding:11px; color:#000000; text-align:center;">${componentes.length}</td>
        <td style="padding:11px; color:#000000;">${primeiraLinha ? `${primeiraLinha.componente}: ${primeiraLinha.nota ?? '—'}` : 'Sem disciplinas reconhecidas'}</td>
      </tr>
    `;
  }).join('');

  const naoImportados = resumoImportacao?.unmatched?.length
    ? `<div style="margin-top:12px; font-size:12.2px; color:#7c2d12; line-height:1.6;"><strong>Não vinculados:</strong> ${resumoImportacao.unmatched.slice(0, 6).map(item => item.nome).join(', ')}${resumoImportacao.unmatched.length > 6 ? '...' : ''}</div>`
    : '';

  container.style.display = 'block';
  container.innerHTML = `
    <div class="table-card" style="padding:22px; margin-top:18px; background:white;">
      <div style="display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:flex-start;">
        <div>
          <div style="font-size:15px; font-weight:800; color:#000000;">Prévia do pacote processado</div>
          <div style="font-size:12.5px; color:var(--gray5); margin-top:6px;">
            Origem: ${(pkg?.source?.file_name || pkg?.metadata?.file_name || 'arquivo processado')} • ${students.length} aluno(s) • ${totalComponentes} disciplina(s) reconhecida(s)
          </div>
        </div>
        ${resumoImportacao ? `
          <div style="background:#f8fafc; border:1px solid var(--gray3); border-radius:12px; padding:10px 14px; min-width:210px;">
            <div style="font-size:11.5px; color:var(--gray5); font-weight:700;">Última importação</div>
            <div style="font-size:13px; color:#000000; font-weight:800; margin-top:6px;">${resumoImportacao.savedRows} registro(s) gravado(s)</div>
            <div style="font-size:12px; color:var(--gray6); margin-top:4px;">${resumoImportacao.matchedStudents} aluno(s) vinculados • ${resumoImportacao.unmatched.length} pendência(s)</div>
          </div>
        ` : ''}
      </div>

      <div style="margin-top:16px; border:1px solid var(--gray3); border-radius:12px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse;">
          <thead style="background:var(--gray);">
            <tr>
              <th style="padding:11px; text-align:left; font-size:12px; font-weight:800; color:#000000;">Aluno</th>
              <th style="padding:11px; text-align:left; font-size:12px; font-weight:800; color:#000000;">Matrícula</th>
              <th style="padding:11px; text-align:center; font-size:12px; font-weight:800; color:#000000;">Itens</th>
              <th style="padding:11px; text-align:left; font-size:12px; font-weight:800; color:#000000;">Primeira leitura</th>
            </tr>
          </thead>
          <tbody>
            ${linhasTabela || `<tr><td colspan="4" style="padding:18px; text-align:center; color:#000000; font-weight:700;">O pacote foi lido, mas não trouxe alunos válidos.</td></tr>`}
          </tbody>
        </table>
      </div>
      ${naoImportados}
    </div>
  `;
}

function handleBoletimProcessadoFileSelected(input) {
  const fileBar = document.getElementById('boletim-processado-file-bar');
  const label = document.getElementById('boletim-processado-file-label');
  const dropzoneText = document.getElementById('boletim-processado-dropzone-text');
  const preview = document.getElementById('boletim-processado-preview');
  const file = input?.files?.[0];

  if (!file) {
    currentBoletimProcessedPackage = null;
    if (fileBar) fileBar.style.display = 'none';
    if (preview) preview.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const pacote = JSON.parse(event.target.result);
      const students = getBoletimPackageStudents(pacote);
      if (!students.length) {
        throw new Error('O pacote não possui alunos processados.');
      }

      currentBoletimProcessedPackage = pacote;
      if (label) label.textContent = `📦 ${file.name} (${Math.round(file.size / 1024)} KB)`;
      if (dropzoneText) dropzoneText.textContent = `Pacote carregado: ${file.name}`;
      if (fileBar) fileBar.style.display = 'flex';
      renderBoletimProcessadoPreview(pacote);
      showToast('Pacote processado carregado com sucesso!', 'sucesso');
    } catch (error) {
      currentBoletimProcessedPackage = null;
      if (fileBar) fileBar.style.display = 'none';
      if (preview) preview.style.display = 'none';
      showToast('Não foi possível ler o pacote JSON: ' + error.message, 'erro');
    }
  };
  reader.onerror = function() {
    currentBoletimProcessedPackage = null;
    if (fileBar) fileBar.style.display = 'none';
    if (preview) preview.style.display = 'none';
    showToast('Erro ao ler o arquivo do pacote processado.', 'erro');
  };
  reader.readAsText(file, 'utf-8');
}

async function importarBoletimProcessado() {
  const turmaCode = document.getElementById('boletim-import-turma-select')?.value;
  const ano = parseInt(document.getElementById('boletim-import-ano')?.value) || 2026;
  const periodo = document.getElementById('boletim-import-periodo-select')?.value;
  const students = getBoletimPackageStudents(currentBoletimProcessedPackage);

  if (!turmaCode) {
    showToast('Selecione a turma de destino do pacote.', 'alerta');
    return;
  }
  if (!students.length) {
    showToast('Carregue um pacote processado antes de importar.', 'alerta');
    return;
  }

  const turmaObj = TURMAS_DATA.find(turma => turma.code === turmaCode);
  const turmaId = turmaObj?.id;
  if (!turmaId) {
    showToast('Turma inválida ou não encontrada.', 'alerta');
    return;
  }

  showLoading('Cruzando pacote processado com os alunos da turma...');
  try {
    const { data: alunos, error } = await supabaseClient
      .from('alunos')
      .select('id, nome, matricula, cpf')
      .eq('turma_id', turmaId)
      .eq('status', 'ativo');

    if (error) throw error;
    if (!alunos?.length) {
      hideLoading();
      showToast('Nenhum aluno ativo encontrado nesta turma.', 'alerta');
      return;
    }

    const payloadMap = new Map();
    const unmatched = [];
    const matchedStudents = new Set();

    students.forEach(student => {
      const aluno = localizarAlunoDoPacoteBoletim(student, alunos);
      if (!aluno) {
        unmatched.push({ nome: getBoletimStudentPackageLabel(student) });
        return;
      }

      matchedStudents.add(aluno.id);
      getBoletimPackageComponents(student).forEach(component => {
        const componente = component?.componente || component?.component || component?.disciplina || component?.nome;
        const nota = parseBoletimNumero(component?.nota ?? component?.grade ?? component?.valor);
        if (!componente || nota === null) return;

        const faltas = parseInt(component?.faltas_componente ?? component?.faltas ?? component?.absences ?? 0, 10) || 0;
        const chave = `${aluno.id}::${ano}::${periodo}::${normalizarTexto(componente)}`;
        payloadMap.set(chave, {
          aluno_id: aluno.id,
          turma_id: turmaId,
          ano,
          periodo,
          componente: canonicalizarComponenteCurricular(componente),
          nota,
          faltas_componente: faltas,
          origem: 'boletim_compilado'
        });
      });
    });

    const payload = Array.from(payloadMap.values());
    if (!payload.length) {
      hideLoading();
      showToast('O pacote foi lido, mas não gerou notas válidas para importar.', 'alerta');
      return;
    }

    const { data: savedRows, error: saveError } = await supabaseClient
      .from('notas_bimestrais')
      .upsert(payload, { onConflict: 'aluno_id,ano,periodo,componente' })
      .select();

    hideLoading();

    if (saveError) {
      console.error('[importarBoletimProcessado]', saveError);
      showToast('Erro ao salvar notas estruturadas: ' + saveError.message, 'erro');
      return;
    }

    mergeNotasBimestraisCache(savedRows || payload);
    currentBoletimProcessedPackage.__lastImport = {
      savedRows: payload.length,
      matchedStudents: matchedStudents.size,
      unmatched
    };
    renderBoletimProcessadoPreview(currentBoletimProcessedPackage);
    showToast(`Pacote importado! ${payload.length} nota(s) estruturada(s) foram gravadas.`, unmatched.length ? 'alerta' : 'sucesso');
  } catch (error) {
    console.error('[importarBoletimProcessado]', error);
    hideLoading();
    showToast('Erro ao importar pacote processado: ' + error.message, 'erro');
  }
}

// Busca a situação de todas as turmas em relação a boletins publicados
async function renderStatusBoletinsTurmas() {
  const tbody = document.getElementById('boletins-status-tbody');
  const counterEl = document.getElementById('boletins-contador-status');
  if (!tbody) return;

  // Garante cor preta para o contador
  if (counterEl) {
    counterEl.style.color = '#000000';
    counterEl.style.fontWeight = '800';
  }

  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; padding:30px; color:#000000 !important; font-weight:700;">
        <div style="width:20px;height:20px;border:2px solid rgba(0,0,0,.05);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 10px;"></div>
        Carregando status dos boletins...
      </td>
    </tr>
  `;

  const ano = parseInt(document.getElementById('boletins-filtro-ano').value) || 2026;
  const periodo = document.getElementById('boletins-filtro-periodo').value;

  try {
    // 1. Busca os boletins completos publicados para esse período
    const { data: published, error } = await supabaseClient
      .from('boletins_turmas')
      .select('id, turma_id')
      .eq('ano', ano)
      .eq('periodo', periodo);

    if (error) throw error;

    const publishedMap = {};
    if (published) {
      published.forEach(p => {
        publishedMap[p.turma_id] = p.id;
      });
    }

    let publicadosQtd = 0;

    if (TURMAS_DATA.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#000000 !important; font-weight:700;">Nenhuma turma cadastrada no sistema.</td></tr>`;
      counterEl.textContent = '0 de 0 Publicados';
      return;
    }

    tbody.innerHTML = TURMAS_DATA.map(t => {
      const boletimTurmaId = publishedMap[t.id];
      const temBoletim = !!boletimTurmaId;

      let badge = '';
      let actions = '';

      if (temBoletim) {
        publicadosQtd++;
        badge = `<span class="badge badge-green" style="font-weight:800; padding:4px 10px; border-radius:12px; font-size:11.5px; color:#047857 !important;">🟢 Publicado</span>`;
        actions = `
          <div style="display:flex; gap:6px; justify-content:center;">
            <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:11px; font-weight:700; color:#000000 !important; background:white; border:1px solid var(--gray3);" onclick="visualizarBoletimCompleto('${boletimTurmaId}', '${t.code}')">👁️ Ver PDF</button>
            <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:11px; font-weight:700; color:#000000 !important; background:white; border:1px solid var(--gray3);" onclick="baixarBoletimCompleto('${boletimTurmaId}', 'Boletim_Completo_${t.code}_${periodo.replace(/ /g, '_')}.pdf')">📥 Baixar</button>
            <button class="btn btn-red btn-sm" style="padding:4px 8px; font-size:11px; background:#f43f5e;" onclick="excluirBoletimCompleto('${boletimTurmaId}', '${t.code}', '${t.id}')">🗑️ Excluir</button>
          </div>
        `;
      } else {
        badge = `<span class="badge badge-yellow" style="font-weight:800; padding:4px 10px; border-radius:12px; font-size:11.5px; color:#b45309 !important;">🔴 Pendente</span>`;
        actions = `
          <div style="display:flex; justify-content:center;">
            <button class="btn btn-primary btn-sm" style="padding:4px 12px; font-size:11px; font-weight:750;" onclick="irParaUploadBoletimDeUmaTurma('${t.code}')">📤 Enviar Boletim</button>
          </div>
        `;
      }

      return `<tr style="border-bottom:1px solid var(--gray3);">
        <td style="padding:12px; font-weight:800; color:#000000 !important;">${t.code}</td>
        <td style="padding:12px; color:#000000 !important; font-weight:600;">${t.serie}</td>
        <td style="padding:12px; color:#000000 !important; font-weight:600;">${t.turno}</td>
        <td style="padding:12px; text-align:center;">${badge}</td>
        <td style="padding:12px; text-align:center;">${actions}</td>
      </tr>`;
    }).join('');

    counterEl.textContent = `${publicadosQtd} de ${TURMAS_DATA.length} Publicados`;

  } catch (err) {
    console.error('[renderStatusBoletinsTurmas] Erro:', err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--red);">Erro ao carregar o status dos boletins.</td></tr>`;
  }
}

// Atalho para enviar o boletim de uma turma específica a partir da tabela de status
function irParaUploadBoletimDeUmaTurma(turmaCode) {
  switchBoletinsSubTab('upload');
  
  const select = document.getElementById('boletim-turma-select');
  if (select) {
    select.value = turmaCode;
    const event = new Event('change');
    select.dispatchEvent(event);
  }
}

// Visualiza o boletim completo da turma
async function visualizarBoletimCompleto(boletimTurmaId, turmaCode) {
  showLoading('Buscando arquivo completo no sistema...');
  try {
    const { data, error } = await supabaseClient
      .from('boletins_turmas')
      .select('pdf_completo, periodo, ano')
      .eq('id', boletimTurmaId)
      .single();

    if (error || !data) throw error;
    hideLoading();

    exibirModalPrevisualizacaoCompleta(data.pdf_completo, `${turmaCode} - ${data.periodo} (${data.ano})`);
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Não foi possível obter o PDF completo da turma.', 'erro');
  }
}

// Abre um visualizador modal para o PDF completo
function exibirModalPrevisualizacaoCompleta(base64, label) {
  const old = document.getElementById('boletim-preview-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'boletim-preview-modal';
  modal.style = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease;';
  
  const content = document.createElement('div');
  content.style = 'background:white; border:1px solid var(--gray3); border-radius:16px; max-width:800px; width:100%; display:flex; flex-direction:column; height:85vh; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden;';
  
  const header = document.createElement('div');
  header.style = 'padding:14px 20px; border-bottom:1px solid var(--gray3); display:flex; justify-content:space-between; align-items:center; background:var(--gray);';
  header.innerHTML = `<h4 style="font-size:14px; font-weight:800; color:#000000 !important; margin:0">👁️ Visualizando Boletim — ${label}</h4>
    <button onclick="document.getElementById('boletim-preview-modal').remove()" style="background:none; border:none; color:var(--gray5); font-size:24px; cursor:pointer;">&times;</button>`;
  
  const body = document.createElement('div');
  body.style = 'padding:0; flex:1; background:#ebebeb; overflow:hidden;';
  
  const iframe = document.createElement('iframe');
  iframe.src = `data:application/pdf;base64,${base64}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  body.appendChild(iframe);
  
  content.appendChild(header);
  content.appendChild(body);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

// Faz o download do arquivo PDF completo do banco de dados
async function baixarBoletimCompleto(boletimTurmaId, filename) {
  showLoading('Baixando PDF completo...');
  try {
    const { data, error } = await supabaseClient
      .from('boletins_turmas')
      .select('pdf_completo')
      .eq('id', boletimTurmaId)
      .single();

    if (error || !data) throw error;
    hideLoading();

    downloadBase64PDF(data.pdf_completo, filename);
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Erro ao baixar o arquivo PDF completo.', 'erro');
  }
}

// Exclui o arquivo completo do banco e cascateia a exclusão para boletins individuais
async function excluirBoletimCompleto(boletimTurmaId, turmaCode, turmaId) {
  const confirmacao = confirm(`ATENÇÃO: Tem certeza que deseja excluir o boletim completo da turma ${turmaCode}? Isso apagará permanentemente o PDF completo E todos os boletins individuais gerados para os alunos neste período.`);
  if (!confirmacao) return;

  showLoading('Excluindo boletins da turma...');
  const ano = parseInt(document.getElementById('boletins-filtro-ano').value) || 2026;
  const periodo = document.getElementById('boletins-filtro-periodo').value;

  try {
    // 1. Deleta o boletim completo da turma
    const { error: err1 } = await supabaseClient
      .from('boletins_turmas')
      .delete()
      .eq('id', boletimTurmaId);

    if (err1) throw err1;

    // 2. Deleta os boletins individuais dos alunos daquela turma, ano e período
    const { error: err2 } = await supabaseClient
      .from('boletins')
      .delete()
      .eq('turma_id', turmaId)
      .eq('ano', ano)
      .eq('periodo', periodo);

    if (err2) throw err2;

    hideLoading();
    showToast(`Boletins da turma ${turmaCode} excluídos com sucesso.`, 'sucesso');
    renderStatusBoletinsTurmas();

  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Ocorreu um erro ao excluir os boletins do banco de dados.', 'erro');
  }
}

function handleBoletimFileSelected(input) {
  const fileBar = document.getElementById('boletim-file-info-bar');
  const fileLabel = document.getElementById('boletim-file-name-label');
  const dropzoneText = document.getElementById('boletim-dropzone-text');
  
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    fileLabel.textContent = `📄 ${file.name} (${Math.round(file.size / 1024)} KB)`;
    fileLabel.style.color = '#000000';
    dropzoneText.textContent = `Arquivo carregado: ${file.name}`;
    dropzoneText.style.color = '#000000';
    fileBar.style.display = 'flex';
    document.getElementById('boletim-mapeamento-container').style.display = 'none'; // Oculta anterior
    showToast('PDF selecionado! Clique em "Analisar e Mapear" para prosseguir.', 'sucesso');
  } else {
    fileBar.style.display = 'none';
  }
}

async function processarBoletimPDF() {
  const select = document.getElementById('boletim-turma-select');
  const turmaCode = select.value;
  const ano = parseInt(document.getElementById('boletim-ano').value) || 2026;
  const periodo = document.getElementById('boletim-periodo-select').value;
  const fileInput = document.getElementById('boletim-pdf-file');

  if (!turmaCode) {
    showToast('Por favor, selecione uma turma primeiro.', 'alerta');
    return;
  }
  if (!fileInput.files || fileInput.files.length === 0) {
    showToast('Por favor, selecione um arquivo PDF.', 'alerta');
    return;
  }

  const turmaObj = TURMAS_DATA.find(t => t.code === turmaCode);
  const turmaId = turmaObj ? turmaObj.id : null;

  if (!turmaId) {
    showToast('Turma inválida ou não encontrada no sistema.', 'alerta');
    return;
  }

  showLoading('Buscando alunos da turma e analisando PDF...');
  
  try {
    // 1. Busca alunos ativos da turma utilizando o turma_id (chave estrangeira correta no Supabase)
    const alunosCache = (ALUNOS_DATA || [])
      .filter(aluno => String(aluno.turma_id) === String(turmaId) && String(aluno.status || 'ativo').toLowerCase() === 'ativo')
      .map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.cpf || ''
      }));

    const alunos = alunosCache;
    const error = null;

    if (error || !alunos || alunos.length === 0) {
      hideLoading();
      showToast('Nenhum aluno ativo cadastrado nesta turma.', 'alerta');
      return;
    }

    // Ordena alfabeticamente para a UI e para o fallback alfabético
    alunos.sort((a, b) => a.nome.localeCompare(b.nome));
    currentAlunosTurma = alunos;

    // 2. Lê os bytes do PDF
    const file = fileInput.files[0];
    currentUploadedPdfBytes = await file.arrayBuffer();

    // RESOLVE O BUG DO CDF E Worker GLOBAL do PDF.js
    const lib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    if (!lib) {
      hideLoading();
      showToast('Biblioteca de leitura de PDF ainda não foi carregada. Recarregue a página.', 'erro');
      return;
    }
    
    try {
      if (window.location.protocol !== 'file:') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
      } else {
        delete pdfjsLib.GlobalWorkerOptions.workerSrc;
      }
    } catch (e) {
      console.warn("GlobalWorkerOptions workerSrc error:", e);
    }

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(currentUploadedPdfBytes.slice(0)) }).promise;
    const numPages = pdf.numPages;

    const matches = [];

    // 3. Processa cada página do PDF
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      const pageLines = buildPdfTextLines(textContent);

      // Normalização para busca sem acentos e case-insensitive
      const normalizedPageText = normalizarTexto(pageText);

      let matchedAluno = null;
      let matchType = 'nenhum';

      // A) Busca por Matrícula
      for (const al of alunos) {
        if (al.matricula && normalizedPageText.includes(normalizarTexto(al.matricula))) {
          matchedAluno = al;
          matchType = 'matricula';
          break;
        }
      }

      // B) Se não achar, busca por Nome Completo Exato
      if (!matchedAluno) {
        for (const al of alunos) {
          const nomeNorm = normalizarTexto(al.nome);
          if (nomeNorm.length > 5 && normalizedPageText.includes(nomeNorm)) {
            matchedAluno = al;
            matchType = 'nome';
            break;
          }
        }
      }

      // C) Se não achar por nome exato, faz busca super resiliente por palavras principais (ignora números e preposições)
      if (!matchedAluno) {
        for (const al of alunos) {
          const nomeNorm = normalizarTexto(al.nome);
          const palavras = nomeNorm.split(/\s+/).filter(p => {
            return p.length > 2 && !['de', 'da', 'do', 'dos', 'das', 'com', 'para'].includes(p);
          });
          
          if (palavras.length > 0 && palavras.every(p => normalizedPageText.includes(p))) {
            matchedAluno = al;
            matchType = 'nome';
            break;
          }
        }
      }

      // D) Se não achar por texto (ex: folha escaneada ou sem texto), faz fallback para a ordem alfabética da turma
      if (!matchedAluno) {
        const studentIndex = i - 1;
        if (studentIndex < alunos.length) {
          matchedAluno = alunos[studentIndex];
          matchType = 'manual'; // Sinaliza mapeamento automático/alfabético
        }
      }

      if (matchedAluno) {
        matches.push({
          pageNum: i,
          matchedAluno: matchedAluno,
          matchType: matchType,
          ignored: false,
          pageText,
          pageLines,
          extractedComponents: extrairComponentesBoletim(pageLines, pageText)
        });
      }
    }

    hideLoading();

    if (matches.length === 0) {
      showToast('Não foi possível associar nenhuma página aos alunos da turma.', 'alerta');
      return;
    }



    // 4. Inicia o Salvamento Automático com Barra de Progresso
    const progressModal = document.createElement('div');
    progressModal.id = 'boletim-progress-modal';
    progressModal.style = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:20000; display:flex; align-items:center; justify-content:center; padding:20px;';
    progressModal.innerHTML = `
      <div style="background:white; border:1px solid var(--gray3); border-radius:16px; max-width:400px; width:100%; padding:25px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <h4 style="font-size:15px; font-weight:800; color:#000000 !important; margin:0 0 10px;">💾 Gravando Boletins no Banco...</h4>
        <p style="font-size:12.5px; color:#000000 !important; font-weight:700; margin-bottom:20px;" id="boletim-progress-text">Codificando arquivo completo...</p>
        
        <div style="width:100%; height:8px; background:var(--gray); border-radius:4px; overflow:hidden; margin-bottom:10px;">
          <div id="boletim-progress-bar" style="width:0%; height:100%; background:var(--blue); transition:width 0.1s ease;"></div>
        </div>
        <div style="font-size:11px; color:var(--gray5);" id="boletim-progress-counter">Preparando upload...</div>
      </div>
    `;
    document.body.appendChild(progressModal);

    const { PDFDocument } = PDFLib;
    const srcDoc = await PDFDocument.load(currentUploadedPdfBytes);

    // A) SALVA O ARQUIVO COMPLETO DA TURMA NA TABELA boletins_turmas
    document.getElementById('boletim-progress-text').textContent = 'Salvando arquivo completo da turma...';
    
    let completeBinary = '';
    const completeLen = currentUploadedPdfBytes.byteLength;
    const completeBytes = new Uint8Array(currentUploadedPdfBytes);
    for (let j = 0; j < completeLen; j++) {
      completeBinary += String.fromCharCode(completeBytes[j]);
    }
    const completeBase64 = window.btoa(completeBinary);

    const completePayload = {
      turma_id: turmaId,
      ano: ano,
      periodo: periodo,
      pdf_completo: completeBase64
    };

    const { error: completeErr } = await supabaseClient
      .from('boletins_turmas')
      .upsert(completePayload, { onConflict: 'turma_id,ano,periodo' });

    if (completeErr) {
      console.error('Erro ao salvar boletim completo:', completeErr);
      progressModal.remove();
      showToast('Erro ao salvar o arquivo PDF completo da turma.', 'erro');
      return;
    }

    // B) SALVA OS BOLETINS INDIVIDUAIS DE CADA ALUNO
    let sucessos = 0;
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const pageIndex = match.pageNum - 1;

      // Progresso UI
      document.getElementById('boletim-progress-text').textContent = `Processando: ${match.matchedAluno.nome}`;
      const pct = Math.round((i / matches.length) * 100);
      document.getElementById('boletim-progress-bar').style.width = `${pct}%`;
      document.getElementById('boletim-progress-counter').textContent = `${i} de ${matches.length} boletins salvos`;

      // Cria um novo PDF de apenas 1 página
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex]);
      newDoc.addPage(copiedPage);
      const pdfBytes = await newDoc.save();

      // Transforma em Base64
      let binary = '';
      const len = pdfBytes.byteLength;
      for (let j = 0; j < len; j++) {
        binary += String.fromCharCode(pdfBytes[j]);
      }
      const base64String = window.btoa(binary);

      // Salva no banco de dados (upsert)
      const payload = {
        aluno_id: match.matchedAluno.id,
        turma_id: turmaId,
        ano: ano,
        periodo: periodo,
        pdf_base64: base64String
      };

      const { error: indErr } = await supabaseClient
        .from('boletins')
        .upsert(payload, { onConflict: 'aluno_id,ano,periodo' });

      if (indErr) {
        console.error(`Erro ao salvar boletim para ${match.matchedAluno.nome}:`, indErr);
      } else {
        sucessos++;
      }
    }

    const resumoNotas = await salvarNotasEstruturadasBoletim(matches, turmaId, ano, periodo, 'boletim_pdf_upload');
    if (resumoNotas.error) {
      console.error('[processarBoletimPDF] Erro ao salvar notas estruturadas:', resumoNotas.error);
    }

    // Fecha o modal de progresso
    progressModal.remove();
    
    const mensagemNotas = resumoNotas.saved
      ? ` ${resumoNotas.saved} nota(s) estruturada(s) também foram sincronizadas para o Conselho de Classe.`
      : '';
    showToast(`Sucesso! Os boletins foram analisados, mapeados e já estão disponíveis para consulta e impressão na Ficha do Aluno e no Portal do Aluno!${mensagemNotas}`, resumoNotas.error ? 'alerta' : 'sucesso');
    
    // Limpa UI e volta para a aba de listagem
    document.getElementById('boletim-pdf-file').value = '';
    document.getElementById('boletim-file-info-bar').style.display = 'none';
    document.getElementById('boletim-dropzone-text').textContent = 'Clique ou arraste o arquivo PDF da turma aqui';
    
    switchBoletinsSubTab('listagem');

  } catch (err) {
    console.error(err);
    hideLoading();
    alert("ERRO DE PROCESSAMENTO:\n" + (err.stack || err.message || err));
    showToast('Erro inesperado ao processar e salvar boletins: ' + err.message, 'erro');
  }
}

// RENDERIZA A GRID COM CORES COM ALTO CONTRASTE PRETO ABSOLUTO (#000000)
function renderGridMapeamento(matches, alunos) {
  currentMatches = matches;
  const container = document.getElementById('boletim-mapeamento-container');
  container.style.display = 'block';

  let html = `
    <div style="background: #f8fafc; border: 1.5px solid var(--gray3); border-radius: 16px; padding: 22px; margin-top: 25px; animation: fadeIn 0.4s ease; color: #000000 !important;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
        <h3 style="font-size:15px; font-weight:850; color:#000000 !important; font-family:'Outfit',sans-serif; margin:0">📊 Mapeamento das Páginas do PDF</h3>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="mapearOrdemAlfabetica()" style="font-size: 11.5px; padding: 6px 12px; background:white; border: 1.5px solid var(--gray3); color:#000000 !important; font-weight:700;">✍️ Preencher Ordem Alfabética</button>
          <button class="btn btn-red btn-sm" onclick="limparMapeamento()" style="font-size: 11.5px; padding: 6px 12px; background:#f43f5e; font-weight:700;">❌ Limpar Tudo</button>
        </div>
      </div>
      
      <p style="font-size:12.5px; color:#000000 !important; margin-bottom:18px; line-height: 1.5; font-weight:700;">
        Confira o aluno associado a cada página. Você pode alterar a seleção manualmente ou marcar páginas a serem ignoradas (ex: capas ou informativos gerais).
      </p>
      
      <div style="max-height: 480px; overflow-y: auto; border: 1.5px solid var(--gray3); border-radius: 12px; margin-bottom: 20px; background: white;">
        <table style="width:100%; border-collapse:collapse; text-align: left; color:#000000 !important;">
          <thead style="background: var(--gray); position: sticky; top: 0; z-index: 2; border-bottom: 2px solid var(--gray3);">
            <tr>
              <th style="padding:12px; font-size:12px; color:#000000 !important; font-weight:800; text-align:center; width: 80px;">Página</th>
              <th style="padding:12px; font-size:12px; color:#000000 !important; font-weight:800; text-align:center; width: 90px;">Ver</th>
              <th style="padding:12px; font-size:12px; color:#000000 !important; font-weight:800;">Aluno da Página</th>
              <th style="padding:12px; font-size:12px; color:#000000 !important; font-weight:800; text-align:center; width: 140px;">Correspondência</th>
              <th style="padding:12px; font-size:12px; color:#000000 !important; font-weight:800; text-align:center; width: 80px;">Ignorar</th>
            </tr>
          </thead>
          <tbody>
  `;

  matches.forEach((m, idx) => {
    const isMatched = m.matchedAluno !== null;
    const matchBadge = m.matchType === 'matricula'
      ? '<span style="background:rgba(16,185,129,0.2); color:#047857 !important; border:1px solid rgba(16,185,129,0.4); padding:3px 8px; border-radius:10px; font-size:9.5px; font-weight:800;">Matrícula</span>'
      : m.matchType === 'nome'
      ? '<span style="background:rgba(79,70,229,0.15); color:#4f46e5 !important; border:1px solid rgba(79,70,229,0.3); padding:3px 8px; border-radius:10px; font-size:9.5px; font-weight:800;">Nome</span>'
      : m.matchType === 'manual'
      ? '<span style="background:rgba(245,158,11,0.2); color:#b45309 !important; border:1px solid rgba(245,158,11,0.3); padding:3px 8px; border-radius:10px; font-size:9.5px; font-weight:800;">Manual</span>'
      : '<span style="background:rgba(244,63,94,0.2); color:#be123c !important; border:1px solid rgba(244,63,94,0.3); padding:3px 8px; border-radius:10px; font-size:9.5px; font-weight:800;">Nenhum</span>';

    // Cria as opções do Select
    let options = '<option value="">-- Ignorar página / Sem Aluno --</option>';
    alunos.forEach(al => {
      const selected = isMatched && m.matchedAluno.id === al.id ? 'selected' : '';
      options += `<option value="${al.id}" ${selected}>${al.nome} (${al.matricula})</option>`;
    });

    html += `
      <tr style="border-bottom:1px solid var(--gray3); transition:opacity 0.2s; ${m.ignored ? 'opacity:0.45; background:#f1f5f9;' : ''}">
        <td style="padding:12px; text-align:center; font-weight:800; color:#000000 !important;">Pág. ${m.pageNum}</td>
        <td style="padding:12px; text-align:center;">
          <button class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:10.5px; background:white; border:1px solid var(--gray3); color:#000000 !important; font-weight:700;" onclick="abrirPrevisualizacaoPagina(${m.pageNum})">👁️ Ver</button>
        </td>
        <td style="padding:12px;">
          <select class="form-input form-select" style="width:100%; margin:0; padding:6px 10px; border:1.5px solid var(--gray3); color:#000000 !important; font-weight:600;" onchange="alterarMapeamentoManual(${idx}, this.value)" ${m.ignored ? 'disabled' : ''}>
            ${options}
          </select>
        </td>
        <td style="padding:12px; text-align:center; color:#000000 !important; font-weight:600;">${m.ignored ? '<span style="color:#f43f5e; font-weight:800;">Ignorada</span>' : matchBadge}</td>
        <td style="padding:12px; text-align:center;">
          <input type="checkbox" ${m.ignored ? 'checked' : ''} onchange="toggleIgnorarPagina(${idx}, this.checked)" style="width:16px; height:16px; cursor:pointer;">
        </td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
      
      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-primary" onclick="salvarBoletinsMapeados()" style="padding: 10px 22px; font-weight: 800; font-size:13.5px;">💾 Confirmar e Salvar Boletins</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function abrirPrevisualizacaoPagina(pageNum) {
  showLoading('Carregando pré-visualização...');
  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(currentUploadedPdfBytes.slice(0)) }).promise;
    const page = await pdf.getPage(pageNum);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    hideLoading();
    
    exibirModalPrevisualizacao(canvas, pageNum);
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Erro ao carregar imagem da página.', 'erro');
  }
}

function exibirModalPrevisualizacao(canvas, pageNum) {
  const old = document.getElementById('boletim-preview-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'boletim-preview-modal';
  modal.style = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:10000; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease;';
  
  const content = document.createElement('div');
  content.style = 'background:white; border:1px solid var(--gray3); border-radius:16px; max-width:600px; width:100%; display:flex; flex-direction:column; max-height:90vh; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden;';
  
  const header = document.createElement('div');
  header.style = 'padding:14px 20px; border-bottom:1px solid var(--gray3); display:flex; justify-content:space-between; align-items:center; background:var(--gray);';
  header.innerHTML = `<h4 style="font-size:14px; font-weight:800; color:#000000 !important; margin:0">👁️ Pré-visualização da Página ${pageNum}</h4>
    <button onclick="document.getElementById('boletim-preview-modal').remove()" style="background:none; border:none; color:var(--gray5); font-size:24px; cursor:pointer;">&times;</button>`;
  
  const body = document.createElement('div');
  body.style = 'padding:15px; overflow-y:auto; display:flex; align-items:center; justify-content:center; background:#1e293b;';
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto';
  canvas.style.borderRadius = '8px';
  body.appendChild(canvas);
  
  content.appendChild(header);
  content.appendChild(body);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

function mapearOrdemAlfabetica() {
  if (currentAlunosTurma.length === 0) return;
  
  currentMatches.forEach((m, idx) => {
    if (idx < currentAlunosTurma.length) {
      m.matchedAluno = currentAlunosTurma[idx];
      m.matchType = 'manual';
      m.ignored = false;
    } else {
      m.matchedAluno = null;
      m.matchType = 'nenhum';
      m.ignored = true;
    }
  });

  showToast('Ordem alfabética aplicada! Confirme os dados antes de salvar.', 'sucesso');
  renderGridMapeamento(currentMatches, currentAlunosTurma);
}

function alterarMapeamentoManual(idx, value) {
  if (value === '') {
    currentMatches[idx].matchedAluno = null;
    currentMatches[idx].matchType = 'nenhum';
  } else {
    const found = currentAlunosTurma.find(a => a.id === value);
    currentMatches[idx].matchedAluno = found || null;
    currentMatches[idx].matchType = 'manual';
  }
}

function toggleIgnorarPagina(idx, checked) {
  currentMatches[idx].ignored = checked;
  renderGridMapeamento(currentMatches, currentAlunosTurma);
}

function limparMapeamento() {
  currentMatches.forEach(m => {
    m.matchedAluno = null;
    m.matchType = 'nenhum';
    m.ignored = false;
  });
  showToast('Mapeamento limpo!', 'alerta');
  renderGridMapeamento(currentMatches, currentAlunosTurma);
}

// SALVA AMBOS: O ARQUIVO COMPLETO EM boletins_turmas E OS BOLETINS INDIVIDUAIS EM boletins!
async function salvarBoletinsMapeados() {
  const select = document.getElementById('boletim-turma-select');
  const turmaCode = select.value;
  const ano = parseInt(document.getElementById('boletim-ano').value);
  const periodo = document.getElementById('boletim-periodo-select').value;
  
  const activeMatches = currentMatches.filter(m => !m.ignored && m.matchedAluno !== null);
  
  if (activeMatches.length === 0) {
    showToast('Nenhuma página associada a alunos para salvar.', 'alerta');
    return;
  }

  const turmaObj = TURMAS_DATA.find(t => t.code === turmaCode);
  const turmaId = turmaObj ? turmaObj.id : null;

  // Abre Modal de Progresso
  const progressModal = document.createElement('div');
  progressModal.id = 'boletim-progress-modal';
  progressModal.style = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:20000; display:flex; align-items:center; justify-content:center; padding:20px;';
  progressModal.innerHTML = `
    <div style="background:white; border:1px solid var(--gray3); border-radius:16px; max-width:400px; width:100%; padding:25px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <h4 style="font-size:15px; font-weight:800; color:#000000 !important; margin:0 0 10px;">💾 Salvando Boletins no Banco...</h4>
      <p style="font-size:12.5px; color:#000000 !important; font-weight:700; margin-bottom:20px;" id="boletim-progress-text">Codificando arquivo completo...</p>
      
      <div style="width:100%; height:8px; background:var(--gray); border-radius:4px; overflow:hidden; margin-bottom:10px;">
        <div id="boletim-progress-bar" style="width:0%; height:100%; background:var(--blue); transition:width 0.1s ease;"></div>
      </div>
      <div style="font-size:11px; color:var(--gray5);" id="boletim-progress-counter">Preparando upload...</div>
    </div>
  `;
  document.body.appendChild(progressModal);

  try {
    const { PDFDocument } = PDFLib;
    const srcDoc = await PDFDocument.load(currentUploadedPdfBytes);

    // A) SALVA O ARQUIVO COMPLETO DA TURMA NA TABELA boletins_turmas
    document.getElementById('boletim-progress-text').textContent = 'Salvando arquivo completo da turma...';
    
    let completeBinary = '';
    const completeLen = currentUploadedPdfBytes.byteLength;
    const completeBytes = new Uint8Array(currentUploadedPdfBytes);
    for (let j = 0; j < completeLen; j++) {
      completeBinary += String.fromCharCode(completeBytes[j]);
    }
    const completeBase64 = window.btoa(completeBinary);

    const completePayload = {
      turma_id: turmaId,
      ano: ano,
      periodo: periodo,
      pdf_completo: completeBase64
    };

    const { error: completeErr } = await supabaseClient
      .from('boletins_turmas')
      .upsert(completePayload, { onConflict: 'turma_id,ano,periodo' });

    if (completeErr) {
      console.error('Erro ao salvar boletim completo:', completeErr);
      progressModal.remove();
      showToast('Erro ao salvar o arquivo PDF completo da turma.', 'erro');
      return;
    }

    // B) SALVA OS BOLETINS INDIVIDUAIS DE CADA ALUNO
    let sucessos = 0;
    
    for (let i = 0; i < activeMatches.length; i++) {
      const match = activeMatches[i];
      const pageIndex = match.pageNum - 1;

      // Progresso UI
      document.getElementById('boletim-progress-text').textContent = `Processando: ${match.matchedAluno.nome}`;
      const pct = Math.round((i / activeMatches.length) * 100);
      document.getElementById('boletim-progress-bar').style.width = `${pct}%`;
      document.getElementById('boletim-progress-counter').textContent = `${i} de ${activeMatches.length} boletins salvos`;

      // Cria um novo PDF de apenas 1 página
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex]);
      newDoc.addPage(copiedPage);
      const pdfBytes = await newDoc.save();

      // Transforma em Base64
      let binary = '';
      const len = pdfBytes.byteLength;
      for (let j = 0; j < len; j++) {
        binary += String.fromCharCode(pdfBytes[j]);
      }
      const base64String = window.btoa(binary);

      // Salva no banco de dados (upsert)
      const payload = {
        aluno_id: match.matchedAluno.id,
        turma_id: turmaId,
        ano: ano,
        periodo: periodo,
        pdf_base64: base64String
      };

      const { error } = await supabaseClient
        .from('boletins')
        .upsert(payload, { onConflict: 'aluno_id,ano,periodo' });

      if (error) {
        console.error(`Erro ao salvar boletim para ${match.matchedAluno.nome}:`, error);
      } else {
        sucessos++;
      }
    }

    const resumoNotas = await salvarNotasEstruturadasBoletim(activeMatches, turmaId, ano, periodo, 'boletim_pdf_manual');
    if (resumoNotas.error) {
      console.error('[salvarBoletinsMapeados] Erro ao salvar notas estruturadas:', resumoNotas.error);
    }

    // Fecha o modal de progresso
    progressModal.remove();
    
    const mensagemNotas = resumoNotas.saved
      ? ` ${resumoNotas.saved} nota(s) estruturada(s) também foram sincronizadas.`
      : '';
    showToast(`Sucesso! Os boletins foram salvos e já estão disponíveis para consulta e impressão na Ficha do Aluno e no Portal do Aluno!${mensagemNotas}`, resumoNotas.error ? 'alerta' : 'sucesso');
    
    // Limpa UI e volta para a aba de listagem
    document.getElementById('boletim-pdf-file').value = '';
    document.getElementById('boletim-file-info-bar').style.display = 'none';
    document.getElementById('boletim-mapeamento-container').style.display = 'none';
    document.getElementById('boletim-dropzone-text').textContent = 'Clique ou arraste o arquivo PDF da turma aqui';
    
    switchBoletinsSubTab('listagem');

  } catch (err) {
    console.error(err);
    progressModal.remove();
    showToast('Erro inesperado ao dividir e salvar boletins.', 'erro');
  }
}

function irParaUploadBoletimDaTurma() {
  const code = document.getElementById('edit-turma-code').value;
  closeModal('modal-editar-turma');
  showPage('boletins'); // Navega para a aba de boletins
  
  // Abre a sub-aba de Upload
  switchBoletinsSubTab('upload');
  
  // Seleciona a turma correspondente no dropdown
  const select = document.getElementById('boletim-turma-select');
  if (select) {
    select.value = code;
    const event = new Event('change');
    select.dispatchEvent(event);
  }
}

// ------------------------------------------------------------------------------
// Ficha de Aluno: Mapeamento de Boletins na Ficha (v3)
// ------------------------------------------------------------------------------
async function renderFichaBoletins(aluno) {
  const el = document.getElementById('ficha-boletins-lista'); if (!el) return;
  el.innerHTML = '<div style="font-size:12.5px;color:var(--gray5);padding:6px 0; font-weight:600;">🔍 Buscando boletins no sistema...</div>';
  
  try {
    const { data, error } = await supabaseClient
      .from('boletins')
      .select('id, ano, periodo, pdf_base64')
      .eq('aluno_id', aluno.id)
      .order('ano', { ascending: false })
      .order('periodo', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      el.innerHTML = '<div style="font-size:12.5px;color:var(--gray5);padding:6px 0; font-weight:600;">Nenhum boletim publicado para este aluno neste ano.</div>';
      return;
    }

    el.innerHTML = data.map(b => {
      // Escape simples das aspas no Base64 para passar na interpolação sem quebrar o HTML
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--gray); padding:8px 12px; border-radius:8px; font-size:12.5px; border:1px solid var(--gray3);">
          <div>
            <strong style="color:#000000 !important; font-weight: 800;">${b.periodo}</strong> <span style="color:#000000; font-weight:600;">(${b.ano})</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-xs" style="margin:0; padding:3px 8px; font-size:11px; font-weight:700; color:#000000 !important; background:white; border:1.5px solid var(--gray3);" onclick="visualizarBoletimFicha('${b.id}')">👁️ Ver</button>
            <button class="btn btn-secondary btn-xs" style="margin:0; padding:3px 8px; font-size:11px; font-weight:700; color:#000000 !important; background:white; border:1.5px solid var(--gray3);" onclick="baixarBoletimFicha('${b.id}', 'Boletim_${aluno.nome.replace(/ /g, '_')}_${b.periodo.replace(/ /g, '_')}.pdf')">📥 Baixar</button>
            <button class="btn btn-secondary btn-xs" style="margin:0; padding:3px 8px; font-size:11px; font-weight:700; color:#000000 !important; background:white; border:1.5px solid var(--gray3);" onclick="imprimirBoletimFicha('${b.id}')">🖨️ Imprimir</button>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('[renderFichaBoletins] Erro:', err);
    el.innerHTML = '<div style="font-size:12.5px;color:var(--red);padding:6px 0; font-weight:600;">Erro ao buscar os boletins.</div>';
  }
}

// Ações para os Boletins na Ficha do Aluno
async function renderFichaBoletins(aluno) {
  const el = document.getElementById('ficha-boletins-lista'); if (!el) return;
  setFichaCounter('ficha-boletins-count', 'Carregando...');
  setFichaText('ficha-total-boletins', '...');
  el.innerHTML = '<div class="ficha-empty-inline">Buscando boletins publicados no sistema...</div>';
  
  try {
    const { data, error } = await supabaseClient
      .from('boletins')
      .select('id, ano, periodo, pdf_base64')
      .eq('aluno_id', aluno.id)
      .order('ano', { ascending: false })
      .order('periodo', { ascending: true });

    if (error) throw error;

    const lista = data || [];
    setFichaText('ficha-total-boletins', String(lista.length));
    setFichaCounter('ficha-boletins-count', lista.length, 'boletim', 'boletins');

    if (!lista.length) {
      el.innerHTML = '<div class="ficha-empty-inline">Nenhum boletim publicado para este aluno até o momento.</div>';
      return;
    }

    el.innerHTML = lista.map(b => `
      <div class="ficha-doc-card">
        <div class="ficha-doc-copy">
          <strong>${b.periodo} (${b.ano})</strong>
          <span>Boletim pronto para consulta, download e impressão.</span>
        </div>
        <div class="ficha-doc-actions">
          <button class="btn btn-outline btn-xs" onclick="visualizarBoletimFicha('${b.id}')">Ver</button>
          <button class="btn btn-outline btn-xs" onclick="baixarBoletimFicha('${b.id}', 'Boletim_${aluno.nome.replace(/ /g, '_')}_${b.periodo.replace(/ /g, '_')}.pdf')">Baixar</button>
          <button class="btn btn-outline btn-xs" onclick="imprimirBoletimFicha('${b.id}')">Imprimir</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('[renderFichaBoletins] Erro:', err);
    setFichaCounter('ficha-boletins-count', 'Erro');
    setFichaText('ficha-total-boletins', '—');
    el.innerHTML = '<div class="ficha-empty-inline" style="color:var(--red-dark)">Erro ao buscar os boletins deste aluno.</div>';
  }
}

async function visualizarBoletimFicha(boletimId) {
  showLoading('Carregando boletim...');
  try {
    const { data, error } = await supabaseClient
      .from('boletins')
      .select('pdf_base64, periodo, ano')
      .eq('id', boletimId)
      .single();

    if (error || !data) throw error;
    hideLoading();

    exibirModalPrevisualizacaoCompleta(data.pdf_base64, `Boletim Escolar - ${data.periodo} (${data.ano})`);
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Erro ao carregar o boletim do aluno.', 'erro');
  }
}

async function baixarBoletimFicha(boletimId, filename) {
  showLoading('Baixando boletim...');
  try {
    const { data, error } = await supabaseClient
      .from('boletins')
      .select('pdf_base64')
      .eq('id', boletimId)
      .single();

    if (error || !data) throw error;
    hideLoading();

    downloadBase64PDF(data.pdf_base64, filename);
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Erro ao baixar o boletim.', 'erro');
  }
}

// IMPRIME O BOLETIM COM UM IFRAME OCULTO DE MANEIRA PERFEITA E NATIVA
async function imprimirBoletimFicha(boletimId) {
  showLoading('Preparando impressão...');
  try {
    const { data, error } = await supabaseClient
      .from('boletins')
      .select('pdf_base64')
      .eq('id', boletimId)
      .single();

    if (error || !data) throw error;
    hideLoading();

    const base64 = data.pdf_base64;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = `data:application/pdf;base64,${base64}`;
    document.body.appendChild(iframe);
    
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      // Remove o iframe da DOM após o início do spooler
      setTimeout(() => iframe.remove(), 1500);
    }, 600);

  } catch (err) {
    console.error(err);
    hideLoading();
    showToast('Não foi possível inicializar a impressão do boletim.', 'erro');
  }
}

// Reutilizável: Realiza download do Blob a partir do Base64
function downloadBase64PDF(base64, filename) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {type: 'application/pdf'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Auxiliares Úteis
function normalizarTexto(str) {
  if (!str) return '';
  return str.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatarSerieDocumento(serie) {
  const valor = (serie || '').toString().trim();
  if (!valor) return '—';
  return valor
    .replace(/\s+[—-]\s+(Ensino Médio|Ensino Fundamental)\b/gi, ' do $1')
    .replace(/\s+[—-]\s+/g, ' - ');
}

// ─── DOCUMENTOS SECRETARIA ───────────────────────────────────────────────────

let SEC_DOCUMENTOS = [];
const DOCUMENTO_SECRETARIA_VALIDADE_DIAS = 30;
const DOCUMENTO_SECRETARIA_TIPO_VAGA = 'Declaração de Vaga';

function extrairMetaDocumentoSecretaria(obs, chave) {
  if (!obs || !chave) return '';
  const regex = new RegExp(`\\[${chave}:\\s*([^\\]]+)\\]`, 'i');
  const match = String(obs).match(regex);
  return match ? match[1].trim() : '';
}

function limparMetaDocumentoSecretaria(obs) {
  return String(obs || '')
    .replace(/\[(?:NASC|DT_NASC|VAGA_ETAPA|VAGA_TURNO):[^\]]*\]\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getDocumentoSecretariaValidationUrl(protocolo) {
  const protocoloLimpo = String(protocolo || '').trim();
  if (!protocoloLimpo) return '';
  const url = new URL('validar-documento.html', window.location.href);
  url.searchParams.set('protocolo', protocoloLimpo);
  return url.toString();
}

function getDocumentoSecretariaQrUrl(protocolo, size = 160) {
  const urlValidacao = getDocumentoSecretariaValidationUrl(protocolo);
  if (!urlValidacao) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(urlValidacao)}`;
}

function getDocumentoSecretariaDataValidade(doc) {
  if (!doc?.data_emissao || doc?.tipo?.startsWith('Requerimento')) return null;
  const emissao = new Date(`${doc.data_emissao}T00:00:00`);
  if (Number.isNaN(emissao.getTime())) return null;
  emissao.setDate(emissao.getDate() + DOCUMENTO_SECRETARIA_VALIDADE_DIAS);
  return emissao;
}

function isDocumentoSecretariaValido(doc) {
  const validade = getDocumentoSecretariaDataValidade(doc);
  if (!validade) return true;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje.getTime() <= validade.getTime();
}

function formatarDataDocumentoBr(value) {
  if (!value) return '—';
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '—' : value.toLocaleDateString('pt-BR');
  }
  if (typeof value === 'string' && value.includes('/')) return value;
  const isoBase = typeof value === 'string' && value.length <= 10 ? `${value}T00:00:00` : value;
  const date = new Date(isoBase);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
}

function abrirValidacaoDocumentoSec(protocolo) {
  const url = getDocumentoSecretariaValidationUrl(protocolo);
  if (!url) {
    showToast('Protocolo inválido para consulta.', 'alerta');
    return;
  }
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    showToast('Permita pop-ups para abrir a conferência do documento.', 'alerta');
  }
}

function aguardarImagensDocumentoIframe(iframeDoc, timeoutMs = 3000) {
  const imagens = Array.from(iframeDoc?.images || []);
  if (!imagens.length) return Promise.resolve();
  return Promise.race([
    Promise.all(imagens.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        const finalizar = () => resolve();
        img.addEventListener('load', finalizar, { once: true });
        img.addEventListener('error', finalizar, { once: true });
      });
    })),
    new Promise(resolve => setTimeout(resolve, timeoutMs))
  ]);
}

function switchSecSubTab(tab, el) {
  document.querySelectorAll('#page-documentos-secretaria .tabs .tab').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  
  if (tab === 'historico') {
    document.getElementById('sec-subtab-historico').classList.remove('hidden');
    document.getElementById('sec-subtab-requerimentos').classList.add('hidden');
  } else {
    document.getElementById('sec-subtab-historico').classList.add('hidden');
    document.getElementById('sec-subtab-requerimentos').classList.remove('hidden');
  }
}

async function carregarDocumentosSecretaria() {
  showLoading('Carregando documentos...');
  try {
    const { data, error } = await supabaseClient
      .from('documentos_secretaria')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    SEC_DOCUMENTOS = data || [];
    renderSecDocumentos();
  } catch (err) {
    console.error('[carregarDocumentosSecretaria] Erro:', err);
    showToast('Erro ao carregar documentos da secretaria.', 'erro');
  } finally {
    hideLoading();
  }
}

function renderSecDocumentos() {
  const user = getCurrentUser();
  const rKey = user ? getRoleKey(user.perfil) : 'prof';
  const canDelete = (rKey === 'admin' || rKey === 'coord' || rKey === 'sec');
  
  // 1. Filtragem & renderização do Histórico (Declarações)
  const filtroAluno = normalizarTexto(document.getElementById('filtro-sec-aluno')?.value);
  const filtroTipo = document.getElementById('filtro-sec-tipo')?.value;
  const filtroDataIni = document.getElementById('filtro-sec-data-ini')?.value;
  const filtroDataFim = document.getElementById('filtro-sec-data-fim')?.value;
  
  const declaracoes = SEC_DOCUMENTOS.filter(doc => !doc.tipo.startsWith('Requerimento'));
  const declFiltradas = declaracoes.filter(doc => {
    const aluno = ALUNOS_DATA.find(a => a.id === doc.aluno_id);
    const alunoNome = aluno ? normalizarTexto(aluno.nome) : '';
    if (filtroAluno && !alunoNome.includes(filtroAluno)) return false;
    if (filtroTipo && doc.tipo !== filtroTipo) return false;
    if (filtroDataIni && doc.data_emissao < filtroDataIni) return false;
    if (filtroDataFim && doc.data_emissao > filtroDataFim) return false;
    return true;
  });
  
  const tbodyHist = document.getElementById('sec-historico-tbody');
  if (tbodyHist) {
    if (declFiltradas.length === 0) {
      tbodyHist.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--gray4)">Nenhum documento encontrado.</td></tr>';
    } else {
      tbodyHist.innerHTML = declFiltradas.map(doc => {
        const aluno = ALUNOS_DATA.find(a => a.id === doc.aluno_id);
        const dataFormatada = doc.data_emissao ? new Date(`${doc.data_emissao}T00:00:00`).toLocaleDateString('pt-BR') : '—';
        const deleteBtn = canDelete ? `<button class="btn btn-xs btn-outline" style="color:var(--red);margin-left:5px" onclick="excluirDocumentoSec('${doc.id}')" title="Excluir">🗑️</button>` : '';
        const validarBtn = `<button class="btn btn-xs btn-outline" style="margin-left:5px" onclick="abrirValidacaoDocumentoSec('${doc.protocolo}')" title="Conferir autenticidade">Conferir</button>`;
        return `
          <tr>
            <td><strong style="color:var(--primary);font-family:monospace">${doc.protocolo}</strong></td>
            <td>${aluno ? aluno.nome : '<span style="color:var(--red)">Aluno não encontrado</span>'}</td>
            <td>${aluno ? aluno.turma : '—'}</td>
            <td><span class="badge" style="background:var(--gray2);color:var(--gray7);font-weight:600">${doc.tipo}</span></td>
            <td>${dataFormatada}</td>
            <td style="font-size:12px;color:var(--gray5)">${doc.responsavel || '—'}</td>
            <td style="text-align:right">
              <button class="btn btn-xs btn-primary" onclick="imprimirDocumentoSec('${doc.id}')">🖨️ Imprimir</button>
              ${validarBtn}
              ${deleteBtn}
            </td>
          </tr>
        `;
      }).join('');
    }
  }
  
  // 2. Filtragem & renderização dos Requerimentos
  const filtroReqAluno = normalizarTexto(document.getElementById('filtro-sec-req-aluno')?.value);
  const filtroReqTipo = document.getElementById('filtro-sec-req-tipo')?.value;
  const filtroReqStatus = document.getElementById('filtro-sec-req-status')?.value;
  
  const requerimentos = SEC_DOCUMENTOS.filter(doc => doc.tipo.startsWith('Requerimento'));
  const reqFiltrados = requerimentos.filter(doc => {
    const aluno = ALUNOS_DATA.find(a => a.id === doc.aluno_id);
    const alunoNome = aluno ? normalizarTexto(aluno.nome) : '';
    if (filtroReqAluno && !alunoNome.includes(filtroReqAluno)) return false;
    if (filtroReqTipo && doc.tipo !== filtroReqTipo) return false;
    if (filtroReqStatus && doc.status !== filtroReqStatus) return false;
    return true;
  });
  
  const tbodyReq = document.getElementById('sec-requerimentos-tbody');
  if (tbodyReq) {
    if (reqFiltrados.length === 0) {
      tbodyReq.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--gray4)">Nenhum requerimento encontrado.</td></tr>';
    } else {
      tbodyReq.innerHTML = reqFiltrados.map(doc => {
        const aluno = ALUNOS_DATA.find(a => a.id === doc.aluno_id);
        const dataFormatada = doc.data_emissao ? new Date(doc.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
        
        let badgeColor = 'var(--gray3)';
        let badgeText = 'var(--gray7)';
        if (doc.status === 'pendente') { badgeColor = '#fef3c7'; badgeText = '#d97706'; }
        else if (doc.status === 'em_processamento') { badgeColor = '#dbeafe'; badgeText = '#2563eb'; }
        else if (doc.status === 'pronto_para_entrega') { badgeColor = '#faf5ff'; badgeText = '#7c3aed'; }
        else if (doc.status === 'entregue') { badgeColor = '#dcfce7'; badgeText = '#15803d'; }
        else if (doc.status === 'cancelado') { badgeColor = '#fee2e2'; badgeText = '#b91c1c'; }
        
        const deleteBtn = canDelete ? `<button class="btn btn-xs btn-outline" style="color:var(--red);margin-left:5px" onclick="excluirDocumentoSec('${doc.id}')" title="Excluir">🗑️</button>` : '';
        
        const selectStatus = `
          <select class="form-input form-select" style="width:145px;display:inline-block;padding:2px 4px;font-size:11.5px;height:28px" onchange="alterarStatusRequerimento('${doc.id}', this.value)">
            <option value="pendente" ${doc.status === 'pendente' ? 'selected' : ''}>Pendente</option>
            <option value="em_processamento" ${doc.status === 'em_processamento' ? 'selected' : ''}>Em Processamento</option>
            <option value="pronto_para_entrega" ${doc.status === 'pronto_para_entrega' ? 'selected' : ''}>Pronto para Entrega</option>
            <option value="entregue" ${doc.status === 'entregue' ? 'selected' : ''}>Entregue</option>
            <option value="cancelado" ${doc.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        `;

        return `
          <tr>
            <td><strong style="color:var(--primary);font-family:monospace">${doc.protocolo}</strong></td>
            <td>${aluno ? aluno.nome : '<span style="color:var(--red)">Aluno não encontrado</span>'}</td>
            <td>${aluno ? aluno.turma : '—'}</td>
            <td><span class="badge" style="background:var(--gray1);color:var(--gray6);font-weight:600">${doc.tipo}</span></td>
            <td>${doc.solicitante || 'O próprio aluno'}</td>
            <td>${dataFormatada}</td>
            <td style="font-size:12px;color:var(--gray5)">${doc.responsavel || '—'}</td>
            <td>
              <span class="badge" style="background:${badgeColor};color:${badgeText};font-weight:700">${doc.status.replace('_', ' ').toUpperCase()}</span>
            </td>
            <td style="text-align:right;white-space:nowrap">
              ${selectStatus}
              <button class="btn btn-xs btn-primary" onclick="imprimirDocumentoSec('${doc.id}')" title="Imprimir Comprovante">🖨️</button>
              ${deleteBtn}
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function filtrarSecDocumentos() {
  renderSecDocumentos();
}

function filtrarSecRequerimentos() {
  renderSecDocumentos();
}

function limparFiltrosSec(aba) {
  if (aba === 'historico') {
    const a = document.getElementById('filtro-sec-aluno'); if (a) a.value = '';
    const b = document.getElementById('filtro-sec-tipo'); if (b) b.value = '';
    const c = document.getElementById('filtro-sec-data-ini'); if (c) c.value = '';
    const d = document.getElementById('filtro-sec-data-fim'); if (d) d.value = '';
  } else {
    const a = document.getElementById('filtro-sec-req-aluno'); if (a) a.value = '';
    const b = document.getElementById('filtro-sec-req-tipo'); if (b) b.value = '';
    const c = document.getElementById('filtro-sec-req-status'); if (c) c.value = '';
  }
  renderSecDocumentos();
}

function abrirModalNovoDocSecretaria() {
  const select = document.getElementById('sec-doc-aluno-id');
  if (select) {
    const sorted = [...ALUNOS_DATA].sort((a, b) => a.nome.localeCompare(b.nome));
    select.innerHTML = '<option value="">Selecione um aluno...</option>' + 
      sorted.map(a => `<option value="${a.id}">${a.nome} (${a.turma || 'Sem turma'})</option>`).join('');
  }
  
  const tipo = document.getElementById('sec-doc-tipo'); if (tipo) tipo.value = '';
  const freq = document.getElementById('sec-doc-frequencia'); if (freq) freq.value = '';
  const sol = document.getElementById('sec-doc-solicitante'); if (sol) sol.value = '';
  const mot = document.getElementById('sec-doc-motivo'); if (mot) mot.value = '';
  const obs = document.getElementById('sec-doc-obs'); if (obs) obs.value = '';
  
  const cidade = document.getElementById('sec-doc-cidade-nasc'); if (cidade) cidade.value = 'Ourilândia do Norte';
  const uf = document.getElementById('sec-doc-uf-nasc'); if (uf) uf.value = 'PA';
  const dtNasc = document.getElementById('sec-doc-data-nasc'); if (dtNasc) dtNasc.value = '';
  const vagaEtapa = document.getElementById('sec-doc-vaga-etapa'); if (vagaEtapa) vagaEtapa.value = '';
  const vagaTurno = document.getElementById('sec-doc-vaga-turno'); if (vagaTurno) vagaTurno.value = '';
  
  mostrarCamposDinamicosSec();
  openModal('modal-novo-documento-secretaria');
}

function atualizarDataNascAoSelecionarAluno() {
  const alunoId = document.getElementById('sec-doc-aluno-id')?.value;
  const dataNascField = document.getElementById('sec-doc-data-nasc');
  if (!dataNascField) return;
  
  if (!alunoId) {
    dataNascField.value = '';
    return;
  }
  
  const aluno = ALUNOS_DATA.find(a => a.id === alunoId);
  if (aluno && aluno.nasc) {
    dataNascField.value = aluno.nasc;
  } else {
    dataNascField.value = '';
  }
}

function mostrarCamposDinamicosSec() {
  const tipo = document.getElementById('sec-doc-tipo')?.value;
  const grupoFreq = document.getElementById('sec-grupo-frequencia');
  const grupoReq = document.getElementById('sec-grupo-requerimento');
  const grupoNasc = document.getElementById('sec-grupo-nascimento');
  const grupoVaga = document.getElementById('sec-grupo-vaga');
  
  if (grupoFreq) grupoFreq.classList.add('hidden');
  if (grupoReq) grupoReq.classList.add('hidden');
  if (grupoNasc) grupoNasc.classList.add('hidden');
  if (grupoVaga) grupoVaga.classList.add('hidden');
  
  if (tipo && !tipo.startsWith('Requerimento')) {
    if (grupoNasc) grupoNasc.classList.remove('hidden');
  }
  
  if (tipo === 'Declaração de Frequência (Bolsa Família)') {
    if (grupoFreq) grupoFreq.classList.remove('hidden');
  } else if (tipo === DOCUMENTO_SECRETARIA_TIPO_VAGA) {
    if (grupoVaga) grupoVaga.classList.remove('hidden');
  } else if (tipo && tipo.startsWith('Requerimento')) {
    if (grupoReq) grupoReq.classList.remove('hidden');
  } else if (tipo === 'Declaração de Transferência') {
    if (grupoReq) grupoReq.classList.remove('hidden');
  }
}

async function gerarProtocoloSec(tipoDoc) {
  const prefix = tipoDoc.startsWith('Requerimento') ? 'REQ' : 'DEC';
  const ano = new Date().getFullYear();
  try {
    const { data, error } = await supabaseClient
      .from('documentos_secretaria')
      .select('protocolo')
      .like('protocolo', `SEC-${prefix}-${ano}-%`);
      
    if (error) throw error;
    
    // Extrai os números dos protocolos encontrados para evitar duplicatas ou buracos
    let maxSeq = 0;
    if (data && data.length > 0) {
      data.forEach(d => {
        const partes = d.protocolo.split('-');
        const seqStr = partes[partes.length - 1];
        const seqNum = parseInt(seqStr, 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      });
    }
    
    const nextSeq = maxSeq + 1;
    return `SEC-${prefix}-${ano}-${nextSeq.toString().padStart(4, '0')}`;
  } catch (err) {
    console.error('[gerarProtocoloSec] Erro:', err);
    // Fallback randômico para não travar o processo
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SEC-${prefix}-${ano}-${rand}`;
  }
}

async function salvarDocumentoSecretaria() {
  const alunoId = document.getElementById('sec-doc-aluno-id')?.value;
  const tipo = document.getElementById('sec-doc-tipo')?.value;
  const frequencia = document.getElementById('sec-doc-frequencia')?.value;
  const solicitante = document.getElementById('sec-doc-solicitante')?.value;
  const motivo = document.getElementById('sec-doc-motivo')?.value;
  const obs = document.getElementById('sec-doc-obs')?.value;
  const cidadeNasc = document.getElementById('sec-doc-cidade-nasc')?.value || '';
  const ufNasc = document.getElementById('sec-doc-uf-nasc')?.value || '';
  const dataNascInput = document.getElementById('sec-doc-data-nasc')?.value || '';
  const vagaEtapa = document.getElementById('sec-doc-vaga-etapa')?.value || '';
  const vagaTurno = document.getElementById('sec-doc-vaga-turno')?.value || '';
  
  if (!alunoId) { showToast('Selecione um aluno.', 'alerta'); return; }
  if (!tipo) { showToast('Selecione o tipo de emissão.', 'alerta'); return; }
  
  if (tipo === 'Declaração de Frequência (Bolsa Família)' && !frequencia) {
    showToast('Informe a frequência do aluno.', 'alerta');
    return;
  }
  if (tipo === DOCUMENTO_SECRETARIA_TIPO_VAGA && !vagaEtapa) {
    showToast('Selecione a etapa/modalidade com vaga.', 'alerta');
    return;
  }
  if (tipo === DOCUMENTO_SECRETARIA_TIPO_VAGA && !vagaTurno) {
    showToast('Selecione o turno da vaga.', 'alerta');
    return;
  }
  
  showLoading('Gerando documento...');
  try {
    const responsavel = getCurrentUser()?.nome || 'Secretaria';
    const protocolo = await gerarProtocoloSec(tipo);
    
    let obsCompleta = obs || '';
    if (tipo && !tipo.startsWith('Requerimento')) {
      if (cidadeNasc) {
        obsCompleta = `[NASC: ${cidadeNasc} - ${ufNasc}] ${obsCompleta}`.trim();
      }
      if (dataNascInput) {
        obsCompleta = `[DT_NASC: ${dataNascInput}] ${obsCompleta}`.trim();
      }
    }
    if (tipo === 'Declaração de Frequência (Bolsa Família)') {
      obsCompleta = `Frequência de ${frequencia}%. ${obsCompleta}`.trim();
    }
    if (tipo === DOCUMENTO_SECRETARIA_TIPO_VAGA) {
      obsCompleta = `[VAGA_ETAPA: ${vagaEtapa}] [VAGA_TURNO: ${vagaTurno}] ${obsCompleta}`.trim();
    }
    
    const payload = {
      protocolo,
      aluno_id: alunoId,
      tipo,
      data_emissao: new Date().toISOString().split('T')[0],
      status: tipo.startsWith('Requerimento') ? 'pendente' : 'concluido',
      solicitante: solicitante || null,
      motivo: motivo || null,
      obs: obsCompleta || null,
      responsavel,
      cidade_nascimento: tipo.startsWith('Requerimento') ? null : (cidadeNasc || null),
      uf_nascimento: tipo.startsWith('Requerimento') ? null : (ufNasc || null)
    };
    
    const { data, error } = await supabaseClient
      .from('documentos_secretaria')
      .insert(payload)
      .select()
      .single();
      
    if (error) throw error;
    
    // Se for declaração de transferência, gera automaticamente um requerimento de transferência pendente
    if (tipo === 'Declaração de Transferência') {
      const reqProtocolo = await gerarProtocoloSec('Requerimento de Transferência');
      const reqPayload = {
        protocolo: reqProtocolo,
        aluno_id: alunoId,
        tipo: 'Requerimento de Transferência',
        data_emissao: new Date().toISOString().split('T')[0],
        status: 'pendente',
        solicitante: solicitante || 'Secretaria (Auto)',
        motivo: motivo || 'Declaração de transferência emitida',
        obs: 'Gerado automaticamente por emissão de declaração.',
        responsavel
      };
      
      const { error: reqError } = await supabaseClient
        .from('documentos_secretaria')
        .insert(reqPayload);
        
      if (reqError) {
        console.error('[salvarDocumentoSecretaria] Erro ao criar requerimento automático:', reqError);
      }
    }
    
    showToast('Documento registrado com sucesso!', 'sucesso');
    closeModal('modal-novo-documento-secretaria');
    
    // Atualiza a listagem local
    await carregarDocumentosSecretaria();
    
    // Chama o disparador de impressão nativa
    imprimirDocumentoHtml(data.id);
    
  } catch (err) {
    console.error('[salvarDocumentoSecretaria] Erro:', err);
    showToast('Erro ao registrar documento no banco de dados.', 'erro');
  } finally {
    hideLoading();
  }
}

async function alterarStatusRequerimento(id, novoStatus) {
  showLoading('Atualizando status...');
  try {
    const { error } = await supabaseClient
      .from('documentos_secretaria')
      .update({ status: novoStatus })
      .eq('id', id);
      
    if (error) throw error;
    showToast('Status do requerimento atualizado!', 'sucesso');
    await carregarDocumentosSecretaria();
  } catch (err) {
    console.error('[alterarStatusRequerimento] Erro:', err);
    showToast('Erro ao atualizar status do requerimento.', 'erro');
  } finally {
    hideLoading();
  }
}

async function excluirDocumentoSec(id) {
  if (!confirm('Deseja realmente excluir este registro? Esta ação é irreversível e excluirá o protocolo do histórico.')) return;
  
  showLoading('Excluindo...');
  try {
    const { error } = await supabaseClient
      .from('documentos_secretaria')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    showToast('Registro excluído!', 'sucesso');
    await carregarDocumentosSecretaria();
  } catch (err) {
    console.error('[excluirDocumentoSec] Erro:', err);
    showToast('Erro ao excluir registro.', 'erro');
  } finally {
    hideLoading();
  }
}

async function imprimirDocumentoSec(id) {
  imprimirDocumentoHtml(id);
}

async function imprimirDocumentoHtml(id) {
  showLoading('Formatando impressão...');
  try {
    let doc = SEC_DOCUMENTOS.find(d => d.id === id);
    if (!doc) {
      const { data, error } = await supabaseClient
        .from('documentos_secretaria')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data) throw new Error('Documento não encontrado');
      doc = data;
    }
    
    const aluno = ALUNOS_DATA.find(a => a.id === doc.aluno_id);
    if (!aluno) throw new Error('Dados do aluno não encontrados.');
    const turmaAluno = TURMAS_DATA.find(t => t.id === aluno.turma_id) || TURMAS_DATA.find(t => t.code === aluno.turma);
    const turmaTexto = aluno.turma || turmaAluno?.code || '—';
    const turnoTexto = aluno.turno || turmaAluno?.turno || '—';
    const serieTexto = formatarSerieDocumento(aluno.serie || turmaAluno?.serie || '');
    
    const dataPorExtenso = formatarDataPorExtenso(doc.data_emissao);
    const dataBr = doc.data_emissao ? new Date(doc.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const dataValidade = getDocumentoSecretariaDataValidade(doc);
    const dataValidadeBr = dataValidade ? formatarDataDocumentoBr(dataValidade) : '—';
    const documentoValido = isDocumentoSecretariaValido(doc);
    const urlValidacao = getDocumentoSecretariaValidationUrl(doc.protocolo);
    const qrCodeUrl = getDocumentoSecretariaQrUrl(doc.protocolo, 180);
    
    // Obtenção da Cidade e UF de Nascimento de forma defensiva/segura
    let cidadeNasc = doc.cidade_nascimento || '';
    let ufNasc = doc.uf_nascimento || '';
    if (!cidadeNasc && doc.obs && doc.obs.includes('[NASC:')) {
      const match = doc.obs.match(/\[NASC:\s*([^\-\]]+)\s*\-\s*([^\]]+)\]/);
      if (match) {
        cidadeNasc = match[1].trim();
        ufNasc = match[2].trim();
      }
    }
    
    let dataNasc = '';
    if (doc.obs && doc.obs.includes('[DT_NASC:')) {
      const matchDt = doc.obs.match(/\[DT_NASC:\s*([^\]]+)\]/);
      if (matchDt) {
        dataNasc = matchDt[1].trim();
      }
    }
    if (!dataNasc) {
      dataNasc = aluno.nasc || '';
    }

    const formatarDataNasc = (dt) => {
      if (!dt) return '—';
      if (dt.includes('/')) return dt;
      const parts = dt.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const parsedDate = new Date(dt + 'T00:00:00');
      return Number.isNaN(parsedDate.getTime()) ? '—' : parsedDate.toLocaleDateString('pt-BR');
    };
    
    let cidadeNascText = '';
    if (cidadeNasc) {
      cidadeNascText = `, natural de <b>${cidadeNasc} - ${ufNasc || 'PA'}</b>`;
    }
    const vagaEtapa = extrairMetaDocumentoSecretaria(doc.obs, 'VAGA_ETAPA');
    const vagaTurno = extrairMetaDocumentoSecretaria(doc.obs, 'VAGA_TURNO');
    const vagaEtapaTexto = vagaEtapa ? formatarSerieDocumento(vagaEtapa) : '—';
    const vagaTurnoTexto = vagaTurno || '—';
    
    let contentHtml = '';
    let titleHtml = doc.tipo;
    
    if (doc.tipo === 'Declaração de Matrícula') {
      contentHtml = `
        <p class="doc-text">
          Declaramos, para os devidos fins, que o(a) estudante <b>${aluno.nome}</b>, 
          inscrito(a) sob o CPF <b>${formatarCPF(aluno.cpf || '—')}</b>, nascido(a) em <b>${formatarDataNasc(dataNasc)}</b>${cidadeNascText}, 
          está regularmente matriculado(a) e frequentando as aulas nesta instituição de ensino no ano letivo de <b>2026</b>, 
          cursando a turma <b>${turmaTexto}</b>, correspondente ao <b>${serieTexto}</b>, no turno <b>${turnoTexto}</b>.
        </p>
        <p class="doc-text">
          Referida informação é expressão da verdade.
        </p>
      `;
    } else if (doc.tipo === 'Declaração de Frequência (Bolsa Família)') {
      let freqValue = '100';
      if (doc.obs && doc.obs.includes('Frequência de')) {
        const match = doc.obs.match(/Frequência de (\d+)%/);
        if (match) freqValue = match[1];
      }
      contentHtml = `
        <p class="doc-text">
          Declaramos, para os devidos fins de comprovação de condicionalidade do Programa Bolsa Família, 
          que o(a) estudante <b>${aluno.nome}</b>, inscrito(a) sob o CPF <b>${formatarCPF(aluno.cpf || '—')}</b>, 
          nascido(a) em <b>${formatarDataNasc(dataNasc)}</b>${cidadeNascText}, está regularmente matriculado(a) 
          e frequentando as aulas nesta instituição de ensino no ano letivo de <b>2026</b>, na turma <b>${turmaTexto}</b>, 
          correspondente ao <b>${serieTexto}</b>, no turno <b>${turnoTexto}</b>.
        </p>
        <p class="doc-text">
          Apurou-se, para o período avaliativo correspondente, uma frequência escolar global e relativa de <b>${freqValue}%</b>.
        </p>
      `;
    } else if (doc.tipo === 'Declaração de Escolaridade') {
      contentHtml = `
        <p class="doc-text">
          Declaramos, para os devidos fins de direito, que o(a) estudante <b>${aluno.nome}</b>, 
          inscrito(a) sob o CPF <b>${formatarCPF(aluno.cpf || '—')}</b>, nascido(a) em <b>${formatarDataNasc(dataNasc)}</b>${cidadeNascText}, 
          frequentou regularmente as aulas correspondentes ao Ensino nesta unidade de ensino na turma <b>${turmaTexto}</b>, 
          correspondente ao <b>${serieTexto}</b>, no turno <b>${turnoTexto}</b>, sob regime letivo ordinário.
        </p>
        <p class="doc-text">
          O referido estudante possui histórico de rendimento escolar e frequência arquivados em pasta individual sob responsabilidade da secretaria desta unidade.
        </p>
      `;
    } else if (doc.tipo === DOCUMENTO_SECRETARIA_TIPO_VAGA) {
      contentHtml = `
        <p class="doc-text">
          Declaramos, para os devidos fins, que esta unidade escolar dispõe de vaga para matrícula do(a) estudante <b>${aluno.nome}</b>,
          inscrito(a) sob o CPF <b>${formatarCPF(aluno.cpf || '—')}</b>, nascido(a) em <b>${formatarDataNasc(dataNasc)}</b>${cidadeNascText},
          no <b>${vagaEtapaTexto}</b>, no turno <b>${vagaTurnoTexto}</b>, para o ano letivo de <b>2026</b>.
        </p>
        <p class="doc-text">
          A presente declaração confirma a disponibilidade de vaga nesta escola na etapa/modalidade e turno acima informados, servindo para instrução de matrícula ou transferência.
        </p>
      `;
    } else if (doc.tipo === 'Declaração de Transferência') {
      contentHtml = `
        <p class="doc-text">
          Declaramos, para os devidos fins, que foi solicitada nesta data a transferência escolar do(a) estudante <b>${aluno.nome}</b>, 
          inscrito(a) sob o CPF <b>${formatarCPF(aluno.cpf || '—')}</b>, nascido(a) em <b>${formatarDataNasc(dataNasc)}</b>${cidadeNascText}, 
          que se encontrava devidamente matriculado(a) na turma <b>${turmaTexto}</b>, correspondente ao <b>${serieTexto}</b>, no turno <b>${turnoTexto}</b>.
        </p>
        <p class="doc-text">
          Esta declaração atesta que a vaga de origem está liberada e o processo de transferência ativo. O presente documento 
          tem validade improrrogável de <b>30 (trinta) dias</b> a partir de sua emissão, prazo este necessário para a confecção e 
          entrega do Histórico Escolar definitivo.
        </p>
      `;
    } else if (doc.tipo.startsWith('Requerimento')) {
      titleHtml = 'Comprovante de Requerimento';
      contentHtml = `
        <p style="text-align:justify;margin-bottom:20px;font-size:12pt">
          A secretaria escolar atesta e emite o presente comprovante de solicitação para fins de controle e protocolo do pedido. 
          O documento requerido encontra-se em fase de processamento, devendo ser observados os prazos regimentais desta instituição.
        </p>
        
        <div class="receipt-card">
          <div style="font-size:12pt;font-weight:bold;text-align:center;margin-bottom:15px;border-bottom:1px solid #000;padding-bottom:5px">
            DETALHES DO REQUERIMENTO
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Protocolo de Abertura:</span>
            <span style="font-family:monospace;font-size:12pt;font-weight:bold;color:#1d4ed8">${doc.protocolo}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Estudante:</span>
            <span>${aluno.nome}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">CPF:</span>
            <span>${formatarCPF(aluno.cpf || '—')}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Turma / Ano / Turno:</span>
            <span>${turmaTexto} (${serieTexto} • ${turnoTexto})</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Serviço/Documento Solicitado:</span>
            <span style="font-weight:bold">${doc.tipo}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Solicitante:</span>
            <span>${doc.solicitante || 'O próprio aluno'}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Motivo do Pedido:</span>
            <span>${doc.motivo || 'Sem justificativa informada'}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Data do Requerimento:</span>
            <span>${dataBr}</span>
          </div>
          <div class="receipt-row" style="margin-top:8px;border-top:1px dashed #ccc;padding-top:8px">
            <span class="receipt-label">Responsável pelo Cadastro:</span>
            <span>${doc.responsavel || 'Secretaria'}</span>
          </div>
        </div>
        
        <div style="margin-top:30px;font-size:10.5px;color:#555;text-align:justify;line-height:1.4">
          * IMPORTANTE: O prazo médio de expedição para 2ª vias de diploma e histórico escolar é de até 5 (cinco) dias úteis. 
          Para requerimentos de transferência, o prazo é de até 3 (três) dias úteis. Guarde este documento comprobatório.
        </div>
      `;
    }
    
    const htmlPrint = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${titleHtml} - ${doc.protocolo}</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 15mm 20mm 15mm 20mm;
            }
          }
          body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #fff;
          }
          .container {
            width: 100%;
            box-sizing: border-box;
            position: relative;
          }
          .header-logo {
            width: 100%;
            max-height: 90px;
            object-fit: contain;
            margin-bottom: 20px;
            display: block;
          }
          .watermark {
            position: absolute;
            top: 52%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 75%;
            opacity: 0.08;
            z-index: -1;
            pointer-events: none;
          }
          .protocol-tag {
            font-family: monospace;
            font-size: 11px;
            color: #333;
            text-align: right;
            margin-bottom: 10px;
          }
          .content-body {
            margin-top: 10px;
          }
          .doc-title {
            font-size: 15pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-top: 15px;
            margin-bottom: 35px;
            letter-spacing: 0.5px;
          }
          .doc-text {
            text-indent: 2.5cm;
            margin-bottom: 25px;
            font-size: 12pt;
            text-align: justify;
          }
          .doc-date {
            text-align: right;
            margin-top: 40px;
            margin-bottom: 40px;
            font-size: 12pt;
          }
          .signature-area {
            display: flex;
            justify-content: space-around;
            margin-top: 50px;
            margin-bottom: 30px;
          }
          .signature-box {
            text-align: center;
            width: 45%;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-bottom: 5px;
          }
          .signature-desc {
            font-size: 10.5pt;
            color: #333;
          }
          .receipt-card {
            border: 1.5px solid #000;
            padding: 20px;
            margin-top: 25px;
            background: #fafafa;
            border-radius: 6px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11pt;
            border-bottom: 1px dashed #eee;
            padding-bottom: 4px;
          }
          .receipt-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .receipt-label {
            font-weight: bold;
            color: #111;
          }
          .verification-strip {
            margin-top: 20px;
            padding: 10px 12px;
            border: 1px dashed #94a3b8;
            background: #f8fafc;
            border-radius: 10px;
            color: #334155;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            font-size: 9.2pt;
          }
          .verification-strip strong {
            color: #0f172a;
          }
          .verification-link {
            max-width: 230px;
            font-family: monospace;
            font-size: 7.8pt;
            word-break: break-all;
          }
          .footer {
            margin-top: 18px;
            font-size: 8.5pt;
            color: #444;
            border-top: 1px solid #bbb;
            padding-top: 10px;
            line-height: 1.4;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
          }
          .footer-main {
            flex: 1;
          }
          .footer-qr {
            width: 96px;
            flex-shrink: 0;
            text-align: center;
          }
          .footer-qr img {
            width: 86px;
            height: 86px;
            display: block;
            margin: 0 auto 6px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 4px;
            background: #fff;
          }
          .footer-qr span {
            display: block;
            font-size: 7.2pt;
            line-height: 1.25;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="watermark" src="assets/marca_dagua.png" alt="Marca d'água">
          
          <div class="content-header">
            <img class="header-logo" src="assets/cabecalho_logo.png" alt="Cabeçalho Oficial">
            <div class="protocol-tag">Protocolo: <b>${doc.protocolo}</b></div>
          </div>
          
          <div class="content-body">
            <div class="doc-title">${titleHtml}</div>
            
            ${contentHtml}
            
            ${!doc.tipo.startsWith('Requerimento') ? `
              <div class="doc-date">
                Ourilândia do Norte - PA, ${dataPorExtenso}.
              </div>
              
              <div class="signature-area">
                <div class="signature-box" style="width:50%">
                  <div class="signature-line"></div>
                  <span class="signature-desc"><b>Assinatura Autorizada</b><br>Secretaria / Direção Escolar</span>
                </div>
              </div>
            ` : `
              <div class="signature-area">
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <span class="signature-desc"><b>${doc.responsavel || 'Secretaria'}</b><br>Responsável pelo Cadastro</span>
                </div>
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <span class="signature-desc"><b>${doc.solicitante || 'Assinatura do Solicitante'}</b><br>Assinatura do Solicitante</span>
                </div>
              </div>
            `}
          </div>
          
          ${!doc.tipo.startsWith('Requerimento') ? `
            <div class="verification-strip">
              <div>
                <strong>Autenticidade digital:</strong> utilize o QR Code ou informe o protocolo <b>${doc.protocolo}</b> no portal de conferência.<br>
                Documento eletrônico com validade de <b>${DOCUMENTO_SECRETARIA_VALIDADE_DIAS} dias</b> a partir da emissão.
                Situação atual: <b>${documentoValido ? 'dentro do prazo' : 'fora do prazo'}</b>.
                ${dataValidade ? `Válido até <b>${dataValidadeBr}</b>.` : ''}
              </div>
              <div class="verification-link">${urlValidacao}</div>
            </div>
          ` : ''}

          <div class="footer">
            <div class="footer-main">
              RVS Escolar Gestão Inteligente — Responsável: <b>${doc.responsavel || 'Secretaria'}</b><br>
              Ficha gerada eletronicamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} | Protocolo: ${doc.protocolo}<br>
              ${dataValidade ? `Validade eletrônica: ${dataValidadeBr} | Status da consulta: ${documentoValido ? 'válido' : 'expirado'}` : 'Consulta eletrônica disponível por protocolo.'}
            </div>
            ${!doc.tipo.startsWith('Requerimento') ? `
              <div class="footer-qr">
                <img src="${qrCodeUrl}" alt="QR Code de autenticação do documento">
                <span>Escaneie para validar<br>somente em visualização</span>
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document || iframe.contentDocument;
    iframeDoc.open();
    iframeDoc.write(htmlPrint);
    iframeDoc.close();
    
    await aguardarImagensDocumentoIframe(iframeDoc);
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 2500);
    }, 180);
    
  } catch (err) {
    console.error('[imprimirDocumentoHtml] Erro:', err);
    showToast('Erro ao inicializar impressão.', 'erro');
  } finally {
    hideLoading();
  }
}

function formatarDataPorExtenso(dateVal) {
  if (!dateVal) return '';
  const date = new Date(dateVal + 'T00:00:00');
  if (isNaN(date.getTime())) return '';
  const dia = date.getDate();
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const mes = meses[date.getMonth()];
  const ano = date.getFullYear();
  return `${dia} de ${mes} de ${ano}`;
}

// SIGAEDU VISUAL REFRESH - acesso unificado servidor/aluno
const LOGIN_DOMAIN = '@escola.seduc.pa.gov.br';
const LEGACY_STUDENT_DOMAIN = '@aluno.seduc.pa.gov.br';
let RECOVERY_TYPE = 'servidor';
let RECOVERY_ACCESS_DATA = null;

function getOnlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeInstitutionalEmail(email) {
  const raw = String(email || '').trim().toLowerCase();
  if (!raw) return '';
  const localPart = raw.includes('@') ? raw.split('@')[0] : raw;
  return `${localPart}${LOGIN_DOMAIN}`;
}

function buildLoginEmailCandidates(email) {
  const raw = String(email || '').trim().toLowerCase();
  if (!raw) return [];
  const localPart = raw.includes('@') ? raw.split('@')[0] : raw;
  return [...new Set([
    raw.includes('@') ? raw : `${localPart}${LOGIN_DOMAIN}`,
    `${localPart}${LOGIN_DOMAIN}`,
    `${localPart}${LEGACY_STUDENT_DOMAIN}`
  ].filter(Boolean))];
}

function normalizeDateForLookup(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

  const digits = getOnlyDigits(raw);
  if (digits.length === 8) {
    if (raw.includes('-') && raw.indexOf('-') === 4) {
      return `${digits.slice(6, 8)}/${digits.slice(4, 6)}/${digits.slice(0, 4)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return raw;
}

function readFirstAvailable(source, keys) {
  if (!source) return '';
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && String(source[key]).trim() !== '') {
      return source[key];
    }
  }
  return '';
}

function setLoginError(message) {
  const errEl = document.getElementById('login-error');
  if (!errEl) return;
  errEl.textContent = message;
  errEl.style.display = 'block';
}

function clearLoginError() {
  const errEl = document.getElementById('login-error');
  if (!errEl) return;
  errEl.style.display = 'none';
}

function setLoginButtonState(loading) {
  const btn = document.getElementById('login-submit-btn');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Verificando...' : 'Entrar no Sistema';
}

function setRecoveryError(message) {
  const errEl = document.getElementById('recovery-error');
  if (!errEl) return;
  errEl.textContent = message;
  errEl.style.display = 'block';
}

function clearRecoveryFeedback() {
  const errEl = document.getElementById('recovery-error');
  const resultBox = document.getElementById('recovery-result');
  if (errEl) errEl.style.display = 'none';
  if (resultBox) resultBox.style.display = 'none';
  RECOVERY_ACCESS_DATA = null;
}

function setRecoveryButtonState(loading) {
  const btn = document.getElementById('recovery-submit-btn');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Buscando...' : 'Localizar Acesso';
}

function openRecoveryResult(result) {
  RECOVERY_ACCESS_DATA = result;
  const resultBox = document.getElementById('recovery-result');
  if (!resultBox) return;
  document.getElementById('recovery-result-badge').textContent = result.tipo === 'aluno' ? 'Aluno' : 'Servidor';
  document.getElementById('recovery-result-nome').textContent = result.nome || '—';
  document.getElementById('recovery-result-email').textContent = result.email || '—';
  document.getElementById('recovery-result-senha').textContent = result.senha || '—';
  document.getElementById('recovery-result-portal').textContent = result.portal || '—';
  resultBox.style.display = 'block';
}

function setRecoveryType(type) {
  RECOVERY_TYPE = type === 'aluno' ? 'aluno' : 'servidor';
  const servidorTab = document.getElementById('recovery-tab-servidor');
  const alunoTab = document.getElementById('recovery-tab-aluno');
  const descricao = document.getElementById('recovery-type-description');
  const matriculaField = document.getElementById('recovery-field-matricula');

  if (servidorTab) servidorTab.classList.toggle('active', RECOVERY_TYPE === 'servidor');
  if (alunoTab) alunoTab.classList.toggle('active', RECOVERY_TYPE === 'aluno');
  if (matriculaField) matriculaField.style.display = RECOVERY_TYPE === 'servidor' ? 'block' : 'none';
  if (descricao) {
    descricao.textContent = RECOVERY_TYPE === 'servidor'
      ? 'Informe Matrícula sem Vínculo, CPF e Data de Nascimento para localizar o acesso do servidor.'
      : 'Informe CPF e Data de Nascimento para localizar o acesso do aluno.';
  }

  clearRecoveryFeedback();
}

function abrirRecuperacaoAcesso() {
  const modal = document.getElementById('modal-recuperacao-acesso');
  if (!modal) return;
  setRecoveryType(RECOVERY_TYPE);
  modal.classList.add('open');
  const firstFieldId = RECOVERY_TYPE === 'servidor' ? 'recovery-matricula-input' : 'recovery-cpf-input';
  setTimeout(() => document.getElementById(firstFieldId)?.focus(), 120);
}

function fecharRecuperacaoAcesso(event) {
  if (event && event.target !== document.getElementById('modal-recuperacao-acesso')) return;
  document.getElementById('modal-recuperacao-acesso')?.classList.remove('open');
}

async function tryServidorLogin(email, pass) {
  const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
    email,
    password: pass
  });

  if (authErr) return { ok: false, error: authErr };

  const { data: userData, error: userErr } = await supabaseClient
    .from('usuarios')
    .select('id, nome, perfil, email, turno, cargo, foto_url, formacao, bio, whatsapp, ativo, escola_id, escola_id_ativa, admin_global')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (userErr) {
    await supabaseClient.auth.signOut();
    throw userErr;
  }

  if (userData && userData.ativo === false) {
    await supabaseClient.auth.signOut();
    return { ok: false, inactive: true };
  }

  return {
    ok: true,
    user: userData || {
      id: authData.user.id,
      nome: authData.user.user_metadata?.nome || 'Usuário',
      perfil: authData.user.user_metadata?.perfil || 'professor',
      email: authData.user.email
    }
  };
}

async function tryAlunoLogin(emailCandidates, pass) {
  let lastError = null;

  for (const candidate of emailCandidates) {
    const { data, error } = await supabaseClient.rpc('login_portal_aluno', {
      p_email: candidate,
      p_senha: pass
    });

    if (error) {
      lastError = error;
      continue;
    }

    if (data && data.status !== 'error') {
      return {
        ok: true,
        data: {
          ...data,
          email: normalizeInstitutionalEmail(data.email || candidate)
        }
      };
    }
  }

  return { ok: false, error: lastError };
}

async function consultarRecuperacaoServidor() {
  const matricula = String(document.getElementById('recovery-matricula-input')?.value || '').trim().toLowerCase();
  const cpf = String(document.getElementById('recovery-cpf-input')?.value || '').trim();
  const dataNascimento = String(document.getElementById('recovery-dn-input')?.value || '').trim();

  if (!matricula) {
    setRecoveryError('Informe a Matrícula sem Vínculo do servidor.');
    document.getElementById('recovery-matricula-input')?.focus();
    return;
  }
  if (getOnlyDigits(cpf).length !== 11) {
    setRecoveryError('Informe o CPF completo do servidor.');
    document.getElementById('recovery-cpf-input')?.focus();
    return;
  }
  if (normalizeDateForLookup(dataNascimento).length !== 10) {
    setRecoveryError('Informe a Data de Nascimento completa do servidor.');
    document.getElementById('recovery-dn-input')?.focus();
    return;
  }

  const { data, error } = await supabaseClient.from('usuarios').select('*').order('nome');
  if (error) throw error;

  const hasLookupFields = (data || []).some((item) =>
    readFirstAvailable(item, ['matricula_sem_vinculo', 'matriculaSemVinculo', 'matricula', 'registro_funcional', 'registro']) ||
    readFirstAvailable(item, ['cpf', 'cpf_servidor']) ||
    readFirstAvailable(item, ['data_nascimento', 'dataNascimento', 'data_nasc', 'nascimento'])
  );

  if (!hasLookupFields) {
    setRecoveryError('O cadastro de servidores ainda não possui Matrícula sem Vínculo, CPF e Data de Nascimento disponíveis para recuperação automática.');
    return;
  }

  const cpfDigits = getOnlyDigits(cpf);
  const birthToken = normalizeDateForLookup(dataNascimento);
  const found = (data || []).find((item) => {
    const matriculaValue = String(readFirstAvailable(item, ['matricula_sem_vinculo', 'matriculaSemVinculo', 'matricula', 'registro_funcional', 'registro']) || '').trim().toLowerCase();
    const cpfValue = getOnlyDigits(readFirstAvailable(item, ['cpf', 'cpf_servidor']));
    const birthValue = normalizeDateForLookup(readFirstAvailable(item, ['data_nascimento', 'dataNascimento', 'data_nasc', 'nascimento']));
    return matriculaValue === matricula && cpfValue === cpfDigits && birthValue === birthToken;
  });

  if (!found) {
    setRecoveryError('Não localizamos um servidor com os dados informados.');
    return;
  }

  const email = normalizeInstitutionalEmail(readFirstAvailable(found, ['email']));
  const senha = readFirstAvailable(found, ['senha']);
  if (!email || !senha) {
    setRecoveryError('O servidor foi localizado, mas o cadastro de acesso ainda está incompleto.');
    return;
  }

  openRecoveryResult({
    tipo: 'servidor',
    nome: readFirstAvailable(found, ['nome']) || 'Servidor',
    email,
    senha,
    portal: 'Portal do Servidor'
  });
}

async function consultarRecuperacaoAluno() {
  const cpf = String(document.getElementById('recovery-cpf-input')?.value || '').trim();
  const dataNascimento = String(document.getElementById('recovery-dn-input')?.value || '').trim();

  if (getOnlyDigits(cpf).length !== 11) {
    setRecoveryError('Informe o CPF completo do aluno.');
    document.getElementById('recovery-cpf-input')?.focus();
    return;
  }
  if (normalizeDateForLookup(dataNascimento).length !== 10) {
    setRecoveryError('Informe a Data de Nascimento completa do aluno.');
    document.getElementById('recovery-dn-input')?.focus();
    return;
  }

  const { data, error } = await supabaseClient.rpc('consultar_acesso_aluno', {
    p_cpf: cpf,
    p_data_nascimento: dataNascimento
  });

  if (error) throw error;

  if (!data || data.status === 'error') {
    setRecoveryError('Não localizamos um aluno com os dados informados.');
    return;
  }

  openRecoveryResult({
    tipo: 'aluno',
    nome: data.nome || 'Aluno',
    email: normalizeInstitutionalEmail(data.email || ''),
    senha: data.senha || '',
    portal: 'Portal do Aluno'
  });
}

async function consultarRecuperacaoAcesso() {
  clearRecoveryFeedback();
  setRecoveryButtonState(true);
  try {
    if (RECOVERY_TYPE === 'aluno') await consultarRecuperacaoAluno();
    else await consultarRecuperacaoServidor();
  } catch (err) {
    console.error('[consultarRecuperacaoAcesso]', err);
    setRecoveryError('Não foi possível concluir a busca agora. Tente novamente.');
  } finally {
    setRecoveryButtonState(false);
  }
}

function usarAcessoRecuperado() {
  if (!RECOVERY_ACCESS_DATA) return;
  const emailInput = document.getElementById('email-input');
  const passInput = document.getElementById('pass-input');
  if (emailInput) emailInput.value = RECOVERY_ACCESS_DATA.email || '';
  if (passInput) passInput.value = RECOVERY_ACCESS_DATA.senha || '';
  emailInput?.classList.add('highlight-glow');
  passInput?.classList.add('highlight-glow');
  setTimeout(() => {
    emailInput?.classList.remove('highlight-glow');
    passInput?.classList.remove('highlight-glow');
  }, 2200);
  fecharRecuperacaoAcesso();
}

async function doLogin() {
  const emailInput = document.getElementById('email-input');
  const passInput = document.getElementById('pass-input');
  const rawEmail = String(emailInput?.value || '').trim();
  const pass = String(passInput?.value || '');

  if (!rawEmail || !pass) {
    setLoginError('Informe seu e-mail institucional e sua senha.');
    return;
  }

  clearLoginError();
  setLoginButtonState(true);

  const preferredEmail = normalizeInstitutionalEmail(rawEmail);
  const emailCandidates = buildLoginEmailCandidates(rawEmail);
  if (emailInput) emailInput.value = preferredEmail;

  try {
    const servidorResult = await tryServidorLogin(preferredEmail, pass);
    if (servidorResult.ok) {
      await _entrarNoSistema(servidorResult.user);
      return;
    }

    if (servidorResult.inactive) {
      setLoginError('Acesso negado: usuário inativo.');
      return;
    }

    const alunoResult = await tryAlunoLogin(emailCandidates, pass);
    if (alunoResult.ok) {
      try { sessionStorage.setItem('portal_aluno', JSON.stringify(alunoResult.data)); } catch(_) {}
      window.location.href = 'portal_aluno.html';
      return;
    }

    const authErr = servidorResult.error;
    if (authErr?.message && authErr.message.toLowerCase().includes('email not confirmed')) {
      setLoginError('E-mail não confirmado. Contate o administrador do sistema.');
    } else if (authErr?.status === 500 || (authErr?.message && authErr.message.toLowerCase().includes('database'))) {
      setLoginError('Erro interno no servidor. Contate o administrador.');
    } else {
      setLoginError('E-mail ou senha incorretos. Verifique e tente novamente.');
    }
  } catch (err) {
    console.error('[login exception]', err);
    setLoginError('Erro de conexão. Tente novamente.');
  } finally {
    setLoginButtonState(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('portal_aluno')) {
    window.location.href = 'portal_aluno.html';
    return;
  }

  document.getElementById('recovery-matricula-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('recovery-cpf-input')?.focus();
  });
  document.getElementById('recovery-cpf-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('recovery-dn-input')?.focus();
  });
  document.getElementById('recovery-dn-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') consultarRecuperacaoAcesso();
  });
});

// Camada final: corrige textos com encoding antigo e consolida o login unificado.
function normalizeLoginInterface() {
  const logoSubtitle = document.querySelector('.login-logo p');
  if (logoSubtitle) logoSubtitle.innerHTML = 'Sistema de Gest&atilde;o Escolar';

  const passwordInput = document.getElementById('pass-input');
  if (passwordInput) passwordInput.placeholder = '******';

  const domainHint = document.querySelector('.login-domain-hint');
  if (domainHint) {
    domainHint.innerHTML = 'Voc&ecirc; pode informar s&oacute; o prefixo do e-mail. O dom&iacute;nio institucional ser&aacute; completado automaticamente.';
  }

  const oldStudentButton = document.querySelector('.aluno-acesso-btn');
  if (oldStudentButton) oldStudentButton.remove();

  const recoveryDescription = document.getElementById('recovery-type-description');
  if (recoveryDescription) {
    recoveryDescription.innerHTML = 'Informe Matr&iacute;cula sem V&iacute;nculo, CPF e Data de Nascimento para localizar o acesso do servidor.';
  }

  const recoveryError = document.getElementById('recovery-error');
  if (recoveryError) recoveryError.innerHTML = 'N&atilde;o foi poss&iacute;vel localizar o acesso.';

  const matriculaLabel = document.querySelector('label[for="recovery-matricula-input"]');
  if (matriculaLabel) matriculaLabel.innerHTML = 'Matr&iacute;cula sem V&iacute;nculo';

  const matriculaInput = document.getElementById('recovery-matricula-input');
  if (matriculaInput) matriculaInput.placeholder = 'Digite a matr&iacute;cula sem v&iacute;nculo';

  ['recovery-result-nome', 'recovery-result-email', 'recovery-result-senha', 'recovery-result-portal'].forEach((id) => {
    const el = document.getElementById(id);
    if (el && (!el.textContent.trim() || el.textContent.includes('�'))) el.textContent = '--';
  });

  const modalClose = document.querySelector('#modal-recuperacao-acesso .modal-close');
  if (modalClose) modalClose.innerHTML = '&times;';
}

function openRecoveryResult(result) {
  RECOVERY_ACCESS_DATA = result;
  const resultBox = document.getElementById('recovery-result');
  if (!resultBox) return;
  document.getElementById('recovery-result-badge').textContent = result.tipo === 'aluno' ? 'Aluno' : 'Servidor';
  document.getElementById('recovery-result-nome').textContent = result.nome || '--';
  document.getElementById('recovery-result-email').textContent = result.email || '--';
  document.getElementById('recovery-result-senha').textContent = result.senha || '--';
  document.getElementById('recovery-result-portal').textContent = result.portal || '--';
  resultBox.style.display = 'block';
}

function setRecoveryType(type) {
  RECOVERY_TYPE = type === 'aluno' ? 'aluno' : 'servidor';
  const servidorTab = document.getElementById('recovery-tab-servidor');
  const alunoTab = document.getElementById('recovery-tab-aluno');
  const descricao = document.getElementById('recovery-type-description');
  const matriculaField = document.getElementById('recovery-field-matricula');

  if (servidorTab) servidorTab.classList.toggle('active', RECOVERY_TYPE === 'servidor');
  if (alunoTab) alunoTab.classList.toggle('active', RECOVERY_TYPE === 'aluno');
  if (matriculaField) matriculaField.style.display = RECOVERY_TYPE === 'servidor' ? 'block' : 'none';
  if (descricao) {
    descricao.textContent = RECOVERY_TYPE === 'servidor'
      ? 'Informe Matr\u00edcula sem V\u00ednculo, CPF e Data de Nascimento para localizar o acesso do servidor.'
      : 'Informe CPF e Data de Nascimento para localizar o acesso do aluno.';
  }

  clearRecoveryFeedback();
}

async function consultarRecuperacaoServidor() {
  const matricula = String(document.getElementById('recovery-matricula-input')?.value || '').trim().toLowerCase();
  const cpf = String(document.getElementById('recovery-cpf-input')?.value || '').trim();
  const dataNascimento = String(document.getElementById('recovery-dn-input')?.value || '').trim();

  if (!matricula) {
    setRecoveryError('Informe a Matr\u00edcula sem V\u00ednculo do servidor.');
    document.getElementById('recovery-matricula-input')?.focus();
    return;
  }
  if (getOnlyDigits(cpf).length !== 11) {
    setRecoveryError('Informe o CPF completo do servidor.');
    document.getElementById('recovery-cpf-input')?.focus();
    return;
  }
  if (normalizeDateForLookup(dataNascimento).length !== 10) {
    setRecoveryError('Informe a Data de Nascimento completa do servidor.');
    document.getElementById('recovery-dn-input')?.focus();
    return;
  }

  const { data, error } = await supabaseClient.from('usuarios').select('*').order('nome');
  if (error) throw error;

  const hasLookupFields = (data || []).some((item) =>
    readFirstAvailable(item, ['matricula_sem_vinculo', 'matriculaSemVinculo', 'matricula', 'registro_funcional', 'registro']) ||
    readFirstAvailable(item, ['cpf', 'cpf_servidor']) ||
    readFirstAvailable(item, ['data_nascimento', 'dataNascimento', 'data_nasc', 'nascimento'])
  );

  if (!hasLookupFields) {
    setRecoveryError('O cadastro de servidores ainda n\u00e3o possui Matr\u00edcula sem V\u00ednculo, CPF e Data de Nascimento dispon\u00edveis para recupera\u00e7\u00e3o autom\u00e1tica.');
    return;
  }

  const cpfDigits = getOnlyDigits(cpf);
  const birthToken = normalizeDateForLookup(dataNascimento);
  const found = (data || []).find((item) => {
    const matriculaValue = String(readFirstAvailable(item, ['matricula_sem_vinculo', 'matriculaSemVinculo', 'matricula', 'registro_funcional', 'registro']) || '').trim().toLowerCase();
    const cpfValue = getOnlyDigits(readFirstAvailable(item, ['cpf', 'cpf_servidor']));
    const birthValue = normalizeDateForLookup(readFirstAvailable(item, ['data_nascimento', 'dataNascimento', 'data_nasc', 'nascimento']));
    return matriculaValue === matricula && cpfValue === cpfDigits && birthValue === birthToken;
  });

  if (!found) {
    setRecoveryError('N\u00e3o localizamos um servidor com os dados informados.');
    return;
  }

  const email = normalizeInstitutionalEmail(readFirstAvailable(found, ['email']));
  const senha = readFirstAvailable(found, ['senha']);
  if (!email || !senha) {
    setRecoveryError('O servidor foi localizado, mas o cadastro de acesso ainda est\u00e1 incompleto.');
    return;
  }

  openRecoveryResult({
    tipo: 'servidor',
    nome: readFirstAvailable(found, ['nome']) || 'Servidor',
    email,
    senha,
    portal: 'Portal do Servidor'
  });
}

async function consultarRecuperacaoAluno() {
  const cpf = String(document.getElementById('recovery-cpf-input')?.value || '').trim();
  const dataNascimento = String(document.getElementById('recovery-dn-input')?.value || '').trim();

  if (getOnlyDigits(cpf).length !== 11) {
    setRecoveryError('Informe o CPF completo do aluno.');
    document.getElementById('recovery-cpf-input')?.focus();
    return;
  }
  if (normalizeDateForLookup(dataNascimento).length !== 10) {
    setRecoveryError('Informe a Data de Nascimento completa do aluno.');
    document.getElementById('recovery-dn-input')?.focus();
    return;
  }

  const { data, error } = await supabaseClient.rpc('consultar_acesso_aluno', {
    p_cpf: cpf,
    p_data_nascimento: dataNascimento
  });

  if (error) throw error;

  if (!data || data.status === 'error') {
    setRecoveryError('N\u00e3o localizamos um aluno com os dados informados.');
    return;
  }

  openRecoveryResult({
    tipo: 'aluno',
    nome: data.nome || 'Aluno',
    email: normalizeInstitutionalEmail(data.email || ''),
    senha: data.senha || '',
    portal: 'Portal do Aluno'
  });
}

async function consultarRecuperacaoAcesso() {
  clearRecoveryFeedback();
  setRecoveryButtonState(true);
  try {
    if (RECOVERY_TYPE === 'aluno') await consultarRecuperacaoAluno();
    else await consultarRecuperacaoServidor();
  } catch (err) {
    console.error('[consultarRecuperacaoAcesso]', err);
    setRecoveryError('N\u00e3o foi poss\u00edvel concluir a busca agora. Tente novamente.');
  } finally {
    setRecoveryButtonState(false);
  }
}

async function doLogin() {
  const emailInput = document.getElementById('email-input');
  const passInput = document.getElementById('pass-input');
  const rawEmail = String(emailInput?.value || '').trim();
  const pass = String(passInput?.value || '');

  if (!rawEmail || !pass) {
    setLoginError('Informe seu e-mail institucional e sua senha.');
    return;
  }

  clearLoginError();
  setLoginButtonState(true);

  const preferredEmail = normalizeInstitutionalEmail(rawEmail);
  const emailCandidates = buildLoginEmailCandidates(rawEmail);
  if (emailInput) emailInput.value = preferredEmail;

  try {
    const servidorResult = await tryServidorLogin(preferredEmail, pass);
    if (servidorResult.ok) {
      await _entrarNoSistema(servidorResult.user);
      return;
    }

    if (servidorResult.inactive) {
      setLoginError('Acesso negado: usu\u00e1rio inativo.');
      return;
    }

    const alunoResult = await tryAlunoLogin(emailCandidates, pass);
    if (alunoResult.ok) {
      try { sessionStorage.setItem('portal_aluno', JSON.stringify(alunoResult.data)); } catch (_) {}
      window.location.href = 'portal_aluno.html';
      return;
    }

    const authErr = servidorResult.error;
    if (authErr?.message && authErr.message.toLowerCase().includes('email not confirmed')) {
      setLoginError('E-mail n\u00e3o confirmado. Contate o administrador do sistema.');
    } else if (authErr?.status === 500 || (authErr?.message && authErr.message.toLowerCase().includes('database'))) {
      setLoginError('Erro interno no servidor. Contate o administrador.');
    } else {
      setLoginError('E-mail ou senha incorretos. Verifique e tente novamente.');
    }
  } catch (err) {
    console.error('[login exception]', err);
    setLoginError('Erro de conex\u00e3o. Tente novamente.');
  } finally {
    setLoginButtonState(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!sessionStorage.getItem('portal_aluno')) {
    normalizeLoginInterface();
  }
});

// Camada final: clique da turma abre acoes, lista alunos e PDF com assinatura.
async function renderTurmasTable(){
  const b = document.getElementById('turmas-table-body'); if(!b) return;
  const { turno } = getDashFiltros();
  let turmas = turno ? TURMAS_DATA.filter(t => t.turno === turno) : TURMAS_DATA;
  if(!turmas.length){
    b.innerHTML = emptyTr('🏷️', 'Nenhuma turma encontrada', 'Cadastre turmas ou altere o filtro', 8);
    return;
  }

  const { dia } = getDashFiltros();
  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const hoje = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  const targetDate = dia || hoje;

  let freqData = {};
  try{
    const { data:fq } = await fetchAllRows('frequencia', 'aluno_id,tipo,status', q => q.eq('data', targetDate));
    if(fq) fq.forEach(f => {
      if(!freqData[f.aluno_id]) freqData[f.aluno_id] = {};
      freqData[f.aluno_id][f.tipo] = f.status;
    });
  }catch(e){
    console.warn('freq fetch:', e);
  }

  b.innerHTML = turmas.map(t => {
    const alunosTurma = ALUNOS_DATA.filter(a => a.turma === t.code);
    const total = alunosTurma.length;
    let entP = 0, saiP = 0, evasoes = 0;
    let entTotal = 0, saiTotal = 0;

    alunosTurma.forEach(a => {
      const fq = freqData[a.id] || {};
      if(fq.entrada) entTotal++;
      if(fq.saida) saiTotal++;
      if(fq.entrada === 'P') entP++;
      if(fq.saida === 'P') saiP++;
      if(fq.entrada === 'P' && fq.saida === 'F') evasoes++;
    });

    if(total > 0 && entTotal === 0 && saiTotal === 0 && targetDate === hoje){
      entP = t.entradaQtd || 0;
      saiP = t.saidaQtd || 0;
      entTotal = t.entradaConsolidada ? total : 0;
      saiTotal = t.saidaConsolidada ? total : 0;
    }

    const faltas = total - entP;
    const entPct = total > 0 ? Math.round(entP / total * 100) : 0;
    const saiPct = total > 0 ? Math.round(saiP / total * 100) : 0;
    const stEnt = entTotal > 0 ? `<span class="metric-badge badge-green">${entPct}% pres.</span>` : `<span class="metric-badge badge-yellow">Pendente</span>`;
    const stSai = saiTotal > 0 ? `<span class="metric-badge badge-green">${saiPct}% pres.</span>` : `<span class="metric-badge badge-yellow">Pendente</span>`;
    const evasBadge = evasoes > 0 ? `<span class="metric-badge badge-red">⚠ ${evasoes}</span>` : '';

    return `<tr>
      <td><strong style="cursor:pointer;color:var(--blue)" onclick="abrirAcoesTurma('${t.id}')" title="Clique para ver as opcoes">${t.code} ✏️</strong></td>
      <td>${t.turno}</td>
      <td>${total}</td>
      <td><span class="metric-badge badge-blue">${entPct}%</span></td>
      <td>${stEnt}</td>
      <td><span class="metric-badge badge-blue">${saiPct}%</span></td>
      <td>${stSai}</td>
      <td><span class="metric-badge ${faltas > 4 ? 'badge-red' : 'badge-green'}">${faltas}</span> ${evasBadge}</td>
    </tr>`;
  }).join('');
}

function renderTurmaGrid(){
  const g = document.getElementById('turma-grid'); if(!g) return;
  if(!TURMAS_DATA.length){
    g.innerHTML = emptyState('🏷️', 'Nenhuma turma cadastrada', 'Clique em "+ Nova Turma"');
    return;
  }

  g.innerHTML = TURMAS_DATA.map(t => {
    const total = ALUNOS_DATA.filter(a => a.turma === t.code).length;
    const pres = t.presentes || 0;
    const pct = total > 0 ? Math.round(pres / total * 100) : 0;
    const color = pct >= 90 ? 'var(--green)' : pct >= 75 ? 'var(--yellow)' : 'var(--red)';
    return `<div class="turma-card" onclick="abrirAcoesTurma('${t.id}')" title="Clique para ver as opcoes da turma" style="cursor:pointer;transition:box-shadow 0.2s" onmouseenter="this.style.boxShadow='0 4px 18px rgba(0,0,0,0.13)'" onmouseleave="this.style.boxShadow=''">
      <div class="turma-code">${t.code}</div>
      <div class="turma-info">${t.serie} — ${t.turno}</div>
      <div class="turma-progress"><div class="turma-progress-bar" style="width:${pct}%;background:${color}"></div></div>
      <div class="turma-stats">
        <span style="color:var(--gray5)">👥 ${total}</span>
        <span style="color:var(--green-dark)">✓ ${pres}</span>
        <span style="color:var(--red)">✕ ${total-pres}</span>
      </div>
      <div style="font-size:10px;color:var(--gray4);text-align:center;margin-top:4px">clique para ver as opcoes da turma</div>
    </div>`;
  }).join('');
}



// ─── MÓDULO DE RECONHECIMENTO FACIAL ──────────────────────────────────────────────────
let recRealtimeChannel = null;

async function carregarReconhecimentoFacial() {
  console.log('📊 [carregarReconhecimentoFacial] Carregando dados do painel facial...');
  
  try {
    // 1. Contar alunos com e sem fotos no Supabase Storage
    const { count: totalAlunos, error: errTotal } = await supabaseClient
      .from('alunos')
      .select('id', { count: 'exact', head: true });
      
    const { count: comFoto, error: errComFoto } = await supabaseClient
      .from('alunos')
      .select('id', { count: 'exact', head: true })
      .not('foto_url', 'is', null)
      .neq('foto_url', '');

    if (errTotal || errComFoto) throw new Error('Erro ao buscar estatísticas de alunos');

    const total = totalAlunos || 0;
    const comBiometria = comFoto || 0;
    const semBiometria = Math.max(0, total - comBiometria);

    document.getElementById('rec-total-alunos').textContent = total;
    document.getElementById('rec-com-biometria').textContent = comBiometria;
    document.getElementById('rec-sem-biometria').textContent = semBiometria;

    // 2. Buscar logs de leituras de hoje
    await atualizarTabelaLogsReconhecimento();

    // 3. Inscrever canal Supabase Realtime para atualizar a lista em tempo real
    if (!recRealtimeChannel) {
      console.log('📡 [carregarReconhecimentoFacial] Inscrevendo no Supabase Realtime para logs faciais...');
      recRealtimeChannel = supabaseClient
        .channel('frequencia-realtime-admin')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'frequencia' },
          async (payload) => {
            console.log('🔥 Nova frequência inserida em tempo real!', payload.new);
            // Pequeno delay para garantir que os dados já estejam salvos antes da atualização
            setTimeout(async () => {
              await atualizarTabelaLogsReconhecimento();
              // Atualiza as métricas do painel se necessário
              carregarReconhecimentoFacial();
            }, 1000);
          }
        )
        .subscribe();
    }

  } catch (err) {
    console.error('Erro no módulo de Reconhecimento Facial:', err);
    showToast('Erro ao carregar módulo de Reconhecimento Facial.', 'evasao');
  }
}

async function atualizarTabelaLogsReconhecimento() {
  const hoje = new Date().toISOString().split('T')[0];
  const tbody = document.getElementById('rec-logs-tbody');
  if (!tbody) return;

  try {
    const { data: logs, error } = await supabaseClient
      .from('frequencia')
      .select('id, data, tipo, status, created_at, aluno_id, alunos(nome, foto_url, turmas(nome))')
      .eq('data', hoje)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--gray5);padding:30px">Nenhuma leitura registrada hoje.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    logs.forEach(l => {
      const aluno = l.alunos || {};
      const turma = aluno.turmas ? aluno.turmas.nome : 'Sem Turma';
      const fotoUrl = aluno.foto_url || 'https://lh3.googleusercontent.com/d/1_gqGvKCSsN9aL4j9b3l4e8s90j3L0tW4'; // placeholder
      
      const horaStr = l.created_at 
        ? new Date(l.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : '—';

      const tipoBadge = l.tipo === 'entrada'
        ? `<span style="background:var(--blue-light);color:var(--blue-dark);font-size:10px;padding:3px 8px;border-radius:4px;font-weight:700">ENTRADA</span>`
        : `<span style="background:var(--yellow-light);color:var(--yellow-dark);font-size:10px;padding:3px 8px;border-radius:4px;font-weight:700">SAÍDA</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;color:var(--gray7)">${horaStr}</td>
        <td>
          <img src="${fotoUrl}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid var(--gray3)" alt="Aluno">
        </td>
        <td style="font-weight:600;color:var(--gray7)">${aluno.nome || '—'}</td>
        <td style="color:var(--gray6)">${turma}</td>
        <td style="color:var(--gray6);font-weight:600">Catraca ${l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
        <td>${tipoBadge}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao atualizar tabela de logs de reconhecimento:', err);
  }
}
