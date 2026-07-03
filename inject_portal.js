const fs = require('fs');
const path = require('path');

const portalHtmlPath = path.join(__dirname, 'portal_aluno.html');
let content = fs.readFileSync(portalHtmlPath, 'utf8');

// 1. Add Supabase CDN if not present
if (!content.includes('supabase-js@2')) {
  content = content.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n</head>');
}

// 2. Add Modal CSS
const modalCSS = `
    /* ── Modais ── */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,.8); backdrop-filter: blur(8px);
      z-index: 100; display: none; align-items: center; justify-content: center; padding: 20px;
      opacity: 0; transition: opacity .3s;
    }
    .modal-overlay.active { display: flex; opacity: 1; }
    .modal-box {
      background: rgba(30,41,59,.95); border: 1px solid rgba(255,255,255,.1);
      border-radius: 24px; width: 100%; max-width: 500px; padding: 24px;
      transform: translateY(20px) scale(0.95); transition: all .3s cubic-bezier(0.34,1.56,0.64,1);
      max-height: 80vh; overflow-y: auto; box-shadow: 0 24px 60px rgba(0,0,0,.4);
    }
    .modal-overlay.active .modal-box { transform: translateY(0) scale(1); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-title { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; color: white; }
    .modal-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; }
    .modal-close:hover { color: #fca5a5; }
    .horario-btn {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      padding: 16px 20px; border-radius: 16px; color: white; text-decoration: none; font-weight: 600; margin-bottom: 12px; transition: all .2s;
    }
    .horario-btn:hover { background: rgba(59,130,246,.2); border-color: #3b82f6; transform: translateY(-2px); }
    .lista-vazia { text-align: center; padding: 40px; color: #64748b; font-size: 14px; font-weight: 500; }
    .agenda-card, .olimp-card {
      background: rgba(255,255,255,.04); border-radius: 16px; padding: 16px; margin-bottom: 12px;
      border-left: 4px solid #3b82f6; display: flex; justify-content: space-between; align-items: center;
    }
    .agenda-card.urgente { border-left-color: #ef4444; }
    .card-info-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .card-info-sub { font-size: 12px; color: #94a3b8; }
    .card-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
    .badge-normal { background: #dbeafe; color: #1d4ed8; }
    .badge-urgente { background: #fee2e2; color: #991b1b; }
    .badge-ok { background: #dcfce7; color: #166534; }
`;
if (!content.includes('.modal-overlay')) {
  content = content.replace('</style>', modalCSS + '\n  </style>');
}

// 3. Add Modals HTML
const modalsHTML = `
  <!-- Modais -->
  <div id="modal-olimpiadas" class="modal-overlay" onclick="fecharModal(event, 'modal-olimpiadas')">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title">🏆 Topo do Saber (Olimpíadas)</div>
        <button class="modal-close" onclick="fecharModal(null, 'modal-olimpiadas')">×</button>
      </div>
      <div id="lista-olimpiadas">Carregando...</div>
    </div>
  </div>

  <div id="modal-horarios" class="modal-overlay" onclick="fecharModal(event, 'modal-horarios')">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title">🕐 Horário de Aula</div>
        <button class="modal-close" onclick="fecharModal(null, 'modal-horarios')">×</button>
      </div>
      <div id="lista-horarios">Carregando...</div>
    </div>
  </div>

  <div id="modal-agenda" class="modal-overlay" onclick="fecharModal(event, 'modal-agenda')">
    <div class="modal-box" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title">📅 Agenda Escolar</div>
        <button class="modal-close" onclick="fecharModal(null, 'modal-agenda')">×</button>
      </div>
      <div id="lista-agenda">Carregando...</div>
    </div>
  </div>
`;
if (!content.includes('modal-olimpiadas')) {
  content = content.replace('</main>', '</main>\n' + modalsHTML);
}

// 4. Update Cards to open modals
content = content.replace('<div class="portal-card" id="card-olimpiadas">', '<div class="portal-card" id="card-olimpiadas" onclick="abrirOlimpiadas()">');
content = content.replace('<div class="portal-card" id="card-horario">', '<div class="portal-card" id="card-horario" onclick="abrirHorarios()">');
content = content.replace('<div class="portal-card" id="card-agenda">', '<div class="portal-card" id="card-agenda" onclick="abrirAgenda()">');

