import React, { cache } from 'react';
import Script from 'next/script';
import { 
 ChevronLeft, Monitor, Gamepad2, Zap, Activity, ShieldCheck, Crosshair, Swords, BarChart3, Flame, Heart, ShoppingCart, AlertTriangle, Cpu
} from 'lucide-react';
import SeznamAd from '../../../../../components/SeznamAd';
import HeurekaButtons from '../../../../../components/HeurekaButtons';
import GuruInContentOffer from '../../../../../components/GuruInContentOffer';

/**
 * GURU GPU PERFORMANCE ENGINE V15.3 (SEO & EN HARD-LOCK)
 * 🚀 CÍL: Fix detekce isEn, oprava Amazon linků a Google Golden Rich.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const findGpuBySlug = cache(async (gpuSlug) => {
    if (!supabaseUrl || !gpuSlug) return null;
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
    const cleanSlug = gpuSlug.replace(/^en-/, '');
    
    try {
        const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, {
            headers, next: { revalidate: 86400 }
        });
        if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

        const clean = cleanSlug.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
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

    if (resolution === '1080p') finalFps = fpsData[`${gameKey}_1080p`] || Math.round(baseFps * 1.4);
    else if (resolution === '4k') finalFps = fpsData[`${gameKey}_4k`] || Math.round(baseFps * 0.6);
    else if (resolution === 'dlss') finalFps = Math.round(baseFps * 1.35);
    else if (resolution === 'ray-tracing') finalFps = Math.round(baseFps * 0.55);

    return { gpu, finalFps };
});

export async function generateMetadata(props) {
    const p = await props.params;
    const isEn = props.isEn === true || (p?.slug && p.slug.startsWith('en-'));
    const gpuSlug = (p?.slug || '').replace(/^en-/, '');
    const data = await getPerformanceData(gpuSlug, p.game, p.resolution);
    if (!data) return { title: '404 | The Hardware Guru' };
    return {
        title: isEn ? `${data.gpu.name} ${p.game} FPS ${p.resolution} Benchmark` : `${data.gpu.name} ${p.game} FPS ${p.resolution} Test`,
        alternates: { canonical: `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${gpuSlug}/${p.game}/${p.resolution}` }
    };
}

export default async function GpuPerformancePage(props) {
    const p = await props.params;
    const isEn = props.isEn === true || (p?.slug && p.slug.startsWith('en-'));
    const gpuSlug = (p?.slug || '').replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, p.game, p.resolution);
    if (!data) return <div style={{ color: '#ff0055', textAlign: 'center', padding: '100px', fontWeight: '950' }}>404 - DATA NOT FOUND</div>;

    const { gpu, finalFps } = data;
    const gameLabel = p.game.replace(/-/g, ' ').toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';

    // Google Golden Rich
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": `${gpu.name} ${gameLabel} ${p.resolution} Performance`,
        "description": `Detailed FPS benchmark for ${gpu.name} in ${gameLabel}.`,
        "author": { "@type": "Organization", "name": "The Hardware Guru" }
    };

    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cleanGpuName)}&tag=thehardware07-20`;

    return (
        <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? `/en/gpu/${gpu.slug}` : `/gpu/${gpu.slug}`} className="guru-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', color: '#66fcf1', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: '900', fontSize: '13px', textTransform: 'uppercase', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> {isEn ? 'FPS' : 'VÝKON'}
                    </h1>
                </header>

                <div className="fps-result-card" style={{ background: 'rgba(15, 17, 21, 0.95)', borderLeft: `8px solid ${finalFps >= 60 ? '#10b981' : '#eab308'}`, borderRadius: '24px', padding: '50px 40px', textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', lineHeight: '1' }}>{finalFps} <span style={{ fontSize: '30px', color: '#4b5563' }}>FPS</span></div>
                    <div style={{ color: '#9ca3af', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px' }}>{isEn ? 'AVERAGE PERFORMANCE' : 'PRŮMĚRNÝ VÝKON'}</div>
                </div>

                <div className="affiliate-cta-grid" style={{ padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <div style={{ color: vendorColor, fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px' }}>{isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}</div>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isEn ? (
                            <a href={amazonLink} target="_blank" rel="nofollow sponsored" style={{ background: '#f59e0b', color: '#000', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}><ShoppingCart size={16} /> BUY ON AMAZON</a>
                        ) : (
                            <a href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz`} target="_blank" rel="nofollow sponsored" style={{ background: '#0078d4', color: '#fff', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}><ShoppingCart size={16} /> KOUPIT NA HEUREKA</a>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '60px' }}>
                    <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}><Gamepad2 size={28} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
                    <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}><AlertTriangle size={28} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
                </div>
            </main>
        </div>
    );
}
