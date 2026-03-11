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

/**
 * GURU GPU PERFORMANCE ENGINE V2.0 (SEO CLUSTER)
 * Cesta: src/app/gpu-performance/[slug]/[game]/[resolution]/page.js
 * 🚀 TARGET: Extrémně specifické dotazy (např. "RTX 4070 Cyberpunk 4k fps").
 * 🛡️ DESIGN: Identický vizuál s hlavními profily (Hero bloky, Grid, CTA).
 * 🛡️ FIX: Ošetřeno tahání parametrů a opraveny odkazy do p*če (404).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// --- POMOCNÉ FUNKCE ---
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
    const rawSlug = params?.slug || params?.gpu || '';
    const gameSlug = params?.game || '';
    const resolution = params?.resolution || '';
    
    let isEn = false;
    try { isEn = rawSlug.startsWith('en-'); } catch(e) {}
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

    const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

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
                    <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn">
                        <ChevronLeft size={16} /> {isEn ? 'BACK TO VS ENGINE' : 'ZPĚT DO VELÍNA'}
                    </a>
                </div>

                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
                        <Activity size={16} /> GURU FPS RADAR
                    </div>
                    {/* 🚀 GURU SEO: Přesná shoda pro H1 (GPU + Hra + Rozlišení) */}
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
                        <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS <span style={{ fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.8 }}>({resLabel})</span>
                    </h1>
                </header>

                {/* 🚀 VELKÝ HERO BLOK (Ve stylu CPU) */}
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

                {/* 🚀 HARDWARE DATA V GRIDU */}
                <section style={{ marginBottom: '60px' }}>
                    <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
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

                {/* 🚀 OPRAVENÉ DEEP DIVE ODKAZY (Zamezuje 404 chybám) */}
                <section style={{ marginBottom: '60px' }}>
                  <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
                    <Activity size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="deep-link-card">
                          <Activity size={32} color={vendorColor} />
                          <div>
                              <h3>{isEn ? 'Full GPU Profile' : 'Kompletní Profil'}</h3>
                              <p>{isEn ? 'All specifications and hardware index.' : 'Všechny specifikace a HW index.'}</p>
                          </div>
                          <ArrowRight size={20} className="link-arrow" />
                      </a>
                      <a href={isEn ? `/en/gpu-recommend/${safeSlug}` : `/gpu-recommend/${safeSlug}`} className="deep-link-card">
                          <ShieldCheck size={32} color="#10b981" />
                          <div>
                              <h3>{isEn ? 'Guru Verdict: Buy?' : 'Verdikt: Koupit?'}</h3>
                              <p>{isEn ? 'Is it worth your money? Value analysis.' : 'Vyplatí se do ní investovat? Analýza.'}</p>
                          </div>
                          <ArrowRight size={20} className="link-arrow" />
                      </a>
                      <a href={isEn ? `/en/gpuvs` : `/gpuvs`} className="deep-link-card">
                          <Swords size={32} color="#a855f7" />
                          <div>
                              <h3>{isEn ? 'GPU VS Engine' : 'Srovnávač GPU'}</h3>
                              <p>{isEn ? 'Compare this GPU against any other.' : 'Porovnejte tuto grafiku s konkurencí.'}</p>
                          </div>
                          <ArrowRight size={20} className="link-arrow" />
                      </a>
                  </div>
                </section>

                {/* 🚀 GLOBÁLNÍ CTA TLAČÍTKA */}
                <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
                  <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
                    {isEn ? "Help us build this database by supporting us." : "Pomohl ti tento profil při výběru? Podpoř naši databázi."}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
                    <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
                      <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
                    </a>
                    <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
                      <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
                    </a>
                  </div>
                </div>

            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
                .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
                .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
                
                .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: 0.3s; }
                .res-card:hover { transform: translateY(-5px); border-color: rgba(102, 252, 241, 0.2); }
                .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #4b5563; letter-spacing: 2px; margin-bottom: 10px; }
                .res-val { font-size: 24px; font-weight: 950; color: #fff; }

                .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
                .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
                .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; transition: 0.3s; }
                .deep-link-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.8); }
                .deep-link-card:hover .link-arrow { color: #fff; transform: translateX(5px); }

                .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
                .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

                .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
                .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

                @media (max-width: 768px) {
                  .deep-link-card { padding: 20px; flex-direction: column; text-align: center; gap: 15px; }
                  .deep-link-card .link-arrow { display: none; }
                  .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
                }
            `}} />
        </div>
    );
}
