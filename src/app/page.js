import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// DŮLEŽITÉ: Tohle vypne cache, takže web bude vždy ukazovat aktuální data z DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme články seřazené od nejnovějšího
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Funkce pro získání náhledovky z YouTube ID
  const getThumbnail = (videoId) => {
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return '/placeholder.jpg'; // Záložní obrázek
  };

  return (
    <div style={{ backgroundColor: '#0b0c10', color: '#c5c6c7', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '1px solid #1f2833', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#66fcf1' }}>THE HARDWARE GURU</div>
        <div style={{ display: 'flex', gap: '20px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" style={{color: '#fff', textDecoration: 'none'}}>KICK</a>
            <a href="https://discord.gg/..." target="_blank" style={{color: '#fff', textDecoration: 'none'}}>DISCORD</a>
        </div>
      </nav>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem' }}>
          Nejnovější recenze & streamy
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                backgroundColor: '#1f2833', 
                borderRadius: '15px', 
                overflow: 'hidden', 
                transition: 'transform 0.2s',
                border: '1px solid #45a29e',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* OBRÁZEK (THUMBNAIL) */}
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                  <img 
                    src={getThumbnail(post.video_id)} 
                    alt={post.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                {/* TEXT KARTY */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1.2rem', lineHeight: '1.4' }}>
                    {post.title}
                  </h3>
                  <div style={{ marginTop: 'auto', color: '#66fcf1', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    ČÍST VÍCE →
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {(!posts || posts.length === 0) && (
            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Zatím zde nejsou žádné články.</p>
          )}

        </div>
      </main>
    </div>
  );
}
