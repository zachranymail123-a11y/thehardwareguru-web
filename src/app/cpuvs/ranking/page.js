import React from 'react';
import { 
 ChevronLeft, Trophy, Zap, Cpu, Medal, Monitor, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU CPU RANKING V2.1 (MOBILE OPTIMIZED)
 * 🚀 CÍL: Maximální monetizace CPU žebříčku a perfektní mobilní zobrazení.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text?.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() || 'unknown';
const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const fetchRankingData = async () => {
    if (!supabaseUrl) return [];
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
};

export default async function CpuRankingPage(props) {
  const isEn = props?.isEn === true;
  const cpus = await fetchRankingData();

  if (!cpus || cpus.length === 0) return <div style={{ color: '#fff', background: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DATABASE ERROR</div>;

  return (
    <div className="guru-ranking-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="ranking-badge">
            <Trophy size={18} /> GURU RANKING SYSTEM
          </div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: 1.0 }}>
            {isEn ? 'CPU' : 'ŽEBŘÍČEK'} <span style={{ color: '#f59e0b', textShadow: '0 0 40px rgba(245, 158, 11, 0.4)' }}>{isEn ? 'TIER LIST' : 'PROCESORŮ'}</span>
          </h1>
        </header>

        {/* 🔥 TOP AD SLOT - STRIKTNÍ SEPARACE */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <div className="ranking-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cpus.map((cpu, index) => {
            if (!cpu || !cpu.name) return null;
            const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24';
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3;

            return (
              <React.Fragment key={cpu.id || index}>
                <Link href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} className="ranking-card">
                    <div className="rank-num" style={{ color: isTop3 ? '#f59e0b' : '#4b5563' }}>{index + 1}.</div>
                    <div className="v-bar" style={{ backgroundColor: vendorColor }}></div>
                    <div style={{ flex: 1 }}>
                      <h2 className="cpu-title">{normalizeName(cpu.name)}</h2>
                      <div className="cpu-meta">{cpu.vendor} • {cpu.cores || '?'}/{cpu.threads || '?'}C • {cpu.boost_clock_mhz || 'N/A'} MHz</div>
                    </div>
                    <div className="score-box">
                      <div className="score-label">PERFORMANCE</div>
                      <div className="score-val" style={{ color: isTop3 ? '#f59e0b' : '#fff' }}>
                        <Zap size={18} fill={isTop3 ? '#f59e0b' : 'none'} /> {cpu.performance_index || '0'}
                      </div>
                    </div>
                    <ChevronRight size={20} className="arrow-icon" />
                </Link>

                {/* 🔥 IN-FEED AD SLOT - STRIKTNÍ SEPARACE (POUZE MOBIL) */}
                {index === 4 && (
                  <div className="ad-mobile-wrapper" style={{ margin: '10px 0' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="silo-footer-grid" style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
           <Link href="/gpuvs/ranking" className="silo-card" style={{ borderLeft: '4px solid #66fcf1' }}>
              <Monitor size={32} color="#66fcf1" />
              <div><h4>ŽEBŘÍČEK GRAFIK</h4><p>Srovnání výkonu GPU</p></div>
           </Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .ranking-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 8px 25px; border: 1px solid rgba(245,158,11,0.4); border-radius: 50px; background: rgba(245,158,11,0.1); margin-bottom: 20px; }
        .ranking-card { display: flex; align-items: center; background: rgba(15, 17, 21, 0.98); padding: 20px 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
        .ranking-card:hover { transform: translateX(8px); background: rgba(25, 27, 31, 1); border-color: rgba(245, 158, 11, 0.3); }
        .rank-num { width: 50px; font-size: 24px; font-weight: 950; }
        .v-bar { width: 4px; height: 50px; border-radius: 10px; margin-right: 25px; }
        .cpu-title { font-size: 1.4rem; font-weight: 950; margin: 0; text-transform: uppercase; }
        .cpu-meta { font-size: 11px; color: #6b7280; font-weight: 900; }
        .score-box { text-align: center; padding: 0 40px; border-left: 1px solid rgba(255,255,255,0.05); margin: 0 15px; }
        .score-label { font-size: 9px; color: #6b7280; font-weight: 950; }
        .score-val { font-size: 26px; font-weight: 950; display: flex; align-items: center; gap: 8px; }
        .arrow-icon { color: #4b5563; }
        .silo-card { background: rgba(15, 17, 21, 0.98); padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 20px; text-decoration: none; color: #fff; transition: 0.3s; }
        .silo-card:hover { transform: translateY(-5px); }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
          .guru-ranking-wrapper { padding-top: 80px !important; }
          .inner-container { padding: 0 15px !important; }
          .ad-desktop-wrapper { display: none !important; }
          .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
          .main-h1 { font-size: 1.8rem !important; }
          .ranking-card { padding: 15px; flex-wrap: wrap; border-radius: 18px; }
          .score-box { border-left: none; padding: 10px 0; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); margin: 10px 0 0 0; }
          .rank-num { width: 30px; font-size: 18px; }
          .v-bar { margin-right: 15px; height: 40px; }
          .cpu-title { font-size: 1.1rem; }
          .arrow-icon { display: none; }
        }
      `}} />
    </div>
  );
}
