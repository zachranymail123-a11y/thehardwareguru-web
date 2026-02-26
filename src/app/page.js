import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vynutíme čerstvá data při každém načtení (aby byly vidět nové články z Cronu)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. JEDNODUCHÉ NAČTENÍ ČLÁNKŮ (Bez žádných try-catch blokád)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error("Chyba DB:", error);

  // 2. JEDNODUCHÉ NAČTENÍ STATISTIK
  const { data: stats } = await supabase
    .from('stats')
    .select('value')
    .eq('name', 'total_visits')
    .single();

  // 3. PŘIČTENÍ NÁVŠTĚVY (Jediná věc v catch, protože to není kritické)
  await supabase.rpc('increment_total_visits').catch(e => console.log('Chyba počítadla:', e));

  const celkemNavstev = stats?.value || 0;

  const getThumbnail = (post) => {
    if (post.video_id && post.video_id.length > 5) {
        return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
    }}>
      
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid #45a29e; cursor: pointer; background: rgba(31, 40, 51, 0.95); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; height: 100%; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .nav-special { color: #66fcf1 !important; border: 1px solid #66fcf1; padding: 5px 12px; border-radius: 4px; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/sestavy" className="nav-link nav-special">PC SESTAVY</Link>
            <Link href="/slovnik" className="nav-link">SLOVNÍK</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* BIO HEADER */}
      <header style={{ maxWidth: '1200px', margin: '60px auto', padding: '40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900' }}>The Hardware Guru</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px', color: '#e0e0e0' }}>
                Čau pařani! Jsem 45letý HW nadšenec, gamer a streamer. Tady najdeš vše o hardwaru a recenze her. 
                Na Kicku mi sekunduje unikátní <strong style={{color: '#66fcf1'}}>AI umělá inteligence</strong>.
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn">SLEDUJ STREAM</a>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn">DISCORD</a>
            </div>
        </div>
        <div style={{ width: '200px', height: '200px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{color: '#45a29e', fontSize: '4rem', fontWeight: 'bold'}}>HG</span>
        </div>
      </header>

      {/* ČLÁNKY */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase' }}>Nejnovější články & Videa</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card">
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                  <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '25px', flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '15px', lineHeight: '1.4' }}>{post.title}</h3>
                  <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {(post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                  </p>
                </div>
              </div>
            </Link>
          ))}
          
          {(!posts || posts.length === 0) && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', border: '1px dashed red' }}>
                POZOR: Databáze nevrátila žádná data. Zkontroluj RLS policies v Supabase.
            </div>
          )}
        </div>
      </main>

      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ marginBottom: '20px', color: '#66fcf1', fontWeight: 'bold' }}>
             WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #45a29e' }}>{celkemNavstev}</span> GURU FANOUŠKŮ 🦾
          </div>
          <p style={{ color: '#45a29e', opacity: 0.7, fontSize: '0.8rem' }}>© 2026 The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}
