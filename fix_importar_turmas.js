const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

const regex = /function importarTurmas\(\)\s*\{[\s\S]*?reader\.readAsArrayBuffer\(file\);\n\s*\}\);\n\}/;

const fixedImportarTurmas = `function importarTurmas(){
  const input=document.getElementById('input-importar-turmas');
  const file=input?.files?.[0];
  if(!file){ showToast('Selecione um arquivo .xlsx','alerta'); return; }
  carregarSheetJS(()=>{
    const reader=new FileReader();
    reader.onload= async (e)=>{
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{defval:''});
        
        let count=0,erros=0;
        const novasTurmasDB = [];
        
        rows.forEach(r=>{
          // Aceita várias possibilidades de nomes de coluna
          const code=(r['Código (Ex: 101)']||r['Código']||r['Turma']||'').toString().trim().toUpperCase();
          const serie=(r['Série/Ano']||r['Série']||'').toString().trim();
          const turno=(r['Turno (Manhã/Tarde/Noite)']||r['Turno']||'').toString().trim();
          
          if(!code) return; // Ignora linha vazia
          
          // Ignora se já existe no banco carregado
          if(TURMAS_DATA.find(t=>t.code===code)){erros++;return;}
          // Ignora se já inseriu nesta mesma planilha
          if(novasTurmasDB.find(t=>t.code===code)){erros++;return;}
          
          novasTurmasDB.push({
             code: code,
             serie: serie || code,
             turno: turno || 'Manhã',
             professor: 'A Definir'
          });
          count++;
        });
        
        if (novasTurmasDB.length > 0) {
            const {error} = await supabaseClient.from('turmas').upsert(novasTurmasDB, { onConflict: 'code' });
            if(error) {
               console.error(error);
               showToast('Erro do banco: ' + error.message, 'evasao');
               return;
            }
            await carregarDados(); // atualiza a tela
        }
        
        showToast(count+' turma(s) importada(s)!'+(erros?' ('+erros+' ignoradas)':''),count>0?'sucesso':'alerta');
        atualizarSelectTurmas(); renderTurmaGrid(); renderTurmasTable(); renderMetricasDash();
        input.value='';
      }catch(err){ 
         console.error(err);
         showToast('Erro ao ler arquivo.','evasao'); 
      }
    };
    reader.readAsArrayBuffer(file);
  });
}`;

content = content.replace(regex, fixedImportarTurmas);
fs.writeFileSync(appJsPath, content, 'utf8');
console.log('importarTurmas fix applied!');
