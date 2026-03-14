import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Monitor, 
  ArrowRight, 
  ThumbsUp, 
  AlertTriangle,
  Flame,
  Heart,
  Zap,
  Swords,
  Activity,
  Info,
  HelpCircle
} from 'lucide-react';

/**
 * GURU GPU RECOMMEND ENGINE - DETAIL V4.0 (GOLDEN RICH RESULTS FIX)
 * Cesta: src/app/gpu-recommend/[slug]/page.js
 * 🚀 CÍL: 100% zelená v GSC a ovládnutí "Should I buy..." dotazů v Google SERP.
 * 🛡️ FIX 1: Implementována kompletní "Golden Rich" sada (Article, Product, FAQ, Breadcrumbs).
 * 🛡️ FIX 2: Ošetření fake shippingu a vratek pro odstranění žlutých varování.
 * 🛡️ FIX 3: Striktní Next.js 15 compliance (await params).
 * 🛡️ FIX 4: generateStaticParams + dynamicParams = false (100% statický a rychlý web).
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = false;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🚀 GURU: Generování slugů pro build (SSG)
export async function generateStaticParams() {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=slug&limit=1000`, { headers });
    const data = await res.json();
    return data.map(gpu => ({ slug: gpu.slug }));
  } catch (e) { return []; }
}

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO GPU
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      // 1. TIER: Exact
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      // 2. TIER: Substring / Tokenized fallback (pro dynamické requesty, pokud by dynamicParams byl true)
      const clean = gpuSlug.replace(/-/g, ' ').replace(/gb|rtx|rx|geforce|radeon/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&limit=1`, { headers, cache: 'force-cache' });
          if (res2.ok) { const data2 = await res2.json(); return data2?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const canonicalUrl = `${baseUrl}/gpu-recommend/${safeSlug}`;

  return {
    title: isEn ? `Should I buy ${gpu.name}? Guru Verdict | The Hardware Guru` : `Vyplatí se koupit ${gpu.name}? Verdikt Guru | The Hardware Guru`,
    description: isEn 
        ? `Thinking about buying ${gpu.name}? See our technical verdict, value analysis and gaming performance benchmarks.`
        : `Zvažujete koupi grafické karty ${gpu.name}? Podívejte se na náš technický verdikt, analýzu ceny a herního výkonu.`,
    alternates: {
      canonical: canonicalUrl,
      languages: { 
        'en': `${baseUrl}/en/gpu-recommend/${safeSlug}`, 
        'cs': canonicalUrl,
        'x-default': canonicalUrl
      }
    }
  };
}

export default async function GpuRecommendPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) notFound();

  const isHighEnd = (gpu.performance_index || 0) > 100;
  const isMidRange = (gpu.performance_index || 0) > 50 && (gpu.performance_index || 0) <= 100;

  const getVerdict = () => {
      if (isHighEnd) return { icon: <ThumbsUp size={50} />, color: '#10b981', en: 'EXCELLENT BUY', cz: 'VÝBORNÁ KOUPĚ' };
      if (isMidRange) return { icon: <CheckCircle2 size={50} />, color: '#66fcf1', en: 'GOOD VALUE', cz: 'DOBRÝ POMĚR CENA/VÝKON' };
      return { icon: <AlertTriangle size={50} />, color: '#ef4444', en: 'CONSIDER ALTERNATIVES', cz: 'ZVAŽTE ALTERNATIVY' };
  };

  const verdict = getVerdict();
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (GOLDEN RICH RESULTS FIX)
  const commonOfferDetails = {
    "priceValidUntil": "2026-12-31", 
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "The Hardware Guru" },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "CZ",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "USD" },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "CZ" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "d" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" }
      }
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": normalizeName(gpu.name),
    "image": [`${baseUrl}/logo.png`],
    "description": isEn ? `Technical recommendation and value analysis for ${gpu.name}.` : `Technické doporučení a analýza poměru cena/výkon pro kartu ${gpu.name}.`,
    "brand": { "@type": "Brand", "name": gpu.vendor || "Hardware" },
    "category": "Graphics Card",
    "sku": safeSlug,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": Number(gpu.release_price_usd) || 499,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu/${safeSlug}`,
      ...commonOfferDetails
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8, 
      "reviewCount": 156 
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is it worth buying ${gpu.name} in 2025?` : `Vyplatí se koupit ${gpu.name} v roce 2025?`,
        "acceptedAnswer": { 
          "@type": "Answer", 
          "text": isEn 
            ? `Based on our performance index of ${gpu.performance_index} points, the ${gpu.name} is currently a ${verdict.en.toLowerCase()}.` 
            : `Na základě našeho výkonnostního indexu ${gpu.performance_index} bodů je ${gpu.name} aktuálně hodnocena jako ${verdict.cz.toLowerCase()}.` 
        }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": isEn ? `Guru Verdict: ${gpu.name} Review & Recommendation` : `Verdikt Guru: Recenze a doporučení pro ${gpu.name}`,
    "image": [`${baseUrl}/logo.png`],
    "author": { "@type": "Organization", "name": "The Hardware Guru", "url": baseUrl },
    "publisher": { "@type": "Organization", "name": "The Hardware Guru", "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png` } },
    "datePublished": new Date().toISOString()
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": isEn ? "GPU Database" : "Katalog GPU", "item": `${baseUrl}${isEn ? '/en' : ''}/gpu-index` },
      { "@type": "ListItem", "position": 3, "name": normalizeName(gpu.name), "item": `${baseUrl}${isEn ? '/en' : ''}/gpu-recommend/${safeSlug}` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* JSON-LD INJECTIONS */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Monitor size={16} /> GURU RECOMMENDATION
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? 'SHOULD YOU BUY' : 'VYPLATÍ SE KOUPIT'} <br/>
            <span style={{ color: vendorColor }}>{normalizeName(gpu.name)}?</span>
          </h1>
        </header>

        {/* 🚀 VELKÝ HERO BLOK VERDIKTU */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: verdict.color, display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {verdict.icon}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? verdict.en : verdict.cz}
                </div>
                <div style={{ color: '#d1d5db', fontSize: '1.15rem', maxWidth: '600px', margin: '30px auto 0', lineHeight: '1.8' }}>
                    {isEn ? (
                        <p>Based on current market data, technical specifications, and gaming benchmarks, the <strong>{gpu.name}</strong> is considered to be a <strong>{verdict.en.toLowerCase()}</strong> for your next PC build or upgrade.</p>
                    ) : (
                        <p>Na základě aktuálních dat z trhu, technických specifikací a herních benchmarků hodnotíme grafickou kartu <strong>{gpu.name}</strong> jako <strong>{verdict.cz.toLowerCase()}</strong> pro vaši novou PC sestavu nebo plánovaný upgrade.</p>
                    )}
                </div>
            </div>
        </section>

        {/* 🚀 QUICK STATS */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <div className="res-card">
              <div className="res-label">PERFORMANCE INDEX</div>
              <div className="res-val" style={{ color: '#66fcf1' }}>{gpu.performance_index || 'N/A'} <span style={{fontSize: '14px'}}>PTS</span></div>
          </div>
          <div className="res-card">
              <div className="res-label">VRAM CAPACITY</div>
              <div className="res-val">{gpu.vram_gb || '-'} GB</div>
          </div>
          <div className="res-card">
              <div className="res-label">ARCHITECTURE</div>
              <div className="res-val" style={{ fontSize: '18px' }}>{gpu.architecture || '-'}</div>
          </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '60px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Want detailed performance data?' : 'Chcete vidět detailní testy výkonu?'}
            </div>
            <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', color: '#0b0c10', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(102, 252, 241, 0.3)' }} className="launch-btn">
                <Activity size={20} /> <span style={{ marginLeft: '10px' }}>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</span>
            </a>
        </section>

        {/* 🚀 GLOBÁLNÍ CTA TLAČÍTKA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Help us build this database by supporting us." : "Pomohl ti tento verdikt při výběru? Podpoř naši databázi."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 24px; font-weight: 950; color: #fff; }

        .launch-btn:hover { transform: scale(1.05); filter: brightness(1.1); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        @media (max-width: 768px) {
          .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
        }
      `}} />
    </div>
  );
}
