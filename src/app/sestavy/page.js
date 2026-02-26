import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SestavyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Stáhneme aktivní sestavy
  const { data: builds } = await supabase
    .from('pc_builds')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  return (
    <div style={{ 
        minHeight: '100vh', 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#c5c6c7',
        backgroundImage: "linear-gradient(rgba(11, 12, 16, 0.95), rgba(11, 12, 16, 0.9)), url('https://i.postimg.cc/QdWxszv3/bg-guru.png')",
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
    }}>
      <style>{`
        .build-card { 
            border: 1px solid #45a29e; 
            transition: all 0.3s ease; 
            background: rgba(20, 24, 30, 0.9); 
            display: flex; 
            flex-direction: column;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            margin-bottom: 50px; 
        }
        .build-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 0 30px rgba(102, 252, 241, 0.15); 
            border-color: #66fcf1; 
        }

        /* HEADER KARTY */
        .card-header {
            background: rgba(102, 252, 241, 0.05);
            padding: 25px;
            border-bottom: 1px solid #45a29e;
            text-align: center;
        }
        .build-name { color: #fff; margin: 0; fontSize: 1.8rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
        .build-price { color: #66fcf1; fontSize: 1.4rem; font-weight: bold; marginTop: 10px; text-shadow: 0 0 10px rgba(102, 252, 241, 0.3); }

        /* SPECIFIKACE */
        .specs-container {
            padding: 25px;
        }
        .spec-row { 
            display: grid; 
            grid-template-columns: 80px 1fr; 
            align-items: center; 
            padding: 12px 0; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .spec-row:last-child { border-bottom: none; }
        .spec-label { color: #45a29e; font-weight: bold; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; }
        .spec-val { color: #fff; text-align: right; font-weight: 500; font-size: 1rem; }

        /* POPIS (GURU VERDIKT) */
        .desc-box {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px 25px;
            border-top: 1px solid rgba(69, 162, 158, 0.3);
            border-bottom: 1px solid rgba(69, 162, 158, 0.3);
        }
        .desc-text {
            font-style: italic; 
            color: #d1d5db; 
            line-height: 1.6; 
            text-align: center;
            font-size: 0.95rem;
            margin: 0;
        }

        /* CTA SEKCE (Tlačítko) */
        .cta-box {
            padding: 30px 25px; 
            background: rgba(10, 10, 10, 0.4);
            margin-top: auto; 
            text-align: center;
        }
        
        .cta-link-text {
            color: #fff; font-weight: bold; margin-bottom: 10px; font-size: 1rem; text-transform: uppercase; line-height: 1.4;
            transition: color 0.3s;
        }
        .cta-link-text:hover { color: #53fc18; text-decoration: underline; }

        .cta-button { 
            display: block; width: 100%; padding: 18px; 
            background: linear-gradient(90deg, #b91c1c, #ef4444, #b91c1c); 
            background-size: 200% 100%;
            color: white; text-align: center; font-weight: 900; text-transform: uppercase; 
            text-decoration: none; letter-spacing: 1px; border: none; cursor: pointer;
            border-radius: 6px; transition: all 0.4s;
            box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
            animation: gradientMove 3s infinite;
        }
        .cta-button:hover { 
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); 
            transform: scale(1.02); 
        }

        @keyframes gradientMove {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }

        /* SOCIÁLNÍ SÍTĚ */
        .social-row { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin-top: 25px; 
            flex-wrap: wrap;
        }
        .social-mini { 
            color: #9ca3af; 
            text-decoration: none; 
            font-size: 0.85rem; 
            font-weight: bold; 
            transition: all 0.3s; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            padding: 8px 12px;
            border-radius: 4px;
            background: rgba(255,255,255,0.05);
            border: 1px solid transparent;
        }
        .social-mini:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: #45a29e; }

        .expert-badge {
            background: #0f1216; border: 2px solid #66fcf1; color: #66fcf1;
            padding: 8px 20px; border-radius: 50px; font-weight: 800; font-size: 0.9rem;
            display: inline-block; margin-bottom: 30px; 
            box-shadow: 0 0 20px rgba(102, 252, 241, 0.15);
            text-transform: uppercase; letter-spacing: 1px;
        }

        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(11, 12, 16, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textDecoration: 'none', textTransform: 'uppercase' }}>THE HARDWARE GURU</Link>
        <div>
            <Link href="/" className="nav-link">DOMŮ</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#ff4444'}}>KICK LIVE</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px' }}>
          Doporučené herní sestavy <span style={{color: '#66fcf1'}}>2026</span>
        </h1>
        
        <div className="expert-badge">
            🛠️ 20 LET PRAXE JAKO SERVISNÍ TECHNIK
        </div>

        <p style={{ maxWidth: '800px', margin: '0 auto 50px', fontSize: '1.1rem', color: '#c5c6c7', lineHeight: '1.6' }}>
          Žádné marketingové kecy. Tohle jsou sestavy, které dávají smysl poměrem cena/výkon. 
          Jako bývalý servisák kancelářské a výpočetní techniky vím, co se kazí a co drží.
          Ceny létají nahoru dolů, proto finální doladění děláme <strong>LIVE</strong>.
        </p>

        {/* SEZNAM SESTAV - KARTY */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {builds?.map((build) => (
            <div key={build.id} className="build-card">
              
              {/* 1. HLAVIČKA: NÁZEV A CENA */}
              <div className="card-header">
                <h2 className="build-name">{build.name}</h2>
                <div className="build-price">{build.price_range}</div>
              </div>

              {/* 2. SPECIFIKACE */}
              <div className="specs-container">
                <div className="spec-row"><span className="spec-label">CPU</span><span className="spec-val">{build.cpu}</span></div>
                <div className="spec-row"><span className="spec-label">GPU</span><span className="spec-val">{build.gpu}</span></div>
                <div className="spec-row"><span className="spec-label">RAM</span><span className="spec-val">{build.ram}</span></div>
                <div className="spec-row"><span className="spec-label">SSD</span><span className="spec-val">{build.storage}</span></div>
              </div>

              {/* 3. GURU POPIS (ODDĚLENÝ) */}
              <div className="desc-box">
                <p className="desc-text">
                   <span style={{color: '#66fcf1', fontWeight: 'bold', marginRight: '5px'}}>GURU VERDIKT:</span> 
                   "{build.description}"
                </p>
              </div>

              {/* 4. TLAČÍTKO A ODKAZY */}
              <div className="cta-box">
                
                {/* ODKAZ NA KICK (TEXT) */}
                <a href="https://kick.com/thehardwareguru" target="_blank" style={{textDecoration: 'none'}}>
                    <div className="cta-link-text">
                       ⚠️ CHCEŠ PC? MÁŠ PŘEDSTAVU, ALE NEVÍŠ CO A JAK? JSI NA SPRÁVNÉM MÍSTĚ!
                    </div>
                </a>

                {/* PODMÍNKA SUBSCRIBE - NYNÍ KLIKATELNÁ */}
                <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
                    PODMÍNKA: 
                    <a href="https://kick.com/thehardwareguru" target="_blank" style={{color: '#53fc18', borderBottom: '1px solid #53fc18', textDecoration: 'none', marginLeft: '5px'}}>
                        SUBSCRIBE NA KICKU
                    </a> 💚
                </div>
                
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="cta-button">
                  CHCI TUTO SESTAVU NA MÍRU 🛠️
                </a>

                <div className="social-row">
                    <a href="https://kick.com/thehardwareguru" target="_blank" className="social-mini">
                        <span style={{color: '#53fc18'}}>●</span> KICK
                    </a>
                    <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-mini">
                        <span style={{color: '#ff0000'}}>●</span> YOUTUBE
                    </a>
                    <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="social-mini">
                        <span style={{color: '#e1306c'}}>●</span> INSTAGRAM
                    </a>
                </div>
              </div>

            </div>
          ))}
        </div>

        {(!builds || builds.length === 0) && (
            <p style={{color: '#fff', fontSize: '1.2rem', marginTop: '50px'}}>Momentálně ladím nové sestavy. Doraž na Discord!</p>
        )}
      </div>
    </div>
  );
}
