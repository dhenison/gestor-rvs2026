const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';
async function test() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ocorrencias?select=*`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 200));
}
test();
