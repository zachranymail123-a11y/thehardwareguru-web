import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// TOTO TAM CHYBĚLO: Vypne veškerou paměť serveru. Musí to být 0.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Používám přesně stejný způsob načtení proměnných jako v diagnostice
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Stáhneme data
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Funkce pro náhledovku
  const getThumbnail = (post) => {
    if (post.video_id && post.video_id.length > 5) {
        return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid #45a29e; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
      `}</style>

      {/* HLAVIČKA S ODKAZY */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: '#1f2833', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="nav-link">INSTAGRAM</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* BIO */}
      <header style={{ maxWidth: '1200px', margin: '60px auto', padding: '40px', background: 'linear-gradient(145deg, #1f2833, #0b0c10)', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', textShadow: '0 0 10px rgba(102, 252, 241, 0.3)' }}>
                The Hardware Guru
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px', color: '#e0e0e0' }}>
                Čau pařani! Jsem 45letý HW nadšenec, gamer a streamer. 
                Tady najdeš vše o hardwaru, recenze her a hlavně záznamy z mých streamů. 
                Na Kicku mi sekunduje unikátní <strong style={{color: '#66fcf1'}}>AI umělá inteligence</strong>, která komunikuje s chatem a komentuje můj gameplay. 
                Doraž na stream a pokcej s námi!
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn">SLEDUJ STREAM (KICK)</a>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn">PŘIPOJ SE NA DISCORD</a>
            </div>
        </div>
        
        <div style={{ width: '200px', height: '200px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 20px #66fcf1' }}>
            <span style={{color: '#45a29e', fontSize: '4rem', fontWeight: 'bold'}}>HG</span>
        </div>
      </header>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 10px rgba(102, 252, 241, 0.5)' }}>
          Nejnovější články & Videa
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{ 
                backgroundColor: '#1f2833', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)', 
                cursor: 'pointer'
              }}>
                
                {/* OBRÁZEK */}
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderBottom: '2px solid #45a29e' }}>
                  <img 
                    src={getThumbnail(post)} 
                    alt={post.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* ŠTÍTEK */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: (post.video_id && post.video_id.length > 5) ? 'rgba(102, 252, 241, 0.85)' : 'rgba(255, 0, 0, 0.85)', 
                    color: (post.video_id && post.video_id.length > 5) ? '#0b0c10' : '#fff', 
                    padding: '5px 12px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem', 
                    border: '1px solid #66fcf1',
                    textTransform: 'uppercase'
                  }}>
                    {(post.video_id && post.video_id.length > 5) ? 'VIDEO / SHORT' : 'HW NOVINKA'}
                  </div>
                </div>
                
                <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', lineHeight: '1.4', fontWeight: 'bold' }}>
                    {post.title}
                  </h3>
                  <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                    {(post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}</span>
                    <span className="read-more">ČÍST VÍCE →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {(!posts || posts.length === 0) && (
             <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#fff', padding: '50px'}}>
                Zatím zde nejsou žádné články. Zkus spustit Cron.
             </div>
          )}

        </div>
      </main>

      {/* PATIČKA */}
      <footer style={{ background: '#1f2833', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
            <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="nav-link">INSTAGRAM</a>
          </div>
          <p style={{ color: '#45a29e', opacity: 0.7 }}>© 2026 The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}
