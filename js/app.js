/* ============================================================
   RVS ESCOLAR — app.js — versão definitiva
   ============================================================ */

// ─── SUPABASE CLIENT ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── ESTADO GLOBAL ────────────────────────────────────────────────────────────
const ADMIN_SENHA = 'M@gnatha2026';
let PERFIL_ATUAL  = 'admin';

let TURMAS_DATA  = [];
let ALUNOS_DATA  = [];
let OCORR_DATA   = [];
let ROTAS_DATA   = [];
let CALENDARIO   = {};

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

const PERMS = [
  {func:'Dashboard',coord:true,sec:true,prof:false},
  {func:'Frequência — Editar',coord:true,sec:false,prof:true},
  {func:'Alunos — Cadastrar',coord:true,sec:true,prof:false},
  {func:'Ocorrências — Registrar',coord:true,sec:false,prof:true},
  {func:'Livros — Editar',coord:true,sec:true,prof:false},
  {func:'Chat — Acessar',coord:true,sec:true,prof:true},
  {func:'Permissões — Editar',coord:true,sec:false,prof:false},
];

const TIPO_LETIVO_FLAG = {letivo:true,prova:true,evento:true,bimestre:true,feriado:false};
const TIPO_LABEL = {letivo:'Dia Letivo',feriado:'Feriado',prova:'Prova',evento:'Evento',bimestre:'Início de Bimestre'};
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
      OCORR_DATA, ROTAS_DATA,
      CALENDARIO, LIVROS_DATA:LIVROS, CHAT_DATA, freq,
      savedAt: new Date().toISOString()
    }));
  }catch(e){ console.warn('Erro ao salvar:',e); }
}

