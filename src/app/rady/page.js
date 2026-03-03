import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, Lightbulb, Book, PenTool, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RadyPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: rady } = await supabase
    .from('rady')
    .select('*')
    .order('created_at', { ascending: false });

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
        zIndex: 1000
      }}>
        <Link href="/" style={navLinkStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/tipy" style={navLinkStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/slovnik" style={navLinkStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={{...navLinkStyle, color: '#a855f7'}}><PenTool size={18} /> PRAKTICKÉ RADY</Link>
      </nav>

      {/* --- SOCIAL & SUPPORT BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '30px 20px' }}>
        <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
        <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
        <a href="/support" style={socialBtnStyle('#eab308', true)}>SUPPORT</a>
      </div>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                PRAKTICKÉ <span style={{ color: '#a855f7' }}>RADY</span>
            </h1>
            <p style={{ marginTop: '15px', color: '#9ca3af', fontWeight: '600', fontSize: '18px' }}>
              🛠️ Tipy a triky z praxe. Od diagnostiky až po čištění PC.
            </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '35px' }}>
          {rady?.map((rada) => (
            <Link key={rada.id} href={`/rady/${rada.slug}`} style={cardStyle}>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '20px' }}>
                <PenTool size={24} color="#a855f7" />
              </div>
              <h2 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '24px', fontWeight: '900' }}>
                {rada.title}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 25px 0', flexGrow: 1 }}>
                {rada.description.length > 140 
                  ? rada.description.substring(0, 140) + '...' 
                  : rada.description}
              </p>
              <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ZOBRAZIT NÁVOD <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer style={{ 
        padding: '80px 20px', 
        background: 'rgba(0, 0, 0, 0.8)', 
        borderTop: '1px solid rgba(168, 85, 247, 0.2)', 
        textAlign: 'center', 
        marginTop: '80px' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#a855f7', marginBottom: '25px', textTransform: 'uppercase', fontWeight: '900', fontSize: '32px' }}>O mně</h2>
          <p style={{ lineHeight: '1.8', fontSize: '17px', color: '#d1d5db', marginBottom: '40px' }}>
            Vítej ve světě <strong>The Hardware Guru</strong>! Jsem tvůj průvodce moderní technologií, hardwarem a gamingem. 
            Tato sekce rad vznikla proto, aby ses i ty stal pánem svého hardwaru.
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU.
          </p>
        </div>
      </footer>
    </div>
  );
}

// POMOCNÉ STYLY ABYCHOM NEPOUŽÍVALI INTERAKTIVNÍ <STYLE> TAG V SERVER COMPONENT
const navLinkStyle = { color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' };
const socialBtnStyle = (color, isSup = false) => ({ color, textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: `1px solid ${color}`, padding: '8px 16px', borderRadius: '12px', background: isSup ? `${color}1a` : 'transparent' });
const cardStyle = { background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '35px', borderRadius: '28px', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' };
