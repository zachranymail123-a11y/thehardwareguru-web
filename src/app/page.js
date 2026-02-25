import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vypne cache úplně natvrdo
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Vytvoření klienta - tady může být chyba v proměnných prostředí
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Stáhneme data a VÝSLOVNĚ si vyžádáme i chybu
  const { data: posts, error } = await supabase
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
      
      {/* --- DIAGNOSTICKÝ BOX (Po vyřešení smažeme) --- */}
      <div style={{ background: '#330000', border: '2px solid red', padding: '20px', margin: '20px', color: '#fff', fontFamily: 'monospace' }}>
        <h3>🚨 DIAGNOSTIKA (JSEM PŘIPOJEN?)</h3>
        <p><strong>Supabase URL načtena:</strong> {supabaseUrl ? 'ANO ✅' : 'NE ❌ (Chybí Env Variable!)'}</p>
        <p><strong>Supabase KEY načten:</strong> {supabaseKey ? 'ANO ✅' : 'NE ❌ (Chybí Env Variable!)'}</p>
        <p><strong>Chyba od Supabase:</strong> {error ? JSON.stringify(error) : 'Žádná chyba (OK)'}</p>
        <p><strong>Počet stažených článků:</strong> {posts ? posts.length : 'NULL'}</p>
        {posts && posts.length > 0 && (
            <div>
                <strong>První článek v DB:</strong> {posts[0].title} <br/>
                <strong>Má video_id?</strong> {posts[0].video_id ? posts[0].video_id : 'NULL (To je správně pro novinku)'}
            </div>
        )}
      </div>
      {/* ----------------------------------------------- */}

      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid #45a29e; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: '#1f2833', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
      </nav>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{ backgroundColor: '#1f2833', borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', cursor: 'pointer' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderBottom: '2px solid #45a29e' }}>
                  <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: (post.video_id && post.video_id.length > 5) ? 'rgba(102, 252, 241, 0.85)' : 'rgba(255, 0, 0, 0.85)', color: (post.video_id && post.video_id.length > 5) ? '#0b0c10' : '#fff', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', border: '1px solid #66fcf1', textTransform: 'uppercase' }}>
                    {(post.video_id && post.video_id.length > 5) ? 'VIDEO / SHORT' : 'HW NOVINKA'}
                  </div>
                </div>
                <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', lineHeight: '1.4', fontWeight: 'bold' }}>{post.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
