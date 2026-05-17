const SUPABASE_URL = 'https://xjtluflzpkkbckkcwagf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdGx1Zmx6cGtrYmNra2N3YWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjMxNzMsImV4cCI6MjA5MzIzOTE3M30.3Fj_xCwTwx0MYWjFx3xM41BP8DQCsRMgGYmZJkHuidE';

async function testReportLogic() {
    // Simulate what gerarRelFreq does
    const turmaId = 'e8f70c2b-546f-4bc8-9f28-10e7e5124525';
    const diasIni = '2026-05-01';
    const diasFim = '2026-05-31';

    let url = `${SUPABASE_URL}/rest/v1/frequencia?select=aluno_id,data,tipo,status,consolidado&turma_id=eq.${turmaId}&consolidado=eq.true&data=gte.${diasIni}&data=lte.${diasFim}`;
    
    console.log('Fetching:', url);
    const res = await fetch(url, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    
    const fqRows = await res.json();
    console.log(`Found ${fqRows.length} frequency records`);

    let freqDB = {};
    (fqRows || []).forEach(f => {
        if(!freqDB[f.aluno_id]) freqDB[f.aluno_id] = {};
        if(!freqDB[f.aluno_id][f.data]) freqDB[f.aluno_id][f.data] = {};
        freqDB[f.aluno_id][f.data][f.tipo] = f.status;
    });

    console.log('freqDB keys:', Object.keys(freqDB).length);

    // Simulate rendering for one student
    if (fqRows.length > 0) {
        const testAlunoId = fqRows[0].aluno_id;
        console.log(`Testing aluno ${testAlunoId}`);
        const d = '2026-05-15';
        
        const e = (freqDB[testAlunoId] && freqDB[testAlunoId][d] && freqDB[testAlunoId][d]['entrada']) || '-';
        const s = (freqDB[testAlunoId] && freqDB[testAlunoId][d] && freqDB[testAlunoId][d]['saida']) || '-';
        
        console.log(`Date: ${d}, Entrada: ${e}, Saida: ${s}`);
    }
}
testReportLogic().catch(console.error);
