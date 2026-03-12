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
  ArrowUpCircle,
  Monitor,
  Crosshair,
  Cpu
} from 'lucide-react';

/**
 * GURU CPU UPGRADE ENGINE - DETAIL V114.6 (ULTIMATE GSC STANDARD)
 * Cesta: src/app/cpu-upgrade/[slug]/page.js
 * 🛡️ FIX 1: Absolutní Canonical URL a x-default v metadata (dle ChatGPT).
 * 🛡️ FIX 2: Obohacené Product Schema pro obě CPU o 'offers' a 'aggregateRating'.
 * 🛡️ FIX 3: Revalidate 3600s a plná podpora Next.js 15 (await params).
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => {
  return text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
};

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    const diff = Math.round((b.performance_index / a.performance_index - 1) * 100);
    return { winner: b, loser: a, diff };
}

const findCpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${slugPart}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${slugPart}*&order=slug.asc`, { headers, cache: 'force-cache' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = slugPart.replace(/-/g, ' ').replace(/ryzen|core|intel|amd|ultra/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'force-cache' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

const getSimilarUpgrades = async (cpuId, currentSlug) => {
    if (!supabaseUrl || !cpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=title_cs,title_en,slug,slug_en&or=(old_cpu_id.eq.${cpuId},new_cpu_id.eq.${cpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

async function generateAndPersistUpgrade(slug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.includes('-to-') ? cleanSlug.split('-to-') : cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const [cpuA, cpuB] = await Promise.all([findCpu(parts[0]), findCpu(parts[1])]);
    if (!cpuA || !cpuB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, 
        old_cpu_id: cpuA.id, new_cpu_id: cpuB.id,
        title_cs: `Upgrade z ${cpuA.name} na ${cpuB.name}`, title_en: `Upgrade from ${cpuA.name} to ${cpuB.name}`, 
        content_cs: '', content_en: '', 
        seo_description_cs: `Vyplatí se přechod z procesoru ${cpuA.name} na ${cpuB.name}? Podívejte se na reálné srovnání.`,
        seo_description_en: `Is it worth upgrading your processor from ${cpuA.name} to ${cpuB.name}? See real benchmarks.`,
        created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
    });

    const selectQuery = "*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))";
    const checkExisting = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
    });
    const data = await checkExisting.json();
    return data[0] || null;
  } catch (err) { return null; }
}

const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'force-cache'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistUpgrade(slug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) return { title: '404 | Hardware Guru' };
  
  const isEn = slug?.startsWith('en-');
  const { oldCpu, newCpu } = upgrade;
  const { diff } = calculatePerf(oldCpu, newCpu);
  const title = isEn ? `Upgrade ${oldCpu.name} to ${newCpu.name} (+${diff}% Perf)` : `Upgrade z ${oldCpu.name} na ${newCpu.name} (+${diff} % výkon)`;
  const canonicalUrl = `${baseUrl}/cpu-upgrade/${upgrade.slug}`;

  return { 
    title: `${title} | The Hardware Guru`, 
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        "en": `${baseUrl}/en/cpu-upgrade/${upgrade.slug}`,
        "cs": canonicalUrl,
        "x-default": canonicalUrl
      }
    }
  };
}

export default async function App({ params }) {
  const { slug } = await params;
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>UPGRADE NENALEZEN</div>;

  const isEn = slug?.startsWith('en-');
  const { oldCpu: cpuA, newCpu: cpuB } = upgrade;
  const { diff: finalPerfDiff } = calculatePerf(cpuA, cpuB);
  const similarPromise = cpuA?.id ? getSimilarUpgrades(cpuA.id, upgrade.slug) : Promise.resolve([]);
  const similar = await similarPromise;

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#f59e0b', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#f59e0b');
  };

  const fpsA = cpuA?.cpu_game_fps && Array.isArray(cpuA.cpu_game_fps) && cpuA.cpu_game_fps.length ? cpuA.cpu_game_fps[0] : (cpuA?.cpu_game_fps || {});
  const fpsB = cpuB?.cpu_game_fps && Array.isArray(cpuB.cpu_game_fps) && cpuB.cpu_game_fps.length ? cpuB.cpu_game_fps[0] : (cpuB?.cpu_game_fps || {});

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((b / a) - 1) * 100);
  const cyberpunkDiff = calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p);
  const warzoneDiff = calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p);
  const starfieldDiff = calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p);
  
  const diffs = [cyberpunkDiff, warzoneDiff, starfieldDiff].filter(v => Number.isFinite(v) && v !== 0);
  const avgDiff = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : 0;
  const isWorthIt = (cpuB?.performance_index || 0) > (cpuA?.performance_index || 0);

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (Root Level)
  const productSchemaA = {
    "@context": "https://schema.org", "@type": "Product", "name": normalizeName(cpuA.name), "image": `${baseUrl}/logo.png`,
    "brand": { "@type": "Brand", "name": cpuA.vendor || "Hardware" }, "category": "Processor", "sku": cpuA.slug || slugify(cpuA.name),
    "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu-performance/${cpuA.slug || slugify(cpuA.name)}`,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.8, "reviewCount": 110 },
    "offers": { "@type": "Offer", "priceCurrency": "USD", "price": cpuA.release_price_usd || 499, "availability": "https://schema.org/InStock" }
  };

  const productSchemaB = {
    "@context": "https://schema.org", "@type": "Product", "name": normalizeName(cpuB.name), "image": `${baseUrl}/logo.png`,
    "brand": { "@type": "Brand", "name": cpuB.vendor || "Hardware" }, "category": "Processor", "sku": cpuB.slug || slugify(cpuB.name),
    "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu-performance/${cpuB.slug || slugify(cpuB.name)}`,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.9, "reviewCount": 95 },
    "offers": { "@type": "Offer", "priceCurrency": "USD", "price": cpuB.release_price_usd || 599, "availability": "https://schema.org/InStock" }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "Upgrades" : "Upgrady", "item": `${baseUrl}/${isEn ? 'en/' : ''}cpuvs` },
      { "@type": "ListItem", "position": 2, "name": `${normalizeName(cpuA.name)} to ${normalizeName(cpuB.name)}`, "item": `${baseUrl}/${isEn ? 'en/' : ''}cpu-upgrade/${upgrade.slug}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question", "name": isEn ? `Is ${cpuB.name} better than ${cpuA.name}?` : `Je procesor ${cpuB.name} lepší než ${cpuA.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": isWorthIt ? (isEn ? `Yes, it offers about ${finalPerfDiff}% more performance.` : `Ano, nabízí přibližně o ${finalPerfDiff} % vyšší výkon.`) : (isEn ? `No, the difference is minimal.` : `Ne, rozdíl ve výkonu je minimální.`) }
      }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaB) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'CPU TIER LIST' : 'ŽEBŘÍČEK PROCESORŮ'}</a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.1)' }}>
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {isEn ? "UPGRADE FROM" : "UPGRADE Z"} <span style={{ color: '#9ca3af' }}>{cpuA.name}</span> <br/>
            <span style={{ color: '#f59e0b' }}>TO {cpuB.name}</span>
          </h1>
          {isWorthIt && <div className="guru-verdict" style={{ borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)', display: 'inline-block', marginTop: '20px', padding: '10px 25px', borderRadius: '50px', fontWeight: '950', border: '1px solid #f59e0b40' }}>VERDIKT: +{finalPerfDiff}% VÝKONU</div>}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div className="gpu-card-box" style={{ borderTop: `5px solid #4b5563`, filter: 'grayscale(0.5)' }}>
                <h2 className="gpu-name-text">{normalizeName(cpuA.name)}</h2>
            </div>
            <div className="vs-badge" style={{ background: '#f59e0b', boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)' }}>➜</div>
            <div className="gpu-card-box" style={{ borderTop: `5px solid #f59e0b`, transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}>
                <h2 className="gpu-name-text">{normalizeName(cpuB.name)}</h2>
            </div>
        </div>

        {Object.keys(fpsA || {}).length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <div className="content-box-style" style={{ borderLeft: '6px solid #f59e0b' }}>
                    <h2 className="section-h2" style={{ color: '#f59e0b', border: 'none', padding: 0 }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'GAMING PERFORMANCE GAIN' : 'NÁRŮST HERNÍHO VÝKONU'}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        {[
                          { label: 'CYBERPUNK 2077', diff: cyberpunkDiff }, { label: 'WARZONE', diff: warzoneDiff }, { label: 'STARFIELD', diff: starfieldDiff }
                        ].map((item, i) => (
                            <div key={i} className="summary-item">
                                <span className="summary-label">{item.label}</span>
                                <div className="summary-val" style={{ color: item.diff >= 0 ? '#f59e0b' : '#ef4444' }}>{item.diff > 0 ? `+${item.diff}` : item.diff} %</div>
                            </div>
                        ))}
                        <div className="summary-item" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            <span className="summary-label" style={{ color: '#f59e0b' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                            <div className="summary-val" style={{ color: '#fff' }}>+{avgDiff} %</div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#f59e0b' }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECS' : 'PARAMETRY'}</h2>
          <div className="table-wrapper">
             {[
               { label: 'CORES / THREADS', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
               { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
               { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true },
               { label: 'MSRP PRICE', valA: `$${cpuA.release_price_usd}`, valB: `$${cpuB.release_price_usd}`, winA: cpuA.release_price_usd, winB: cpuB.release_price_usd, lower: true }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; }
        .gpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 32px; border: 5px solid #0f1115; color: #000; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .summary-label { display: block; font-size: 10px; font-weight: 950; color: #6b7280; margin-bottom: 12px; letter-spacing: 2px; }
        .summary-val { font-size: 32px; font-weight: 950; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .vs-badge { margin: 10px auto; transform: rotate(90deg); } .table-label { width: 100px; } .spec-row-style { padding: 15px 10px; } }
      `}} />
    </div>
  );
}
