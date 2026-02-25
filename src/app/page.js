import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  const getExcerpt = (html) => {
    const text = html.replace(/<[^>]*>?/gm, '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      
      {/* --- NAVIGACE --- */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '15px 40px', background: '#0b0c10', borderBottom: '1px solid #1f2833',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#66fcf1', textTransform: 'uppercase' }}>
          TheHardwareGuru
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
        background: 'radial-gradient(circle at center, #1f2833 0%, #0b0c10 100%)',
        padding: '100px 20px', textAlign: 'center', borderBottom: '2px solid #66fcf1'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '900', color: '#fff', margin: '0 0 20px 0' }}>
          THE HARDWARE <span style={{ color: '#66fcf1' }}>GURU</span>
        </h1>
        
        {/* VELKÁ OVÁLNÁ TLAČÍTKA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px', flexWrap: 'wrap' }}>
          <SocialPill href="https://kick.com/thehardwareguru" color="#53fc18" text="LIVE NA KICKU" />
          <SocialPill href="https://www.youtube.com/@TheHardwareGuru_Czech" color="#ff0000" text="YOUTUBE KANÁL" />
          <SocialPill href="https://discord.com/invite/n7xThr8" color="#5865F2" text="DISCORD SERVER" />
          <SocialPill href="https://www.instagram.com/thehardwareguru_czech/" color="#E1306C" text="INSTAGRAM" />
        </div>
      </header>

      {/* --- SEKCE O MNĚ (VYLEPŠENÁ) --- */}
      <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
        <div style={{ 
          background: '#1f2833', padding: '40px', borderRadius: '20px', 
          border: '1px solid #66fcf1', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center',
          boxShadow: '0 0 20px rgba(102, 252, 241, 0.1)'
        }}>
          <div style={{ 
            width: '180px', height: '180px', borderRadius: '50%', background: '#0b0c10', 
            border: '4px solid #66fcf1', flexShrink: 0, margin: '0 auto',
            backgroundImage: 'url("https://github.com/shadcn.png")', backgroundSize: 'cover'
          }}></div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: '#66fcf1', fontSize: '2.2rem', marginBottom: '15px', textTransform: 'uppercase' }}>Kdo je TheHardwareGuru?</h2>
            <p style={{ lineHeight: '1.7', fontSize: '1.15rem', color: '#fff' }}>
              Jsem <strong>45letý chill gamer, ministreamer a HW nadšenec</strong>. Můj stream není jen o hraní, je to o technologiích a komunitě. 
            </p>
            <div style={{ 
              marginTop: '20px', padding: '15px', background: 'rgba(102, 252, 241, 0.1)', 
              borderLeft: '4px solid #66fcf1', borderRadius: '0 10px 10px 0' 
            }}>
              <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic', color: '#66fcf1' }}>
                <strong>UNIKÁT:</strong> Na mém streamu v chatu potkáte <strong>umělou inteligenci</strong>, která se chová jako skutečný divák. Komunikuje s ostatními, glosuje gameplay a žije vlastním životem. <strong>Tohle v CZ/SK komunitě jinde neuvidíte!</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- GRID ČLÁNKŮ --- */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px 100px 20px' }}>
        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', marginBottom: '40px', textAlign: 'center' }}>
          POSLEDNÍ <span style={{ color: '#66fcf1' }}>UPDATE</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {posts?.map((post) => {
            const linkSlug = post.slug.replace('.html', '').replace(/-+/g, '-').replace(/^-|-$/g, '');
            return (
              <Link key={post.id} href={`/clanky/${linkSlug}`} style={{ textDecoration: 'none' }}>
                <article style={{ 
                  background: '#1f2833', borderRadius: '15px', overflow: 'hidden', 
                  border: '1px solid #333', transition: '0.3s'
                }}>
                  <div style={{ height: '200px', background: '#0b0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #66fcf1' }}>
                    <span style={{ fontSize: '4rem' }}>🖥️</span>
                  </div>
                  <div style={{ padding: '25px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px' }}>{post.title}</h3>
                    <p style={{ color: '#a0a0a0', fontSize: '0.95rem' }}>{getExcerpt(post.content)}</p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Komponenta pro velká oválná tlačítka
function SocialPill({ href, color, text }) {
  return (
    <a href={href} target="_blank" style={{
      background: 'transparent',
      color: '#fff',
      padding: '12px 30px',
      borderRadius: '50px', // Oválný tvar
      textDecoration: 'none',
      fontWeight: 'bold',
      border: `2px solid ${color}`,
      transition: '0.3s',
      display: 'inline-block',
      fontSize: '0.95rem',
      letterSpacing: '1px'
    }}>
      <span style={{ color: color, marginRight: '10px' }}>●</span> {text}
    </a>
  );
}
