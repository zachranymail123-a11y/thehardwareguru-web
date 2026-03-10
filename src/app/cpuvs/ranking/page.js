import React from 'react';
import { 
  ChevronLeft, 
  Trophy, 
  Zap, 
  Swords, 
  Activity, 
  Cpu,
  Medal
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU CPU ENGINE - TIER LIST & RANKING V1.0
 * Cesta: src/app/cpuvs/ranking/page.js
 * 🛡️ ARCH: Absolutní žebříček procesorů seřazený podle hrubého výkonu (performance_index).
 * 🛡️ FIX: Zajišťuje funkčnost odkazu /cpuvs/ranking a funguje jako hlavní SEO hub.
 */

export const revalidate = 3600; // Cache na 1 hodinu

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

export async function generateMetadata({ isEn = false }) {
  return {
    title: isEn 
      ? 'CPU Tier List & Performance Ranking 2025 | The Hardware Guru' 
      : 'Žebříček procesorů a absolutní srovnání výkonu | The Hardware Guru',
    description: isEn
      ? 'Ultimate CPU benchmark tier list. All modern processors ranked by raw gaming and productivity performance.'
      : 'Ultimátní žebříček procesorů. Všechny moderní procesory seřazené podle hrubého herního a pracovního výkonu.',
    alternates: {
      canonical: 'https://www.thehardwareguru.cz/cpuvs/ranking',
      languages: {
        'en': 'https://www.thehardwareguru.cz/en/cpuvs/ranking',
        'cs': 'https://www.thehardwareguru.cz/cpuvs/ranking'
      }
    }
  };
}

export default async function CpuRankingPage({ isEn = false }) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch všech CPU seřazených podle hrubého výkonu (od nejlepšího)
  const { data: cpus, error } = await supabase
    .from('cpus')
    .select('name, slug, vendor, architecture, cores, threads, boost_clock_mhz, performance_index')
    .order('performance_index', { ascending: false });

  if (error || !cpus) {
    return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>CHYBA NAČÍTÁNÍ DATABÁZE PROCESORŮ</div>;
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

        {/* 🚀 LEADERBOARD LIST */}
        <section className="leaderboard-container">
          {cpus.map((cpu, index) => {
            const vendorColor = getVendorColor(cpu.vendor);
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3;

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
                    <h2 className="cpu-name">{normalizeName(cpu.name)}</h2>
                    <div className="cpu-specs">
                       <span>{cpu.vendor}</span> • <span>{cpu.cores}C/{cpu.threads}T</span> • <span>{cpu.boost_clock_mhz ? `${cpu.boost_clock_mhz} MHz` : 'N/A'}</span>
                    </div>
                 </div>

                 {/* Score */}
                 <div className="score-container">
                    <div className="score-label">{isEn ? 'SCORE' : 'SKÓRE'}</div>
                    <div className="score-value" style={{ color: isTop3 ? '#f59e0b' : '#fff' }}>
                       <Zap size={16} fill={isTop3 ? '#f59e0b' : 'transparent'} />
                       {cpu.performance_index}
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="action-buttons">
                    <a href={`/${isEn ? 'en/' : ''}cpu/${safeSlug}`} className="btn-profile">
                      <Activity size={14} /> <span className="hide-mobile">{isEn ? 'Profile' : 'Profil'}</span>
                    </a>
                    <a href={`/${isEn ? 'en/' : ''}cpuvs`} className="btn-vs">
                      <Swords size={14} /> <span className="hide-mobile">{isEn ? 'Compare' : 'Srovnat'}</span>
                    </a>
                 </div>
              </div>
            );
          })}
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(245, 158, 11, 0.1); transform: translateX(-5px); }

        .leaderboard-container { display: flex; flex-direction: column; gap: 15px; }

        .ranking-row { display: flex; align-items: center; background: rgba(15, 17, 21, 0.95); padding: 15px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .ranking-row:hover { transform: translateX(5px); background: rgba(25, 27, 31, 0.95); border-color: rgba(255,255,255,0.1); box-shadow: 0 10px 25px rgba(0,0,0,0.6); }
        
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
        .btn-profile, .btn-vs { display: flex; align-items: center; gap: 6px; padding: 10px 15px; border-radius: 10px; font-size: 12px; font-weight: 900; text-transform: uppercase; text-decoration: none; transition: 0.2s; }
        .btn-profile { background: rgba(255,255,255,0.05); color: #d1d5db; }
        .btn-profile:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-vs { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        .btn-vs:hover { background: rgba(245, 158, 11, 0.2); transform: scale(1.05); }

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
