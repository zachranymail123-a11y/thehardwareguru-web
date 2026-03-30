import React, { cache } from 'react';
import { 
 ChevronLeft, 
 Monitor, 
 Gamepad2, 
 Zap, 
 Activity, 
 ShieldCheck, 
 Crosshair, 
 Swords, 
 BarChart3,
 Flame,
 Heart
} from 'lucide-react';
import SeznamAd from '../../../../../components/SeznamAd';

/**
 * GURU GPU PERFORMANCE ENGINE V2.5 (MONEY FIX UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchoru, eliminace hluchých míst.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

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

const findGpuBySlug = cache(async (gpuSlug) => {
    if (!supabaseUrl || !gpuSlug) return null;
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const clean = gpuSlug.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
    
    try {
        const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, {
            headers, next: { revalidate: 86400 }
        });
        if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

        const chunks = clean.match(/\d+|[a-zA-Z]+/g);
        if (chunks && chunks.length > 0) {
            const searchPattern = `%${chunks.join('%')}%`;
            const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
                headers, next: { revalidate: 86400 }
            });
            if (res2.ok) { const data2 = await res2.json(); return data2[0] || null; }
        }
    } catch (e) { return null; }
    return null;
});

const getPerformanceData = cache(async (gpuSlug, gameSlug, resolution) => {
    const gpu = await findGpuBySlug(gpuSlug);
    if (!gpu) return null;

    const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
    const fpsData = gpu?.game_fps ? (Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps) : {};

    const baseFps = fpsData[`${gameKey}_1440p`] || 0;
    let finalFps = baseFps;

    if (resolution === '1080p') {
        finalFps = fpsData[`${gameKey}_1080p`] || Math.round(baseFps * 1.4);
    } else if (resolution === '4k') {
        finalFps = fpsData[`${gameKey}_4k`] || Math.round(baseFps * 0.6);
    } else if (resolution === 'dlss') {
        finalFps = Math.round(baseFps * 1.35);
    } else if (resolution === 'ray-tracing') {
        finalFps = Math.round(baseFps * 0.55);
    }

    return { gpu, finalFps, baseFps, gameKey };
});

export async function generateMetadata({ params }) {
    const p = await params;
    const rawSlug = p?.slug || p?.gpu || '';
    const gameSlug = p?.game || '';
    const resolution = p?.resolution || '';
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
    const canonicalUrl = `https://www.thehardwareguru.cz/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`;

    return {
        title: `${gpu.name} ${gameLabel} FPS (${resLabel} Benchmark) | The Hardware Guru`,
        alternates: {
            canonical: canonicalUrl,
            languages: { "en": `https://www.thehardwareguru.cz/en/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`, "cs": canonicalUrl }
        }
    };
}

export default async function GpuPerformancePage({ params }) {
    const p = await params;
    const rawSlug = p?.slug || p?.gpu || '';
    const gameSlug = p?.game || '';
    const resolution = p?.resolution || '';
    const isEn = rawSlug.startsWith('en-');
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return <div style={{ color: '#ff0055', textAlign: 'center', padding: '100px' }}>404 - DATA NENALEZENA</div>;

    const { gpu, finalFps } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);
    const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

    let verdictColor = '#ef4444';
    let verdictTextEn = 'NOT RECOMMENDED';
    let verdictTextCs = 'NEDOPORUČUJEME';

    if (finalFps >= 100) { verdictColor = '#10b981'; verdictTextEn = 'ULTIMATE EXPERIENCE'; verdictTextCs = 'PERFEKTNÍ PLYNULOST'; }
    else if (finalFps >= 60) { verdictColor = '#66fcf1'; verdictTextEn = 'SMOOTH GAMING'; verdictTextCs = 'PLYNULÉ HRANÍ'; }
    else if (finalFps >= 30) { verdictColor = '#eab308'; verdictTextEn = 'PLAYABLE'; verdictTextCs = 'HRATELNÉ'; }

    return (
        <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD (Před hlavičkou pro 100% viditelnost) */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                    <div className="ad-desktop-wrapper">
                        <SeznamAd zoneId={408654} width={970} height={210} />
                    </div>
                    <div className="ad-mobile-wrapper">
                        <SeznamAd zoneId={408651} width={300} height={250} />
                    </div>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="radar-badge">
                        <Activity size={16} /> GURU FPS RADAR
                    </div>
                    <h1 className="main-title" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS
                    </h1>
                </header>

                <section style={{ marginBottom: '60px' }}>
                    <div className="fps-result-card" style={{ background: 'rgba(15, 17, 21, 0.95)', borderLeft: `8px solid ${verdictColor}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                        <div className="fps-main-number" style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0' }}>
                            {finalFps > 0 ? finalFps : 'N/A'} {finalFps > 0 && <span style={{ fontSize: '30px', color: verdictColor }}>FPS</span>}
                        </div>
                        <div style={{ background: `${verdictColor}20`, color: verdictColor, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${verdictColor}40` }}>
                            <Crosshair size={18} /> {isEn ? verdictTextEn : verdictTextCs}
                        </div>
                    </div>
                </section>

                <section className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    <div className="res-card"><div className="res-label">RESOLUTION</div><div className="res-val" style={{ color: '#66fcf1' }}>{resLabel}</div></div>
                    <div className="res-card"><div className="res-label">GPU VRAM</div><div className="res-val">{gpu.vram_gb} GB</div></div>
                    <div className="res-card"><div className="res-label">ARCHITECTURE</div><div className="res-val">{gpu.architecture}</div></div>
                </section>

                <section style={{ marginBottom: '60px' }}>
                  <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Activity size={28} /> {isEn ? 'DEEP DIVE' : 'DETAILNÍ ANALÝZA'}</h2>
                  <div className="deep-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="deep-link-card">
                          <BarChart3 size={32} color={vendorColor} />
                          <div><h3>{isEn ? 'Performance Specs' : 'Výkon a Parametry'}</h3><p>Full specs and HW index.</p></div>
                      </a>
                      <a href={isEn ? `/en/gpu-recommend/${safeSlug}` : `/gpu-recommend/${safeSlug}`} className="deep-link-card">
                          <ShieldCheck size={32} color="#10b981" />
                          <div><h3>{isEn ? 'Guru Verdict' : 'Guru Verdikt'}</h3><p>Value analysis.</p></div>
                      </a>
                  </div>
                </section>

                <div className="footer-btns" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                    <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
                    <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
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
                .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102,252,241,0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
                .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }

                .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
                .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #4b5563; margin-bottom: 10px; }
                .res-val { font-size: 24px; font-weight: 950; }

                .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
                .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 0 0 5px 0; }
                .deep-link-card p { font-size: 13px; color: #9ca3af; margin: 0; }

                .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
                .guru-support-btn { background: #eab308; color: #000; }
                .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }

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
                    .guru-performance-wrapper { padding-top: 80px !important; }
                    .inner-container { padding: 0 15px !important; }
                    .ad-desktop-wrapper { display: none !important; }
                    .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
                    .main-title { font-size: 1.6rem !important; }
                    .fps-result-card { padding: 35px 20px !important; border-radius: 20px !important; }
                    .fps-main-number { font-size: 4.5rem !important; }
                    .specs-grid { grid-template-columns: 1fr !important; gap: 15px; }
                    .deep-links-grid { grid-template-columns: 1fr !important; }
                    .section-h2 { font-size: 1.4rem !important; }
                    .footer-btns { flex-direction: column; }
                    .guru-deals-btn, .guru-support-btn { width: 100% !important; }
                }
            `}} />
        </div>
    );
}
