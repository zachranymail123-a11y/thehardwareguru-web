import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WikiPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. ZAPOČÍTÁME NÁVŠTĚVU (Standardní volání bez .catch, které dělalo bordel)
  await supabase.rpc('increment_stat', { stat_name: 'wiki_views' });

  // 2. STÁHNEME DATA
  const [{ data: terms }, { data: stats }] = await Promise.all([
    supabase.from('wiki').select('*').order('term', { ascending: true }),
    supabase.from('stats').select('value').eq('name', 'wiki_views').single()
  ]);

  const views = stats?.value || 0;

  return (
    <div style={{ 
        minHeight: '100vh', 
        color: '#c5c6c7',
        backgroundColor: '#0b0c10',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{`
        .wiki-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; padding: 20px 0; }
        .term-card { 
            background: rgba(31, 40, 51, 0.4); 
            border: 1px solid #45a29e; 
            padding: 25px; 
            border-radius: 10px; 
            transition: all 0.3s;
        }
        .term-card:hover { border-color: #66fcf1; background: rgba(31, 40, 51, 0.7); transform: translateY(-3px); box-shadow: 0 0 15px rgba(102, 252, 241, 0.1); }
        .term-title { color: #66fcf1; font-weight: 900; fontSize: 1.5rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .term-def { line-height: 1.7; font-size: 1rem; color: #e0e0e0; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .nav-link:hover { color: #66fcf1; }
      `}</style>

      {/* NAVIGACE */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(11, 12, 16, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textDecoration: 'none' }}>THE HARDWARE GURU</Link>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" className="nav-link">DOMŮ</Link>
            <Link href="/sestavy" className="nav-link">SESTAVY</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#ff4444'}}>KICK LIVE</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '3rem', fontWeight: '900', marginBottom: '15px', textTransform: 'uppercase' }}>
          GURU HARDWARE <span style={{color: '#66fcf1'}}>SLOVNÍK</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#45a29e', marginBottom: '50px', fontSize: '1.2rem', fontWeight: '500' }}>
          🛠️ Stručně a jasně vysvětlené pojmy od servisáka s 20letou praxí.
        </p>

        <div className="wiki-grid">
          {terms?.map((t) => (
            <div key={t.id} className="term-card">
              <div className="term-title">{t.term}</div>
              <div className="term-def">{t.definition}</div>
            </div>
          ))}
        </div>

        {/* POČÍTADLO ZOBRAZENÍ */}
        <div style={{ textAlign: 'center', marginTop: '60px', color: '#45a29e', fontSize: '1rem', borderTop: '1px solid rgba(69, 162, 158, 0.3)', paddingTop: '30px' }}>
            VĚDOMOSTI ZDE ČERPALO JIŽ <strong style={{color: '#fff'}}>{views}</strong> GURU FANOUŠKŮ 🧠
        </div>

        <div style={{ marginTop: '80px', textAlign: 'center', padding: '50px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.6), rgba(11, 12, 16, 0.8))', borderRadius: '15px', border: '1px solid #45a29e' }}>
            <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '15px' }}>Nerozumíš nějakému termínu?</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '25px' }}>Doraž na stream, hoď dotaz do placu a já to sem osobně doplním!</p>
            <a href="https://kick.com/thehardwareguru" target="_blank" style={{ display: 'inline-block', padding: '15px 40px', background: '#53fc18', color: '#0b0c10', fontWeight: '900', textDecoration: 'none', borderRadius: '5px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s' }}>
                ZAPNOUT KICK LIVE
            </a>
        </div>
      </div>
    </div>
  );
}
