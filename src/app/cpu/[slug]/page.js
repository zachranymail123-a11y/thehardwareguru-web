import React from 'react';
import { headers } from 'next/headers';
import { 
 ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
 Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Zap, AlertTriangle
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V3.2 (RESTORED ALL LINKS + EN DETECTION)
 * 🚀 CÍL: Přidání chybějících prolinků na FPS a Bottleneck kalkulačku + Amazon pro EN.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const getCleanSearchName = (name = '') => name.replace(/AMD |Intel |Core /gi, '').trim();

const findCpuBySlug = async (rawSlugPart) => {
  if (!supabaseUrl || !rawSlugPart || rawSlugPart === 'undefined') return null;
  const cpuSlug = rawSlugPart.replace(/^en-/, '');
  const headersObj = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${cpuSlug}&limit=1`, { headers: headersObj, cache: 'force-cache' });
      let cpu = null;
      if (res1.ok) { 
          const data1 = await res1.json(); 
          if (data1?.length) cpu = data1[0]; 
      }
      
      if (!cpu) {
        const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=ilike.*${cpuSlug}*&limit=1`, { headers: headersObj, cache: 'force-cache' });
        if (res2.ok) { 
            const data2 = await res2.json(); 
            if (data2?.length) cpu = data2[0]; 
        }
      }

      if (cpu) {
          const fpsRes = await fetch(`${supabaseUrl}/rest/v1/cpu_game_fps?select=*&cpu_id=eq.${cpu.id}&limit=1`, { headers: headersObj, cache: 'force-cache' });
          if (fpsRes.ok) {
              const fpsData = await fpsRes.json();
              cpu.cpu_game_fps = fpsData?.[0] || {};
          }
          return cpu;
      }
  } catch(e) { console.error("CPU Lookup Error:", e); }
  return null;
};

const getInternalLinksData = async (cpuId) => {
  if (!supabaseUrl || !cpuId) return { similarCpus: [], recommendedGpus: [] };
  const headersObj = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  let similarCpus = [];
  let recommendedGpus = [];
  try {
      const cpuRes = await fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug&id=neq.${cpuId}&order=performance_index.desc&limit=6`, { headers: headersObj, cache: 'force-cache' });
      if (cpuRes.ok) similarCpus = await cpuRes.json();
      const gpuRes = await fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug&order=performance_index.desc&limit=6`, { headers: headersObj, cache: 'force-cache' });
      if (gpuRes.ok) recommendedGpus = await gpuRes.json();
  } catch(e) {}
  return { similarCpus, recommendedGpus };
};

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const headersList = headers();
  const referer = headersList.get('referer') || "";
  const isEn = rawSlug.startsWith('en-') || referer.includes('/en');
  
  const cpuSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };
  const safeSlug = cpu.slug || slugify(cpu.name);
  return {
    title: isEn ? `${cpu.name} Specs & Gaming Performance | The Hardware Guru` : `${cpu.name} Specifikace a Herní výkon | The Hardware Guru`,
    alternates: { canonical: isEn ? `${baseUrl}/en/cpu/${safeSlug}` : `${baseUrl}/cpu/${safeSlug}`, languages: { 'en': `${baseUrl}/en/cpu/${safeSlug}`, 'cs': `${baseUrl}/cpu/${safeSlug}` } }
  };
}

