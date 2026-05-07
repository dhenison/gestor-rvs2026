const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function testarConexao() {
    console.log("1. Testando SELECT em turmas...");
    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/turmas?select=*`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
    const getData = await getRes.text();
    console.log("   GET status:", getRes.status, getData.substring(0, 200));

    console.log("2. Testando INSERT em turmas...");
    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/turmas`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ code: 'TEST-01', serie: 'Turma Teste', turno: 'Manhã', professor: 'A Definir' })
    });
    const postData = await postRes.text();
    console.log("   POST status:", postRes.status, postData.substring(0, 500));

    if (postRes.ok) {
        console.log("\n✅ INSERT funcionou! Limpando turma de teste...");
        // Parse the created ID and delete it
        const created = JSON.parse(postData);
        const id = Array.isArray(created) ? created[0]?.id : created?.id;
        if (id) {
            await fetch(`${SUPABASE_URL}/rest/v1/turmas?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            console.log("   Turma de teste removida.");
        }
    } else {
        console.log("\n❌ INSERT FALHOU - Possível problema de RLS ou schema!");
    }
}

testarConexao().catch(console.error);
