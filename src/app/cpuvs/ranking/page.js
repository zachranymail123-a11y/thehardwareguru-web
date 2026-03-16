import React from 'react';
import { 
  ChevronLeft, 
  Trophy, 
  Zap, 
  Swords, 
  Activity, 
  Cpu,
  Medal,
  Monitor,
  Flame,
  ArrowRight
} from 'lucide-react';

/**
 * GURU CPU ENGINE - TIER LIST & RANKING V1.3 (ULTIMATE FIX + SEO SILOING)
 * Cesta: src/app/cpuvs/ranking/page.js
 * 🛡️ FIX 1: Nativní fetch s 'no-store' = 100% bypass mrtvé Next.js cache.
 * 🛡️ FIX 2: Ošetřeno řazení nullslast - procesory bez skóre už nemizí.
 * 🛡️ FIX 3: Bezpečné čtení boost_clock_ghz vs mhz pro starší databázové záznamy.
 * 🛡️ FIX 4: Celý řádek žebříčku převeden na klikací SEO odkaz.
 * 🛡️ FIX 5: Přidán spodní Siloing rozcestník pro udržení uživatele na webu.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/processor|cpu/gi, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export async function generateMetadata(props) {
  const isEn = props?.isEn === true;
  return {
    title: isEn 
      ? 'CPU Tier List & Performance Ranking 2026 | The Hardware Guru' 
      : 'Žebříček procesorů a absolutní srovnání výkonu | The Hardware Guru',
    description: isEn
      ? 'Ultimate CPU benchmark tier list. All modern processors ranked by raw gaming and productivity performance.'
      : 'Ultimátní žebříček procesorů. Všechny moderní procesory seřazené podle hrubého herního a pracovního výkonu.',
    alternates: {
      canonical: 'https://thehardwareguru.cz/cpuvs/ranking',
      languages: {
        'en': 'https://thehardwareguru.cz/en/cpuvs/ranking',
        'cs': 'https://thehardwareguru.cz/cpuvs/ranking',
        'x-default': 'https://thehardwareguru.cz/cpuvs/ranking'
      }
    }
  };
}

// 🚀 GURU: Nativní fetch obejde cache a vytáhne fresh data
const fetchRankingData = async () => {
    if (!supabaseUrl) return [];
    
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        
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

export default async function CpuRankingPage(props) {
  const isEn = props?.isEn === true;
  const cpus = await fetchRankingData();

  if (!cpus || cpus.length === 0) {
    return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CHYBA NAČÍTÁNÍ DATABÁZE PROCESORŮ</div>;
  }

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#f59e0b');
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
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU BATTLES' : 'ZPĚT NA CPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Trophy size={16} /> {isEn ? 'PERFORMANCE LEADERBOARD' : 'ABSOLUTNÍ ŽEBŘÍČEK VÝKONU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {isEn ? 'CPU' : 'ŽEBŘÍČEK'} <br/>
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
              {isEn ? 'TIER LIST' : 'PROCESORŮ'}
            </span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0' }}>
            {isEn 
              ? 'Complete hierarchy of all processors based on raw performance index. Compare and find the best CPU for your build.' 
              : 'Kompletní hierarchie procesorů seřazená podle hrubého výkonu. Najděte ten nejlepší procesor pro vaši sestavu.'}
          </div>
        </header>

        {/* 🚀 LEADERBOARD LIST (Nyní kompletně klikací pro SEO) */}
        <section className="leaderboard-container">
          {cpus.map((cpu, index) => {
            const vendorColor = getVendorColor(cpu.vendor);
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3 && cpu.performance_index > 0;
            const boostMhz = cpu.boost_clock_mhz || (cpu.boost_clock_ghz ? cpu.boost_clock_ghz * 1000 : null);
            const profileUrl = isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`;

            return (
              <a key={safeSlug} href={profileUrl} className={`ranking-row ${isTop3 ? `top-${index + 1}` : ''}`}>
                 {/* Pozice */}
                 <div className="rank-badge">
                   {getRankIcon(index)}
                 </div>

                 {/* Vendor Bar */}
                 <div className="vendor-bar" style={{ backgroundColor: vendorColor }}></div>

                 {/* Info */}
                 <div className="cpu-info">
                    <h2 className="cpu-name">{normalizeName(cpu.name)}</h2>
                    <div className="cpu-specs">
                       <span>{cpu.vendor || 'N/A'}</span> • 
                       <span>{cpu.cores || '-'}C/{cpu.threads || '-'}T</span> • 
                       <span>{boostMhz ? `${boostMhz} MHz` : 'N/A'}</span>
                    </div>
                 </div>

                 {/* Score */}
                 <div className="score-container">
                    <div className="score-label">{isEn ? 'SCORE' : 'SKÓRE'}</div>
                    <div className="score-value" style={{ color: isTop3 ? '#f59e0b' : '#fff' }}>
                       <Zap size={16} fill={isTop3 ? '#f59e0b' : 'transparent'} />
                       {cpu.performance_index || 'N/A'}
                    </div>
                 </div>

                 {/* Fake Actions (jen pro vizuál) */}
                 <div className="action-buttons">
                    <div className="btn-profile">
                      <Activity size={14} /> <span className="hide-mobile">{isEn ? 'Profile' : 'Profil'}</span>
                    </div>
                    <div className="btn-vs" onClick={(e) => { e.preventDefault(); window.location.href = `/${isEn ? 'en/' : ''}cpuvs`; }}>
                      <Swords size={14} /> <span className="hide-mobile">{isEn ? 'Compare' : 'Srovnat'}</span>
                    </div>
                 </div>
              </a>
            );
          })}
        </section>

        {/* 🚀 GURU SILOING: ODKAZY NA DALŠÍ ROZCESTNÍKY */}
        <section style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="silo-banner-card" style={{ borderLeftColor: '#66fcf1' }}>
                <div className="silo-banner-icon" style={{ color: '#000', background: '#66fcf1' }}><Monitor size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'GPU TIER LIST' : 'ŽEBŘÍČEK GRAFIK'}</h4>
                    <p>{isEn ? 'Check out the performance ranking of graphics cards.' : 'Podívejte se na výkonnostní žebříček grafických karet.'}</p>
                </div>
            </a>
            <a href={isEn ? "/en/bottleneck" : "/bottleneck"} className="silo-banner-card" style={{ borderLeftColor: '#a855f7' }}>
                <div className="silo-banner-icon" style={{ color: '#fff', background: '#a855f7' }}><Activity size={28} /></div>
                <div className="silo-banner-text">
                    <h4>{isEn ? 'BOTTLENECK CALCULATOR' : 'KALKULAČKA BOTTLENECKU'}</h4>
                    <p>{isEn ? 'Find out if your CPU is holding back your GPU.' : 'Zjistěte, zda váš procesor zbytečně nebrzdí grafickou kartu.'}</p>
                </div>
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(245, 158, 11, 0.1); transform: translateX(-5px); }

        .leaderboard-container { display: flex; flex-direction: column; gap: 15px; }

        .ranking-row { display: flex; align-items: center; background: rgba(15, 17, 21, 0.95); padding: 15px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.3); cursor: pointer; }
        .ranking-row:hover { transform: translateX(5px); background: rgba(25, 27, 31, 0.95); border-color: rgba(255,255,255,0.1); box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
        .ranking-row:hover .cpu-name { color: #f59e0b; transition: 0.2s; }
        
        .top-1 { border: 1px solid rgba(245, 158, 11, 0.3); background: linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%); }
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
        .btn-profile, .btn-vs { display: flex; align-items: center; gap: 6px; padding: 10px 15px; border-radius: 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; transition: 0.2s; }
        .btn-profile { background: rgba(255,255,255,0.05); color: #d1d5db; }
        .btn-vs { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); z-index: 10; }
        .btn-vs:hover { background: rgba(245, 158, 11, 0.2); transform: scale(1.05); }

        /* 🚀 GURU SILOING STYLY */
        .silo-banner-card { flex: 1; min-width: 300px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; align-items: center; gap: 20px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-left-width: 5px; }
        .silo-banner-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.02); }
        .silo-banner-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .silo-banner-text h4 { margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; font-weight: 950; }
        .silo-banner-text p { margin: 0; color: #9ca3af; font-size: 0.9rem; }

        @media (max-width: 768px) {
          .ranking-row { flex-wrap: wrap; padding: 15px; }
          .rank-badge { width: 40px; }
          .vendor-bar { margin-right: 15px; }
          .cpu-info { min-width: 100%; order: 4; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
          .score-container { border-right: none; padding-right: 0; margin-right: auto; flex-direction: row; gap: 10px; align-items: baseline; }
          .hide-mobile { display: none; }
          .btn-profile, .btn-vs { padding: 10px; }
          .silo-banner-card { flex-direction: column; text-align: center; }
        }
      `}} />
    </div>
  );
}
