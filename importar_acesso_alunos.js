/**
 * ════════════════════════════════════════════════════════════════
 *  importar_acesso_alunos.js
 *  Lê o arquivo XLSX de alunos e gera:
 *    1. SQL INSERT → inserir_acesso_alunos.sql  (cole no Supabase)
 *    2. Preview no terminal
 *
 *  COMO USAR:
 *    node importar_acesso_alunos.js "caminho\para\sua_planilha.xlsx"
 *
 *  Colunas esperadas na planilha (qualquer ordem):
 *    Nome | Email | Senha | CPF | Data Nascimento
 * ════════════════════════════════════════════════════════════════
 */

const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

// ── Arquivo de entrada ──────────────────────────────────────────
const arquivoXlsx = process.argv[2];
if (!arquivoXlsx) {
  console.error('\n❌  Informe o caminho do arquivo XLSX:');
  console.error('    node importar_acesso_alunos.js "planilha.xlsx"\n');
  process.exit(1);
}

if (!fs.existsSync(arquivoXlsx)) {
  console.error(`\n❌  Arquivo não encontrado: ${arquivoXlsx}\n`);
  process.exit(1);
}

// ── Helpers ─────────────────────────────────────────────────────

/** Normaliza cabeçalhos removendo acentos e espaços extras */
function norm(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim();
}

/** Garante máscara CPF: 000.000.000-00 */
function formatarCPF(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length !== 11) return String(raw || '').trim(); // mantém original se inválido
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
}

/**
 * Formata data para DD/MM/AAAA.
 * Suporta: número serial do Excel, string dd/mm/aaaa, dd-mm-aaaa, yyyy-mm-dd, aaaa/mm/dd
 */
function formatarData(raw) {
  if (!raw && raw !== 0) return '';

  // Número serial do Excel (ex: 31780 = 15/01/2007)
  if (typeof raw === 'number') {
    const date = XLSX.SSF.parse_date_code(raw);
    if (date) {
      const dd   = String(date.d).padStart(2, '0');
      const mm   = String(date.m).padStart(2, '0');
      const aaaa = String(date.y);
      return `${dd}/${mm}/${aaaa}`;
    }
  }

  const s = String(raw).trim();

  // Já está no formato DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;

  // DD-MM-AAAA
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s.replace(/-/g, '/');

  // AAAA-MM-DD (ISO)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [aaaa, mm, dd] = s.split('-');
    return `${dd}/${mm}/${aaaa}`;
  }

  // AAAA/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) {
    const [aaaa, mm, dd] = s.split('/');
    return `${dd}/${mm}/${aaaa}`;
  }

  return s; // retorna como está
}

