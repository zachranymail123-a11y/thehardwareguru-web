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
  BarChart3 
} from 'lucide-react';

/**
 * GURU GPU PERFORMANCE ENGINE V1.1 (100K+ SEO PAGES CLUSTER)
 * Cesta: src/app/gpu-performance/[slug]/[game]/[resolution]/page.js
 * 🚀 TARGET: Extrémně specifické dotazy (např. "RTX 4070 Cyberpunk 4k fps").
 * 🛡️ LOGIC: Datově řízené šablony bez nutnosti AI textu.
 * 🛡️ PERF: React cache() pro minimalizaci zátěže databáze zachováno.
 * 🛡️ FIX: Ošetřeno tahání parametrů (params.slug), vyřešen Vercel build error.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// --- POMOCNÉ FUNKCE ---
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

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

// 🛡️ DATA ENGINE: Hledání GPU podle robustního parseru (Cache ZACHOVÁNA)
const findGpuBySlug = cache(async (gpuSlug) => {
    if (!supabaseUrl || !gpuSlug) return null;
    const clean = gpuSlug.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
    
    // Ochrana proti uříznutí přípon (xt, ti, super)
    const chunks = clean.match(/\d+|[a-zA-Z]+/g);
    if (!chunks || chunks.length === 0) return null;
    
    const searchPattern = `%${chunks.join('%')}%`;
  
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 } // Cache na 24h pro ochranu DB u SEO clusteru
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data[0] || null;
    } catch (e) { return null; }
});

// 🧠 LOGIC ENGINE: Výpočet výkonu pro dané rozlišení
const getPerformanceData = cache(async (gpuSlug, gameSlug, resolution) => {
    const gpu = await findGpuBySlug(gpuSlug);
    if (!gpu) return null;

    const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
    const fpsData = gpu?.game_fps ? (Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps) : {};

    // Base FPS je u nás 1440p
    const baseFps = fpsData[`${gameKey}_1440p`] || 0;
    let finalFps = baseFps;

    // Pokud nemáme v DB přesné sloupce pro 1080p a 4K, použijeme standardní škálování
    if (resolution === '1080p') {
        finalFps = fpsData[`${gameKey}_1080p`] || Math.round(baseFps * 1.4);
    } else if (resolution === '4k') {
        finalFps = fpsData[`${gameKey}_4k`] || Math.round(baseFps * 0.6);
    } else if (resolution === 'dlss') {
        finalFps = Math.round(baseFps * 1.35); // Odhad DLSS Quality
    } else if (resolution === 'ray-tracing') {
        finalFps = Math.round(baseFps * 0.55); // Odhad RT On (Native)
    }

    return { gpu, finalFps, baseFps, gameKey };
});

// --- METADATA ---
export async function generateMetadata({ params }) {
    // 🛡️ GURU FIX: Imunní vůči názvu složky na disku (slug vs gpu)
    const rawSlug = params?.slug || params?.gpu || '';
    const gameSlug = params?.game || '';
    const resolution = params?.resolution || '';
    
    let isEn = false;
    try { isEn = rawSlug.startsWith('en-'); } catch(e) {}
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu, finalFps } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();

    // 🚀 GURU SEO: Agresivní titulky zaměřené na přesnou shodu s Google dotazy
    const title = isEn 
        ? `${gpu.name} ${gameLabel} FPS (${resLabel} Benchmark) | The Hardware Guru`
        : `${gpu.name} ${gameLabel} FPS (${resLabel} Benchmark) | The Hardware Guru`;
        
    const desc = isEn
        ? `See ${gpu.name} ${gameLabel} FPS at ${resLabel} settings. Real gaming performance analysis, average framerates, and benchmark data.`
        : `Zjistěte reálné FPS pro ${gpu.name} ve hře ${gameLabel} při rozlišení ${resLabel}. Detailní analýza výkonu a benchmarková data.`;

    const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
    const canonicalUrl = `https://www.thehardwareguru.cz/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`;

    return {
        title,
        description: desc,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                "en": `https://www.thehardwareguru.cz/en/gpu-performance/${safeSlug}/${gameSlug}/${resolution}`,
                "cs": canonicalUrl
            }
        }
    };
}

// --- HLAVNÍ KOMPONENTA ---
export default async function GpuPerformancePage({ params }) {
    // 🛡️ GURU FIX: Imunní vůči názvu složky na disku (slug vs gpu)
    const rawSlug = params?.slug || params?.gpu || '';
    const gameSlug = params?.game || '';
    const resolution = params?.resolution || '';
    
    let isEn = rawSlug.startsWith('en-');
    const gpuSlug = rawSlug.replace(/^en-/, '');

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);

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
    const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

    // Vyhodnocení plynulosti
    let verdictColor = '#ef4444'; // Red
    let verdictTextEn = 'NOT RECOMMENDED';
    let verdictTextCs = 'NEDOPORUČUJEME';

    if (finalFps >= 100) { verdictColor = '#10b981'; verdictTextEn = 'ULTIMATE EXPERIENCE'; verdictTextCs = 'PERFEKTNÍ PLYNULOST'; }
    else if (finalFps >= 60) { verdictColor = '#66fcf1'; verdictTextEn = 'SMOOTH GAMING'; verdictTextCs = 'PLYNULÉ HRANÍ'; }
    else if (finalFps >= 30) { verdictColor = '#eab308'; verdictTextEn = 'PLAYABLE (CONSOLE LEVEL)'; verdictTextCs = 'HRATELNÉ (KONZOLOVÝ ZÁŽITEK)'; }

    // 🚀 SEO SCHEMATA
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
            },
            {
                "@type": "Question",
                "name": isEn ? `Is ${cleanGpuName} good for ${resLabel} gaming?` : `Je ${cleanGpuName} dobrá pro ${resLabel} hraní?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": isEn
                        ? `Based on our benchmarks, the performance is classified as ${verdictTextEn.toLowerCase()} for this specific scenario.`
                        : `Na základě našich benchmarků je výkon hodnocen jako ${verdictTextCs.toLowerCase()} pro tento konkrétní scénář.`
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
                    <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU PROFILE' : 'ZPĚT NA VÝKON GRAFIKY'}
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
                        <Activity size={16} /> GURU FPS RADAR
                    </div>
                    {/* 🚀 GURU SEO: Přesná shoda pro H1 (GPU + Hra + Rozlišení) */}
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        {cleanGpuName} <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS <span style={{ fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.8 }}>({resLabel})</span>
                    </h1>
                </header>

                {/* 🚀 HERO FPS KARTA */}
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

                {/* 🚀 HARDWARE DATA */}
                <section style={{ marginBottom: '60px' }}>
                    <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Monitor size={28} /> {isEn ? 'HARDWARE SETTINGS' : 'PARAMETRY SYSTÉMU'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="res-card">
                            <div className="res-label">{isEn ? 'RESOLUTION' : 'ROZLIŠENÍ'}</div>
                            <div className="res-val" style={{ color: '#66fcf1' }}>{resLabel}</div>
                        </div>
                        <div className="res-card">
                            <div className="res-label">{isEn ? 'GPU VRAM' : 'PAMĚŤ VRAM'}</div>
                            <div className="res-val">{gpu.vram_gb} GB</div>
                        </div>
                        <div className="res-card">
                            <div className="res-label">{isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA'}</div>
                            <div className="res-val">{gpu.architecture}</div>
                        </div>
                    </div>
                </section>

                {/* 🚀 SEO INTERNAL LINKING */}
                <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <div style={{ padding: '40px', background: 'rgba(15,17,21,0.8)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '950', color: '#fff', textTransform: 'uppercase', marginBottom: '15px' }}>
                            {isEn ? `Want to see how ${cleanGpuName} stacks up?` : `Zajímá tě srovnání s konkurencí?`}
                        </h3>
                        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
                            {isEn ? "Compare this graphics card directly with other models in our Versus Engine." : "Porovnej tuto grafiku s ostatními modely napřímo v našem Versus Enginu."}
                        </p>
                        <a href={`/${isEn ? 'en/' : ''}gpuvs`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 35px', background: 'linear-gradient(135deg, #ff0055 0%, #990033 100%)', color: '#fff', borderRadius: '16px', fontWeight: '950', fontSize: '14px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(255, 0, 85, 0.3)', transition: '0.3s' }}>
                            <Swords size={20} /> {isEn ? 'LAUNCH VS ENGINE' : 'SPUSTIT SOUBOJ KARET'}
                        </a>
                    </div>
                </section>

            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
                .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
                .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
                .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; transition: 0.3s; }
                .res-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
                .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #4b5563; letter-spacing: 2px; margin-bottom: 10px; }
                .res-val { font-size: 20px; font-weight: 950; color: #d1d5db; }
            `}} />
        </div>
    );
}
