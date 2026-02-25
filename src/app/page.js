import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Původní stabilní funkce pro zjištění Live statusu
async function getLiveStatus() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCgDdszBhhpqkNQc6t4YOCNw";
  // Tady byl ten zakopaný pes - baseUrl musí být absolutní pro server fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.URL ? process.env.URL : 'http://localhost:3000');

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      const streamTitle = data.items[0].snippet.title;
      const gameGuess = streamTitle.split('|')[0].trim();
      
      let aiDescription = "Právě streamujeme tuhle pecku! Doraz pokecat do chatu.";

      // POKUD JE BASE URL, ZKUSÍME AI, ALE KDYŽ SELŽE, WEB POJEDE DÁL
      if (baseUrl) {
          try {
              const aiRes = await fetch(`${baseUrl.replace(/\/$/, "")}/api/game-info?game=${encodeURIComponent(gameGuess)}`, { next: { revalidate: 3600 } });
              if (aiRes.ok) {
                  const aiData = await aiRes.json();
                  aiDescription = aiData.description;
              }
          } catch (e) {
              console.log("AI Info skip - web jede dál");
          }
      }

      return { isLive: true, title: streamTitle, gameDesc: aiDescription };
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

  // Spuštění všeho paralelně - tak jak to bylo v té verzi, co ti běžela
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
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#c5c6c7', backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
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
        .live-dot { width: 12px; height: 12px; background: #ff0000; border-radius: 50%; display: inline-block; margin-right: 10px; animation: pulse-red 2s infinite; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>THE HARDWARE GURU</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">
              {liveStatus.isLive && <span className="live-dot" style={{width: '8px', height: '8px'}}></span>}
              KICK {liveStatus.isLive && <span style={{color: '#ff4444'}}>(LIVE)</span>}
            </a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* LIVE BOX */}
      {liveStatus.isLive && (
        <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '30px', background: 'rgba(255, 0, 0, 0.05)', borderRadius: '15px', border: '2px solid #ff0000', boxShadow: '0 0 30px rgba(255, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span className="live-dot"></span>
                <span style={{ color: '#ff0000', fontWeight: 'bold', letterSpacing: '2px' }}>PRÁVĚ STREAMUJI</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '15px' }}>{liveStatus.title}</h2>
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
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', textShadow: '0 0 10px rgba(102, 252, 241, 0.3)' }}>The Hardware Guru</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px', color: '#e0e0e0' }}>Čau pařani! Jsem 45letý HW nadšenec, gamer a streamer. Tady najdeš vše o hardwaru, recenze her a záznamy záznamy ze streamů. Na Kicku mi sekunduje unikátní AI umělá inteligence.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn">KICK STREAM</a>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="social-btn">DISCORD</a>
            </div>
        </div>
        <div style={{ width: '200px', height: '200px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{color: '#45a29e', fontSize: '4rem', fontWeight: 'bold'}}>HG</span>
        </div>
      </header>

      {/* ČLÁNKY */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {posts?.map((post) => (
            <Link key={post.id} href={`/clanky/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="game-card" style={{ backgroundColor: 'rgba(31, 40, 51, 0.95)', borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <img src={getThumbnail(post)} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '25px', flex: 1 }}>
                  <h3 style={{ color: '#fff', marginBottom: '15px' }}>{post.title}</h3>
                  <p style={{ color: '#c5c6c7', fontSize: '0.95rem' }}>{(post.content || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}...</p>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#45a29e' }}>{post.created_at ? new Date(post.created_at).toLocaleDateString('cs-CZ') : ''}</span>
                    <span className="read-more">VÍCE →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* PATIČKA */}
      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ color: '#66fcf1', fontWeight: 'bold', fontSize: '1.2rem' }}>WEB NAVŠTÍVILO JIŽ {celkemNavstev} FANOUŠKŮ 🦾</div>
      </footer>
    </div>
  );
}
