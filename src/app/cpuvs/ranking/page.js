import React from 'react';
import Script from 'next/script'; 
import { 
  ChevronLeft, Trophy, Zap, Cpu, Medal, Monitor, ChevronRight, Gamepad2, AlertTriangle, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU RANKING V2.4 (ULTIMATE MONETIZATION MACHINE)
 * 🚀 CÍL: Inline nákupní linky, Structured Data, Top 1 dominance a Scroll CTA.
 */

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text?.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() || 'unknown';
const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

const fetchRankingData = async () => {
    if (!supabaseUrl) return [];
    try {
        const url = `${supabaseUrl}/rest/v1/cpus?select=*&order=performance_index.desc.nullslast,name.asc`;
        const res = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'no-store'
        });
        return res.ok ? await res.json() : [];
    } catch (e) { return []; }
};

export default async function CpuRankingPage(props) {
  const isEn = props?.isEn === true;
  const cpus = await fetchRankingData();

  if (!cpus || cpus.length === 0) return <div style={{ color: '#fff', background: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DATABASE ERROR</div>;

  return (
    <div className="guru-ranking-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {!isEn && <Script async src="//serve.affiliate.heureka.cz/js/trixam.min.js" strategy="afterInteractive" />}

      {/* 🔥 FIX #5: STRUCTURED DATA PRO GOOGLE 🔥 */}
      <Script
        id="ranking-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "itemListElement": cpus.slice(0, 15).map((cpu, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "name": cpu.name,
              "url": `${baseUrl}${isEn ? '/en' : ''}/cpu/${cpu.slug || slugify(cpu.name)}`
            }))
          })
        }}
      />

      <main className="inner-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="ranking-badge">
            <Trophy size={18} /> GURU RANKING SYSTEM
          </div>
          <h1 className="main-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: 1.0 }}>
            {isEn ? 'CPU' : 'ŽEBŘÍČEK'} <span style={{ color: '#f59e0b', textShadow: '0 0 40px rgba(245, 158, 11, 0.4)' }}>{isEn ? 'TIER LIST' : 'PROCESORŮ'}</span>
          </h1>
          
          {/* 🔥 FIX #3: INTENT HOOK 🔥 */}
          <div style={{ marginTop: '15px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}>
            {isEn ? '🔥 Best gaming processors by performance and value (2026)' : '🔥 Nejlepší procesory podle výkonu a ceny (2026)'}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
            <a href={isEn ? "/en/fps-calculator" : "/fps-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#06b6d4', color: '#06b6d4' }}><Gamepad2 size={14} /> {isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</a>
            <a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"} className="quick-link-pill" style={{ borderColor: '#a855f7', color: '#a855f7' }}><AlertTriangle size={14} /> {isEn ? 'BOTTLENECK TEST' : 'BOTTLENECK TEST'}</a>
          </div>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <HeurekaButtons isEn={isEn} manualSearch="nejlepší procesory cena" />
        </div>

        <div className="ranking-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cpus.map((cpu, index) => {
            if (!cpu || !cpu.name) return null;
            const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24';
            const safeSlug = cpu.slug || slugify(cpu.name);
            const isTop3 = index < 3;
            
            const heurekaLink = `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(cpu.name + ' cena')}&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

            return (
              <React.Fragment key={cpu.id || index}>
                <div className="ranking-card-container" style={{ position: 'relative' }}>
                  
                  {/* 🔥 FIX #2: TOP 1 DOMINANCE 🔥 */}
                  {index === 0 && (
                    <div style={{ position: 'absolute', top: '-12px', right: '30px', background: '#f59e0b', color: '#000', padding: '4px 15px', borderRadius: '10px', fontSize: '11px', fontWeight: '950', zIndex: 10, boxShadow: '0 5px 15px rgba(245, 158, 11, 0.4)' }}>
                      🏆 {isEn ? 'BEST PERFORMANCE CPU' : 'NEJLEPŠÍ HERNÍ CPU'}
                    </div>
                  )}

                  <div className="ranking-card hover-scale">
                      <div className="rank-num" style={{ color: isTop3 ? '#f59e0b' : '#4b5563' }}>{index + 1}.</div>
                      <div className="v-bar" style={{ backgroundColor: vendorColor }}></div>
                      
                      <div style={{ flex: 1 }}>
                        <Link href={isEn ? `/en/cpu/${safeSlug}` : `/cpu/${safeSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h2 className="cpu-title">{normalizeName(cpu.name)}</h2>
                        </Link>
                        <div className="cpu-meta">{cpu.vendor} • {cpu.cores || '?'}/{cpu.threads || '?'}C • {cpu.boost_clock_mhz || 'N/A'} MHz</div>
                        
                        {/* 🔥 FIX #1 + #8 + #9: INLINE CTA + MONEY LOOP 🔥 */}
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {!isEn ? (
                            <a href={heurekaLink} target="_blank" rel="nofollow sponsored" className="heureka-hn-link" data-trixam-positionid="276026" style={{ fontSize: '12px', color: '#60a5fa', fontWeight: '900', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <ShoppingCart size={14} /> 🔥 Porovnat ceny →
                              <span style={{ color: '#f59e0b', fontSize: '10px', textDecoration: 'none', fontWeight: 'normal', marginLeft: '5px' }}>⚡ ceny denně</span>
                            </a>
                          ) : (
                            <a href={`https://www.amazon.com/s?k=${encodeURIComponent(cpu.name)}&tag=thehardware07-20`} target="_blank" rel="nofollow sponsored" style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '900', textDecoration: 'underline' }}>
                              🔥 Check Price on Amazon →
                            </a>
                          )}
                          <Link href={`/cpuvs/${safeSlug}-vs-core-i9-14900k`} style={{ fontSize: '10px', color: '#4b5563', textDecoration: 'none', fontWeight: 'bold' }}>
                             Srovnat výkon →
                          </Link>
                        </div>
                      </div>

                      <div className="score-box">
                        <div className="score-label">{isEn ? 'PERF SCORE' : 'VÝKONOVÉ SKÓRE'}</div>
                        <div className="score-val" style={{ color: isTop3 ? '#f59e0b' : '#fff' }}>
                          <Zap size={18} fill={isTop3 ? '#f59e0b' : 'none'} /> {cpu.performance_index || '0'}
                        </div>
                        {isTop3 && <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>🔥 TOP TIER</div>}
                      </div>
                      <ChevronRight size={20} className="arrow-icon" />
                  </div>
                </div>

                {index === 4 && (
                  <div className="ad-mobile-wrapper" style={{ margin: '15px 0' }}>
                    <SeznamAd zoneId={408651} width={300} height={250} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 🔥 FIX #4: SCROLL TRIGGER CTA (ULTRA MONEY) 🔥 */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <a
            href={isEn ? "https://www.amazon.com/s?k=gaming+processor&tag=thehardware07-20" : "https://www.heureka.cz/?h%5Bfraze%5D=procesor+cena&utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link"}
            target="_blank"
            rel="nofollow sponsored"
            className={`guru-buy-winner-btn hover-scale ${!isEn ? 'heureka-btn' : 'amazon-btn'}`}
            style={{ padding: '20px 40px', borderRadius: '18px', fontSize: '16px' }}
          >
            <ShoppingCart size={20} /> {isEn ? '💰 Browse Best Processor Deals' : '💰 Zobrazit všechny ceny procesorů'}
          </a>
        </div>

        <div className="silo-footer-grid" style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
           <Link href={isEn ? "/en/gpu-index" : "/gpu-index"} className="silo-card hover-scale" style={{ borderLeft: '4px solid #66fcf1' }}>
              <Monitor size={32} color="#66fcf1" />
              <div><h4>{isEn ? 'GPU DATABASE' : 'ŽEBŘÍČEK GRAFIK'}</h4><p>{isEn ? 'Graphics cards performance' : 'Srovnání výkonu GPU'}</p></div>
           </Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .ranking-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 8px 25px; border: 1px solid rgba(245,158,11,0.4); border-radius: 50px; background: rgba(245,158,11,0.1); margin-bottom: 20px; }
        .ranking-card { display: flex; align-items: center; background: rgba(15, 17, 21, 0.98); padding: 25px 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
        .ranking-card:hover { background: rgba(25, 27, 31, 1); border-color: rgba(245, 158, 11, 0.3); }
        .rank-num { width: 50px; font-size: 24px; font-weight: 950; }
        .v-bar { width: 4px; height: 50px; border-radius: 10px; margin-right: 25px; }
        .cpu-title { font-size: 1.4rem; font-weight: 950; margin: 0; text-transform: uppercase; color: #fff; }
        .cpu-meta { font-size: 11px; color: #6b7280; font-weight: 900; }
        .score-box { text-align: center; padding: 0 40px; border-left: 1px solid rgba(255,255,255,0.05); margin: 0 15px; }
        .score-label { font-size: 9px; color: #6b7280; font-weight: 950; text-transform: uppercase; }
        .score-val { font-size: 26px; font-weight: 950; display: flex; align-items: center; gap: 8px; }
        .arrow-icon { color: #4b5563; }
        .silo-card { background: rgba(15, 17, 21, 0.98); padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 20px; text-decoration: none; color: #fff; transition: 0.3s; }
        
        .guru-buy-winner-btn { display: inline-flex; align-items: center; gap: 12px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; color: #fff; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); }
        .amazon-btn { background: #f59e0b; color: #000; }

        .quick-link-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; font-weight: 950; font-size: 11px; text-transform: uppercase; text-decoration: none; border: 1px solid; background: rgba(255,255,255,0.02); transition: 0.3s; }
        .hover-scale:hover { transform: translateY(-3px) scale(1.01); filter: brightness(1.1); box-shadow: 0 15px 30px rgba(0,0,0,0.4); }

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
          .guru-ranking-wrapper { padding-top: 80px !important; }
          .inner-container { padding: 0 15px !important; }
          .ad-desktop-wrapper { display: none !important; }
          .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
          .main-h1 { font-size: 1.8rem !important; }
          .ranking-card { padding: 15px; flex-wrap: wrap; border-radius: 18px; }
          .score-box { border-left: none; padding: 15px 0 0 0; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); margin: 15px 0 0 0; display: flex; justify-content: space-between; align-items: center; }
          .score-val { font-size: 20px; }
          .rank-num { width: 30px; font-size: 18px; }
          .v-bar { margin-right: 15px; height: 40px; }
          .cpu-title { font-size: 1.1rem; }
          .arrow-icon { display: none; }
          .quick-link-pill { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
}
