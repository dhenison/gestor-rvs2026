const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function testFetch() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/frequencia?select=data,tipo,status&turma_id=eq.e8f70c2b-546f-4bc8-9f28-10e7e5124525`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const body = await res.json();
    console.log(`Total: ${body.length}`);
    const byDate = {};
    body.forEach(b => {
        byDate[b.data] = (byDate[b.data] || 0) + 1;
    });
    console.log(byDate);
}
testFetch().catch(console.error);
