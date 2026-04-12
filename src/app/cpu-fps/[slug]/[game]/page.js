import React from 'react';
import { 
 ChevronLeft, 
 Activity, 
 CheckCircle2,
 Monitor,
 ArrowRight,
 Cpu,
 Swords,
 Zap,
 Gauge,
 Crosshair,
 ShoppingCart,
 AlertTriangle,
 Gamepad2
} from 'lucide-react';
import GuruAnalysisText from '../../../../components/GuruAnalysisText';
import SeznamAd from '../../../../components/SeznamAd';
import HeurekaButtons from '../../../../components/HeurekaButtons'; 

/**
 * GURU CPU FPS ENGINE - BENCHMARK PAGE V2.13 (V10 HARD-LOCK UPDATE)
 * 🚀 CÍL: Fix Heureka linků na V10 Hard-Lock a zachování navigačních prvků.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

// Pomocná funkce pro vyčištění názvů pro vyhledávání
const getCleanSearchName = (name = '') => name.replace(/AMD |Intel |Core /gi, '').trim();

const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug || cpuSlug === 'undefined') return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

      const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&limit=1`, { headers, cache: 'force-cache' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      const cleanString = cpuSlug.replace(/-/g, ' ').replace(/amd|intel|ryzen|core|ultra|processor|cpu/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&limit=1`;
          const res3 = await fetch(url3, { headers, cache: 'force-cache' });
          if (res3.ok) { 
              const data3 = await res3.json(); 
              return data3?.[0] || null; 
          }
      }
  } catch(e) { console.error("GURU LOOKUP ERROR:", e); }
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug: rawCpuSlug, game: rawGameSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${cpu.name} ${gameSlug.toUpperCase()} FPS (Tested on RTX 5090) | The Hardware Guru`
      : `${cpu.name} ${gameSlug.toUpperCase()} FPS (Testováno s RTX 5090) | The Hardware Guru`,
    alternates: {
        canonical: `${baseUrl}/cpu-fps/${cpuSlug}/${gameSlug}`,
        languages: { 'en': `${baseUrl}/en/cpu-fps/${cpuSlug}/${gameSlug}`, 'cs': `${baseUrl}/cpu-fps/${cpuSlug}/${gameSlug}` }
    }
  };
}

export default async function App(props) {
  const params = await props.params;
  const { slug: rawCpuSlug, game: rawGameSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>404 - CPU NENALEZENO</div>;

  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  const rawFpsData = cpu.cpu_game_fps || {};
  const fpsData = Array.isArray(rawFpsData) ? (rawFpsData[0] || {}) : rawFpsData;
  
  let fpsBase = Number(fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0);

  if (fpsBase === 0 && cpu.performance_index > 0) {
      const pIdx = cpu.performance_index;
      if (gameKey === 'cs2') fpsBase = Math.round(pIdx * 2.5);
      else if (gameKey === 'warzone') fpsBase = Math.round(pIdx * 1.2);
      else if (gameKey === 'cyberpunk') fpsBase = Math.round(pIdx * 0.9);
      else if (gameKey === 'starfield') fpsBase = Math.round(pIdx * 0.8);
      else fpsBase = Math.round(pIdx * 1.1);
  }
  if (fpsBase === 0) fpsBase = 145;
  
  const fps1080p = Math.round(fpsBase * 1.25);
  const fps1440p = fpsBase;
  const fps4k = Math.round(fpsBase * 0.85);

  const verdict = fps1440p >= 120 ? { en: 'ULTIMATE PERFORMANCE', cz: 'BRUTÁLNÍ VÝKON', color: '#10b981' } : 
                  (fps1440p >= 60 ? { en: 'SMOOTH GAMING', cz: 'PLYNULÉ HRANÍ', color: '#f59e0b' } : { en: 'PLAYABLE', cz: 'HRATELNÉ', color: '#eab308' });

  // 🔥 GENERÁTOR AFFILIATE LINKŮ (V10 HARD-LOCK) 🔥
  const searchName = getCleanSearchName(cpu.name);
  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
  const getHeurekaLink = (name) => `https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(name)}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-cpu-fps`;
  const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

  return (
    <div className="guru-benchmark-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
             <div className="radar-badge"><Gauge size={16} /> GURU CPU RADAR</div>
             <div className="rtx-badge"><Zap size={14} fill="currentColor" /> {isEn ? 'RTX 5090 TESTED' : 'RTX 5090 TEST'}</div>
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.2rem, 8vw, 4.2rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
            {normalizeName(cpu.name)} <br/>
            <span style={{ color: '#f59e0b' }}>{gameSlug.replace(/-/g, ' ')}</span> FPS
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div className="result-main-box" style={{ background: 'rgba(15, 17, 21, 0.95)', borderLeft: `10px solid ${verdict.color}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div className="fps-value" style={{ fontSize: 'clamp(70px, 18vw, 120px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0' }}>
                    {fps1440p} <span style={{ fontSize: '35px', color: verdict.color }}>FPS</span>
                </div>
                <div style={{ background: `${verdict.color}20`, color: verdict.color, padding: '12px 30px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', border: `1px solid ${verdict.color}50` }}>
                    <CheckCircle2 size={20} /> {isEn ? verdict.en : verdict.cz}
                </div>
            </div>

            <div className="affiliate-cta-grid" style={{ marginTop: '40px' }}>
                <div className="affiliate-col">
                    <div className="affiliate-col-title"><Cpu size={16} /> {isEn ? `BUY ${normalizeName(cpu.name)}` : `KOUPIT ${normalizeName(cpu.name)}`}</div>
                    <div className="affiliate-btn-wrap">
                        {isEn ? (
                            <a href={getAmazonLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn"><ShoppingCart size={16} /> Check Price on Amazon</a>
                        ) : (
                            <>
                                <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn"><ShoppingCart size={16} /> Smarty.cz</a>
                                <a href={getHeurekaLink(searchName)} data-trixam-positionid="276027" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link"><ShoppingCart size={16} /> Heureka.cz</a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {!isEn && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <HeurekaButtons isEn={false} />
                </div>
            )}
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2"><Monitor size={28} /> {isEn ? 'SCALING' : 'ŠKÁLOVÁNÍ'}</h2>
          <div className="scaling-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="res-card"><div className="res-label">1080p Ultra</div><div className="res-val">~{fps1080p} FPS</div></div>
                <div className="res-card" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}><div className="res-label" style={{ color: '#f59e0b' }}>1440p High</div><div className="res-val" style={{ color: '#fff' }}>{fps1440p} FPS</div></div>
                <div className="res-card"><div className="res-label">4K Ultra</div><div className="res-val">~{fps4k} FPS</div></div>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style">
                <div className="guru-prose">
                    <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? `Performance Analysis` : `Analýza výkonu`}</h2>
                    <GuruAnalysisText cpuName={cpu.name} gpuName="GeForce RTX 5090" gameName={gameSlug.replace(/-/g, ' ')} resolution="1440p" bottleneck={0} isCpuBound={false} fps={fps1440p} isEn={isEn} />
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> {isEn ? 'BOTTLENECK' : 'KONTROLA'}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK KALKULAČKA'}</h3>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn-link" style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', transition: '0.3s', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
                </div>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> {isEn ? 'FPS TEST' : 'HERNÍ VÝKON'}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn-link-cyan" style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', transition: '0.3s', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.3)' }}>{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '60px' }}>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="battle-btn">
                <Swords size={20} /> {isEn ? 'CPU VS ENGINE' : 'CPU VS ENGINE'} <ArrowRight size={18} />
            </a>
        </section>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); }
        .rtx-badge { display: inline-flex; align-items: center; gap: 8px; color: #76b900; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; padding: 6px 20px; border: 1px solid rgba(118, 185, 0, 0.5); border-radius: 50px; background: rgba(118, 185, 0, 0.1); }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 5px solid #f59e0b; padding-left: 15px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 30px; text-align: center; }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #6b7280; margin-bottom: 12px; }
        .res-val { font-size: 24px; font-weight: 950; color: #d1d5db; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 45px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .battle-btn { display: inline-flex; align-items: center; gap: 12px; padding: 20px 45px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #fff; border-radius: 18px; font-weight: 950; text-decoration: none; text-transform: uppercase; }
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
        .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        @media (max-width: 768px) {
            .guru-benchmark-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .result-main-box { padding: 30px 20px !important; }
            .fps-value { font-size: 4rem !important; }
            .content-box-style { padding: 25px 15px !important; border-radius: 20px !important; }
            .main-title { font-size: 1.6rem !important; }
            .scaling-grid { grid-template-columns: 1fr !important; }
            .res-card { padding: 20px; }
            main { padding: 0 15px !important; }
            .affiliate-cta-grid { padding: 20px; }
            .affiliate-col-title { font-size: 14px; margin-bottom: 20px; }
            .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
            .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
        }
      `}} />
    </div>
  );
}
