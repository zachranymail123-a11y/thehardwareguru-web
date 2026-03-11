import React, { cache } from 'react';
import Script from 'next/script';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V6.0 (GAME-SPECIFIC & CENTERED UI)
 * 🚀 STATUS: LIVE - AdSense ID ca-pub-5468223287024993
 * 🛡️ NEW: Support for /...-with-...-in-[game] slugs.
 * 🛡️ FIX: Centered layout for Hero sections and specs grid.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

// 🛡️ GURU ENGINE: Neprůstřelné vyhledávání (3-TIER)
const findHw = async (table, slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data = await res1.json(); if (data?.length) return data[0]; }
      const clean = slugPart.replace(/-/g, ' ').replace(/ryzen|core|intel|amd|geforce|rtx|radeon|rx/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res2 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); return data2?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

const getAnalysisData = cache(async (slug) => {
  const cleanSlug = slug.replace(/^en-/, '');
  // Detekce hry v URL: "...-with-...-in-cyberpunk-2077"
  const gamePart = cleanSlug.split('-in-');
  const hwPart = gamePart[0].split('-with-');
  
  if (hwPart.length !== 2) return null;
  
  const [cpu, gpu] = await Promise.all([findHw('cpus', hwPart[0]), findHw('gpus', hwPart[1])]);
  const gameSlug = gamePart[1] || null;
  
  return { cpu, gpu, gameSlug };
});

const AdSpace = ({ slot, height = '90px' }) => (
    <div className="ad-wrapper" style={{ width: '100%', margin: '30px auto', minHeight: height, textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>REKLAMA / SPONZOROVANÉ</div>
        <ins className="adsbygoogle" style={{ display: 'block', minHeight: height }} data-ad-client="ca-pub-5468223287024993" data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
);

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Bottleneck Analysis | Hardware Guru' };

  const gameName = data.gameSlug ? data.gameSlug.replace(/-/g, ' ').toUpperCase() : '';
  const title = isEn 
    ? `${data.cpu.name} + ${data.gpu.name} ${gameName} Bottleneck Test`
    : `${data.cpu.name} + ${data.gpu.name} – Bottleneck a FPS v ${gameName || 'hraní'}`;

  return { title: `${title} | Hardware Guru` };
}

export default async function BottleneckPage({ params, isEn: forcedIsEn }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = forcedIsEn || rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);

  if (!data?.cpu || !data?.gpu) return <div className="error-screen">COMPONENT NOT FOUND</div>;

  const { cpu, gpu, gameSlug } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  let bottleneckScore = cpuPower < gpuPower * 0.75 
    ? Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100)
    : (gpuPower < cpuPower * 0.6 ? Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100) : 0);

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');
  const recommendedPsu = Math.ceil(((Number(cpu.tdp_w) || 65) + (Number(gpu.tdp_w) || 200)) * 1.6 / 50) * 50;

  return (
    <div className="guru-page-container">
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous" strategy="afterInteractive" />

      <main style={{ maxWidth: '1250px', margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 🚀 CENTERED HERO SECTION */}
        <header style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
          <div className="radar-badge">
            <Gauge size={16} /> GURU {gameSlug ? gameSlug.replace(/-/g, ' ').toUpperCase() : 'SYSTEM'} RADAR
          </div>
          <h1 className="hero-title">
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.5, fontSize: '0.5em', display: 'block', margin: '10px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <AdSpace slot="1234567890" /> 

        {/* 🚀 CENTERED GAUGE */}
        <section className="glass-card main-hero" style={{ width: '100%', maxWidth: '800px', margin: '0 auto 60px' }}>
            <div className="hero-label">{isEn ? 'Calculated Pairing Bottleneck' : 'Vypočítaný bottleneck sestavy'}</div>
            <div className="score-text" style={{ color: statusColor, textShadow: `0 0 50px ${statusColor}40` }}>{bottleneckScore}%</div>
            <div className="status-badge" style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                {bottleneckScore < 15 ? (isEn ? 'PERFECT MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
            </div>
        </section>

        {/* 🚀 CENTERED SPECS GRID */}
        <section style={{ width: '100%', marginBottom: '60px' }}>
          <h2 className="section-h2-center"><Database size={28} /> {isEn ? 'GURU BUILD RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}</h2>
          <div className="specs-grid">
              <div className="glass-card spec-item">
                  <PlugZap size={32} color="#f59e0b" />
                  <div className="spec-label">{isEn ? 'PSU' : 'ZDROJ'}</div>
                  <div className="spec-val">{recommendedPsu}W</div>
              </div>
              <div className="glass-card spec-item">
                  <Layers size={32} color="#66fcf1" />
                  <div className="spec-label">{isEn ? 'CHIPSET' : 'ČIPSET'}</div>
                  <div className="spec-val">{(cpu.vendor === 'AMD' && cpu.name.includes('5000')) ? 'B550' : 'B650 / B760'}</div>
              </div>
              <div className="glass-card spec-item">
                  <Database size={32} color="#a855f7" />
                  <div className="spec-label">RAM</div>
                  <div className="spec-val">{(cpu.vendor === 'AMD' && cpu.name.includes('5000')) ? 'DDR4 3600' : 'DDR5 6000'}</div>
              </div>
          </div>
        </section>

        <AdSpace slot="0987654321" height="250px" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', justifyContent: 'center' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="btn-deals"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA TOP CENY'}</a>
            <a href="/support" className="btn-support"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-page-container { min-height: 100vh; background: #0a0b0d; background-image: url("/bg-guru.png"); background-size: cover; background-attachment: fixed; padding-top: 120px; padding-bottom: 100px; color: #fff; }
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; fontSize: 11px; fontWeight: 950; textTransform: uppercase; letterSpacing: 3px; marginBottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .hero-title { font-size: clamp(2.2rem, 6vw, 4rem); font-weight: 950; text-transform: uppercase; line-height: 1.1; margin: 0; }
        .glass-card { background: rgba(15,17,21,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; box-shadow: 0 30px 100px rgba(0,0,0,0.8); }
        .main-hero { padding: 60px 40px; text-align: center; }
        .hero-label { color: #66fcf1; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; }
        .score-text { font-size: clamp(80px, 15vw, 130px); font-weight: 950; line-height: 1; margin: 10px 0; }
        .status-badge { padding: 12px 40px; border-radius: 50px; display: inline-block; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; }
        .section-h2-center { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 40px; text-transform: uppercase; text-align: center; display: flex; align-items: center; justify-content: center; gap: 15px; }
        .specs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%; max-width: 1000px; }
        .spec-item { padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .spec-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; }
        .spec-val { font-size: 32px; font-weight: 950; color: #fff; }
        .btn-deals, .btn-support { flex: 1; max-width: 350px; min-width: 280px; padding: 22px; border-radius: 20px; font-weight: 950; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; text-transform: uppercase; transition: 0.3s; text-decoration: none; }
        .btn-deals { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .btn-support { background: #eab308; color: #000; }
        .btn-deals:hover, .btn-support:hover { transform: scale(1.03); }
        .error-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: #ef4444; font-weight: 950; }
      `}} />
    </div>
  );
}
