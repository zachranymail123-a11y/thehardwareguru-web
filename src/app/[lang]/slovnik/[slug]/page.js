import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, Lightbulb, Book, PenTool, ChevronLeft, Heart, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: term } = await supabase.from('slovnik').select('*').eq('slug', slug).single();
  if (!term) return { title: 'Pojem nenalezen | The Hardware Guru' };
  return { title: `${term.title} – Co to je? | Guru Slovník` };
}

export default async function DictionaryTermPage({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: term } = await supabase.from('slovnik').select('*').eq('slug', slug).single();

  if (!term) {
    return (
      <div style={{ color: '#fff', padding: '100px', textAlign: 'center', background: '#0a0b0d', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900' }}>404 🧩</h1>
        <p>Tento pojem v Guru databázi zatím nemáme.</p>
        <Link href="/slovnik" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>Zpět do slovníku</Link>
      </div>
    );
  }

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
        .nav-link { color: #fff; text-decoration: none; font-weight: bold; transition: 0.2s; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .nav-link:hover { color: #a855f7; }
        .social-btn { padding: 8px 16px; text-decoration: none; font-weight: bold; border-radius: 12px; transition: 0.3s; font-size: 11px; display: inline-block; border: 1px solid currentColor; }
        .social-btn:hover { transform: scale(1.05); }
        .term-container { background: rgba(17, 19, 24, 0.85); backdrop-filter: blur(15px); border: 1px solid rgba(168, 85, 247, 0.2); padding: 50px; border-radius: 35px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
      `}</style>

      {/* --- GLOBÁLNÍ NAVIGACE --- */}
      <nav style={{ 
        padding: '20px 40px', 
        background: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex', 
        justifyContent: 'center', 
        gap: '25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        flexWrap: 'wrap'
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

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Link href="/slovnik" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px' }}>
          <ChevronLeft size={18} /> ZPĚT DO SLOVNÍKU
        </Link>
        
        <div className="term-container">
          <h1 style={{ color: '#a855f7', fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase' }}>
            {term.title}
          </h1>
          <div style={{ fontSize: '19px', lineHeight: '1.8', color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>
            {term.description}
          </div>

          {/* SUPPORT SEKCE */}
          <div style={{ 
            marginTop: '60px', 
            padding: '40px', 
            background: 'rgba(234, 179, 8, 0.05)', 
            borderRadius: '28px', 
            border: '1px solid rgba(234, 179, 8, 0.3)', 
            textAlign: 'center' 
          }}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Pomohl ti tento výklad?</h3>
            <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              Pokud ti Guru Slovník osvětlil technické pojmy, zvaž podporu projektu <strong>The Hardware Guru</strong>. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme!
            </p>
            <a href="/support" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
              <Heart size={20} fill="#000" /> PODPOŘIT PROJEKT
            </a>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer style={{ 
        padding: '60px 20px', 
        background: 'rgba(0, 0, 0, 0.8)', 
        borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
        textAlign: 'center', 
        marginTop: '80px' 
      }}>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          © {new Date().getFullYear()} THE HARDWARE GURU. Všechna práva vyhrazena.
        </p>
      </footer>
    </div>
  );
}
