import React from 'react';
import { 
  ChevronLeft, 
  Activity, 
  Swords,
  CheckCircle2,
  Database,
  ArrowRight,
  Monitor,
  Zap,
  Flame,
  Heart,
  ExternalLink,
  BarChart3
} from 'lucide-react';

/**
 * GURU GPU PERFORMANCE ENGINE V2.6 (NEXT.JS 15 PROMISE FIX)
 * Cesta: src/app/gpu-performance/[slug]/page.js
 * 🛡️ FIX 1: 'params' je nyní Promise - přidán 'await params' (opravuje Server-side exception).
 * 🛡️ FIX 2: 3-Tier vyhledávač (Exact -> Substring -> Tokenized).
 * 🛡️ DESIGN: 1:1 s CPU verzí včetně CTA tlačítek.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }

      const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${gpuSlug}*&order=slug.asc`, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || resolvedParams?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

  return {
    title: isEn ? `${gpu.name} Performance & Benchmarks` : `${gpu.name} Výkon a Benchmarky`,
    alternates: {
      canonical: `https://thehardwareguru.cz/gpu-performance/${safeSlug}`,
      languages: { 'en': `https://thehardwareguru.cz/en/gpu-performance/${safeSlug}`, 'cs': `https://thehardwareguru.cz/gpu-performance/${safeSlug}` }
    }
  };
}

export default async function GpuPerformancePage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || resolvedParams?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const cleanSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(cleanSlug);
  if (!gpu) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>GPU NENALEZENO</div>;

  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : (gpu.game_fps || {});
  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#66fcf1');

  const availableGames = Object.keys(fpsData || {})
    .filter(k => k !== 'gpu_id' && k !== 'id' && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? `/en/gpu/${safeSlug}` : `/gpu/${safeSlug}`} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO PROFIL' : 'ZPĚT NA PROFIL'}
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

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(102, 252, 241, 0.2)', borderLeft: '8px solid #66fcf1', borderRadius: '24px', padding: '50px 40px', boxShadow: '0 30px 70px rgba(0,0,0,0.7)', textAlign: 'center' }}>
                <div style={{ color: '#66fcf1', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{isEn ? 'Gaming Performance Index' : 'Index herního výkonu'}</div>
                <div style={{ fontSize: 'clamp(60px, 12vw, 100px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '10px 0' }}>{gpu.performance_index ?? 'N/A'} <span style={{ fontSize: '24px', color: '#66fcf1' }}>PTS</span></div>
                <div style={{ background: 'rgba(102, 252, 241, 0.1)', color: '#66fcf1', padding: '10px 25px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '950', fontSize: '14px', border: '1px solid rgba(102, 252, 241, 0.3)' }}><CheckCircle2 size={18} /> {isEn ? 'Verified Benchmark' : 'Ověřený benchmark'}</div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2"><Database size={28} /> {isEn ? 'TECHNICAL SPECS' : 'TECHNICKÉ SPECIFIKACE'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="res-card"><div className="res-label">VRAM</div><div className="res-val" style={{ color: '#66fcf1' }}>{gpu.vram_gb ?? '-'} GB</div></div>
              <div className="res-card"><div className="res-label">{isEn ? 'BUS' : 'SBĚRNICE'}</div><div className="res-val">{gpu.memory_bus ?? '-'}</div></div>
              <div className="res-card"><div className="res-label">BOOST</div><div className="res-val" style={{ color: vendorColor }}>{gpu.boost_clock_mhz ?? '-'} MHz</div></div>
              <div className="res-card"><div className="res-label">TDP</div><div className="res-val" style={{ color: '#ef4444' }}>{gpu.tdp_w ?? '-'} W</div></div>
          </div>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #66fcf1; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .res-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; margin-bottom: 10px; }
        .res-val { font-size: 26px; font-weight: 950; color: #fff; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
      `}} />
    </div>
  );
}
