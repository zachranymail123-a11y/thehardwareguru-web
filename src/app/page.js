import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vypne cache - zajistí, že uvidíš vždy nové články
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme data
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Funkce pro náhledovku
  const getThumbnail = (videoId) => {
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return 'https://via.placeholder.com/640x360.png?text=TheHardwareGuru';
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* CSS pro hover efekty (aby to vypadalo jako herní web) */}
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid #45a29e; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .nav-link:hover { color: #66fcf1 !important; text-shadow: 0 0 10px #66fcf1; }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: '#1f2833', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', gap: '30px', fontWeight: 'bold' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#fff', textDecoration: 'none'}}>KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link" style={{color: '#fff', textDecoration: 'none'}}>YOUTUBE</a>
        </div>
      </nav>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '60px', fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 10px rgba(102, 252, 241, 0.5)' }}>
          Nejnovější recenze & streamy
        </h1>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '40px' 
        }}>
          
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
                    src={getThumbnail(post.video_id)} 
                    alt={post.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: '#66fcf1', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid #66fcf1' }}>
                    VIDEO
                  </div>
                </div>
                
                {/* TEXT KARTY */}
                <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', lineHeight: '1.4', fontWeight: 'bold' }}>
                    {post.title}
                  </h3>
                  
                  {/* Perex - bezpečně zkrácený text */}
                  <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                    {(post.content || '')
                      .replace(/<[^>]*>?/gm, '') // Odstraní HTML tagy
                      .substring(0, 120) // Zkrátí na 120 znaků
                    }...
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>
                      {post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}
                    </span>
                    <span className="read-more">
                      ČÍST VÍCE →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {(!posts || posts.length === 0) && (
             <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#fff'}}>Žádné články nenalezeny.</div>
          )}

        </div>
      </main>
    </div>
  );
}
