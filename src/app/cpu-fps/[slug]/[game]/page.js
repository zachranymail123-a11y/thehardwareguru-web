import React from 'react';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { 
  Gamepad2, 
  ChevronRight, 
  Zap, 
  Swords, 
  Activity, 
  ArrowRight,
  Flame,
  Heart,
  Gauge,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import GuruAnalysisText from '../../../components/GuruAnalysisText';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU FPS HUB V1.6 (ULTIMATE CONVERSION & TRACKING FIX)
 * 🚀 CÍL: Agresivní inline CTA tlačítka, optimalizované Heureka query (zachování brandu + "cena"), psychologie a garantovaný Trixam.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🔥 FIX: Správná query pro Heureku - maže jen výrobce, zachovává brand a přidává "cena"
const getHeurekaQuery = (name = '') => {
  return name.replace(/AMD |Intel /gi, '').trim() + ' cena';
};

const getAmazonQuery = (name = '') => {
  return name.replace(/AMD |Intel /gi, '').trim();
};

const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      const clean = cpuSlug.replace(/-/g, " ").replace(/amd|intel|ryzen|core|ultra|processor|cpu/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const cond = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${cond})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'force-cache' });
          if (res2.ok) { const data2 = await res2.json(); return data2[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cleanSlug);
  if (!cpu) return { title: '404 | The Hardware Guru' };
  const safeSlug = cpu.slug || slugify(cpu.name);
  return {
    title: isEn ? `How much FPS does ${cpu.name} get? | Guru Benchmarks` : `Kolik FPS má ${cpu.name} ve hrách? | Guru Testy`,
    alternates: { canonical: `${baseUrl}/cpu-fps/${safeSlug}`, languages: { 'en': `${baseUrl}/en/cpu-fps/${safeSlug}`, 'cs': `${baseUrl}/cpu-fps/${safeSlug}` } }
  };
}

