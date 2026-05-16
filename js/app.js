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
let OBAFOG_DATA = [];

const CHAT_DATA = { coord:[], sec:[], prof:[] };
const freq = { entrada:{}, saida:{} };
let envolvidos = [];
let chatSegment = 'coord', chatContact = 0;
let calYear = 2026, calMonth = 4;
let clickTimer = null;
let turmaChamadaAtual = '';
const chamadaConsolidada = { entrada:false, saida:false };

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
  {func:'Frequência',               id:'page-frequencia',   coord:true, sec:false, prof:true,  editar_coord:true,  editar_sec:false, editar_prof:true},
  {func:'Solicitações Pedagógicas', id:'page-solicitacoes', coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'RVS Agenda',               id:'page-rvs-agenda',   coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Horário de Aula',           id:'page-horarios',     coord:true, sec:true,  prof:true,  editar_coord:false, editar_sec:false, editar_prof:false},
  {func:'Topo do Saber',            id:'page-topo-saber',   coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Transporte',               id:'page-transporte',   coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'OBAFOG RVS',               id:'page-obafog',       coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Ocorrências',              id:'page-ocorrencias',  coord:true, sec:false, prof:true,  editar_coord:true,  editar_sec:false, editar_prof:true},
  {func:'Livros Didáticos',          id:'page-livros',       coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'Relatórios',               id:'page-relatorios',   coord:true, sec:true,  prof:false, editar_coord:true,  editar_sec:true,  editar_prof:false},
  {func:'Chat RVS',                 id:'page-chat',         coord:true, sec:true,  prof:true,  editar_coord:true,  editar_sec:true,  editar_prof:true},
  {func:'Permissões',               id:'page-permissoes',   coord:false,sec:false, prof:false, editar_coord:false, editar_sec:false, editar_prof:false},
  {func:'Usuários',                 id:'page-usuarios',     coord:false,sec:false, prof:false, editar_coord:false, editar_sec:false, editar_prof:false}
];

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
    const { data, error } = await query;
    if(error) { console.error(`Erro ao buscar ${tableName}:`, error); break; }
    if(data) allData = allData.concat(data);
    if(!data || data.length < step) break;
    from += step;
  }
  return { data: allData };
}

