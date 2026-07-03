const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'portal_aluno.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Update CSS
const newCSS = `
    /* ── Pages (Views) ── */
    .page-view { display: none; animation: fade-up .4s cubic-bezier(0.34,1.56,0.64,1); }
    .page-view.active { display: block; }
    
    .view-header {
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
    }
    .btn-voltar {
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      color: white; border-radius: 12px; padding: 8px 16px; cursor: pointer;
      font-weight: 600; font-size: 13px; transition: all .2s;
    }
    .btn-voltar:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.2); }
    .view-title { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 700; }
`;

html = html.replace('/* ── Modais ── */', newCSS + '/* ── CSS Antigo de Modais Mantido por segurança ── */');

// 2. Wrap Dashboard content
// The dashboard starts at <div class="perfil-card"> and ends at </div> <!-- End of cards-grid -->
// Let's find exactly where <main> starts
html = html.replace('<main>', '<main>\n    <div id="view-dashboard" class="page-view active">');
// End of dashboard is right before <!-- Modais --> or right after cards-grid
html = html.replace('</main>', '    </div>\n  </main>');

// 3. Move Modals to Pages
html = html.replace(/<div id="modal-olimpiadas" class="modal-overlay"[\s\S]*?<div id="lista-olimpiadas">Carregando\.\.\.<\/div>\s*<\/div>\s*<\/div>/g, 
  `<div id="view-olimpiadas" class="page-view">
      <div class="view-header">
        <button class="btn-voltar" onclick="voltarDashboard()">⬅ Voltar</button>
        <div class="view-title">🏆 Olimpíadas</div>
      </div>
      <div id="lista-olimpiadas">Carregando...</div>
   </div>`);

html = html.replace(/<div id="modal-horarios" class="modal-overlay"[\s\S]*?<div id="lista-horarios">Carregando\.\.\.<\/div>\s*<\/div>\s*<\/div>/g, 
  `<div id="view-horarios" class="page-view">
      <div class="view-header">
        <button class="btn-voltar" onclick="voltarDashboard()">⬅ Voltar</button>
        <div class="view-title">🕐 Horário de Aula</div>
      </div>
      <div id="lista-horarios">Carregando...</div>
   </div>`);

html = html.replace(/<div id="modal-agenda" class="modal-overlay"[\s\S]*?<div id="lista-agenda">Carregando\.\.\.<\/div>\s*<\/div>\s*<\/div>/g, 
  `<div id="view-agenda" class="page-view">
      <div class="view-header">
        <button class="btn-voltar" onclick="voltarDashboard()">⬅ Voltar</button>
        <div class="view-title">📅 Agenda Escolar</div>
      </div>
      <div id="lista-agenda">Carregando...</div>
   </div>`);

// 4. Update JS Functions
html = html.replace("const modal = document.getElementById('modal-olimpiadas');\n    modal.classList.add('active');", 
  "mostrarView('view-olimpiadas');");
html = html.replace("const modal = document.getElementById('modal-horarios');\n    modal.classList.add('active');", 
  "mostrarView('view-horarios');");
html = html.replace("const modal = document.getElementById('modal-agenda');\n    modal.classList.add('active');", 
  "mostrarView('view-agenda');");

const viewJS = `
  function mostrarView(id) {
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }
  function voltarDashboard() {
    mostrarView('view-dashboard');
  }
`;

html = html.replace('function fecharModal', viewJS + '\n  function fecharModal');

fs.writeFileSync(file, html, 'utf8');
console.log('Pages refactored successfully.');
