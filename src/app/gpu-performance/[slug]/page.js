import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Swords,
  CheckCircle2,
  Database,
  ArrowRight,
  Monitor,
  Zap,
  Flame,
  Heart,
  ExternalLink,
  BarChart3
} from 'lucide-react';

/**
 * GURU GPU PERFORMANCE ENGINE V2.5 (FINAL DESIGN PARITY)
 * Cesta: src/app/gpu-performance/[slug]/page.js
 * 🛡️ DESIGN: 1:1 s CPU verzí (Velký Hero blok, Grid, barvy vendorů).
 * 🛡️ FIX 1: Neprůstřelné parametry (params.slug || params.gpu).
 * 🛡️ FIX 2: 3-Tier vyhledávač (Exact -> Substring -> Tokenized).
 * 🛡️ FIX 3: Doplněna chybějící CTA tlačítka (Affiliate & Podpora).
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO GPU
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

export async function generateMetadata({ params }) {
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  return {
    title: isEn 
      ? `${gpu.name} Performance, Specs & Benchmarks | The Hardware Guru`
      : `${gpu.name} Výkon, Parametry a Benchmarky | The Hardware Guru`,
    description: isEn
      ? `Detailed technical specifications, VRAM, clock speeds and performance benchmarks for ${gpu.name}.`
      : `Detailní technické specifikace, kapacita VRAM, takty a výkonnostní benchmarky pro grafickou kartu ${gpu.name}.`,
    alternates: {
      canonical: `https://thehardwareguru.cz/gpu-performance/${safeSlug}`,
      languages: {
        'en': `https://thehardwareguru.cz/en/gpu-performance/${safeSlug}`,
        'cs': `https://thehardwareguru.cz/gpu-performance/${safeSlug}`
      }
    }
  };
}

export default async function GpuPerformancePage({ params }) {
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : (gpu.game_fps || {});
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

  // Dynamické načítání her pro benchmark odkazy
  const availableGames = Object.keys(fpsData || {})
    .filter(k => k !== 'gpu_id' && k !== 'id' && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'starfield'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Activity size={16} /> GURU PERFORMANCE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: vendorColor }}>{normalizeName(gpu.name)}</span> <br/>
            {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
          </h1>
        </header>

        {/* 🚀 VELKÝ HERO BLOK (Zcela identické s CPU Cinebench blokem) */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', borderLeft: '8px solid #66fcf1', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'Raw Gaming Performance Index' : 'Index hrubého herního výkonu'}
                </div>
                <div style={{ fontSize: 'clamp(60px, 12vw, 100px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: '0 0 40px rgba(102, 252, 241, 0.4)' }}>
                    {gpu.performance_index ?? 'N/A'} <span style={{ fontSize: '24px', color: '#66fcf1' }}>PTS</span>
                </div>
                <div style={{ background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(102, 252, 241, 0.3)', marginTop: '10px' }}>
                    <CheckCircle2 size={18} /> {isEn ? 'Aggregated Gaming Benchmark' : 'Agregovaný herní benchmark'}
                </div>
            </div>
        </section>

        {/* 🚀 TABULKA SPECIFIKACÍ V GRIDU (Identické s CPU stylem) */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <Database size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Video Memory' : 'Video Paměť'}</div>
                  <div className="res-val" style={{ color: '#66fcf1' }}>{gpu.vram_gb ?? '-'} GB</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Memory Bus' : 'Paměťová Sběrnice'}</div>
                  <div className="res-val">{gpu.memory_bus ?? '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div>
                  <div className="res-val" style={{ color: vendorColor }}>{gpu.boost_clock_mhz ?? '-'} MHz</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'TDP (Power)' : 'TDP (Spotřeba)'}</div>
                  <div className="res-val" style={{ color: '#ef4444' }}>{gpu.tdp_w ?? '-'} W</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Architecture' : 'Architektura'}</div>
                  <div className="res-val">{gpu.architecture ?? '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'MSRP Price' : 'Zaváděcí Cena'}</div>
                  <div className="res-val" style={{ color: '#10b981' }}>{gpu.release_price_usd ? `$${gpu.release_price_usd}` : '-'}</div>
              </div>
          </div>
        </section>

        {/* 🚀 HERNÍ BENCHMARK TESTY */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <Gamepad2 size={28} /> {isEn ? 'GAMING BENCHMARKS' : 'HERNÍ BENCHMARK TESTY'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {gamesList.map((game) => (
                  <a key={game} href={isEn ? `/en/gpu-fps/${safeSlug}/${game}` : `/gpu-fps/${safeSlug}/${game}`} className="game-link-card">
                      <ExternalLink size={16} color={vendorColor} /> 
                      <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>{game.replace(/-/g, ' ')}</span> FPS
                  </a>
              ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '60px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Want more data? Compare this GPU' : 'Chcete více dat? Porovnejte tuto grafiku'}
            </div>
            <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', color: '#0b0c10', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(102, 252, 241, 0.3)' }} className="launch-btn">
                <Swords size={20} /> {isEn ? 'Launch VS Engine' : 'Spustit VS Engine'} <ArrowRight size={18} />
            </a>
        </section>

        {/* 🚀 GLOBÁLNÍ CTA TLAČÍTKA (Affiliate & Podpora) */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Help us build this database by supporting us." : "Pomohla ti tato analýza? Podpoř naši databázi."}
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
        .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 26px; font-weight: 950; color: #fff; }

        .game-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; color: #d1d5db; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .game-link-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); color: #fff; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.6); }

        .launch-btn:hover { transform: scale(1.05); filter: brightness(1.1); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        @media (max-width: 768px) {
          .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
        }
      `}} />
    </div>
  );
}
