const fs = require('fs');
const path = require('path');
const appJsPath = path.join(__dirname, 'js', 'app.js');
const current = fs.readFileSync(appJsPath, 'utf8');

const addition = `
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
  const nova = {
    id: Date.now(), tipo, turno, turmas, data, hIni, hFim, obs,
    status: 'pendente',
    criadoEm: new Date().toLocaleDateString('pt-BR'),
    responsavel: 'Dhenison Carlos'
  };
  SOLICIT_DATA.unshift(nova);
  salvarDados();
  closeModal('modal-nova-solicit');
  showToast('Solicitação enviada!','sucesso');
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
      acoes = '<button class="btn btn-green btn-xs" onclick="atualizarStatusSolicit(' + s.id + ', \'aceita\')">✅ Aceitar</button>' +
              '<button class="btn btn-red btn-xs"   onclick="atualizarStatusSolicit(' + s.id + ', \'recusada\')">❌ Recusar</button>';
    }
    html += '<div class="table-card" style="padding:16px;margin-bottom:12px;border-left:4px solid ' + borderColor + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">' +
      '<div>' +
        '<div style="font-size:15px;font-weight:700">' + s.tipo + '</div>' +
        '<div style="font-size:12.5px;color:#6b7280;margin-top:3px">📅 ' + dataFmt + horario + ' · 🏫 ' + s.turno + (s.turmas ? ' · ' + s.turmas : '') + '</div>' +
        (s.obs ? '<div style="font-size:12px;color:#6b7280;margin-top:6px;font-style:italic">&quot;' + s.obs + '&quot;</div>' : '') +
        '<div style="font-size:11px;color:#9ca3af;margin-top:4px">Por: ' + s.responsavel + ' · ' + s.criadoEm + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
        '<span style="font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;background:' + badgeBg + ';color:' + badgeTxt + '">' + badgeLabel + '</span>' +
        acoes +
        '<button class="btn btn-gray btn-xs" onclick="excluirSolicit(' + s.id + ')">🗑</button>' +
      '</div></div></div>';
  });
  container.innerHTML = html;
}

function atualizarStatusSolicit(id, novoStatus){
  var s = SOLICIT_DATA.find(function(x){ return x.id === id; });
  if(!s) return;
  s.status = novoStatus;
  salvarDados();
  renderSolicitacoes();
  showToast('Status atualizado: ' + novoStatus,'sucesso');
}

function excluirSolicit(id){
  if(!confirm('Excluir esta solicitação?')) return;
  SOLICIT_DATA = SOLICIT_DATA.filter(function(s){ return s.id !== id; });
  salvarDados();
  renderSolicitacoes();
  showToast('Solicitação excluída','alerta');
}
`;

fs.writeFileSync(appJsPath, current + addition, 'utf8');
console.log('Solicitacoes module added successfully!');
