export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default async function SestavyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let views = 0;
  let builds = [];

  try {
    // 1. ZAPOČÍTÁME NÁVŠTĚVU
    await supabase.rpc('increment_stat', { stat_name: 'sestavy_views' });

    // 2. STÁHNEME DATA
    const [buildsResult, statsResult] = await Promise.all([
      supabase.from('pc_builds').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('stats').select('value').eq('name', 'sestavy_views').single()
    ]);

    builds = buildsResult.data || [];
    views = statsResult.data?.value || 0;
  } catch (e) {
    console.error("DB Load Error:", e);
  }

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.95), rgba(11, 12, 16, 0.9)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <style>{`
        .build-card { border: 1px solid #45a29e; background: rgba(20, 24, 30, 0.9); display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; margin-bottom: 50px; transition: transform 0.3s ease; }
        .build-card:hover { transform: scale(1.01); border-color: #66fcf1; }
        .card-header { background: rgba(102, 252, 241, 0.05); padding: 25px; border-bottom: 1px solid #45a29e; text-align: center; }
        .specs-container { padding: 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 30px; }
        .spec-row { display: grid; grid-template-columns: 110px 1fr; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.9rem; }
        .desc-box { background: rgba(0, 0, 0, 0.3); padding: 20px 25px; border-top: 1px solid rgba(69, 162, 158, 0.3); border-bottom: 1px solid rgba(69, 162, 158, 0.3); }
        .cta-box { padding: 30px 25px; background: rgba(10, 10, 10, 0.4); text-align: center; }
        .cta-button { display: block; width: 100%; padding: 18px; background: linear-gradient(90deg, #b91c1c, #ef4444, #b91c1c); color: white; font-weight: 900; text-transform: uppercase; text-decoration: none; border-radius: 6px; transition: transform 0.2s; }
        .cta-button:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
        .nav-link { color: #fff; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 0.9rem; transition: color 0.3s; }
        .nav-link:hover { color: #66fcf1; }
        .social-btn { padding: 8px 15px; text-decoration: none; font-weight: 900; border-radius: 5px; text-transform: uppercase; transition: transform 0.2s; font-size: 0.85rem; display: inline-block; }
        .social-btn:hover { transform: scale(1.05); }
        
        @media (max-width: 768px) {
          .nav-container { flex-direction: column; gap: 15px; padding: 15px !important; }
          .social-group { justify-content: center; width: 100%; }
          .hero-title { font-size: 1.8rem !important; }
          .specs-container { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* --- HORNÍ LIŠTA (STICKY) --- */}
      <nav className="nav-container" style={{ 
        padding: '10px 40px', 
        borderBottom: '2px solid #66fcf1', 
        background: 'rgba(11, 12, 16, 0.98)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '1.3rem', fontWeight: '900', color: '#66fcf1', letterSpacing: '1px' }}>THE HARDWARE GURU</Link>
          <Link href="/" className="nav-link">ZPĚT</Link>
        </div>

        <div className="social-group" style={{ display: 'flex', gap: '10px' }}>
          <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ background: '#53fc18', color: '#000' }}>KICK LIVE</a>
          <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ background: '#ff0000', color: '#fff' }}>YOUTUBE</a>
          <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ background: '#5865F2', color: '#fff' }}>DISCORD</a>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', flex: '1 0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="hero-title" style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px', margin: 0 }}>
            Doporučené herní sestavy <span style={{color: '#66fcf1'}}>2026</span>
          </h1>
          
          <div style={{ background: '#0f1216', border: '2px solid #66fcf1', color: '#66fcf1', padding: '8px 20px', borderRadius: '50px', fontWeight: '800', display: 'inline-block', marginBottom: '30px', fontSize: '0.9rem' }}>
              🛠️ 20 LET PRAXE JAKO SERVISNÍ TECHNIK
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {builds.map((build) => (
            <div key={build.id} className="build-card">
              <div className="card-header">
                <h2 style={{ color: '#fff', margin: 0, textTransform: 'uppercase', fontSize: '1.5rem' }}>{build.name}</h2>
                <div style={{ color: '#66fcf1', fontSize: '1.4rem', fontWeight: 'bold' }}>{build.price_range}</div>
              </div>

              <div className="specs-container">
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>CPU</span><span>{build.cpu}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>GRAFIKA</span><span>{build.gpu}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>DESKA</span><span>{build.motherboard || 'ATX AM5 Guru Standard'}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>RAM</span><span>{build.ram}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>SSD</span><span>{build.storage}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>ZDROJ</span><span>{build.psu || 'Seasonic Gold'}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>CHLAZENÍ</span><span>{build.cooler || 'Vodní AIO / PWM Fans'}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e', fontWeight: 'bold'}}>SKŘÍŇ</span><span>{build.case_name || 'ATX Airflow Case'}</span></div>
              </div>

              <div className="desc-box">
                <p style={{ fontStyle: 'italic', margin: 0, lineHeight: '1.5', color: '#66fcf1', fontSize: '0.95rem' }}>"{build.description}"</p>
              </div>

              <div className="cta-box">
                <p style={{ color: '#fff', textDecoration: 'none', display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    ⚠️ REALIZACE PROBÍHÁ JAKO HOBBY PROJEKT A KOMUNITNÍ POMOC PRO DIVÁKY
                </p>
                <div style={{ marginBottom: '20px', fontSize: '0.95rem' }}>
                    Vše se řeší soukromě na Discordu. Podmínkou je <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" style={{color: '#53fc18', fontWeight: 'bold'}}>SUBSCRIBE NA KICKU</a> 💚
                </div>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="cta-button">DOMLUVIT STAVBU NA DISCORDU 🛠️</a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#45a29e', fontSize: '1.1rem' }}>
            ZÁJEM O PC SESTAVY PROJEVILO JIŽ <strong style={{color: '#fff'}}>{views}</strong> GAMERŮ 🦾
        </div>
      </main>

      {/* --- SEKCE O MNĚ (FOOTER) --- */}
      <footer style={{ 
        padding: '60px 20px', 
        background: 'rgba(11, 12, 16, 0.98)', 
        borderTop: '2px solid #45a29e', 
        textAlign: 'center', 
        marginTop: '80px' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ color: '#66fcf1', marginBottom: '20px', textTransform: 'uppercase', fontWeight: '900', fontSize: '2rem' }}>O mně</h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '30px', color: '#c5c6c7' }}>
            Vítej ve světě <strong>The Hardware Guru</strong>! Jako tvůj průvodce moderním železem těžím z 20 let praxe v servisu. 
            Tisíce opravených strojů mě naučily, co funguje a co je jen marketing. 
            Na streamu ladíme vaše budoucí herní děla, hledáme nejlepší poměr cena/výkon a stavíme komunitu, 
            kde hardware dává smysl. Sestavy, které vidíš výše, jsou prověřené mým vlastním rukopisem.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ background: '#53fc18', color: '#000', padding: '12px 25px' }}>KICK STREAM</a>
            <a href="https://www.youtube.com/@thehardwareguru_czech" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ background: '#ff0000', color: '#fff', padding: '12px 25px' }}>YOUTUBE KANÁL</a>
            <a href="https://discord.com/invite/n7xThr8" target="_blank" rel="noopener noreferrer" className="social-btn" style={{ background: '#5865F2', color: '#fff', padding: '12px 25px' }}>DISCORD SERVER</a>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: '#45a29e' }}>
            © {new Date().getFullYear()} THE HARDWARE GURU. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    </div>
  );
}
