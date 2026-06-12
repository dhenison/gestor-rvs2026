/**
 * ════════════════════════════════════════════════════════════════
 *  gerar_cartoes_estaticos.js
 *  Exporta cartões de acesso do Supabase e salva como JSON estático
 *  para contingência e funcionamento offline do banco.
 *
 *  COMO USAR:
 *    node gerar_cartoes_estaticos.js [CHAVE_SERVICE_ROLE_OPCIONAL]
 *    node gerar_cartoes_estaticos.js --mock  (Gera dados mockados de teste)
 * ════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

// Define a chave a ser usada (prioriza argumento passado pelo terminal)
const args = process.argv.slice(2);
const isMock = args.includes('--mock');
const customKey = args.find(a => a !== '--mock' && !a.startsWith('-'));
const apiToken = customKey || SUPABASE_ANON_KEY;

// Se for modo de simulação/mock
if (isMock) {
  gerarDadosMock();
  process.exit(0);
}

async function exportarDados() {
  console.log('\n🚀  Iniciando exportação de cartões de acesso do Supabase...');
  console.log(`📡  Conectando a: ${SUPABASE_URL}`);
  
  const headers = {
    'apikey': apiToken,
    'Authorization': `Bearer ${apiToken}`
  };

  try {
    // 1. Busca todos os alunos
    console.log('⏳ Carregando cadastro de alunos...');
    const resAlunos = await fetch(`${SUPABASE_URL}/rest/v1/alunos?select=id,matricula,nome,data_nascimento`, { headers });
    if (!resAlunos.ok) throw new Error(`Falha ao ler alunos: ${resAlunos.statusText} (${resAlunos.status})`);
    const alunos = await resAlunos.json();
    console.log(`✅ ${alunos.length} alunos carregados.`);

    // 2. Busca todas as olimpíadas
    console.log('⏳ Carregando cadastro de olimpíadas...');
    const resOlimpiadas = await fetch(`${SUPABASE_URL}/rest/v1/olimpiadas?select=id,nome,dia_prova`, { headers });
    if (!resOlimpiadas.ok) throw new Error(`Falha ao ler olimpíadas: ${resOlimpiadas.statusText} (${resOlimpiadas.status})`);
    const olimpiadas = await resOlimpiadas.json();
    console.log(`✅ ${olimpiadas.length} olimpíadas carregadas.`);

    // 3. Busca todos os cartões de acesso
    console.log('⏳ Carregando cartões de acesso...');
    const resCartoes = await fetch(`${SUPABASE_URL}/rest/v1/cartoes_acesso_olimpiadas?select=aluno_id,olimpiada_id,pdf_base64`, { headers });
    if (!resCartoes.ok) throw new Error(`Falha ao ler cartões: ${resCartoes.statusText} (${resCartoes.status})`);
    const cartoes = await resCartoes.json();
    console.log(`✅ ${cartoes.length} cartões de acesso carregados.`);

    if (cartoes.length === 0) {
      console.log('⚠️  Nenhum cartão cadastrado no Supabase para exportação.');
      console.log('💡  Você pode rodar "node gerar_cartoes_estaticos.js --mock" para criar dados de teste.');
      return;
    }

    // 4. Mapeia tabelas de suporte para busca rápida
    const alunosMap = new Map(alunos.map(a => [a.id, a]));
    const olimpiadasMap = new Map(olimpiadas.map(o => [o.id, o]));

    // 5. Agrupa cartões por CPF do aluno
    const exportData = {};
    let vinculados = 0;

    cartoes.forEach(c => {
      const aluno = alunosMap.get(c.aluno_id);
      const olimpiada = olimpiadasMap.get(c.olimpiada_id);

      if (aluno && aluno.matricula && olimpiada) {
        // CPF limpo (apenas dígitos)
        const cpfLimpo = aluno.matricula.replace(/\D/g, '');
        
        if (!exportData[cpfLimpo]) {
          exportData[cpfLimpo] = {
            nome: aluno.nome,
            data_nascimento: formatarData(aluno.data_nascimento),
            cartoes: []
          };
        }

        exportData[cpfLimpo].cartoes.push({
          olimpiada_id: olimpiada.id,
          olimpiada_nome: olimpiada.nome,
          olimpiada_dia: olimpiada.dia_prova,
          pdf_base64: c.pdf_base64
        });
        vinculados++;
      }
    });

    // 6. Grava o arquivo de saída
    const outputPath = path.join(__dirname, 'cartoes_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log('\n==================================================');
    console.log(`✅  Exportação concluída com sucesso!`);
    console.log(`    Total de alunos com cartões: ${Object.keys(exportData).length}`);
    console.log(`    Total de cartões vinculados: ${vinculados}`);
    console.log(`📄  Arquivo gerado: ${outputPath}`);
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌  Erro durante a exportação:', err.message);
    console.error('💡  Dica: Se houver problemas com RLS (permissão), rode fornecendo a chave SERVICE_ROLE:');
    console.error('    node gerar_cartoes_estaticos.js SUA_CHAVE_SERVICE_ROLE\n');
  }
}

/** Formata data para DD/MM/AAAA */
function formatarData(dateStr) {
  if (!dateStr) return '';
  // Se for YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [aaaa, mm, dd] = dateStr.split('-');
    return `${dd}/${mm}/${aaaa}`;
  }
  return dateStr;
}

