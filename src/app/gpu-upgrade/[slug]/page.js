import React, { cache } from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar,
  Trophy,
  Zap,
  Gamepad2,
  LayoutList,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Activity,
  Crosshair,
  Monitor
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - DETAIL V90.0 (FINAL GURU VERSION)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ FIX 1: Integrace Deep Dive Analysis (odkazy na Performance, Recommend a FPS).
 * 🛡️ FIX 2: Vylepšeny fallbacks - prázdné hodnoty nyní skryjí i jednotku a ukážou jen čistou pomlčku '-'.
 * 🛡️ FIX 3: Odstraněna veškerá cache (revalidate 0) pro okamžitý refresh DB změn.
 * 🛡️ DESIGN: Čistý Duel layout (VS Ring), nikoliv Upgrade styl.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

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

function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    if (a.performance_index > b.performance_index) {
        return { 
            winner: a, 
            loser: b, 
            diff: Math.round((a.performance_index / b.performance_index - 1) * 100) 
        };
    }
    if (b.performance_index > a.performance_index) {
        return { 
            winner: b, 
            loser: a, 
            diff: Math.round((b.performance_index / a.performance_index - 1) * 100) 
        };
    }
    return { winner: null, loser: null, diff: 0 };
}

const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks || chunks.length === 0) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

const getSimilarDuels = async (gpuId, currentSlug) => {
    if (!supabaseUrl || !gpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=title_cs,title_en,slug,slug_en&or=(gpu_a_id.eq.${gpuId},gpu_b_id.eq.${gpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

async function generateAndPersistDuel(slug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    let parts = cleanSlug.includes('-vs-') ? cleanSlug.split('-vs-') : cleanSlug.split('-to-');
    if (!parts || parts.length !== 2) return null;

    const [cardA, cardB] = await Promise.all([findGpu(parts[0]), findGpu(parts[1])]);
    if (!cardA || !cardB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, gpu_a_id: cardA.id, gpu_b_id: cardB.id,
        title_cs: `Srovnání: ${cardA.name} vs ${cardB.name}`, title_en: `Comparison: ${cardA.name} vs ${cardB.name}`,
        content_cs: '', content_en: '', seo_description_cs: `Srovnání ${cardA.name} vs ${cardB.name}.`, seo_description_en: `Comparison of ${cardA.name} vs ${cardB.name}.`,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))";
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: { 
            'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 
            'Prefer': 'return=representation,resolution=merge-duplicates' 
        },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
        });
        const data = await checkExisting.json();
        return data[0];
    }
    const inserted = await dbRes.json();
    return inserted[0];
  } catch (err) { return null; }
}

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/geforce-/g, '').replace(/radeon-/g, '');
  const orQuery = `slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug},slug_en.eq.${slug}`;
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&or=(${encodeURIComponent(orQuery)})&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistDuel(slug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | Hardware Guru' };
  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const { winner, loser, diff } = calculatePerf(gpuA, gpuB);

  let title = winner 
    ? (isEn ? `${winner.name} vs ${loser.name} – ${diff}% Faster (Benchmark)` : `${winner.name} vs ${loser.name} – benchmark a FPS (+${diff} % výkon)`)
    : (isEn ? `${gpuA.name} vs ${gpuB.name} – Comparison` : `${gpuA.name} vs ${gpuB.name} – srovnání výkonu`);

  return { 
    title: `${title} | The Hardware Guru`, 
    alternates: { 
      canonical: `https://www.thehardwareguru.cz/gpuvs/${duel.slug}`,
      languages: { "en": `https://www.thehardwareguru.cz/en/gpuvs/${(duel.slug_en || `en-${duel.slug}`).replace(/^en-en-/,'en-')}`, "cs": `https://www.thehardwareguru.cz/gpuvs/${duel.slug}` }
    }
  };
}