// 5. Add JS Logic
const jsLogic = `
  const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function fecharModal(e, id) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById(id).classList.remove('active');
  }

  async function abrirOlimpiadas() {
    const modal = document.getElementById('modal-olimpiadas');
    modal.classList.add('active');
    const lista = document.getElementById('lista-olimpiadas');
    lista.innerHTML = '<div class="lista-vazia">Carregando provas...</div>';

    const {data, error} = await supabaseClient.from('olimpiadas').select('*').order('dia_prova', {ascending: true});
    if (error || !data || data.length === 0) {
      lista.innerHTML = '<div class="lista-vazia">Nenhuma olimpíada cadastrada no momento.</div>';
      return;
    }

    const hoje = new Date(); hoje.setHours(0,0,0,0);
    let html = '';
    const icones = { 'Linguagens':'📖', 'Natureza':'🔬', 'Matemática':'📐', 'Humanas':'🌍' };

    data.forEach(ol => {
      const dt = ol.dia_prova ? new Date(ol.dia_prova+'T00:00:00') : null;
      const fmtDt = dt ? dt.toLocaleDateString('pt-BR') : '—';
      const diasRestantes = dt ? Math.ceil((dt - hoje)/(1000*60*60*24)) : null;
      const passou = diasRestantes !== null && diasRestantes < 0;
      const urgente = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 15;
      
      let badge = '';
      if(passou) badge = '<span class="card-badge badge-ok">✓ Realizada</span>';
      else if(urgente) badge = '<span class="card-badge badge-urgente">⚡ '+diasRestantes+' dias</span>';
      else if(diasRestantes !== null) badge = '<span class="card-badge badge-normal">📅 '+diasRestantes+' dias</span>';

      html += \`
        <div class="olimp-card" style="\${passou ? 'opacity:0.6;' : ''}">
          <div>
            <div class="card-info-title">\${icones[ol.area]||'🏆'} \${ol.nome}</div>
            <div class="card-info-sub">📅 Dia da Prova: \${fmtDt}</div>
            \${ol.link_edital ? \`<div style="margin-top:6px"><a href="\${ol.link_edital}" target="_blank" style="color:#3b82f6;font-size:12px;font-weight:600;text-decoration:none;">🔗 Ver Edital</a></div>\` : ''}
          </div>
          <div>\${badge}</div>
        </div>
      \`;
    });
    lista.innerHTML = html;
  }

  async function abrirHorarios() {
    const modal = document.getElementById('modal-horarios');
    modal.classList.add('active');
    const lista = document.getElementById('lista-horarios');
    lista.innerHTML = '<div class="lista-vazia">Carregando horários...</div>';

    const {data, error} = await supabaseClient.from('configuracoes').select('valor').eq('chave', 'links_horarios').single();
    let links = {};
    if (data && data.valor) links = data.valor;

    const turnos = [
      { id: 'geral-manha', nome: 'Horário da Manhã', icon: '☀️' },
      { id: 'geral-tarde', nome: 'Horário da Tarde', icon: '🌤️' },
      { id: 'geral-noite', nome: 'Horário da Noite', icon: '🌙' }
    ];

    let html = '';
    turnos.forEach(t => {
      const url = links[t.id];
      if (url) {
        html += \`
          <a href="\${url}" target="_blank" class="horario-btn">
            <span style="font-size:16px">\${t.icon} \${t.nome}</span>
            <span>Acessar ➔</span>
          </a>
        \`;
      }
    });

    if (!html) {
      lista.innerHTML = '<div class="lista-vazia">Nenhum horário de aula configurado pela coordenação no momento.</div>';
    } else {
      lista.innerHTML = html;
    }
  }

  async function abrirAgenda() {
    const modal = document.getElementById('modal-agenda');
    modal.classList.add('active');
    const lista = document.getElementById('lista-agenda');
    lista.innerHTML = '<div class="lista-vazia">Carregando agenda...</div>';

    const hoje = new Date(); hoje.setHours(0,0,0,0);
    // Buscar eventos a partir de hoje
    const {data, error} = await supabaseClient.from('eventos').select('*').gte('data', hoje.toISOString().split('T')[0]).order('data', {ascending: true});
    
    if (error || !data || data.length === 0) {
      lista.innerHTML = '<div class="lista-vazia">Nenhuma atividade agendada na escola.</div>';
      return;
    }

    let html = '';
    const tipoIcon = {evento:'🟠',prova:'🔵',bimestre:'⚫',fim_bimestre:'🟣',letivo:'🟢',ferias:'🏖️',feriado:'🔴'};
    
    data.forEach(ev => {
      const dt = new Date(ev.data+'T00:00:00');
      const fmtDt = dt.toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'2-digit'});
      const diasRestantes = Math.ceil((dt - hoje)/(1000*60*60*24));
      const urgente = diasRestantes <= 7;
      
      let badge = '';
      if(diasRestantes===0) badge = 'Hoje';
      else if(diasRestantes===1) badge = 'Amanhã';
      else badge = diasRestantes+' dias';

      html += \`
        <div class="agenda-card \${urgente ? 'urgente' : ''}">
          <div>
            <div class="card-info-title">\${tipoIcon[ev.tipo]||'📅'} \${ev.titulo}</div>
            <div class="card-info-sub">\${fmtDt} \${ev.observacoes ? '· '+ev.observacoes : ''}</div>
          </div>
          <div>
            <span class="card-badge \${urgente ? 'badge-urgente' : 'badge-normal'}">\${badge}</span>
          </div>
        </div>
      \`;
    });
    
    lista.innerHTML = html;
  }
`;
if (!content.includes('function abrirOlimpiadas')) {
  content = content.replace('// ── Sair ──────────────────────────────────────────────────────', jsLogic + '\n\n  // ── Sair ──────────────────────────────────────────────────────');
}

fs.writeFileSync(portalHtmlPath, content, 'utf8');
console.log('portal_aluno.html injected with Modals and logic!');
