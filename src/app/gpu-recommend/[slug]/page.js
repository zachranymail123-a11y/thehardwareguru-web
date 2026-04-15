import React from 'react';
import { notFound } from 'next/navigation';
import Script from 'next/script';
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
  HelpCircle,
  Gamepad2,
  ShoppingCart
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU GPU RECOMMEND ENGINE - DETAIL V4.6 (V10 HARD-LOCK SERVER FIX)
 * 🚀 CÍL: Integrace Hard-Lock trackeru a doplnění tlačítek kalkulaček beze změn architektury.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = false;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

export async function generateStaticParams() {
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=slug&limit=1000`, { headers });
    const data = await res.json();
    return data.map(gpu => ({ slug: gpu.slug }));
  } catch (e) { return []; }
}

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  // Očištění slugu pro jistotu
  const cleanSlug = gpuSlug.replace(/^en-/, '');
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${cleanSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      const clean = cleanSlug.replace(/-/g, ' ').replace(/gb|rtx|rx|geforce|radeon/gi, '').trim();
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
  const isEn = props.isEnProxy === true || props.isEn === true || rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const canonicalUrl = `${baseUrl}/gpu-recommend/${safeSlug}`;
  return {
    title: isEn ? `Should I buy ${gpu.name}? Guru Verdict | The Hardware Guru` : `Vyplatí se koupit ${gpu.name}? Verdikt Guru | The Hardware Guru`,
    alternates: { canonical: canonicalUrl, languages: { 'en': `${baseUrl}/en/gpu-recommend/${safeSlug}`, 'cs': canonicalUrl } }
  };
}

export default async function GpuRecommendPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  // 🔥 FIX: Robustní detekce EN
  const isEn = props.isEnProxy === true || props.isEn === true || rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) notFound();

  // 🔥 Google Golden Rich
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": { "@type": "Product", "name": gpu.name },
    "reviewRating": { "@type": "Rating", "ratingValue": gpu.performance_index > 100 ? "5" : "4", "bestRating": "5" },
    "author": { "@type": "Organization", "name": "The Hardware Guru" }
  };

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
  const searchName = normalizeName(gpu.name).trim();

  // 🔥 OPRAVA: Amazon link pro EN a V10 Heureka pro CZ
  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(searchName)}&tag=thehardware07-20&ascsubtag=v10-recommend`;

  return (
    <div className="guru-recommend-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="inner-container" style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        {/* 🔥 GURU MONEY FIX: TOP REKLAMA ABOVE THE FOLD */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="recommend-badge">
            <Monitor size={16} /> GURU RECOMMENDATION
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? 'SHOULD YOU BUY' : 'VYPLATÍ SE KOUPIT'} <br/>
            <span style={{ color: vendorColor }}>{normalizeName(gpu.name)}?</span>
          </h1>
        </header>

        {/* 🚀 VELKÝ HERO BLOK VERDIKTU */}
        <section style={{ marginBottom: '60px' }}>
            <div className="verdict-card" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                <div className="verdict-icon" style={{ color: verdict.color, display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    {verdict.icon}
                </div>
                <div className="verdict-title" style={{ fontSize: '40px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {isEn ? verdict.en : verdict.cz}
                </div>
                <div className="verdict-desc" style={{ color: '#d1d5db', fontSize: '1.15rem', maxWidth: '600px', margin: '30px auto 0', lineHeight: '1.8' }}>
                    {isEn ? (
                        <p>Based on current market data and benchmarks, the <strong>{gpu.name}</strong> is considered to be a <strong>{verdict.en.toLowerCase()}</strong>.</p>
                    ) : (
                        <p>Na základě aktuálních dat z trhu a herních testů hodnotíme kartu <strong>{gpu.name}</strong> jako <strong>{verdict.cz.toLowerCase()}</strong>.</p>
                    )}
                </div>
            </div>
        </section>

        {/* 🔥 PŘIDÁNO: Vložení Heureka/Amazon tlačítek (CTA pod verdiktem) 🔥 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
            {isEn ? (
                <a href={amazonLink} target="_blank" rel="nofollow sponsored" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 30px', background: '#f59e0b', color: '#000', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', border: '2px solid #fbbf24' }}>
                    <ShoppingCart size={16} /> BUY ON AMAZON
                </a>
            ) : (
                <div className="v10-hl-container" data-subid="v10-recommend-heureka" data-cat="gpu_recommend">
                    {/* Zde komponenta HeurekaButtons sama použije upravené V10 linky */}
                    <HeurekaButtons isEn={false} manualSearch={gpu.name} positionId="276026" />
                </div>
            )}
        </div>

        {/* 🔥 GURU TOOLS - POVINNÁ TLAČÍTKA NA KALKULAČKY 🔥 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <Gamepad2 size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span>
            </a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '25px', borderRadius: '20px', textDecoration: 'none', fontWeight: '950', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <AlertTriangle size={28} /> <span style={{ fontSize: '16px' }}>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span>
            </a>
        </div>

        {/* 🚀 QUICK STATS */}
        <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
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

        <section style={{ textAlign: 'center', marginTop: '40px' }}>
            <a href={isEn ? `/en/gpu-performance/${safeSlug}` : `/gpu-performance/${safeSlug}`} className="launch-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', color: '#0b0c10', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(102, 252, 241, 0.3)' }}>
                <Activity size={20} /> <span>{isEn ? 'Full Benchmarks' : 'Kompletní testy'}</span>
            </a>
        </section>

        <div className="footer-btns-section" style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/en/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
          </div>
        </div>
      </main>

      {/* 🔥 GURU MONEY MAKER: STICKY BOTTOM ANCHOR (Ukotvený formát, 100% CTR Boost) */}
      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      {/* 🔥 V10 HARD-LOCK SCRIPT PRO SERVER COMPONENT 🔥 */}
      <Script id="v10-hl-script" strategy="lazyOnload">
          {`
              if (typeof window !== 'undefined') {
                  document.addEventListener('click', function(e) {
                      const btn = e.target.closest('.v10-hl-container a, .v10-hl-container button');
                      if (btn) {
                          const container = e.target.closest('.v10-hl-container');
                          const subId = container ? container.getAttribute('data-subid') : 'unknown';
                          const cat = container ? container.getAttribute('data-cat') : 'gpu_recommend';
                          if (navigator.sendBeacon && btn.href) {
                              navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: cat, sub_id: subId, page: window.location.pathname }));
                          }
                      }
                  });
              }
          `}
      </Script>

      <style dangerouslySetInnerHTML={{__html: `
        .recommend-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(102,252,241,0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }

        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .res-label { font-size: 10px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 24px; font-weight: 950; color: #fff; }

        .guru-support-btn, .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; transition: 0.3s; text-transform: uppercase; }
        .guru-support-btn { background: #eab308; color: #000; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }

        /* 🔥 STICKY BOTTOM ANCHOR CSS */
        .sticky-bottom-anchor {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 11, 13, 0.98);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 9999;
            padding: 10px 0;
            display: flex;
            justify-content: center;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
        }

        /* 🚀 RESPONSIVE ADS SYSTEM */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-recommend-wrapper { padding-top: 80px !important; }
            .inner-container { padding: 0 15px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.6rem !important; }
            .verdict-card { padding: 35px 20px !important; border-radius: 20px !important; }
            .verdict-title { font-size: 1.8rem !important; }
            .verdict-desc { font-size: 1rem !important; }
            .stats-grid { grid-template-columns: 1fr !important; gap: 15px; }
            .launch-btn { width: 100% !important; justify-content: center; }
            .footer-btns { flex-direction: column; }
            .guru-deals-btn, .guru-support-btn { width: 100% !important; }
        }
      `}} />
    </div>
  );
}
