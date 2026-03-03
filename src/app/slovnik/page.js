import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, Lightbulb, Book, PenTool, ChevronRight } from 'lucide-react';

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
        fontFamily: 'sans-serif',
        color: '#fff',
        backgroundColor: '#0a0b0d',
        backgroundImage: 'url("/bg-guru.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <style>{`
        .term-card { 
            background: rgba(17, 19, 24, 0.85); 
            backdrop-filter: blur(10px);
            border: 1px solid rgba(168, 85, 247, 0.3); 
            padding: 30px; 
            border-radius: 28px; 
            transition: all 0.3s ease; 
            text-decoration: none; 
            color: inherit; 
            display: flex; 
            flex-direction: column; 
            box-sizing: border-box; 
        }
        .term-card:hover { 
            border-color: #a855f7; 
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.2); 
            transform: translateY(-5px); 
        }
        .nav-link { 
            color: #fff; 
            text-decoration: none; 
            font-weight: bold; 
            transition: 0.2s; 
            font-size: 13px; 
            display: flex; 
            align-items: center; 
            gap: 8px;
        }
        .nav-link:hover { color: #a855f7; }
        .social-btn { 
            padding: 8px 16px; 
            text-decoration: none; 
            font-weight: bold; 
            border-radius: 12px; 
            transition: 0.3s; 
            font-size: 11px; 
            display: inline-block; 
            border: 1px solid currentColor;
        }
        .social-btn:hover { transform: scale(1.05); }
        @media (max-width: 768px) {
          .nav-container { flex-direction: column; gap: 15px; padding: 20px !important; }
        }
      `}</style>

      {/* --- HLAVNÍ GLOBÁLNÍ NAVIGACE --- */}
      <nav className="nav-container" style={{ 
        padding: '20px 40px', 
        background: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Link href="/" className="nav-link"><Home size={18} /> HOMEPAGE</Link>
        <Link href="/tipy" className="nav-link"><Lightbulb size={18} /> TIPY</Link>
        <Link href="/slovnik" className="nav-link" style={{color: '#a855f7'}}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" className="nav-link"><PenTool size={18} /> PRAKTICKÉ RADY</Link>
      </nav>

      {/* --- SOCIAL & SUPPORT BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '30px 20px' }}>
        <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18' }}>KICK</a>
        <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000' }}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2' }}>DISCORD</a>
        <a href="/support" className="social-btn" style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.1)' }}>SUPPORT</a>
      </div>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                GURU HARDWARE <span style={{ color: '#a855f7' }}>SLOVNÍK</span>
            </h1>
            <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>Tvé technické znalosti začínají zde.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {pojmy?.map((pojem) => (
            <Link key={pojem.id} href={`/slovnik/${pojem.slug}`} className="term-card">
              <h2 style={{ color: '#a855f7', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>
                {pojem.title}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0', flexGrow: 1 }}>
                {pojem.description.length > 140 
                  ? pojem.description.substring(0, 140) + '...' 
                  : pojem.description}
              </p>
              <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Zobrazit detail <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* --- SEKCE O MNĚ --- */}
      <footer style={{ 
        padding: '80px 20px', 
        background: 'rgba(0, 0, 0, 0.8)', 
        borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
        textAlign: 'center', 
        marginTop: '80px' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '25px', textTransform: 'uppercase', fontWeight: '900', fontSize: '32px' }}>O projektu</h2>
          <p style={{ lineHeight: '1.8', fontSize: '17px', color: '#d1d5db', marginBottom: '40px' }}>
            Vítej ve světě <strong>The Hardware Guru</strong>! Jsem tvůj průvodce moderní technologií a hardwarem. 
            Moje mise je jednoduchá: pomáhat ti stavět lepší PC a chápat složité pojmy. 
            Najdeš mě pravidelně na streamu, kde společně tvoříme nejsilnější tech komunitu.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#53fc18', padding: '12px 25px' }}>KICK STREAM</a>
            <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#ff0000', padding: '12px 25px' }}>YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ color: '#5865F2', padding: '12px 25px' }}>DISCORD</a>
          </div>
          
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    </div>
  );
}
