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
 * GURU CPU ENGINE - V3.9 (ENTERPRISE MONETIZATION)
 * 🚀 CÍL: Cache optimization, Structured Data, Trust Brands, Floating CTA a SEO Money Loop.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const findCpuBySlug = async (rawSlugPart) => {
  if (!supabaseUrl || !rawSlugPart || rawSlugPart === 'undefined') return null;
  const cpuSlug = rawSlugPart.replace(/^en-/, '');
  const authHeaders = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  
  try {
      // 🔥 FIX #1: Přidána cache revalidace pro bleskový TTFB a lepší Google Rank
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${cpuSlug}&limit=1`, { 
        headers: authHeaders, 
        next: { revalidate: 3600 } 
      });
      let cpu = null;
      if (res1.ok) { 
          const data1 = await res1.json(); 
          if (data1?.length) cpu = data1[0]; 
      }
      if (!cpu) {
        const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=ilike.*${cpuSlug}*&limit=1`, { 
          headers: authHeaders,
          next: { revalidate: 3600 }
        });
        if (res2.ok) { 
            const data2 = await res2.json(); 
            if (data2?.length) cpu = data2[0]; 
        }
      }
      if (cpu) {
          const fpsRes = await fetch(`${supabaseUrl}/rest/v1/cpu_game_fps?select=*&cpu_id=eq.${cpu.id}&limit=1`, { 
            headers: authHeaders,
            next: { revalidate: 3600 }
          });
          if (fpsRes.ok) {
              const fpsData = await fpsRes.json();
              cpu.cpu_game_fps = fpsData?.[0] || {};
          }
          return cpu;
      }
  } catch(e) {}
  return null;
};

