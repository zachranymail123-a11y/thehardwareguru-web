import React from 'react';
import { 
  ChevronLeft, 
  Monitor, 
  Database, 
  Gamepad2, 
  ArrowRight, 
  ExternalLink,
  Activity,
  CheckCircle2,
  Swords,
  LayoutList
} from 'lucide-react';

/**
 * GURU GPU ENGINE - DETAIL GRAFIKY V1.1 (NEXT.JS 15 STRICT PROMISE FIX)
 * Cesta: src/app/gpu/[slug]/page.js (nebo [gpu]/page.js)
 * 🛡️ FIX 1: Striktní zpracování 'props.params' pro odstranění Next.js 15 chyby.
 * 🛡️ FIX 2: Ošetření jak pro params.slug, tak pro params.gpu (dle struktury složek).
 */

export const runtime = "nodejs";
export const revalidate = 0; // Okamžitý refresh bez cache

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO GPU
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const url1 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${gpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

// 🚀 GURU NEXT.JS 15 STRICT FIX: Použití props místo přímé destrukturalizace params
export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = props?.isEn || rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  return {
    title: isEn 
      ? `${gpu.name} Specs, Benchmarks & Gaming Performance | The Hardware Guru`
      : `${gpu.name} Specifikace, Benchmarky a Herní výkon | The Hardware Guru`,
    description: isEn
      ? `Everything you need to know about ${gpu.name}. Detailed specifications, gaming benchmarks, and performance analysis.`
      : `Vše co potřebujete vědět o grafické kartě ${gpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`,
    alternates: {
      canonical: `https://www.thehardwareguru.cz/gpu/${safeSlug}`,
      languages: {
        'en': `https://www.thehardwareguru.cz/en/gpu/${safeSlug}`,
        'cs': `https://www.thehardwareguru.cz/gpu/${safeSlug}`
      }
    }
  };
}

// 🚀 GURU NEXT.JS 15 STRICT FIX: Použití props místo přímé destrukturalizace params
export default async function GpuDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = props?.isEn || rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : (gpu.game_fps || {});
  
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  
  // Dynamické načítání her z DB pro FPS odkazy
  const availableGames = Object.keys(fpsData || {})
    .filter(k => k !== 'gpu_id' && k !== 'id' && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'starfield'];

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#0071c5');
  };
  const vendorColor = getVendorColor(gpu.vendor);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs/ranking" : "/gpuvs/ranking"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU RANKING' : 'ZPĚT DO ŽEBŘÍČKU GPU'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Monitor size={16} /> {isEn ? 'GPU PROFILE' : 'PROFIL GRAFIKY'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{gpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(gpu.name)}</span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>
             {gpu.vram_gb} GB VRAM • {gpu.architecture}
          </div>
        </header>

        {/* 🚀 RYCHLÝ PŘEHLED (HERO STATS) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Boost Clock' : 'Boost Takt'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {gpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Video Memory' : 'Video Paměť'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {gpu.vram_gb ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>GB</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Power Draw' : 'Spotřeba (TDP)'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {gpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span>
                </div>
            </div>
        </section>

        {/* 🚀 DEEP DIVE ROZCESTNÍK */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color="#66fcf1" />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full technical specifications and benchmarks.' : 'Kompletní specifikace a syntetické testy.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
              <a href={isEn ? `/en/gpu-recommend/${safeSlug}` : `/gpu-recommend/${safeSlug}`} className="deep-link-card">
                  <CheckCircle2 size={32} color="#10b981" />
                  <div>
                      <h3>{isEn ? 'Guru Verdict: Buy?' : 'Verdikt: Koupit?'}</h3>
                      <p>{isEn ? 'Is it worth your money? Value analysis.' : 'Vyplatí se do ní investovat? Analýza cena/výkon.'}</p>
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

        {/* 🚀 TABULKA SPECIFIKACÍ V GURU STYLU */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div className="table-wrapper">
             {[
               { label: 'VRAM', val: gpu?.vram_gb ? `${gpu.vram_gb} GB` : '-' },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', val: gpu?.memory_bus ?? '-' },
               { label: 'BOOST CLOCK', val: gpu?.boost_clock_mhz ? `${gpu.boost_clock_mhz} MHz` : '-' },
               { label: 'TDP (SPOTŘEBA)', val: gpu?.tdp_w ? `${gpu.tdp_w} W` : '-' },
               { label: isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA', val: gpu?.architecture ?? '-' },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', val: gpu?.release_date ? new Date(gpu.release_date).getFullYear() : '-' },
               { label: isEn ? 'MSRP PRICE' : 'ZAVÁDĚCÍ CENA', val: gpu?.release_price_usd ? `$${gpu.release_price_usd}` : '-' }
             ].map((row, i) => (
               <div key={i} className="spec-row-style" style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <div className="table-label" style={{ textAlign: 'left', flex: 1 }}>{row.label}</div>
                 <div style={{ color: '#fff', fontWeight: '950', fontSize: '18px', textAlign: 'right', flex: 1 }}>{row.val}</div>
               </div>
             ))}
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

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
        
        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
        .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; transition: 0.3s; }
        .deep-link-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.8); }
        .deep-link-card:hover .link-arrow { color: #fff; transform: translateX(5px); }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-row-style:hover { background: rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        
        .game-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; color: #d1d5db; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .game-link-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); color: #fff; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.6); }

        @media (max-width: 768px) {
          .deep-link-card { padding: 20px; flex-direction: column; text-align: center; gap: 15px; }
          .deep-link-card .link-arrow { display: none; }
        }
      `}} />
    </div>
  );
}
