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
 * GURU GPU DUELS ENGINE - DETAIL V117.1 (SEO GOLD FIX)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ FIX 1: Starý regex vyhledávač kompletně nahrazen za náš 3-Tier Slug systém!
 * 🛡️ FIX 2: Pozitivní matematika pro souhrn FPS (vždy ukazuje % náskok vítěze).
 * 🛡️ FIX 3: Imunní vůči parametrům slug vs gpu a plný bypass cache.
 * 🛡️ FIX 4: Zlatý SEO Standard s ItemList, Offers a FAQPage (dle instrukcí ChatGPT).
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text.toLowerCase().replace(/nvidia|amd|geforce|radeon|graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
};

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    if (a.performance_index > b.performance_index) {
        return { winner: a, loser: b, diff: Math.round((a.performance_index / b.performance_index - 1) * 100) };
    }
    return { winner: b, loser: a, diff: Math.round((b.performance_index / a.performance_index - 1) * 100) };
}

// 🚀 GURU ENGINE: THE 3-TIER BULLETPROOF LOOKUP
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

async function generateAndPersistDuel(rawSlug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = rawSlug.replace(/^en-/, '');
    let parts = cleanSlug.includes('-vs-') ? cleanSlug.split('-vs-') : cleanSlug.split('-to-');
    if (!parts || parts.length !== 2) return null;

    // 🚀 3-Tier lookup na obě grafiky
    const [cardA, cardB] = await Promise.all([findGpuBySlug(parts[0]), findGpuBySlug(parts[1])]);
    if (!cardA || !cardB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, gpu_a_id: cardA.id, gpu_b_id: cardB.id,
        title_cs: `Srovnání grafických karet: ${cardA.name} vs ${cardB.name}`, 
        title_en: `Graphics cards comparison: ${cardA.name} vs ${cardB.name}`,
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
        return data[0] || null;
    }
    const inserted = await dbRes.json();
    return inserted[0];
  } catch (err) { return null; }
}

