import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Swords,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; // 🔥 PŘIDÁNO: Import Heureka tlačítek

/**
 * GURU CPU PERFORMANCE ENGINE V2.3 (HEUREKA CTA UPDATE)
 * 🚀 CÍL: Přesun TOP banneru "Above Fold", přidání Sticky Bottom Anchoru, eliminace hluchých míst + Heureka konverze.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

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
  const p = await params;
  const rawCpuSlug = p?.cpu || '';
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');

  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${cpu.name} Performance, Specs & Benchmarks | The Hardware Guru`
      : `${cpu.name} Výkon, Parametry a Benchmarky | The Hardware Guru`,
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
  const p = await params;
  const rawCpuSlug = p?.cpu || '';
  const isEn = rawCpuSlug.startsWith('en-');
  const cpuSlug = rawCpuSlug.replace(/^en-/, '');
  
  const cpu = await findCpuBySlug(cpuSlug);
  if (!cpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>CPU NENALEZENO</div>;

  const fpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps;
  const cinebenchScore = fpsData?.cinebench_r23_multi || 'N/A';

  return (
    <div className="guru-performance-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/cpu/${cpuSlug}` : `/cpu/${cpuSlug}`} className="guru-back-btn">
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
          <div className="analysis-badge">
            <Activity size={16} /> GURU PERFORMANCE ANALYSIS
          </div>
          <h1 className="main-title" style={{ fontSize: 'clamp(1.8rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: '#f59e0b' }}>{normalizeName(cpu.name)}</span> <br/>
            {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
          </h1>
        </header>

        <section style={{ marginBottom: '60px' }}>
            <div className="benchmark-result-box" style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(245, 158, 11, 0.2)', borderLeft: '8px solid #f59e0b', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>
                    {isEn ? 'Cinebench R23 Multi-Core Score' : 'Cinebench R23 Multi-Core Skóre'}
                </div>
                <div style={{ fontSize: 'clamp(50px, 12vw, 80px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0', textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>
                    {cinebenchScore} <span style={{ fontSize: '24px', color: '#f59e0b' }}>PTS</span>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(245, 158, 11, 0.3)', marginTop: '10px' }}>
                    <CheckCircle2 size={18} /> {isEn ? 'Synthetic Benchmark' : 'Syntetický Benchmark'}
                </div>
            </div>
        </section>

        {/* 🔥 PŘIDÁNO: Vložení Heureka tlačítek (bezpečně pod benchmarkem) 🔥 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
            <HeurekaButtons isEn={isEn} />
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div className="specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card"><div className="res-label">{isEn ? 'Cores / Threads' : 'Jádra / Vlákna'}</div><div className="res-val">{cpu.cores ?? '-'} / {cpu.threads ?? '-'}</div></div>
              <div className="res-card"><div className="res-label">Base Clock</div><div className="res-val" style={{ color: '#f59e0b' }}>{cpu.base_clock_mhz ?? '-'} MHz</div></div>
              <div className="res-card"><div className="res-label">Boost Clock</div><div className="res-val" style={{ color: '#f59e0b' }}>{cpu.boost_clock_mhz ?? '-'} MHz</div></div>
              <div className="res-card"><div className="res-label">L3 Cache</div><div className="res-val">{cpu.l3_cache_mb ?? '-'} MB</div></div>
              <div className="res-card"><div className="res-label">TDP (Power)</div><div className="res-val" style={{ color: '#ef4444' }}>{cpu.tdp_w ?? '-'} W</div></div>
              <div className="res-card"><div className="res-label">Architecture</div><div className="res-val">{cpu.architecture ?? '-'}</div></div>
          </div>
        </section>

        <section style={{ textAlign: 'center', marginTop: '60px' }}>
            <a href={isEn ? "/en/cpuvs" : "/cpuvs"} className="guru-battle-btn">
                <Swords size={20} /> {isEn ? 'CPU VS ENGINE' : 'CPU VS ENGINE'} <ArrowRight size={18} />
            </a>
        </section>

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
        .analysis-badge { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(245,158,11,0.3); border-radius: 50px; background: rgba(245,158,11,0.05); margin-bottom: 20px; }
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 24px; font-weight: 950; color: #fff; }
        .guru-battle-btn { display: inline-flex; align-items: center; gap: 12px; padding: 18px 40px; background: #f59e0b; color: #fff; border-radius: 16px; font-weight: 950; font-size: 15px; text-decoration: none; text-transform: uppercase; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-battle-btn:hover { background: #ea580c; transform: translateY(-3px); }

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
            .guru-performance-wrapper { padding-top: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .main-title { font-size: 1.6rem !important; }
            .benchmark-result-box { padding: 30px 20px !important; }
            .specs-grid { grid-template-columns: 1fr !important; gap: 15px; }
            .guru-battle-btn { width: 100%; justify-content: center; }
            main { padding: 0 15px !important; }
        }
      `}} />
    </div>
  );
}
