import { createClient } from '@supabase/supabase-js';

export default async function Page() {
  const supabase = createClient(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0070f3' }}>TheHardwareGuru - AI Reporty</h1>
      <hr />
      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
        {!reports || reports.length === 0 ? (
          <p>ZatÌm zde nejsou û·dnÈ reporty. Spusùte /api/cron pro jejich vygenerov·nÌ.</p>
        ) : (
          reports.map(r => (
            <div key={r.id} style={{ border: '1px solid #eaeaea', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginTop: 0 }}>{r.title}</h2>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{r.content}</p>
              <small style={{ color: '#666' }}>ID videa: {r.video_id}</small>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
