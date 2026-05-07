const fs = require('fs');
const path = require('path');
const appJsPath = path.join(__dirname, 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Find the function boundaries
const start = content.indexOf('function importarAlunos(){');
if (start === -1) { console.error('Function not found!'); process.exit(1); }

// Find the closing brace of the function by counting braces
let depth = 0;
let end = -1;
for (let i = start; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}

console.log('Found function from char', start, 'to', end);
console.log('Current function snippet (last 100 chars):', content.substring(end-100, end));

const newFn = `function importarAlunos(){
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
             if(parts.length === 3) dataNasc = \`\${parts[2]}-\${parts[1].padStart(2,'0')}-\${parts[0].padStart(2,'0')}\`;
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
}`;

content = content.substring(0, start) + newFn + content.substring(end);
fs.writeFileSync(appJsPath, content, 'utf8');
console.log('importarAlunos replaced successfully!');
