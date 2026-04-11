import React, { cache } from 'react';
import Script from 'next/script'; 
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { 
 ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar,
 Trophy, Zap, Gamepad2, LayoutList, BarChart3, TrendingUp,
 ArrowRight, ExternalLink, ArrowUpCircle, Monitor, Crosshair,
 Cpu, Info, AlertTriangle, ShoppingCart
} from 'lucide-react';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; 
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU UPGRADE - DETAIL V3.6 (ENTERPRISE MONETIZATION)
 * 🚀 CÍL: Cache optimization, Structured Data, Sticky CTA, Trust & Urgency.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
  
  const attempts = [`slug.eq.${slug}`, `slug.eq.${cleanSlug}`];
  for (const filter of attempts) {
    try {
      // 🔥 FIX #1: Přidána cache revalidace pro bleskový web
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, 
        next: { revalidate: 3600 } 
      });
      if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data[0];
      }
    } catch(e) {}
  }
  return null;
});

export async function generateMetadata(props) {
  const { slug } = await props.params;
  const h = headers();
  const fullUrl = h.get('x-url') || h.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || slug?.startsWith('en-');
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) return { title: '404 | Hardware Guru' };
  const { oldCpu, newCpu } = upgrade;
  const perfDiff = Math.round((newCpu.performance_index / oldCpu.performance_index - 1) * 100);
  
  // 🔥 FIX #6: Money Title pro vyšší CTR z Google
  return { 
    title: isEn 
      ? `${newCpu.name} price, performance & upgrade from ${oldCpu.name} (2026)` 
      : `${newCpu.name} cena, výkon a vyplatí se upgrade z ${oldCpu.name}? (2026)`,
    alternates: { canonical: `${baseUrl}/cpu-upgrade/${slug}` }
  };
}

