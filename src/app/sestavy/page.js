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
        .build-card { border: 1px solid #45a29e; transition: all 0.3s ease; background: rgba(31, 40, 51, 0.8); position: relative; overflow: hidden; }
        .build-card:hover { transform: translateY(-5px); box-shadow: 0 0 25px rgba(102, 252, 241, 0.2); border-color: #66fcf1; }
        .spec-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(69, 162, 158, 0.3); }
        .spec-label { color: #45a29e; font-weight: bold; }
        .spec-val { color: #fff; text-align: right; }
        .cta-button { 
            display: block; width: 100%; padding: 15px; 
            background: linear-gradient(45deg, #ff0000, #990000); 
            color: white; text-align: center; font-weight: 900; text-transform: uppercase; 
            text-decoration: none; letter-spacing: 1px; border: none; cursor: pointer;
            margin-top: 20px; border-radius: 4px; transition: all 0.3s;
        }
        .cta-button:hover { background: linear-gradient(45deg, #ff3333, #cc0000); box-shadow: 0 0 15px rgba(255, 0, 0, 0.6); }
        .nav-link { margin: 0 15px; color: #fff; text-decoration: none; font-weight: bold; transition: color 0.3s; text-transform: uppercase; }
        .nav-link:hover { color: #66fcf1; }
      `}</style>

      {/* HLAVIČKA (Zjednodušená pro tuto podstránku) */}
      <nav style={{ padding: '20px 40px', borderBottom: '2px solid #66fcf1', background: 'rgba(11, 12, 16, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: '#66fcf1', textDecoration: 'none' }}>THE HARDWARE GURU</Link>
        <div>
            <Link href="/" className="nav-link">DOMŮ</Link>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="nav-link" style={{color: '#ff4444'}}>KICK LIVE</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' }}>
          Doporučené herní sestavy <span style={{color: '#66fcf1'}}>2026</span>
        </h1>
        <p style={{ maxWidth: '800px', margin: '0 auto 40px', fontSize: '1.1rem', color: '#c5c6c7' }}>
          Tohle jsou aktuálně nejvýhodnější kombinace hardwaru podle Gurua. Ceny a dostupnost se mění každý den, 
          takže finální doladění děláme <strong>VŽDY LIVE</strong> na streamu nebo Discordu.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          {builds?.map((build) => (
            <div key={build.id} className="build-card" style={{ padding: '30px', borderRadius: '15px' }}>
              
              <div style={{ marginBottom: '20px', borderBottom: '2px solid #66fcf1', paddingBottom: '15px' }}>
                <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', textTransform: 'uppercase' }}>{build.name}</h2>
                <div style={{ color: '#66fcf1', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '5px' }}>{build.price_range}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div className="spec-row"><span className="spec-label">CPU</span><span className="spec-val">{build.cpu}</span></div>
                <div className="spec-row"><span className="spec-label">GPU</span><span className="spec-val">{build.gpu}</span></div>
                <div className="spec-row"><span className="spec-label">RAM</span><span className="spec-val">{build.ram}</span></div>
                <div className="spec-row"><span className="spec-label">SSD</span><span className="spec-val">{build.storage}</span></div>
              </div>

              <p style={{ fontStyle: 'italic', color: '#a0a0a0', marginBottom: '20px', minHeight: '60px' }}>
                "{build.description}"
              </p>

              {/* TOHLE JE TA PAST NA ODBĚRATELE */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px dashed #45a29e' }}>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '10px' }}>
                   ⚠️ Chceš to poskládat a optimalizovat? <br/>
                   <strong>Podmínka:</strong> Sub na Kicku + Discord!
                </div>
                <a href="https://discord.com/invite/n7xThr8" target="_blank" className="cta-button">
                  CHCI TUTO SESTAVU NA MÍRU 🛠️
                </a>
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
