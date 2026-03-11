import React from 'react';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V14.3 (ROBUST LOOKUP FIX)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🚀 STATUS: LIVE - AdSense ID ca-pub-5468223287024993
 * 🛡️ FIX 1: Obnoven Tokenizovaný vyhledávač (Tier 3), který řeší "COMPONENT NOT FOUND".
 * 🛡️ FIX 2: Odstraněny závislosti na next/script pro stabilitu v Canvasu.
 * 🛡️ ARCH: Podpora unikátních stránek CPU + GPU + HRA + ROZLIŠENÍ.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');

// 🛡️ GURU ENGINE: 3-TIER BULLETPROOF LOOKUP
const findHw = async (table, slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      // TIER 1: Přesný slug match
      const url1 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      // TIER 2: Substring match na slug
      const url2 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=ilike.*${slugPart}*&limit=1`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      // TIER 3: Tokenized Search (Nejsilnější - rozbije slug na slova a hledá shodu v NAME)
      const clean = slugPart.replace(/-/g, ' ').replace(/ryzen|core|intel|amd|geforce|rtx|radeon|rx/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const url3 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&and=(${conditions})&limit=1`;
          const res3 = await fetch(url3, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); if (data3?.length) return data3[0]; }
      }

      // POSLEDNÍ POKUS: Absolutní fallback na slug bez joinu
      const resF = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (resF.ok) { const dataF = await resF.json(); if (dataF?.length) return dataF[0]; }
  } catch(e) { console.error("Database Lookup Error", e); }
  return null;
};

// 🛡️ GURU PARSER: Rozklad URL na atomy
const getAnalysisData = async (slug) => {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  
  // 1. Rozlišení (-at-)
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] || null; // 1080p, 1440p, 4k
  
  // 2. Hra (-in-)
  const gameParts = resParts[0].split('-in-');
  const gameSlug = gameParts[1] || null;
  
  // 3. HW (-with-)
  const hwParts = gameParts[0].split('-with-');
  if (hwParts.length !== 2) return null;
  
  const [cpu, gpu] = await Promise.all([findHw('cpus', hwParts[0]), findHw('gpus', hwParts[1])]);
  return { cpu, gpu, gameSlug, resolution };
};

