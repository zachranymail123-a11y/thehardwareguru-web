import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image'; // PŘIDÁNO: Optimalizované obrázky od Next.js

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. PŘIČTEME NÁVŠTĚVU
  await supabase.rpc('increment_total_visits');

  // 2. STÁHNEME DATA (OPRAVA: Limitováno na 15 nejnovějších článků pro extrémní rychlost)
  const [{ data: posts }, { data: stats }] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(15),
    supabase.from('stats').select('value').eq('name', 'total_visits').single()
  ]);

  const celkemNavstev = stats?.value || 0;

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
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('/bg-guru.png')",
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
        .social-btn:hover { box-shadow: 0 0 15px currentColor; transform: scale(1.05); }
        .read-more { color: #66fcf1; text-transform: uppercase; font-weight: bold; font-size: 0.9rem; letter-spacing: 1px; }
        .feature-box { 
          background: rgba(31, 40, 51, 0.7); 
          border: 1px solid #45a29e; 
          padding: 25px; 
          border-radius: 12px; 
          text-align: center; 
          text-decoration: none; 
          color: inherit; 
          transition: all 0.3s;
        }
        .feature-box:hover { 
          border-color: #66fcf1; 
          background: rgba(31, 40, 51, 0.9); 
          transform: translateY(-5px); 
          box-shadow: 0 0 20px rgba(102, 252, 241, 0.2);
        }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(31, 40, 51, 0.9)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 0 15px rgba(102, 252, 241, 0.3)', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '2px', textShadow: '2px 2px 0px #000' }}>
          THE HARDWARE GURU
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/sestavy" className="nav-link nav-special">PC SESTAVY</Link>
            <Link href="/moje-pc" className="nav-link" style={{color: '#ff0055'}}>MŮJ PC</Link>
            <Link href="/slovnik" className="nav-link">SLOVNÍK</Link>
            <Link href="/rady" className="nav-link" style={{color: '#66fcf1'}}>PRAKTICKÉ RADY</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.gg/TheHardwareGuru" target="_blank" className="nav-link">DISCORD</a>
        </div>
      </nav>

      {/* BIO SEKCE */}
      <header style={{ maxWidth: '1200px', margin: '40px auto', padding: '40px', background: 'linear-gradient(145deg, rgba(31, 40, 51, 0.95), rgba(11, 12, 16, 0.95))', borderRadius: '15px', border: '1px solid #45a29e', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
            <h1 style={{ color: '#66fcf1', fontSize: '2.5rem', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '900' }}>
                The Hardware Guru
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px', color: '#e0e0e0' }}>
                Čau pařani! Jsem 45letý HW nadšenec a servisák s 20letou praxí. 
                Na Kicku mi sekunduje unikátní <strong style={{color: '#66fcf1'}}>AI inteligence</strong>. 
                Doraž na stream, mrkni na vyladěné sestavy nebo si nechej poradit v sekci praktických návodů.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <Link href="/sestavy" className="feature-box">
                    <div style={{fontSize: '2rem', marginBottom: '10px'}}>🖥️</div>
                    <h4 style={{color: '#66fcf1', margin: '0 0 5px 0'}}>PC SESTAVY</h4>
                    <p style={{fontSize: '0.85rem', margin: 0}}>Nejlepší poměr cena/výkon</p>
                </Link>
                
                <Link href="/moje-pc" className="feature-box" style={{ borderColor: '#ff0055' }}>
                    <div style={{fontSize: '2rem', marginBottom: '10px'}}>💻</div>
                    <h4 style={{color: '#ff0055', margin: '0 0 5px 0'}}>NA ČEM JEDU JÁ?</h4>
                    <p style={{fontSize: '0.85rem', margin: 0}}>Můj dual-GPU build</p>
                </Link>

                <Link href="/slovnik" className="feature-box">
                    <div style={{fontSize: '2rem', marginBottom: '10px'}}>📖</div>
                    <h4 style={{color: '#66fcf1', margin: '0 0 5px 0'}}>HW SLOVNÍK</h4>
                    <p style={{fontSize: '0.85rem', margin: 0}}>Pojmy vysvětlené lidsky</p>
                </Link>
                <Link href="/rady" className="feature-box">
                    <div style={{fontSize: '2rem', marginBottom: '10px'}}>🛠️</div>
                    <h4 style={{color: '#66fcf1', margin: '0 0 5px 0'}}>PRAKTICKÉ RADY</h4>
                    <p style={{fontSize: '0.85rem', margin: 0}}>Servisní tipy a diagnostika</p>
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <a href="https://kick.com/thehardwareguru" target="_blank" className="social-btn" style={{ background: '#53fc18', color: '#0b0c10', border: 'none' }}>KICK STREAM</a>
                <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-btn" style={{ background: '#ff0000', color: '#fff', border: 'none' }}>YOUTUBE</a>
                <a href="https://discord.gg/TheHardwareGuru" target="_blank" className="social-btn">DISCORD</a>
            </div>
        </div>
        <div style={{ width: '180px', height: '180px', background: '#0b0c10', borderRadius: '50%', border: '4px solid #66fcf1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 20px #66fcf1' }}>
            <span style={{color: '#45a29e', fontSize: '3.5rem', fontWeight: 'bold'}}>HG</span>
        </div>
      </header>

      {/* HLAVNÍ OBSAH - ČLÁNKY */}
      <main style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '0 0 10px rgba(102, 252, 241, 0.5)' }}>
          Nejnovější články & Videa
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
          {posts?.map((post) => {
            const badge = getBadgeInfo(post);
            return (
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
                  {/* OPRAVA: Použití optimalizované Image komponenty */}
                  <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderBottom: '2px solid #45a29e' }}>
                    <Image 
                      src={getThumbnail(post)} 
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      right: '10px', 
                      background: badge.color, 
                      color: badge.textColor, 
                      padding: '5px 12px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      fontSize: '0.75rem', 
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                      zIndex: 10
                    }}>
                      {badge.text}
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
            );
          })}
        </div>
      </main>

      {/* PATIČKA */}
      <footer style={{ background: 'rgba(31, 40, 51, 0.95)', padding: '40px 20px', textAlign: 'center', borderTop: '2px solid #66fcf1', marginTop: '60px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link">KICK</a>
            <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="nav-link">YOUTUBE</a>
            <a href="https://discord.gg/TheHardwareGuru" target="_blank" className="nav-link">DISCORD</a>
          </div>
          
          <div style={{ marginBottom: '20px', color: '#66fcf1', fontSize: '1rem', fontWeight: 'bold' }}>
            WEB NAVŠTÍVILO JIŽ <span style={{ color: '#fff', background: '#0b0c10', padding: '2px 8px', borderRadius: '4px', border: '1px solid #45a29e' }}>{celkemNavstev}</span> GURU FANOUŠKŮ 🦾
          </div>

          <p style={{ color: '#45a29e', opacity: 0.7, fontSize: '0.8rem' }}>© 2026 The Hardware Guru. Powered by AI & Caffeine.</p>
      </footer>
    </div>
  );
}
