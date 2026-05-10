const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function run() {
  const fetch = globalThis.fetch;
  const res = await fetch(SUPABASE_URL + '/rest/v1/chat_mensagens', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      segmento: 'coord',
      remetente: 'Teste',
      perfil_remetente: 'admin',
      mensagem: 'Teste node',
      tipo: 'text'
    })
  });
  const data = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', data);
}
run().catch(console.error);