export default async function CpuDetailPage({ params }) {
  const { slug: rawSlug } = await params;
  const headersList = headers();
  const referer = headersList.get('referer') || "";
  const isEn = rawSlug.startsWith('en-') || referer.includes('/en');

  const cpuSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);

  if (!cpu) return <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', textAlign: 'center', padding: '100px' }}><h1>CPU NOT FOUND</h1></div>;

  const { similarCpus, recommendedGpus } = await getInternalLinksData(cpu.id);
  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const safeSlug = cpu.slug || slugify(cpu.name);
  const fpsData = cpu.cpu_game_fps || {};
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';

  const searchName = getCleanSearchName(cpu.name);
  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
  const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;
  const getAmazonLink = (name) => `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=thehardware07-20`;

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
                <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(2.1rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(cpu.name)}</span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold' }}>
             {cpu.cores} Cores • {cpu.threads} Threads • {cpu.architecture}
          </div>
        </header>

        {/* 🔥 GURU AFFILIATE BOMB 🔥 */}
        <div className="affiliate-cta-grid" style={{ marginBottom: '50px', borderColor: `${vendorColor}40` }}>
            <div className="affiliate-col">
                <div className="affiliate-col-title" style={{ color: vendorColor }}>
                    <ShoppingCart size={16} /> {isEn ? `BUY ${normalizeName(cpu.name)}` : `KOUPIT ${normalizeName(cpu.name)}`}
                </div>
                <div className="affiliate-btn-wrap">
                    {isEn ? (
                        <a href={getAmazonLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn amazon-btn">
                            <ShoppingCart size={16} /> Check Price on Amazon
                        </a>
                    ) : (
                        <>
                            <a href={getSmartyLink(searchName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                                <ShoppingCart size={16} /> Smarty.cz
                            </a>
                            <a href={getHeurekaLink(searchName)} data-trixam-positionid="276027" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link">
                                <ShoppingCart size={16} /> Heureka.cz
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>

        <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card"><div className="stat-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div><div className="stat-val">{cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span></div></div>
            <div className="stat-card"><div className="stat-label">Cinebench R23</div><div className="stat-val">{cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span></div></div>
            <div className="stat-card"><div className="stat-label">{isEn ? 'Power Draw' : 'Spotřeba (TDP)'}</div><div className="stat-val">{cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span></div></div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div className="deep-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/cpu-performance/${safeSlug}` : `/cpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div><h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3><p>{isEn ? 'Full technical specs and benchmarks.' : 'Kompletní technické specifikace a benchmarky.'}</p></div>
              </a>
              <a href={isEn ? `/en/cpuvs` : `/cpuvs`} className="deep-link-card">
                  <Swords size={32} color="#a855f7" />
                  <div><h3>{isEn ? 'CPU VS Engine' : 'Srovnávač CPU'}</h3><p>{isEn ? 'Compare against any other processor.' : 'Srovnej s jakýmkoliv jiným procesorem.'}</p></div>
              </a>
          </div>
        </section>

        {!isEn && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
                <HeurekaButtons isEn={false} />
            </div>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
          <div className="table-wrapper">
               <div className="spec-row-style"><div className="table-label">{isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA'}</div><div className="spec-val-box">{cpu.cores} / {cpu.threads}</div></div>
               <div className="spec-row-style"><div className="table-label">{isEn ? 'BASE CLOCK' : 'ZÁKLADNÍ TAKT'}</div><div className="spec-val-box">{cpu.base_clock_mhz} MHz</div></div>
               <div className="spec-row-style"><div className="table-label">L3 CACHE</div><div className="spec-val-box">{cpu.l3_cache_mb} MB</div></div>
               <div className="spec-row-style"><div className="table-label">TDP (SPOTŘEBA)</div><div className="spec-val-box">{cpu.tdp_w} W</div></div>
               <div className="spec-row-style"><div className="table-label">{isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA'}</div><div className="spec-val-box">{cpu.architecture}</div></div>
          </div>
        </section>

        {/* 🔥 PŘIDÁNO: PROLINKOVÁNÍ NA FPS A BOTTLENECK KALKULAČKU 🔥 */}
        <section style={{ marginBottom: '60px' }}>
            <div className="guru-tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a855f7', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><AlertTriangle size={16} /> {isEn ? 'SYSTEM CHECK' : 'KONTROLA SYSTÉMU'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK CALCULATOR' : 'BOTTLENECK KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Will your GPU handle the ${normalizeName(cpu.name)}?` : `Bude tvá grafika stačit na procesor ${normalizeName(cpu.name)}?`}</p>
                    </div>
                    <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#a855f7', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center', transition: '0.3s' }} className="tool-btn hover-scale-purple">{isEn ? 'TEST BOTTLENECK' : 'ZJISTIT BOTTLENECK'}</a>
                </div>

                <div className="tool-cta-card" style={{ background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.05) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(102, 252, 241, 0.2)', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#66fcf1', fontWeight: '950', textTransform: 'uppercase', fontSize: '12px', marginBottom: '10px' }}><Gamepad2 size={16} /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'FPS CALCULATOR' : 'FPS KALKULAČKA'}</h3>
                        <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `How many FPS will ${normalizeName(cpu.name)} push in games?` : `Kolik FPS ti dá ${normalizeName(cpu.name)} v oblíbených hrách?`}</p>
                    </div>
                    <a href={isEn ? '/en/fps-calculator' : '/fps-kalkulacka'} style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)', color: '#66fcf1', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none', textTransform: 'uppercase', textAlign: 'center', transition: '0.3s' }} className="tool-btn hover-scale-cyan">{isEn ? 'TEST FPS' : 'ZJISTIT FPS'}</a>
                </div>
            </div>
        </section>

        <div className="footer-btns" style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'DEALS' : 'SLEVY'}</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT' : 'PODPORA'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .stat-label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .stat-val { font-size: 32px; font-weight: 950; }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; }
        .spec-val-box { color: #fff; font-weight: 950; font-size: 18px; }

        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
        .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 0 0 5px 0; }
        .deep-link-card p { font-size: 13px; color: #9ca3af; margin: 0; }
        
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; border-radius: 16px; text-decoration: none; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; border-radius: 16px; text-decoration: none; }

        .sticky-bottom-anchor { position: fixed; bottom: 0; left: 0; width: 100%; background: rgba(10, 11, 13, 0.98); border-top: 1px solid rgba(255, 255, 255, 0.1); z-index: 9999; padding: 10px 0; display: flex; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,0.8); }

        .affiliate-cta-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 35px; background: rgba(0,0,0,0.4); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; box-sizing: border-box; }
        .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; text-align: center; }
        .affiliate-btn-wrap { display: flex; gap: 20px; width: 100%; justify-content: center; flex-wrap: wrap; }
        
        .guru-buy-winner-btn { flex: 1; max-width: 300px; min-width: 200px; display: inline-flex; justify-content: center; align-items: center; gap: 12px; padding: 18px 24px; border-radius: 16px; text-decoration: none; font-weight: 950; font-size: 16px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 1px; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; }
        .amazon-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000; border: 2px solid #fbbf24; }

        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        .hover-scale-purple:hover { background: rgba(168, 85, 247, 0.2) !important; box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); transform: translateY(-2px); }
        .hover-scale-cyan:hover { background: rgba(102, 252, 241, 0.2) !important; box-shadow: 0 0 20px rgba(102, 252, 241, 0.3); transform: translateY(-2px); }

        @media (max-width: 768px) {
            .guru-page-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.6rem !important; }
            .stat-val { font-size: 24px !important; }
            .spec-row-style { flex-direction: column; align-items: flex-start; gap: 10px; padding: 15px 20px !important; }
            .deep-links-grid { grid-template-columns: 1fr !important; }
            .guru-deals-btn, .guru-support-btn { width: 100% !important; }
            .affiliate-btn-wrap { flex-direction: column; gap: 15px; }
            .guru-buy-winner-btn { max-width: 100%; width: 100%; padding: 16px; font-size: 15px; }
            .tool-cta-card { padding: 25px 15px !important; text-align: center; }
        }
      `}} />
    </div>
  );
}
