import { createClient } from '@supabase/supabase-js';

/**
 * GURU LIVE MONITOR V1.1 (MOBILE OPTIMIZED & MULTILINGUAL)
 * 🚀 CÍL: Přehledná analýza návštěvnosti v reálném čase pro Guru Admina.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GuruStats({ searchParams }) {
  // Detekce jazyka z parametrů (výchozí CZ)
  const s = await searchParams;
  const isEn = s?.lang === 'en';

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

  // 2. Načteme TOP 10 stránek pomocí SQL funkce
  const { data: topPages } = await supabase.rpc('get_top_pages');

  return (
    <div className="guru-stats-wrapper" style={{ 
      padding: '40px', 
      background: '#0b0c10', 
      color: '#c5c6c7', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif' 
    }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .guru-stats-wrapper { padding: 40px; }
        .stats-main-title { color: #66fcf1; border-bottom: 2px solid #66fcf1; padding-bottom: 10px; font-size: clamp(1.5rem, 4vw, 2.5rem); text-transform: uppercase; font-weight: 900; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; marginTop: 30px; }
        .stats-panel { background: #1f2833; padding: 25px; borderRadius: 16px; border: 1px solid rgba(102, 252, 241, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .stats-panel h2 { color: #66fcf1; margin-top: 0; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .stats-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .stats-table th { text-align: left; color: #45a29e; padding: 12px; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid rgba(69, 162, 158, 0.2); }
        .stats-table td { padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.2); font-size: 0.9rem; }
        
        .recent-scroll { maxHeight: 500px; overflow-y: auto; margin-top: 15px; padding-right: 5px; }
        .recent-scroll::-webkit-scrollbar { width: 6px; }
        .recent-scroll::-webkit-scrollbar-thumb { background: #45a29e; border-radius: 10px; }

        .recent-item { padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.2); font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .recent-item:hover { background: rgba(102, 252, 241, 0.05); }

        @media (max-width: 768px) {
          .guru-stats-wrapper { padding: 15px !important; }
          .stats-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .stats-panel { padding: 15px !important; }
          .stats-table td { font-size: 0.75rem !important; padding: 8px !important; }
          .recent-item { font-size: 0.75rem !important; }
        }
      `}} />

      <h1 className="stats-main-title">
        📊 GURU LIVE MONITOR
      </h1>
      
      <div className="stats-grid" style={{ marginTop: '30px' }}>
        
        {/* LEVÝ SLOUPEC: TOP STRÁNKY */}
        <div className="stats-panel">
          <h2>🔥 {isEn ? 'Top Sections' : 'Nejsledovanější sekce'}</h2>
          <table className="stats-table">
            <thead>
              <tr>
                <th>{isEn ? 'Path' : 'Cesta'}</th>
                <th>{isEn ? 'Visits' : 'Návštěvy'}</th>
              </tr>
            </thead>
            <tbody>
              {topPages?.map((p, i) => (
                <tr key={i}>
                  <td style={{ wordBreak: 'break-all', color: '#d1d5db' }}>{p.path}</td>
                  <td style={{ fontWeight: 'bold', color: '#66fcf1', textAlign: 'right' }}>{p.views}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PRAVÝ SLOUPEC: POSLEDNÍ AKTIVITA */}
        <div className="stats-panel">
          <h2>🕒 {isEn ? 'Last 50 Visits' : 'Posledních 50 návštěv'}</h2>
          <div className="recent-scroll">
            {recentViews?.map(view => (
              <div key={view.id} className="recent-item">
                <span style={{ color: '#d1d5db', wordBreak: 'break-all', paddingRight: '10px' }}>{view.page_path}</span>
                <span style={{ color: '#45a29e', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                  {new Date(view.viewed_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      <footer style={{ marginTop: '30px', padding: '20px 0', borderTop: '1px solid rgba(69, 162, 158, 0.1)' }}>
        <p style={{ fontSize: '0.8rem', color: '#45a29e', margin: 0 }}>
          {isEn 
            ? 'Data is pulled directly from Supabase. Each refresh loads fresh information.' 
            : 'Data jsou brána přímo z tvé Supabase. Každý refresh stránky načte čerstvé info.'}
        </p>
      </footer>
    </div>
  );
}