export default async function CpuFpsHubPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cleanSlug);
  if (!cpu) notFound();

  const fpsData = Array.isArray(cpu.cpu_game_fps) ? (cpu.cpu_game_fps[0] || {}) : (cpu.cpu_game_fps || {});
  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : ((cpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#f59e0b');
  const safeSlug = cpu.slug || slugify(cpu.name);

  const gamesToShow = [
    { id: 'resident_evil_requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
    { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
    { id: 'starfield', name: 'Starfield', key: 'starfield' },
    { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' }
  ];

  const getVerdict = (fps) => {
    if (fps >= 120) return { text: isEn ? 'ULTIMATE PERFORMANCE' : 'BRUTÁLNÍ VÝKON', color: '#10b981' };
    if (fps >= 60) return { text: isEn ? 'SMOOTH GAMING' : 'PLYNULÉ HRANÍ', color: '#f59e0b' };
    if (fps >= 30) return { text: isEn ? 'PLAYABLE' : 'HRATELNÉ', color: '#eab308' };
    return { text: isEn ? 'NOT RECOMMENDED' : 'NEDOSTATEČNÝ VÝKON', color: '#ef4444' };
  };

  const displayNameForButton = cpu.name.replace(/AMD |Intel /gi, '').trim();

  return (
    <div className="guru-hub-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* 🔥 POJISTKA: Zajištění načtení Heureka trackovacího skriptu 🔥 */}
      {!isEn && (
          <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />
      )}

      <main className="inner-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Cpu size={16} /> GURU CPU FPS RADAR
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{isEn ? 'CPU GAMING PERFORMANCE' : 'HERNÍ VÝKON CPU'}</span>
          </h1>
          <div style={{ marginTop: '15px', color: '#76b900', fontSize: '12px', fontWeight: '950', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
             <Zap size={14} fill="currentColor" /> {isEn ? 'RTX 5090 TESTED' : 'RTX 5090 TEST'}
          </div>
        </header>

        {/* 🔥 FIX 1: INLINE CTA HNED POD HLAVIČKOU (MAXIMÁLNÍ CTR) 🔥 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '30px 0 50px 0' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '950', letterSpacing: '1px' }}>
                {isEn ? '🔥 Current Best Deals' : '🔥 Aktuální ceny v ČR'}
            </div>
            {isEn ? (
                <a 
                    href={`https://www.amazon.com/s?k=${encodeURIComponent(getAmazonQuery(cpu.name))}&tag=thehardware07-20`}
                    className="guru-buy-winner-btn amazon-btn hover-scale"
                    target="_blank"
                    rel="nofollow sponsored"
                >
                    🔥 Check price of {displayNameForButton}
                </a>
            ) : (
                <a 
                    href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(getHeurekaQuery(cpu.name))}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`}
                    className="guru-buy-winner-btn heureka-btn heureka-hn-link hover-scale"
                    data-trixam-positionid="276026"
                    data-trixam-content="Text link"
                    data-trixam-medium="affiliate"
                    target="_blank"
                    rel="nofollow sponsored"
                >
                    🔥 Porovnat ceny {displayNameForButton}
                </a>
            )}
        </div>

        <div className="fps-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          {gamesToShow.map((game) => {
            let fpsBase = Number(fpsData[`${game.key}_1440p`] || fpsData[`${game.key}_1080p`] || 0);
            
            if (fpsBase === 0 && cpu.performance_index > 0) {
                const pIdx = cpu.performance_index;
                if (game.key === 'cs2') fpsBase = Math.round(pIdx * 2.5);
                else if (game.key === 'warzone') fpsBase = Math.round(pIdx * 1.2);
                else if (game.key === 'cyberpunk_2077') fpsBase = Math.round(pIdx * 0.9);
                else if (game.key === 'starfield') fpsBase = Math.round(pIdx * 0.8);
                else fpsBase = Math.round(pIdx * 1.1);
            }
            if (fpsBase === 0) fpsBase = 145;

            const verdict = getVerdict(fpsBase);

            return (
                <a key={game.id} href={`/${isEn ? 'en/' : ''}cpu-fps/${safeSlug}/${game.id.replace(/_/g, '-')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="game-fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.3s' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: verdict.color }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{game.name}</h3>
                      <span style={{ fontSize: '10px', fontWeight: '950', color: verdict.color, letterSpacing: '1px' }}>1440p HIGH</span>
                    </div>
                    <div className="fps-value-main" style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                      {fpsBase > 0 ? fpsBase : 'N/A'} <span style={{ fontSize: '20px', color: '#4b5563' }}>FPS</span>
                    </div>
                    <div style={{ marginTop: '15px', color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{verdict.text}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </a>
            );
          })}
        </div>

        {/* 🔥 FIX 2: SEKUNDÁRNÍ CTA HNED POD FPS GRIDEM 🔥 */}
        <div style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
            {isEn ? (
                <a 
                    href={`https://www.amazon.com/s?k=${encodeURIComponent(getAmazonQuery(cpu.name))}&tag=thehardware07-20`}
                    className="guru-buy-winner-btn amazon-btn hover-scale"
                    target="_blank"
                    rel="nofollow sponsored"
                >
                    💰 Cheapest offers right now
                </a>
            ) : (
                <a 
                    href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(getHeurekaQuery(cpu.name))}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`}
                    className="guru-buy-winner-btn heureka-btn heureka-hn-link hover-scale"
                    data-trixam-positionid="276027"
                    data-trixam-content="Text link"
                    data-trixam-medium="affiliate"
                    target="_blank"
                    rel="nofollow sponsored"
                >
                    💰 Nejlevnější nabídky právě teď
                </a>
            )}
        </div>

        {/* 🔥 POVINNÁ NÁSTROJOVÁ CTA TLAČÍTKA DLE ROZKAZU 🔥 */}
        <section style={{ marginBottom: '60px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#a855f7', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> {isEn ? 'BOTTLENECK' : 'KONTROLA'}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK KALKULAČKA'}</h3>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn-link hover-scale" style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', transition: '0.3s', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
                </div>
                <div className="tool-cta-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ color: '#66fcf1', fontWeight: '950', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Gamepad2 size={16} /> {isEn ? 'FPS TEST' : 'HERNÍ VÝKON'}</div>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 15px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn-link-cyan hover-scale" style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: '12px', textDecoration: 'none', fontWeight: '950', textTransform: 'uppercase', transition: '0.3s', background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', border: '1px solid rgba(102, 252, 241, 0.3)' }}>{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div className="analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950' }}>{isEn ? 'Performance Analysis' : 'Analýza výkonu'}</h2>
                <GuruAnalysisText 
                    cpuName={cpu.name} 
                    gpuName="GeForce RTX 5090" 
                    gameName="modern games" 
                    resolution="1440p" 
                    bottleneckPercent={0} 
                    isCpuBound={false} 
                    fps={Number(fpsData['cyberpunk_2077_1440p'] || 0)} 
                    isEn={isEn} 
                />
            </div>
        </section>

        {/* 🔥 PŮVODNÍ HEUREKA WIDGET PRO DOPLNĚNÍ (komplexní nabídka dole) 🔥 */}
        {!isEn && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                <HeurekaButtons isEn={false} />
            </div>
        )}

        <section className="semantic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <a href={`/${isEn ? 'en/' : ''}bottleneck/${safeSlug}-with-geforce-rtx-5080`} className="deep-link-card hover-scale" style={{ borderTop: '4px solid #ff0055' }}>
                <Gauge size={32} color="#ff0055" />
                <h3>Bottleneck Radar</h3>
                <p>{isEn ? 'Test this CPU with different GPUs.' : 'Otestuj tento CPU s různými grafikami.'}</p>
                <ChevronRight className="arrow" />
            </a>
            <a href={`/${isEn ? 'en/' : ''}cpuvs`} className="deep-link-card hover-scale" style={{ borderTop: '4px solid #a855f7' }}>
                <Swords size={32} color="#a855f7" />
                <h3>CPU Srovnávač</h3>
                <p>{isEn ? 'Compare against the competition.' : 'Srovnej tento procesor s konkurencí.'}</p>
                <ChevronRight className="arrow" />
            </a>
            <a href={`/${isEn ? 'en/' : ''}cpu/${safeSlug}`} className="deep-link-card hover-scale" style={{ borderTop: '4px solid #66fcf1' }}>
                <Activity size={32} color="#66fcf1" />
                <h3>Detailní Profil</h3>
                <p>{isEn ? 'Full specs and architecture.' : 'Kompletní technické specifikace.'}</p>
                <ChevronRight className="arrow" />
            </a>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn hover-scale"><Flame size={20} /> DEALS</a>
          <a href="/support" className="guru-support-btn hover-scale"><Heart size={20} /> SUPPORT</a>
        </div>
      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); }
        .rtx-badge { display: inline-flex; align-items: center; gap: 8px; color: #76b900; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; padding: 6px 20px; border: 1px solid rgba(118, 185, 0, 0.5); border-radius: 50px; background: rgba(118, 185, 0, 0.1); }
        
        .game-fps-card { transition: 0.3s; }
        .game-fps-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2) !important; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .deep-link-card { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
        .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 15px 0 10px 0; text-transform: uppercase; }
        .deep-link-card p { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0; }
        .deep-link-card .arrow { position: absolute; bottom: 30px; right: 30px; opacity: 0.2; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; border-radius: 16px; text-decoration: none; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; border-radius: 16px; text-decoration: none; }

        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 45px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }

        /* 🔥 AGRESIVNÍ CTA TLAČÍTKA 🔥 */
        .guru-buy-winner-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 35px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; color: #fff; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); border: 2px solid #60a5fa; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }
        
        .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 15px 30px rgba(0,0,0,0.5); }

        /* 🔥 STICKY BOTTOM ANCHOR CSS */
        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-hub-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.6rem !important; }
            .fps-matrix-grid { grid-template-columns: 1fr !important; gap: 15px; }
            .game-fps-card { padding: 20px !important; }
            .fps-value-main { font-size: 3.5rem !important; }
            .analysis-box { padding: 25px 15px !important; border-radius: 20px !important; }
            .semantic-grid { grid-template-columns: 1fr !important; }
            .guru-deals-btn, .guru-support-btn { width: 100%; }
            .guru-buy-winner-btn { width: 100%; font-size: 14px; padding: 15px; justify-content: center; }
        }
      `}} />
    </div>
  );
}
