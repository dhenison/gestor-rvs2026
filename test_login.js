const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function run() {
  console.log("Testing student login...");
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/login_portal_aluno`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_email: 'ana.mesquita27790@aluno.seduc.pa.gov.br',
        p_senha: 'seduc78164'
      })
    });
    const data = await res.json();
    console.log("RPC Data:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

run();