async function carregarDados(){
  try {
    // 1. Acionar rotina de limpeza de mensagens antigas
    supabaseClient.rpc('limpar_chat_antigo').then(({error}) => {
       if(error) console.warn('Erro ao limpar chat antigo:', error);
    });

    const [
      {data: turmas}, 
      {data: alunos}, 
      {data: ocorrencias}, 
      {data: eventos}, 
      {data: rotas}, 
      configResult, // Capture full result instead of destructuring data
      {data: obafogEq}
    ] = await Promise.all([
      fetchAllRows('turmas'),
      fetchAllRows('alunos'),
      fetchAllRows('ocorrencias'),
      fetchAllRows('eventos'),
      fetchAllRows('rotas'),
      supabaseClient.from('configuracoes').select('*').in('chave', ['permissoes', 'links_horarios']),
      fetchAllRows('obafog_equipes', '*', q => q.order('created_at', {ascending:false}))
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
        PERMS = permsObj.valor;
      } else {
        console.warn('[carregarDados] Permissões não encontradas no banco, usando padrão.');
      }
      
      const linksObj = configData.find(c => c.chave === 'links_horarios');
      if (linksObj && linksObj.valor) HORARIOS_LINKS = linksObj.valor;
    } else {
      console.warn('[carregarDados] configData é nulo ou inválido:', configData);
    }

    if (turmas) {
      TURMAS_DATA = turmas.map(t => ({
        id: t.id, code: t.code, serie: t.serie, turno: t.turno, professor: t.professor, presentes: 0
      }));
    }
    
    if (alunos) {
      const turmaMap = {};
      const turnoMap = {};
      if (turmas) {
        turmas.forEach(t => { turmaMap[t.id] = t.code; turnoMap[t.id] = t.turno; });
      }
      
      ALUNOS_DATA = alunos.map(a => ({
        id: a.id, cpf: a.matricula, nome: a.nome, turma: turmaMap[a.turma_id] || '', turma_id: a.turma_id,
        turno: turnoMap[a.turma_id] || '', rota: a.rota || 'Sem transporte', resp: a.responsavel || '',
        contato: a.contato || '', email: a.instagram || '', nasc: a.data_nascimento || '',
        idade: a.data_nascimento ? Math.floor((new Date() - new Date(a.data_nascimento))/(1000*60*60*24*365.25)) : 0,
        status: a.status || 'ativo', historico: [], foto_url: a.foto_url || ''
      }));
    }
    
    if (rotas) {
      ROTAS_DATA = rotas.map(r => ({ id: r.id, nome: r.nome, motorista: r.motorista, veiculo: r.veiculo, cap: r.capacidade }));
    }

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
         }

         const al = ALUNOS_DATA.find(a => a.id === o.aluno_id);
         const tu = TURMAS_DATA.find(t => t.id === o.turma_id);
         return {
            id: o.id,
            tipo: tipoView,
            icon: tipoView === 'evasao' ? '🚨' : tipoView === 'indisciplina' ? '⚠️' : tipoView === 'atraso' ? '⏰' : '❌',
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
    const {data: solicits} = await supabaseClient.from('solicitacoes').select('*').order('created_at', {ascending: false});
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
    const {data: livrosDB} = await supabaseClient.from('livros_alunos').select('*');
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
      console.error('[login]', authErr);
      errEl.style.display='block';
      errEl.textContent = 'Credenciais inválidas.';
      if(btn){ btn.disabled=false; btn.textContent='Entrar no Sistema'; }
      return;
    }

    // Busca os dados adicionais do usuário na tabela pública
    const { data: userData, error: userErr } = await supabaseClient
      .from('usuarios')
      .select('id, nome, perfil, email, turno, cargo, foto_url, formacao, bio, whatsapp, ativo')
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
  
  updateSidebarProfile();
  await initApp(); // Agora espera carregar permissões do banco
  initChatRealtime();
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
    roleEl.textContent = pLabel[user.perfil] || 'Membro';
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
        .select('id, nome, perfil, email, foto_url, formacao, bio, whatsapp, cargo, turno')
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
  await carregarDados();
  initAutoSave();
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
  renderChat('coord');
  renderPermissoes();
  renderCalendar();
  
  aplicarPermissoesUI(); 
  console.log('[initApp] UI de permissões aplicada.');
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────
function showPage(p, el) {
  const user = getCurrentUser();
  const rKey = user ? getRoleKey(user.perfil) : 'prof';

  // Verificação de segurança — bloqueia acesso direto mesmo que o menu esteja oculto
  if (rKey !== 'admin' && p !== 'perfil') {
    const perm = PERMS.find(item => item.id === 'page-' + p);
    if (perm && !perm[rKey]) {
      console.warn(`[showPage] Acesso NEGADO: perfil="${user?.perfil}" rKey="${rKey}" página="${p}"`);
      showToast('Você não tem permissão para acessar esta página.', 'alerta');
      return;
    }
  }

  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  document.getElementById('page-' + p)?.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', agenda: 'Agenda Pedagógica', turmas: 'Turmas', alunos: 'Alunos',
    frequencia: 'Frequência Escolar', solicitacoes: 'Solicitações Pedagógicas', transporte: 'Transporte Escolar', ocorrencias: 'Ocorrências',
    livros: 'Livros Didáticos', chat: 'Chat RVS', permissoes: 'Permissões', usuarios: 'Usuários do Sistema', perfil: 'Meu Perfil'
  };
  document.getElementById('page-title').textContent = titles[p] || p;
  
  // Se não passou o elemento, tenta achar o item no menu lateral para ativar
  if (!el) {
    const selector = `.nav-item[onclick*="showPage('${p}'"]`;
    el = document.querySelector(selector);
  }
  if (el) el.classList.add('active');
  
  // Close mobile menu if open
  document.querySelector('.sidebar').classList.remove('sidebar-open');
  const overlay = document.getElementById('sidebar-overlay');
  if(overlay) overlay.classList.remove('show');
  if(p==='solicitacoes') renderSolicitacoes();
  if(p==='topo-saber'){ carregarOlimpiadas().then(()=>renderTopoSaber()); }
  if(p==='usuarios'){ carregarUsuarios(); }
  if(p==='rvs-agenda'){ popularDatasAtividade(); popularTurmasAtividade(); renderAgendaMural(); }
  if(p==='horarios') carregarLinksHorario();
  if(p==='obafog') renderObafog();
  if(p==='permissoes') renderPermissoes();
  if(p==='perfil') renderPerfil();
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
    const hoje = new Date().toISOString().split('T')[0];
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
  const hoje = new Date().toISOString().split('T')[0];
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

function abrirEditarTurma(id){
  const t=TURMAS_DATA.find(x=>x.id===id); if(!t)return;
  document.getElementById('edit-turma-id').value=t.id;
  document.getElementById('edit-turma-code').value=t.code;
  document.getElementById('edit-turma-turno').value=t.turno||'Manhã';
  // Tenta setar a série corretamente
  const serieEl=document.getElementById('edit-turma-serie');
  if(serieEl){
    const opts=Array.from(serieEl.options).map(o=>o.value);
    serieEl.value=opts.find(o=>o===t.serie)||opts[0];
  }
  document.getElementById('edit-turma-professor').value=t.professor||'';
  openModal('modal-editar-turma');
}

async function salvarEdicaoTurma(){
  const id=document.getElementById('edit-turma-id')?.value;
  const code=(document.getElementById('edit-turma-code')?.value||'').trim().toUpperCase();
  const turno=document.getElementById('edit-turma-turno')?.value||'Manhã';
  const serie=document.getElementById('edit-turma-serie')?.value||'';
  const professor=(document.getElementById('edit-turma-professor')?.value||'').trim();
  if(!id||!code){showToast('Preencha o código da turma','alerta');return;}
  const {error}=await supabaseClient.from('turmas').update({code,turno,serie,professor}).eq('id',id);
  if(error){showToast('Erro ao salvar: '+error.message,'evasao');return;}
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
  if(!code){ showToast('Informe o código da turma!','alerta'); return; }
  if(TURMAS_DATA.find(t=>t.code===code)){ showToast('Turma '+code+' já existe!','alerta'); return; }
  
  const {error} = await supabaseClient.from('turmas').insert({
      code: code,
      serie: serie || code,
      turno: turno || 'Manhã',
      professor: 'A Definir'
  });
  
  if (error) {
     console.error(error); showToast('Erro no banco de dados', 'evasao'); return;
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

function abrirModalNovoAluno() {
  _alunoFotoPendente = null;
  const prev = document.getElementById('aluno-avatar-preview');
  if(prev) prev.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%234f46e5'/%3E%3Ctext x='50' y='64' text-anchor='middle' font-size='40' fill='white'%3E%3F%3C/text%3E%3C/svg%3E";
  const st = document.getElementById('aluno-foto-status');
  if(st) { st.style.color='var(--gray4)'; st.textContent='Mínimo 5MB. Arquivo será salvo no Drive.'; }
  openModal('modal-aluno');
}

// ─── CÂMERA E FOTO DO ALUNO ────────────────────────────────────────────────────────
async function abrirCameraAluno() {
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
    else document.getElementById('aluno-foto-input')?.click();
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
    selecionarFotoAluno({ files: [file] });
    fecharCameraAluno();
  }, 'image/jpeg', 0.9);
}

function selecionarFotoAluno(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Foto muito grande! Máximo 5MB.', 'alerta'); input.value = ''; return; }
  _alunoFotoPendente = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgEl = document.getElementById('aluno-avatar-preview');
    if (imgEl) imgEl.src = e.target.result;
  };
  reader.readAsDataURL(file);
  const status = document.getElementById('aluno-foto-status');
  if (status) { status.style.color = 'var(--blue-dark)'; status.textContent = '📎 Foto selecionada.'; }
}