export default async function App(props) {
  const { slug } = await props.params;
  const h = headers();
  const fullUrl = h.get('x-url') || h.get('referer') || "";
  const isEn = fullUrl.includes('/en/') || slug?.startsWith('en-');

  const upgrade = await getUpgradeData(slug);
  if (!upgrade || !upgrade.oldCpu || !upgrade.newCpu) notFound();

  const { oldCpu: cpuA, newCpu: cpuB } = upgrade;
  const title = isEn ? (upgrade.title_en || `Upgrade from ${cpuA.name} to ${cpuB.name}`) : upgrade.title_cs;
  const finalPerfDiff = Math.round((cpuB.performance_index / cpuA.performance_index - 1) * 100);

  const cpuBBrand = normalizeName(cpuB.name).trim();
  const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpuB.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const amazonLink = `https://www.amazon.de/s?k=${encodeURIComponent(cpuB.name)}&tag=thehardware07-21`;

  return (
    <div className="guru-upgrade-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      {/* 🔥 FIX #2: STRUCTURED DATA PRO GOOGLE (RICH SNIPPETS) 🔥 */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": cpuB.name,
            "brand": cpuB.vendor,
            "category": "CPU",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": isEn ? "EUR" : "CZK",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />

      {/* 🔥 FIX #6: STICKY MOBILE ANCHOR TRAP 🔥 */}
      {!isEn && (
        <div className="mobile-anchor-trap">
          <a href={heurekaLink} target="_blank" rel="nofollow sponsored" className="heureka-hn-link pulse-button">
            <ShoppingCart size={18} /> CENA {cpuBBrand}
          </a>
        </div>
      )}

      <main className="inner-container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}><SeznamAd zoneId={408654} width={970} height={210} /></div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="upgrade-badge"><ArrowUpCircle size={14} /> {isEn ? 'GURU UPGRADE ANALYSIS' : 'GURU ANALÝZA UPGRADU'}</div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>{title}</h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="gpu-card-box old-cpu" style={{ borderTop: '5px solid #4b5563', opacity: 0.7 }}><h2 className="gpu-name-text">{normalizeName(cpuA.name)}</h2></div>
            <div className="vs-badge" style={{ background: '#f59e0b' }}>➜</div>
            <div className="gpu-card-box new-cpu" style={{ borderTop: '5px solid #f59e0b', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}><h2 className="gpu-name-text">{normalizeName(cpuB.name)}</h2></div>
        </div>

        <div className="affiliate-cta-grid" style={{ marginBottom: '40px', borderColor: '#f59e0b40' }}>
            <div className="affiliate-col">
                {/* 🔥 FIX #7: COMPARISON HOOK 🔥 */}
                <div style={{ marginBottom: '15px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>
                  {isEn ? `+${finalPerfDiff}% Performance boost over ${normalizeName(cpuA.name)}` : `+${finalPerfDiff}% výkonu oproti ${normalizeName(cpuA.name)}`}
                </div>

                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={amazonLink} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn hover-scale"><ShoppingCart size={16} /> 🔥 BUY CHEAPEST ON AMAZON</a>
                    ) : (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <a href={heurekaLink} className="guru-buy-winner-btn heureka-btn heureka-hn-link hover-scale" data-trixam-positionid="276026" data-trixam-content="Text link" data-trixam-medium="affiliate" target="_blank" rel="nofollow sponsored">
                              <ShoppingCart size={16} /> 🔥 POROVNAT NEJLEVNĚJŠÍ CENY
                            </a>
                            
                            {/* 🔥 FIX #5: TRUST BLOCK 🔥 */}
                            <div className="trust-block">
                              <div>✔ Porovnání z 50+ obchodů</div>
                              <div>✔ Ověřené (Alza, CZC, Datart)</div>
                              <div style={{ color: '#f59e0b' }}>⚡ Ceny se mění každých pár hodin</div>
                            </div>

                            {/* 🔥 FIX #3: INTERNAL LINKING 🔥 */}
                            <div className="internal-links-row">
                              <a href={`/cpu/${cpuB.slug}`}>{isEn ? 'CPU Details →' : 'Detail CPU →'}</a>
                              <a href={`/cpuvs/${cpuB.slug}-vs-${cpuA.slug}`}>{isEn ? 'Side-by-Side →' : 'Porovnat →'}</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <section style={{ marginBottom: '40px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card"><div className="tool-meta"><AlertTriangle size={16} /> BOTTLENECK</div><h3>{isEn ? 'CHECK SYSTEM' : 'KONTROLA SYSTÉMU'}</h3><a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="tool-btn-link">{isEn ? 'VERIFY' : 'OVĚŘIT'}</a></div>
                <div className="tool-cta-card"><div className="tool-meta" style={{color: '#66fcf1'}}><Gamepad2 size={16} /> FPS TEST</div><h3>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3><a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} className="tool-btn-link-cyan">{isEn ? 'ZJISTIT FPS' : 'ZJISTIT FPS'}</a></div>
            </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
            <div className="content-box-style analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}><Info size={24} color="#f59e0b" /> {isEn ? 'Upgrade Analysis' : 'Analýza upgradu'}</h2>
                <GuruCpuCompareText cpu1Name={normalizeName(cpuA.name)} cpu2Name={normalizeName(cpuB.name)} perfDiff={finalPerfDiff} cpu1Cores={cpuA.cores} cpu2Cores={cpuB.cores} isEn={isEn} />
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: '#f59e0b' }}><LayoutList size={28} /> {isEn ? 'SPECIFICATIONS' : 'PARAMETRY'}</h2>
          <div className="table-wrapper">
              {[
                { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}` },
                { label: isEn ? 'BOOST CLOCK' : 'BOOST TAKT', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz` },
                { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W` }
              ].map((row, i) => (
                <div key={i} className="spec-row-style">
                  <div className="spec-val-side">{row.valA}</div>
                  <div className="table-label">{row.label}</div>
                  <div className="spec-val-side" style={{ color: '#f59e0b' }}>{row.valB}</div>
                </div>
              ))}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}><HeurekaButtons isEn={isEn} /></div>
      </main>

      <div className="sticky-bottom-anchor"><SeznamAd zoneId={408654} width={970} height={90} /></div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-cta { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .pulse-button { animation: pulse-cta 2s infinite; }
        .mobile-anchor-trap { position: fixed; bottom: 100px; right: 15px; z-index: 9999; }
        .mobile-anchor-trap a { background: #0078d4; color: #fff; padding: 12px 20px; borderRadius: 14px; fontSize: 13px; fontWeight: 900; textDecoration: none; boxShadow: 0 10px 40px rgba(0,0,0,0.8); display: flex; alignItems: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2); }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; }
        .gpu-name-text { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 32px; border: 5px solid #0f1115; color: #000; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-val-side { flex: 1; text-align: center; font-size: 18px; font-weight: 950; }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-btn-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .guru-buy-winner-btn { width: 100%; max-width: 450px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: 0.3s; color: #000; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff !important; }
        .amazon-btn { background: #f59e0b; border: 2px solid #fbbf24; }
        .trust-block { margin-top: 15px; display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: #9ca3af; font-weight: bold; }
        .internal-links-row { margin-top: 15px; display: flex; gap: 20px; }
        .internal-links-row a { font-size: 12px; color: #60a5fa; text-decoration: underline; font-weight: bold; }
        .tool-cta-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 30px; border-radius: 24px; }
        .tool-meta { color: #a855f7; font-weight: 950; font-size: 12px; margin-bottom: 8px; display: flex; alignItems: center; gap: 6px; }
        .tool-btn-link, .tool-btn-link-cyan { display: block; text-align: center; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: 950; text-transform: uppercase; transition: 0.3s; }
        .tool-btn-link { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
        .tool-btn-link-cyan { background: rgba(102, 252, 241, 0.1); color: #66fcf1; border: 1px solid rgba(102, 252, 241, 0.3); }
        .hover-scale:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; }
        @media (max-width: 768px) {
            .guru-grid-ring { grid-template-columns: 1fr !important; }
            .vs-badge { margin: 10px auto; transform: rotate(90deg); width: 50px; height: 50px; font-size: 24px; }
            .spec-row-style { padding: 15px 10px; flex-direction: column; gap: 10px; }
            .table-label { width: 100%; order: -1; }
        }
      `}} />
    </div>
  );
}
