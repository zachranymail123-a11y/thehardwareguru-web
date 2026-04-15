import React, { cache } from 'react';
import Script from 'next/script';
import { 
 ChevronLeft, Monitor, Gamepad2, Zap, Activity, ShieldCheck, Crosshair, Swords, BarChart3, Flame, Heart, ShoppingCart, AlertTriangle, Cpu
} from 'lucide-react';
import SeznamAd from '../../../../../components/SeznamAd';
import HeurekaButtons from '../../../../../components/HeurekaButtons';
import GuruInContentOffer from '../../../../../components/GuruInContentOffer';

/**
 * GURU GPU PERFORMANCE ENGINE V15.6 (FULL NO-CUT VERSION)
 * 🚀 CÍL: Sjednocení isEn, Google Golden Rich a Amazon EN Hard-Lock.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

const findGpuBySlug = cache(async (gpuSlug) => {
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const cleanSlug = gpuSlug.replace(/^en-/, '');
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, { headers });
        const data = await res.json();
        return data?.[0] || null;
    } catch (e) { return null; }
});

const getPerformanceData = cache(async (gpuSlug, gameSlug, resolution) => {
    const gpu = await findGpuBySlug(gpuSlug);
    if (!gpu) return null;
    const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
    const fpsData = gpu?.game_fps ? (Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps) : {};
    const baseFps = fpsData[`${gameKey}_1440p`] || 0;
    let finalFps = baseFps;
    if (resolution === '1080p') finalFps = fpsData[`${gameKey}_1080p`] || Math.round(baseFps * 1.4);
    else if (resolution === '4k') finalFps = fpsData[`${gameKey}_4k`] || Math.round(baseFps * 0.6);
    else if (resolution === 'dlss') finalFps = Math.round(baseFps * 1.35);
    else if (resolution === 'ray-tracing') finalFps = Math.round(baseFps * 0.55);
    return { gpu, finalFps };
});

export async function generateMetadata(props) {
    const p = await props.params;
    const isEn = props.isEnProxy === true || (p?.slug && p.slug.startsWith('en-'));
    const gpuSlug = (p?.slug || '').replace(/^en-/, '');
    const data = await getPerformanceData(gpuSlug, p.game, p.resolution);
    if (!data) return { title: '404 | The Hardware Guru' };
    return { 
        title: isEn ? `${data.gpu.name} ${p.game} ${p.resolution} Benchmark` : `${data.gpu.name} ${p.game} ${p.resolution} Test`,
        alternates: { canonical: `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${gpuSlug}/${p.game}/${p.resolution}` }
    };
}

export default async function GpuPerformanceDetailPage(props) {
    const p = await props.params;
    const isEn = props.isEnProxy === true || (p?.slug && p.slug.startsWith('en-'));
    const gpuSlug = (p?.slug || '').replace(/^en-/, '');
    const data = await getPerformanceData(gpuSlug, p.game, p.resolution);
    if (!data) return <div style={{ color: '#ff0055', textAlign: 'center', padding: '100px', fontWeight: '950' }}>404 - DATA NOT FOUND</div>;

    const { gpu, finalFps } = data;
    const gameLabel = p.game.replace(/-/g, ' ').toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';
    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cleanGpuName)}&tag=thehardware07-20`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${gpu.name} ${gameLabel} Performance`,
        "description": `Detailed FPS benchmark for ${gpu.name} in ${gameLabel} at ${p.resolution}.`,
        "author": { "@type": "Organization", "name": "The Hardware Guru" }
    };

    return (
        <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? `/en/gpu-performance/${gpu.slug}` : `/gpu-performance/${gpu.slug}`} className="guru-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#66fcf1', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div className="radar-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
                        <Activity size={16} /> GURU FPS RADAR
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> {isEn ? 'FPS' : 'VÝKON'}
                    </h1>
                </header>

                <div className="fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', borderLeft: `8px solid ${finalFps >= 60 ? '#10b981' : '#eab308'}`, borderRadius: '24px', padding: '50px 40px', textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', lineHeight: '1', margin: '10px 0' }}>{finalFps} <span style={{ fontSize: '30px', color: '#4b5563' }}>FPS</span></div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}><Crosshair size={18} /> {isEn ? 'OPTIMAL' : 'PLYNULÉ'}</div>
                </div>

                <div className="affiliate-cta-grid" style={{ padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: '50px' }}>
                    <div style={{ color: vendorColor, fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px' }}>{isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}</div>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isEn ? (
                            <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-btn amazon-btn"><ShoppingCart size={16} /> BUY ON AMAZON</a>
                        ) : (
                            <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz`} target="_blank" rel="nofollow sponsored" className="guru-btn heureka-btn"><ShoppingCart size={16} /> KOUPIT NA HEUREKA</a>
                        )}
                    </div>
                </div>

                <div className="hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px' }}>
                    <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="tool-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}><Gamepad2 size={28} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
                    <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="tool-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}><AlertTriangle size={28} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
                </div>
            </main>

            <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', padding: '10px 0', display: 'flex', justifyContent: 'center', zIndex: 9999 }}>
                <SeznamAd zoneId={408654} width={970} height={90} />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-btn { flex: 1; max-width: 300px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; text-transform: uppercase; transition: 0.3s; }
                .heureka-btn { background: #0078d4; color: #fff; }
                .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; }
                .tool-btn:hover { transform: translateY(-5px); }
                @media (max-width: 768px) { .hub-grid { grid-template-columns: 1fr; } .guru-btn { width: 100%; max-width: 100%; } }
            `}} />
        </div>
    );
}
