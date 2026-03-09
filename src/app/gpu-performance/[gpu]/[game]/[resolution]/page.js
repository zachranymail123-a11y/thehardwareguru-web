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
 * GURU GPU PERFORMANCE ENGINE V1.1 (PROGRAMMATIC SEO BOOST)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

/* 🚀 PROGRAMMATIC SEO GAME LIST */
const gamesList = [
'cyberpunk-2077',
'warzone',
'starfield',
'fortnite',
'cs2',
'gta-5',
'gta-6',
'witcher-3',
'red-dead-redemption-2',
'baldurs-gate-3',
'hogwarts-legacy',
'forza-horizon-5',
'call-of-duty-mw3',
'elden-ring',
'apex-legends',
'valorant',
'minecraft',
'helldivers-2',
'escape-from-tarkov',
'overwatch-2',
'diablo-4',
'assassins-creed-mirage',
'far-cry-6',
'doom-eternal',
'metro-exodus',
'resident-evil-4',
'dragon-age-dreadwolf',
'stalker-2',
'avowed',
'fable'
];

/* GPU LOOKUP */

const findGpuBySlug = cache(async (gpuSlug) => {

    if (!supabaseUrl) return null;

    const clean = gpuSlug.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
    
    const chunks = clean.match(/\d+|[a-zA-Z]+/g);
    if (!chunks) return null;
    
    const searchPattern = `%${chunks.join('%')}%`;
  
    try {

        const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
            headers: { 
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            next: { revalidate: 86400 }
        });

        const data = await res.json();
        return data?.[0] || null;

    } catch {
        return null;
    }

});

/* PERFORMANCE LOGIC */

const getPerformanceData = cache(async (gpuSlug, gameSlug, resolution) => {

    const gpu = await findGpuBySlug(gpuSlug);
    if (!gpu) return null;

    const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');

    const fpsData = gpu?.game_fps
      ? (Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps)
      : {};

    const baseFps = fpsData[`${gameKey}_1440p`] || 0;

    let finalFps = baseFps;

    if (resolution === '1080p') {
        finalFps = fpsData[`${gameKey}_1080p`] || Math.round(baseFps * 1.4);
    }
    else if (resolution === '4k') {
        finalFps = fpsData[`${gameKey}_4k`] || Math.round(baseFps * 0.6);
    }
    else if (resolution === 'dlss') {
        finalFps = Math.round(baseFps * 1.35);
    }
    else if (resolution === 'ray-tracing') {
        finalFps = Math.round(baseFps * 0.55);
    }

    return { gpu, finalFps };

});

/* METADATA */

export async function generateMetadata({ params }) {

    const { gpu: gpuSlug, game: gameSlug, resolution } = params;

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);
    if (!data) return { title: '404 | The Hardware Guru' };

    const { gpu } = data;

    const gameLabel = gameSlug.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
    const resLabel = resolution.toUpperCase();

    const canonicalUrl = `https://thehardwareguru.cz/gpu-performance/${gpuSlug}/${gameSlug}/${resolution}`;

    return {
        title: `${gpu.name} ${gameLabel} FPS (${resLabel}) | The Hardware Guru`,
        description: `Benchmark ${gpu.name} ve hře ${gameLabel} při rozlišení ${resLabel}.`,
        alternates:{
            canonical: canonicalUrl
        }
    };

}

/* PAGE */

export default async function GpuPerformancePage({ params }) {

    const { gpu: gpuSlug, game: gameSlug, resolution } = params;

    const data = await getPerformanceData(gpuSlug, gameSlug, resolution);

    if (!data) {
        return (
            <div style={{minHeight:'100vh',background:'#0a0b0d',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <h1 style={{color:'#ff0055'}}>404 - DATA NENALEZENA</h1>
            </div>
        );
    }

    const { gpu, finalFps } = data;

    const cleanGpuName = normalizeName(gpu.name);
    const gameLabel = gameSlug.replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
    const resLabel = resolution.toUpperCase();

    return (

        <div style={{minHeight:'100vh',background:'#0a0b0d',paddingTop:'120px',paddingBottom:'100px',color:'#fff'}}>

            <main style={{maxWidth:'900px',margin:'0 auto',padding:'0 20px'}}>

                <header style={{textAlign:'center',marginBottom:'60px'}}>
                    <h1 style={{fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:'950',textTransform:'uppercase'}}>
                        {cleanGpuName}<br/>
                        <span style={{color:'#66fcf1'}}>{gameLabel}</span> FPS ({resLabel})
                    </h1>
                </header>

                {/* HERO FPS */}

                <section style={{marginBottom:'60px',textAlign:'center'}}>
                    <div style={{fontSize:'120px',fontWeight:'900'}}>
                        {finalFps}
                        <span style={{fontSize:'30px'}}> FPS</span>
                    </div>
                </section>

                {/* PROGRAMMATIC SEO LINKS */}

                <section style={{marginBottom:'80px'}}>

                    <h2 style={{fontSize:'24px',fontWeight:'900',marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
                        <BarChart3 size={24}/> Další benchmarky GPU
                    </h2>

                    <div style={{
                        display:'grid',
                        gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
                        gap:'16px'
                    }}>

                        {gamesList.slice(0,12).map(game=>(
                            <a
                              key={game}
                              className="res-card"
                              href={`/gpu-performance/${gpuSlug}/${game}/${resolution}`}
                            >
                                {cleanGpuName} {game.replace(/-/g,' ')} FPS
                            </a>
                        ))}

                        <a className="res-card" href={`/gpu-performance/${gpuSlug}`}>
                          {cleanGpuName} Performance
                        </a>

                        <a className="res-card" href={`/gpuvs`}>
                          Compare GPUs
                        </a>

                    </div>

                </section>

            </main>

        </div>

    );

}
