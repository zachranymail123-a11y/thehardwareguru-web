import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SestavyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let views = 0;
  let builds = [];

  try {
    // 1. ZAPOČÍTÁME NÁVŠTĚVU (Nesmí shodit web)
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
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
    }}>
      <style>{`
        .build-card { border: 1px solid #45a29e; background: rgba(20, 24, 30, 0.9); display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; margin-bottom: 50px; }
        .card-header { background: rgba(102, 252, 241, 0.05); padding: 25px; border-bottom: 1px solid #45a29e; text-align: center; }
        .specs-container { padding: 25px; }
        .spec-row { display: grid; grid-template-columns: 80px 1fr; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .desc-box { background: rgba(0, 0, 0, 0.3); padding: 20px 25px; border-top: 1px solid rgba(69, 162, 158, 0.3); border-bottom: 1px solid rgba(69, 162, 158, 0.3); }
        .cta-box { padding: 30px 25px; background: rgba(10, 10, 10, 0.4); text-align: center; }
        .cta-button { display: block; width: 100%; padding: 18px; background: linear-gradient(90deg, #b91c1c, #ef4444, #b91c1c); color: white; font-weight: 900; text-transform: uppercase; text-decoration: none; border-radius: 6px; }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; text-transform: uppercase; }
      `}</style>

      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(11, 12, 16, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textDecoration: 'none' }}>THE HARDWARE GURU</Link>
        <div>
            <Link href="/" className="nav-link">DOMŮ</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#ff4444'}}>KICK LIVE</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px' }}>
          Doporučené herní sestavy <span style={{color: '#66fcf1'}}>2026</span>
        </h1>
        
        <div style={{ background: '#0f1216', border: '2px solid #66fcf1', color: '#66fcf1', padding: '8px 20px', borderRadius: '50px', fontWeight: '800', display: 'inline-block', marginBottom: '30px' }}>
            🛠️ 20 LET PRAXE JAKO SERVISNÍ TECHNIK
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {builds.map((build) => (
            <div key={build.id} className="build-card">
              <div className="card-header">
                <h2 style={{ color: '#fff', margin: 0, textTransform: 'uppercase' }}>{build.name}</h2>
                <div style={{ color: '#66fcf1', fontSize: '1.4rem', fontWeight: 'bold' }}>{build.price_range}</div>
              </div>
              <div className="specs-container">
                <div className="spec-row"><span style={{color:'#45a29e'}}>CPU</span><span style={{textAlign:'right'}}>{build.cpu}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e'}}>GPU</span><span style={{textAlign:'right'}}>{build.gpu}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e'}}>RAM</span><span style={{textAlign:'right'}}>{build.ram}</span></div>
                <div className="spec-row"><span style={{color:'#45a29e'}}>SSD</span><span style={{textAlign:'right'}}>{build.storage}</span></div>
              </div>
              <div className="desc-box">
                <p style={{ fontStyle: 'italic', margin: 0 }}>"{build.description}"</p>
              </div>
              <div className="cta-box">
                <a href="https://kick.com/thehardwareguru" target="_blank" style={{ color: '#fff', textDecoration: 'none', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                   ⚠️ CHCEŠ PC? MÁŠ PŘEDSTAVU, ALE NEVÍŠ CO A JAK? JSI NA SPRÁVNÉM MÍSTĚ!
                </a>
                <div style={{ marginBottom: '20px' }}>
                    PODMÍNKA: <a href="https://kick.com/thehardwareguru" target="_blank" style={{color: '#53fc18', fontWeight: 'bold'}}>SUBSCRIBE NA KICKU</a> 💚
                </div>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="cta-button">CHCI TUTO SESTAVU NA MÍRU 🛠️</a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '60px', color: '#45a29e' }}>
            ZÁJEM O PC SESTAVY PROJEVILO JIŽ <strong style={{color: '#fff'}}>{views}</strong> GAMERŮ 🦾
        </div>
      </div>
    </div>
  );
}
