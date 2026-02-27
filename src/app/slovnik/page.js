import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SlovnikPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: pojmy } = await supabase
    .from('slovnik')
    .select('*')
    .order('title', { ascending: true });

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <style>{`
        .term-card { 
          background: rgba(31, 40, 51, 0.6); 
          border: 1px solid #45a29e; 
          padding: 25px; 
          border-radius: 12px; 
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          /* TADY JE TA OPRAVA PŘETÉKÁNÍ: */
          box-sizing: border-box;
          min-height: 100%; 
        }
        .term-card:hover { 
          border-color: #66fcf1; 
          box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); 
          transform: translateY(-5px);
          background: rgba(31, 40, 51, 0.8);
        }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .social-btn { padding: 10px 20px; text-decoration: none; font-weight: 900; border-radius: 5px; text-transform: uppercase; transition: transform 0.2s; }
        .social-btn:hover { transform: scale(1.05); }
      `}</style>

      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1' }}>
          THE HARDWARE GURU
        </Link>
        <Link href="/" className="nav-link">ZPĚT NA WEB</Link>
      </nav>

      {/* Přidán boxSizing i na main, pro jistotu */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>
                GURU HARDWARE <span style={{ color: '#66fcf1' }}>SLOVNÍK</span>
            </h1>
            <p style={{ color: '#45a29e', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                🛠️ Stručně a jasně vysvětlené pojmy od servisáka s 20letou praxí.
            </p>
        </div>

        {/* Zvětšil jsem 'gap' na 30px pro lepší dýchání boxů */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', alignItems: 'stretch' }}>
          {pojmy?.map((pojem) => (
            <Link key={pojem.id} href={`/slovnik/${pojem.slug}`} className="term-card">
              <h2 style={{ color: '#66fcf1', margin: '0 0 15px 0', fontSize: '1.3rem', textTransform: 'uppercase', fontWeight: '800' }}>
                {pojem.title}
              </h2>
              {/* Odstraněno ořezávání (...), takže teď hezky uvidíš celé texty */}
              <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, flexGrow: 1 }}>
                {pojem.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer style={{ padding: '40px 20px', background: 'rgba(11, 12, 16, 0.98)', borderTop: '1px solid #45a29e', textAlign: 'center', marginTop: '60px' }}>
        <h2 style={{ color: '#66fcf1', marginBottom: '15px', textTransform: 'uppercase', fontWeight: '900' }}>O mně</h2>
        <p style={{ color: '#c5c6c7', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
          Jsem servisák s 20letou praxí a hardware nadšenec. Streamuju, testuju, opravuju a teď i trénuju AI, aby ti pomohla s výběrem toho nejlepšího železa.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn" style={{ background: '#53fc18', color: '#000' }}>KICK STREAM</a>
          <a href="https://youtube.com/@thehardwareguru" target="_blank" rel="noreferrer" className="social-btn" style={{ background: '#ff0000', color: '#fff' }}>YOUTUBE</a>
          <a href="https://discord.gg/tvoje-discord-id" target="_blank" rel="noreferrer" className="social-btn" style={{ background: '#5865F2', color: '#fff' }}>DISCORD</a>
        </div>
      </footer>
    </div>
  );
}