async function carregarDados(){
  try {
    const [{data: turmas}, {data: alunos}, {data: ocorrencias}, {data: eventos}, {data: rotas}] = await Promise.all([
      supabaseClient.from('turmas').select('*'),
      supabaseClient.from('alunos').select('*'),
      supabaseClient.from('ocorrencias').select('*'),
      supabaseClient.from('eventos').select('*'),
      supabaseClient.from('rotas').select('*')
    ]);

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
        status: a.status || 'ativo', historico: []
      }));
    }
    
    if (rotas) {
      ROTAS_DATA = rotas.map(r => ({ id: r.id, nome: r.nome, motorista: r.motorista, veiculo: r.veiculo, cap: r.capacidade }));
    }

    if (ocorrencias) {
      OCORR_DATA = ocorrencias.map(o => {
         const al = ALUNOS_DATA.find(a => a.id === o.aluno_id);
         const tu = TURMAS_DATA.find(t => t.id === o.turma_id);
         return {
            id: o.id,
            tipo: o.tipo,
            icon: o.tipo === 'evasao' ? '🚨' : o.tipo === 'indisciplina' ? '⚠️' : '❌',
            aluno: al ? al.nome : o.participante || '—',
            cpf: al ? al.cpf : '',
            turma: tu ? tu.code : '',
            desc: o.descricao,
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
         // Data is expected as YYYY-MM-DD
         let dKey = '';
         if (ev.data) {
             const [y, m, d] = ev.data.split('-');
             if (y && m && d) dKey = `${y}-${parseInt(m)}-${parseInt(d)}`;
         }
         if (dKey) {
             CALENDARIO[dKey] = {
                 id: ev.id,
                 tipo: ev.tipo,
                 label: ev.titulo,
                 responsavel: ev.responsavel,
                 desc: ev.observacoes || ''
             };
         }
      });
    }

    // Load remaining from LocalStorage temporarily
    const raw = localStorage.getItem(DB_KEY);
    if(raw) {
      const d = JSON.parse(raw);
      if(d.LIVROS_DATA && Array.isArray(d.LIVROS_DATA))
        d.LIVROS_DATA.forEach((l,i)=>{ if(LIVROS[i]) Object.assign(LIVROS[i],l); });
      if(d.CHAT_DATA)
        ['coord','sec','prof'].forEach(k=>{ if(d.CHAT_DATA[k]) CHAT_DATA[k]=d.CHAT_DATA[k]; });
      
      if(d.freq) {
         if(d.freq.entrada) Object.assign(freq.entrada, d.freq.entrada);
         if(d.freq.saida) Object.assign(freq.saida, d.freq.saida);
      }
    }
  } catch(e) {
    console.warn('Erro ao carregar do Supabase:', e);
  }
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function doLogin(){
  const email = document.getElementById('email-input').value;
  const pass  = document.getElementById('pass-input').value;
  if(email !== 'dhenison@escola.seduc.pa.gov.br' || pass !== 'M@gnatha2026'){
    document.getElementById('login-error').style.display='block'; return;
  }
  const ls = document.getElementById('login-screen');
  ls.classList.add('hidden');
  setTimeout(()=>ls.style.display='none',500);
  document.getElementById('app').classList.add('visible');
  initApp();
}
function doLogout(){
  salvarDados();
  const ls = document.getElementById('login-screen');
  ls.style.display='flex';
  setTimeout(()=>ls.classList.remove('hidden'),10);
  document.getElementById('app').classList.remove('visible');
}
document.addEventListener('DOMContentLoaded',()=>{
  ['pass-input','email-input'].forEach(id=>{
    document.getElementById(id)?.addEventListener('keydown',e=>{ if(e.key==='Enter') doLogin(); });
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
}

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────
function showPage(p,el){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+p)?.classList.add('active');
  const titles={dashboard:'Dashboard',agenda:'Agenda Pedagógica',turmas:'Turmas',alunos:'Alunos',
    frequencia:'Frequência Escolar',solicitacoes:'Solicitações Pedagógicas',transporte:'Transporte Escolar',ocorrencias:'Ocorrências',
    livros:'Livros Didáticos',chat:'Chat RVS',permissoes:'Permissões',perfil:'Meu Perfil'};
  document.getElementById('page-title').textContent=titles[p]||p;
  if(el) el.classList.add('active');
  if(p==='solicitacoes') renderSolicitacoes();
  if(p==='rvs-agenda'){ popularDatasAtividade(); popularTurmasAtividade(); renderAgendaMural(); }
  if(p==='horarios') carregarLinksHorario();
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

// ─── TOASTS / ALERTAS ────────────────────────────────────────────────────────
function showToast(msg,type='alerta'){
  const c=document.getElementById('toast-container');
  const t=document.createElement('div');
  t.className='toast '+type;
  const icons={evasao:'🚨',alerta:'ℹ️',sucesso:'✅'};
  const labels={evasao:'Alerta de Evasão',alerta:'Notificação',sucesso:'Sucesso'};
  t.innerHTML=`<span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <div class="toast-body"><h4>${labels[type]||'Aviso'}</h4><p>${msg}</p></div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(()=>{ if(t.parentElement) t.remove(); },5000);
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
  if(s!=='RVSgestor2026@'){ if(s!==null) showToast('Senha incorreta','evasao'); return; }
  const sel=document.getElementById('select-excluir-aluno');
  if(sel){
    sel.innerHTML='<option value="">— Selecione o aluno —</option>'+
      ALUNOS_DATA.map(a=>`<option value="${a.cpf}">${a.nome} — ${a.turma}</option>`).join('');
  }
  openModal('modal-excluir-aluno');
}

function excluirAluno(){
  const cpf=document.getElementById('select-excluir-aluno')?.value;
  if(!cpf){ showToast('Selecione um aluno','alerta'); return; }
  const al=ALUNOS_DATA.find(a=>a.cpf===cpf);
  if(!al)return;
  ALUNOS_DATA=ALUNOS_DATA.filter(a=>a.cpf!==cpf);
  closeModal('modal-excluir-aluno');
  showToast(al.nome+' excluído do sistema.','sucesso');
  renderAlunos(); renderMetricasDash(); renderTurmasTable(); renderTurmaGrid();
  salvarDados();
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

function renderMetricasDash(){
  const el=id=>document.getElementById(id);
  const {turno, dia} = getDashFiltros();
  const alunos = turno ? ALUNOS_DATA.filter(a=>a.turno===turno) : ALUNOS_DATA;
  const turmas = turno ? TURMAS_DATA.filter(t=>t.turno===turno) : TURMAS_DATA;
  const ocorrs = OCORR_DATA.filter(o=>{
    if(turno){const al=ALUNOS_DATA.find(a=>a.nome===o.aluno||a.cpf===o.cpf); if(!al||al.turno!==turno) return false;}
    if(dia && o.data !== new Date(dia+'T12:00:00').toLocaleDateString('pt-BR')) return false;
    return true;
  });
  if(el('dash-total'))    el('dash-total').textContent    = alunos.length;
  if(el('dash-presentes'))el('dash-presentes').textContent= alunos.filter(a=>a.status==='ativo').length;
  if(el('dash-faltas'))   el('dash-faltas').textContent   = ocorrs.filter(o=>o.tipo==='evasao'&&!o.tratada).length;
  if(el('dash-turmas'))   el('dash-turmas').textContent   = turmas.length;
}
function renderTurmasTable(){
  const b=document.getElementById('turmas-table-body'); if(!b)return;
  const {turno} = getDashFiltros();
  let turmas = turno ? TURMAS_DATA.filter(t=>t.turno===turno) : TURMAS_DATA;
  if(!turmas.length){b.innerHTML=emptyTr('🏷️','Nenhuma turma encontrada','Cadastre turmas ou altere o filtro',8);return;}
  b.innerHTML=turmas.map(t=>{
    const total=ALUNOS_DATA.filter(a=>a.turma===t.code).length;
    const entQtd=t.entradaQtd||0;
    const saiQtd=t.saidaQtd||0;
    const faltas=total-(t.presentes||0);
    const entPct=total>0?Math.round(entQtd/total*100):0;
    const saiPct=total>0?Math.round(saiQtd/total*100):0;
    const stEnt=t.entradaConsolidada?'<span class="metric-badge badge-green">✓ Feita</span>':'<span class="metric-badge badge-yellow">Pendente</span>';
    const stSai=t.saidaConsolidada?'<span class="metric-badge badge-green">✓ Feita</span>':'<span class="metric-badge badge-yellow">Pendente</span>';
    return`<tr>
      <td><strong>${t.code}</strong></td>
      <td>${t.turno}</td>
      <td>${total}</td>
      <td><span class="metric-badge badge-blue">${entPct}%</span></td>
      <td>${stEnt}</td>
      <td><span class="metric-badge badge-blue">${saiPct}%</span></td>
      <td>${stSai}</td>
      <td><span class="metric-badge ${faltas>4?'badge-red':'badge-green'}">${faltas}</span></td>
    </tr>`;
  }).join('');
}
function renderDashOcorr(){
  const cont=document.getElementById('dash-ocorr'); if(!cont)return;
  const {turno, dia} = getDashFiltros();
  let data=[...OCORR_DATA].reverse();
  if(turno){const als=ALUNOS_DATA.filter(a=>a.turno===turno).map(a=>a.nome); data=data.filter(o=>als.includes(o.aluno));}
  if(dia) data=data.filter(o=>o.data===new Date(dia+'T12:00:00').toLocaleDateString('pt-BR'));
  data=data.slice(0,5);
  cont.innerHTML=data.length?data.map(o=>ocorrItemHTML(o)).join(''):emptyState('✅','Nenhuma ocorrência','Tudo tranquilo');
}

// ─── TURMAS ───────────────────────────────────────────────────────────────────
function renderTurmaGrid(){
  const g=document.getElementById('turma-grid'); if(!g)return;
  if(!TURMAS_DATA.length){g.innerHTML=emptyState('🏷️','Nenhuma turma cadastrada','Clique em "+ Nova Turma"');return;}
  g.innerHTML=TURMAS_DATA.map(t=>{
    const total=ALUNOS_DATA.filter(a=>a.turma===t.code).length;
    const pres=t.presentes||0, pct=total>0?Math.round(pres/total*100):0;
    const color=pct>=90?'var(--green)':pct>=75?'var(--yellow)':'var(--red)';
    return`<div class="turma-card">
      <div class="turma-code">${t.code}</div>
      <div class="turma-info">${t.serie} — ${t.turno}</div>
      <div class="turma-progress"><div class="turma-progress-bar" style="width:${pct}%;background:${color}"></div></div>
      <div class="turma-stats">
        <span style="color:var(--gray5)">👥 ${total}</span>
        <span style="color:var(--green-dark)">✓ ${pres}</span>
        <span style="color:var(--red)">✗ ${total-pres}</span>
      </div>
    </div>`;
  }).join('');
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

function saveAluno(){
  const nome   =document.getElementById('input-aluno-nome')?.value.trim();
  const cpf    =document.getElementById('input-aluno-cpf')?.value.trim();
  const turma  =document.getElementById('input-aluno-turma')?.value;
  const turno  =document.getElementById('input-aluno-turno')?.value;
  const resp   =document.getElementById('input-aluno-resp')?.value.trim();
  const contato=document.getElementById('input-aluno-contato')?.value.trim();
  const rota   =document.getElementById('input-aluno-rota')?.value;
  const email  =document.getElementById('input-aluno-email')?.value.trim();
  const nasc   =document.getElementById('input-aluno-nasc')?.value;
  const idade  =document.getElementById('input-aluno-idade')?.value;
  if(!nome||!cpf||!turma){ showToast('Preencha nome, CPF e turma!','alerta'); return; }
  if(ALUNOS_DATA.find(a=>a.cpf===cpf)){ showToast('CPF já cadastrado!','alerta'); return; }
  ALUNOS_DATA.push({cpf,nome,turma,turno,rota,resp,contato,email,nasc,idade,status:'ativo',historico:[]});
  closeModal('modal-aluno');
  showToast(nome+' cadastrado!','sucesso');
  atualizarSelectTurmas();
  renderAlunos(); renderMetricasDash(); renderTurmasTable(); renderTurmaGrid();
  salvarDados();
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
  if(s!=='RVSgestor2026@'){ if(s!==null) showToast('Senha incorreta','evasao'); return; }
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

        console.log('[importarAlunos] Para inserir:', novosAlunosDB.length, '| Ignorados:', erros);

        if (novosAlunosDB.length === 0) {
           showToast('Nenhum aluno válido encontrado! ('+erros+' ignorados) — Verifique as colunas da planilha.', 'evasao');
           return;
        }

        const { data, error } = await supabaseClient.from('alunos').upsert(novosAlunosDB, { onConflict: 'matricula' }).select();
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

function calClick(key){
  if(PERFIL_ATUAL!=='admin'){ showToast('Apenas o Administrador pode editar o calendário','evasao'); return; }
  if(CALENDARIO[key]?.tipo==='letivo'){
    delete CALENDARIO[key]; showToast('Dia desmarcado','alerta');
  } else if(!CALENDARIO[key]){
    CALENDARIO[key]={tipo:'letivo',label:'Dia Letivo',turno:'Geral'};
    showToast('Dia marcado como Letivo ✅','sucesso');
  }
  renderCalendar(); renderFiltrosDiaFreq(); salvarDados();
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

function salvarTipoCal(){
  const key=document.getElementById('modal-cal-key').value;
  const tipo=document.getElementById('input-cal-tipo').value;
  const turno=document.getElementById('input-cal-turno').value;
  const label=document.getElementById('input-cal-label').value.trim();
  const bimestre=document.getElementById('input-cal-bimestre').value;
  const hIni=document.getElementById('input-cal-hini').value;
  const hFim=document.getElementById('input-cal-hfim').value;
  const labelFinal=tipo==='bimestre'?bimestre:tipo==='evento'?label:TIPO_LABEL[tipo];
  CALENDARIO[key]={tipo,turno,label:labelFinal,bimestre,hIni,hFim,responsavel:'Dhenison Carlos'};
  closeModal('modal-cal-tipo');
  renderCalendar(); renderFiltrosDiaFreq(); salvarDados();
  showToast('Calendário atualizado!','sucesso');
}

function toggleBimestreSelect(){
  const tipo=document.getElementById('input-cal-tipo')?.value;
  document.getElementById('row-bimestre')?.classList.toggle('hidden',tipo!=='bimestre');
  document.getElementById('row-evento-label')?.classList.toggle('hidden',tipo!=='evento');
  document.getElementById('row-horario')?.classList.toggle('hidden',tipo==='letivo'||tipo==='feriado');
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
  CALENDARIO[key].agendamento={titulo,tipo,turno,hIni,hFim,obs,responsavel:'Dhenison Carlos'};
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

function carregarChamada(){
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

function onDiaFreqChange(){
  freq.entrada={}; freq.saida={};
  chamadaConsolidada.entrada=false; chamadaConsolidada.saida=false;
  const ent=document.getElementById('entrada-status');
  const sai=document.getElementById('saida-status');
  if(ent){ent.textContent='Pendente';ent.className='chamada-status status-pendente';}
  if(sai){sai.textContent='Pendente';sai.className='chamada-status status-pendente';}
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

function presencaTodos(tipo){
  if(tipo==='saida'&&!chamadaConsolidada.entrada){showToast('Consolide a Entrada primeiro','alerta');return;}
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual);
  if(!alunos.length){showToast('Nenhum aluno','alerta');return;}
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
  
  // -- SYNC SUPABASE --
  if (aluno && aluno.id) {
      const dataHoje = new Date().toISOString().split('T')[0];
      let dbStatus = val.startsWith('FJ') ? 'FJ' : val;
      supabaseClient.from('frequencia').upsert({
          aluno_id: aluno.id,
          turma_id: aluno.turma_id,
          data: dataHoje,
          tipo: tipo,
          status: dbStatus
      }, { onConflict: 'aluno_id, data, tipo' }).then(({error}) => {
          if(error) console.error('Erro ao salvar frequencia:', error);
      });
  }

  if(evasao){
    showToast('⚠️ Evasão: '+(aluno?.nome||'Aluno'),'evasao');
    if (aluno && aluno.id) {
      supabaseClient.from('ocorrencias').insert({
          tipo: 'evasao',
          aluno_id: aluno.id,
          turma_id: aluno.turma_id,
          descricao: 'Presente na entrada, ausente na saída — gerado automaticamente',
          auto_gerada: true
      }).then(({error}) => { if(error) console.error(error); });
    }
    renderDashOcorr(); renderOcorrencias(); salvarDados();
  }
  updateConsolidado();
}

function consolidar(tipo){
  if(tipo==='saida'&&!chamadaConsolidada.entrada){showToast('Consolide a Entrada primeiro','alerta');return;}
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turmaChamadaAtual);
  if(!alunos.length){showToast('Nenhum aluno para consolidar','alerta');return;}
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
  return`<div class="ocorr-item ${cls}">
    <div class="ocorr-icon ocorr-${o.tipo}">${o.icon||'⚠️'}</div>
    <div class="ocorr-content">
      <h4>${label} — ${o.aluno} (${o.turma})</h4>
      <p>${o.desc}</p>
      ${o.aguardandoPais?'<span class="metric-badge badge-yellow" style="margin-top:4px">Aguardando pais</span>':''}
      ${o.origem==='frequencia'?'<span class="metric-badge badge-red" style="margin-top:4px">Originada na Frequência</span>':''}
    </div>
    <div class="ocorr-time">
      <div>${o.hora}</div><div style="margin-top:4px">${o.data||''}</div>
      ${!o.tratada?`<button class="btn btn-xs btn-outline" style="margin-top:6px" onclick="abrirTratarOcorr(${o.id})">Tratar</button>`
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

function saveOcorrencia(){
  const tipo=document.getElementById('input-ocorr-tipo')?.value;
  const turma=document.getElementById('input-ocorr-turma')?.value;
  const desc=document.getElementById('input-ocorr-desc')?.value.trim();
  const comunicarPais=document.querySelector('input[name="comunicar-pais"]:checked')?.value==='sim';
  const icons={evasao:'🚨',indisciplina:'📵',bullying:'⚡',agressao:'👊',atraso:'⏰'};
  const alunoSel=document.getElementById('sel-aluno-principal')?.value;
  const nomes=[alunoSel,...envolvidos.map(e=>e.nome)].filter(Boolean).join(', ');
  OCORR_DATA.push({
    id:Date.now(),tipo,icon:icons[tipo]||'⚠️',aluno:nomes||'—',turma,desc,
    hora:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
    data:new Date().toLocaleDateString('pt-BR'),
    tratada:false,aguardandoPais:comunicarPais,origem:'manual'
  });
  envolvidos=[];
  const el=document.getElementById('envolvidos-list-ocorr');
  if(el) el.innerHTML='';
  closeModal('modal-ocorr');
  showToast('Ocorrência registrada!','sucesso');
  renderOcorrencias(); renderDashOcorr(); salvarDados();
}

function abrirTratarOcorr(id){
  document.getElementById('modal-tratar-id').value=id;
  openModal('modal-tratar-ocorr');
}
function salvarTratamento(manter){
  const id=Number(document.getElementById('modal-tratar-id').value);
  const just=document.getElementById('input-justificativa')?.value.trim();
  const o=OCORR_DATA.find(x=>x.id===id); if(!o)return;
  if(!manter){
    o.tratada=true; o.justificativa=just;
    const al=ALUNOS_DATA.find(a=>a.nome===o.aluno);
    if(al)(al.historico=al.historico||[]).push({tipo:'ocorrencia',titulo:'Ocorrência tratada: '+o.tipo,desc:just||o.desc,data:o.data});
    showToast('Ocorrência tratada ✅','sucesso');
  } else { showToast('Mantida sem tratamento','alerta'); }
  closeModal('modal-tratar-ocorr');
  renderOcorrencias(); renderDashOcorr(); salvarDados();
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
  const alunos=turma?ALUNOS_DATA.filter(a=>a.turma===turma):[];
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
    renderDashOcorr(); renderOcorrencias(); salvarDados();
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

function saveRota(){
  const nome=document.getElementById('input-rota-nome')?.value.trim();
  const motorista=document.getElementById('input-rota-motorista')?.value.trim();
  const veiculo=document.getElementById('input-rota-veiculo')?.value.trim();
  const monitora=document.getElementById('input-rota-monitora')?.value.trim();
  const emailMon=document.getElementById('input-rota-email-monitora')?.value.trim();
  if(!nome){showToast('Informe o nome da rota','alerta');return;}
  ROTAS_DATA.push({nome,motorista,veiculo,monitora,emailMon});
  closeModal('modal-rota');
  showToast('Rota '+nome+' criada!','sucesso');
  atualizarSelectTurmas();
  renderTransporte(); salvarDados();
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

function toggleLivroAluno(cpf, liIdx, checkbox){
  const a=ALUNOS_DATA.find(x=>x.cpf===cpf); if(!a)return;
  if(!a.livros) a.livros={};
  if(checkbox.checked){
    a.livros[liIdx]='sim';
    a.livros[liIdx+'_data']=new Date().toLocaleDateString('pt-BR');
  } else {
    delete a.livros[liIdx];
    delete a.livros[liIdx+'_data'];
  }
  const span=checkbox.nextElementSibling;
  if(span){span.style.color=checkbox.checked?'var(--green-dark)':'var(--gray4)';span.textContent=checkbox.checked?'✓ Recebeu':'Não recebeu';}
  const td=checkbox.closest('td').nextElementSibling;
  if(td) td.textContent=checkbox.checked?new Date().toLocaleDateString('pt-BR'):'';
  salvarDados(); renderLivros();
}

function fecharLivroAlunos(){
  document.getElementById('livros-grid').classList.remove('hidden');
  document.getElementById('livros-alunos-section').classList.add('hidden');
  livroAtualIdx=-1;
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function renderChat(seg){
  chatSegment=seg; chatContact=0;
  const el=document.getElementById('chat-contacts'); if(!el)return;
  const data=CHAT_DATA[seg];
  el.innerHTML=data.length
    ?data.map((c,i)=>`<div class="chat-contact ${i===0?'active':''}" onclick="selectContact(${i},this)">
        <div class="chat-contact-avatar" style="background:${c.color}">${c.name[0]}</div>
        <div class="chat-contact-info"><h4>${c.name}</h4><p>${c.role}</p></div>
      </div>`).join('')
    :'<div style="padding:20px;text-align:center;color:var(--gray4);font-size:13px">Nenhum contato</div>';
  renderChatMsgs(0);
}
function setChatSegment(seg,tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active'); renderChat(seg);
}
function selectContact(i,el){
  document.querySelectorAll('.chat-contact').forEach(c=>c.classList.remove('active'));
  el.classList.add('active'); chatContact=i; renderChatMsgs(i);
  const d=CHAT_DATA[chatSegment][i];
  document.getElementById('chat-current-name').textContent=d.name+' — '+d.role;
}
function renderChatMsgs(i){
  const m=document.getElementById('chat-messages'); if(!m)return;
  const data=CHAT_DATA[chatSegment][i];
  if(!data){m.innerHTML=emptyState('💬','Selecione um contato','');return;}
  m.innerHTML=data.msgs.map(msg=>`<div class="msg ${msg.t}">${msg.m}<div class="msg-time">${msg.h}</div></div>`).join('');
  m.scrollTop=m.scrollHeight;
}
function sendChatMsg(){
  const inp=document.getElementById('chat-input-field');
  const val=inp?.value.trim(); if(!val)return;
  const d=CHAT_DATA[chatSegment][chatContact]; if(!d)return;
  d.msgs.push({t:'sent',m:val,h:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})});
  renderChatMsgs(chatContact); inp.value=''; salvarDados();
}

// ─── PERMISSÕES ───────────────────────────────────────────────────────────────
function renderPermissoes(){
  const b=document.getElementById('perm-tbody'); if(!b)return;
  b.innerHTML=PERMS.map(p=>`<tr><td><strong>${p.func}</strong></td>
    ${['coord','sec','prof'].map(r=>`<td><label class="perm-toggle">
      <input type="checkbox" ${p[r]?'checked':''}><span class="perm-toggle-track"></span><span class="perm-toggle-thumb"></span>
    </label></td>`).join('')}</tr>`).join('');
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
  const div=document.getElementById('rel-'+tipo+'-custom');
  if(div) div.style.display=periodo==='custom'?'flex':'none';
}

function gerarRelFreq(){
  const turma=document.getElementById('rel-freq-turma')?.value;
  const periodo=document.getElementById('rel-freq-periodo')?.value||'mensal';
  if(!turma){showToast('Selecione uma turma','alerta');return;}
  const alunos=ALUNOS_DATA.filter(a=>a.turma===turma);
  if(!alunos.length){showToast('Nenhum aluno nesta turma','alerta');return;}
  const dias=getDiasLetivos(periodo,'freq');
  // Busca frequências salvas (ou usa freq atual)
  // Busca histórico de frequência salvo + dados atuais em memória
  const freqHist=JSON.parse(localStorage.getItem('rvs_freq_hist')||'{}');
  const dados=alunos.map(al=>{
    let presencas=0,faltas=0,fjs=0;
    const porDia={};
    dias.forEach(dia=>{
      // Prioridade: histórico salvo > dados em memória
      const hist=freqHist[turma]?.[dia]?.[al.cpf]||null;
      let status='—';
      if(hist){
        status=hist;
      } else {
        // Usa dados em memória (chamada atual)
        const alunosTurma=ALUNOS_DATA.filter(a=>a.turma===turma);
        const idx=alunosTurma.findIndex(a=>a.cpf===al.cpf);
        if(idx>=0){
          const ent=freq.entrada[idx]||'—';
          const sai=freq.saida[idx]||'—';
          const diaAtual=document.getElementById('sel-dia-freq')?.value||'';
          if(diaAtual===dia){
            if(ent==='P'&&(sai==='P'||sai?.startsWith('FJ'))) status='P';
            else if(ent==='F'||(ent==='P'&&sai==='F')) status='F';
            else if(ent?.startsWith('FJ')||sai?.startsWith('FJ')) status='FJ';
          }
        }
        // Busca ocorrências do dia para indicar falta
        const dataFormatada=formatarDataKey(dia);
        const ocorrDia=OCORR_DATA.filter(o=>o.aluno===al.nome&&o.data===dataFormatada&&o.tipo==='evasao');
        if(ocorrDia.length) status='F';
      }
      porDia[dia]=status;
      if(status==='P') presencas++;
      else if(status==='F') faltas++;
      else if(status?.startsWith('FJ')) fjs++;
    });
    const total=Math.max(presencas+faltas+fjs,dias.length);
    const pctP=total>0?Math.round(presencas/total*100):0;
    const pctF=total>0?Math.round(faltas/total*100):0;
    return{nome:al.nome,porDia,presencas,faltas,fjs,pctP,pctF};
  });
  relDadosCache.freq={alunos:dados,dias,turma,periodo};
  // Renderiza tabela
  const tHead=`<tr><th>Aluno</th>${dias.map(d=>`<th style="font-size:10px">${formatarDataKey(d).slice(0,5)}</th>`).join('')}<th>%P</th><th>%F</th><th>Presenças</th><th>Faltas</th></tr>`;
  const tBody=dados.map(d=>`<tr>
    <td style="font-size:12px;font-weight:600">${d.nome}</td>
    ${dias.map(dia=>{
      const v=d.porDia[dia];
      const bg=v==='P'?'var(--green-light)':v==='F'?'var(--red-light)':v?.startsWith('FJ')?'var(--yellow-light)':'var(--gray2)';
      return`<td style="text-align:center;background:${bg};font-size:11px;font-weight:600">${v||'—'}</td>`;
    }).join('')}
    <td style="text-align:center"><span class="metric-badge badge-green">${d.pctP}%</span></td>
    <td style="text-align:center"><span class="metric-badge badge-red">${d.pctF}%</span></td>
    <td style="text-align:center;font-weight:700">${d.presencas}</td>
    <td style="text-align:center;font-weight:700;color:var(--red)">${d.faltas}</td>
    <td style="text-align:center"><span class="metric-badge ${d.evasoesTransp>0?'badge-red':'badge-green'}">${d.evasoesTransp}</span></td>
  </tr>`).join('');
  const html=`<div style="background:white;border-radius:var(--radius2);border:1px solid var(--gray3);overflow:auto;padding:16px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px">Relatório de Frequência — Turma ${turma} — ${periodo.charAt(0).toUpperCase()+periodo.slice(1)}</div>
    <table style="min-width:600px"><thead style="background:var(--gray2)">${tHead}</thead><tbody>${tBody}</tbody></table>
  </div>`;
  document.getElementById('rel-freq-resultado').innerHTML=html;
  document.getElementById('rel-freq-actions').classList.remove('hidden');
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
    +'<style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px}'
    +'table{width:100%;border-collapse:collapse}'
    +'th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}'
    +'th{background:#f0f0f0;font-weight:bold}'
    +'.metric-badge{padding:2px 6px;border-radius:4px;font-size:10px}'
    +'.badge-green{background:#dcfce7;color:#15803d}'
    +'.badge-red{background:#fee2e2;color:#b91c1c}'
    +'.badge-blue{background:#dbeafe;color:#1d4ed8}'
    +'</style></head><body>'+conteudo+'</body></html>';
  const w=window.open('','_blank');
  w.document.write(html_pdf); w.document.close();
  setTimeout(()=>w.print(),500);
}

async function salvarAtividade(){
  const tipo=document.getElementById('ativ-tipo')?.value;
  const data=document.getElementById('ativ-data')?.value; // YYYY-MM-DD
  const hIni=document.getElementById('ativ-hini')?.value;
  const hFim=document.getElementById('ativ-hfim')?.value;
  const desc=document.getElementById('ativ-desc')?.value.trim();
  const selT=document.getElementById('ativ-turmas');
  const turmas=selT?Array.from(selT.selectedOptions).map(o=>o.value):[];
  if(!tipo||!data){showToast('Informe o tipo e a data','alerta');return;}
  
  const obsData = JSON.stringify({ hIni, hFim, turmas, desc });
  
  const {error} = await supabaseClient.from('eventos').insert({
     titulo: tipo === 'letivo' ? 'Dia Letivo' : 'Evento Especial',
     data: data,
     tipo: tipo,
     turno: 'Geral',
     responsavel: 'Coordenação',
     observacoes: obsData
  });
  
  if(error) {
     console.error(error);
     showToast('Erro ao salvar evento', 'alerta');
  } else {
     closeModal('modal-nova-atividade');
     showToast('Atividade incluída no Supabase!','sucesso');
     await carregarDados(); // reload events
     renderCalendar();
  }
}

function excluirAtividade(id){
  RVS_ATIVIDADES=RVS_ATIVIDADES.filter(a=>a.id!==id);
  localStorage.setItem('rvs_atividades',JSON.stringify(RVS_ATIVIDADES));
  renderAgendaMural();
}

function setHorarioTab(tab,el){
  document.querySelectorAll('#page-horarios .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('horario-geral')?.classList.toggle('hidden',tab!=='geral');
  document.getElementById('horario-prof')?.classList.toggle('hidden',tab!=='prof');
}

function salvarLink(chave){
  const inp=document.getElementById('link-'+chave);
  if(!inp)return;
  const val=inp.value.trim();
  if(!val){showToast('Cole um link antes de salvar','alerta');return;}
  localStorage.setItem('rvs_link_'+chave,val);
  showToast('Link salvo!','sucesso');
}

function abrirLink(chave){
  const saved=localStorage.getItem('rvs_link_'+chave);
  const inp=document.getElementById('link-'+chave);
  const url=saved||inp?.value.trim();
  if(!url){showToast('Nenhum link cadastrado ainda','alerta');return;}
  window.open(url,'_blank');
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
