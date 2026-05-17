const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function testConsolidar() {
    // 1. Fetch some students from a specific class to simulate
    const turmaRes = await fetch(`${SUPABASE_URL}/rest/v1/turmas?select=id,code&limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const turmas = await turmaRes.json();
    const turma = turmas[0];

    const alunosRes = await fetch(`${SUPABASE_URL}/rest/v1/alunos?select=id,turma_id,nome&turma_id=eq.${turma.id}`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const alunos = await alunosRes.json();
    console.log(`Found ${alunos.length} students in class ${turma.code}`);

    if (alunos.length === 0) return;

    // 2. Build payload EXACTLY as in app.js consolidar()
    const payload = alunos.map((a, i) => ({
        aluno_id: a.id,
        turma_id: turma.id || a.turma_id,
        data: '2026-05-15',
        tipo: 'entrada',
        status: i % 2 === 0 ? 'P' : 'F', // Alternate P and F
        consolidado: true
    }));

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    // 3. Upsert
    const res = await fetch(`${SUPABASE_URL}/rest/v1/frequencia?on_conflict=aluno_id,data,tipo`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal,resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
    });
    
    console.log('Response status:', res.status);
    const body = await res.text();
    console.log('Response body:', body);
}

testConsolidar().catch(console.error);