/** Escapa aspas simples para SQL */
function esc(v) {
  return String(v || '').replace(/'/g, "''");
}

// ── Leitura do XLSX ─────────────────────────────────────────────
console.log(`\n📂  Lendo: ${path.resolve(arquivoXlsx)}`);

const workbook  = XLSX.readFile(arquivoXlsx, { cellDates: false });
const sheetName = workbook.SheetNames[0];
const sheet     = workbook.Sheets[sheetName];
const rows      = XLSX.utils.sheet_to_json(sheet, { defval: '' });

if (!rows.length) {
  console.error('❌  Planilha vazia ou sem dados.\n');
  process.exit(1);
}

// ── Mapeamento de colunas ────────────────────────────────────────
// Detecta automaticamente qual chave do objeto corresponde a cada campo
const cabecalhos = Object.keys(rows[0]);

function encontrarColuna(...candidatos) {
  for (const c of candidatos) {
    const found = cabecalhos.find(h => norm(h) === norm(c));
    if (found) return found;
  }
  // tentativa parcial
  for (const c of candidatos) {
    const found = cabecalhos.find(h => norm(h).includes(norm(c)));
    if (found) return found;
  }
  return null;
}

const colNome  = encontrarColuna('nome', 'aluno', 'alunos', 'name');
const colEmail = encontrarColuna('email', 'e-mail', 'e mail');
const colSenha = encontrarColuna('senha', 'password', 'pass');
const colCPF   = encontrarColuna('cpf');
const colDN    = encontrarColuna('data nascimento', 'data_nascimento', 'nascimento', 'dt nascimento', 'data de nascimento', 'birth');

console.log('\n📋  Colunas detectadas:');
console.log(`    Nome            → "${colNome}"`);
console.log(`    E-mail          → "${colEmail}"`);
console.log(`    Senha           → "${colSenha}"`);
console.log(`    CPF             → "${colCPF}"`);
console.log(`    Data Nascimento → "${colDN}"`);

const faltando = [];
if (!colNome)  faltando.push('Nome');
if (!colCPF)   faltando.push('CPF');

if (faltando.length) {
  console.error(`\n❌  Colunas obrigatórias não encontradas: ${faltando.join(', ')}`);
  console.error(`    Colunas disponíveis: ${cabecalhos.join(' | ')}\n`);
  process.exit(1);
}

// ── Geração do SQL ───────────────────────────────────────────────
const linhasSQLMap = new Map();
let   erros     = 0;
let   ignorados = 0;
let   duplicados = 0;

for (let i = 0; i < rows.length; i++) {
  const row  = rows[i];
  const nome = esc((colNome  ? row[colNome]  : '')).trim();
  const cpf  = formatarCPF(colCPF  ? row[colCPF]  : '');
  const email = esc((colEmail ? row[colEmail] : '')).trim();
  const senha = esc((colSenha ? row[colSenha] : '')).trim();
  const dn    = formatarData(colDN ? row[colDN] : '');

  if (!nome || !cpf) {
    console.warn(`  ⚠️  Linha ${i + 2}: Nome ou CPF vazio — ignorado`);
    ignorados++;
    continue;
  }

  if (linhasSQLMap.has(cpf)) {
    console.warn(`  ⚠️  Linha ${i + 2}: CPF duplicado encontrado (${cpf}) — mantendo o mais recente`);
    duplicados++;
  }

  linhasSQLMap.set(cpf, `  ('${cpf}', '${nome}', '${email}', '${senha}', '${esc(dn)}')`);
}

const linhasSQL = Array.from(linhasSQLMap.values());

if (!linhasSQL.length) {
  console.error('\n❌  Nenhum registro válido encontrado.\n');
  process.exit(1);
}

const sqlContent = `-- ═══════════════════════════════════════════════════════════
--  Importação de Alunos → tabela acesso_alunos
--  Gerado em: ${new Date().toLocaleString('pt-BR')}
--  Total: ${linhasSQL.length} alunos
--  Cole este arquivo no Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.acesso_alunos (cpf, nome, email, senha, data_nascimento)
VALUES
${linhasSQL.join(',\n')}
ON CONFLICT (cpf) DO UPDATE SET
  nome            = EXCLUDED.nome,
  email           = EXCLUDED.email,
  senha           = EXCLUDED.senha,
  data_nascimento = EXCLUDED.data_nascimento;
`;

// ── Salva o arquivo SQL ──────────────────────────────────────────
const outputFile = path.join(path.dirname(path.resolve(arquivoXlsx)), 'inserir_acesso_alunos.sql');
fs.writeFileSync(outputFile, sqlContent, 'utf8');

console.log('\n══════════════════════════════════════════════════');
console.log(`✅  SQL gerado com sucesso!`);
console.log(`    Registros: ${linhasSQL.length}`);
if (ignorados) console.log(`    Ignorados:  ${ignorados} (sem nome ou CPF)`);
console.log(`\n📄  Arquivo gerado:`);
console.log(`    ${outputFile}`);
console.log('\n📌  Próximo passo:');
console.log('    Supabase → SQL Editor → cole o arquivo → Run');
console.log('══════════════════════════════════════════════════\n');
