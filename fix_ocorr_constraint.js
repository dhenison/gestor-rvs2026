const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';
const sql = `
ALTER TABLE ocorrencias DROP CONSTRAINT IF EXISTS ocorrencias_tipo_check;
ALTER TABLE ocorrencias ADD CONSTRAINT ocorrencias_tipo_check CHECK (tipo IN ('evasao','indisciplina','bullying','agressao','atraso'));
`;
async function runSQL() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
}
runSQL();
