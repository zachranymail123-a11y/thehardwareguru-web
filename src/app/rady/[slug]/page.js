import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Home, Lightbulb, Book, PenTool, ChevronLeft, Heart, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function generateMetadata({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: rada } = await supabase.from('rady').select('*').eq('slug', slug).single();
  if (!rada) return { title: 'Návod nenalezen | The Hardware Guru' };
  return { title: `${rada.title} | Praktické rady Guru` };
}

export default async function RadaDetailPage({ params }) {
  const { slug } = params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: rada } = await supabase.from('rady').select('*').eq('slug', slug).single();

  const { data: dalsiRady } = await supabase
    .from('rady')
    .select('*')
    .neq('slug', slug)
    .limit(3);

  if (!rada) {
    return (
      <div style={{ color: '#fff', padding: '100px', textAlign: 'center', background: '#0a0b0d', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900' }}>404 🧩</h1>
        <p>Tento návod v Guru archivech neexistuje.</p>
        <Link href="/rady" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none' }}>Zpět na seznam rad</Link>
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
        <Link href="/" style={navLinkStyle}><Home size={18} /> HOMEPAGE</Link>
        <Link href="/tipy" style={navLinkStyle}><Lightbulb size={18} /> TIPY</Link>
        <Link href="/slovnik" style={navLinkStyle}><Book size={18} /> SLOVNÍK</Link>
        <Link href="/rady" style={{...navLinkStyle, color: '#a855f7'}}><PenTool size={18} /> PRAKTICKÉ RADY</Link>
      </nav>

      {/* --- SOCIAL & SUPPORT BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '30px 20px' }}>
        <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#53fc18')}>KICK</a>
        <a href="https://youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#ff0000')}>YOUTUBE</a>
        <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" style={socialBtnStyle('#5865F2')}>DISCORD</a>
        <a href="/support" style={socialBtnStyle('#eab308', true)}>SUPPORT</a>
      </div>

      <main style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Link href="/rady" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px' }}>
          <ChevronLeft size={18} /> ZPĚT NA SEZNAM RAD
        </Link>
        
        <div style={{ background: 'rgba(17, 19, 24, 0.85)', backdropFilter: 'blur(15px)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '50px', borderRadius: '35px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <h1 style={{ color: '#a855f7', fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '25px', fontWeight: '900', textTransform: 'uppercase' }}>
            {rada.title}
          </h1>
          <div style={{ fontSize: '19px', lineHeight: '1.8', color: '#e5e7eb', whiteSpace: 'pre-wrap' }}>
            {rada.description}
          </div>

          {/* SUPPORT SEKCE */}
          <div style={{ 
            marginTop: '80px', 
            padding: '40px', 
            background: 'rgba(234, 179, 8, 0.05)', 
            borderRadius: '28px', 
            border: '1px solid rgba(234, 179, 8, 0.3)', 
            textAlign: 'center' 
          }}>
            <ShieldCheck size={40} color="#eab308" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#eab308', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Pomohl ti tento návod?</h3>
            <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Pokud ti tento tip pomohl nebo ses dozvěděl něco úplně nového, zvaž podporu projektu <strong>The Hardware Guru</strong>. Každá podpora nám pomáhá udržet provoz serveru a všech služeb v provozu. Děkujeme za každý dar!
            </p>
            <a href="/support" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#eab308', color: '#000', padding: '16px 30px', borderRadius: '15px', fontWeight: '900', textDecoration: 'none' }}>
              <Heart size={20} fill="#000" /> PODPOŘIT PROJEKT
            </a>
          </div>
        </div>

        {/* NÁVRHY DALŠÍCH RAD */}
        <div style={{ marginTop: '100px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', textAlign: 'center', opacity: 0.8 }}>DALŠÍ PRAKTICKÉ RADY</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {dalsiRady?.map((item) => (
              <Link href={`/rady/${item.slug}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ 
                  background: 'rgba(17, 19, 24, 0.6)', 
                  borderRadius: '24px', 
                  padding: '25px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <PenTool size={20} color="#a855f7" style={{ marginBottom: '15px' }} />
                  <h4 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0, lineHeight: '1.3' }}>{item.title}</h4>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>

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

// STYLY PRO SERVEROVOU KOMPONENTU
const navLinkStyle = { color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' };
const socialBtnStyle = (color, isSup = false) => ({ color, textDecoration: 'none', fontWeight: 'bold', fontSize: '11px', border: `1px solid ${color}`, padding: '8px 16px', borderRadius: '12px', background: isSup ? `${color}1a` : 'transparent' });