async function saveAluno(){
  const nome   =document.getElementById('input-aluno-nome')?.value.trim();
  const cpf    =document.getElementById('input-aluno-cpf')?.value.trim();
  const turmaCode =document.getElementById('input-aluno-turma')?.value;
  const turno  =document.getElementById('input-aluno-turno')?.value;
  const resp   =document.getElementById('input-aluno-resp')?.value.trim();
  const contato=document.getElementById('input-aluno-contato')?.value.trim();
  const rota   =document.getElementById('input-aluno-rota')?.value;
  const email  =document.getElementById('input-aluno-email')?.value.trim();
  const nasc   =document.getElementById('input-aluno-nasc')?.value;
  const idade  =document.getElementById('input-aluno-idade')?.value;
  
  if(!nome||!cpf||!turmaCode){ showToast('Preencha nome, CPF e turma!','alerta'); return; }
  if(ALUNOS_DATA.find(a=>a.cpf===cpf || a.matricula===cpf)){ showToast('CPF/Matrícula já cadastrado!','alerta'); return; }
  
  const tObj = TURMAS_DATA.find(t => t.code === turmaCode);
  if (!tObj) { showToast('Turma não encontrada no sistema.', 'alerta'); return; }

  let fotoUrl = null;
  if (_alunoFotoPendente) {
    const status = document.getElementById('aluno-foto-status');
    if (status) { status.style.color = 'var(--blue-dark)'; status.textContent = '⏳ Enviando foto ao Google Drive...'; }
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(_alunoFotoPendente);
      });
      const response = await fetch(DRIVE_FOTO_URL, {
        method: 'POST',
        body: JSON.stringify({ filename: 'aluno_' + cpf + '_' + Date.now() + '.jpg', mimeType: _alunoFotoPendente.type, data: base64 })
      });
      const resultado = await response.json();
      if (!resultado.ok) throw new Error(resultado.erro || 'Erro no Drive');
      fotoUrl = resultado.url;
      if(fotoUrl.includes('drive.google.com')){
        const match = fotoUrl.match(/id=([^&]+)/) || fotoUrl.match(/d\/([a-zA-Z0-9_-]+)/);
        if(match && match[1]) fotoUrl = 'https://drive.google.com/uc?id=' + match[1] + '&export=view';
      }
      if (status) { status.style.color = 'var(--green-dark)'; status.textContent = '✅ Foto salva no Drive!'; }
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
  showToast(nome+' cadastrado!','sucesso');
  
  await carregarDados();
  atualizarSelectTurmas();
  renderAlunos(); renderMetricasDash(); renderTurmasTable(); renderTurmaGrid();
}

