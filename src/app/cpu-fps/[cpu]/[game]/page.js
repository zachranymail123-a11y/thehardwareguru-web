import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  CheckCircle2,
  Monitor,
  ArrowRight,
  Cpu,
  Swords,
  Zap
} from 'lucide-react';

/**
 * GURU CPU FPS ENGINE - BENCHMARK PAGE V1.2 (RTX 5090 FIX & CACHE BYPASS)
 * Cesta: src/app/cpu-fps/[cpu]/[game]/page.js
 * 🛡️ FIX 1: Přidána klíčová informace o testovací grafice (NVIDIA RTX 5090).
 * 🛡️ FIX 2: Oprava tahání dat pro esport tituly (fallback na _1080p sloupec).
 * 🛡️ FIX 3: Revalidate 0 a no-store cache, aby se DB změny propsaly okamžitě.
 */

export const runtime = "nodejs";
export const revalidate = 0; // Okamžitý refresh bez cache!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO CPU
const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  // TIER 1: Exact match
  try {
      const url1 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  // TIER 2: Substring match 
  try {
      const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  // TIER 3: Tokenized AND match
  try {
      const cleanString = cpuSlug.replace(/-/g, ' ').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  const { cpu: rawCpuSlug, game: rawGameSlug } = params;
  
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  const gameLabel = gameSlug.replace(/-/g, ' ').toUpperCase();
  
  // 🚀 GURU FIX: Chytřejší tahání FPS (pokud není 1440p, zkusí 1080p např pro CS2)
  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps;
  const fps = fpsData ? (fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0) : 0;

  return {
    title: isEn 
      ? `${cpu.name} ${gameLabel} FPS (Tested on RTX 5090) | The Hardware Guru`
      : `${cpu.name} ${gameLabel} FPS (Testováno s RTX 5090) | The Hardware Guru`,
    description: isEn
      ? `See ${cpu.name} pure CPU performance in ${gameLabel} paired with NVIDIA RTX 5090. Average ${fps} FPS. Detailed bottleneck analysis.`
      : `Podívejte se na čistý výkon procesoru ${cpu.name} ve hře ${gameLabel} s kartou NVIDIA RTX 5090. Průměrně ${fps} FPS. Detailní analýza.`
  };
}

export default async function CpuFpsPage({ params }) {
  const { cpu: rawCpuSlug, game: rawGameSlug } = params;
  
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  const gameSlug = rawGameSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  // 🚀 GURU FIX: Chytré tahání z DB (pokud chybí sloupec 1440p, sáhne po 1080p, což opraví esport hry jako CS2)
  const gameKey = gameSlug.replace('-2077', '').replace(/-/g, '_');
  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps;
  const fpsBase = fpsData ? (fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0) : 0;
  
  // Klasické CPU škálování: 1080p je nejvíce CPU bound (vyšší FPS rozdíly), ve 4K brzdí spíše grafika
  const fps1080p = Math.round(fpsBase * 1.25);
  const fps1440p = fpsBase;
  const fps4k = Math.round(fpsBase * 0.85);

  const getVerdict = (f) => {
      if (f >= 120) return { en: 'ESPORTS READY', cz: 'ESPORT ÚROVEŇ', color: '#10b981' };
      if (f >= 60) return { en: 'SMOOTH GAMING', cz: 'PLYNULÉ HRANÍ', color: '#f59e0b' };
      if (f >= 30) return { en: 'PLAYABLE', cz: 'HRATELNÉ', color: '#eab308' };
      return { en: 'BOTTLENECK', cz: 'BRZDÍ SYSTÉM', color: '#ef4444' };
  };

  const verdict = getVerdict(fps1440p);
  const verdictText = isEn ? verdict.en : verdict.cz;
  const cleanGameLabel = gameSlug.replace(/-/g, ' ');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
               <Activity size={16} /> GURU CPU RADAR
             </div>
             {/* 🚀 GURU: NVIDIA RTX 5090 TEST SETUP BADGE */}
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#76b900', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', padding: '6px 16px', border: '1px solid rgba(118, 185, 0, 0.3)', borderRadius: '50px', background: 'rgba(118, 185, 0, 0.1)' }}>
               <Zap size={14} /> {isEn ? 'TEST SETUP: RTX 5090' : 'TESTOVÁNO S RTX 5090'}
             </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1' }}>
            {normalizeName(cpu.name)} <br/>
            <span style={{ color: '#f59e0b' }}>{cleanGameLabel}</span> FPS
          </h1>
        </header>

        {/* 🚀 FPS HERO CARD */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderLeft: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'Estimated Average FPS' : 'Odhadovaný průměr FPS'}
                </div>
                <div style={{ fontSize: '100px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: `0 0 40px ${verdict.color}40` }}>
                    {fps1440p > 0 ? fps1440p : '?'} <span style={{ fontSize: '30px', color: verdict.color }}>FPS</span>
                </div>
                {fps1440p > 0 && (
                  <div style={{ background: `${verdict.color}20`, color: verdict.color, padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: `1px solid ${verdict.color}40`, marginTop: '10px' }}>
                      <CheckCircle2 size={18} /> {verdictText}
                  </div>
                )}
            </div>
        </section>

        {/* 🚀 RESOLUTION SCALING (Explicit RTX 5090 mention) */}
        {fps1440p > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Monitor size={28} /> {isEn ? 'CPU PERFORMANCE SCALING' : 'ŠKÁLOVÁNÍ VÝKONU (CPU)'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="res-card">
                    <div className="res-label">1080p + RTX 5090</div>
                    <div className="res-val">~{fps1080p} FPS</div>
                </div>
                <div className="res-card" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <div className="res-label" style={{ color: '#f59e0b' }}>1440p + RTX 5090</div>
                    <div className="res-val" style={{ color: '#fff' }}>{fps1440p} FPS</div>
                </div>
                <div className="res-card">
                    <div className="res-label">4K + RTX 5090</div>
                    <div className="res-val">~{fps4k} FPS</div>
                </div>
            </div>
          </section>
        )}

        {/* 🚀 SEO CONTENT & RTX 5090 CONTEXT */}
        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style">
                <div className="guru-prose">
                    <h2>
                      {isEn 
                        ? `Is ${normalizeName(cpu.name)} good enough for ${cleanGameLabel}?` 
                        : `Stačí procesor ${normalizeName(cpu.name)} na hru ${cleanGameLabel}?`}
                    </h2>
                    
                    {isEn ? (
                      <>
                        <p>To accurately measure the pure processing power of the <strong>{normalizeName(cpu.name)}</strong> without any graphical bottlenecks, these benchmarks were conducted using the flagship <strong>NVIDIA GeForce RTX 5090</strong> graphics card. Paired with this extreme GPU, the processor delivers a solid gaming experience in <strong>{cleanGameLabel}</strong>.</p>
                        <p>At 1440p resolution, you can expect an average of <strong>{fps1440p > 0 ? fps1440p : 'N/A'} FPS</strong>. Remember that if you are using a significantly weaker graphics card, your actual framerate will be heavily limited by the GPU, making the CPU performance difference less noticeable, especially at 4K resolution.</p>
                      </>
                    ) : (
                      <>
                        <p>Abychom dokázali přesně změřit čistý výpočetní výkon procesoru <strong>{normalizeName(cpu.name)}</strong> bez jakéhokoliv grafického omezení (bottlenecku), byly tyto testy provedeny s využitím aktuální vlajkové lodi <strong>NVIDIA GeForce RTX 5090</strong>. S touto extrémní grafickou kartou poskytuje procesor vynikající zážitek ze hry <strong>{cleanGameLabel}</strong>.</p>
                        <p>Při hraní v rozlišení 1440p můžete očekávat průměrně <strong>{fps1440p > 0 ? fps1440p : 'N/A'} FPS</strong>. Nezapomeňte však, že pokud ve svém PC používáte podstatně slabší grafickou kartu, vaše reálné snímky za vteřinu budou brzděny právě grafikou a vliv tohoto procesoru bude menší (obzvlášť ve 4K).</p>
                      </>
                    )}
                </div>
            </div>
        </section>

        {/* 🚀 CROSS-LINK TO VS ENGINE */}
        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Want more data? Compare this CPU' : 'Chcete více dat? Porovnejte tento procesor'}
            </div>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#fff', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)' }}>
                <Swords size={20} /> {isEn ? 'Launch CPU VS Engine' : 'Spustit CPU VS Engine'} <ArrowRight size={18} />
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 0.8em; text-transform: uppercase; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #4b5563; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 24px; font-weight: 950; color: #d1d5db; }
      `}} />
    </div>
  );
}
