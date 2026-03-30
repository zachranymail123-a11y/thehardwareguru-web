import React from 'react';
import { 
  ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
  Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Zap
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V2.8 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchoru, eliminace hluchých míst + Heureka CTA.
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
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${cpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      let cpu = null;
      if (res1.ok) { 
          const data1 = await res1.json(); 
          if (data1?.length) cpu = data1[0]; 
      }
      
      if (!cpu) {
        const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=ilike.*${cpuSlug}*&limit=1`, { headers, cache: 'force-cache' });
        if (res2.ok) { 
            const data2 = await res2.json(); 
            if (data2?.length) cpu = data2[0]; 
        }
      }

      if (!cpu) {
          const filter = /amd|intel|ryzen|core|ultra|processor|cpu/gi;
          const clean = cpuSlug.replace(/-/g, ' ').replace(filter, '').trim();
          const tokens = clean.split(/\s+/).filter(t => t.length > 0);
          if (tokens.length > 0) {
              const cond = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
              const r3 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&and=(${cond})&limit=1`, { headers, cache: 'force-cache' });
              if (r3.ok) { 
                  const d3 = await r3.json(); 
                  if (d3?.length) cpu = d3[0]; 
              }
          }
      }

      if (cpu) {
          const fpsRes = await fetch(`${supabaseUrl}/rest/v1/cpu_game_fps?select=*&cpu_id=eq.${cpu.id}&limit=1`, { headers, cache: 'force-cache' });
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
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  let similarCpus = [];
  let recommendedGpus = [];
  try {
      const cpuRes = await fetch(`${supabaseUrl}/rest/v1/cpus?select=name,slug&id=neq.${cpuId}&order=performance_index.desc&limit=6`, { headers, cache: 'force-cache' });
      if (cpuRes.ok) similarCpus = await cpuRes.json();
      const gpuRes = await fetch(`${supabaseUrl}/rest/v1/gpus?select=name,slug&order=performance_index.desc&limit=6`, { headers, cache: 'force-cache' });
      if (gpuRes.ok) recommendedGpus = await gpuRes.json();
  } catch(e) {}
  return { similarCpus, recommendedGpus };
};

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };
  const safeSlug = cpu.slug || slugify(cpu.name);
  return {
    title: isEn ? `${cpu.name} Specs & Gaming Performance | The Hardware Guru` : `${cpu.name} Specifikace a Herní výkon | The Hardware Guru`,
    alternates: { canonical: `${baseUrl}/cpu/${safeSlug}`, languages: { 'en': `${baseUrl}/en/cpu/${safeSlug}`, 'cs': `${baseUrl}/cpu/${safeSlug}` } }
  };
}

export default async function CpuDetailPage({ params }) {
  const { slug: rawSlug } = await params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);

  if (!cpu) return <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', color: '#fff', textAlign: 'center', padding: '100px' }}><h1>CPU NENALEZENO</h1></div>;

  const { similarCpus, recommendedGpus } = await getInternalLinksData(cpu.id);
  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const safeSlug = cpu.slug || slugify(cpu.name);
  const fpsData = cpu.cpu_game_fps || {};
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';

  return (
    <div className="guru-page-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn">
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

        <section className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px', marginTop: '40px' }}>
            <div className="stat-card"><div className="stat-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div><div className="stat-val">{cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span></div></div>
            <div className="stat-card"><div className="stat-label">Cinebench R23</div><div className="stat-val">{cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span></div></div>
            <div className="stat-card"><div className="stat-label">{isEn ? 'Power Draw' : 'Spotřeba (TDP)'}</div><div className="stat-val">{cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span></div></div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div className="deep-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/cpu-performance/${safeSlug}` : `/cpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div><h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3><p>Full technical specs and benchmarks.</p></div>
              </a>
              <a href={isEn ? `/en/cpuvs` : `/cpuvs`} className="deep-link-card">
                  <Swords size={32} color="#a855f7" />
                  <div><h3>{isEn ? 'CPU VS Engine' : 'Srovnávač CPU'}</h3><p>Compare against any other processor.</p></div>
              </a>
          </div>
        </section>

        {/* 🔥 PŘIDÁNO: Vložení Heureka tlačítek (CTA pod rozcestníkem analýzy) 🔥 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
            <HeurekaButtons isEn={isEn} />
        </div>

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

        <div className="footer-btns" style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
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

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .stat-label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .stat-val { font-size: 32px; font-weight: 950; }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; }
        .spec-val-box { color: #fff; font-weight: 950; font-size: 18px; }

        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
        .deep-link-card h3 { font-size: 18px; font-weight: 950; margin: 0 0 5px 0; }
        .deep-link-card p { font-size: 13px; color: #9ca3af; margin: 0; }
        
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; border-radius: 16px; text-decoration: none; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; border-radius: 16px; text-decoration: none; }

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
            .guru-page-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.6rem !important; }
            .section-h2 { font-size: 1.4rem !important; }
            .stat-card { padding: 20px !important; }
            .stat-val { font-size: 24px !important; }
            .spec-row-style { flex-direction: column; align-items: flex-start; gap: 10px; padding: 15px 20px !important; }
            .deep-link-card { padding: 20px !important; }
            .deep-links-grid { grid-template-columns: 1fr !important; }
            .footer-btns { gap: 15px !important; }
            .guru-deals-btn, .guru-support-btn { width: 100% !important; }
        }
      `}} />
    </div>
  );
}
