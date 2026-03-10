import React from 'react';
import { 
  ChevronLeft, 
  Monitor, 
  Gamepad2, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Crosshair, 
  Swords, 
  BarChart3 
} from 'lucide-react';

/**
 * GURU GPU PERFORMANCE ENGINE V1.1 (FINAL SLUG FIX)
 * Cesta: src/app/gpu-performance/[slug]/[game]/[resolution]/page.js
 * 🛡️ FIX 1: Přejmenován parametr params.gpu na params.slug (odstraněn konflikt v buildu).
 * 🛡️ FIX 2: 100% bypass cache pro Vercel přes revalidate = 0.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

// 🛡️ DATA ENGINE: Hledání GPU podle robustního 3-Tier parseru
const findGpuBySlug = async (gpuSlug) => {
    if (!supabaseUrl || !gpuSlug) return null;
    const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

    try {
        const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'no-store' });
        if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
    } catch(e) {}

    try {
        const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${gpuSlug}*&order=slug.asc`, { headers, cache: 'no-store' });
        if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
    } catch(e) {}

    try {
        const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
        const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
        if (tokens.length > 0) {
            const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
            const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers, cache: 'no-store' });
            if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
        }
    } catch(e) {}
    
    return null;
};

// 🧠 LOGIC ENGINE: Výpočet výkonu pro dané rozlišení
const getPerformanceData = async (gpuSlug, gameSlug, resolution) => {
    const gpu = await findGpuBySlug(gpuSlug);
    if (!gpu) return null;

    const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
    const fpsDataArray = Array.isArray(gpu.game_fps) ? gpu.game_fps : [];
    const fpsData = fpsDataArray.length > 0 ? fpsDataArray[0] : {};

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
};

export async function generateMetadata({ params }) {
    const { slug, game: gameSlug, resolution } = params;
    const isEn = slug.startsWith('en-');
    const cleanSlug = slug.replace(/^en-/, '');

    const data = await getPerformanceData(cleanSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();

    const title = isEn 
        ? `${gpu.name} ${gameLabel} FPS (${resLabel} Benchmark) | The Hardware Guru`
        : `${gpu.name} ${gameLabel} FPS (${resLabel} Benchmark) | The Hardware Guru`;
        
    const desc = isEn
        ? `See ${gpu.name} ${gameLabel} FPS at ${resLabel} settings. Real gaming performance analysis, average framerates, and benchmark data.`
        : `Zjistěte reálné FPS pro ${gpu.name} ve hře ${gameLabel} při rozlišení ${resLabel}. Detailní analýza výkonu a benchmarková data.`;

    const canonicalUrl = `https://www.thehardwareguru.cz/gpu-performance/${cleanSlug}/${gameSlug}/${resolution}`;

    return {
        title,
        description: desc,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                "en": `https://www.thehardwareguru.cz/en/gpu-performance/${cleanSlug}/${gameSlug}/${resolution}`,
                "cs": canonicalUrl
            }
        }
    };
}

export default async function GpuPerformancePage({ params }) {
    const { slug, game: gameSlug, resolution } = params;
    const isEn = slug.startsWith('en-');
    const cleanSlug = slug.replace(/^en-/, '');

    const data = await getPerformanceData(cleanSlug, gameSlug, resolution);

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ color: '#ff0055', fontSize: '30px', fontWeight: '900', textTransform: 'uppercase' }}>404 - DATA NENALEZENA</h1>
            </div>
        );
    }

    const { gpu, finalFps } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();
    const cleanGpuName = normalizeName(gpu.name);

    let verdictColor = '#ef4444';
    let verdictTextEn = 'NOT RECOMMENDED';
    let verdictTextCs = 'NEDOPORUČUJEME';

    if (finalFps >= 100) { verdictColor = '#10b981'; verdictTextEn = 'ULTIMATE EXPERIENCE'; verdictTextCs = 'PERFEKTNÍ PLYNULOST'; }
    else if (finalFps >= 60) { verdictColor = '#66fcf1'; verdictTextEn = 'SMOOTH GAMING'; verdictTextCs = 'PLYNULÉ HRANÍ'; }
    else if (finalFps >= 30) { verdictColor = '#eab308'; verdictTextEn = 'PLAYABLE (CONSOLE LEVEL)'; verdictTextCs = 'HRATELNÉ (KONZOLOVÝ ZÁŽITEK)'; }

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": isEn ? `How much FPS does ${cleanGpuName} get in ${gameLabel} at ${resLabel}?` : `Kolik FPS má ${cleanGpuName} ve hře ${gameLabel} na ${resLabel}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": isEn 
                        ? `The ${cleanGpuName} achieves an average of ${finalFps} FPS in ${gameLabel} when running at ${resLabel} resolution with high/ultra settings.`
                        : `Karta ${cleanGpuName} dosahuje průměrně ${finalFps} FPS ve hře ${gameLabel} při rozlišení ${resLabel} a vysokých/ultra detailech.`
                }
            }
        ]
    };

    const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
            
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />

            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <a href={isEn ? `/en/gpu-performance/${cleanSlug}` : `/gpu-performance/${cleanSlug}`} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU PROFILE' : 'ZPĚT NA VÝKON GRAFIKY'}
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
                        <Activity size={16} /> GURU FPS RADAR
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        {cleanGpuName} <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS <span style={{ fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.8 }}>({resLabel})</span>
                    </h1>
                </header>

                <section style={{ marginBottom: '60px' }}>
                    <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `8px solid ${verdictColor}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                        <div style={{ color: verdictColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                            {isEn ? 'AVERAGE FRAMERATE' : 'PRŮMĚRNÁ SNÍMKOVÁ FREKVENCE'}
                        </div>
                        <div style={{ fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: `0 0 40px ${verdictColor}40` }}>
                            {finalFps > 0 ? finalFps : 'N/A'} <span style={{ fontSize: 'clamp(20px, 4vw, 30px)', color: verdictColor }}>FPS</span>
                        </div>
                        <div style={{ background: `${verdictColor}20`, color: verdictColor, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${verdictColor}40`, marginTop: '10px' }}>
                            <Crosshair size={18} /> {isEn ? verdictTextEn : verdictTextCs}
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <div style={{ padding: '40px', background: 'rgba(15,17,21,0.8)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
                            {isEn ? `Want to see how ${cleanGpuName} stacks up?` : `Zajímá tě srovnání s konkurencí?`}
                        </h3>
                        <a href={`/${isEn ? 'en/' : ''}gpuvs`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 35px', background: 'linear-gradient(135deg, #ff0055 0%, #990033 100%)', color: '#fff', borderRadius: '16px', fontWeight: '950', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s' }}>
                            <Swords size={20} /> {isEn ? 'LAUNCH VS ENGINE' : 'SPUSTIT SOUBOJ KARET'}
                        </a>
                    </div>
                </section>

            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
            `}} />
        </div>
    );
}
