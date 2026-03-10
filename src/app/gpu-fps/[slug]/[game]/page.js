import React from 'react';
import { 
  ChevronLeft, Activity, CheckCircle2, Monitor, ArrowRight, Swords, Zap, Gamepad2
} from 'lucide-react';

/**
 * GURU GPU FPS ENGINE - BENCHMARK PAGE V1.7 (FINAL FIX)
 * Cesta: src/app/gpu-fps/[slug]/[game]/page.js
 * 🛡️ FIX 1: Absolutní ochrana proti 'undefined' - pokud chybí data, zobrazí se 'N/A' nebo 0.
 * 🛡️ FIX 2: Sjednocen parametr na [slug] (žádné 'gpu' !== 'slug' errory).
 * 🛡️ FIX 3: 3-Tier slug fallback pro neprůstřelné vyhledávání.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

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
  const { slug: rawGpuSlug, game: rawGameSlug } = params;
  const isEn = rawGpuSlug.startsWith('en-');
  const gpuSlug = rawGpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  const gameLabel = gameSlug.replace(/-/g, ' ').toUpperCase();
  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  
  // Ochrana proti undefined
  const fpsDataArray = Array.isArray(gpu.game_fps) ? gpu.game_fps : [];
  const fpsData = fpsDataArray.length > 0 ? fpsDataArray[0] : (gpu.game_fps || {});
  const fps = Number(fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0);

  return {
    title: isEn 
      ? `${gpu.name} ${gameLabel} FPS Benchmark Result | The Hardware Guru`
      : `${gpu.name} ${gameLabel} FPS – výsledek benchmarku | The Hardware Guru`,
    description: isEn
      ? `Real-life performance of ${gpu.name} in ${gameLabel}. Average ${fps} FPS at 1440p. Detailed technical analysis.`
      : `Podívejte se na reálný výkon ${gpu.name} ve hře ${gameLabel}. Průměrně ${fps} FPS v rozlišení 1440p. Detailní analýza.`,
    alternates: {
        canonical: `https://thehardwareguru.cz/gpu-fps/${gpu.slug || gpuSlug}/${gameSlug}`,
        languages: { 
            "en": `https://thehardwareguru.cz/en/gpu-fps/${gpu.slug || gpuSlug}/${gameSlug}`, 
            "cs": `https://thehardwareguru.cz/gpu-fps/${gpu.slug || gpuSlug}/${gameSlug}` 
        }
    }
  };
}

export default async function GpuFpsPage({ params }) {
  const { slug: rawGpuSlug, game: rawGameSlug } = params;
  const isEn = rawGpuSlug.startsWith('en-');
  const gpuSlug = rawGpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  
  // 🚀 GURU FIX: Kompletní ochrana proti 'undefined' datům z DB
  const fpsDataArray = Array.isArray(gpu.game_fps) ? gpu.game_fps : [];
  const fpsData = fpsDataArray.length > 0 ? fpsDataArray[0] : (gpu.game_fps || {});
  
  const fpsBase = Number(fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0);
  const fps1080p = fpsBase > 0 ? Math.round(fpsBase * 1.4) : 0;
  const fps1440p = fpsBase;
  const fps4k = fpsBase > 0 ? Math.round(fpsBase * 0.6) : 0;

  const getVerdict = (f) => {
      if (f >= 100) return { en: 'ULTIMATE EXPERIENCE', cz: 'BEZ KOMPROMISŮ', color: '#10b981' };
      if (f >= 60) return { en: 'SMOOTH GAMING', cz: 'PLYNULÉ HRANÍ', color: '#66fcf1' };
      if (f >= 30) return { en: 'PLAYABLE', cz: 'HRATELNÉ', color: '#eab308' };
      if (f > 0) return { en: 'NOT RECOMMENDED', cz: 'NEDOPORUČUJEME', color: '#ef4444' };
      return { en: 'NO DATA', cz: 'NEDOSTATEK DAT', color: '#4b5563' };
  };

  const verdict = getVerdict(fps1440p);
  const verdictText = isEn ? verdict.en : verdict.cz;
  const cleanGameLabel = gameSlug.replace(/-/g, ' ');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/gpuvs" : "/gpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO ENGINE' : 'ZPĚT NA DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102,252,241,0.05)' }}>
            <Activity size={16} /> GURU FPS RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
            {normalizeName(gpu.name)} <br/>
            <span style={{ color: '#66fcf1' }}>{cleanGameLabel}</span> FPS
          </h1>
        </header>

        {/* 🚀 FPS HERO CARD */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', borderLeft: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? '1440p Resolution Average' : 'Průměr v rozlišení 1440p'}
                </div>
                <div style={{ fontSize: '100px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: `0 0 40px ${verdict.color}40` }}>
                    {fps1440p > 0 ? fps1440p : 'N/A'} {fps1440p > 0 && <span style={{ fontSize: '30px', color: verdict.color }}>FPS</span>}
                </div>
                <div style={{ background: `${verdict.color}20`, color: verdict.color, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${verdict.color}40`, marginTop: '10px' }}>
                    <CheckCircle2 size={18} /> {verdictText}
                </div>
            </div>
        </section>

        {/* 🚀 RESOLUTION SCALING */}
        {fps1440p > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Monitor size={28} /> {isEn ? 'PERFORMANCE SCALING' : 'ŠKÁLOVÁNÍ VÝKONU'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="res-card">
                    <div className="res-label">1080p Ultra</div>
                    <div className="res-val">~{fps1080p} FPS</div>
                </div>
                <div className="res-card" style={{ borderColor: '#66fcf1', background: 'rgba(102, 252, 241, 0.05)' }}>
                    <div className="res-label" style={{ color: '#66fcf1' }}>1440p High/Ultra</div>
                    <div className="res-val" style={{ color: '#fff' }}>{fps1440p} FPS</div>
                </div>
                <div className="res-card">
                    <div className="res-label">4K UHD</div>
                    <div className="res-val">~{fps4k} FPS</div>
                </div>
            </div>
          </section>
        )}

        {/* 🚀 SEO CONTENT */}
        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style">
                <div className="guru-prose">
                    <h2>
                      {isEn 
                        ? `Is ${normalizeName(gpu.name)} good for ${cleanGameLabel}?` 
                        : `Je ${normalizeName(gpu.name)} dobrá grafika pro ${cleanGameLabel}?`}
                    </h2>
                    
                    {isEn ? (
                      <>
                        <p>According to our technical database and aggregated benchmarks, the <strong>{normalizeName(gpu.name)}</strong> delivers a solid gaming experience in <strong>{cleanGameLabel}</strong>. At 1440p resolution with High/Ultra settings, you can expect an average of <strong>{fps1440p > 0 ? fps1440p : 'N/A'} FPS</strong>.</p>
                        <p>This performance level means the game will be {verdict.en.toLowerCase()} on your system. For the best experience, we recommend using a high-refresh-rate monitor and ensuring your drivers are up to date.</p>
                      </>
                    ) : (
                      <>
                        <p>Podle naší technické databáze a agregovaných benchmarků poskytuje <strong>{normalizeName(gpu.name)}</strong> vynikající herní zážitek ve hře <strong>{cleanGameLabel}</strong>. Při rozlišení 1440p a vysokých až ultra detailech můžete očekávat průměrně <strong>{fps1440p > 0 ? fps1440p : 'N/A'} FPS</strong>.</p>
                        <p>Tato úroveň výkonu znamená, že hra poběží na vašem systému jako <strong>{verdict.cz.toLowerCase()}</strong>. Pro co nejlepší plynulost doporučujeme použít monitor s vysokou obnovovací frekvencí a vždy udržovat aktuální ovladače grafické karty.</p>
                      </>
                    )}
                </div>
            </div>
        </section>

        {/* 🚀 CROSS-LINK TO VS ENGINE */}
        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Want more data? Compare this GPU' : 'Chcete více dat? Porovnejte tuto grafiku'}
            </div>
            <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', color: '#0b0c10', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(102, 252, 241, 0.3)', transition: '0.3s' }} className="launch-btn">
                <Swords size={20} /> {isEn ? 'Launch VS Engine' : 'Spustit VS Engine'} <ArrowRight size={18} />
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 0.8em; text-transform: uppercase; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; transition: 0.3s; }
        .res-card:hover { transform: translateY(-5px); border-color: rgba(102, 252, 241, 0.2); }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #4b5563; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 24px; font-weight: 950; color: #d1d5db; }
        .launch-btn:hover { transform: scale(1.05); filter: brightness(1.1); }
      `}} />
    </div>
  );
}
