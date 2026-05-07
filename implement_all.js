const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════
// FASE 1: Corrigir saveRota para usar Supabase
// ═══════════════════════════════════════════════════════
const appJsPath = path.join(__dirname, 'js', 'app.js');
let app = fs.readFileSync(appJsPath, 'utf8');

// Fix saveRota
app = app.replace(
`function saveRota(){
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
}`,
`async function saveRota(){
  const nome=document.getElementById('input-rota-nome')?.value.trim();
  const motorista=document.getElementById('input-rota-motorista')?.value.trim();
  const veiculo=document.getElementById('input-rota-veiculo')?.value.trim();
  const monitora=document.getElementById('input-rota-monitora')?.value.trim();
  const emailMon=document.getElementById('input-rota-email-monitora')?.value.trim();
  if(!nome){showToast('Informe o nome da rota','alerta');return;}
  const {data, error} = await supabaseClient.from('rotas').insert({
    nome, motorista, veiculo, cap: 0
  }).select().single();
  if(error){ showToast('Erro ao salvar rota: '+error.message,'evasao'); return; }
  ROTAS_DATA.push({id: data.id, nome, motorista, veiculo, monitora, emailMon});
  closeModal('modal-rota');
  showToast('Rota '+nome+' criada!','sucesso');
  atualizarSelectTurmas();
  renderTransporte();
}`
);

// ═══════════════════════════════════════════════════════
// FASE 2: Adicionar módulo Olímpico + Demais módulos no final
// ═══════════════════════════════════════════════════════
const newModules = `

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

  if(!nome || !area || !diaProva){ showToast('Preencha Nome, Área e Dia da Prova!','alerta'); return; }

  const payload = { nome, area, insc_inicio: inscIni, insc_fim: inscFim, dia_prova: diaProva,
                    qtd_alunos: qtdAlunos, link_edital: linkEdital, inscrita };

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
            '<button class="btn btn-outline btn-xs" onclick="abrirModalOlimpiada(\''+ol.id+'\')">✏️</button>' +
            '<button class="btn btn-red btn-xs" onclick="excluirOlimpiada(\''+ol.id+'\')">🗑</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}
`;

app += newModules;
fs.writeFileSync(appJsPath, app, 'utf8');
console.log('JS modules added!');
