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
 * GURU GPU PERFORMANCE ENGINE V1.0 (100K+ SEO PAGES CLUSTER)
 * Cesta: src/app/gpu-performance/[gpu]/[game]/[resolution]/page.js
 * 🚀 TARGET: Extrémně specifické dotazy (např. "RTX 4070 Cyberpunk 4k fps").
 * 🛡️ LOGIC: Datově řízené šablony bez nutnosti AI textu.
 * 🛡️ PERF: React cache() pro minimalizaci zátěže databáze.
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

// 🛡️ DATA ENGINE: Hledání GPU podle robustního parseru
const findGpuBySlug = cache(async (gpuSlug) => {
    if (!supabaseUrl) return null;
    const clean = gpuSlug.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
    
    const chunks = clean.match(/\d+|[a-zA-Z]+/g);
    if (!chunks || chunks.length === 0) return null;
    
    const searchPattern = `%${chunks.join('%')}%`;
  
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data[0] || null;
    } catch (e) { return null; }
});

// 🧠 LOGIC ENGINE
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

// --- METADATA ---
export async function generateMetadata({ params }) {
    const { gpu: gpuSlug, game: gameSlug, resolution } = params;

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu, finalFps } = data;
    const gameLabel = gameSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const resLabel = resolution.toUpperCase();

    const canonicalUrl = `https://thehardwareguru.cz/gpu-performance/${gpuSlug}/${gameSlug}/${resolution}`;

    return {
        title: `${gpu.name} ${gameLabel} FPS (${resLabel}) | The Hardware Guru`,
        description: `Benchmark ${gpu.name} ve hře ${gameLabel} při rozlišení ${resLabel}. Průměrné FPS a výkon grafické karty.`,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                en: `https://thehardwareguru.cz/en/gpu-performance/${gpuSlug}/${gameSlug}/${resolution}`,
                cs: canonicalUrl
            }
        }
    };
}

// --- HLAVNÍ KOMPONENTA ---
export default async function GpuPerformancePage({ params }) {

    const { gpu: gpuSlug, game: gameSlug, resolution } = params;

    let isEn = false;
    if (params.locale === 'en') isEn = true;

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

    let verdictColor = '#ef4444';
    if (finalFps >= 100) verdictColor = '#10b981';
    else if (finalFps >= 60) verdictColor = '#66fcf1';
    else if (finalFps >= 30) verdictColor = '#eab308';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', paddingTop: '120px', paddingBottom: '100px', color: '#fff' }}>
            
            <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase' }}>
                        {cleanGpuName} <br/>
                        <span style={{ color: '#66fcf1' }}>{gameLabel}</span> FPS ({resLabel})
                    </h1>
                </header>

                {/* HERO FPS */}
                <section style={{ marginBottom: '60px', textAlign:'center' }}>
                    <div style={{ fontSize:'120px', fontWeight:'900', color:'#fff' }}>
                        {finalFps}
                        <span style={{ fontSize:'30px', color:verdictColor }}> FPS</span>
                    </div>
                </section>

                {/* HARDWARE */}
                <section style={{ marginBottom:'60px' }}>
                    <h2 style={{ fontSize:'24px', fontWeight:'900', marginBottom:'20px' }}>
                        {isEn ? 'Hardware Settings' : 'Parametry systému'}
                    </h2>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px' }}>
                        <div className="res-card">
                            <div>{isEn ? 'Resolution' : 'Rozlišení'}</div>
                            <strong>{resLabel}</strong>
                        </div>

                        <div className="res-card">
                            <div>VRAM</div>
                            <strong>{gpu.vram_gb} GB</strong>
                        </div>

                        <div className="res-card">
                            <div>{isEn ? 'Architecture' : 'Architektura'}</div>
                            <strong>{gpu.architecture}</strong>
                        </div>
                    </div>
                </section>

                {/* PROGRAMMATIC SEO LINKS */}
                <section style={{ marginBottom: '80px' }}>
                  <h2 style={{ fontSize:'24px', fontWeight:'900', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
                    <BarChart3 size={24}/> {isEn ? 'More GPU Benchmarks' : 'Další benchmarky GPU'}
                  </h2>

                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
                    gap:'16px'
                  }}>

                    <a className="res-card" href={`/gpu-performance/${gpuSlug}/cyberpunk-2077/${resolution}`}>
                      {cleanGpuName} Cyberpunk FPS
                    </a>

                    <a className="res-card" href={`/gpu-performance/${gpuSlug}/warzone/${resolution}`}>
                      {cleanGpuName} Warzone FPS
                    </a>

                    <a className="res-card" href={`/gpu-performance/${gpuSlug}/starfield/${resolution}`}>
                      {cleanGpuName} Starfield FPS
                    </a>

                    <a className="res-card" href={`/gpu-performance/${gpuSlug}`}>
                      {cleanGpuName} Performance
                    </a>

                    <a className="res-card" href={`/gpu-upgrade/${gpuSlug}`}>
                      {isEn ? `Upgrade to ${cleanGpuName}` : `Upgrade na ${cleanGpuName}`}
                    </a>

                    <a className="res-card" href={`/gpuvs`}>
                      {isEn ? 'Compare GPUs' : 'Porovnat GPU'}
                    </a>

                  </div>
                </section>

            </main>
        </div>
    );
}
