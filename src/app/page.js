import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Pomocná funkce pro zjištění Live statusu a AI popisu hry
async function getLiveStatus() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCgDdszBhhpqkNQc6t4YOCNw";
  
  // VYLADĚNÉ URČENÍ BASEURL: Nejdřív zkusíme tvoji proměnnou, pak Vercel URL, pak localhost
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (!baseUrl && process.env.VERCEL_URL) baseUrl = `https://${process.env.VERCEL_URL}`;
  if (!baseUrl) baseUrl = 'http://localhost:3000';
  
  // Odstranění koncového lomítka pro jistotu
  baseUrl = baseUrl.replace(/\/$/, "");

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      const streamTitle = data.items[0].snippet.title;
      // Extrakce názvu hry před znakem "|"
      const gameGuess = streamTitle.split('|')[0].trim();
      
      let aiDescription = "Paříme tuhle pecku! Pojď se podívat na gameplay a pokecat do chatu.";
      
      try {
        // Volání tvého AI endpointu s absolutní URL
        const aiRes = await fetch(`${baseUrl}/api/game-info?game=${encodeURIComponent(gameGuess)}`, { 
            next: { revalidate: 3600 } 
        });
        if (aiRes.ok) {
            const aiData = await aiRes.json();
            aiDescription = aiData.description;
        }
      } catch (apiErr) {
        console.error("AI API Error (Silent):", apiErr);
      }

      return { 
        isLive: true, 
        title: streamTitle,
        gameDesc: aiDescription 
      };
    }
  } catch (e) {
    console.error("YouTube Live Error:", e);
  }
  return { isLive: false, title: "", gameDesc: "" };
}

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Spustíme paralelně načítání dat, Live statusu a zápis návštěvy (Full Power)
  const [liveStatus, { data: posts }, { data: stats }] = await Promise.all([
    getLiveStatus(),
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('stats').select('value').eq('name', 'total_visits').single(),
    supabase.rpc('increment_total_visits').catch(() => {})
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
        .social-btn { display: inline-block; padding: 12px 25px; background: #1f2833; color: #66fcf1; border: 1px solid #45a29e; text-decoration: none; font-weight: bold; border-radius: 5px; transition: all 0.3s; text-transform: uppercase; }
        .social-btn:hover { background: #66fcf1; color: #0b0c10; box-shadow: 0 0 15px #66fcf1; transform: scale(1.05); }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
        
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
        .live-dot {
          width: 12px; height: 12px; background: #ff0000; border-radius: 50%;
          display: inline-block; margin-right: 10px; animation: pulse-red 2s infinite;
        }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">
              {liveStatus.isLive && <span className="live-dot" style={{width: '8px', height: '8px'}}></span>}
              KICK {liveStatus.isLive && <span style={{color: '#ff4444'}}>(LIVE)</span>}
            </a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* AI LIVE BOX */}
      {liveStatus.isLive && (
        <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '30px', background: 'rgba(255, 0, 0, 0.05)', borderRadius: '15px', border: '2px solid #ff0000', boxShadow: '0 0 30px rgba(255, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span className="live-dot"></span>
                <span style={{ color: '#ff0000', fontWeight: 'bold', letterSpacing: '2px' }}>PRÁVĚ STREAMUJI</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '15px', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>{liveStatus.title}</h2>
              <p style={{ color: '#e0e0e0', fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic', borderLeft: '4px solid #ff0000', paddingLeft: '20px' }}>
                {liveStatus.gameDesc}
              </p>
              <div style={{ marginTop: '25px' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#ff0000', color: '#fff', border: 'none' }}>VSTOUPIT DO STREAMU</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BIO */}
      <header style={{ maxWidth: '1200px', margin: '60px auto', padding: '40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.95), rgba(11, 12, 16, 0.95))', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', textShadow: '0 0 10px rgba(102, 252, 241, 0.3)' }}>
                The Hardware Guru
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px', color: '#e0e0e0' }}>
                Čau pařani! Jsem 45letý HW nadšenec, gamer a streamer. 
                Tady najdeš vše o hardwaru, recenze her a hlavně záznamy z mých streamů. 
                Na Kicku mi sekunduje unikátní <strong style={{color: '#66fcf1'}}>AI umělá inteligence</strong>, která komunikuje s chatem a komentuje můj gameplay. 
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

      {/* HLAVNÍ OBSAH - ČLÁNKY */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 10px rgba(102, 252, 241, 0.5)' }}>
          Nejnovější články & Videa
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{ 
                backgroundColor: 'rgba(31, 40, 51, 0.95)', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)', 
                cursor: 'pointer'
              }}>
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderBottom: '2px solid #45a29e' }}>
                  <img 
                    src={getThumbnail(post)} 
                    alt={post.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
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
        </div>
      </main>

      {/* PATIČKA */}
      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ marginBottom: '20px', color: '#66fcf1', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', textShadow: '0 0 5px #66fcf1' }}>
              WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 10px', borderRadius: '4px', border: '1px solid #45a29e' }}>{celkemNavstev}</span> GURU FANOUŠKŮ 🦾
          </div>
          <p style={{ color: '#45a29e', opacity: 0.7, fontSize: '0.8rem' }}>© 2026 The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}
