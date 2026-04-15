import React from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { 
 ChevronLeft, Monitor, Database, Gamepad2, ArrowRight, ExternalLink, 
 Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Info, Cpu, Zap, AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU GPU PERFORMANCE ENGINE V3.8 (SEO GOLDEN RICH & 404 FIX)
 * 🚀 CÍL: Eliminace 404, Google Golden Rich SEO a V10 Hard-Lock.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
const getCleanSearchName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '').trim();

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  
  // 🔥 FIX: Očištění slugu od prefixu en- pro databázi (brání 404)
  const cleanSlugForDb = gpuSlug.replace(/^en-/, '');

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlugForDb}&limit=1`, { headers: authHeaders, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      const cleanString = cleanSlugForDb.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers: authHeaders, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

const getInternalLinksData = async (gpuId) => {
  if (!supabaseUrl || !gpuId) return { similarGpus: [], recommendedCpus: [] };
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  let similarGpus = [];
  let recommendedCpus = [];
  try {
      const gpuRes = await fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug&id=neq.${gpuId}&order=performance_index.desc&limit=6`, { headers: authHeaders, cache: 'no-store' });
      if (gpuRes.ok) similarGpus = await gpuRes.json();
      const cpuRes = await fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug&order=performance_index.desc&limit=6`, { headers: authHeaders, cache: 'no-store' });
      if (cpuRes.ok) recommendedCpus = await cpuRes.json();
  } catch(e) {}
  return { similarGpus, recommendedCpus };
};

export async function generateMetadata(props) {
  const resolvedParams = await props.params;
  const rawSlug = resolvedParams?.slug || '';
  const headersList = headers();
  const referer = headersList.get('referer') || "";
  // Detekce jazyka
  const isEn = props.isEnProxy === true || rawSlug.startsWith('en-') || referer.includes('/en');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  
  const safeSlug = gpu.slug || slugify(gpu.name);
  const canonicalUrl = `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${safeSlug}`;
  
  return {
    title: isEn ? `${gpu.name} Performance & Technical Specs` : `${gpu.name} Výkon a Technické Parametry`,
    alternates: { canonical: canonicalUrl, languages: { 'en': `https://thehardwareguru.cz/en/gpu-performance/${safeSlug}`, 'cs': `https://thehardwareguru.cz/gpu-performance/${safeSlug}` } }
  };
}

