import React from 'react';
import { 
  ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
  Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Zap
} from 'lucide-react';

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V2.3 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Maximální monetizace CPU profilů skrze A-ADS bez ztráty stability.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug || cpuSlug === 'undefined') return null;
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU DATABASE' : 'ZPĚT DO KATALOGU CPU'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(cpu.name)}</span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold' }}>
             {cpu.cores} Cores • {cpu.threads} Threads • {cpu.architecture}
          </div>
        </header>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD HLAVIČKOU */}
        <div className="guru-cpu-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card"><div className="stat-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div><div className="stat-val">{cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span></div></div>
            <div className="stat-card"><div className="stat-label">Cinebench R23</div><div className="stat-val">{cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span></div></div>
            <div className="stat-card"><div className="stat-label">{isEn ? 'Power Draw' : 'Spotřeba (TDP)'}</div><div className="stat-val">{cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span></div></div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/cpu-performance/${safeSlug}` : `/cpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div><h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3><p>Full technical specs and synthetic benchmarks.</p></div>
              </a>
              <a href={isEn ? `/en/cpuvs` : `/cpuvs`} className="deep-link-card">
                  <Swords size={32} color="#a855f7" />
                  <div><h3>{isEn ? 'CPU VS Engine' : 'Srovnávač CPU'}</h3><p>Compare this CPU against any other.</p></div>
              </a>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
          <div className="table-wrapper">
               <div className="spec-row-style"><div className="table-label">{isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA'}</div><div className="spec-val-box">{cpu.cores} / {cpu.threads}</div></div>
               <div className="spec-row-style"><div className="table-label">{isEn ? 'BASE CLOCK' : 'ZÁKLADNÍ TAKT'}</div><div className="spec-val-box">{cpu.base_clock_mhz} MHz</div></div>
               
               {/* 🔥 ADS SLOT #2: MID-TABLE PLACEMENT */}
               <div className="guru-cpu-ad-slot" style={{ border: 'none', margin: '10px 0' }}>
                   <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                   <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
               </div>

               <div className="spec-row-style"><div className="table-label">L3 CACHE</div><div className="spec-val-box">{cpu.l3_cache_mb} MB</div></div>
               <div className="spec-row-style"><div className="table-label">TDP (SPOTŘEBA)</div><div className="spec-val-box">{cpu.tdp_w} W</div></div>
               <div className="spec-row-style"><div className="table-label">{isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA'}</div><div className="spec-val-box">{cpu.architecture}</div></div>
          </div>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
          <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        
        .guru-cpu-ad-slot { margin: 30px 0; padding: 15px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }

        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .stat-label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .stat-val { font-size: 32px; font-weight: 950; }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; justify-content: space-between; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; }
        .spec-val-box { color: #fff; font-weight: 950; fontSize: 18px; }

        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; border-radius: 16px; text-decoration: none; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; border-radius: 16px; text-decoration: none; }

        @media (max-width: 768px) {
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .spec-row-style { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}} />
    </div>
  );
}
