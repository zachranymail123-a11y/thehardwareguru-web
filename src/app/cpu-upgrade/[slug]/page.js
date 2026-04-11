import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { 
  ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar,
  Trophy, Zap, Gamepad2, LayoutList, BarChart3, TrendingUp,
  ArrowRight, ExternalLink, ArrowUpCircle, Monitor, Crosshair,
  Cpu, Info, AlertTriangle, ShoppingCart
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; 
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU UPGRADE - DETAIL V3.4 (DEFINITIVE HEUREKA FIX)
 * 🚀 CÍL: Fix Heureka linků na www.heureka.cz s parametrem h[fraze] a Text%20link.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; 
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
  
  const attempts = [`slug.eq.${slug}`, `slug.eq.${cleanSlug}`, `slug.ilike.*${cleanSlug.replace(/-to-.*$/, '')}*` ];
  for (const filter of attempts) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, 
        cache: 'no-store'
      });
      if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data[0];
      }
    } catch(e) {}
  }
  return null;
});

export async function generateMetadata(props) {
  const { slug } = await props.params;
  const h = headers();
  const fullUrl = h.get('x-url') || h.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || slug?.startsWith('en-');
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) return { title: '404 | Hardware Guru' };
  const { oldCpu, newCpu } = upgrade;
  const perfDiff = Math.round((newCpu.performance_index / oldCpu.performance_index - 1) * 100);
  return { title: isEn ? `Upgrade ${oldCpu.name} to ${newCpu.name} (+${perfDiff}% Perf)` : `Upgrade z ${oldCpu.name} na ${newCpu.name} (+${perfDiff} % výkon)` };
}

export default async function App(props) {
  const { slug } = await props.params;
  const h = headers();
  const fullUrl = h.get('x-url') || h.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || slug?.startsWith('en-');

  const upgrade = await getUpgradeData(slug);
  if (!upgrade || !upgrade.oldCpu || !upgrade.newCpu) notFound();

  const { oldCpu: cpuA, newCpu: cpuB } = upgrade;
  const title = isEn ? (upgrade.title_en || `Upgrade from ${cpuA.name} to ${cpuB.name}`) : upgrade.title_cs;
  const finalPerfDiff = Math.round((cpuB.performance_index / cpuA.performance_index - 1) * 100);

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#f59e0b', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const searchName = normalizeName(cpuB.name).trim();
  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(searchName)}&tag=thehardware07-20`;
  const smartyLink = `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(searchName)}`)}`;
  
  // 🔥 DEFINITIVNÍ FIX DLE TVÝCH SCREENŮ (včetně Text%20link) 🔥
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

  return (
    <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="upgrade-badge"><ArrowUpCircle size={14} /> {isEn ? 'GURU UPGRADE ANALYSIS' : 'GURU ANALÝZA UPGRADU'}</div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>{title}</h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="gpu-card-box old-cpu" style={{ borderTop: '5px solid #4b5563', opacity: 0.7 }}><h2 className="gpu-name-text">{normalizeName(cpuA.name)}</h2></div>
            <div className="vs-badge" style={{ background: '#f59e0b' }}>➜</div>
            <div className="gpu-card-box new-cpu" style={{ borderTop: '5px solid #f59e0b', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}><h2 className="gpu-name-text">{normalizeName(cpuB.name)}</h2></div>
        </div>

        {/* 🔥 OPRAVENÁ AFFILIATE SEKCE 🔥 */}
        <div className="affiliate-cta-grid" style={{ marginBottom: '40px', borderColor: '#f59e0b40' }}>
            <div className="affiliate-col">
                <div className="affiliate-col-title" style={{ color: '#f59e0b' }}><ShoppingCart size={16} /> {isEn ? `BUY ${normalizeName(cpuB.name)}` : `KOUPIT ${normalizeName(cpuB.name)}`}</div>
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn"><ShoppingCart size={16} /> CHECK DEALS ON AMAZON</a>
                    ) : (
                        <>
                            <a href={smartyLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={16} /> Smarty.cz</a>
                            <a href={heurekaLink} data-trixam-positionid="276026" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link"><ShoppingCart size={16} /> Heureka.cz</a>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* 🔥 GURU TOOLS 🔥 */}
        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> {isEn ? 'BOTTLENECK' : 'KONTROLA'}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK KALKULAČKA'}</h3>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn-link">{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
                </div>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> {isEn ? 'FPS TEST' : 'HERNÍ VÝKON'}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn-link-cyan">{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
            <div className="content-box-style analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={24} color="#f59e0b" /> {isEn ? 'Upgrade Analysis' : 'Analýza upgradu'}</h2>
                <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={finalPerfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
            </div>
        </section>

        {!isEn && (<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><HeurekaButtons isEn={false} manualSearch={cpuB.name} positionId="276026" /></div>)}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#f59e0b' }}><LayoutList size={28} /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
          <div className="table-wrapper">
              {[
                { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
                { label: isEn ? 'BOOST CLOCK' : 'BOOST TAKT', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
                { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true }
              ].map((row, i) => (
                <div key={i} className="spec-row-style">
                  <div style={getWinnerStyle(row.winA, row.winB, row.lower)} className="spec-val-side">{row.valA}</div>
                  <div className="table-label">{row.label}</div>
                  <div style={getWinnerStyle(row.winB, row.winA, row.lower)} className="spec-val-side">{row.valB}</div>
                </div>
              ))}
          </div>
        </section>

        <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor"><SeznamAd zoneId={408654} width={970} height={90} /></div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; }
        .gpu-name-text { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 32px; border: 5px solid #0f1115; color: #000; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-val-side { flex: 1; text-align: center; font-size: 18px; font-weight: 950; }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        
        /* 🔥 FIX TLAČÍTEK 🔥 */
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; color: #000; }
        .amazon-btn { background: #f59e0b; border: 2px solid #fbbf24; }
        .smarty-btn { background: #facc15; border: 2px solid #fef08a; }
        .heureka-btn { background: #3b82f6; color: #fff; border: 2px solid #60a5fa; }
        
        .tool-btn-link, .tool-btn-link-cyan { display: block; text-align: center; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 950; text-transform: uppercase; transition: 0.3s; }
        .tool-btn-link { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
        .tool-btn-link-cyan { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid rgba(102, 252, 241, 0.3); }
        .guru-deals-btn { background: #f97316; color: #fff; border-radius: 12px; padding: 18px 30px; text-decoration: none; font-weight: 950; text-transform: uppercase; }
        .guru-support-btn { background: #eab308; color: #000; border-radius: 12px; padding: 18px 30px; text-decoration: none; font-weight: 950; text-transform: uppercase; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        @media (max-width: 768px) {
            .guru-grid-ring { grid-template-columns: 1fr !important; }
            .vs-badge { margin: 10px auto; transform: rotate(90deg); width: 50px; height: 50px; font-size: 24px; }
            .spec-row-style { padding: 15px 10px; flex-direction: column; gap: 10px; }
            .table-label { width: 100%; order: -1; }
            .affiliate-btn-wrap { flex-direction: column; }
            .guru-buy-winner-btn { max-width: 100%; }
        }
      `}} />
    </div>
  );
}