const AdSpace = ({ slot, height = '90px' }) => (
    <div className="ad-wrapper" style={{ width: '100%', margin: '30px auto', minHeight: height, textAlign: 'center' }}>
        <div style={{ fontSize: '9px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>REKLAMA / SPONZOROVANÉ</div>
        <ins className="adsbygoogle"
             style={{ display: 'block', minHeight: height }}
             data-ad-client="ca-pub-5468223287024993"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
);

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analysis | Hardware Guru' };

  const gameLabel = data.gameSlug ? data.gameSlug.replace(/-/g, ' ').toUpperCase() : 'GAMING';
  const resLabel = data.resolution ? `at ${data.resolution.toUpperCase()}` : '';
  
  const title = isEn 
    ? `${data.cpu.name} + ${data.gpu.name} ${gameLabel} ${resLabel} Bottleneck & FPS`
    : `${data.cpu.name} + ${data.gpu.name} – Bottleneck a FPS v ${gameLabel} ${data.resolution ? `v ${data.resolution}` : ''}`;

  return { 
    title: `${title} | Hardware Guru`,
    alternates: {
        canonical: `https://thehardwareguru.cz/bottleneck/${rawSlug.replace(/^en-/, '')}`,
        languages: { 
            'en': `https://thehardwareguru.cz/en/bottleneck/${rawSlug.replace(/^en-/, '')}`,
            'cs': `https://thehardwareguru.cz/bottleneck/${rawSlug.replace(/^en-/, '')}`
        }
    }
  };
}

export default async function App({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);

  if (!data?.cpu || !data?.gpu) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontWeight: '950' }}>KOMPONENT NENÁJDENÝ</h2>
            <p style={{ color: '#6b7280', marginTop: '10px' }}>Systém nedokázal identifikovat zadaný hardware. Zkontrolujte prosím URL.</p>
            <a href="/" style={{ marginTop: '20px', display: 'inline-block', padding: '12px 25px', background: '#f59e0b', color: '#000', borderRadius: '12px', fontWeight: '950', textDecoration: 'none' }}>SPÄŤ NA ÚVOD</a>
        </div>
    </div>
  );

  const { cpu, gpu, gameSlug, resolution } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  const cpuName = (cpu.name || '').toUpperCase();
  const isAmd = (cpu.vendor || '').toUpperCase() === 'AMD';
  
  let bottleneckScore = cpuPower < gpuPower * 0.75 
    ? Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100)
    : (gpuPower < cpuPower * 0.6 ? Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100) : 0);

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');
  const recommendedPsu = Math.ceil(((Number(cpu.tdp_w) || 65) + (Number(gpu.tdp_w) || 200)) * 1.6 / 50) * 50;

  // 🛡️ GURU LOGIC: Čipsety a RAM dle zadání
  const chipsetLabel = (() => {
    if (isAmd) {
      if (cpuName.includes('9000') || cpuName.includes('7000')) return 'B850 / X870 / X870E';
      if (cpuName.includes('5000')) return 'X570 / B550 / A520';
      return 'B650 / B850';
    }
    return 'B760 / Z790';
  })();

  const ramLabel = (() => {
    if (isAmd && cpuName.includes('5000')) return 'DDR4 3600 MT/s';
    return 'DDR5 6000 MT/s';
  })();

  // 🚀 GURU FPS LOOKUP: Cyberpunk fallback
  const activeGame = gameSlug || 'cyberpunk-2077';
  const rawFps = gpu?.game_fps;
  const fpsData = Array.isArray(rawFps) ? rawFps[0] : (rawFps || {});
  const gameBase = activeGame.replace(/-/g, '_');
  
  const getFpsByRes = (res) => Number(
      fpsData[`${gameBase}_${res}`] || 
      fpsData[`${activeGame.replace(/-/g, '_')}_${res}`] ||
      0
  );

  const f1080 = getFpsByRes('1080p');
  const f1440 = getFpsByRes('1440p');
  const f4k = getFpsByRes('4k');
  const hasFps = f1080 > 0 || f1440 > 0 || f4k > 0;

  return (
    <div className="guru-page-container">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous"></script>

      <main style={{ maxWidth: '1250px', margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
          <div className="radar-badge">
            <Gauge size={16} /> GURU {activeGame.replace(/-/g, ' ').toUpperCase()} {resolution && `(${resolution.toUpperCase()})`} RADAR
          </div>
          <h1 className="hero-title">
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.5, fontSize: '0.45em', display: 'block', margin: '15px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <AdSpace slot="1234567890" /> 

        {/* 🚀 MAIN GAUGE CARD */}
        <section className="glass-card main-hero" style={{ width: '100%', maxWidth: '900px', margin: '0 auto 60px' }}>
            <div className="hero-label">{isEn ? 'Calculated System Bottleneck' : 'Vypočítaný bottleneck systému'}</div>
            <div className="score-text" style={{ color: statusColor, textShadow: `0 0 60px ${statusColor}50` }}>{bottleneckScore}%</div>
            
            {/* 🚀 FPS GRID - Highlights selected res */}
            {hasFps && (
                <div className="fps-resolutions-grid">
                    <div className={`fps-res-item ${resolution === '1080p' ? 'active-seo' : ''}`}>
                        <span className="res-tag">1080p Ultra</span>
                        <div className="res-fps">{f1080 || '--'} <span className="res-unit">FPS</span></div>
                    </div>
                    <div className={`fps-res-item featured ${resolution === '1440p' || (!resolution && hasFps) ? 'active-seo' : ''}`}>
                        <span className="res-tag">1440p High</span>
                        <div className="res-fps">{f1440 || '--'} <span className="res-unit">FPS</span></div>
                    </div>
                    <div className={`fps-res-item ${resolution === '4k' ? 'active-seo' : ''}`}>
                        <span className="res-tag">4K Native</span>
                        <div className="res-fps">{f4k || '--'} <span className="res-unit">FPS</span></div>
                    </div>
                </div>
            )}

            <div className="status-badge" style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40`, marginTop: '30px' }}>
                {bottleneckScore < 15 ? (isEn ? 'PERFECT MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
            </div>
        </section>

        {/* 🚀 RECOMMENDATIONS GRID */}
        <section style={{ width: '100%', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-h2">{isEn ? 'BUILD RECOMMENDATIONS' : 'DOPORUČENÍ PRE ZOSTAVU'}</h2>
          <div className="specs-grid">
              <div className="glass-card spec-item">
                  <PlugZap size={32} color="#f59e0b" />
                  <div className="spec-label">PSU</div>
                  <div className="spec-val">{recommendedPsu}W</div>
              </div>
              <div className="glass-card spec-item">
                  <Layers size={32} color="#66fcf1" />
                  <div className="spec-label">CHIPSET</div>
                  <div className="spec-val" style={{ fontSize: '20px' }}>{chipsetLabel}</div>
              </div>
              <div className="glass-card spec-item">
                  <Database size={32} color="#a855f7" />
                  <div className="spec-label">RAM</div>
                  <div className="spec-val" style={{ fontSize: '20px' }}>{ramLabel}</div>
              </div>
          </div>
        </section>

        <AdSpace slot="0987654321" height="250px" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', justifyContent: 'center', marginTop: '40px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="btn-deals"><Flame size={20} /> WATCH LIVE ON KICK</a>
            <a href="/support" className="btn-support"><Heart size={20} /> SUPPORT GURU</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-page-container { min-height: 100vh; background: #0a0b0d; background-image: url("/bg-guru.png"); background-size: cover; background-attachment: fixed; padding-top: 120px; padding-bottom: 100px; color: #fff; }
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .hero-title { font-size: clamp(2.2rem, 6vw, 4.5rem); font-weight: 950; text-transform: uppercase; line-height: 1.1; margin: 0; text-align: center; }
        .glass-card { background: rgba(15,17,21,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; box-shadow: 0 30px 100px rgba(0,0,0,0.8); transition: 0.3s; }
        .main-hero { padding: 80px 40px; text-align: center; }
        .hero-label { color: #6b7280; font-size: 13px; font-weight: 950; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px; }
        .score-text { font-size: clamp(90px, 18vw, 150px); font-weight: 950; line-height: 1; margin: 10px 0; }
        .status-badge { padding: 15px 45px; border-radius: 50px; display: inline-block; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; }
        
        .fps-resolutions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 700px; margin: 30px auto 0; }
        .fps-res-item { background: rgba(255,255,255,0.03); padding: 25px 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); transition: 0.4s; }
        .fps-res-item.featured { background: rgba(102, 252, 241, 0.05); border-color: rgba(102, 252, 241, 0.2); transform: scale(1.05); }
        .fps-res-item.active-seo { border: 2px solid #66fcf1; box-shadow: 0 0 30px rgba(102, 252, 241, 0.3); background: rgba(102, 252, 241, 0.1); }
        .res-tag { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
        .res-fps { font-size: 32px; font-weight: 950; color: #fff; }
        .res-unit { font-size: 14px; color: #66fcf1; }

        .specs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; width: 100%; max-width: 1100px; justify-content: center; margin: 0 auto; }
        .spec-item { padding: 45px 30px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .spec-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; }
        .spec-val { font-size: 20px; font-weight: 950; color: #fff; }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; text-transform: uppercase; margin-bottom: 40px; border-left: 5px solid #66fcf1; padding-left: 20px; align-self: flex-start; }
        
        .btn-deals, .btn-support { flex: 1; max-width: 350px; min-width: 280px; padding: 22px; border-radius: 20px; font-weight: 950; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; text-transform: uppercase; transition: 0.3s; text-decoration: none; }
        .btn-deals { background: linear-gradient(135deg, #000 0%, #020202 100%); color: #00ec64; border: 1px solid #00ec64; }
        .btn-support { background: #eab308; color: #000; }
        .btn-deals:hover, .btn-support:hover { transform: scale(1.05); filter: brightness(1.1); }
        @media (max-width: 768px) { .specs-grid { grid-template-columns: 1fr; } .fps-resolutions-grid { grid-template-columns: 1fr; gap: 10px; } }
      `}} />
    </div>
  );
}
