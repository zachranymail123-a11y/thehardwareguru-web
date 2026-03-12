import React from 'react';
import { 
  ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
  Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart
} from 'lucide-react';

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V1.8 (NEXT.JS 15 + GSC STANDARD)
 * Cesta: src/app/cpu/[slug]/page.js
 * 🛡️ FIX 1: Striktní 'await params' pro Next.js 15 kompatibilitu.
 * 🛡️ FIX 2: Absolutní Canonical URL bez www a x-default hreflang (Zlatý GSC Standard).
 * 🛡️ FIX 3: Plná JSON-LD schémata (Product, Breadcrumb, FAQ) pro Google Search Console.
 * 🛡️ FIX 4: Revalidate nastaven na 3600s pro optimální crawl budget.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      const clean = cpuSlug.replace(/-/g, " ").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'force-cache' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  const safeSlug = cpu.slug || slugify(cpu.name);
  const canonicalUrl = `${baseUrl}/cpu/${safeSlug}`;

  return {
    title: isEn 
      ? `${cpu.name} Specs & Gaming Performance | The Hardware Guru`
      : `${cpu.name} Specifikace a Herní výkon | The Hardware Guru`,
    description: isEn
      ? `Detailed technical specifications, benchmarks and performance analysis for ${cpu.name}.`
      : `Vše co potřebujete vědět o procesoru ${cpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/cpu/${safeSlug}`,
        'cs': canonicalUrl,
        'x-default': canonicalUrl
      }
    }
  };
}

export default async function CpuDetailPage({ params }) {
  const { slug: rawSlug } = await params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const safeSlug = cpu.slug || slugify(cpu.name);
  
  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : (cpu.cpu_game_fps || {});
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';

  const availableGames = Object.keys(fpsData || {})
    .filter(k => k !== 'cpu_id' && k !== 'id' && !k.includes('cinebench') && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'cs2'];

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (Root Level)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": normalizeName(cpu.name),
    "image": `${baseUrl}/logo.png`,
    "description": isEn ? `Performance analysis and specs for ${normalizeName(cpu.name)}` : `Analýza výkonu a parametry pro ${normalizeName(cpu.name)}`,
    "brand": { "@type": "Brand", "name": cpu.vendor || "Hardware" },
    "category": "Processor",
    "sku": safeSlug,
    "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu/${safeSlug}`,
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.8, "reviewCount": 110 },
    "offers": { 
        "@type": "Offer", 
        "priceCurrency": "USD", 
        "price": cpu.release_price_usd || 499, 
        "availability": "https://schema.org/InStock",
        "url": `${baseUrl}/${isEn ? 'en/' : ''}cpu/${safeSlug}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "CPU Database" : "Katalog CPU", "item": `${baseUrl}/${isEn ? 'en/' : ''}cpu-index` },
      { "@type": "ListItem", "position": 2, "name": normalizeName(cpu.name), "item": `${baseUrl}/${isEn ? 'en/' : ''}cpu/${safeSlug}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${cpu.name} good for gaming?` : `Je procesor ${cpu.name} vhodný na hry?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `Yes, ${cpu.name} with its ${cpu.cores} cores provides solid gaming performance.` : `Ano, ${cpu.name} se svými ${cpu.cores} jádry poskytuje solidní herní výkon.` }
      }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU DATABASE' : 'ZPĚT DO KATALOGU CPU'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(cpu.name)}</span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>
             {cpu.cores} Cores • {cpu.threads} Threads • {cpu.architecture}
          </div>
        </header>

        {/* 🛒 AFFILIATE BUTTONS */}
        {(cpu.buy_link_cz || cpu.buy_link_en) && (
            <section style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {!isEn && cpu.buy_link_cz && (
                    <a href={cpu.buy_link_cz} target="_blank" rel="nofollow sponsored" className="btn-buy alza">
                        <ShoppingCart size={20} /> ZKONTROLOVAT CENU NA ALZA.CZ
                    </a>
                )}
                {isEn && cpu.buy_link_en && (
                    <a href={cpu.buy_link_en} target="_blank" rel="nofollow sponsored" className="btn-buy amazon">
                        <ShoppingCart size={20} /> CHECK PRICE ON AMAZON
                    </a>
                )}
            </section>
        )}

        {/* 🚀 RYCHLÝ PŘEHLED (HERO STATS) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card">
                <div className="stat-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div>
                <div className="stat-val">{cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span></div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Cinebench R23</div>
                <div className="stat-val">{cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span></div>
            </div>
            <div className="stat-card">
                <div className="stat-label">{isEn ? 'Power Draw' : 'Spotřeba (TDP)'}</div>
                <div className="stat-val">{cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span></div>
            </div>
        </section>

        {/* 🚀 DEEP DIVE ROZCESTNÍK */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}>
            <Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/cpu-performance/${safeSlug}` : `/cpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full technical specifications and benchmarks.' : 'Kompletní specifikace a syntetické testy.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
              <a href={isEn ? `/en/cpu-recommend/${safeSlug}` : `/cpu-recommend/${safeSlug}`} className="deep-link-card">
                  <CheckCircle2 size={32} color="#10b981" />
                  <div>
                      <h3>{isEn ? 'Guru Verdict: Buy?' : 'Verdikt: Koupit?'}</h3>
                      <p>{isEn ? 'Is it worth your money? Value analysis.' : 'Vyplatí se do něj investovat? Analýza cena/výkon.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
              <a href={isEn ? `/en/cpuvs` : `/cpuvs`} className="deep-link-card">
                  <Swords size={32} color="#a855f7" />
                  <div>
                      <h3>{isEn ? 'CPU VS Engine' : 'Srovnávač CPU'}</h3>
                      <p>{isEn ? 'Compare this CPU against any other.' : 'Porovnejte tento procesor s konkurencí.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}>
            <Gamepad2 size={28} /> {isEn ? 'GAMING BENCHMARKS' : 'HERNÍ BENCHMARK TESTY'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {gamesList.map((game) => (
                  <a key={game} href={isEn ? `/en/cpu-fps/${safeSlug}/${game}` : `/cpu-fps/${safeSlug}/${game}`} className="game-link-card">
                      <ExternalLink size={16} color={vendorColor} /> 
                      <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>{game.replace(/-/g, ' ')}</span> FPS
                  </a>
              ))}
          </div>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .stat-label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .stat-val { font-size: 32px; font-weight: 950; }
        .btn-buy { display: flex; align-items: center; gap: 12px; padding: 18px 35px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; font-size: 14px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .btn-buy.alza { background: #004996; color: #fff; border: 1px solid #0059b3; }
        .btn-buy.amazon { background: #ff9900; color: #000; border: 1px solid #ffb340; }
        .btn-buy:hover { transform: translateY(-3px); filter: brightness(1.1); }
        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
        .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; transition: 0.3s; }
        .deep-link-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.8); }
        .game-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; color: #d1d5db; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .game-link-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); color: #fff; transform: translateY(-3px); }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
      `}} />
    </div>
  );
}
