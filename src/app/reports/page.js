import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  // Takhle je to jedině správně - Vercel si ty údaje vytáhne z Environment Variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
        <h2>Chyba při načítání databáze</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
      margin: '0 auto', 
      fontFamily: 'sans-serif',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      <header style={{ borderBottom: '3px solid #ff0000', marginBottom: '30px', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, color: '#000', fontSize: '2rem' }}>HARDWARE GURU - REPORTY</h1>
        <p style={{ color: '#666' }}>Automatické technické souhrny z mých videí</p>
      </header>

      <div style={{ display: 'grid', gap: '25px' }}>
        {reports?.length === 0 && <p>Zatím tu nejsou žádné reporty. Zkus spustit cron!</p>}
        
        {reports?.map((report) => (
          <article key={report.id} style={{ 
            border: '1px solid #ddd', 
            padding: '25px', 
            borderRadius: '12px', 
            backgroundColor: '#fcfcfc',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 15px 0', color: '#1a1a1a' }}>{report.title}</h2>
            <p style={{ lineHeight: '1.7', color: '#333', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
              {report.content}
            </p>
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <a 
                href={report.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  color: '#ff0000', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                KOUKNOUT NA VIDEO →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
