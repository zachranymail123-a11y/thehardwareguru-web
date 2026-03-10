import React from 'react';
import { 
  ChevronLeft, 
  Trophy, 
  Zap, 
  Swords, 
  Activity, 
  Gamepad2,
  Medal
} from 'lucide-react';

/**
 * GURU GPU ENGINE - TIER LIST & RANKING V1.2 (ULTIMATE FIX)
 * Cesta: src/app/gpuvs/ranking/page.js
 * 🛡️ FIX 1: Nativní fetch s 'no-store' = 100% bypass mrtvé Next.js cache (Supabase klient odstraněn).
 * 🛡️ FIX 2: Ošetřeno řazení nullslast - grafiky bez skóre už nemizí, jen spadnou na konec tabulky!
 * 🛡️ FIX 3: Vizuální motiv přizpůsoben GPU sekci (neonově modrá #66fcf1).
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/graphics|gpu/gi, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn 
      ? 'GPU Tier List & Performance Ranking 2025 | The Hardware Guru' 
      : 'Žebříček grafických karet a absolutní srovnání výkonu | The Hardware Guru',
    description: isEn
      ? 'Ultimate GPU benchmark tier list. All modern graphics cards ranked by raw gaming performance.'
      : 'Ultimátní žebříček grafických karet. Všechny moderní grafiky seřazené podle hrubého herního výkonu.',
    alternates: {
      canonical: 'https://www.thehardwareguru.cz/gpuvs/ranking',
      languages: {
        'en': 'https://www.thehardwareguru.cz/en/gpuvs/ranking',
        'cs': 'https://www.thehardwareguru.cz/gpuvs/ranking'
      }
    }
  };
}

// 🚀 GURU: Nativní fetch obejde veškerou otravnou cache v Next.js a vytáhne 100% fresh data
const fetchRankingData = async () => {
    if (!supabaseUrl) return [];
    
    try {
        // nullslast = klíčová věc. Grafiky bez výkonu neskryjeme, ale dáme je na konec!
        const url = `${supabaseUrl}/rest/v1/gpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        
        const res = await fetch(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
};

export default async function GpuRankingPage(props) {
  const isEn = props?.isEn === true;
  const gpus = await fetchRankingData();

  if (!gpus || gpus.length === 0) {
    return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CHYBA NAČÍTÁNÍ DATABÁZE GRAFIK</div>;
  }

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#0071c5');
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={28} color="#f59e0b" />;
    if (index === 1) return <Medal size={24} color="#d1d5db" />;
    if (index === 2) return <Medal size={24} color="#b45309" />;
    return <span className="rank-text">{index + 1}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU BATTLES' : 'ZPĚT NA GPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Trophy size={16} /> {isEn ? 'PERFORMANCE LEADERBOARD' : 'ABSOLUTNÍ ŽEBŘÍČEK VÝKONU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'GPU' : 'ŽEBŘÍČEK'} <br/>
            <span style={{ color: '#66fcf1', textShadow: '0 0 30px rgba(102, 252, 241, 0.5)' }}>
              {isEn ? 'TIER LIST' : 'GRAFIK'}
            </span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
              ? 'Complete hierarchy of all graphics cards based on raw gaming performance index. Compare and find the best GPU for your build.' 
              : 'Kompletní hierarchie grafických karet seřazená podle hrubého herního výkonu. Najděte tu nejlepší grafiku pro vaši sestavu.'}
          </div>
        </header>

        {/* 🚀 LEADERBOARD LIST */}
        <section className="leaderboard-container">
          {gpus.map((gpu, index) => {
            const vendorColor = getVendorColor(gpu.vendor);
            const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
            const isTop3 = index < 3 && gpu.performance_index > 0; // Top 3 jen pro ty, co mají reálné skóre

            return (
              <div key={safeSlug} className={`ranking-row ${isTop3 ? `top-${index + 1}` : ''}`}>
                 {/* Pozice */}
                 <div className="rank-badge">
                   {getRankIcon(index)}
                 </div>

                 {/* Vendor Bar */}
                 <div className="vendor-bar" style={{ backgroundColor: vendorColor }}></div>

                 {/* Info */}
                 <div className="cpu-info">
                    <h2 className="cpu-name">{normalizeName(gpu.name)}</h2>
                    <div className="cpu-specs">
                       <span>{gpu.vendor || 'N/A'}</span> • 
                       <span>{gpu.vram_gb ? `${gpu.vram_gb} GB VRAM` : 'N/A VRAM'}</span> • 
                       <span>{gpu.architecture || '-'}</span>
                    </div>
                 </div>

                 {/* Score */}
                 <div className="score-container">
                    <div className="score-label">{isEn ? 'SCORE' : 'SKÓRE'}</div>
                    <div className="score-value" style={{ color: isTop3 ? '#66fcf1' : '#fff' }}>
                       <Zap size={16} fill={isTop3 ? '#66fcf1' : 'transparent'} />
                       {gpu.performance_index || 'N/A'}
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="action-buttons">
                    <a href={`/${isEn ? 'en/' : ''}gpu-performance/${safeSlug}`} className="btn-profile">
                      <Activity size={14} /> <span className="hide-mobile">{isEn ? 'Profile' : 'Profil'}</span>
                    </a>
                    <a href={`/${isEn ? 'en/' : ''}gpuvs`} className="btn-vs">
                      <Swords size={14} /> <span className="hide-mobile">{isEn ? 'Compare' : 'Srovnat'}</span>
                    </a>
                 </div>
              </div>
            );
          })}
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }

        .leaderboard-container { display: flex; flex-direction: column; gap: 15px; }

        .ranking-row { display: flex; align-items: center; background: rgba(15, 17, 21, 0.95); padding: 15px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .ranking-row:hover { transform: translateX(5px); background: rgba(25, 27, 31, 0.95); border-color: rgba(255,255,255,0.1); box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
        
        .top-1 { border: 1px solid rgba(102, 252, 241, 0.3); background: linear-gradient(90deg, rgba(102, 252, 241, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%); }
        .top-2 { border: 1px solid rgba(209, 213, 219, 0.3); background: linear-gradient(90deg, rgba(209, 213, 219, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%); }
        .top-3 { border: 1px solid rgba(180, 83, 9, 0.3); background: linear-gradient(90deg, rgba(180, 83, 9, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%); }

        .rank-badge { width: 50px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
        .rank-text { font-size: 22px; font-weight: 950; color: #4b5563; }

        .vendor-bar { width: 4px; height: 40px; border-radius: 10px; margin-right: 20px; flex-shrink: 0; }

        .cpu-info { flex: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        .cpu-name { font-size: 1.2rem; font-weight: 950; margin: 0 0 5px 0; color: #fff; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cpu-specs { font-size: 0.8rem; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; display: flex; gap: 8px; flex-wrap: wrap; }
        
        .score-container { display: flex; flex-direction: column; align-items: center; padding: 0 30px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); margin-right: 20px; }
        .score-label { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .score-value { font-size: 22px; font-weight: 950; display: flex; align-items: center; gap: 6px; }

        .action-buttons { display: flex; gap: 10px; flex-shrink: 0; }
        .btn-profile, .btn-vs { display: flex; align-items: center; gap: 6px; padding: 10px 15px; border-radius: 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; text-decoration: none; transition: 0.2s; }
        .btn-profile { background: rgba(255,255,255,0.05); color: #d1d5db; }
        .btn-profile:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-vs { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid rgba(102, 252, 241, 0.2); }
        .btn-vs:hover { background: rgba(102, 252, 241, 0.2); transform: scale(1.05); }

        @media (max-width: 768px) {
          .ranking-row { flex-wrap: wrap; padding: 15px; }
          .rank-badge { width: 40px; }
          .vendor-bar { margin-right: 15px; }
          .cpu-info { min-width: 100%; order: 4; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
          .score-container { border-right: none; padding-right: 0; margin-right: auto; flex-direction: row; gap: 10px; align-items: baseline; }
          .hide-mobile { display: none; }
          .btn-profile, .btn-vs { padding: 10px; }
        }
      `}} />
    </div>
  );
}
