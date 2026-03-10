import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Swords,
  CheckCircle2,
  Database,
  ArrowRight,
  Monitor,
  Zap
} from 'lucide-react';

/**
 * GURU GPU PERFORMANCE ENGINE V1.5 (FINAL SLUG FIX)
 * Cesta: src/app/gpu-performance/[slug]/page.js
 * 🛡️ FIX 1: Sjednocen parametr na [slug] (opravuje chybu "GPU NOT FOUND").
 * 🛡️ FIX 2: Implementován 3-Tier vyhledávací systém (imunní vůči překlepům).
 * 🛡️ FIX 3: Revalidate 0 + no-store = 100% bypass cache.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO GPU
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  // TIER 1: Exact match
  try {
      const url1 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  // TIER 2: Substring match
  try {
      const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${gpuSlug}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  // TIER 3: Tokenized AND match
  try {
      const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  const { slug } = params;
  const isEn = slug.startsWith('en-');
  const cleanSlug = slug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${gpu.name} Performance, Specs & Benchmarks | The Hardware Guru`
      : `${gpu.name} Výkon, Parametry a Benchmarky | The Hardware Guru`,
    description: isEn
      ? `Detailed technical specifications, VRAM, clock speeds and performance benchmarks for ${gpu.name}.`
      : `Detailní technické specifikace, kapacita VRAM, takty a výkonnostní benchmarky pro grafickou kartu ${gpu.name}.`,
    alternates: {
      canonical: `https://thehardwareguru.cz/gpu-performance/${gpu.slug || cleanSlug}`,
      languages: {
        'en': `https://thehardwareguru.cz/en/gpu-performance/${gpu.slug || cleanSlug}`,
        'cs': `https://thehardwareguru.cz/gpu-performance/${gpu.slug || cleanSlug}`
      }
    }
  };
}

export default async function GpuPerformancePage({ params }) {
  const { slug } = params;
  const isEn = slug.startsWith('en-');
  const cleanSlug = slug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const vendorColor = getVendorColor(gpu.vendor);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${gpu.slug || cleanSlug}` : `/gpu/${gpu.slug || cleanSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO GPU PROFILE' : 'ZPĚT NA PROFIL'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#66fcf1', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', padding: '6px 20px', border: '1px solid rgba(102, 252, 241, 0.3)', borderRadius: '50px', background: 'rgba(102, 252, 241, 0.05)' }}>
            <Activity size={16} /> GURU PERFORMANCE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            <span style={{ color: vendorColor }}>{normalizeName(gpu.name)}</span> <br/>
            {isEn ? 'SPECS & PERFORMANCE' : 'VÝKON A PARAMETRY'}
          </h1>
        </header>

        {/* 🚀 HIGHLIGHT STATS */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Boost Clock' : 'Boost Takt'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {gpu.boost_clock_mhz ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>MHz</span>
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', borderTop: '6px solid #66fcf1', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 20px 40px rgba(102, 252, 241, 0.15)' }}>
                <div style={{ color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Zap size={16} /> {isEn ? 'Performance Index' : 'Index Výkonu'}
                </div>
                <div style={{ fontSize: '55px', fontWeight: '950', color: '#fff', lineHeight: '1' }}>
                    {gpu.performance_index ?? 'N/A'}
                </div>
            </div>
            
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div style={{ color: vendorColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                    {isEn ? 'Power Draw' : 'Spotřeba (TDP)'}
                </div>
                <div style={{ fontSize: '40px', fontWeight: '950', color: '#fff' }}>
                    {gpu.tdp_w ?? '-'} <span style={{ fontSize: '16px', color: '#6b7280' }}>W</span>
                </div>
            </div>
        </section>

        {/* 🚀 TECHNICKÉ SPECIFIKACE */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={28} /> {isEn ? 'TECHNICAL SPECIFICATIONS' : 'TECHNICKÉ SPECIFIKACE'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Video Memory' : 'Video Paměť'}</div>
                  <div className="res-val" style={{ color: '#66fcf1' }}>{gpu.vram_gb ?? '-'} GB</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Memory Bus' : 'Paměťová Sběrnice'}</div>
                  <div className="res-val">{gpu.memory_bus ?? '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Architecture' : 'Architektura'}</div>
                  <div className="res-val">{gpu.architecture ?? '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Release Year' : 'Rok Vydání'}</div>
                  <div className="res-val">{gpu.release_date ? new Date(gpu.release_date).getFullYear() : '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'Vendor' : 'Výrobce'}</div>
                  <div className="res-val" style={{ color: vendorColor }}>{gpu.vendor ?? '-'}</div>
              </div>
              <div className="res-card">
                  <div className="res-label">{isEn ? 'MSRP Price' : 'Zaváděcí Cena'}</div>
                  <div className="res-val" style={{ color: '#10b981' }}>{gpu.release_price_usd ? `$${gpu.release_price_usd}` : '-'}</div>
              </div>
          </div>
        </section>

        {/* 🚀 CROSS-LINK TO VS ENGINE */}
        <section style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ color: '#9ca3af', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {isEn ? 'Want more data? Compare this GPU' : 'Chcete více dat? Porovnejte tuto grafiku'}
            </div>
            <a href={isEn ? "/en/gpuvs" : "/gpuvs"} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 40px', background: 'linear-gradient(135deg, #66fcf1 0%, #45a29e 100%)', color: '#0b0c10', borderRadius: '16px', fontWeight: '950', fontSize: '15px', textDecoration: 'none', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(102, 252, 241, 0.3)', transition: '0.3s' }}>
                <Swords size={20} /> {isEn ? 'Launch GPU VS Engine' : 'Spustit GPU VS Engine'} <ArrowRight size={18} />
            </a>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: 0.3s; }
        .res-card:hover { transform: translateY(-5px); border-color: rgba(102, 252, 241, 0.3); }
        .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 26px; font-weight: 950; color: #fff; }
      `}} />
    </div>
  );
}