/** Gera base de dados Mockada para Testes */
function gerarDadosMock() {
  console.log('\n🎭  Gerando dados de cartões fictícios (mock) para testes...');
  
  // PDF de 1 página minimalista válido em base64
  const mockPdfBase64 = 'JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCi  AgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCA1NyA+PgpzdHJlYW0KQlQKICAvRjEgMjQgVGYKICAgNzAgNz  AwIFRkCiAgIChDYXJ0YW8gZGUgQWNlc3NvIC0gT2xpbXBpYWRhIDIwMjYpIFNqCkVOCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTYgMDAwMDAgbiAKMDAwMDAwMDExNiAwMDAwMCBu  IAowMDAwMDAwMjE2IDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA1CiAgICAgL1Jvb3QgMSAwIFIKICA+PgpzdGFydHhyZWYKMzIyCiUlRU9GCg==';

  const mockData = {
    "12345678909": {
      "nome": "ALUNO TESTE ONANO E OBQ",
      "data_nascimento": "15/01/2007",
      "cartoes": [
        {
          "olimpiada_id": "00000000-0000-0000-0000-000000000001",
          "olimpiada_nome": "Olimpíada Nacional de Nanotecnologia (ONANO)",
          "olimpiada_dia": "2026-06-18",
          "pdf_base64": mockPdfBase64
        },
        {
          "olimpiada_id": "00000000-0000-0000-0000-000000000002",
          "olimpiada_nome": "Olimpíada Brasileira de Química (OBQ)",
          "olimpiada_dia": "2026-06-25",
          "pdf_base64": mockPdfBase64
        }
      ]
    },
    "98765432101": {
      "nome": "JULIA ALVES SOUZA",
      "data_nascimento": "22/11/2008",
      "cartoes": [
        {
          "olimpiada_id": "00000000-0000-0000-0000-000000000001",
          "olimpiada_nome": "Olimpíada Nacional de Nanotecnologia (ONANO)",
          "olimpiada_dia": "2026-06-18",
          "pdf_base64": mockPdfBase64
        }
      ]
    }
  };

  const outputPath = path.join(__dirname, 'cartoes_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2), 'utf8');

  console.log('\n==================================================');
  console.log(`🎭  Dados mockados gravados com sucesso!`);
  console.log(`📄  Arquivo gerado: ${outputPath}`);
  console.log(`\n💡  Use estas credenciais para testar na página:`);
  console.log(`    1. CPF: 123.456.789-09 | Data Nasc: 15/01/2007`);
  console.log(`    2. CPF: 987.654.321-01 | Data Nasc: 22/11/2008`);
  console.log('==================================================\n');
}

exportarDados();