function verFicha(cpf){
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  document.getElementById('ficha-nome').textContent=a.nome;
  document.getElementById('ficha-cpf').textContent=a.cpf;
  document.getElementById('ficha-turma').textContent=a.turma+' — '+a.turno;
  document.getElementById('ficha-resp').textContent=a.resp||'—';
  document.getElementById('ficha-rota').textContent=a.rota||'Sem transporte';
  document.getElementById('ficha-faltas').textContent=(a.historico||[]).filter(h=>h.tipo==='falta').length+' faltas';
  document.getElementById('ficha-nasc').textContent=a.nasc?new Date(a.nasc).toLocaleDateString('pt-BR'):'—';
  document.getElementById('ficha-idade').textContent=a.idade||'—';
  
  const imgEl = document.getElementById('ficha-avatar');
  const fallbackEl = document.getElementById('ficha-avatar-fallback');
  if (a.foto_url) {
    if (imgEl) { imgEl.src = a.foto_url; imgEl.style.display = 'block'; }
    if (fallbackEl) fallbackEl.style.display = 'none';
  } else {
    if (imgEl) imgEl.style.display = 'none';
    if (fallbackEl) {
      fallbackEl.textContent = a.nome.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
      fallbackEl.style.display = 'flex';
    }
  }

  renderTimeline(a);
  renderFichaOcorrencias(a);
  document.getElementById('modal-ficha').dataset.cpf=cpf;
  openModal('modal-ficha');
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
    const label={evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso'}[o.tipo]||o.tipo;
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

function abrirMudancaTurma(){
  confirmarSenhaAdmin(()=>{ atualizarSelectTurmas(); openModal('modal-mudar-turma'); });
}
async function salvarMudancaTurma(){
  const cpf=document.getElementById('modal-ficha').dataset.cpf;
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
  }
  
  closeModal('modal-mudar-turma');
  showToast('Aluno movido para '+novaTurma,'sucesso');
  await carregarDados();
  verFicha(cpf); renderAlunos(); renderTurmasTable(); renderTurmaGrid();
}

function abrirOcorrDaFicha(){
  const cpf=document.getElementById('modal-ficha').dataset.cpf;
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  envolvidos=[{nome:a.nome}];
  document.getElementById('envolvidos-list-ocorr').innerHTML=`<div class="envolvido-tag"><span>👤 ${a.nome}</span></div>`;
  if(document.getElementById('input-ocorr-turma')) document.getElementById('input-ocorr-turma').value=a.turma;
  atualizarAlunosPorTurmaOcorr();
  closeModal('modal-ficha'); openModal('modal-ocorr');
}

function abrirEditarFicha(){
  const cpf=document.getElementById('modal-ficha').dataset.cpf;
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
  const cpf=document.getElementById('edit-aluno-cpf')?.value;
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
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
          const cpf     = col(r, /^cpf$/i, /matr/i, /registro/i, /cpf/i);
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
          if(ALUNOS_DATA.find(a=>a.cpf===cpf || a.matricula===cpf)){erros++; return;}

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
    const bgLista=consolidado?'var(--green-light)':'var(--red-light)';
    container.innerHTML=alunos.map((al,i)=>{
      const cur=freq[tipo][i]||'P';
      const evasao=freq.entrada[i]==='P'&&freq.saida[i]==='F';
      const bg=evasao?'#ffe4e4':bgLista;
      return`<div class="aluno-row" style="background:${bg};transition:background .35s">
        <span class="aluno-name">${i+1}. ${al.nome}</span>
        <div class="freq-btn-group">
          <button class="freq-btn P ${cur==='P'?'selected':''}" onclick="markFreq('${tipo}',${i},'P',this)">P</button>
          <button class="freq-btn F ${cur==='F'?'selected':''}" onclick="markFreq('${tipo}',${i},'F',this)">F</button>
          <button class="freq-btn FJ ${cur==='FJ'||cur==='FJ-Atestado'||cur==='FJ-Pais'||cur==='FJ-Coord'?'selected':''}" onclick="abrirModalFJ('${tipo}',${i},this)">FJ</button>
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
  updateConsolidado();
  // Atualiza o Dashboard em tempo real após consolidação
  renderTurmasTable();
  renderMetricasDash();
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
  const label={evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso'}[o.tipo]||o.tipo;
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
      ${!o.tratada?`<button class="btn btn-xs btn-outline" style="margin-top:6px" onclick="event.stopPropagation();abrirTratarOcorr('${o.id}')">Tratar</button>`
        :'<span style="color:var(--green-dark);font-size:11px;font-weight:600">✓ Tratada</span>'}
    </div>
  </div>`;
}

function renderOcorrencias(){
  const c=document.getElementById('ocorr-list-full'); if(!c)return;
  const turnoF=document.getElementById('filtro-ocorr-turno')?.value||'';
  const diaF=document.getElementById('filtro-ocorr-dia')?.value||'';
  const statusF=document.getElementById('filtro-ocorr-status')?.value||'';
  let data=[...OCORR_DATA].reverse();
  if(turnoF){const als=ALUNOS_DATA.filter(a=>a.turno===turnoF).map(a=>a.nome);data=data.filter(o=>als.includes(o.aluno));}
  if(diaF) data=data.filter(o=>o.data===diaF);
  if(statusF==='tratada') data=data.filter(o=>o.tratada);
  if(statusF==='nao-tratada') data=data.filter(o=>!o.tratada);
  c.innerHTML=data.length?data.map(o=>ocorrItemHTML(o)).join(''):emptyState('✅','Nenhuma ocorrência','Sem registros');
}

async function saveOcorrencia(){
  const tipo=document.getElementById('input-ocorr-tipo')?.value;
  const turma=document.getElementById('input-ocorr-turma')?.value;
  const desc=document.getElementById('input-ocorr-desc')?.value.trim();
  const comunicarPais=document.querySelector('input[name="comunicar-pais"]:checked')?.value==='sim';
  const icons={evasao:'🚨',indisciplina:'📵',bullying:'⚡',agressao:'👊',atraso:'⏰'};
  const alunoSel=document.getElementById('sel-aluno-principal')?.value;
  const nomes=[alunoSel,...envolvidos.map(e=>e.nome)].filter(Boolean).join(', ');
  const user = getCurrentUser();
  
  // Buscar aluno principal e turma no banco
  const alunoObj = ALUNOS_DATA.find(a => a.nome === alunoSel);
  const turmaObj = TURMAS_DATA.find(t => t.code === turma);
  
  let tipoDb = tipo;
  let prefixoAtraso = '';
  if (tipo === 'atraso') {
    tipoDb = 'indisciplina'; // Mapeia para uma categoria existente no banco
    prefixoAtraso = '[ATRASO] ';
  }

  const descFinal = prefixoAtraso + desc + 
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
  
  if (error) {
    console.error('[saveOcorrencia] Erro:', error);
    showToast('Erro ao salvar ocorrência: ' + error.message, 'evasao');
    return;
  }
  
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
  document.getElementById('livros-alunos-section').classList.add('hidden');
  livroAtualIdx=-1;
}

// ─── CHAT RVS (Sincronizado Supabase Realtime) ───────────────────────────────
let chatSubscription = null;
let presenceChannel = null;
let onlineUsers = {};
let currentChatMessages = [];

function initPresenceRealtime() {
  if (presenceChannel) return;
  const user = getCurrentUser() || {nome: 'Visitante', perfil: 'Geral'};
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  presenceChannel = supabaseClient.channel('online-users', {
    config: { presence: { key: sessionId } },
  });

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      onlineUsers = presenceChannel.presenceState();
      if(document.getElementById('page-chat')?.classList.contains('active')) {
          renderChatContacts();
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          nome: user.nome,
          perfil: user.perfil,
          online_at: new Date().toISOString()
        });
      }
    });
}