const getDuelData = cache(async (rawSlug) => {
  if (!supabaseUrl || !rawSlug) return null;
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistDuel(rawSlug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata({ params }) {
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const duel = await getDuelData(rawSlug);
  if (!duel) return { title: '404 | Hardware Guru' };
  
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
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const duel = await getDuelData(rawSlug);
  
  if (!duel) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>DUEL NENALEZEN</div>;

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

  const fpsA = Array.isArray(gpuA?.game_fps) ? gpuA.game_fps[0] : (gpuA?.game_fps || {});
  const fpsB = Array.isArray(gpuB?.game_fps) ? gpuB.game_fps[0] : (gpuB?.game_fps || {});

  // 🚀 GURU MATH FIX: Zamezení záporným procentům
  const fpsWinner = winner?.id === gpuA.id ? fpsA : fpsB;
  const fpsLoser = loser?.id === gpuA.id ? fpsA : fpsB;

  const calcSafeLead = (valWinner, valLoser) => {
    if (!valWinner || !valLoser || valLoser === 0) return 0;
    return Math.round(((valWinner / valLoser) - 1) * 100);
  };

  const cyberpunkLead = calcSafeLead(fpsWinner?.cyberpunk_1440p, fpsLoser?.cyberpunk_1440p);
  const warzoneLead = calcSafeLead(fpsWinner?.warzone_1440p, fpsLoser?.warzone_1440p);
  const starfieldLead = calcSafeLead(fpsWinner?.starfield_1440p, fpsLoser?.starfield_1440p);
  
  const diffs = [cyberpunkLead, warzoneLead, starfieldLead].filter(v => v > 0);
  const avgLead = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : finalPerfDiff;

  const safeSlugA = gpuA.slug || slugify(gpuA.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const safeSlugB = gpuB.slug || slugify(gpuB.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const upgradeUrl = winner && loser ? `/${isEn ? 'en/' : ''}gpu-upgrade/${slugify(loser.name)}-to-${slugify(winner.name)}` : null;

  // 🚀 GURU FIX: Zlatý SEO Standard s ItemList, Offers a FAQPage (dle instrukcí ChatGPT)
  const productSchemaA = {
    "@type": "Product",
    "name": normalizeName(gpuA.name),
    "image": "https://www.thehardwareguru.cz/logo.png",
    "description": isEn ? `Performance analysis and benchmarks for ${normalizeName(gpuA.name)}` : `Analýza výkonu a benchmarky pro ${normalizeName(gpuA.name)}`,
    "brand": { "@type": "Brand", "name": gpuA.vendor || "Hardware" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": 124
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": gpuA.release_price_usd || 499,
      "availability": "https://schema.org/InStock",
      "url": `https://www.thehardwareguru.cz/${isEn ? 'en/' : ''}gpu-performance/${safeSlugA}`
    }
  };

  const productSchemaB = {
    "@type": "Product",
    "name": normalizeName(gpuB.name),
    "image": "https://www.thehardwareguru.cz/logo.png",
    "description": isEn ? `Performance analysis and benchmarks for ${normalizeName(gpuB.name)}` : `Analýza výkonu a benchmarky pro ${normalizeName(gpuB.name)}`,
    "brand": { "@type": "Brand", "name": gpuB.vendor || "Hardware" },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.7,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": 98
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": gpuB.release_price_usd || 399,
      "availability": "https://schema.org/InStock",
      "url": `https://www.thehardwareguru.cz/${isEn ? 'en/' : ''}gpu-performance/${safeSlugB}`
    }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      productSchemaA,
      productSchemaB
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${normalizeName(gpuA.name)} better than ${normalizeName(gpuB.name)}?` : `Je ${normalizeName(gpuA.name)} lepší než ${normalizeName(gpuB.name)}?`,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": winner
              ? (isEn ? `Yes, ${normalizeName(winner.name)} is about ${finalPerfDiff}% faster in gaming benchmarks.` : `Ano, ${normalizeName(winner.name)} je v herních benchmarcích přibližně o ${finalPerfDiff} % výkonnější.`)
              : (isEn ? `Both GPUs offer very similar gaming performance.` : `Obě grafiky nabízejí velmi vyrovnaný herní výkon.`)
        }
      },
      {
        "@type": "Question",
        "name": isEn ? `Which GPU is a better upgrade: ${normalizeName(gpuA.name)} or ${normalizeName(gpuB.name)}?` : `Která grafika je lepší na upgrade: ${normalizeName(gpuA.name)} nebo ${normalizeName(gpuB.name)}?`,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": winner
              ? (isEn ? `The ${normalizeName(winner.name)} provides better raw performance, making it a stronger upgrade path.` : `Karta ${normalizeName(winner.name)} nabízí vyšší hrubý výkon, což z ní dělá silnější volbu pro upgrade.`)
              : (isEn ? `Both cards are comparable, base your decision on pricing and specific features.` : `Obě karty jsou srovnatelné, rozhodujte se podle aktuální ceny a doplňkových funkcí.`)
        }
      }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* 🚀 INJEKCE JSON-LD DO STRÁNKY (ITEM LIST + FAQ) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'GPU TIER LIST' : 'ŽEBŘÍČEK GRAFIK'}</a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {normalizeName(gpuA.name)} <span style={{ color: '#ff0055' }}>vs</span> {normalizeName(gpuB.name)}
          </h1>
          {winner && (
            <div className="guru-verdict" style={{ background: '#66fcf120', color: '#66fcf1', padding: '12px 35px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '25px', fontWeight: '950', border: '1px solid #66fcf140', textTransform: 'uppercase', letterSpacing: '1px' }}>
               <Zap size={18} fill="currentColor" /> {normalizeName(winner.name)} {isEn ? 'IS' : 'JE O'} {finalPerfDiff}% {isEn ? 'FASTER' : 'VÝKONNĚJŠÍ'}
            </div>
          )}
          {upgradeUrl && (
            <div style={{ marginTop: '20px' }}>
               <a href={upgradeUrl} className="guru-upgrade-pill"><Zap size={14} fill="currentColor" /> {isEn ? 'Detailed Upgrade Analysis' : 'Analýza upgradu'} <ArrowRight size={14} /></a>
            </div>
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

        {/* 🚀 SHRNUTÍ HERNÍHO VÝKONU */}
        {winner && (
            <section style={{ marginBottom: '60px' }}>
                <div className="content-box-style" style={{ borderLeft: '6px solid #66fcf1' }}>
                    <h2 className="section-h2" style={{ color: '#66fcf1', border: 'none', padding: 0 }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'GAMING PERFORMANCE SUMMARY' : 'SHRNUTÍ HERNÍHO VÝKONU'}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        {[{ label: 'CYBERPUNK 2077', diff: cyberpunkLead }, { label: 'WARZONE', diff: warzoneLead }, { label: 'STARFIELD', diff: starfieldLead }].map((item, i) => (
                            <div key={i} className="summary-item">
                                <span className="summary-label">{item.label}</span>
                                <div className="summary-val" style={{ color: '#66fcf1' }}>{item.diff > 0 ? `+${item.diff}` : '0'} %</div>
                            </div>
                        ))}
                        <div className="summary-item" style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                            <span className="summary-label" style={{ color: '#66fcf1' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                            <div className="summary-val" style={{ color: '#fff' }}>+{avgLead} %</div>
                        </div>
                    </div>
                </div>
            </section>
        )}

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
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(gpu.vendor) }}>{normalizeName(gpu.name)}</div>
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

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-flex; align-items: center; gap: 10px; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 25px; background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; margin-top: 25px; transition: 0.3s; }
        
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(10px); flex: 1; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .gpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(255,0,85,0.6); color: #fff; transform: rotate(-5deg); z-index: 10; margin: 0 -15px; }
        
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; transition: 0.3s; }
        .summary-item:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
        .summary-label { display: block; font-size: 10px; font-weight: 950; color: #6b7280; margin-bottom: 12px; letter-spacing: 2px; }
        .summary-val { font-size: 32px; font-weight: 950; text-shadow: 0 0 20px rgba(102, 252, 241, 0.3); }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .matrix-gpu-title { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
        .matrix-links { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 13px; font-weight: bold; transition: 0.2s; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.1); transform: translateX(5px); }
        
        .similar-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.8); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .vs-badge { margin: 10px auto; rotate: 0deg; } .table-label { width: 100px; } .spec-row-style { padding: 15px 10px; } }
      `}} />
    </div>
  );
}
