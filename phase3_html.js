const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ═══════════════════════════════════════
// 1. Adicionar página Usuários (antes de page-perfil)
// ═══════════════════════════════════════
const paginaUsuarios = `
      <!-- ═══════════════════ USUÁRIOS ═══════════════════ -->
      <div class="page" id="page-usuarios">
        <div class="section-header">
          <div class="section-title">👥 Usuários do Sistema</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" onclick="baixarModeloUsuarios()">📥 Modelo de Importação</button>
            <label class="btn btn-outline btn-sm" style="cursor:pointer">
              📤 Importar Planilha
              <input type="file" accept=".csv" style="display:none" onchange="importarPlanilhaUsuarios(this)">
            </label>
            <button class="btn btn-primary btn-sm" onclick="abrirModalUsuario()">+ Novo Usuário</button>
          </div>
        </div>
        <!-- Filtros -->
        <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
          <input class="form-input" style="width:200px" id="filtro-usr-busca" placeholder="🔍 Buscar nome ou e-mail..." oninput="renderUsuarios()">
          <select class="form-input form-select" style="width:160px" id="filtro-usr-perfil" onchange="renderUsuarios()">
            <option value="">Todos os perfis</option>
            <option value="admin">👑 Administrador</option>
            <option value="coordenador">🎓 Coordenador</option>
            <option value="secretaria">📋 Secretaria</option>
            <option value="professor">📚 Professor</option>
          </select>
          <select class="form-input form-select" style="width:140px" id="filtro-usr-turno" onchange="renderUsuarios()">
            <option value="">Todos os turnos</option>
            <option>Manhã</option><option>Tarde</option><option>Noite</option><option>Geral</option>
          </select>
        </div>
        <div id="usuarios-lista"></div>
      </div>

`;

// Inserir antes de page-perfil
const perfilMarker = '<!-- ══════════════════ MEU PERFIL';
if (!html.includes(perfilMarker)) {
  console.error('page-perfil marker not found! Checking...');
  // Try alternative
  const altMarker = 'id="page-perfil"';
  const idx = html.indexOf(altMarker);
  if(idx === -1){ console.error('page-perfil not found at all!'); process.exit(1); }
  html = html.slice(0,idx-6) + paginaUsuarios + html.slice(idx-6);
} else {
  html = html.replace(perfilMarker, paginaUsuarios + perfilMarker);
}

// ═══════════════════════════════════════
// 2. Modal de Usuário
// ═══════════════════════════════════════
const modalUsuario = `
<!-- Modal: Usuário -->
<div class="modal-overlay" id="modal-usuario" onclick="if(event.target===this)closeModal('modal-usuario')">
  <div class="modal modal-lg">
    <div class="modal-header">
      <span class="modal-title" id="modal-usuario-title">+ Novo Usuário</span>
      <button class="modal-close" onclick="closeModal('modal-usuario')">&#10005;</button>
    </div>
    <input type="hidden" id="usr-edit-id">
    <input type="hidden" id="usr-avatar-data">
    <!-- Avatar -->
    <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;gap:10px">
      <img id="usr-avatar-preview" src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%234f46e5'/><text x='50' y='64' text-anchor='middle' font-size='40' fill='white'>?</text></svg>" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--primary)">
      <div style="display:flex;gap:8px">
        <label class="btn btn-outline btn-sm" style="cursor:pointer">
          🖼️ Galeria
          <input type="file" accept="image/*" style="display:none" onchange="handleAvatarUpload(this)">
        </label>
        <button class="btn btn-outline btn-sm" onclick="abrirCameraUsuario()">📷 Câmera</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nome Completo *</label>
        <input class="form-input" id="usr-nome" placeholder="Ex: Maria Silva">
      </div>
      <div class="form-group">
        <label class="form-label">E-mail *</label>
        <input class="form-input" type="email" id="usr-email" placeholder="usuario@escola.pa.gov.br">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Perfil</label>
        <select class="form-input form-select" id="usr-perfil">
          <option value="coordenador">🎓 Coordenador</option>
          <option value="secretaria">📋 Secretaria</option>
          <option value="professor">📚 Professor</option>
          <option value="admin">👑 Administrador</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Turno</label>
        <select class="form-input form-select" id="usr-turno">
          <option value="">Selecione</option>
          <option>Manhã</option><option>Tarde</option><option>Noite</option><option value="Geral">Geral (todos)</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Turma Responsável (para Professores)</label>
      <select class="form-input form-select" id="usr-turma">
        <option value="">Nenhuma</option>
      </select>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('modal-usuario')">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarUsuario()">💾 Salvar Usuário</button>
    </div>
  </div>
</div>

`;

// Inserir antes do último </body> ou antes dos scripts
const scriptMarker = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">';
html = html.replace(scriptMarker, modalUsuario + scriptMarker);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Usuarios page + modal added to HTML!');
