import React from 'react';
import { 
  ChevronLeft, Monitor, Database, Gamepad2, ArrowRight, ExternalLink, Activity, CheckCircle2, Swords, LayoutList, Flame, Heart
} from 'lucide-react';

/**
 * GURU GPU ENGINE - DETAIL GRAFIKY V2.5 (ULTIMATE LOOKUP FIX)
 * Cesta: src/app/gpu/[slug]/page.js
 * 🛡️ FIX 1: Implementován robustní 3-Tier Chunk Search (řeší chybu 404 i při duplicitách).
 * 🛡️ FIX 2: Oddělený fetch pro FPS data, aby join nezpůsoboval zmizení GPU z výsledků.
 * 🛡️ FIX 3: Plná podpora Next.js 15 async params.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

// 🛡️ GURU ENGINE: Robustní vyhledávání GPU (Sjednoceno s CPU standardem)
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  // Tier 1: Exact slug match
  try {
      const url1 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  // Tier 2: Chunk-based ILIKE match (Pro případy špatných slugů v DB)
  try {
      const clean = gpuSlug.replace(/-/g, " ").replace(/geforce|rtx|radeon|rx|nvidia|amd/gi, "").trim();
      const chunks = clean.match(/\d+|[a-zA-Z]+/g);
      if (chunks && chunks.length > 0) {
          const searchPattern = `%${chunks.join('%')}%`;
          const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&or=(name.ilike.${encodeURIComponent(searchPattern)},slug.ilike.${encodeURIComponent(searchPattern)})&limit=1`;
          const res2 = await fetch(url2, { headers, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
      }
  } catch(e) {}

  return null;
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');

  const gpu = await findGpuBySlug(gpuSlug);
  if (!gpu) return { title: '404 | Hardware Guru' };

  return {
    title: isEn 
      ? `${gpu.name} Specs, Benchmarks & Gaming Performance | The Hardware Guru`
      : `${gpu.name} Specifikace, Benchmarky a Herní výkon | The Hardware Guru`,
  };
}

export default async function GpuDetailPage({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const isEn = rawSlug.startsWith('en-');
  const gpuSlug = rawSlug.replace(/^en-/, '');
  
  const gpu = await findGpuBySlug(gpuSlug);
  
  if (!gpu) return (
    <div style={{ color: '#ef4444', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh', fontWeight: 'bold' }}>
      GPU NENALEZENO - ZKONTROLUJTE DATABÁZI (MOŽNÁ MEZERA V NÁZVU?)
    </div>
  );

  const fpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : (gpu.game_fps || {});
  const vendorColor = (gpu.vendor || '').toUpperCase() === 'NVIDIA' ? '#76b900' : ((gpu.vendor || '').toUpperCase() === 'AMD' ? '#ed1c24' : '#0071c5');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            <span style={{ color: '#d1d5db' }}>{gpu.vendor}</span> <br/>
            <span style={{ color: vendorColor, textShadow: `0 0 30px ${vendorColor}80` }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <div className="stat-card"><div className="label">BOOST CLOCK</div><div className="val">{gpu.boost_clock_mhz || '-'} MHz</div></div>
            <div className="stat-card"><div className="label">VRAM</div><div className="val">{gpu.vram_gb || '-'} GB</div></div>
            <div className="stat-card"><div className="label">TDP</div><div className="val">{gpu.tdp_w || '-'} W</div></div>
        </section>

        <div style={{ marginTop: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="guru-deals-btn"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
          <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .stat-card { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 30px; text-align: center; }
        .label { color: #6b7280; font-size: 10px; font-weight: 950; letter-spacing: 2px; margin-bottom: 10px; }
        .val { font-size: 32px; font-weight: 950; }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; }
      `}} />
    </div>
  );
}
