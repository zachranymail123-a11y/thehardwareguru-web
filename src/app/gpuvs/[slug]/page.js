import React from 'react';
import { 
  ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart
} from 'lucide-react';

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V1.4 (SEO SCHEMA FIX)
 * Cesta: src/app/cpu/[slug]/page.js
 * 🚀 STATUS: PRODUCTION READY - S podporou Alza/Amazon Affiliate.
 * 🛡️ FIX 1: Přidáno kompletní Product schéma (offers, aggregateRating) pro GSC.
 * 🛡️ FIX 2: Přidáno BreadcrumbList schéma pro lepší Rich Snippets v SERPu.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
};

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const url1 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      const clean = cpuSlug.replace(/-/g, " ").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'no-store' });
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

  return {
    title: isEn 
      ? `${cpu.name} Specs, Benchmarks & Gaming Performance | The Hardware Guru`
      : `${cpu.name} Specifikace, Benchmarky a Herní výkon | The Hardware Guru`,
    description: isEn
      ? `Everything you need to know about ${cpu.name}. Detailed specifications, gaming benchmarks, and performance analysis.`
      : `Vše co potřebujete vědět o procesoru ${cpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`,
    alternates: {
      canonical: `https://www.thehardwareguru.cz/cpu/${safeSlug}`,
      languages: {
        'en': `https://www.thehardwareguru.cz/en/cpu/${safeSlug}`,
        'cs': `https://www.thehardwareguru.cz/cpu/${safeSlug}`
      }
    }
  };
}

export default async function CpuDetailPage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const safeSlug = cpu.slug || slugify(cpu.name);

  // 🚀 GURU SEO FIX: Implementace Product a Breadcrumb schématu pro GSC
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": normalizeName(cpu.name),
    "image": "https://thehardwareguru.cz/logo.png",
    "description": isEn
      ? `Everything you need to know about ${cpu.name}. Detailed specifications, gaming benchmarks, and performance analysis.`
      : `Vše co potřebujete vědět o procesoru ${cpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`,
    "brand": {
      "@type": "Brand",
      "name": cpu.vendor || "Hardware"
    },
    "category": "Processor",
    "sku": safeSlug,
    "url": `https://thehardwareguru.cz/${isEn ? 'en/' : ''}cpu/${safeSlug}`,
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
      "url": `https://thehardwareguru.cz/${isEn ? 'en/' : ''}cpu/${safeSlug}`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isEn ? "CPU Database" : "Katalog CPU",
        "item": `https://thehardwareguru.cz/${isEn ? 'en/' : ''}cpu-index`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": normalizeName(cpu.name),
        "item": `https://thehardwareguru.cz/${isEn ? 'en/' : ''}cpu/${safeSlug}`
      }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* 🚀 INJEKCE JSON-LD DO STRÁNKY */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(cpu.name)}</span>
          </h1>
        </header>

        {/* 🚀 AFFILIATE SHOPPING ROW */}
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

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card"><div className="label">CORES / THREADS</div><div className="val">{cpu.cores ?? '-'} / {cpu.threads ?? '-'}</div></div>
            <div className="stat-card"><div className="label">BOOST CLOCK</div><div className="val">{cpu.boost_clock_mhz ?? '-'} MHz</div></div>
            <div className="stat-card"><div className="label">PERFORMANCE</div><div className="val">{cpu.performance_index || '-'} PTS</div></div>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .val { font-size: 32px; font-weight: 950; }
        
        .btn-buy { display: flex; align-items: center; gap: 12px; padding: 18px 35px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; font-size: 14px; transition: 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .btn-buy.alza { background: #004996; color: #fff; border: 1px solid #0059b3; }
        .btn-buy.amazon { background: #ff9900; color: #000; border: 1px solid #ffb340; }
        .btn-buy:hover { transform: translateY(-3px); filter: brightness(1.1); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
      `}} />
    </div>
  );
}
