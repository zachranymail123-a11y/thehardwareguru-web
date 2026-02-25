import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  // Tady odkazujeme na proměnné v nastavení Vercelu
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div style={{padding: '20px', color: 'red'}}>Chyba: {error.message}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Technické reporty z videí</h1>
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {reports?.map((report) => (
          <article key={report.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px 0' }}>{report.title}</h2>
            <p style={{ lineHeight: '1.6', color: '#444' }}>{report.content}</p>
            <div style={{ marginTop: '15px' }}>
              <a href={report.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontWeight: 'bold' }}>
                Sledovat video na YouTube →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