export default async function GpuDuelDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>DUEL NENALEZEN</div>;

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const similarPromise = gpuA?.id ? getSimilarDuels(gpuA.id, duel.slug) : Promise.resolve([]);
  const { winner, loser, diff: finalPerfDiff } = calculatePerf(gpuA, gpuB);
  const similar = await similarPromise;

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

  const fpsA = gpuA?.game_fps?.[0] || {};
  const fpsB = gpuB?.game_fps?.[0] || {};

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((a / b) - 1) * 100);
  const cyberpunkDiff = calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p);
  const warzoneDiff = calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p);
  const starfieldDiff = calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p);
  
  const diffs = [cyberpunkDiff, warzoneDiff, starfieldDiff].filter(v => Number.isFinite(v) && v !== 0);
  const avgDiff = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : 0;

  const upgradeUrl = winner && loser ? `/${isEn ? 'en/' : ''}gpu-upgrade/${slugify(loser.name)}-to-${slugify(winner.name)}` : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'GPU TIER LIST' : 'ŽEBŘÍČEK GRAFIK'}</a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {gpuA.name} <span style={{ color: '#ff0055' }}>vs</span> {gpuB.name}
          </h1>
          {winner && (
            <div className="guru-verdict">{winner.name} {isEn ? 'is about' : 'je přibližně'} <strong>{finalPerfDiff}%</strong> {isEn ? 'faster in games' : 'výkonnější ve hrách'}</div>
          )}
          {upgradeUrl && (
            <a href={upgradeUrl} className="guru-upgrade-pill"><Zap size={14} fill="currentColor" /> {isEn ? 'Detailed Upgrade Analysis' : 'Detailní analýza upgradu'} <ArrowRight size={14} /></a>
          )}
        </header>

        {/* VS RING */}
        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div className="gpu-card-box" style={{ borderTop: `5px solid ${getVendorColor(gpuA.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(gpuA.vendor) }}>{gpuA.vendor}</span>
                <h2 className="gpu-name-text">{normalizeName(gpuA.name)}</h2>
            </div>
            <div className="vs-badge">vs</div>
            <div className="gpu-card-box" style={{ borderTop: `5px solid ${getVendorColor(gpuB.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(gpuB.vendor) }}>{gpuB.vendor}</span>
                <h2 className="gpu-name-text">{normalizeName(gpuB.name)}</h2>
            </div>
        </div>

        {/* BENCHMARK SUMMARY */}
        <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style" style={{ borderLeft: '6px solid #66fcf1' }}>
                <h2 className="section-h2" style={{ color: '#66fcf1', border: 'none', padding: 0 }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'GAMING PERFORMANCE SUMMARY' : 'SHRNUTÍ HERNÍHO VÝKONU'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {[{ label: 'CYBERPUNK 2077', diff: cyberpunkDiff }, { label: 'WARZONE', diff: warzoneDiff }, { label: 'STARFIELD', diff: starfieldDiff }].map((item, i) => (
                        <div key={i} className="summary-item">
                            <span className="summary-label">{item.label}</span>
                            <div className="summary-val" style={{ color: item.diff >= 0 ? '#66fcf1' : '#ff0055' }}>{item.diff > 0 ? '+' : ''}{item.diff} %</div>
                        </div>
                    ))}
                    <div className="summary-item" style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                        <span className="summary-label" style={{ color: '#66fcf1' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                        <div className="summary-val" style={{ color: '#fff' }}>{avgDiff > 0 ? '+' : ''}{avgDiff} %</div>
                    </div>
                </div>
            </div>
        </section>

        {/* SPECS TABLE */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2"><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div className="table-wrapper">
             {[
               { label: 'VRAM', valA: gpuA.vram_gb ? `${gpuA.vram_gb} GB` : '-', valB: gpuB.vram_gb ? `${gpuB.vram_gb} GB` : '-', winA: gpuA.vram_gb, winB: gpuB.vram_gb },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', valA: gpuA.memory_bus ?? '-', valB: gpuB.memory_bus ?? '-', winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: gpuA.boost_clock_mhz ? `${gpuA.boost_clock_mhz} MHz` : '-', valB: gpuB.boost_clock_mhz ? `${gpuB.boost_clock_mhz} MHz` : '-', winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz },
               { label: 'TDP', valA: gpuA.tdp_w ? `${gpuA.tdp_w} W` : '-', valB: gpuB.tdp_w ? `${gpuB.tdp_w} W` : '-', winA: gpuA.tdp_w ?? 999, winB: gpuB.tdp_w ?? 999, lower: true },
               { label: 'ARCHITECTURE', valA: gpuA.architecture ?? '-', valB: gpuB.architecture ?? '-', winA: 0, winB: 0 },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', valA: gpuA.release_date ? new Date(gpuA.release_date).getFullYear() : '-', valB: gpuB.release_date ? new Date(gpuB.release_date).getFullYear() : '-', winA: 0, winB: 0 },
               { label: 'MSRP PRICE', valA: gpuA.release_price_usd ? `$${gpuA.release_price_usd}` : '-', valB: gpuB.release_price_usd ? `$${gpuB.release_price_usd}` : '-', winA: gpuA.release_price_usd, winB: gpuB.release_price_usd, lower: true }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {/* DEEP DIVE CROSS LINKS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}><Activity size={36} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              {[gpuA, gpuB].map((gpu, i) => {
                  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
                  return (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(gpu.vendor) }}>{gpu.name}</div>
                      <div className="matrix-links">
                          <a href={`/${isEn ? 'en/' : ''}gpu-performance/${safeSlug}`} className="matrix-link"><BarChart3 size={14} /> {isEn ? 'Performance Specs' : 'Výkon a Parametry'}</a>
                          <a href={`/${isEn ? 'en/' : ''}gpu-recommend/${safeSlug}`} className="matrix-link"><ShieldCheck size={14} /> {isEn ? 'Guru Verdict' : 'Guru Verdikt'}</a>
                          <a href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/cyberpunk-2077`} className="matrix-link"><Gamepad2 size={14} /> Cyberpunk 2077 FPS</a>
                          <a href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/warzone`} className="matrix-link"><Monitor size={14} /> Warzone FPS</a>
                      </div>
                  </div>
                  );
              })}
          </div>
        </section>

        {/* SIMILAR DUELS */}
        {similar.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2"><LayoutList size={28} /> {isEn ? `COMPARE ${normalizeName(gpuA.name)} WITH` : `SROVNEJTE ${normalizeName(gpuA.name)} S...`}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '15px' }}>
              {similar.map((s, i) => (
                <a key={i} href={isEn ? `/en/gpuvs/${s.slug_en ?? `en-${s.slug}`}` : `/gpuvs/${s.slug}`} className="similar-link-card"><Swords size={16} color="#66fcf1" /> {isEn ? (s.title_en ?? s.title_cs) : s.title_cs}</a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="deals-btn-style"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn-style"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 25px; background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; margin-top: 25px; transition: 0.3s; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(10px); flex: 1; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .gpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(255,0,85,0.6); color: #fff; transform: rotate(-5deg); z-index: 10; margin: 0 -15px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .summary-label { display: block; font-size: 10px; font-weight: 900; color: #4b5563; margin-bottom: 8px; letter-spacing: 1px; }
        .summary-val { font-size: 24px; font-weight: 950; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .matrix-gpu-title { font-size: 15px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
        .matrix-links { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 13px; font-weight: bold; transition: 0.2s; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.05); transform: translateX(5px); }
        .similar-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.8); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .deals-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
        .support-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .vs-badge { margin: 10px auto; rotate: 0deg; } .table-label { width: 100px; } .spec-row-style { padding: 15px 10px; } }
      `}} />
    </div>
  );
}
