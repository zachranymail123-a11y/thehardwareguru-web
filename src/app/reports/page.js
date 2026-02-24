import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Chceme vždy čerstvá data

export default async function ReportsPage() {
  const supabase = createClient(
    process.env.https://luepzmdwgrbtnevlznbx.supabase.co,
    process.env.sb_publishable_wa3MgO-wdn8oWrZbJReNPw_CT9Bp2mq
  );

  // Vytáhneme všechny reporty seřazené od nejnovějšího
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return <div>Chyba při načítání reportů: {error.message}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Technické reporty z videí</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        {reports.map((report) => (
          <article key={report.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 10px 0' }}>{report.title}</h2>
            <p style={{ color: '#555' }}>{report.content}</p>
            <a href={report.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>
              Přejít na video →
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
