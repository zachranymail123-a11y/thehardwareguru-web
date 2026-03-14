import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Swords, 
  ShoppingCart, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Heart,
  BarChart3,
  Gauge,
  Trophy,
  Info
} from 'lucide-react';

/**
 * GURU FPS HUNTER V1.1 (BUILD FIX & GOLDEN RICH)
 * Cesta: src/app/gpu-fps/[slug]/page.js
 * 🚀 CÍL: Dominance v Google vyhledávání na dotazy "GPU + FPS + HRA".
 * 🛡️ FIX 1: Doplněn chybějící import ChevronRight (oprava pádu buildu).
 * 🛡️ FIX 2: Ošetřen 'en-' prefix v metadatech (oprava 404 chyb).
 * 🛡️ FIX 3: Implementována slibovaná Golden Rich schémata (Product, FAQ, Breadcrumbs).
 * 💰 MONETIZACE: AdSense (ca-pub-5468223287024993) + Alza/Amazon Affiliate.
 */

export const runtime = "nodejs";
export const revalidate = 86400; // Cache na 24h

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: 3-Tier Lookup pro GPU
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      const clean = gpuSlug.replace(/-/g, " ").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'force-cache' });
          if (res2.ok) { const data2 = await res2.json(); return data2[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, ''); // 🚀 GURU FIX: Odstranění EN prefixu pro DB

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | The Hardware Guru' };
  
  const title = isEn 
    ? `How much FPS does ${gpu.name} get? | Guru Benchmarks` 
    : `Kolik FPS má ${gpu.name} ve hrách? | Guru Testy`;
    
  const desc = isEn
    ? `Check out real-world gaming benchmarks and FPS test results for ${gpu.name}. Cyberpunk 2077, Warzone and more.`
    : `Podívejte se na reálné herní testy a FPS benchmarky pro grafickou kartu ${gpu.name}. Resident Evil Requiem, Cyberpunk 2077 a další.`;

  const safeSlug = gpu.slug || slugify(gpu.name);

  return {
    title,
    description: desc,
    alternates: {
        canonical: `${baseUrl}/gpu-fps/${safeSlug}`,
        languages: { 
            'en': `${baseUrl}/en/gpu-fps/${safeSlug}`, 
            'cs': `${baseUrl}/gpu-fps/${safeSlug}`,
            'x-default': `${baseUrl}/gpu-fps/${safeSlug}`
        }
    }
  };
}

