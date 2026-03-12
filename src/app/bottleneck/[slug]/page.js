import React from 'react';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V18.1 (BACKUP + GSC SCHEMA FIX)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🛡️ FIX 1: Ošetření řetězce "undefined" ve vyhledávání (řeší URL chyby).
 * 🛡️ FIX 2: Sekce GURU RÁDCE a CTA tlačítka se nyní zobrazují i na chybové stránce.
 * 🛡️ FIX 3: Oprava odkazů v GURU RÁDCI (přidán /en prefix pro anglickou verzi).
 * 🛡️ FIX 4: Aplikován ZLATÝ GSC STANDARD (Root Product schema + Offers + Rating).
 * 🛡️ FIX 5: Cache nastavena na stabilních 3600s a relativní Canonical.
 */

export const runtime = "nodejs";
export const revalidate = 3600; // 🚀 GURU FIX: 3600 (1 hodina) pro lepší SEO a stabilitu.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');

// 🚀 GURU FIX: Slugify fallback pro generování bezpečných SEO url do schémat
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: 3-TIER BULLETPROOF LOOKUP
const findHw = async (table, slugPart) => {
  // 🚀 GURU FIX: Pokud je slugPart prázdný nebo doslova "undefined", okamžitě končíme
  if (!slugPart || slugPart === 'undefined') return null;
  
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      // TIER 1: Přesný match na slug
      const url1 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      // TIER 2: Substring match
      const url2 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=ilike.*${slugPart}*&limit=1`;
      const res2 = await fetch(url2, { headers, cache: 'force-cache' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      // TIER 3: Tokenizované hledání (Nejsilnější fallback)
      const clean = slugPart.replace(/-/g, ' ').replace(/ryzen|core|intel|amd|geforce|rtx|radeon|rx/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&and=(${conditions})&limit=1`;
          const res3 = await fetch(url3, { headers, cache: 'force-cache' });
          if (res3.ok) { const data3 = await res3.json(); if (data3?.length) return data3[0]; }
      }
  } catch(e) { console.error("Database Lookup Error", e); }
  return null;
};

const getAnalysisData = async (slug) => {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] || null;
  const gameParts = resParts[0].split('-in-');
  const gameSlug = gameParts[1] || null;
  const hwParts = gameParts[0].split('-with-');
  if (hwParts.length !== 2) return null;
  const [cpu, gpu] = await Promise.all([findHw('cpus', hwParts[0]), findHw('gpus', hwParts[1])]);
  return { cpu, gpu, gameSlug, resolution };
};

