import React from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Database, 
  Gamepad2, 
  ArrowRight, 
  ExternalLink,
  Activity,
  CheckCircle2,
  Swords,
  LayoutList
} from 'lucide-react';

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V1.1 (MAIN HUB)
 * Cesta: src/app/cpu/[slug]/page.js
 * 🛡️ FIX 1: Hlavní rozcestník procesoru (na který odkazují Deep Dive linky).
 * 🛡️ FIX 2: Vložena nová dynamická tabulka specifikací s čistými fallbacky.
 * 🛡️ FIX 3: Revalidate 0 pro okamžité propisování změn z DB.
 */

export const runtime = "nodejs";
export const revalidate = 0; // Okamžitý refresh bez cache!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO CPU
const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const url1 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = cpuSlug.replace(/-/g, ' ').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${cpu.name} Specs, Benchmarks & Gaming Performance | The Hardware Guru`
      : `${cpu.name} Specifikace, Benchmarky a Herní výkon | The Hardware Guru`,
    description: isEn
      ? `Everything you need to know about ${cpu.name}. Detailed specifications, gaming benchmarks, and performance analysis.`
      : `Vše co potřebujete vědět o procesoru ${cpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`,
    alternates: {
      canonical: `https://www.thehardwareguru.cz/cpu/${cpu.slug}`,
      languages: {
        'en': `https://www.thehardwareguru.cz/en/cpu/${cpu.slug}`,
        'cs': `https://www.thehardwareguru.cz/cpu/${cpu.slug}`
      }
    }
  };
}

export default async function CpuDetailPage({ params }) {
  const { slug: rawSlug } = params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : (cpu.cpu_game_fps || {});
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';
  
  // 🚀 GURU: Dynamické načítání her z DB pro FPS odkazy
  const availableGames = Object.keys(fpsData || {})
    .filter(k => k !== 'cpu_id' && k !== 'id' && !k.includes('cinebench') && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'cs2'];

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#f59e0b');
  };
  const vendorColor = getVendorColor(cpu.vendor);

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

        {/* 🚀 RYCHLÝ PŘEHLED (HERO STATS) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Boost Clock' : 'Boost Takt'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    Cinebench R23
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Power Draw' : 'Spotřeba (TDP)'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span>
                </div>
            </div>
        </section>

        {/* 🚀 DEEP DIVE ROZCESTNÍK */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/cpu-performance/${cpu.slug}` : `/cpu-performance/${cpu.slug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full technical specifications and benchmarks.' : 'Kompletní specifikace a syntetické testy.'}</p>
                  </div>
                  <ArrowRight size={20} className="link-arrow" />
              </a>
              <a href={isEn ? `/en/cpu-recommend/${cpu.slug}` : `/cpu-recommend/${cpu.slug}`} className="deep-link-card">
                  <CheckCircle2 size={32} color="#10b981" />
                  <div>
                      <h3>{isEn ? 'Guru Verdict: Buy?' : 'Verdikt: Koupit?'}</h3>
                      <p>{isEn ? 'Is it worth your money? Value analysis.' : 'Vyplatí se do něj investovat? Analýza cena/výkon.'}</p>
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

        {/* 🚀 TABULKA SPECIFIKACÍ V GURU STYLU */}
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
               { label: isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA', val: cpu?.architecture ?? '-' },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', val: cpu?.release_date ? new Date(cpu.release_date).getFullYear() : '-' },
               { label: isEn ? 'MSRP PRICE' : 'ZAVÁDĚCÍ CENA', val: cpu?.release_price_usd ? `$${cpu.release_price_usd}` : '-' }
             ].map((row, i) => (
               <div key={i} className="spec-row-style" style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <div className="table-label" style={{ textAlign: 'left', flex: 1 }}>{row.label}</div>
                 <div style={{ color: '#fff', fontWeight: '950', fontSize: '18px', textAlign: 'right', flex: 1 }}>{row.val}</div>
               </div>
             ))}
          </div>
        </section>

        {/* 🚀 HERNÍ BENCHMARK TESTY */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: vendorColor }}>
            <Gamepad2 size={28} /> {isEn ? 'GAMING BENCHMARKS' : 'HERNÍ BENCHMARK TESTY'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {gamesList.map((game) => (
                  <a key={game} href={isEn ? `/en/cpu-fps/${cpu.slug}/${game}` : `/cpu-fps/${cpu.slug}/${game}`} className="game-link-card">
                      <ExternalLink size={16} color={vendorColor} /> 
                      <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>{game.replace(/-/g, ' ')}</span> FPS
                  </a>
              ))}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        
        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.85rem; line-height: 1.4; }
        .deep-link-card .link-arrow { position: absolute; right: 25px; color: #4b5563; transition: 0.3s; }
        .deep-link-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.8); }
        .deep-link-card:hover .link-arrow { color: #fff; transform: translateX(5px); }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-row-style:hover { background: rgba(255,255,255,0.02); }
        .table-label { font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        
        .game-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; color: #d1d5db; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .game-link-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); color: #fff; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.6); }

        @media (max-width: 768px) {
          .deep-link-card { padding: 20px; flex-direction: column; text-align: center; gap: 15px; }
          .deep-link-card .link-arrow { display: none; }
        }
      `}} />
    </div>
  );
}
