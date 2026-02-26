import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WikiPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Načteme pojmy seřazené podle abecedy
  const { data: terms } = await supabase
    .from('wiki')
    .select('*')
    .order('term', { ascending: true });

  return (
    <div style={{ 
        minHeight: '100vh', 
        color: '#c5c6c7',
        backgroundColor: '#0b0c10',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <style>{`
        .wiki-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 20px 0; }
        .term-card { 
            background: rgba(31, 40, 51, 0.5); 
            border: 1px solid #45a29e; 
            padding: 20px; 
            border-radius: 8px; 
            transition: all 0.3s;
        }
        .term-card:hover { border-color: #66fcf1; background: rgba(31, 40, 51, 0.8); transform: translateY(-3px); }
        .term-title { color: #66fcf1; font-weight: 900; fontSize: 1.4rem; margin-bottom: 10px; text-transform: uppercase; }
        .term-def { line-height: 1.6; font-size: 0.95rem; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; text-transform: uppercase; }
      `}</style>

      {/* NAVIGACE */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: '#0b0c10', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textDecoration: 'none' }}>THE HARDWARE GURU</Link>
        <div>
            <Link href="/" className="nav-link">DOMŮ</Link>
            <Link href="/sestavy" className="nav-link">SESTAVY</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#ff4444'}}>KICK LIVE</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>
          GURU HARDWARE <span style={{color: '#66fcf1'}}>SLOVNÍK</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#45a29e', marginBottom: '40px' }}>
          Stručně a jasně vysvětlené pojmy, které by měl znát každý pořádný hráč.
        </p>

        <div className="wiki-grid">
          {terms?.map((t) => (
            <div key={t.id} className="term-card">
              <div className="term-title">{t.term}</div>
              <div className="term-def">{t.definition}</div>
            </div>
          ))}
        </div>

        {(!terms || terms.length === 0) && (
            <div style={{ textAlign: 'center', padding: '100px 0', border: '1px dashed #45a29e', borderRadius: '8px' }}>
                <p>Slovník se právě plní vědomostmi... První pojmy dorazí brzy!</p>
            </div>
        )}

        <div style={{ marginTop: '80px', textAlign: 'center', padding: '40px', background: 'rgba(102, 252, 241, 0.05)', borderRadius: '12px', border: '1px solid #45a29e' }}>
            <h3 style={{ color: '#fff' }}>Nerozumíš nějakému termínu?</h3>
            <p>Doraž na stream, zeptej se live a já to do slovníku přidám!</p>
            <a href="https://kick.com/thehardwareguru" target="_blank" style={{ display: 'inline-block', padding: '12px 30px', background: '#53fc18', color: '#000', fontWeight: 'bold', textDecoration: 'none', borderRadius: '4px', marginTop: '10px' }}>
                ZAPNOUT KICK LIVE
            </a>
        </div>
      </div>
    </div>
  );
}
