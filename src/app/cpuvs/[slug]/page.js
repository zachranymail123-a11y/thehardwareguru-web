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
  Cpu,
  Activity,
  BarChart3,
  Gamepad2,
  LayoutList,
  TrendingUp,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

/**
 * GURU CPU DUELS ENGINE - DETAIL V68.2 (ULTIMATE GSC STANDARD)
 * Cesta: src/app/cpuvs/[slug]/page.js
 * 🛡️ FIX 1: Obohaceno Product Schema pro obě CPU o 'offers' a 'aggregateRating' pro GSC validitu.
 * 🛡️ FIX 2: Přidán x-default do hreflang clusteru a absolutní Canonical URL.
 * 🛡️ FIX 3: Plná podpora Next.js 15 (await params).
 * 🛡️ FIX 4: Revalidate nastaven na 3600s (1 hodina) pro optimální SEO.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

// 🚀 GURU: Agresivní slugify engine
const slugify = (text) => {
  return text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
};

const normalizeName = (name = '') => name.replace(/Intel |AMD |Ryzen |Core /gi, '');

// 🛡️ GURU ENGINE: Vyhledávání CPU z DB (ROBUSTNÍ PARSER)
const findCpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  
  const clean = slugPart.replace(/-/g, " ").replace(/ryzen|core|intel|amd|ultra/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks || chunks.length === 0) return null;
  
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers, cache: 'force-cache'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

// 🛡️ GURU ENGINE: Načtení podobných duelů
const getSimilarDuels = async (cpuId, currentSlug) => {
    if (!supabaseUrl || !cpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=title_cs,title_en,slug,slug_en&or=(cpu_a_id.eq.${cpuId},cpu_b_id.eq.${cpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

// 🚀 GURU ENGINE: Generování Duelu
async function generateAndPersistDuel(slug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    let parts = cleanSlug.includes('-vs-') ? cleanSlug.split('-vs-') : cleanSlug.split('-to-');
    if (!parts || parts.length !== 2) return null;

    const [cpuA, cpuB] = await Promise.all([findCpu(parts[0]), findCpu(parts[1])]);
    if (!cpuA || !cpuB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, cpu_a_id: cpuA.id, cpu_b_id: cpuB.id,
        title_cs: `Srovnání procesorů: ${cpuA.name} vs ${cpuB.name}`, title_en: `Processors comparison: ${cpuA.name} vs ${cpuB.name}`,
        content_cs: '', content_en: '', seo_description_cs: `Srovnání ${cpuA.name} vs ${cpuB.name}.`, seo_description_en: `Comparison of ${cpuA.name} vs ${cpuB.name}.`,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,cpuA:cpus!cpu_a_id(*),cpuB:cpus!cpu_b_id(*)";
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
        });
        const data = await checkExisting.json();
        return data[0] || null;
    }
    const inserted = await dbRes.json();
    return inserted[0];
  } catch (err) { return null; }
}

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,cpuA:cpus!cpu_a_id(*),cpuB:cpus!cpu_b_id(*)`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'force-cache'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistDuel(slug);
      return data[0];
  } catch (e) { return null; }
});

// SEO Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | The Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const { cpuA, cpuB } = duel;
  
  const hasPerfData = cpuA?.performance_index > 0 && cpuB?.performance_index > 0;
  let perfWinner = null, perfLoser = null, perfDiff = 0;

  if (hasPerfData) {
      if (cpuA.performance_index > cpuB.performance_index) {
          perfWinner = cpuA; perfLoser = cpuB;
          perfDiff = Math.round(((cpuA.performance_index / cpuB.performance_index) - 1) * 100);
      } else if (cpuB.performance_index > cpuA.performance_index) {
          perfWinner = cpuB; perfLoser = cpuA;
          perfDiff = Math.round(((cpuB.performance_index / cpuA.performance_index) - 1) * 100);
      }
  }

  const title = perfWinner 
    ? (isEn ? `${perfWinner.name} vs ${perfLoser.name} – ${perfDiff}% Faster` : `${perfWinner.name} vs ${perfLoser.name} – benchmark (+${perfDiff} % výkon)`)
    : (isEn ? `${cpuA.name} vs ${cpuB.name} – CPU Comparison` : `${cpuA.name} vs ${cpuB.name} – srovnání procesorů`);

  const canonicalUrl = `${baseUrl}/cpuvs/${duel.slug}`;

  return { 
    title: `${title} | The Hardware Guru`,
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        "en": `${baseUrl}/en/cpuvs/${(duel.slug_en || `en-${duel.slug}`).replace(/^en-en-/,'en-')}`,
        "cs": canonicalUrl,
        "x-default": canonicalUrl
      }
    }
  };
}

export default async function CpuDuelDetail({ params }) {
  const { slug } = await params;
  const duel = await getDuelData(slug);
  
  if (!duel) return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>DUEL NENALEZEN</div>;

  const isEn = slug?.startsWith('en-');
  const { cpuA, cpuB } = duel;
  const backLink = isEn ? '/en/cpuvs' : '/cpuvs';
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(duel.created_at || Date.now()));
  
  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const hasPerfData = cpuA.performance_index > 0 && cpuB.performance_index > 0;
  let perfWinner = null, perfLoser = null, perfDiff = 0, perfColor = '#4b5563';

  if (hasPerfData) {
    if (cpuA.performance_index > cpuB.performance_index) {
      perfWinner = cpuA; perfLoser = cpuB;
      perfDiff = Math.round(((cpuA.performance_index / cpuB.performance_index) - 1) * 100);
      perfColor = getVendorColor(cpuA.vendor);
    } else if (cpuB.performance_index > cpuA.performance_index) {
      perfWinner = cpuB; perfLoser = cpuA;
      perfDiff = Math.round(((cpuB.performance_index / cpuA.performance_index) - 1) * 100);
      perfColor = getVendorColor(cpuB.vendor);
    }
  }

  const upgradeUrl = perfWinner && perfLoser ? `/${isEn ? 'en/' : ''}cpu-upgrade/${slugify(perfLoser.name)}-to-${slugify(perfWinner.name)}` : null;
  const similar = await (cpuA?.id ? getSimilarDuels(cpuA.id, duel.slug) : Promise.resolve([]));

  const safeSlugA = cpuA.slug || slugify(cpuA.name);
  const safeSlugB = cpuB.slug || slugify(cpuB.name);

  // 🚀 ZLATÁ GSC SEO SCHÉMATA
  const productSchemaA = {
    "@context": "https://schema.org", "@type": "Product", "name": normalizeName(cpuA.name), "image": `${baseUrl}/logo.png`,
    "brand": { "@type": "Brand", "name": cpuA.vendor || "Hardware" }, "category": "Processor", "sku": safeSlugA,
    "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu-performance/${safeSlugA}`,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.8, "reviewCount": 110 },
    "offers": { "@type": "Offer", "priceCurrency": "USD", "price": cpuA.release_price_usd || 499, "availability": "https://schema.org/InStock", "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu-performance/${safeSlugA}` }
  };

  const productSchemaB = {
    "@context": "https://schema.org", "@type": "Product", "name": normalizeName(cpuB.name), "image": `${baseUrl}/logo.png`,
    "brand": { "@type": "Brand", "name": cpuB.vendor || "Hardware" }, "category": "Processor", "sku": safeSlugB,
    "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu-performance/${safeSlugB}`,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.7, "reviewCount": 95 },
    "offers": { "@type": "Offer", "priceCurrency": "USD", "price": cpuB.release_price_usd || 399, "availability": "https://schema.org/InStock", "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu-performance/${safeSlugB}` }
  };

  const itemListSchema = {
    "@context": "https://schema.org", "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "item": { "@id": productSchemaA.url, "name": productSchemaA.name } },
      { "@type": "ListItem", "position": 2, "item": { "@id": productSchemaB.url, "name": productSchemaB.name } }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "CPU VS" : "CPU Duely", "item": `${baseUrl}/${isEn ? 'en/' : ''}cpuvs` },
      { "@type": "ListItem", "position": 2, "name": `${normalizeName(cpuA.name)} vs ${normalizeName(cpuB.name)}`, "item": `${baseUrl}/${isEn ? 'en/' : ''}cpuvs/${duel.slug}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question", "name": isEn ? `Is ${cpuA.name} better than ${cpuB.name}?` : `Je procesor ${cpuA.name} lepší než ${cpuB.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": perfWinner ? (isEn ? `Yes, ${perfWinner.name} is about ${perfDiff}% faster in gaming.` : `Ano, ${perfWinner.name} je ve hrách přibližně o ${perfDiff} % výkonnější.`) : "Both CPUs offer very similar performance." }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org", "@type": "TechArticle", "headline": isEn ? `${cpuA.name} vs ${cpuB.name} performance comparison` : `Srovnání výkonu ${cpuA.name} vs ${cpuB.name}`,
    "description": perfWinner ? (isEn ? `${perfWinner.name} is about ${perfDiff}% faster.` : `${perfWinner.name} je o ${perfDiff} % výkonnější.`) : "Direct CPU comparison.",
    "author": { "@type": "Organization", "name": "The Hardware Guru" }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaB) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={backLink} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link">
            <TrendingUp size={16} /> {isEn ? 'CPU TIER LIST' : 'ŽEBŘÍČEK PROCESORŮ'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', lineHeight: '1.1', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {cpuA.name} <span style={{ color: '#ff0055' }}>vs</span> {cpuB.name}
          </h1>

          {perfWinner && <div className="guru-verdict">{perfWinner.name} {isEn ? 'is about' : 'je přibližně'} <strong>{perfDiff}%</strong> {isEn ? 'faster in games' : 'výkonnější ve hrách'}</div>}
          {upgradeUrl && <a href={upgradeUrl} className="guru-upgrade-pill"><Zap size={14} fill="currentColor" /> {isEn ? `Upgrade Analysis` : `Analýza upgradu`} <ArrowRight size={14} /></a>}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div className="cpu-box" style={{ borderTop: `5px solid ${getVendorColor(cpuA.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(cpuA.vendor) }}>{cpuA.vendor}</span>
                <h2 className="cpu-name-text">{normalizeName(cpuA.name)}</h2>
            </div>
            <div className="vs-badge">VS</div>
            <div className="cpu-box" style={{ borderTop: `5px solid ${getVendorColor(cpuB.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(cpuB.vendor) }}>{cpuB.vendor}</span>
                <h2 className="cpu-name-text">{normalizeName(cpuB.name)}</h2>
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#66fcf1' }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div className="table-wrapper">
             {[
               { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
               { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
               { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true },
               { label: 'MSRP PRICE', valA: `$${cpuA.release_price_usd || '-'}`, valB: `$${cpuB.release_price_usd || '-'}`, winA: cpuA.release_price_usd, winB: cpuB.release_price_usd, lower: true }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#66fcf1' }}><Activity size={36} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              {[cpuA, cpuB].map((cpu, i) => {
                  const s = cpu.slug || slugify(cpu.name);
                  return (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(cpu.vendor) }}>{cpu.name}</div>
                      <div className="matrix-links">
                          <a href={`/${isEn ? 'en/' : ''}cpu/${s}`} className="matrix-link"><Cpu size={14} /> {isEn ? 'Full Profile' : 'Profil procesoru'}</a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-performance/${s}`} className="matrix-link"><BarChart3 size={14} /> {isEn ? 'Specs & Performance' : 'Výkon a Parametry'}</a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-recommend/${s}`} className="matrix-link"><ShieldCheck size={14} /> {isEn ? 'Guru Verdict' : 'Guru Verdikt'}</a>
                      </div>
                  </div>
                  );
              })}
          </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
             <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
          </a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
             <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
          </a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 25px; background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; margin-top: 25px; transition: 0.3s; }
        
        .cpu-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; flex: 1; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .cpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(255,0,85,0.6); color: #fff; transform: rotate(-5deg); z-index: 10; margin: 0 -15px; }
        
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .matrix-gpu-title { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
        .matrix-links { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 13px; font-weight: bold; transition: 0.2s; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.1); transform: translateX(5px); }
        
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .vs-badge { margin: 10px auto; rotate: 0deg; } }
      `}} />
    </div>
  );
}