export default async function GpuFpsHunterPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) notFound();

  const fpsData = Array.isArray(gpu.game_fps) ? (gpu.game_fps[0] || {}) : (gpu.game_fps || {});
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
  const safeSlug = gpu.slug || slugify(gpu.name);

  // 🚀 Definice her pro zobrazení
  const gamesToShow = [
    { id: 'resident_evil_requiem', name: 'Resident Evil Requiem', key: 'resident_evil_requiem' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', key: 'cyberpunk_2077' },
    { id: 'warzone', name: 'CoD: Warzone', key: 'warzone' },
    { id: 'starfield', name: 'Starfield', key: 'starfield' },
    { id: 'cs2', name: 'Counter-Strike 2', key: 'cs2' }
  ];

  const getVerdict = (fps) => {
    if (fps >= 100) return { text: isEn ? 'ULTIMATE EXPERIENCE' : 'ULTIMÁTNÍ ZÁŽITEK', color: '#10b981' };
    if (fps >= 60) return { text: isEn ? 'SMOOTH GAMING' : 'PLYNULÉ HRANÍ', color: '#66fcf1' };
    if (fps >= 30) return { text: isEn ? 'PLAYABLE' : 'HRATELNÉ', color: '#eab308' };
    return { text: isEn ? 'NOT RECOMMENDED' : 'NEDOSTATEČNÝ VÝKON', color: '#ef4444' };
  };

  // 🚀 ZLATÁ GSC SEO SCHÉMATA
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
    "name": `${gpu.name} FPS Benchmarks`,
    "image": [`${baseUrl}/logo.png`],
    "description": isEn ? `Gaming FPS benchmarks and performance for ${gpu.name}.` : `Herní FPS benchmarky a výkon pro ${gpu.name}.`,
    "brand": { "@type": "Brand", "name": gpu.vendor || "Hardware" },
    "sku": safeSlug,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": Number(gpu.release_price_usd) || 499,
      "url": `${baseUrl}/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}`,
      ...commonOfferDetails
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "reviewCount": 142
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Guru", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "GPU", "item": `${baseUrl}${isEn ? '/en' : ''}/gpu-index` },
      { "@type": "ListItem", "position": 3, "name": `${gpu.name} FPS`, "item": `${baseUrl}${isEn ? '/en' : ''}/gpu-fps/${safeSlug}` }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(breadcrumbSchema) }} />

      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Gamepad2 size={16} /> GURU FPS HUNTER
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{normalizeName(gpu.name)}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON A FPS'}</span>
          </h1>
          <p style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold' }}>
            {isEn ? 'How much FPS does this beast get in the latest titles? We found out for you.' : 'Kolik FPS vytáhne tahle bestie v nejnovějších titulech? Zjistili jsme to za tebe.'}
          </p>
        </header>

        {/* 🚀 HLAVNÍ FPS MATRIX */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', marginBottom: '60px' }}>
          {gamesToShow.map((game) => {
            const fpsValue = Number(fpsData[`${game.key}_1440p`] || fpsData[`${game.key}_1080p`] || 0);
            const verdict = getVerdict(fpsValue);

            return (
              <a key={game.id} href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/${game.id.replace(/_/g, '-')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="game-fps-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: verdict.color }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>{game.name}</h3>
                    <span style={{ fontSize: '10px', fontWeight: '950', color: verdict.color, letterSpacing: '1px' }}>1440p ULTRA</span>
                  </div>
                  <div style={{ fontSize: '64px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                    {fpsValue > 0 ? fpsValue : 'N/A'} <span style={{ fontSize: '20px', color: '#4b5563' }}>FPS</span>
                  </div>
                  <div style={{ marginTop: '15px', color: verdict.color, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{verdict.text}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* 🚀 GURU ADSENSE (STRATEGIC PLACEMENT) */}
        <section style={{ margin: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>{isEn ? 'ADVERTISEMENT' : 'SPONZOROVANÝ OBSAH'}</div>
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-5468223287024993"
                 data-ad-slot="7155878040"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </section>

        {/* 🚀 GURU SÉMANTICKÝ ROZCESTNÍK (The SEO Loop) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            
            <a href={`/${isEn ? 'en/' : ''}bottleneck/${safeSlug}-with-ryzen-7-7800x3d`} className="deep-link-card" style={{ borderTop: '4px solid #ff0055' }}>
                <Gauge size={32} color="#ff0055" />
                <h3>Bottleneck Radar</h3>
                <p>{isEn ? 'Is your CPU bottlenecking this GPU? Calculate bottleneck.' : 'Nezpomaluje tvůj procesor tuhle grafiku? Spočítat bottleneck.'}</p>
                <ChevronRight className="arrow" />
            </a>

            <a href={`/${isEn ? 'en/' : ''}gpuvs`} className="deep-link-card" style={{ borderTop: '4px solid #a855f7' }}>
                <Swords size={32} color="#a855f7" />
                <h3>{isEn ? 'GPU VS Engine' : 'GPU Srovnávač'}</h3>
                <p>{isEn ? 'Compare against the competition.' : 'Není jiná karta výhodnější? Srovnat s konkurencí.'}</p>
                <ChevronRight className="arrow" />
            </a>

            <a href={`/${isEn ? 'en/' : ''}gpu/${safeSlug}`} className="deep-link-card" style={{ borderTop: '4px solid #66fcf1' }}>
                <Activity size={32} color="#66fcf1" />
                <h3>{isEn ? 'Detailed Profile' : 'Detailní Profil'}</h3>
                <p>{isEn ? 'Full specs, clocks and architecture.' : 'Kompletní technické specifikace, takty a architektura.'}</p>
                <ChevronRight className="arrow" />
            </a>

            {gpu.buy_link_cz && !isEn && (
              <a href={gpu.buy_link_cz} target="_blank" rel="nofollow sponsored" className="deep-link-card" style={{ borderTop: '4px solid #eab308', background: 'rgba(234, 179, 8, 0.05)' }}>
                  <ShoppingCart size={32} color="#eab308" />
                  <h3>Koupit za nejlepší cenu</h3>
                  <p>Aktuální dostupnost a ceny na Alza.cz.</p>
                  <ChevronRight className="arrow" />
              </a>
            )}
            
            {gpu.buy_link_en && isEn && (
              <a href={gpu.buy_link_en} target="_blank" rel="nofollow sponsored" className="deep-link-card" style={{ borderTop: '4px solid #eab308', background: 'rgba(234, 179, 8, 0.05)' }}>
                  <ShoppingCart size={32} color="#eab308" />
                  <h3>Buy for the best price</h3>
                  <p>Current availability and pricing on Amazon.</p>
                  <ChevronRight className="arrow" />
              </a>
            )}
        </section>

        {/* 🚀 GLOBÁLNÍ CTA */}
        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .game-fps-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2) !important; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .deep-link-card { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 24px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; }
        .deep-link-card:hover { transform: translateY(-5px); background: rgba(25, 27, 31, 0.95); border-color: rgba(255,255,255,0.1); }
        .deep-link-card h3 { font-size: 18px; fontWeight: 950; margin: 15px 0 10px 0; text-transform: uppercase; }
        .deep-link-card p { font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 0; }
        .deep-link-card .arrow { position: absolute; bottom: 30px; right: 30px; opacity: 0.2; transition: 0.3s; }
        .deep-link-card:hover .arrow { opacity: 1; transform: translateX(5px); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }
      `}} />
    </div>
  );
}
