import React from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Database, 
  Gamepad2, 
  ArrowRight, 
  ExternalLink,
  Activity,
  CheckCircle2
} from 'lucide-react';

/**
 * GURU CPU ENGINE - DETAIL PROCESORU V1.0
 * Cesta: src/app/cpu/[slug]/page.js
 * 🛡️ ARCH: 3-Tier Slug Lookup, CZ/EN podpora, Rozcestník pro dané CPU.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO CPU
const findCpuBySlug = async (cpuSlug) => {
  if (!supabaseUrl || !cpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  // TIER 1: Exact match
  try {
      const url1 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${cpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  // TIER 2: Substring match
  try {
      const url2 = `${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${cpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  // TIER 3: Tokenized AND match
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
      : `Vše co potřebujete vědět o procesoru ${cpu.name}. Detailní specifikace, herní benchmarky a analýza výkonu.`
  };
}

export default async function CpuDetailPage({ params }) {
  const { slug: rawSlug } = params;
  const isEn = rawSlug.startsWith('en-');
  const cpuSlug = rawSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps;
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';
  
  // Seznam her pro dynamické prolinkování do sekce FPS
  const gamesList = ['cyberpunk-2077', 'warzone', 'starfield'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU BATTLES' : 'ZPĚT NA CPU DUELY'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Cpu size={16} /> {isEn ? 'CPU PROFILE' : 'PROFIL PROCESORU'}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{cpu.vendor}</span> <br/>
            <span style={{ color: '#f59e0b', textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>{normalizeName(cpu.name)}</span>
          </h1>
          <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>
             {cpu.cores} Cores • {cpu.threads} Threads • {cpu.architecture}
          </div>
        </header>

        {/* 🚀 QUICK STATS HERO */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Boost Clock' : 'Boost Takt'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {cpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    Cinebench R23
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {cinebenchScore} <span style={{ fontSize: '16px', color: '#6b7280' }}>PTS</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Power Draw' : 'Spotřeba (TDP)'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {cpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span>
                </div>
            </div>
        </section>

        {/* 🚀 DEEP DIVE LINKS (Rozcestník) */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              
              <a href={isEn ? `/en/cpu-performance/${cpu.slug}` : `/cpu-performance/${cpu.slug}`} className="deep-link-card">
                  <Activity size={32} color="#f59e0b" />
                  <div>
                      <h3>{isEn ? 'Performance & Specs' : 'Výkon a Parametry'}</h3>
                      <p>{isEn ? 'Full technical specifications and synthetic benchmarks.' : 'Kompletní technické specifikace a syntetické testy.'}</p>
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

          </div>
        </section>

        {/* 🚀 GAMING BENCHMARKS LINKS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Gamepad2 size={28} /> {isEn ? 'GAMING BENCHMARKS' : 'HERNÍ BENCHMARK TESTY'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {gamesList.map((game) => (
                  <a key={game} href={isEn ? `/en/cpu-fps/${cpu.slug}/${game}` : `/cpu-fps/${cpu.slug}/${game}`} className="game-link-card">
                      <ExternalLink size={16} color="#f59e0b" /> 
                      <span style={{ fontWeight: '900', textTransform: 'uppercase' }}>{game.replace(/-/g, ' ')}</span> FPS
                  </a>
              ))}
          </div>
        </section>

        {/* 🚀 VS ENGINE LAUNCHER */}
        <section style={{ textAlign: 'center', marginTop: '80px', padding: '50px', background: 'rgba(245,158,11,0.05)', borderRadius: '30px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '950', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
              {isEn ? 'Thinking about an upgrade?' : 'Zvažujete upgrade?'}
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '30px', fontSize: '1.1rem' }}>
              {isEn ? 'Compare this CPU with any other processor in our database.' : 'Porovnejte tento procesor s jakýmkoliv jiným v naší databázi.'}
            </p>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#fff', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)' }}>
                <Swords size={20} /> {isEn ? 'Launch CPU VS Engine' : 'Spustit CPU VS Engine'}
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        
        .deep-link-card { display: flex; align-items: center; gap: 20px; background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #fff; transition: 0.3s; position: relative; overflow: hidden; }
        .deep-link-card h3 { margin: 0 0 5px 0; font-size: 1.2rem; font-weight: 950; text-transform: uppercase; }
        .deep-link-card p { margin: 0; color: #9ca3af; font-size: 0.9rem; }
        .deep-link-card .link-arrow { position: absolute; right: 30px; color: #4b5563; transition: 0.3s; }
        .deep-link-card:hover { border-color: rgba(245, 158, 11, 0.5); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(245, 158, 11, 0.1); }
        .deep-link-card:hover .link-arrow { color: #f59e0b; transform: translateX(5px); }

        .game-link-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; color: #d1d5db; text-decoration: none; transition: 0.3s; }
        .game-link-card:hover { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: #fff; transform: translateY(-3px); }
      `}} />
    </div>
  );
}
