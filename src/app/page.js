import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// DŮLEŽITÉ: Vypne cache, aby byl obsah vždy aktuální
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme články
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Funkce pro získání náhledovky
  const getThumbnail = (videoId) => {
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return '/placeholder.jpg';
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: '#1f2833', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', gap: '30px', fontWeight: 'bold' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" style={{color: '#fff', textDecoration: 'none', transition: 'color 0.3s'}} className="nav-link">KICK</a>
            <a href="https://discord.gg/..." target="_blank" style={{color: '#fff', textDecoration: 'none', transition: 'color 0.3s'}} className="nav-link">DISCORD</a>
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
              <div style={{ 
                backgroundColor: '#1f2833', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid #45a29e',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              // Přidáme inline hover efekt (v Reactu trochu hack, ale funkční)
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(102, 252, 241, 0.4)';
                e.currentTarget.style.borderColor = '#66fcf1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
                e.currentTarget.style.borderColor = '#45a29e';
              }}
              >
                {/* OBRÁZEK (THUMBNAIL) */}
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderBottom: '2px solid #45a29e' }}>
                  <img 
                    src={getThumbnail(post.video_id)} 
                    alt={post.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: '#66fcf1', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    VIDEO
                  </div>
                </div>
                
                {/* TEXT KARTY */}
                <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.4rem', lineHeight: '1.4', fontWeight: 'bold' }}>
                    {post.title}
                  </h3>
                  
                  {/* Krátký úryvek (perex) - ořízneme HTML tagy */}
                  <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }}>
                    {post.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{new Date(post.created_at).toLocaleDateString('cs-CZ')}</span>
                    <span style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      ČÍST VÍCE →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
