const XLSX = require('xlsx');
const fs   = require('fs');

const wb   = XLSX.readFile('C:\\Users\\USER\\Desktop\\Alunos\\Dados Alunos.xlsx', { cellDates: false });
const ws   = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

function formatarCPF(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length !== 11) return String(raw || '').trim();
  return d.slice(0,3)+'.'+d.slice(3,6)+'.'+d.slice(6,9)+'-'+d.slice(9);
}

function formatarData(raw) {
  if (!raw && raw !== 0) return '';
  if (typeof raw === 'number') {
    const dt = XLSX.SSF.parse_date_code(raw);
    if (dt) return String(dt.d).padStart(2,'0')+'/'+String(dt.m).padStart(2,'0')+'/'+String(dt.y);
  }
  const s = String(raw).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const [a,m,d]=s.split('-'); return d+'/'+m+'/'+a; }
  return s;
}

function esc(v) { return String(v || '').split("'").join("''"); }

const linhas = [];
let duplicatas = 0;

// Deduplica por CPF (mantém o último registro de cada CPF)
const mapa = new Map();
rows.forEach((row, i) => {
  const cpf = formatarCPF(row['CPF']);
  if (!cpf) return;
  if (mapa.has(cpf)) { duplicatas++; console.warn('CPF duplicado (linha '+(i+2)+'): '+ cpf + ' — mantendo mais recente'); }
  mapa.set(cpf, { row, i });
});

mapa.forEach(({ row, i }, cpf) => {
  const nome  = esc(String(row['Nome']  || '').trim());
  const email = esc(String(row['Email'] || '').trim());
  const senha = esc(String(row['Senha'] || '').trim());
  const dn    = esc(formatarData(row['Data Nascimento']));

  if (!nome || !cpf) {
    console.warn('Linha '+(i+2)+' ignorada (sem nome ou CPF)');
    return;
  }

  linhas.push("  ('" + cpf + "', '" + nome + "', '" + email + "', '" + senha + "', '" + dn + "')");
});

const sql =
  'INSERT INTO public.acesso_alunos (cpf, nome, email, senha, data_nascimento)\nVALUES\n' +
  linhas.join(',\n') +
  '\nON CONFLICT (cpf) DO UPDATE SET\n' +
  '  nome            = EXCLUDED.nome,\n' +
  '  email           = EXCLUDED.email,\n' +
  '  senha           = EXCLUDED.senha,\n' +
  '  data_nascimento = EXCLUDED.data_nascimento;\n';

const out = 'C:\\Users\\USER\\Desktop\\Alunos\\inserir_acesso_alunos.sql';
fs.writeFileSync(out, sql, { encoding: 'utf8' });
console.log('OK - ' + linhas.length + ' alunos gravados em: ' + out);
if (duplicatas > 0) console.log('AVISO: ' + duplicatas + ' CPF(s) duplicado(s) na planilha foram removidos.');
