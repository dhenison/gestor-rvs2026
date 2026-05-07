const fs = require('fs');

let app = fs.readFileSync('js/app.js', 'utf8');

// ═══════════════════════════════════════════════════
// FIX 1: Transporte — corrigir 'cap' → 'capacidade'
// ═══════════════════════════════════════════════════
app = app.replace(
  "nome, motorista, veiculo, cap: 0",
  "nome, motorista, veiculo, capacidade: 0"
);

// ═══════════════════════════════════════════════════
// FIX 2: RVS Agenda — implementar funções faltantes
// ═══════════════════════════════════════════════════
const agendaFunctions = `
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
        '<div style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;background:'+(urgente?'#fee2e2':'#dbeafe')+';color:'+(urgente?'#991b1b':'#1d4ed8')+'">'+
          (diasRestantes===0?'Hoje':diasRestantes===1?'Amanhã':diasRestantes+' dias')+
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
`;

// Append agenda functions before the solicitacoes module
const insertBefore = '// ─── SOLICITAÇÕES PEDAGÓGICAS';
app = app.replace(insertBefore, agendaFunctions + '\n' + insertBefore);

// ═══════════════════════════════════════════════════
// FIX 3: Relatórios — garantir que o campo custom de datas funcione
// ═══════════════════════════════════════════════════
// Já está implementado no HTML com toggleCustomDatas - só verificar
// A função toggleCustomDatas já existe, está OK

fs.writeFileSync('js/app.js', app, 'utf8');
console.log('Phase 1 (Transporte + RVS Agenda) done!');
