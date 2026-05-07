const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const modalBlock = `
<!-- Modal: Olimpiada (Topo do Saber) -->
<div class="modal-overlay" id="modal-olimpiada" onclick="if(event.target===this)closeModal('modal-olimpiada')">
  <div class="modal modal-lg">
    <div class="modal-header">
      <span class="modal-title" id="modal-olimpiada-title">+ Nova Olimpiada</span>
      <button class="modal-close" onclick="closeModal('modal-olimpiada')">&#10005;</button>
    </div>
    <input type="hidden" id="ol-edit-id">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nome da Olimpiada *</label>
        <input class="form-input" id="ol-nome" placeholder="Ex: OBMEP, OBFEP...">
      </div>
      <div class="form-group">
        <label class="form-label">Area *</label>
        <select class="form-input form-select" id="ol-area">
          <option>Linguagens</option>
          <option>Natureza</option>
          <option>Matematica</option>
          <option>Humanas</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Inicio das Inscricoes</label>
        <input class="form-input" type="date" id="ol-inscr-ini">
      </div>
      <div class="form-group">
        <label class="form-label">Fim das Inscricoes</label>
        <input class="form-input" type="date" id="ol-inscr-fim">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Dia da Prova *</label>
        <input class="form-input" type="date" id="ol-dia-prova">
      </div>
      <div class="form-group">
        <label class="form-label">Qtd. Alunos Inscritos</label>
        <input class="form-input" type="number" id="ol-qtd-alunos" value="0" min="0">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Link do Edital</label>
        <input class="form-input" id="ol-link-edital" placeholder="https://...">
      </div>
      <div class="form-group">
        <label class="form-label">Escola esta Inscrita?</label>
        <select class="form-input form-select" id="ol-inscrita">
          <option value="sim">Sim</option>
          <option value="nao">Nao</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('modal-olimpiada')">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarOlimpiada()">Salvar Olimpiada</button>
    </div>
  </div>
</div>

`;

const target = '<!-- Modal: Nova Atividade RVS Agenda -->';
if (!html.includes(target)) {
  console.error('Target string not found!');
  process.exit(1);
}

const updated = html.replace(target, modalBlock + target);
fs.writeFileSync('index.html', updated, 'utf8');
console.log('Modal olimpiada added successfully!');
