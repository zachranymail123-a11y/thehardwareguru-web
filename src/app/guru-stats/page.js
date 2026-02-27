import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GuruStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Načteme 50 úplně posledních kliknutí
  const { data: recentViews } = await supabase
    .from('page_views')
    .select('*')
    .order('viewed_at', { ascending: false })
    .limit(50);

  // 2. Načteme TOP 10 stránek pomocí tvé SQL funkce
  const { data: topPages } = await supabase.rpc('get_top_pages');

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0b0c10', 
      color: '#c5c6c7', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif' 
    }}>
      <h1 style={{ color: '#66fcf1', borderBottom: '2px solid #66fcf1', paddingBottom: '10px' }}>
        📊 GURU LIVE MONITOR
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginTop: '30px' }}>
        
        {/* LEVÝ SLOUPEC: TOP STRÁNKY */}
        <div style={{ background: '#1f2833', padding: '20px', borderRadius: '12px', border: '1px solid #45a29e' }}>
          <h2 style={{ color: '#66fcf1' }}>🔥 Nejsledovanější sekce</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#45a29e' }}>
                <th style={{ padding: '10px' }}>Cesta</th>
                <th style={{ padding: '10px' }}>Návštěvy</th>
              </tr>
            </thead>
            <tbody>
              {topPages?.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0b0c10' }}>
                  <td style={{ padding: '10px' }}>{p.path}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#66fcf1' }}>{p.views}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PRAVÝ SLOUPEC: POSLEDNÍ AKTIVITA */}
        <div style={{ background: '#1f2833', padding: '20px', borderRadius: '12px', border: '1px solid #45a29e' }}>
          <h2 style={{ color: '#66fcf1' }}>🕒 Posledních 50 návštěv</h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '10px' }}>
            {recentViews?.map(view => (
              <div key={view.id} style={{ 
                padding: '8px', 
                borderBottom: '1px solid #0b0c10', 
                fontSize: '0.9rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{view.page_path}</span>
                <span style={{ color: '#45a29e' }}>
                  {new Date(view.viewed_at).toLocaleTimeString('cs-CZ')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#45a29e' }}>
        Data jsou brána přímo z tvé Supabase. Každý refresh stránky načte čerstvé info.
      </p>
    </div>
  );
}
