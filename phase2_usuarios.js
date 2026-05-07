const fs = require('fs');

let app = fs.readFileSync('js/app.js', 'utf8');

const usuariosModule = `

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
  const avatar = document.getElementById('usr-avatar-data')?.value || '';

  if(!nome || !email){ showToast('Preencha Nome e E-mail!','alerta'); return; }

  const payload = { nome, email, perfil, turno, turma_responsavel: turma, avatar_url: avatar };

  let error;
  if(id){
    ({error} = await supabaseClient.from('usuarios').update(payload).eq('id', id));
  } else {
    ({error} = await supabaseClient.from('usuarios').insert(payload));
  }

  if(error){ showToast('Erro: '+error.message,'evasao'); return; }
  closeModal('modal-usuario');
  showToast(id ? 'Usuário atualizado!' : 'Usuário cadastrado!','sucesso');
  await carregarUsuarios();
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
  document.getElementById('usr-turma').value = '';
  document.getElementById('usr-avatar-data').value = '';
  document.getElementById('usr-avatar-preview').src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234f46e5"/><text x="50" y="64" text-anchor="middle" font-size="40" fill="white">?</text></svg>';
  document.getElementById('modal-usuario-title').textContent = '+ Novo Usuário';
  popularTurmasUsuario();

  if(id){
    const u = USUARIOS_DATA.find(u => u.id === id);
    if(!u) return;
    document.getElementById('usr-edit-id').value = u.id;
    document.getElementById('usr-nome').value    = u.nome||'';
    document.getElementById('usr-email').value   = u.email||'';
    document.getElementById('usr-perfil').value  = u.perfil||'professor';
    document.getElementById('usr-turno').value   = u.turno||'';
    document.getElementById('usr-turma').value   = u.turma_responsavel||'';
    document.getElementById('modal-usuario-title').textContent = '✏️ Editar Usuário';
    if(u.avatar_url){
      document.getElementById('usr-avatar-data').value = u.avatar_url;
      document.getElementById('usr-avatar-preview').src = u.avatar_url;
    }
    popularTurmasUsuario();
  }
  openModal('modal-usuario');
}

function popularTurmasUsuario(){
  const sel = document.getElementById('usr-turma');
  if(!sel) return;
  sel.innerHTML = '<option value="">Nenhuma (turma geral)</option>' +
    TURMAS_DATA.map(t => '<option value="'+t.code+'">'+t.code+' — '+t.turno+'</option>').join('');
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
      const avatarHtml = u.avatar_url
        ? '<img src="'+u.avatar_url+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid '+cor+'">'
        : '<div style="width:56px;height:56px;border-radius:50%;background:'+cor+';display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;border:3px solid '+cor+'">'+initials+'</div>';
      return '<div class="table-card" style="padding:16px;border-top:3px solid '+cor+'">'+
        '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">'+
          avatarHtml+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+u.nome+'</div>'+
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
          '<button class="btn btn-outline btn-xs" onclick="abrirModalUsuario(\''+u.id+'\')">✏️ Editar</button>'+
          '<button class="btn btn-red btn-xs" onclick="excluirUsuario(\''+u.id+'\',\''+u.nome.replace(/'/g,'')+'\')">🗑</button>'+
        '</div>'+
      '</div>';
    }).join('')+
  '</div>';
}

function baixarModeloUsuarios(){
  const csv = 'Nome,Email,Perfil (admin/coordenador/secretaria/professor),Turno (Manha/Tarde/Noite),Turma Responsavel\\nJoao Silva,joao@escola.pa.gov.br,professor,Manha,9A\\nMaria Souza,maria@escola.pa.gov.br,coordenador,Geral,';
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
    const lines = e.target.result.split('\\n').filter(l=>l.trim()).slice(1);
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
`;

app += usuariosModule;
fs.writeFileSync('js/app.js', app, 'utf8');
console.log('Usuarios module added!');
