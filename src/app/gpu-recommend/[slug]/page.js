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
 * GURU GPU RECOMMEND ENGINE - DETAIL V5.0 (ABSOLUTELY COMPLETE)
 * 🚀 CÍL: Fix EN/Amazon, V10 Heureka a Google Golden Rich SEO bez ořezů.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  // 🔥 FIX: Očištění slugu od prefixu en- pro databázi
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
  // 🔥 FIX: Robustní detekce jazyka
  const isEn = props.isEn === true || props.isEnProxy === true || rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };
  const safeSlug = gpu.slug || slugify(gpu.name);
  return {
    title: isEn ? `Should I buy ${gpu.name}? Guru Verdict` : `Vyplatí se koupit ${gpu.name}? Verdikt Guru`,
    alternates: { canonical: `${baseUrl}${isEn ? '/en' : ''}/gpu-recommend/${safeSlug}` }
  };
}

export default async function GpuRecommendPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  // 🔥 FIX: Robustní detekce jazyka pro EN proxy i přímé parametry
  const isEn = props.isEn === true || props.isEnProxy === true || rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) notFound();

  // 🔥 Google Golden Rich (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": { "@type": "Product", "name": gpu.name },
    "reviewRating": { "@type": "Rating", "ratingValue": gpu.performance_index > 100 ? "5" : "4", "bestRating": "5" },
    "author": { "@type": "Organization", "name": "The Hardware Guru" },
    "publisher": { "@type": "Organization", "name": "The Hardware Guru" },
    "description": isEn ? `Detailed expert recommendation for ${gpu.name}.` : `Detailní expertní doporučení pro kartu ${gpu.name}.`
  };

  const verdict = (gpu.performance_index || 0) > 100 
    ? { icon: <ThumbsUp size={50} />, color: '#10b981', en: 'EXCELLENT BUY', cz: 'VÝBORNÁ KOUPĚ' }
    : (gpu.performance_index || 0) > 50 
    ? { icon: <CheckCircle2 size={50} />, color: '#66fcf1', en: 'GOOD VALUE', cz: 'DOBRÝ POMĚR CENA/VÝKON' }
    : { icon: <AlertTriangle size={50} />, color: '#ef4444', en: 'CONSIDER ALTERNATIVES', cz: 'ZVAŽTE ALTERNATIVY' };

  const safeSlug = gpu.slug || slugify(gpu.name);
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24';
  const searchName = normalizeName(gpu.name).trim();

  // Affiliate linky s V10 Hard-Lockem
  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(searchName)}&tag=thehardware07-20&ascsubtag=v10-recommend`;
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(searchName)}+cena#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_content=v10-recommend`;

  return (
    <div className="guru-recommend-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
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
          <div className="recommend-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', padding: '6px 20px', border: '1px solid rgba(102,252,241,0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)', marginBottom: '20px' }}>
            <Monitor size={16} /> GURU RECOMMENDATION
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? 'SHOULD YOU BUY' : 'VYPLATÍ SE KOUPIT'} <br/>
            <span style={{ color: vendorColor }}>{normalizeName(gpu.name)}?</span>
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div className="verdict-card" style={{ background: 'rgba(15, 17, 21, 0.95)', borderTop: `8px solid ${verdict.color}`, borderRadius: '24px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}>
                <div style={{ color: verdict.color, display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>{verdict.icon}</div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff', textTransform: 'uppercase' }}>{isEn ? verdict.en : verdict.cz}</div>
                <div style={{ color: '#d1d5db', fontSize: '1.15rem', marginTop: '30px', lineHeight: '1.8' }}>
                    {isEn ? (
                        <p>Based on current market data, the <strong>{gpu.name}</strong> is an <strong>{verdict.en.toLowerCase()}</strong>.</p>
                    ) : (
                        <p>Na základě aktuálních dat hodnotíme kartu <strong>{gpu.name}</strong> jako <strong>{verdict.cz.toLowerCase()}</strong>.</p>
                    )}
                </div>
            </div>
        </section>

        <div className="affiliate-cta" style={{ marginBottom: '60px', padding: '35px', background: 'rgba(0,0,0,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <div style={{ color: vendorColor, fontSize: '16px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '25px' }}>{isEn ? `CHECK PRICE` : `ZJISTIT CENU`}</div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {isEn ? (
                    <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-btn amazon-btn"><ShoppingCart size={16} /> BUY ON AMAZON</a>
                ) : (
                    <a href={heurekaLink} className="guru-btn heureka-btn v10-hl-btn" target="_blank" rel="nofollow sponsored"><ShoppingCart size={16} /> KOUPIT NA HEUREKA</a>
                )}
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="tool-btn" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}><Gamepad2 size={28} /> <span>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</span></a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="tool-btn" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><AlertTriangle size={28} /> <span>{isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</span></a>
        </div>

        <div className="footer-btns" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '80px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> GAME DEALS</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; }
        .guru-btn { flex: 1; max-width: 300px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; text-transform: uppercase; transition: 0.3s; }
        .heureka-btn { background: #0078d4; color: #fff; }
        .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; }
        .tool-btn { display: flex; align-items: center; justify-content: center; gap: 15px; padding: 25px; border-radius: 20px; text-decoration: none; font-weight: 950; transition: 0.3s; }
        .guru-deals-btn, .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .guru-support-btn { background: #eab308; color: #000; }
        @media (max-width: 768px) { .ad-desktop-wrapper { display: none; } .ad-mobile-wrapper { display: flex; } .guru-btn { width: 100%; max-width: 100%; } }
      `}} />

      <Script id="v10-hl-script" strategy="lazyOnload">
          {`
              if (typeof window !== 'undefined') {
                  document.addEventListener('click', function(e) {
                      const btn = e.target.closest('.v10-hl-btn');
                      if (btn) {
                          e.preventDefault();
                          const targetUrl = btn.href;
                          if (navigator.sendBeacon) {
                              navigator.sendBeacon('${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/affiliate_clicks_log?apikey=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}', JSON.stringify({ platform: 'heureka', category: 'gpu_recommend', sub_id: 'v10-recommend', page: window.location.pathname }));
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