export default async function GpuPerformancePage(props) {
  const resolvedParams = await props.params;
  const rawSlug = resolvedParams?.slug || '';
  const headersList = headers();
  const referer = headersList.get('referer') || "";
  
  // 🔥 Detekce jazyka z URL nebo proxy (řeší duplicity)
  const isEn = props.isEnProxy === true || rawSlug.startsWith('en-') || referer.includes('/en');

  const cleanSlug = rawSlug.replace(/^en-/, '');
  const gpu = await findGpuBySlug(cleanSlug);
  
  if (!gpu) return <div style={{ color: '#ff0055', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh', fontWeight: '950' }}>GPU DATA NOT FOUND</div>;

  const safeSlug = gpu.slug || slugify(gpu.name);
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');
  const cleanGpuName = normalizeName(gpu.name);
  const { similarGpus, recommendedCpus } = await getInternalLinksData(gpu.id);
  const searchName = getCleanSearchName(gpu.name);

  // Google Golden Rich JSON-LD (Product Schema)
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": gpu.name,
    "image": "https://thehardwareguru.cz/bg-guru.png",
    "description": isEn ? `Technical specifications and performance benchmarks for ${gpu.name}.` : `Technické specifikace a herní výkon grafické karty ${gpu.name}.`,
    "brand": { "@type": "Brand", "name": gpu.vendor },
    "sku": gpu.id,
    "offers": {
      "@type": "Offer",
      "url": `https://thehardwareguru.cz${isEn ? '/en' : ''}/gpu-performance/${safeSlug}`,
      "priceCurrency": isEn ? "USD" : "CZK",
      "availability": "https://schema.org/InStock"
    }
  };

  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
  const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

  return (
    <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="analysis-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Activity size={16} /> {isEn ? 'GURU PERFORMANCE ANALYSIS' : 'GURU ANALÝZA VÝKONU'}
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: vendorColor }}>{cleanGpuName}</span> <br/>
            {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div className="index-result-box" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', borderLeft: '8px solid #66fcf1', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{isEn ? 'Gaming Performance Index' : 'Index herního výkonu'}</div>
                <div className="index-val" style={{ fontSize: 'clamp(60px, 12vw, 100px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0' }}>{gpu.performance_index ?? 'N/A'} <span style={{ fontSize: '24px', color: '#66fcf1' }}>PTS</span></div>
                <div style={{ background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(102, 252, 241, 0.3)' }}><CheckCircle2 size={18} /> {isEn ? 'Verified' : 'Ověřeno'}</div>
            </div>
        </section>

        {/* 🔥 GURU AFFILIATE BOMB S V10 HARD-LOCK 🔥 */}
        <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderLeft: `4px solid ${vendorColor}`, padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="affiliate-col">
                <div className="affiliate-col-title" style={{ color: vendorColor, fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <ShoppingCart size={16} /> {isEn ? `BUY ${cleanGpuName}` : `KOUPIT ${cleanGpuName}`}
                </div>
                <div className="affiliate-btn-wrap" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {isEn ? (
                        <a href={getAmazonLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn" style={{ background: '#f59e0b', color: '#000', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>
                            <ShoppingCart size={16} /> BUY ON AMAZON
                        </a>
                    ) : (
                        <>
                            <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn" style={{ background: '#eab308', color: '#000', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}>Smarty.cz</a>
                            <a 
                                href={`https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}+cena#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=v10-gpu-perf-idx`} 
                                className="guru-buy-winner-btn heureka-btn v10-hl-btn"
                                style={{ background: '#0078d4', color: '#fff', padding: '18px 40px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}
                            >
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', borderLeft: '4px solid #66fcf1', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} /> {isEn ? 'TECHNICAL SPECS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '950', marginBottom: '10px' }}>VRAM</div>
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#66fcf1' }}>{gpu.vram_gb ?? '-'} GB</div>
              </div>
              <div className="res-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '950', marginBottom: '10px' }}>{isEn ? 'MEMORY BUS' : 'SBĚRNICE'}</div>
                <div style={{ fontSize: '24px', fontWeight: '950' }}>{gpu.memory_bus ?? '-'}</div>
              </div>
              <div className="res-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '950', marginBottom: '10px' }}>BOOST CLOCK</div>
                <div style={{ fontSize: '24px', fontWeight: '950', color: vendorColor }}>{gpu.boost_clock_mhz ?? '-'} MHz</div>
              </div>
              <div className="res-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '950', marginBottom: '10px' }}>TDP</div>
                <div style={{ fontSize: '24px', fontWeight: '950', color: '#ef4444' }}>{gpu.tdp_w ?? '-'} W</div>
              </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <Gamepad2 size={28} /> <span>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
            </a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <AlertTriangle size={28} /> <span>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
            </a>
        </div>

        {similarGpus.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
              <h2 className="section-h2" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', marginBottom: '30px', textTransform: 'uppercase', borderLeft: '4px solid #66fcf1', paddingLeft: '15px' }}><Swords size={28} /> {isEn ? 'GPU COMPARISONS' : 'SROVNÁNÍ GRAFIK'}</h2>
              <div className="silo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  {similarGpus.map(otherGpu => (
                    <a key={otherGpu.slug} href={isEn ? `/en/gpuvs/${safeSlug}-vs-${otherGpu.slug}` : `/gpuvs/${safeSlug}-vs-${otherGpu.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '18px 25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', color: '#d1d5db', transition: '0.3s' }}>
                        <span style={{ fontWeight: '900' }}>VS {normalizeName(otherGpu.name)}</span>
                        <ArrowRight size={16} />
                    </a>
                  ))}
              </div>
          </section>
        )}

        <div className="footer-btns" style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', padding: '18px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}><Flame size={20} /> GAME DEALS</a>
            <a href={isEn ? "/en/support" : "/support"} style={{ background: '#eab308', color: '#000', padding: '18px 30px', borderRadius: '16px', fontWeight: '950', textDecoration: 'none' }}><Heart size={20} /> SUPPORT</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(10, 11, 13, 0.98)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 9999, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <SeznamAd zoneId={408654} width={970} height={90} />
      </div>

      <Script id="v10-hl-script" strategy="lazyOnload">
          {`
              if (typeof window !== 'undefined') {
                  document.addEventListener('click', function(e) {
                      const btn = e.target.closest('.v10-hl-btn');
                      if (btn) {
                          e.preventDefault();
                          const targetUrl = btn.href;
                          if (navigator.sendBeacon) {
                              navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: 'gpu_performance_index', sub_id: 'v10-gpu-perf-idx', page: window.location.pathname }));
                          }
                          setTimeout(() => { window.location.href = targetUrl; }, 150);
                      }
                  });
              }
          `}
      </Script>
    </div>
  );
}
