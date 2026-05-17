const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function test() {
    const al = await fetch(`${SUPABASE_URL}/rest/v1/alunos?select=id,turma_id&limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const alunos = await al.json();
    const aluno = alunos[0];
    
    const payload = [{
        aluno_id: aluno.id,
        turma_id: aluno.turma_id,
        data: '2026-05-15',
        tipo: 'entrada',
        status: 'F', // Changing status to F to force an update
        consolidado: true
    }];

    console.log('Testing frequencia upsert with payload:', payload);

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
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Response:', body);
}

test().catch(console.error);
