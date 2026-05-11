
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabaseClient.from('usuarios').select('*').eq('email', 'dhenison@escola.seduc.pa.gov.br');
  console.log('User:', data, error);
  const { data: config, error: confError } = await supabaseClient.from('configuracoes').select('*');
  console.log('Config:', config, confError);
}
check();
