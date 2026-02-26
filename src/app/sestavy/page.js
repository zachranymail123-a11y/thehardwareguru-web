import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SestavyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. BEZPEČNÉ POČÍTADLO (Opraveno)
  // Místo .catch() použijeme standardní { error }, což neshodí aplikaci
  const { error: rpcError } = await supabase.rpc('increment_stat', { stat_name: 'sestavy_views' });
  
  if (rpcError) {
    // Jen vypíšeme chybu do konzole serveru, ale web pojede dál
    console.error("Chyba počítadla (nevadí, web běží):", rpcError.message);
  }

  // 2. STÁHNEME DATA
  const [{ data: builds }, { data: stats }] = await Promise.all([
    supabase.from('pc_builds').select('*').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('stats').select('value').eq('name', 'sestavy_views').single()
  ]);

  const views = stats?.value || 0;

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

        .card-header {
            background: rgba(102, 252, 241, 0.05);
            padding: 25px;
            border-bottom: 1px solid #45a29e;
            text-align: center;
        }
        .build-name { color: #fff; margin: 0; fontSize: 1.8rem; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
        .build-price { color: #66fcf1; fontSize: 1.4rem; font-weight: bold; marginTop: 10px; text-shadow: 0 0 10px rgba(102, 252, 241, 0.3); }

        .specs-container { padding: 25px; }
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
