import React, { cache } from 'react';
import Script from 'next/script';
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
 Heart,
 ShoppingCart,
 AlertTriangle,
 Cpu
} from 'lucide-react';
import SeznamAd from '../../../../../components/SeznamAd';
import HeurekaButtons from '../../../../../components/HeurekaButtons';
import GuruInContentOffer from '../../../../../components/GuruInContentOffer';

/**
 * GURU GPU PERFORMANCE ENGINE V15.7 (COMPLETE VERSION - NO CUTS)
 * 🚀 CÍL: Fix EN/Amazon, V10 Hard-Lock Heureka a Google Golden Rich SEO.
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
    const cleanSlug = gpuSlug.replace(/^en-/, ''); // 🔥 FIX pro 404
    
    try {
        const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, {
            headers, next: { revalidate: 86400 }
        });
        if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

        const clean = cleanSlug.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
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

export async function generateMetadata(props) {
    const p = await props.params;
    const rawSlug = p?.slug || p?.gpu || '';
    const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
    const gameSlug = p?.game || '';
    const resolution = p?.resolution || '';
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const safeSlug = gpu.slug || slugify(gpu.name);
    const canonicalUrl = `https://www.thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`;

    return {
        title: isEn ? `${gpu.name} ${gameLabel} FPS (${resLabel} Benchmark) | The Hardware Guru` : `${gpu.name} ${gameLabel} FPS (${resLabel} Test) | The Hardware Guru`,
        alternates: {
            canonical: canonicalUrl,
            languages: { "en": `https://www.thehardwareguru.cz/en/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`, "cs": `https://www.thehardwareguru.cz/gpu-performance/${safeSlug}/${gameSlug}/${resolution}` }
        }
    };
}

export default async function GpuPerformancePage(props) {
    const p = await props.params;
    const rawSlug = p?.slug || p?.gpu || '';
    const gameSlug = p?.game || '';
    const resolution = p?.resolution || '';
    // 🔥 FIX: Pevná detekce jazyka
    const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return <div style={{ color: '#ff0055', textAlign: 'center', padding: '100px', fontWeight: '950' }}>{isEn ? '404 - DATA NOT FOUND' : '404 - DATA NENALEZENA'}</div>;

    const { gpu, finalFps } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);
    const safeSlug = gpu.slug || slugify(gpu.name);
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

    // 🔥 GOOGLE GOLDEN RICH 🔥
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${gpu.name} ${gameLabel} Performance at ${resLabel}`,
        "image": "https://thehardwareguru.cz/bg-guru.png",
        "author": { "@type": "Organization", "name": "The Hardware Guru" },
        "publisher": { "@type": "Organization", "name": "The Hardware Guru" },
        "description": `Gaming performance analysis and FPS benchmark of ${gpu.name} in ${gameLabel} resolution ${resLabel}.`
    };

    let verdictColor = '#ef4444';
    let verdictTextEn = 'NOT RECOMMENDED';
    let verdictTextCs = 'NEDOPORUČUJEME';

    if (finalFps >= 100) { verdictColor = '#10b981'; verdictTextEn = 'ULTIMATE EXPERIENCE'; verdictTextCs = 'PERFEKTNÍ PLYNULOST'; }
    else if (finalFps >= 60) { verdictColor = '#66fcf1'; verdictTextEn = 'SMOOTH GAMING'; verdictTextCs = 'PLYNULÉ HRANÍ'; }
    else if (finalFps >= 30) { verdictColor = '#eab308'; verdictTextEn = 'PLAYABLE'; verdictTextCs = 'HRATELNÉ'; }

    const isUltimateGpu = cleanGpuName.includes('4090') || cleanGpuName.includes('5090') || cleanGpuName.includes('5080') || cleanGpuName.includes('7900 XTX');
    const upsellProduct = isUltimateGpu ? "AMD Ryzen 7 9800X3D" : "NVIDIA GeForce RTX 5080";
    const upsellCategory = isUltimateGpu ? "cpu" : "gpu";

    const searchName = cleanGpuName.trim();
    const encodedSearch = encodeURIComponent(searchName);
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodedSearch}`)}`;
    // 🔥 V10 HARD-LOCK FRAGMENT FIX
    const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}+cena#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-gpu-perf`;
    const amazonLink = `https://www.amazon.com/s?k=${encodedSearch}&tag=thehardware07-20&ascsubtag=v10-gpu-perf`;

    return (
        <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

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

                <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderLeft: `4px solid ${vendorColor}` }}>
                    <div className="affiliate-col">
                        <div className="affiliate-col-title" style={{ color: vendorColor }}>
                            <ShoppingCart size={16} /> {isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}
                        </div>
                        <div className="affiliate-btn-wrap">
                            {isEn ? (
                                <a 
                                    href={amazonLink} 
                                    data-subid="v10-gpu-perf-amazon" 
                                    data-cat="gpu_performance" 
                                    target="_blank" 
                                    rel="nofollow sponsored" 
                                    className="guru-buy-winner-btn amazon-btn v10-hl-btn"
                                >
                                    <ShoppingCart size={16} /> BUY ON AMAZON
                                </a>
                            ) : (
                                <>
                                    <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                        <ShoppingCart size={16} /> Smarty.cz
                                    </a>
                                    <a 
                                        href={heurekaLink} 
                                        data-subid="v10-gpu-perf-heureka" 
                                        data-cat="gpu_performance" 
                                        target="_blank" 
                                        rel="nofollow sponsored" 
                                        className="guru-buy-winner-btn heureka-btn v10-hl-btn"
                                    >
                                        <ShoppingCart size={16} /> Heureka.cz
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '50px' }}>
                    <GuruInContentOffer 
                        productName={upsellProduct} 
                        category={upsellCategory} 
                        reason="upgrade"
                        isEn={isEn}
                        subId={`gpu-perf-upsell-${safeSlug}`}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                    <HeurekaButtons isEn={isEn} manualSearch={gpu.name} positionId="276026" />
                </div>

                <section className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    <div className="res-card"><div className="res-label">RESOLUTION</div><div className="res-val" style={{ color: '#66fcf1' }}>{resLabel}</div></div>
                    <div className="res-card"><div className="res-label">GPU VRAM</div><div className="res-val">{gpu.vram_gb} GB</div></div>
                    <div className="res-card"><div className="res-label">ARCHITECTURE</div><div className="res-val">{gpu.architecture}</div></div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px', marginBottom: '60px' }}>
                    <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
                    </a>
                    <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
                    </a>
                </div>

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

                <section className="massive-seo-hub" style={{ marginBottom: '60px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '950', textTransform: 'uppercase', marginBottom: '30px', borderLeft: '4px solid #a855f7', paddingLeft: '15px' }}>{isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}</h2>
                    <div className="seo-hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div className="hub-column" style={{ background: 'rgba(15,17,21,0.8)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="hub-col-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '950', marginBottom: '20px', color: '#ff0055' }}><Swords size={20} /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                            <ul className="hub-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={16} color="#a855f7" /> {isEn ? 'Processor Battles (CPU VS)' : 'Souboje Procesorů (CPU VS)'}</a></li>
                                <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Monitor size={16} color="#66fcf1" /> {isEn ? 'Graphics Card Battles (GPU VS)' : 'Souboje Grafických Karet (GPU VS)'}</a></li>
                            </ul>
                        </div>
                        <div className="hub-column" style={{ background: 'rgba(15,17,21,0.8)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="hub-col-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: '950', marginBottom: '20px', color: '#66fcf1' }}><Gamepad2 size={20} /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                            <ul className="hub-links-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <li><a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Gamepad2 size={16} color="#06b6d4" /> {isEn ? 'FPS Calculator' : 'FPS Kalkulačka'}</a></li>
                                <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} color="#a855f7" /> {isEn ? 'Bottleneck Test' : 'Bottleneck Test'}</a></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="footer-btns" style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                    <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
                    <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
                </div>
            </main>

            <div className="sticky-bottom-anchor">
                <div className="ad-desktop-wrapper">
                    <SeznamAd zoneId={408654} width={970} height={90} />
                </div>
                <div className="ad-mobile-wrapper">
                    <SeznamAd zoneId={408651} width={300} height={100} />
                </div>
            </div>

            <Script id="v10-hl-script" strategy="lazyOnload">
                {`
                    if (typeof window !== 'undefined') {
                        document.addEventListener('click', function(e) {
                            const btn = e.target.closest('.v10-hl-btn');
                            if (btn) {
                                e.preventDefault();
                                const targetUrl = btn.href;
                                const subId = btn.getAttribute('data-subid');
                                const cat = btn.getAttribute('data-cat');
                                if (navigator.sendBeacon) {
                                    navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: cat, sub_id: subId, page: window.location.pathname }));
                                }
                                setTimeout(() => { window.location.href = targetUrl; }, 150);
                            }
                        });
                    }
                `}
            </Script>

            <style dangerouslySetInnerHTML={{__html: `
                .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102,252,241,0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
                .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }

                .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
                .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #4b5563; margin-bottom: 10px; }
                .res-val { font-size: 24px; font-weight: 950; }

                .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
                .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 15px 0 10px 0; text-transform: uppercase; }
                .deep-link-card p { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0; }

                .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
                .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
                .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
                .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
                
                @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
                @keyframes pulse-heureka { 0% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(0, 120, 212, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0); } }
                
                .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
                .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
                .smarty-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 15px 30px rgba(234, 179, 8, 0.5); }
                .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; animation: pulse-heureka 2s infinite; animation-delay: 1s; }
                .heureka-btn:hover { transform: translateY(-5px) scale(1.02); animation: none; box-shadow: 0 10px 20px rgba(0, 120, 212, 0.5); }
                .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; animation: pulse-smarty 2s infinite; }

                .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
                .guru-support-btn { background: #eab308; color: #000; }
                .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }

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
                    .affiliate-cta-grid { padding: 20px; }
                    .affiliate-col-title { font-size: 14px; margin-bottom: 20px; }
                    .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
                    .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
                }
            `}} />
        </div>
    );
}