function renderChatContacts() {
  const el = document.getElementById('chat-contacts');
  if(!el) return;
  
  const titles = { coord: 'Coordenação', sec: 'Secretaria', prof: 'Professores', geral: 'Geral' };
  let html = `<div class="chat-contact active">
        <div class="chat-contact-avatar" style="background:var(--primary)">👥</div>
        <div class="chat-contact-info"><h4>Grupo ${titles[chatSegment] || chatSegment}</h4><p>Chat Coletivo</p></div>
      </div>`;
      
  const uniqueUsers = {};
  Object.values(onlineUsers).forEach(presences => {
     presences.forEach(p => {
       if (p.nome) uniqueUsers[p.nome] = p;
     });
  });
  
  const myName = getCurrentUser()?.nome || 'Visitante';
  const usersList = Object.values(uniqueUsers).filter(u => u.nome !== myName);
  
  if (usersList.length > 0) {
      html += `<div style="font-size:11px;font-weight:bold;color:var(--gray5);margin:15px 0 5px 10px;text-transform:uppercase;">Usuários Online</div>`;
      usersList.forEach(u => {
          const avatar = u.nome.substring(0,2).toUpperCase();
          html += `<div class="chat-contact" style="pointer-events:none;opacity:0.8">
            <div class="chat-contact-avatar" style="background:var(--gray4);position:relative;color:#fff;font-weight:bold;font-size:14px;display:flex;align-items:center;justify-content:center">
               ${avatar}
               <div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;background:var(--green);border-radius:50%;border:2px solid #fff"></div>
            </div>
            <div class="chat-contact-info"><h4>${u.nome}</h4><p style="color:var(--green);font-size:11px">Online agora</p></div>
          </div>`;
      });
  }
  
  el.innerHTML = html;
}

function initChatRealtime() {
  if (chatSubscription) return;
  chatSubscription = supabaseClient
    .channel('public:chat_mensagens')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_mensagens' }, payload => {
      const novaMsg = payload.new;
      
      if (novaMsg.segmento === chatSegment) {
        currentChatMessages.push(novaMsg);
        renderChatMsgsUI();
      }
      
      const myName = getCurrentUser()?.nome || 'Dhenison Carlos';
      if (novaMsg.remetente !== myName) {
        const titles = { coord: 'Coordenação', sec: 'Secretaria', prof: 'Professores', geral: 'Geral' };
        const segName = titles[novaMsg.segmento] || novaMsg.segmento;
        const isCurrentlyLooking = document.getElementById('page-chat')?.classList.contains('active') && chatSegment === novaMsg.segmento;
        
        if (!isCurrentlyLooking) {
            let resumoMsg = novaMsg.mensagem.substring(0,50);
            if(novaMsg.mensagem.length>50) resumoMsg += '...';
            if(novaMsg.tipo === 'image') resumoMsg = '📸 Imagem recebida';
            if(novaMsg.tipo === 'alert') resumoMsg = '🚨 ALERTA CRÍTICO';

            // Adiciona ao painel de notificações
            addNotification({
              type: 'chat',
              title: `${novaMsg.remetente} — ${segName}`,
              body: resumoMsg,
              action: () => {
                showPage('chat', document.querySelector(".nav-item[onclick*=\'chat\']"));
                const targetTab = document.querySelector(`#page-chat .tab[onclick*="'${novaMsg.segmento}'"]`) || document.querySelector('#page-chat .tab');
                if (targetTab) setChatSegment(novaMsg.segmento, targetTab);
              }
            });
            
            showToast(`${novaMsg.remetente} (${segName}):<br/>${resumoMsg}`, 'chat', () => {
              showPage('chat', document.querySelector(".nav-item[onclick*=\"showPage('chat')\"]"));
              const targetTab = document.querySelector(`#page-chat .tab[onclick*="'${novaMsg.segmento}'"]`) || document.querySelector('#page-chat .tab');
              if (targetTab) {
                setChatSegment(novaMsg.segmento, targetTab);
              }
            });
        }
      }
    })
    .subscribe();
}

async function carregarMensagensSegmento() {
  const m = document.getElementById('chat-messages');
  if(m) m.innerHTML = '<div style="padding:20px;text-align:center;color:var(--gray4);font-size:13px">Carregando mensagens...</div>';
  const { data, error } = await supabaseClient
    .from('chat_mensagens')
    .select('*')
    .eq('segmento', chatSegment)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Erro ao carregar chat:', error);
    if(m) m.innerHTML = '<div style="padding:20px;text-align:center;color:var(--red);font-size:13px">Erro ao carregar mensagens</div>';
    return;
  }
  currentChatMessages = data || [];
  renderChatMsgsUI();
}

function renderChat(seg){
  chatSegment=seg; 
  const titles = { coord: 'Coordenação', sec: 'Secretaria', prof: 'Professores', geral: 'Geral' };
  document.getElementById('chat-current-name').textContent = 'Grupo ' + titles[seg];
  
  renderChatContacts();
  carregarMensagensSegmento();
}

function setChatSegment(seg,tab){
  document.querySelectorAll('#page-chat .tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active'); renderChat(seg);
}

