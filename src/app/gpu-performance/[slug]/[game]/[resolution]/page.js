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
 * GURU GPU PERFORMANCE ENGINE V15.2 (SEO GOLDEN RICH & 404 FIX)
 * 🚀 CÍL: Eliminace 404, Google Golden Rich SEO a V10 Hard-Lock.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

const slugify = (text) => {
    return text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
};

const findGpuBySlug = cache(async (gpuSlug) => {
    if (!supabaseUrl || !gpuSlug) return null;
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    // 🔥 FIX: Očištění slugu od prefixu en- pro databázi
    const cleanSlugForDb = gpuSlug.replace(/^en-/, '');
    
    try {
        const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlugForDb}&limit=1`, {
            headers, next: { revalidate: 86400 }
        });
        if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

        const clean = cleanSlugForDb.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
        const chunks = clean.match(/\d+|[a-zA-Z]+/g);
        if (chunks && chunks.length > 0) {
            const searchPattern = `%${chunks.join('%')}%`;
            const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`;
            const res2 = await fetch(url2, { headers, next: { revalidate: 86400 } });
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

export async function generateMetadata({ params, props = {} }) {
    const p = await params;
    const rawSlug = p?.slug || p?.gpu || '';
    const gameSlug = p?.game || '';
    const resolution = p?.resolution || '';
    const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const safeSlug = gpu.slug || slugify(gpu.name);
    
    return {
        title: isEn ? `${gpu.name} ${gameLabel} FPS ${resLabel} Benchmark` : `${gpu.name} ${gameLabel} FPS ${resLabel} Test`,
        alternates: {
            canonical: `https://www.thehardwareguru.cz/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`,
            languages: { "en": `https://www.thehardwareguru.cz/en/gpu-performance/${safeSlug}/${gameSlug}/${resolution}` }
        }
    };
}

export default async function GpuPerformancePage({ params, props = {} }) {
    const p = await params;
    const rawSlug = p?.slug || p?.gpu || '';
    const gameSlug = p?.game || '';
    const resolution = p?.resolution || '';
    const isEn = props.isEnProxy === true || rawSlug.startsWith('en-');
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return <div style={{ color: '#ff0055', textAlign: 'center', padding: '100px', fontWeight: '950' }}>404 - DATA NOT FOUND</div>;

    const { gpu, finalFps } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);
    const safeSlug = gpu.slug || slugify(gpu.name);
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

    // Google Golden Rich JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${gpu.name} Performance in ${gameLabel} at ${resLabel}`,
        "image": "https://thehardwareguru.cz/bg-guru.png",
        "author": { "@type": "Organization", "name": "The Hardware Guru" },
        "publisher": { "@type": "Organization", "name": "The Hardware Guru" },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `https://thehardwareguru.cz/gpu-performance/${safeSlug}/${gameSlug}/${resolution}` },
        "description": `Detailed FPS benchmark of ${gpu.name} running ${gameLabel} at ${resLabel} resolution.`
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
    const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
    const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}+cena#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-gpu-perf`;
    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(searchName)}&tag=thehardware07-20&ascsubtag=v10-gpu-perf`;

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
                    <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
                    <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="radar-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
                        <Activity size={16} /> GURU FPS RADAR
                    </div>
                    <h1 className="main-title" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS
                    </h1>
                </header>

                <section style={{ marginBottom: '60px' }}>
                    <div className="fps-result-card" style={{ background: 'rgba(15, 17, 21, 0.95)', borderLeft: `8px solid ${verdictColor}`, borderRadius: '24px', padding: '50px 40px', textAlign: 'center', boxShadow: `0 0 50px ${verdictColor}10` }}>
                        <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0' }}>
                            {finalFps > 0 ? finalFps : 'N/A'} {finalFps > 0 && <span style={{ fontSize: '30px', color: verdictColor }}>FPS</span>}
                        </div>
                        <div style={{ background: `${verdictColor}20`, color: verdictColor, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${verdictColor}40` }}>
                            <Crosshair size={18} /> {isEn ? verdictTextEn : verdictTextCs}
                        </div>
                    </div>
                </section>

                <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderLeft: `4px solid ${vendorColor}`, padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="affiliate-col">
                        <div className="affiliate-col-title" style={{ color: vendorColor, fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <ShoppingCart size={16} /> {isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}
                        </div>
                        <div className="affiliate-btn-wrap" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {isEn ? (
                                <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn" style={{ background: '#f59e0b', color: '#000', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>
                                    <ShoppingCart size={16} /> BUY ON AMAZON
                                </a>
                            ) : (
                                <>
                                    <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn" style={{ background: '#eab308', color: '#000', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>Smarty.cz</a>
                                    <a href={heurekaLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn v10-hl-btn" style={{ background: '#0078d4', color: '#fff', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>Heureka.cz</a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '50px' }}>
                    <GuruInContentOffer productName={upsellProduct} category={upsellCategory} reason="upgrade" isEn={isEn} subId={`gpu-perf-upsell-${safeSlug}`} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    <div className="res-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: '950', color: '#4b5563', marginBottom: '10px' }}>RESOLUTION</div>
                        <div style={{ fontSize: '24px', fontWeight: '950', color: '#66fcf1' }}>{resLabel}</div>
                    </div>
                    <div className="res-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: '950', color: '#4b5563', marginBottom: '10px' }}>GPU VRAM</div>
                        <div style={{ fontSize: '24px', fontWeight: '950' }}>{gpu.vram_gb} GB</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                    <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                        <Gamepad2 size={28} /> <span>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
                    </a>
                    <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                        <AlertTriangle size={28} /> <span>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
                    </a>
                </div>
            </main>

            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>

            <Script id="v10-hl-script" strategy="lazyOnload">
                {`
                    if (typeof window !== 'undefined') {
                        document.addEventListener('click', function(e) {
                            const btn = e.target.closest('.v10-hl-btn');
                            if (btn) {
                                e.preventDefault();
                                const targetUrl = btn.href;
                                if (navigator.sendBeacon) {
                                    navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: 'gpu_performance', sub_id: 'v10-gpu-perf', page: window.location.pathname }));
                                }
                                setTimeout(() => { window.location.href = targetUrl; }, 150);
                            }
                        });
                    }
                `}
            </Script>
        </div>
    );
}