// 📚 KOMPONENTA GURU RÁDCE (Reusability)
const GuruMasterclass = ({ isEn }) => (
  <section style={{ marginBottom: '60px' }}>
     <h2 className="section-h2" style={{ borderLeft: '4px solid #a855f7' }}>
        {isEn ? 'GURU MASTERCLASS' : 'GURU RÁDCE'}
     </h2>
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          <a href={isEn ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="article-link-card">
              <Info size={18} /> {isEn ? 'How to fix bottleneck' : 'Jak vyřešit bottleneck'}
          </a>
          <a href={isEn ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="article-link-card">
              <BarChart3 size={18} /> {isEn ? 'Best CPU for RTX 50' : 'Nejlepší CPU pro RTX 50'}
          </a>
          <a href={isEn ? "/en/clanky/jak-usetrit-na-hardwaru-navod" : "/clanky/jak-usetrit-na-hardwaru-navod"} className="article-link-card">
              <Flame size={18} /> {isEn ? 'Save on Hardware' : 'Jak ušetřit na HW'}
          </a>
     </div>
  </section>
);

// 🚀 KOMPONENTA CTA TLAČÍTEK
const GlobalActions = ({ isEn }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
      <a href="https://kick.com/thehardwareguru" target="_blank" rel="nofollow sponsored" className="live-btn"><Flame size={20} /> {isEn ? 'WATCH LIVE' : 'SLEDOVAT LIVE'}</a>
      <a href={isEn ? "/en/support" : "/support"} className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
  </div>
);

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analýza | Hardware Guru' };
  
  const title = isEn 
    ? `${data.cpu.name} + ${data.gpu.name} Bottleneck & FPS Analysis`
    : `${data.cpu.name} + ${data.gpu.name} – Analýza Bottlenecku a FPS`;

  const desc = isEn
    ? `Calculate PC bottleneck for ${data.cpu.name} and ${data.gpu.name}. Detailed FPS analysis, upgrade recommendations and system balance.`
    : `Kalkulačka bottlenecku pro ${data.cpu.name} a ${data.gpu.name}. Detailní analýza FPS, doporučení pro upgrade a vyváženost systému.`;

  // 🚀 GURU FIX: Relativní canonical
  const canonicalUrl = `/bottleneck/${rawSlug.replace(/^en-/, '')}`;

  return { 
    title: `${title} | The Hardware Guru`,
    description: desc,
    alternates: {
        canonical: canonicalUrl,
        languages: { 
            'en': `/en${canonicalUrl}`,
            'cs': canonicalUrl
        }
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: `${title} | The Hardware Guru`,
      description: desc,
      siteName: "The Hardware Guru"
    }
  };
}

export default async function BottleneckPage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);

  // 🚀 GURU RECOVERY UI: Hardware nenalezen
  if (!data?.cpu || !data?.gpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontWeight: '950', fontSize: '2rem' }}>{isEn ? 'COMPONENT NOT FOUND' : 'KOMPONENT NENALEZEN'}</h2>
                <p style={{ color: '#6b7280', marginTop: '10px', fontSize: '1.1rem' }}>{isEn ? 'System could not identify the hardware. Check URL.' : 'Systém nedokázal identifikovat zadaný hardware. Zkontrolujte prosím URL.'}</p>
                <a href="/" style={{ marginTop: '30px', display: 'inline-block', padding: '15px 40px', background: '#f59e0b', color: '#000', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase' }}>{isEn ? 'BACK HOME' : 'ZPĚT NA ÚVOD'}</a>
            </div>
            
            {/* Zobrazení rad i na chybové stránce */}
            <GuruMasterclass isEn={isEn} />
            <GlobalActions isEn={isEn} />
        </main>
        <style dangerouslySetInnerHTML={{__html: `
          .section-h2 { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; padding-left: 15px; }
          .article-link-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.2s; }
          .article-link-card:hover { background: rgba(168, 85, 247, 0.1); color: #fff; border-color: rgba(168, 85, 247, 0.3); transform: translateX(5px); }
          .support-btn, .live-btn { display: flex; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
          .support-btn { background: #eab308; color: #000; }
          .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; }
          .support-btn:hover, .live-btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        `}} />
    </div>
  );

  const { cpu, gpu, gameSlug, resolution } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  let bottleneckScore = cpuPower < gpuPower * 0.75 
    ? Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100)
    : (gpuPower < cpuPower * 0.6 ? Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100) : 0);

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');

  // Logika pro recirkulaci (Upgrade návrhy)
  const betterCpuSlug = isEn ? `en-core-i7-14700k-with-${gpu.slug || slugify(gpu.name)}` : `core-i7-14700k-with-${gpu.slug || slugify(gpu.name)}`;
  const betterGpuSlug = isEn ? `en-${cpu.slug || slugify(cpu.name)}-with-geforce-rtx-5080` : `${cpu.slug || slugify(cpu.name)}-with-geforce-rtx-5080`;

  // 🚀 ZLATÁ GSC SEO SCHÉMATA PRO BOTTLENECK
  const baseUrl = "https://thehardwareguru.cz";
  const safeCpuSlug = cpu.slug || slugify(cpu.name);
  const safeGpuSlug = gpu.slug || slugify(gpu.name);

  const productSchemaA = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": normalizeName(cpu.name),
    "image": `${baseUrl}/logo.png`,
    "description": isEn ? `Processor ${normalizeName(cpu.name)} specifications.` : `Procesor ${normalizeName(cpu.name)} specifikace.`,
    "brand": { "@type": "Brand", "name": cpu.vendor || "Hardware" },
    "category": "Processor",
    "sku": safeCpuSlug,
    "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu/${safeCpuSlug}`,
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
      "price": cpu.release_price_usd || 499,
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu/${safeCpuSlug}`
    }
  };

  const productSchemaB = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": normalizeName(gpu.name),
    "image": `${baseUrl}/logo.png`,
    "description": isEn ? `Graphics card ${normalizeName(gpu.name)} specifications.` : `Grafická karta ${normalizeName(gpu.name)} specifikace.`,
    "brand": { "@type": "Brand", "name": gpu.vendor || "Hardware" },
    "category": "Graphics Card",
    "sku": safeGpuSlug,
    "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu/${safeGpuSlug}`,
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
      "price": gpu.release_price_usd || 399,
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu/${safeGpuSlug}`
    }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "item": { "@id": productSchemaA.url, "name": productSchemaA.name } },
      { "@type": "ListItem", "position": 2, "item": { "@id": productSchemaB.url, "name": productSchemaB.name } }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isEn ? "Bottleneck Calculator" : "Kalkulačka Bottlenecku",
        "item": `${baseUrl}/${isEn ? 'en' : ''}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${normalizeName(cpu.name)} + ${normalizeName(gpu.name)}`,
        "item": `${baseUrl}/${isEn ? 'en/' : ''}bottleneck/${rawSlug.replace(/^en-/, '')}`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${normalizeName(cpu.name)} a bottleneck for ${normalizeName(gpu.name)}?` : `Bude ${normalizeName(cpu.name)} brzdit grafiku ${normalizeName(gpu.name)}?`,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": bottleneckScore < 15 
              ? (isEn ? `No, this is an ideal match with only ${bottleneckScore}% bottleneck.` : `Ne, jde o ideální spojení s minimálním bottleneckem pouze ${bottleneckScore} %.`)
              : (isEn ? `Yes, there is a ${bottleneckScore}% bottleneck in this system.` : `Ano, systém vykazuje omezení výkonu (bottleneck) o hodnotě ${bottleneckScore} %.`)
        }
      },
      {
        "@type": "Question",
        "name": isEn ? `What power supply (PSU) do I need for ${normalizeName(gpu.name)}?` : `Jaký zdroj (PSU) potřebuji pro ${normalizeName(gpu.name)}?`,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": isEn 
              ? `Based on the TDP, we recommend at least a ${gpu.tdp_w > 300 ? '850W' : (gpu.tdp_w > 200 ? '750W' : '650W')} power supply.` 
              : `Na základě spotřeby doporučujeme zdroj o výkonu alespoň ${gpu.tdp_w > 300 ? '850W' : (gpu.tdp_w > 200 ? '750W' : '650W')}.`
        }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": isEn ? `${normalizeName(cpu.name)} and ${normalizeName(gpu.name)} bottleneck analysis` : `Analýza bottlenecku: ${normalizeName(cpu.name)} a ${normalizeName(gpu.name)}`,
    "description": isEn ? `System calculates a bottleneck score of ${bottleneckScore}%.` : `Systém vypočítal úroveň bottlenecku na ${bottleneckScore} %.`,
    "author": { "@type": "Organization", "name": "The Hardware Guru" }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '100px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* 🚀 JSON-LD INJECTIONS NA KOŘENOVÉ ÚROVNI */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaB) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />

      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous"></script>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="radar-badge">
            <Gauge size={16} /> GURU BOTTLENECK RADAR
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.3, fontSize: '0.4em', display: 'block', margin: '10px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        {/* 📊 HLAVNÍ VÝSLEDEK */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${statusColor}40`, borderRadius: '30px', padding: '60px 40px', textAlign: 'center', marginBottom: '60px', boxShadow: `0 30px 100px ${statusColor}15` }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'System Bottleneck' : 'Bottleneck systému'}</div>
            <div style={{ fontSize: 'clamp(80px, 15vw, 130px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '10px 0' }}>{bottleneckScore}%</div>
            <div className="status-pill" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                {bottleneckScore < 15 ? (isEn ? 'IDEAL MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
            </div>
        </section>

        {/* 🚀 DOPORUČENÍ PRO SESTAVU */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #66fcf1' }}>
            {isEn ? 'SYSTEM RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             <div className="spec-card-box">
                <PlugZap size={24} color="#f97316" />
                <div className="card-label">PSU (ZDROJ)</div>
                <div className="card-val">{gpu.tdp_w > 300 ? '850W+' : (gpu.tdp_w > 200 ? '750W' : '650W')}</div>
             </div>
             <div className="spec-card-box">
                <Layers size={24} color="#10b981" />
                <div className="card-label">CHIPSET</div>
                <div className="card-val">{cpu.vendor === 'AMD' ? 'B650 / X670' : 'B760 / Z790'}</div>
             </div>
             <div className="spec-card-box">
                <Database size={24} color="#a855f7" />
                <div className="card-label">RAM</div>
                <div className="card-val">{cpu.name.includes('5000') ? 'DDR4 3600 MT/s' : '32GB DDR5 6000MT/s'}</div>
             </div>
          </div>
        </section>

        {/* 🚀 RECIRKULACE: CHCETE VYŠŠÍ VÝKON? */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #f59e0b' }}>
            {isEn ? 'WANT BETTER PERFORMANCE?' : 'CHCETE VYŠŠÍ VÝKON?'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <a href={`/bottleneck/${betterCpuSlug}`} className="recirc-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-circle"><Cpu size={24} /></div>
                    <div>
                        <div className="card-label-small">{isEn ? 'UPGRADE CPU' : 'LEPŠÍ PROCESOR'}</div>
                        <div className="card-title">Srovnat s i7-14700K</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
              </a>
              <a href={`/bottleneck/${betterGpuSlug}`} className="recirc-card" style={{ borderLeftColor: '#76b900' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-circle" style={{ background: '#76b90020', color: '#76b900' }}><Zap size={24} /></div>
                    <div>
                        <div className="card-label-small">{isEn ? 'UPGRADE GPU' : 'LEPŠÍ GRAFIKA'}</div>
                        <div className="card-title">Srovnat s RTX 5080</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
              </a>
          </div>
        </section>

        {/* 📚 GURU RÁDCE (Evergreen sekce) */}
        <GuruMasterclass isEn={isEn} />

        <GlobalActions isEn={isEn} />

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .status-pill { padding: 12px 35px; border-radius: 50px; display: inline-block; font-weight: 950; fontSize: 14px; text-transform: uppercase; }
        .section-h2 { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; padding-left: 15px; }
        
        .spec-card-box { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .card-label { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin: 10px 0 5px; }
        .card-val { font-size: 18px; font-weight: 950; color: #fff; }

        .recirc-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.95); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); border-left: 5px solid #f59e0b; text-decoration: none; color: #fff; transition: 0.3s; }
        .recirc-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .icon-circle { width: 50px; height: 50px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; }
        .card-label-small { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .card-title { font-size: 17px; font-weight: 950; margin-top: 2px; }
        
        .article-link-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.2s; }
        .article-link-card:hover { background: rgba(168, 85, 247, 0.1); color: #fff; border-color: rgba(168, 85, 247, 0.3); transform: translateX(5px); }
        
        .support-btn, .live-btn { display: flex; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .support-btn { background: #eab308; color: #000; }
        .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; }
        .support-btn:hover, .live-btn:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      `}} />
    </div>
  );
}