function renderChatMsgsUI(){
  const m=document.getElementById('chat-messages'); if(!m)return;
  const myName = getCurrentUser()?.nome || 'Dhenison Carlos';
  
  if(!currentChatMessages.length){
    m.innerHTML=emptyState('💬','Nenhuma mensagem nas últimas 48h','Comece a conversar!');
    return;
  }
  
  m.innerHTML = currentChatMessages.map(msg => {
    const isMe = msg.remetente === myName;
    const tClass = isMe ? 'sent' : 'received';
    const timeStr = new Date(msg.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    let content = msg.mensagem;
    
    // Formatação especial se for alerta
    if(msg.tipo === 'alert') {
      content = `<strong style="color:var(--orange)">🚨 ALERTA:</strong><br/>${msg.mensagem}`;
    }
    
    return `<div class="msg ${tClass}">
      ${!isMe ? `<div style="font-size:10px;font-weight:bold;margin-bottom:4px;color:var(--primary)">${msg.remetente}</div>` : ''}
      ${content}
      <div class="msg-time">${timeStr}</div>
    </div>`;
  }).join('');
  m.scrollTop=m.scrollHeight;
}

async function sendChatMsg(){
  const inp=document.getElementById('chat-input-field');
  const val=inp?.value.trim(); if(!val)return;
  const user = getCurrentUser() || {nome: 'Admin', perfil: 'admin'};
  
  inp.value='';
  const novaMsg = {
    segmento: chatSegment,
    remetente: user.nome,
    perfil_remetente: user.perfil,
    mensagem: val,
    tipo: 'text'
  };
  
  // Exibição otimista
  currentChatMessages.push({...novaMsg, created_at: new Date().toISOString()});
  renderChatMsgsUI();
  
  const { error } = await supabaseClient.from('chat_mensagens').insert([novaMsg]);
  if(error) {
    console.error('Erro ao enviar mensagem:', error);
    showToast('Erro ao enviar! O banco de dados foi configurado?', 'alerta');
  }
}

// ─── ALERTAS DO CHAT ──────────────────────────────────────────────────────────
function toggleAlertaFiltros(){
  const tipo = document.getElementById('alerta-tipo')?.value;
  const filtros = document.getElementById('alerta-fora-sala-filtros');
  if(filtros) filtros.style.display = tipo === 'fora-sala' ? 'block' : 'none';
}

async function popularAlunosAlerta(){
  const turmaCode = document.getElementById('alerta-turma')?.value;
  const sel = document.getElementById('alerta-aluno');
  if(!sel)return;
  
  if (!turmaCode) {
    sel.innerHTML = '<option value="">Selecione o aluno principal</option>';
    return;
  }
  
  sel.innerHTML = '<option value="">Carregando alunos do banco...</option>';
  
  // Buscar a turma selecionada no banco para pegar o ID exato
  const { data: turmaData, error: errTurma } = await supabaseClient
    .from('turmas')
    .select('id')
    .eq('code', turmaCode.trim())
    .maybeSingle();
    
  if(errTurma || !turmaData) {
    showToast('Erro ao consultar turma no banco de dados.', 'alerta');
    sel.innerHTML = '<option value="">Selecione o aluno principal</option>';
    return;
  }
  
  // Buscar todos os alunos que tem o ID da turma
  const { data: alunosData, error: errAlunos } = await supabaseClient
    .from('alunos')
    .select('nome')
    .eq('turma_id', turmaData.id)
    .order('nome', {ascending: true});
  
  if (errAlunos) {
    console.error('Erro alunos:', errAlunos);
    showToast('Erro ao puxar alunos do banco.', 'alerta');
    return;
  }
  
  if (!alunosData || alunosData.length === 0) {
    showToast('O banco de dados não tem alunos vinculados a esta turma.', 'alerta');
    sel.innerHTML = '<option value="">Nenhum aluno (Verifique a aba Alunos)</option>';
    return;
  }
  
  sel.innerHTML = '<option value="">Selecione o aluno principal</option>' + 
    alunosData.map(a => `<option value="${a.nome}">${a.nome}</option>`).join('');
}

async function enviarAlertaChat(){
  const tipo = document.getElementById('alerta-tipo')?.value;
  const destino = document.getElementById('alerta-destino')?.value;
  const msgExtra = document.getElementById('alerta-msg-extra')?.value.trim();
  const turma = document.getElementById('alerta-turma')?.value;
  const aluno = document.getElementById('alerta-aluno')?.value;
  
  if(tipo === 'fora-sala' && (!turma || !aluno)) {
    showToast('Selecione a turma e o aluno!', 'alerta');
    return;
  }
  
  let msgFinal = '';
  if(tipo === 'fora-sala') msgFinal = `Aluno(a) ${aluno} (Turma ${turma}) está fora de sala sem permissão. `;
  if(tipo === 'emergencia') msgFinal = `EMERGÊNCIA solicitada! `;
  if(tipo === 'aviso') msgFinal = `AVISO GERAL: `;
  if(msgExtra) msgFinal += msgExtra;
  
  const user = getCurrentUser() || {nome: 'Admin', perfil: 'admin'};
  
  // 1. Enviar mensagem pro Chat
  const novaMsg = {
    segmento: destino,
    remetente: user.nome,
    perfil_remetente: user.perfil,
    mensagem: msgFinal,
    tipo: 'alert'
  };
  const { error } = await supabaseClient.from('chat_mensagens').insert([novaMsg]);
  if(error) {
    console.error('Erro ao enviar alerta para o chat:', error);
    showToast('Erro no banco de dados do Chat!', 'alerta');
    return;
  }
  
  // 2. Se for fora de sala, registrar nas ocorrências para ficarem salvas
  if(tipo === 'fora-sala' && aluno) {
    const oData = new Date().toLocaleDateString('pt-BR');
    const al = ALUNOS_DATA.find(a => a.nome === aluno);
    if(al) {
      al.historico = al.historico || [];
      al.historico.push({
        tipo: 'ocorrencia',
        titulo: 'Alerta Rápido: Fora de Sala',
        desc: msgExtra || 'Aluno avistado fora de sala sem permissão.',
        data: oData
      });
      OCORR_DATA.push({
        id: Date.now(), tipo: 'evasao', icon: '🚨', aluno: aluno, turma: turma,
        desc: msgFinal,
        hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
        data: oData,
        tratada: false, aguardandoPais: false, origem: 'manual'
      });
      // Persiste ocorrência no Supabase
      if(al.id) {
        supabaseClient.from('ocorrencias').insert({
          tipo: 'evasao', aluno_id: al.id, turma_id: al.turma_id,
          descricao: msgFinal, data_ocorr: new Date().toISOString().split('T')[0],
          responsavel: user.nome, origem: 'manual'
        }).then(({error}) => { if(error) console.error('Erro ocorr alerta:', error); });
      }
    }
  }
  
  closeModal('modal-alerta-chat');
  showToast('Alerta enviado e registrado!', 'sucesso');
  if(document.getElementById('page-chat')?.classList.contains('active')) {
    setChatSegment(destino, document.querySelector(`.tab[onclick*="${destino}"]`));
  }
}

// ─── PERFIL DO USUÁRIO ────────────────────────────────────────────────────────
const DRIVE_FOTO_URL = 'https://script.google.com/macros/s/AKfycbxVz3gcJOntx68lHersXxdSqtIuBgmf36fawG3NAKToZxHAMOSFjtIewhV-3oGWC_k/exec';
let _perfilFotoPendente = null;
let _alunoFotoPendente = null;
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
      const nomeSafe = nome.replace(/[^a-zA-Z0-9À-ú\s]/g, '').trim();
      const ext = (_perfilFotoPendente.name || 'jpg').split('.').pop();

      const response = await fetch(DRIVE_FOTO_URL, {
        method: 'POST',
        body: JSON.stringify({
          nome: `foto_perfil_${Date.now()}.${ext}`,
          tipo: _perfilFotoPendente.type || 'image/jpeg',
          arquivo: base64,
          subpasta: nomeSafe
        })
      });

      const resultado = await response.json();
      if (!resultado.ok) throw new Error(resultado.erro || 'Erro no Drive');

      fotoUrl = resultado.url;
      
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

  const { data: savedUser, error: dbError } = await supabaseClient
    .from('usuarios')
    .update(updateData)
    .eq('id', user.id)
    .select('id, nome, perfil, email, foto_url, formacao, bio, whatsapp, cargo, turno')
    .maybeSingle();

  if (btn) { btn.disabled = false; btn.textContent = '💾 Salvar Alterações'; }

  if (dbError) {
    console.error('[salvarPerfil] Erro no banco:', dbError);
    showToast('Erro ao salvar perfil: ' + dbError.message, 'evasao');
    return;
  }

  // Atualiza sessão com dados devolvidos pelo banco (inclui id gerado)
  const userAtual = getCurrentUser();
  if (userAtual) {
    const merged = { ...userAtual, ...(savedUser || {}), nome, formacao, bio, whatsapp };
    if (fotoUrl) merged.foto_url = fotoUrl;
    try { sessionStorage.setItem('rvs_user', JSON.stringify(merged)); } catch(_){}
  }

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

  // onConflict:'chave' garante que faz UPDATE na linha existente
  const { error } = await supabaseClient
    .from('configuracoes')
    .upsert({ chave: 'permissoes', valor: PERMS }, { onConflict: 'chave' });

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
  const rKey = getRoleKey(user.perfil);
  if (rKey === 'admin') return true;

  const perm = PERMS.find(p => p.id === 'page-' + pageId);
  if (!perm) return false;
  const val = perm[rKey];
  console.log(`[podeVer] pageId=${pageId} rKey=${rKey} valor=${val}`);
  return !!val;
}

