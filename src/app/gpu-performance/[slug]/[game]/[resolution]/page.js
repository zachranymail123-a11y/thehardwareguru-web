import React, { cache } from 'react';
import Script from 'next/script';
import { 
 ChevronLeft, Monitor, Gamepad2, Zap, Activity, ShieldCheck, Crosshair, Swords, BarChart3, Flame, Heart, ShoppingCart, AlertTriangle, Cpu
} from 'lucide-react';
import SeznamAd from '../../../../../components/SeznamAd';
import HeurekaButtons from '../../../../../components/HeurekaButtons';
import GuruInContentOffer from '../../../../../components/GuruInContentOffer';

/**
 * GURU GPU PERFORMANCE ENGINE V15.2 (FULL FIX - NO CUTS)
 * 🚀 CÍL: Fix detekce isEn, Amazon linků a V10 Heureka.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

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
    return { gpu, finalFps };
});

export async function generateMetadata(props) {
    const p = await props.params;
    const isEn = props.isEn === true || props.isEnProxy === true || (p?.slug && p.slug.startsWith('en-'));
    const gpuSlug = (p?.slug || '').replace(/^en-/, '');
    const data = await getPerformanceData(gpuSlug, p.game, p.resolution);
    if (!data) return { title: '404 | Hardware Guru' };
    return { 
        title: isEn ? `${data.gpu.name} ${p.game} FPS ${p.resolution} Benchmark` : `${data.gpu.name} ${p.game} FPS ${p.resolution} Test`,
        alternates: { canonical: `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${gpuSlug}/${p.game}/${p.resolution}` }
    };
}

export default async function GpuPerformanceDetailPage(props) {
    const p = await props.params;
    // 🔥 FIX: Rozšířená detekce EN
    const isEn = props.isEn === true || props.isEnProxy === true || (p?.slug && p.slug.startsWith('en-'));
    const gpuSlug = (p?.slug || '').replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, p.game, p.resolution);
    if (!data) return <div style={{ color: '#ff0055', textAlign: 'center', padding: '100px', fontWeight: '950' }}>404 - DATA NOT FOUND</div>;

    const { gpu, finalFps } = data;
    const gameLabel = p.game.replace(/-/g, ' ').toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);
    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';
    const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cleanGpuName)}&tag=thehardware07-20`;

    return (
        <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
            <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? `/en/gpu-performance/${gpu.slug}` : `/gpu-performance/${gpu.slug}`} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
                        <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS
                    </h1>
                </header>

                <div className="fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', borderLeft: `8px solid ${finalFps >= 60 ? '#10b981' : '#eab308'}`, borderRadius: '24px', padding: '50px 40px', textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', lineHeight: '1' }}>{finalFps} <span style={{ fontSize: '30px', color: '#4b5563' }}>FPS</span></div>
                    <div style={{ color: '#9ca3af', fontWeight: '950', textTransform: 'uppercase' }}>{isEn ? 'AVERAGE PERFORMANCE' : 'PRŮMĚRNÝ VÝKON'}</div>
                </div>

                <div className="affiliate-cta-grid" style={{ padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', marginBottom: '50px' }}>
                    <div style={{ color: vendorColor, fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px' }}>{isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}</div>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isEn ? (
                            <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-btn amazon-btn"><ShoppingCart size={16} /> BUY ON AMAZON</a>
                        ) : (
                            <a 
                                href={`https://www.heureka.cz/?haff=276049&h%5Bfraze%5D=${encodeURIComponent(gpu.name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-gpu-perf`} 
                                className="guru-btn heureka-btn v10-hl-btn"
                            >
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        )}
                    </div>
                </div>
            </main>
            <style dangerouslySetInnerHTML={{__html: `
                .guru-btn { flex: 1; max-width: 300px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; text-transform: uppercase; transition: 0.3s; }
                .heureka-btn { background: #0078d4; color: #fff; }
                .amazon-btn { background: #f59e0b; color: #000; }
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; }
            `}} />
        </div>
    );
}
