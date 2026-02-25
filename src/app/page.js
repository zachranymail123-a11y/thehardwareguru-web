import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme články
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  // Pomocná funkce na odstranění HTML značek pro náhled textu
  const stripHtml = (html) => {
    return html.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      
      {/* --- HERO SECTION / HLAVIČKA --- */}
      <div style={{ 
        background: 'linear-gradient(180deg, rgba(20,0,0,1) 0%, rgba(5,5,5,1) 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #333',
        boxShadow: '0 0 50px rgba(255,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: '900', 
          margin: '0', 
          textTransform: 'uppercase', 
          letterSpacing: '-2px',
          background: '-webkit-linear-gradient(#fff, #666)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.3))'
        }}>
          THE HARDWARE GURU
        </h1>
        <p style={{ color: '#ff0000', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '3px', marginTop: '10px', textTransform: 'uppercase' }}>
          Tech • Gaming • Reviews
        </p>

        {/* SOCIÁLNÍ TLAČÍTKA - DESIGN */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px', flexWrap: 'wrap' }}>
          <SocialButton href="https://kick.com/thehardwareguru" color="#05ff5b" text="KICK STREAM" />
          <SocialButton href="https://www.youtube.com/@TheHardwareGuru_Czech" color="#ff0000" text="YOUTUBE" />
          <SocialButton href="https://discord.com/invite/n7xThr8" color="#5865F2" text="DISCORD" />
          <SocialButton href="https://www.instagram.com/thehardwareguru_czech/" color="#E1306C" text="INSTAGRAM" />
        </div>
      </div>

      {/* --- GRID S ČLÁNKY --- */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderLeft: '4px solid #ff0000', paddingLeft: '15px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#fff' }}>NEJNOVĚJŠÍ CONTENT</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '30px' 
        }}>
          {posts?.map((post) => {
            const linkSlug = post.slug.replace('.html', '').replace(/-+/g, '-').replace(/^-|-$/g, '');
            
            return (
              <Link key={post.id} href={`/clanky/${linkSlug}`} style={{ textDecoration: 'none' }}>
                <article style={{ 
                  background: '#111', 
                  borderRadius: '12px', 
                  border: '1px solid #222', 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                className="hover-card" // Třída pro efekty, viz styl dole
                >
                  <div style={{ padding: '25px', flexGrow: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#ff0000', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                      {new Date(post.created_at).toLocaleDateString('cs-CZ')}
                    </div>
                    <h3 style={{ 
                      color: '#fff', 
                      fontSize: '1.4rem', 
                      fontWeight: '700', 
                      lineHeight: '1.4', 
                      marginBottom: '15px',
                      textTransform: 'uppercase' 
                    }}>
                      {post.title}
                    </h3>
                    <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {stripHtml(post.content)}
                    </p>
                  </div>
                  
                  <div style={{ 
                    padding: '15px 25px', 
                    background: '#1a1a1a', 
                    borderTop: '1px solid #222',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>PŘEHRÁT VIDEO</span>
                    <span style={{ color: '#ff0000', fontSize: '1.2rem' }}>→</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {(!posts || posts.length === 0) && (
             <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
               <h2>Zatím žádný obsah</h2>
               <p>Spusť cron pro načtení videí.</p>
             </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '60px 20px', 
        background: '#0a0a0a', 
        borderTop: '1px solid #222', 
        marginTop: '80px',
        color: '#444'
      }}>
        <p style={{ fontWeight: 'bold', color: '#666' }}>THE HARDWARE GURU &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

// Komponenta pro tlačítka (aby byl kód čistší)
function SocialButton({ href, color, text }) {
  return (
    <a href={href} target="_blank" style={{
      background: 'rgba(255,255,255,0.05)',
      color: '#fff',
      padding: '12px 25px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '0.9rem',
      border: `1px solid ${color}`,
      boxShadow: `0 0 10px ${color}20`, // jemný glow
      display: 'inline-block',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      <span style={{ color: color, marginRight: '8px' }}>●</span> {text}
    </a>
  );
}
