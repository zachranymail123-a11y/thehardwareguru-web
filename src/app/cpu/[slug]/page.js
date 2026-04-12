import React from 'react';
import Script from 'next/script'; 
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { 
 ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
 Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Zap, AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU ENGINE - V4.1 (ENTERPRISE REVENUE BUILD)
 * 🚀 CÍL: Strict Amazon.com (thehardware07-20), Heureka Fix, Structured Data a Mobile CRO.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const AMAZON_TAG = "thehardware07-20";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const findCpuBySlug = async (rawSlugPart) => {
  if (!supabaseUrl || !rawSlugPart || rawSlugPart === 'undefined') return null;
  const cpuSlug = rawSlugPart.replace(/^en-/, '');
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  
  try {
      // Bleskové načtení z cache
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`, { 
        headers: authHeaders, 
        next: { revalidate: 3600 } 
      });
      if (res1.ok) { 
          const data1 = await res1.json(); 
          if (data1?.length) return data1[0]; 
      }

      // Fallback hledání podle ilike
      const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&limit=1`, { 
        headers: authHeaders,
        next: { revalidate: 3600 }
      });
      if (res2.ok) { 
          const data2 = await res2.json(); 
          if (data2?.length) return data2[0]; 
      }
  } catch(e) { console.error("GURU CPU FETCH ERROR:", e); }
  return null;
};

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const h = headers();
  const isEn = (h.get('x-url') || "").includes('/en/') || rawSlug.startsWith('en-');

  const cpu = await findCpuBySlug(rawSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${cpu.name} price, performance & benchmarks (2026) | Hardware Guru`
      : `${cpu.name} cena, výkon a parametry (2026) | Hardware Guru`,
    alternates: { canonical: `${baseUrl}/cpu/${cpu.slug}` }
  };
}

export default async function CpuDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const h = headers();
  const isEn = (h.get('x-url') || "").includes('/en/') || rawSlug.startsWith('en-');

  const cpu = await findCpuBySlug(rawSlug);
  if (!cpu) return notFound();

  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const cpuCleanName = normalizeName(cpu.name);
  
  // 🔥 FIX: STRICT AMAZON.COM & HEUREKA TRACKING 🔥
  const amazonLink = `https://www.amazon.com/s?k=${encodeURIComponent(cpu.name)}&tag=${AMAZON_TAG}&linkCode=ll2&ref_=as_li_ss_tl&camp=1789&creative=9325&ascsubtag=cpu-detail`;
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpu.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      {/* 🔥 FIX: STRUCTURED DATA PRO GOOGLE 🔥 */}
      <Script
        id="cpu-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": cpu.name,
            "brand": cpu.vendor,
            "category": "CPU",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": isEn ? "USD" : "CZK",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />

      {/* 🔥 FIX: STICKY MOBILE CTA 🔥 */}
      {!isEn && (
        <div className="mobile-floating-cta">
          <a href={heurekaLink} target="_blank" rel="nofollow sponsored noopener noreferrer" className="heureka-hn-link pulse-button" data-trixam-positionid="276026">
            <ShoppingCart size={18} /> CENA {cpuCleanName}
          </a>
        </div>
      )}

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={210} /></div>
            <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={250} /></div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="profile-badge" style={{ color: vendorColor, border: `1px solid ${vendorColor}40`, background: `${vendorColor}15` }}>
            <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.1rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{cpuCleanName}</span>
          </h1>
        </header>

        <div className="affiliate-cta-grid" style={{ marginBottom: '40px', borderColor: `${vendorColor}40` }}>
            <div className="affiliate-col">
                <div style={{ marginBottom: '15px', color: '#f59e0b', fontWeight: '900', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>
                  {cpu.performance_index > 15000 ? '🔥 High-end gaming performance' : '🔥 Excellent price/performance ratio'}
                </div>
                
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={amazonLink} target="_blank" rel="nofollow sponsored noopener noreferrer" className="guru-buy-winner-btn amazon-btn hover-scale">
                          <ShoppingCart size={16} /> 🔥 BUY {cpuCleanName} ON AMAZON
                        </a>
                    ) : (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <a href={heurekaLink} className="guru-buy-winner-btn heureka-btn heureka-hn-link hover-scale" data-trixam-positionid="276026" data-trixam-content="Text link" data-trixam-medium="affiliate" target="_blank" rel="nofollow sponsored noopener noreferrer">
                                <ShoppingCart size={16} /> 🔥 POROVNAT NEJLEVNĚJŠÍ CENY
                            </a>
                            <div className="trust-stack">
                              <div>✔ Alza, CZC, Datart a 50+ dalších</div>
                              <div style={{ color: '#f59e0b', marginTop: '4px' }}>⚡ Cena se mění každých pár hodin</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid">
                <div className="tool-cta-card purple-glow">
                    <div className="tool-meta"><AlertTriangle size={16} /> BOTTLENECK TEST</div>
                    <h3>CHECK SYSTEM</h3>
                    <p>{isEn ? `Will your GPU handle the ${cpuCleanName}?` : `Bude tvá grafika stačit na procesor ${cpuCleanName}?`}</p>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn">ZJISTIT BOTTLENECK</a>
                </div>
                <div className="tool-cta-card cyan-glow">
                    <div className="tool-meta" style={{color: '#66fcf1'}}><Gamepad2 size={16} /> FPS CALCULATOR</div>
                    <h3>GAMING POWER</h3>
                    <p>{isEn ? `How many FPS will ${cpuCleanName} push?` : `Kolik FPS ti dá ${cpuCleanName} ve hrách?`}</p>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn">TESTOVAT FPS</a>
                </div>
            </div>
        </section>

        {!isEn && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                <HeurekaButtons isEn={false} manualSearch={cpu.name} positionId="276027" />
            </div>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
          <div className="table-wrapper">
               <div className="spec-row-style"><div className="table-label">CORES / THREADS</div><div className="spec-val-box">{cpu.cores} / {cpu.threads}</div></div>
               <div className="spec-row-style"><div className="table-label">BASE CLOCK</div><div className="spec-val-box">{cpu.base_clock_mhz} MHz</div></div>
               <div className="spec-row-style"><div className="table-label">TDP</div><div className="spec-val-box">{cpu.tdp_w} W</div></div>
               <div className="spec-row-style" style={{ border: 'none' }}><div className="table-label">ARCHITECTURE</div><div className="spec-val-box">{cpu.architecture}</div></div>
          </div>
        </section>

        <div className="money-loop-links" style={{ textAlign: 'center', marginTop: '40px' }}>
             <a href="/cpu-ranking" style={{ color: '#60a5fa', textDecoration: 'underline', margin: '0 15px', fontWeight: 'bold' }}>Nejlepší procesory 2026 →</a>
             <a href="/cpuvs" style={{ color: '#60a5fa', textDecoration: 'underline', margin: '0 15px', fontWeight: 'bold' }}>Porovnat s jiným CPU →</a>
        </div>

      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper"><SeznamAd zoneId={408654} width={970} height={90} /></div>
          <div className="ad-mobile-wrapper"><SeznamAd zoneId={408651} width={300} height={100} /></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .pulse-button { animation: pulse-cta 2s infinite; }
        .mobile-floating-cta { position: fixed; bottom: 100px; right: 15px; z-index: 9999; }
        .mobile-floating-cta a { background: #0078d4; color: #fff; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 900; text-decoration: none; box-shadow: 0 10px 40px rgba(0,0,0,0.8); display: flex; alignItems: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2); }
        .profile-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; padding: 6px 20px; border-radius: 50px; margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .guru-buy-winner-btn { width: 100%; max-width: 450px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; color: #fff; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); }
        .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; }
        .trust-stack { margin-top: 15px; font-size: 12px; color: #9ca3af; font-weight: bold; line-height: 1.6; text-align: center; }
        .guru-tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .tool-cta-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 40px; border-radius: 24px; }
        .tool-meta { font-weight: 950; text-transform: uppercase; fontSize: 12px; marginBottom: 10px; display: flex; align-items: center; gap: 10px; color: #a855f7; }
        .tool-btn { background: rgba(255,255,255,0.05); padding: 18px; border-radius: 12px; text-align: center; color: #fff; text-decoration: none; font-weight: 950; display: block; border: 1px solid rgba(255,255,255,0.1); transition: 0.3s; margin-top: 20px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; }
        .spec-val-box { color: #fff; font-weight: 950; font-size: 18px; }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }
        @media (max-width: 768px) {
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .guru-tools-grid { grid-template-columns: 1fr; }
            .spec-row-style { padding: 15px 20px; }
            .main-title { font-size: 1.6rem !important; }
        }
      `}} />
    </div>
  );
}
