import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Swords,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';

/**
 * GURU CPU PERFORMANCE ENGINE V1.0
 * Cesta: src/app/cpu-performance/[cpu]/page.js
 * 🛡️ ARCH: 3-Tier Slug Lookup, CZ/EN, Detailní specifikace procesoru.
 */

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
  const { cpu: rawCpuSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${cpu.name} Performance, Specs & Benchmarks | The Hardware Guru`
      : `${cpu.name} Výkon, Parametry a Benchmarky | The Hardware Guru`,
    description: isEn
      ? `Detailed technical specifications, core counts, clock speeds and performance benchmarks for ${cpu.name}.`
      : `Detailní technické specifikace, počet jader, takty a výkonnostní benchmarky pro procesor ${cpu.name}.`,
    alternates: {
      canonical: `https://thehardwareguru.cz/cpu-performance/${cpu.slug}`,
      languages: {
        'en': `https://thehardwareguru.cz/en/cpu-performance/${cpu.slug}`,
        'cs': `https://thehardwareguru.cz/cpu-performance/${cpu.slug}`
      }
    }
  };
}

export default async function CpuPerformancePage({ params }) {
  const { cpu: rawCpuSlug } = params;
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps;
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO CPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.05)' }}>
            <Activity size={16} /> GURU PERFORMANCE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}</span> <br/>
            {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderLeft: '8px solid #f59e0b', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'Cinebench R23 Multi-Core Score' : 'Cinebench R23 Multi-Core Skóre'}
                </div>
                <div style={{ fontSize: '80px', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>
                    {cinebenchScore} <span style={{ fontSize: '24px', color: '#f59e0b' }}>PTS</span>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(245,158,11,0.3)', marginTop: '10px' }}>
                    <CheckCircle2 size={18} /> {isEn ? 'Synthetic Benchmark' : 'Syntetický Benchmark'}
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Cores / Threads' : 'Jádra / Vlákna'}</div>
                  <div className="res-val">{cpu.cores ?? '-'} / {cpu.threads ?? '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Base Clock' : 'Základní Takt'}</div>
                  <div className="res-val" style={{ color: '#f59e0b' }}>{cpu.base_clock_mhz ?? '-'} MHz</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Boost Clock' : 'Boost Takt'}</div>
                  <div className="res-val" style={{ color: '#f59e0b' }}>{cpu.boost_clock_mhz ?? '-'} MHz</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'L3 Cache' : 'L3 Cache'}</div>
                  <div className="res-val">{cpu.l3_cache_mb ?? '-'} MB</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'TDP (Power)' : 'TDP (Spotřeba)'}</div>
                  <div className="res-val" style={{ color: '#ef4444' }}>{cpu.tdp_w ?? '-'} W</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Architecture' : 'Architektura'}</div>
                  <div className="res-val">{cpu.architecture ?? '-'}</div>
              </div>
          </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Want more data? Compare this CPU' : 'Chcete více dat? Porovnejte tento procesor'}
            </div>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', color: '#fff', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)' }}>
                <Swords size={20} /> {isEn ? 'Launch CPU VS Engine' : 'Spustit CPU VS Engine'} <ArrowRight size={18} />
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 26px; font-weight: 950; color: #fff; }
      `}} />
    </div>
  );
}
