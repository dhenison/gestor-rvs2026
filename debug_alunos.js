const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function testar() {
    // 1. Pegar turmas existentes
    const tRes = await fetch(`${SUPABASE_URL}/rest/v1/turmas?select=*`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const turmas = await tRes.json();
    console.log("Turmas no banco:", JSON.stringify(turmas));

    // 2. Testar INSERT de aluno com turma_id válido
    const turmaId = turmas[0]?.id || null;
    console.log("\nUsando turma_id:", turmaId);

    const alunoTeste = {
        matricula: 'TESTE-999',
        nome: 'Aluno Teste Debug',
        turma_id: turmaId,
        rota: 'Sem transporte',
        responsavel: 'Responsável Teste',
        contato: '91999999999',
        status: 'ativo'
    };

    console.log("\nInserindo aluno:", JSON.stringify(alunoTeste));
    const aRes = await fetch(`${SUPABASE_URL}/rest/v1/alunos`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(alunoTeste)
    });
    const aData = await aRes.text();
    console.log("\nResposta INSERT aluno:", aRes.status, aData);

    // 3. Limpar o aluno de teste se inseriu
    if (aRes.ok) {
        const criado = JSON.parse(aData);
        const id = Array.isArray(criado) ? criado[0]?.id : criado?.id;
        if (id) {
            await fetch(`${SUPABASE_URL}/rest/v1/alunos?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            console.log("Aluno de teste removido.");
        }
    }

    // 4. Testar UPSERT (que o código usa)
    console.log("\n--- Testando UPSERT ---");
    const uRes = await fetch(`${SUPABASE_URL}/rest/v1/alunos`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation,resolution=merge-duplicates',
            'on-conflict': 'matricula'
        },
        body: JSON.stringify({ ...alunoTeste, matricula: 'UPSERT-TEST' })
    });
    const uData = await uRes.text();
    console.log("UPSERT status:", uRes.status, uData);

    // Limpar upsert
    if (uRes.ok) {
        const u = JSON.parse(uData);
        const uid = Array.isArray(u) ? u[0]?.id : u?.id;
        if (uid) {
            await fetch(`${SUPABASE_URL}/rest/v1/alunos?id=eq.${uid}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
        }
    }
}

testar().catch(console.error);
