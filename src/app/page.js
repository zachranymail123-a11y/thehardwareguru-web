import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Lightbulb, ChevronRight, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. PŘIČTEME NÁVŠTĚVU
  await supabase.rpc('increment_total_visits');

  // 2. STÁHNEME DATA
  const [{ data: posts }, { data: stats }, { data: nejnovejsiTipy }] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(15),
    supabase.from('stats').select('value').eq('name', 'total_visits').single(),
    supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(3)
  ]);

  const celkemNavstev = stats?.value || 0;

  const getSafeImage = (url) => {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=1000&auto=format&fit=crop';
    }
    return url;
  };

  const getThumbnail = (post) => {
    if (post.image_url) return post.image_url;
    if (post.video_id && post.video_id.length > 5) {
        return `https://img.youtube.com/vi/${post.video_id}/maxresdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1000&auto=format&fit=crop';
  };

  const getBadgeInfo = (post) => {
    if (post.video_id && post.video_id.length > 5) {
      return { text: 'VIDEO / SHORT', color: '#66fcf1', textColor: '#0b0c10' };
    }
    const isGame = post.type === 'game' || post.title.toLowerCase().includes('recenze') || post.title.toLowerCase().includes('resident evil');
    if (isGame) return { text: 'HERNÍ NOVINKA', color: '#ff0055', textColor: '#fff' };
    return { text: 'HW NOVINKA', color: '#ff0000', textColor: '#fff' };
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#fff',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('/bg-guru.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    }}>
      
      <style>{`
        .game-card { transition: all 0.3s ease; border: 1px solid rgba(102, 252, 241, 0.2); }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.4); border-color: #66fcf1; }
        
        /* GURU GLOW EFEKT PRO TIPY */
        .tip-card { 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          border: 1px solid rgba(168, 85, 247, 0.3); 
          background: rgba(17, 19, 24, 0.85); 
          backdrop-filter: blur(10px);
        }
        .tip-card:hover { 
          transform: translateY(-8px) scale(1.02); 
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); 
          border-color: #a855f7; 
        }

        /* ANIMOVANÝ NOVINKA ŠTÍTEK */
        @keyframes pulse-new {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .new-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #a855f7;
          color: #fff;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 900;
          z-index: 10;
          animation: pulse-new 2s infinite ease-in-out;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
          letter-spacing: 1px;
        }

        .latest-glow {
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.3);
          border-color: rgba(168, 85, 247, 0.6) !important;
        }
        
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .nav-link:hover { color: #66fcf1; text-shadow: 0 0 10px #66fcf1; }
        .nav-special { color: #66fcf1 !important; border: 1px solid #66fcf1; padding: 5px 12px; border-radius: 4px; }
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { box-shadow: 0 0 15px currentColor; transform: scale(1.05); }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px' }}>THE HARDWARE GURU</div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/tipy" className="nav-link" style={{color: '#a855f7'}}><Lightbulb size={16} style={{marginRight: '5px'}}/> TIPY & TRIKY</Link>
            <Link href="/sestavy" className="nav-link nav-special">PC SESTAVY</Link>
            <Link href="/slovnik" className="nav-link">SLOVNÍK</Link>
            <Link href="/rady" className="nav-link" style={{color: '#66fcf1'}}>PRAKTICKÉ RADY</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="/support" className="nav-link" style={{color: '#eab308'}}>SUPPORT</a>
        </div>
      </nav>

      {/* BIO SEKCE */}
      <header style={{ maxWidth: '1200px', margin: '40px auto', padding: '40px', background: 'rgba(31, 40, 51, 0.95)', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '900' }}>The Hardware Guru</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px', color: '#e0e0e0' }}>
                Čau pařani! Jsem 45letý HW nadšenec a servisák s 20letou praxí. Na webu najdeš vyladěné sestavy, technický slovník i automaticky generované <strong>AI tipy a návody</strong> pro tvůj hardware.
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#0b0c10', border: 'none' }}>KICK STREAM</a>
                <a href="/support" className="social-btn" style={{ background: '#eab308', color: '#000', border: 'none' }}>PODPOŘIT WEB</a>
            </div>
        </div>
        <div style={{ width: '180px', height: '180px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 20px #66fcf1' }}>
            <span style={{color: '#45a29e', fontSize: '3.5rem', fontWeight: 'bold'}}>HG</span>
        </div>
      </header>

      {/* --- SEKCE GURU TIPY & TRIKY (S ANIMOVANOU NOVINKOU) --- */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>GURU <span style={{ color: '#a855f7' }}>TIPY & TRIKY</span></h2>
          <Link href="/tipy" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>ZOBRAZIT VŠECHNY →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
          {nejnovejsiTipy?.map((tip, index) => {
            const isLatest = index === 0;
            return (
              <Link href={`/tipy/${tip.slug}`} key={tip.id} className={`tip-card ${isLatest ? 'latest-glow' : ''}`} style={{ textDecoration: 'none', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ position: 'relative', height: '220px', width: '100%', background: '#0b0c10' }}>
                  {isLatest && <div className="new-badge">NOVINKA 🔥</div>}
                  <img 
                    src={getSafeImage(tip.image_url)} 
                    alt={tip.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {tip.youtube_id && (
                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#ff0000', padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 5, boxShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
                      <Play size={12} fill="#fff" /> VIDEO
                    </div>
                  )}
                </div>
                <div style={{ padding: '25px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{tip.category}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '12px 0', color: '#fff' }}>{tip.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>{tip.description}</p>
                  <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '13px', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    OTEVŘÍT NÁVOD <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HLAVNÍ ČLÁNKY */}
      <main style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' }}>
          Nejnovější články & Videa
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {posts?.map((post) => {
            const badge = getBadgeInfo(post);
            return (
              <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="game-card" style={{ backgroundColor: 'rgba(31, 40, 51, 0.95)', borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                    <img src={getThumbnail(post)} alt={post.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: badge.color, color: badge.textColor, padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>{badge.text}</div>
                  </div>
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '1.3rem', fontWeight: 'bold' }}>{post.title}</h3>
                    <p style={{ color: '#c5c6c7', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
                      {(post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#45a29e', fontSize: '0.85rem' }}>{post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}</span>
                      <span style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '0.9rem' }}>ČÍST VÍCE →</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* PATIČKA */}
      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '60px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1' }}>
          <div style={{ marginBottom: '20px', color: '#66fcf1', fontSize: '1rem', fontWeight: 'bold' }}>
            WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #45a29e' }}>{celkemNavstev}</span> GURU FANOUŠKŮ 🦾
          </div>
          <p style={{ color: '#45a29e', opacity: 0.7, fontSize: '0.8rem' }}>© {new Date().getFullYear()} The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}
