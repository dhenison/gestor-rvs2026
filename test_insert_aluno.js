// Test: Insert a student into Supabase WITHOUT the 'turma' text field
const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function testInsert() {
    const t = await fetch(`${SUPABASE_URL}/rest/v1/turmas?select=id,code&limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const turmas = await t.json();
    if (!turmas.length) { console.log('No turmas found'); return; }
    const turma = turmas[0];
    console.log('Using turma:', turma.code, turma.id);

    // Payload WITHOUT the 'turma' text field (only turma_id UUID)
    const payload = {
        matricula: 'TEST-' + Date.now(),
        nome: 'Aluno Teste Diagnostico',
        turma_id: turma.id,
        status: 'ativo'
    };
    console.log('Sending payload:', JSON.stringify(payload));

    const res = await fetch(`${SUPABASE_URL}/rest/v1/alunos`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Response:', body || '(empty - 201 Created = SUCCESS!)');

    // Clean up test student
    if (res.status === 201) {
        await fetch(`${SUPABASE_URL}/rest/v1/alunos?matricula=eq.${payload.matricula}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        console.log('Test student cleaned up. INSERT WORKS CORRECTLY!');
    }
}

testInsert().catch(console.error);
