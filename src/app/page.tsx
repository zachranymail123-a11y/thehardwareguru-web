import { createClient } from '@supabase/supabase-js';

export default async function Page() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: reports } = await supabase.from('reports').select('*').order('created_at', { ascending: false });

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>TheHardwareGuru - AI Reporty</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {reports?.map((r: any) => (
          <div key={r.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <h2>{r.title}</h2>
            <p>{r.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
