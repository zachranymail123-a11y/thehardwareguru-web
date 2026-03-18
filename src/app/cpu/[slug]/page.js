import React from 'react';
import { 
  ChevronLeft, Cpu, Database, Gamepad2, ArrowRight, ExternalLink, 
  Activity, CheckCircle2, Swords, LayoutList, ShoppingCart, Flame, Heart, Zap
} from 'lucide-react';

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V2.2 (STABILITY FIX)
 * 🛡️ FIX: Odstraněno problematické relační fetchování, které způsobovalo Server Error.
 * 🛡️ FIX: Rozděleno na dva čisté fetch dotazy pro maximální stabilitu.
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: STABILNÍ VYHLEDÁVÁNÍ
const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug || cpuSlug === 'undefined') return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      // Tier 1: Exact Slug
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=eq.${cpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      let cpu = null;
      if (res1.ok) { 
          const data1 = await res1.json(); 
          if (data1?.length) cpu = data1[0]; 
      }
      
      // Tier 2: Search by Name if slug fails
      if (!cpu) {
        const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&slug=ilike.*${cpuSlug}*&limit=1`, { headers, cache: 'force-cache' });
        if (res2.ok) { 
            const data2 = await res2.json(); 
            if (data2?.length) cpu = data2[0]; 
        }
      }

      if (cpu) {
          // Fetch FPS data separately to avoid Join errors
          const fpsRes = await fetch(`${supabaseUrl}/rest/v1/cpu_game_fps?select=*&cpu_id=eq.${cpu.id}&limit=1`, { headers, cache: 'force-cache' });
          if (fpsRes.ok) {
              const fpsData = await fpsRes.json();
              cpu.cpu_game_fps = fpsData?.[0] || {};
          }
          return cpu;
      }
  } catch(e) { console.error("CPU Lookup Critical Error:", e); }
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
  const canonicalUrl = `${baseUrl}/cpu/${safeSlug}`;

  return {
    title: isEn ? `${cpu.name} Specs & Gaming Performance | The Hardware Guru` : `${cpu.name} Specifikace a Herní výkon | The Hardware Guru`,
    alternates: {
      canonical: canonicalUrl,
      languages: { 'en': `${baseUrl}/en/cpu/${safeSlug}`, 'cs': canonicalUrl, 'x-default': canonicalUrl }
    }
  };
}

export default async function CpuDetailPage({ params }) {
  const { slug: rawSlug } = await params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  const cpu = await findCpuBySlug(cpuSlug);

  if (!cpu) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '20px' }}>
        <div>
            <h1 style={{ color: '#ef4444', fontSize: '2rem', fontWeight: '950' }}>CPU NENALEZENO</h1>
            <p style={{ color: '#9ca3af', margin: '20px 0' }}>{isEn ? 'Hardware could not be identified.' : 'Tento procesor jsme v naší databázi nenašli.'}</p>
            <a href={isEn ? "/en/cpu-index" : "/cpu-index"} style={{ padding: '15px 30px', background: '#f59e0b', color: '#000', borderRadius: '12px', fontWeight: '950', textTransform: 'uppercase', textDecoration: 'none' }}>{isEn ? 'VIEW DATABASE' : 'KATALOG PROCESORŮ'}</a>
        </div>
    </div>
  );

  const { similarCpus, recommendedGpus } = await getInternalLinksData(cpu.id);
  const vendorColor = (cpu.vendor || '').toUpperCase() === 'INTEL' ? '#0071c5' : (cpu.vendor === 'AMD' ? '#ed1c24' : '#f59e0b');
  const safeSlug = cpu.slug || slugify(cpu.name);
  const fpsData = cpu.cpu_game_fps || {};
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';

  const availableGames = Object.keys(fpsData)
    .filter(k => k !== 'cpu_id' && k !== 'id' && !k.includes('cinebench') && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'cs2'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpu-index" : "/cpu-index"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU DATABASE' : 'ZPĚT DO KATALOGU CPU'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: vendorColor, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: `1px solid ${vendorColor}40`, borderRadius: '50px', background: `${vendorColor}15` }}>
            <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(cpu.name)}</span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>
             {cpu.cores} Cores • {cpu.threads} Threads • {cpu.architecture}
          </div>
        </header>

        {/* STATS & ANALYSIS GRID */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card">
                <div className="stat-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div>
                <div className="stat-val">{cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span></div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Cinebench R23</div>
                <div className="stat-val">{cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span></div>
            </div>
            <div className="stat-card">
                <div className="stat-label">{isEn ? 'Power Draw' : 'Spotřeba (TDP)'}</div>
                <div className="stat-val">{cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span></div>
            </div>
        </section>

        {/* INTERNAL LINKS / SILOING */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeftColor: vendorColor }}>
            <Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/cpu-performance/${safeSlug}` : `/cpu-performance/${safeSlug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full technical specifications and benchmarks.' : 'Kompletní specifikace a syntetické testy.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
              <a href={isEn ? `/en/cpuvs` : `/cpuvs`} className="deep-link-card">
                  <Swords size={32} color="#a855f7" />
                  <div>
                      <h3>{isEn ? 'CPU VS Engine' : 'Srovnávač CPU'}</h3>
                      <p>{isEn ? 'Compare this CPU against any other.' : 'Porovnejte tento procesor s konkurencí.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
          </div>
        </section>

        {/* SPECIFICATIONS TABLE */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <LayoutList size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div className="table-wrapper">
              {[
               { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', val: (cpu?.cores && cpu?.threads) ? `${cpu.cores} / ${cpu.threads}` : '-' },
               { label: isEn ? 'BASE CLOCK' : 'ZÁKLADNÍ TAKT', val: cpu?.base_clock_mhz ? `${cpu.base_clock_mhz} MHz` : '-' },
               { label: 'BOOST CLOCK', val: cpu?.boost_clock_mhz ? `${cpu.boost_clock_mhz} MHz` : '-' },
               { label: 'L3 CACHE', val: cpu?.l3_cache_mb ? `${cpu.l3_cache_mb} MB` : '-' },
               { label: 'TDP (SPOTŘEBA)', val: cpu?.tdp_w ? `${cpu.tdp_w} W` : '-' },
               { label: isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA', val: cpu?.architecture ?? '-' }
              ].map((row, i) => (
               <div key={i} className="spec-row-style" style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <div className="table-label" style={{ textAlign: 'left', flex: 1 }}>{row.label}</div>
                 <div style={{ color: '#fff', fontWeight: '950', fontSize: '18px', textAlign: 'right', flex: 1 }}>{row.val}</div>
               </div>
              ))}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .stat-label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
        .stat-val { font-size: 32px; font-weight: 950; }
        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
        .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; transition: 0.3s; }
        .deep-link-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
      `}} />
    </div>
  );
}
