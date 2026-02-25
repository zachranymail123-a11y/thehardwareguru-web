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
        .build-card { border: 1px solid #45a29e; transition: all 0.3s ease; background: rgba(31, 40, 51, 0.8); position: relative; overflow: hidden; display: flex; flexDirection: column; }
        .build-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.2); border-color: #66fcf1; }
        .spec-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(69, 162, 158, 0.3); }
        .spec-label { color: #45a29e; font-weight: bold; text-transform: uppercase; font-size: 0.9rem; }
        .spec-val { color: #fff; text-align: right; font-weight: 500; }
        
        .cta-box {
            background: rgba(0, 0, 0, 0.4);
            border: 1px dashed #66fcf1;
            padding: 20px;
            border-radius: 8px;
            margin-top: auto;
            text-align: center;
        }

        .cta-button { 
            display: block; width: 100%; padding: 15px; 
            background: linear-gradient(90deg, #cc0000, #ff0000, #cc0000); 
            background-size: 200% 100%;
            color: white; text-align: center; font-weight: 900; text-transform: uppercase; 
            text-decoration: none; letter-spacing: 1px; border: none; cursor: pointer;
            border-radius: 4px; transition: all 0.4s;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
            animation: gradientMove 3s infinite;
        }
        .cta-button:hover { box-shadow: 0 0 20px rgba(255, 0, 0, 0.8); transform: scale(1.02); }

        @keyframes gradientMove {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }

        .social-row { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
        .social-mini { color: #c5c6c7; text-decoration: none; font-size: 0.85rem; font-weight: bold; transition: color 0.3s; display: flex; align-items: center; gap: 5px; }
        .social-mini:hover { color: #66fcf1; }

        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; }
        
        .expert-badge {
            background: #1f2833; border: 1px solid #66fcf1; color: #66fcf1;
            padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 0.9rem;
            display: inline-block; margin-bottom: 20px; box-shadow: 0 0 10px rgba(102, 252, 241, 0.2);
        }
      `}</style>

      {/* HLAVIČKA */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(11, 12, 16, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textDecoration: 'none', textTransform: 'uppercase' }}>THE HARDWARE GURU</Link>
        <div>
            <Link href="/" className="nav-link">DOMŮ</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#ff4444'}}>KICK LIVE</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        
        {/* TITULKY A PRAXE */}
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '15px' }}>
          Doporučené herní sestavy <span style={{color: '#66fcf1'}}>2026</span>
        </h1>
        
        <div className="expert-badge">
            🛠️ 20 LET PRAXE JAKO SERVISNÍ TECHNIK
        </div>

        <p style={{ maxWidth: '800px', margin: '0 auto 40px', fontSize: '1.1rem', color: '#c5c6c7', lineHeight: '1.6' }}>
          Žádné marketingové kecy. Tohle jsou sestavy, které dávají smysl poměrem cena/výkon. 
          Jako bývalý servisák kancelářské a výpočetní techniky vím, co se kazí a co drží.
          Ceny létají nahoru dolů, proto finální doladění děláme <strong>LIVE</strong>.
        </p>

        {/* SEZNAM SESTAV */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          {builds?.map((build) => (
            <div key={build.id} className="build-card" style={{ padding: '30px', borderRadius: '15px' }}>
              
              <div style={{ marginBottom: '20px', borderBottom: '2px solid #66fcf1', paddingBottom: '15px', textAlign: 'left' }}>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.6rem', textTransform: 'uppercase', fontWeight: '800' }}>{build.name}</h2>
                <div style={{ color: '#66fcf1', fontSize: '1.3rem', fontWeight: 'bold', marginTop: '5px' }}>{build.price_range}</div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <div className="spec-row"><span className="spec-label">CPU</span><span className="spec-val">{build.cpu}</span></div>
                <div className="spec-row"><span className="spec-label">GPU</span><span className="spec-val">{build.gpu}</span></div>
                <div className="spec-row"><span className="spec-label">RAM</span><span className="spec-val">{build.ram}</span></div>
                <div className="spec-row"><span className="spec-label">SSD</span><span className="spec-val">{build.storage}</span></div>
              </div>

              <p style={{ fontStyle: 'italic', color: '#a0a0a0', marginBottom: '25px', textAlign: 'left', fontSize: '0.95rem' }}>
                "{build.description}"
              </p>

              {/* GURU TRAP + SOCIÁLNÍ SÍTĚ */}
              <div className="cta-box">
                <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '15px', fontWeight: 'bold' }}>
                   ⚠️ CHCEŠ TO POSKLÁDAT A OPTIMALIZOVAT?
                </div>
                
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="cta-button">
                  CHCI TUTO SESTAVU NA MÍRU 🛠️
                </a>

                <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', fontSize: '0.8rem', color: '#888' }}>
                    PODMÍNKA: SUB NA KICKU + DISCORD
                </div>

                <div className="social-row">
                    <a href="https://kick.com/thehardwareguru" target="_blank" className="social-mini" style={{color: '#53fc18'}}>
                        KICK
                    </a>
                    <a href="https://www.youtube.com/@TheHardwareGuru_Czech" target="_blank" className="social-mini" style={{color: '#ff0000'}}>
                        YOUTUBE
                    </a>
                    <a href="https://www.instagram.com/thehardwareguru_czech" target="_blank" className="social-mini" style={{color: '#e1306c'}}>
                        INSTAGRAM
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
