import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme články (limit 6, aby to vypadalo hezky v mřížce)
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  // Pomocná funkce pro vyčištění textu do náhledu
  const getExcerpt = (html) => {
    const text = html.replace(/<[^>]*>?/gm, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* --- 1. NAVIGACE (Horní lišta) --- */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 40px', background: 'rgba(11, 12, 16, 0.95)', borderBottom: '1px solid #1f2833',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textTransform: 'uppercase', letterSpacing: '-1px' }}>
          TheHardwareGuru
        </div>
        
        {/* Sociální ikonky vpravo nahoře */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <SocialIcon href="https://kick.com/thehardwareguru" color="#53fc18" label="K" />
          <SocialIcon href="https://www.youtube.com/@TheHardwareGuru_Czech" color="#ff0000" label="YT" />
          <SocialIcon href="https://discord.com/invite/n7xThr8" color="#5865F2" label="DC" />
          <SocialIcon href="https://www.instagram.com/thehardwareguru_czech/" color="#E1306C" label="IG" />
        </div>
      </nav>

      {/* --- 2. HERO SECTION (To hlavní nahoře) --- */}
      <header style={{ 
        background: 'linear-gradient(135deg, #1f2833 0%, #0b0c10 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #66fcf1',
        boxShadow: '0 0 30px rgba(102, 252, 241, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', fontWeight: '800', color: '#fff', margin: '0 0 20px 0', lineHeight: '1.2'
        }}>
          Vítejte na oficiální stránce <br />
          <span style={{ color: '#66fcf1' }}>TheHardwareGuru!</span>
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 40px auto', color: '#a0a0a0' }}>
          Vaše centrum pro herní hardware, recenze a živé streamy. 
          Jsem tu pro všechny, kteří chtějí hrát lépe a na lepším železe.
        </p>
        
        <a href="https://kick.com/thehardwareguru" target="_blank" style={{
          background: 'transparent',
          color: '#66fcf1',
          padding: '15px 40px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          border: '2px solid #66fcf1',
          borderRadius: '5px',
          textDecoration: 'none',
          boxShadow: '0 0 15px rgba(102, 252, 241, 0.4)',
          transition: 'all 0.3s ease',
          display: 'inline-block'
        }}>
          Sledujte mě na Stream Kick!
        </a>
      </header>

      {/* --- 3. SEKCE "O MNĚ" (Podle návrhu) --- */}
      <section style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
        {/* Místo pro fotku - zatím šedý kruh, časem tam dáme tvoji fotku */}
        <div style={{ 
          width: '150px', height: '150px', borderRadius: '50%', background: '#1f2833', 
          border: '3px solid #66fcf1', flexShrink: 0, margin: '0 auto',
          backgroundImage: 'url("https://github.com/shadcn.png")', // Zástupný avatar
          backgroundSize: 'cover'
        }}></div>
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ color: '#66fcf1', fontSize: '2rem', marginBottom: '15px' }}>O mně</h2>
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            Ahoj pařani! Jsem TheHardwareGuru, vášnivý streamer a recenzent herního hardwaru. 
            Najdete zde vše od nejnovějších GPU recenzí po epické maratony mých oblíbených her 
            jako Cyberpunk 2077 a Apex Legends. Připoj se ke komunitě!
          </p>
        </div>
      </section>

      {/* --- 4. NEJNOVĚJŠÍ OBSAH (Mřížka karet) --- */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px 80px 20px' }}>
        <h2 style={{ 
          color: '#66fcf1', fontSize: '2.5rem', fontWeight: 'bold', 
          borderLeft: '5px solid #66fcf1', paddingLeft: '20px', marginBottom: '40px' 
        }}>
          Nejnovější obsah
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '30px' 
        }}>
          {posts?.map((post) => {
            const linkSlug = post.slug.replace('.html', '').replace(/-+/g, '-').replace(/^-|-$/g, '');
            
            return (
              <Link key={post.id} href={`/clanky/${linkSlug}`} style={{ textDecoration: 'none' }}>
                <article style={{ 
                  background: '#1f2833', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  transition: 'transform 0.3s',
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                  border: '1px solid #333'
                }}>
                  {/* Falešný thumbnail (protože zatím nemáme obrázky v DB) */}
                  <div style={{ 
                    height: '180px', 
                    background: 'linear-gradient(45deg, #0b0c10, #2c3e50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderBottom: '2px solid #66fcf1'
                  }}>
                    <span style={{ fontSize: '3rem' }}>🎮</span>
                  </div>

                  <div style={{ padding: '20px', flexGrow: 1 }}>
                    <div style={{ color: '#45a29e', fontSize: '0.85rem', marginBottom: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {new Date(post.created_at).toLocaleDateString('cs-CZ')} • NOVINKA
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', lineHeight: '1.4' }}>
                      {post.title}
                    </h3>
                    <p style={{ color: '#c5c6c7', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {getExcerpt(post.content)}
                    </p>
                  </div>
                  
                  <div style={{ padding: '15px 20px', background: '#0b0c10', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <span style={{color: '#66fcf1'}}>▶</span> <span style={{color:'#fff', fontSize:'0.9rem'}}>Přehrát video</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {(!posts || posts.length === 0) && (
             <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
               <h3>Zatím žádná data</h3>
               <p>Spusť cron pro načtení videí.</p>
             </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer style={{ 
        textAlign: 'center', padding: '40px', background: '#050505', borderTop: '1px solid #1f2833', color: '#666'
      }}>
        &copy; {new Date().getFullYear()} TheHardwareGuru. Všechna práva vyhrazena.
      </footer>
    </div>
  );
}

// Komponenta pro malou sociální ikonku
function SocialIcon({ href, color, label }) {
  return (
    <a href={href} target="_blank" style={{
      width: '35px', height: '35px', borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.8rem'
    }}>
      {label}
    </a>
  );
}
