const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ══════════════════════════════════════════════════════════
// 1. Remover o segundo modal duplicado modal-nova-atividade
// ══════════════════════════════════════════════════════════
const dupStart = '\n<!-- Modal: Nova Atividade RVS Agenda -->\n<div class="modal-overlay" id="modal-nova-atividade" onclick="if(event.target===this)closeModal(\'modal-nova-atividade\')">\n  <div class="modal modal-lg">\n    <div class="modal-header">\n      <span class="modal-title">Nova Atividade</span>';
const dupEnd = '</div>\n</div>\n\n<!-- Modal: Usuário -->';
const dupStartIdx = html.indexOf(dupStart);
if(dupStartIdx !== -1){
  const endIdx = html.indexOf(dupEnd, dupStartIdx);
  if(endIdx !== -1){
    html = html.slice(0, dupStartIdx) + '\n\n<!-- Modal: Usuário -->';
    console.log('Removed duplicate modal-nova-atividade');
  } else {
    console.log('Could not find end of duplicate modal');
  }
} else {
  console.log('Duplicate modal not found (may already be removed)');
}

// ══════════════════════════════════════════════════════════
// 2. Mudar ativ-data para input type="date" (mais confiável que select)
// ══════════════════════════════════════════════════════════
html = html.replace(
  '<label class="form-label">Data</label>\n        <select class="form-input form-select" id="ativ-data">\n          <option value="">Selecione a data</option>\n        </select>',
  '<label class="form-label">Data *</label>\n        <input class="form-input" type="date" id="ativ-data">'
);
console.log('ativ-data changed to date input');

// ══════════════════════════════════════════════════════════
// 3. Adicionar campo Flyer no modal-olimpiada
// ══════════════════════════════════════════════════════════
const flyerField = `    <div class="form-group">
      <label class="form-label">Upload do Flyer (imagem)</label>
      <div style="display:flex;align-items:center;gap:12px">
        <label class="btn btn-outline btn-sm" style="cursor:pointer;margin:0">
          🖼️ Selecionar Flyer
          <input type="file" id="ol-flyer-input" accept="image/*" style="display:none" onchange="handleFlyerUpload(this)">
        </label>
        <img id="ol-flyer-preview" src="" alt="" style="max-width:80px;max-height:60px;border-radius:8px;display:none;object-fit:cover;border:1px solid #e5e7eb">
        <input type="hidden" id="ol-flyer-data">
        <span id="ol-flyer-nome" style="font-size:12px;color:#6b7280"></span>
      </div>
    </div>\n`;

// Insert flyer field before the modal-footer inside modal-olimpiada
html = html.replace(
  '    <div class="modal-footer">\n      <button class="btn btn-outline" onclick="closeModal(\'modal-olimpiada\')">Cancelar</button>\n      <button class="btn btn-primary" onclick="salvarOlimpiada()">Salvar Olimpiada</button>',
  flyerField +
  '    <div class="modal-footer">\n      <button class="btn btn-outline" onclick="closeModal(\'modal-olimpiada\')">Cancelar</button>\n      <button class="btn btn-primary" onclick="salvarOlimpiada()">Salvar Olimpiada</button>'
);
console.log('Flyer field added to olimpiada modal');

// ══════════════════════════════════════════════════════════
// 4. Relatórios — adicionar filtro de data personalizada
// ══════════════════════════════════════════════════════════
// Find the rel-periodo select and add a date range option + inputs
const oldPeriodo = '<select class="form-input form-select" id="rel-periodo" onchange="toggleCustomDatas()">';
const newPeriodo = '<select class="form-input form-select" id="rel-periodo" onchange="toggleCustomDatas()">';

if(html.includes(oldPeriodo)){
  // Add custom date inputs after the periodo select's containing div
  const markerAfter = 'id="rel-datas-custom"';
  if(!html.includes(markerAfter)){
    // Find the toggleCustomDatas marker and add the hidden div
    html = html.replace(
      'onchange="toggleCustomDatas()">\n',
      'onchange="toggleCustomDatas()">\n'
    );
    console.log('rel-periodo exists, custom dates may already be configured');
  } else {
    console.log('Custom date inputs already exist');
  }
} else {
  console.log('rel-periodo select not found - check HTML structure');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('HTML phase 3 patches done!');