export default async function CpuDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || '';
  const headersList = headers();
  const fullUrl = headersList.get('x-url') || headersList.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || rawSlug.startsWith('en-');

  const cpuSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return notFound();

  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const cpuCleanName = normalizeName(cpu.name);
  
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpu.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const amazonLink = `https://www.amazon.de/s?k=${encodeURIComponent(cpu.name)}&tag=thehardware07-21`;

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      {/* 🔥 FIX #2: STRUCTURED DATA PRO RICH SNIPPETS V GOOGLU 🔥 */}
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
              "priceCurrency": isEn ? "EUR" : "CZK",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />

      {/* 🔥 FIX #7: MOBILE FLOATING CTA (ULTRA MONEY) 🔥 */}
      {!isEn && (
        <div className="mobile-floating-cta">
          <a href={heurekaLink} target="_blank" rel="nofollow sponsored" className="heureka-hn-link pulse-button" data-trixam-positionid="276026">
            <ShoppingCart size={18} /> CENA {cpuCleanName}
          </a>
        </div>
      )}

      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
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

        {/* 🔥 AFFILIATE BOMB - FIX #3 + #4 + #9 🔥 */}
        <div className="affiliate-cta-grid" style={{ marginBottom: '40px', borderColor: `${vendorColor}40` }}>
            <div className="affiliate-col">
                <div style={{ marginBottom: '15px', color: '#f59e0b', fontWeight: '900', textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>
                  {cpu.performance_index > 15000 ? '🔥 High-end gaming performance' : '🔥 Great value for money'}
                </div>
                
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn hover-scale">
                          <ShoppingCart size={16} /> 🔥 BUY {cpuCleanName} ON AMAZON
                        </a>
                    ) : (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <a href={heurekaLink} className="guru-buy-winner-btn heureka-btn heureka-hn-link hover-scale" data-trixam-positionid="276026" data-trixam-content="Text link" data-trixam-medium="affiliate" target="_blank" rel="nofollow sponsored">
                                <ShoppingCart size={16} /> 🔥 POROVNAT NEJLEVNĚJŠÍ CENY
                            </a>
                            
                            {/* 🔥 FIX #4: TRUST STACK 🔥 */}
                            <div className="trust-stack">
                              <div>✔ Porovnání z 50+ obchodů</div>
                              <div>✔ Ověřené (Alza, CZC, Datart)</div>
                              <div style={{ color: '#f59e0b', marginTop: '4px' }}>⚡ Cena se může změnit během hodin</div>
                            </div>

                            {/* 🔥 FIX #6: INTERNAL LINKING LOOP 🔥 */}
                            <div className="money-loop-links">
                              <a href="/cpu-index">{isEn ? 'Other CPUs →' : 'Další procesory →'}</a>
                              <a href="/cpuvs">{isEn ? 'Compare Side-by-Side →' : 'Porovnat s jiným →'}</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid">
                <div className="tool-cta-card purple-glow">
                    <div>
                        <div className="tool-meta"><AlertTriangle size={16} /> {isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</div>
                        <h3>BOTTLENECK TEST</h3>
                        <p>{isEn ? `Will your GPU handle the ${cpuCleanName}?` : `Bude tvá grafika stačit na procesor ${cpuCleanName}?`}</p>
                    </div>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn">{isEn ? 'TEST BOTTLENECK' : 'ZJISTIT BOTTLENECK'}</a>
                </div>
                <div className="tool-cta-card cyan-glow">
                    <div>
                        <div className="tool-meta" style={{color: '#66fcf1'}}><Gamepad2 size={16} /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}</div>
                        <h3>FPS CALCULATOR</h3>
                        <p>{isEn ? `How many FPS will ${cpuCleanName} push?` : `Kolik FPS ti dá ${cpuCleanName} ve hrách?`}</p>
                    </div>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn">{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
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
               <div className="spec-row-style"><div className="table-label">{isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA'}</div><div className="spec-val-box">{cpu.cores} / {cpu.threads}</div></div>
               <div className="spec-row-style"><div className="table-label">{isEn ? 'BASE CLOCK' : 'ZÁKLADNÍ TAKT'}</div><div className="spec-val-box">{cpu.base_clock_mhz} MHz</div></div>
               <div className="spec-row-style"><div className="table-label">TDP</div><div className="spec-val-box">{cpu.tdp_w} W</div></div>
               <div className="spec-row-style"><div className="table-label">{isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA'}</div><div className="spec-val-box">{cpu.architecture}</div></div>
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .pulse-button { animation: pulse-cta 2s infinite; }
        .mobile-floating-cta { position: fixed; bottom: 90px; right: 15px; z-index: 9999; display: none; }
        .mobile-floating-cta a { background: #0078d4; color: #fff; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 900; text-decoration: none; box-shadow: 0 10px 40px rgba(0,0,0,0.8); display: flex; alignItems: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2); }
        
        .profile-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border-radius: 50px; margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-btn-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; }
        .guru-buy-winner-btn { width: 100%; max-width: 450px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; color: #fff; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); }
        .amazon-btn { background: #f59e0b; color: #000; border: 2px solid #fbbf24; }
        .trust-stack { margin-top: 15px; font-size: 12px; color: #9ca3af; font-weight: bold; line-height: 1.6; }
        .money-loop-links { margin-top: 20px; display: flex; gap: 20px; }
        .money-loop-links a { color: #60a5fa; font-size: 12px; font-weight: bold; text-decoration: underline; }
        
        .guru-tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .tool-cta-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 40px; border-radius: 24px; display: flex; flexDirection: column; justify-content: space-between; gap: 20px; }
        .purple-glow { border-color: rgba(168, 85, 247, 0.2); }
        .cyan-glow { border-color: rgba(102, 252, 241, 0.2); }
        .tool-meta { color: #a855f7; font-weight: 950; text-transform: uppercase; fontSize: 12px; marginBottom: 10px; display: flex; align-items: center; gap: 10px; }
        .tool-btn { background: rgba(255,255,255,0.05); padding: 18px; border-radius: 12px; text-align: center; color: #fff; text-decoration: none; font-weight: 950; display: block; border: 1px solid rgba(255,255,255,0.1); transition: 0.3s; }
        .tool-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; }
        .spec-val-box { color: #fff; font-weight: 950; font-size: 18px; }
        
        .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        
        @media (max-width: 768px) {
            .mobile-floating-cta { display: block; }
            .guru-tools-grid { grid-template-columns: 1fr; }
            .affiliate-btn-wrap { gap: 15px; }
            .guru-buy-winner-btn { padding: 16px; font-size: 14px; }
            .money-loop-links { flex-direction: column; gap: 10px; }
        }
      `}} />
    </div>
  );
}
