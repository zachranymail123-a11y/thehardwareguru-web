import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Vynutíme čerstvá data a vypneme cache, aby se články hned objevily
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. PŘIČTEME NÁVŠTĚVU (tiše, bez pádu)
  await supabase.rpc('increment_total_visits').catch(() => {});

  // 2. STÁHNEME DATA (posts i stats)
  const [{ data: posts }, { data: stats }] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('stats').select('value').eq('name', 'total_visits').single()
  ]);

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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }}>
      
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid #45a29e; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .nav-special { color: #66fcf1 !important; border: 1px solid #66fcf1; padding: 5px 12px; border-radius: 4px; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/sestavy" className="nav-link nav-special">PC SESTAVY</Link>
            <Link href="/slovnik" className="nav-link">SLOVNÍK</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" rel="noreferrer" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noreferrer" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* BIO */}
      <header style={{ maxWidth: '1200px', margin: '60px auto', padding: '40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '20px', fontWeight: '900' }}>The Hardware Guru</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>
                Čau pařani! Jsem 45letý HW nadšenec a streamer. 
                Všechny novinky a videa najdeš níže. AI na streamu mi pomáhá s chatem, tak doraž!
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" rel="noreferrer" className="social-btn">SLEDUJ STREAM (KICK)</a>
            </div>
        </div>
        <div style={{ width: '150px', height: '150px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{color: '#45a29e', fontSize: '3rem', fontWeight: 'bold'}}>HG</span>
        </div>
      </header>

      {/* HLAVNÍ OBSAH */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase' }}>
          Nejnovější články & Videa
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{ backgroundColor: '#1f2833', borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <img src={getThumbnail(post)} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>{post.title}</h3>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', color: '#66fcf1', fontSize: '0.8rem' }}>
                    <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}</span>
                    <span className="read-more">VÍCE →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {(!posts || posts.length === 0) && (
             <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Zatím žádný obsah v databázi.</p>
          )}
        </div>
      </main>

      {/* PATIČKA */}
      <footer style={{ background: '#1f2833', padding: '30px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ color: '#66fcf1', fontWeight: 'bold' }}>
             WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff' }}>{celkemNavstev}</span> GURU FANOUŠKŮ 🦾
          </div>
      </footer>
    </div>
  );
}
