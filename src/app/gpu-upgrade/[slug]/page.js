import React, { cache } from 'react';
import { ChevronLeft, Zap, ArrowRight, CheckCircle2, Gamepad2, Coins, Activity, ArrowUpCircle } from 'lucide-react';

/**
 * GURU GPU UPGRADE ENGINE - DETAIL V114.0 (1:1 CPU PARITY FIX)
 * Cesta: src/app/gpu-upgrade/[slug]/page.js
 * 🛡️ FIX: Zcela sjednoceno s bezchybnou logikou CPU Upgrades.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

const findGpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${slugPart}*&order=slug.asc`, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = slugPart.replace(/-/g, ' ').replace(/geforce|radeon|nvidia|amd/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

async function generateAndPersistUpgrade(slug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.includes('-to-') ? cleanSlug.split('-to-') : cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const [gpuA, gpuB] = await Promise.all([findGpu(parts[0]), findGpu(parts[1])]);
    if (!gpuA || !gpuB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, old_gpu_id: gpuA.id, new_gpu_id: gpuB.id,
        title_cs: `Upgrade z ${gpuA.name} na ${gpuB.name}`, title_en: `Upgrade from ${gpuA.name} to ${gpuB.name}`, 
        content_cs: '', content_en: '', seo_description_cs: `Vyplatí se přechod z ${gpuA.name} na ${gpuB.name}?`, seo_description_en: `Is it worth upgrading from ${gpuA.name} to ${gpuB.name}?`,
        created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
    });

    const selectQuery = "*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))";
    const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store' });
    const data = await checkExisting.json();
    return data[0] || null;
  } catch (err) { return null; }
}

const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistUpgrade(slug);
      return data[0];
  } catch (e) { return null; }
});

export default async function GpuUpgradePage({ params }) {
  const slug = params?.slug ?? null;
  const upgrade = await getUpgradeData(slug);
  
  if (!upgrade) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>UPGRADE PATH NENALEZENA</div>;

  const isEn = slug?.startsWith('en-');
  const { oldGpu: gpuA, newGpu: gpuB } = upgrade;

  if (!gpuA || !gpuB) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>GPU DATA ERROR</div>;

  // 🚀 MATH FIX z CPU
  const finalPerfDiff = Math.round(((gpuB.performance_index / gpuA.performance_index) - 1) * 100);
  const isWorthIt = (gpuB?.performance_index || 0) > (gpuA?.performance_index || 0);

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const fpsA = Array.isArray(gpuA?.game_fps) ? gpuA.game_fps[0] : (gpuA?.game_fps || {});
  const fpsB = Array.isArray(gpuB?.game_fps) ? gpuB.game_fps[0] : (gpuB?.game_fps || {});

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((b / a) - 1) * 100);
  
  const cyberpunkDiff = calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p);
  const warzoneDiff = calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p);
  const starfieldDiff = calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p);
  
  const diffs = [cyberpunkDiff, warzoneDiff, starfieldDiff].filter(v => Number.isFinite(v) && v !== 0);
  const avgDiff = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'GPU BATTLES' : 'GPU DUELY'}</a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.1)' }}>
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {isEn ? "SHOULD YOU UPGRADE FROM" : "VYPLATÍ SE UPGRADE Z"} <br/>
            <span style={{ color: '#9ca3af' }}>{gpuA.name}</span> <br/>
            <span style={{ color: '#66fcf1' }}>TO {gpuB.name}?</span>
          </h1>

          {isWorthIt && (
            <div className="guru-verdict" style={{ borderColor: '#66fcf1', color: '#66fcf1', background: 'rgba(102, 252, 241, 0.05)', display: 'inline-block', marginTop: '20px', padding: '10px 25px', borderRadius: '50px', fontWeight: '950' }}>
                {isEn ? 'VERDICT:' : 'VERDIKT:'} <strong>{gpuB.name}</strong> {isEn ? 'is a solid upgrade' : 'je výborný upgrade'} (+{finalPerfDiff}%)
            </div>
          )}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid #4b5563`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', filter: 'grayscale(0.5)' }}>
                <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px' }}>{isEn ? 'CURRENT GPU' : 'SOUČASNÁ KARTA'}</span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#d1d5db', textTransform: 'uppercase', margin: '15px 0 0 0' }}>{normalizeName(gpuA.name)}</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '5px solid #0f1115', boxShadow: '0 0 30px rgba(102, 252, 241, 0.5)' }}><ArrowRight size={32} /></div>
            </div>

            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(102, 252, 241, 0.3)' }}>
                <span style={{ color: getVendorColor(gpuB.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px' }}>{isEn ? 'NEW UPGRADE' : 'NOVÝ UPGRADE'}</span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '15px 0 10px 0' }}>{normalizeName(gpuB.name)}</h2>
                <div style={{ fontSize: '14px', color: '#66fcf1', fontWeight: '950' }}>{finalPerfDiff > 0 ? '+' : ''}{finalPerfDiff}% {isEn ? 'RAW POWER' : 'VÝKONU NAVÍC'}</div>
            </div>
        </div>

        {/* 🚀 SHRNUTÍ HERNÍHO VÝKONU (Opravená matematika) */}
        {Object.keys(fpsA || {}).length > 0 && Object.keys(fpsB || {}).length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '6px solid #66fcf1' }}>
                    <h2 style={{ color: '#66fcf1', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase' }}>
                        <BarChart3 size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'PERFORMANCE & FPS GAIN' : 'NÁRŮST VÝKONU A FPS'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {[
                            { label: 'CYBERPUNK 2077 (1440p)', diff: cyberpunkDiff, oldFps: fpsA.cyberpunk_1440p, newFps: fpsB.cyberpunk_1440p },
                            { label: 'WARZONE (1440p)', diff: warzoneDiff, oldFps: fpsA.warzone_1440p, newFps: fpsB.warzone_1440p },
                            { label: 'STARFIELD (1440p)', diff: starfieldDiff, oldFps: fpsA.starfield_1440p, newFps: fpsB.starfield_1440p }
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#4b5563', marginBottom: '8px', letterSpacing: '1px' }}>{item.label}</span>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>{item.oldFps ?? '-'} FPS ➔ <span style={{ color: '#fff', fontWeight: 'bold' }}>{item.newFps ?? '-'} FPS</span></div>
                                <div style={{ fontSize: '24px', fontWeight: '950', color: item.diff >= 0 ? '#66fcf1' : '#ef4444' }}>{item.diff > 0 ? '+' : ''}{item.diff} %</div>
                            </div>
                        ))}
                        <div style={{ background: 'rgba(102, 252, 241, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(102, 252, 241, 0.3)', textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#66fcf1', marginBottom: '8px', letterSpacing: '1px' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                            <div style={{ fontSize: '24px', fontWeight: '950', color: '#fff' }}>{avgDiff > 0 ? '+' : ''}{avgDiff} %</div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: '950', margin: '0 0 30px 0', textTransform: 'uppercase', borderLeft: '4px solid #66fcf1', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutList size={28} /> {isEn ? 'UPGRADE SPECIFICATIONS' : 'POROVNÁNÍ PARAMETRŮ'}
          </h2>
          <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
             <div style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', background: 'rgba(0,0,0,0.5)', color: '#9ca3af', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 <div style={{ flex: 1, textAlign: 'right' }}>{isEn ? 'CURRENT' : 'SOUČASNÁ'}</div>
                 <div style={{ width: '180px', textAlign: 'center' }}></div>
                 <div style={{ flex: 1, textAlign: 'left', color: '#66fcf1' }}>{isEn ? 'UPGRADE' : 'NOVÁ'}</div>
             </div>
             {[
               { label: 'VRAM', valA: gpuA?.vram_gb ? `${gpuA.vram_gb} GB` : '-', valB: gpuB?.vram_gb ? `${gpuB.vram_gb} GB` : '-', winA: gpuA?.vram_gb, winB: gpuB?.vram_gb },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', valA: gpuA?.memory_bus ?? '-', valB: gpuB?.memory_bus ?? '-', winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: gpuA?.boost_clock_mhz ? `${gpuA.boost_clock_mhz} MHz` : '-', valB: gpuB?.boost_clock_mhz ? `${gpuB.boost_clock_mhz} MHz` : '-', winA: gpuA?.boost_clock_mhz, winB: gpuB?.boost_clock_mhz },
               { label: 'TDP (SPOTŘEBA)', valA: gpuA?.tdp_w ? `${gpuA.tdp_w} W` : '-', valB: gpuB?.tdp_w ? `${gpuB.tdp_w} W` : '-', winA: gpuA?.tdp_w ?? 999, winB: gpuB?.tdp_w ?? 999, lower: true },
               { label: isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA', valA: gpuA?.architecture ?? '-', valB: gpuB?.architecture ?? '-', winA: 0, winB: 0 },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', valA: gpuA?.release_date ? new Date(gpuA.release_date).getFullYear() : '-', valB: gpuB?.release_date ? new Date(gpuB.release_date).getFullYear() : '-', winA: 0, winB: 0 },
               { label: isEn ? 'MSRP PRICE' : 'ZAVÁDĚCÍ CENA', valA: gpuA?.release_price_usd ? `$${gpuA.release_price_usd}` : '-', valB: gpuB?.release_price_usd ? `$${gpuB.release_price_usd}` : '-', winA: gpuA?.release_price_usd, winB: gpuB?.release_price_usd, lower: true }
             ].map((row, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '16px' }}>{row.valA}</div>
                 <div style={{ width: '180px', textAlign: 'center', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <a href={`/${isEn ? 'en/' : ''}gpuvs/${gpuA.slug}-vs-${gpuB.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '20px 45px', background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', color: '#000', borderRadius: '18px', fontWeight: '950', fontSize: '16px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 15px 40px rgba(102, 252, 241, 0.4)', transition: '0.3s' }}>
                <Activity size={20} /> {isEn ? 'FULL BENCHMARK COMPARISON' : 'KOMPLETNÍ SROVNÁNÍ BENCHMARKŮ'} <ArrowRight size={18} />
            </a>
        </section>

      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; gap: 15px !important; } }
      `}} />
    </div>
  );
}