/**
 * Verifica se o usuário atual pode EDITAR em uma página.
 */
function podeEditar(pageId) {
  const user = getCurrentUser();
  if (!user) return false;
  const rKey = getRoleKey(user.perfil);
  if (rKey === 'admin') return true;

  const perm = PERMS.find(p => p.id === 'page-' + pageId);
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

    // 'perfil' sempre visível
    if (pID === 'perfil') {
      nav.style.display = '';
      return;
    }

    let isAllowed = false;
    if (rKey === 'admin') {
      isAllowed = true;
    } else {
      const perm = PERMS.find(p => p.id === 'page-' + pID);
      isAllowed = perm ? !!perm[rKey] : false;
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
  if (!activePageIsAllowed && firstAllowedNav) {
    console.log(`[aplicarPermissoesUI] Página ativa não permitida. Redirecionando para: ${firstAllowedNav.getAttribute('onclick')}`);
    firstAllowedNav.click();
  }
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
      const { data: fqRows, error } = await fetchAllRows('frequencia', 'aluno_id, data, tipo, status, consolidado', q => {
        let qFilter = q.eq('turma_id', turmaObj.id).eq('consolidado', true);
        if(diasIniDb && diasFimDb) {
          qFilter = qFilter.gte('data', diasIniDb).lte('data', diasFimDb);
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
  const periodo=document.getElementById('rel-ocorr-periodo')?.value||'mensal';
  const dias=getDiasLetivos(periodo,'ocorr');
  let ocorrs=[...OCORR_DATA];
  if(turno){ const als=ALUNOS_DATA.filter(a=>a.turno===turno).map(a=>a.nome); ocorrs=ocorrs.filter(o=>als.includes(o.aluno)); }
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
  const labels={evasao:'Evasão',indisciplina:'Indisciplina',bullying:'Bullying',agressao:'Agressão',atraso:'Atraso'};
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
  const { error } = await supabaseClient.from('configuracoes').upsert({
    chave: 'links_horarios',
    valor: HORARIOS_LINKS
  });
  
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
    obs, link_drive: linkDrive, status: 'pendente',
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
    status: 'pendente',
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

  const flyerData = (document.getElementById('ol-flyer-data')?.value||'').trim();

  if(!nome || !area || !diaProva){ showToast('Preencha Nome, Área e Dia da Prova!','alerta'); return; }

  const payload = { nome, area, insc_inicio: inscIni, insc_fim: inscFim, dia_prova: diaProva,
                    qtd_alunos: qtdAlunos, link_edital: linkEdital, inscrita,
                    flyer_url: flyerData || null };

  const editId = document.getElementById('ol-edit-id')?.value||'';
  let error;
  if(editId){
    ({error} = await supabaseClient.from('olimpiadas').update(payload).eq('id', editId));
  } else {
    ({error} = await supabaseClient.from('olimpiadas').insert(payload));
  }

  if(error){ showToast('Erro: '+error.message,'evasao'); return; }

  await carregarOlimpiadas();
  closeModal('modal-olimpiada');
  showToast('Olimpíada salva com sucesso!','sucesso');
  renderTopoSaber();
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

async function carregarUsuarios(){
  const {data, error} = await supabaseClient.from('usuarios').select('*').order('nome');
  if(error){ console.error('Erro ao carregar usuários:', error); return; }
  USUARIOS_DATA = data || [];
  renderUsuarios();
}

async function salvarUsuario(){
  const id     = document.getElementById('usr-edit-id')?.value || '';
  const nome   = (document.getElementById('usr-nome')?.value||'').trim();
  const email  = (document.getElementById('usr-email')?.value||'').trim();
  const perfil = document.getElementById('usr-perfil')?.value || 'professor';
  const turno  = document.getElementById('usr-turno')?.value || '';
  const turma  = document.getElementById('usr-turma')?.value || '';
  const cargo  = (document.getElementById('usr-cargo')?.value||'').trim();
  const avatar = document.getElementById('usr-avatar-data')?.value || '';
  const ativo  = document.getElementById('usr-ativo') ? document.getElementById('usr-ativo').checked : true;
  const senha        = (document.getElementById('usr-senha')?.value||'');
  const senhaConfirm = (document.getElementById('usr-senha-confirm')?.value||'');

  if(!nome || !email){ showToast('Preencha Nome e E-mail!','alerta'); return; }

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
      p_cargo:  cargo
    });

    if(!rpcErr && rpcResp?.status === 'success'){
      // Se usuário for criado como inativo, precisamos dar update logo após a criação
      if(!ativo && rpcResp.uid) {
        await supabaseClient.from('usuarios').update({ ativo: false }).eq('id', rpcResp.uid);
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
      cargo: cargo,
      foto_url: avatar,
      ativo: ativo
    };
    if(senha) payload.senha = senha;

    const { error } = await supabaseClient.from('usuarios').update(payload).eq('id', id);
    if (!error) {
      closeModal('modal-usuario');
      showToast('Usuário atualizado!','sucesso');
      await carregarUsuarios();
    } else {
      console.error('[Update Usuario]', error);
      showToast('Erro ao atualizar: ' + error.message, 'evasao');
    }
  }
}

async function excluirUsuario(id, nome){
  if(!confirm('Excluir o usuário "'+nome+'"?')) return;
  const {error} = await supabaseClient.from('usuarios').delete().eq('id', id);
  if(error){ showToast('Erro: '+error.message,'evasao'); return; }
  USUARIOS_DATA = USUARIOS_DATA.filter(u => u.id !== id);
  renderUsuarios();
  showToast('Usuário excluído.','alerta');
}

function abrirModalUsuario(id){
  document.getElementById('usr-edit-id').value = '';
  document.getElementById('usr-nome').value = '';
  document.getElementById('usr-email').value = '';
  document.getElementById('usr-perfil').value = 'professor';
  document.getElementById('usr-turno').value = '';
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
    if(cargoEl) cargoEl.value = u.cargo||'';
    if(ativoEl) ativoEl.checked = u.ativo !== false;
    popularTurmasUsuario();
    document.getElementById('usr-turma').value   = u.turma_responsavel||'';
    document.getElementById('modal-usuario-title').textContent = '✏️ Editar Usuário';
    if(senhaInfoEl) senhaInfoEl.style.display = 'block'; // Show 'leave blank' hint when editing
    if(u.avatar_url){
      document.getElementById('usr-avatar-data').value = u.avatar_url;
      if(prev) prev.src = u.avatar_url;
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
      const avatarHtml = u.avatar_url
        ? '<img src="'+u.avatar_url+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid '+cor+'">'
        : '<div style="width:56px;height:56px;border-radius:50%;background:'+cor+';display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;border:3px solid '+cor+'">'+initials+'</div>';
      return '<div class="table-card" style="padding:16px;border-top:3px solid '+cor+'">'+
        '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">'+
          avatarHtml+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+u.nome+ativoBadge+'</div>'+
            '<div style="font-size:11.5px;color:#6b7280;margin-top:2px">'+u.email+'</div>'+
            '<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+cor+'22;color:'+cor+';margin-top:4px;display:inline-block">'+
              (perfilIcon[u.perfil]||'👤')+' '+(perfilLabel[u.perfil]||u.perfil)+
            '</span>'+
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
      const {error} = await supabaseClient.from('usuarios').upsert({
        nome, email, perfil: perfil||'professor', turno: turno||'', turma_responsavel: turma||''
      }, {onConflict:'email'});
      if(error) erros++;
      else count++;
    }
    showToast(count+' usuários importados'+(erros?' ('+erros+' erros)':''),'sucesso');
    await carregarUsuarios();
  };
  reader.readAsText(file);
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
