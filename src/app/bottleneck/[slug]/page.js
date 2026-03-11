import React, { cache } from 'react';
import Script from 'next/script';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V7.7 (BULLETPROOF LOOKUP & CENTERED)
 * 🚀 STATUS: LIVE - AdSense ID ca-pub-5468223287024993
 * 🛡️ FIX 1: Oprava relací v PostgREST (cpu_game_fps vs game_fps).
 * 🛡️ FIX 2: Absolutní horizontální centrování dle screenshotu.
 * 🛡️ FIX 3: Robustní 3-Tier vyhledávání s fallbackem bez joinu (Zamezuje 404).
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
const slugify = (text) => text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

// 🛡️ GURU ENGINE: Neprůstřelné vyhledávání (3-TIER s korektními relacemi)
const findHw = async (table, slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  
  // Relace se liší pro CPU a GPU tabulku
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      // TIER 1: Přesný slug match s benchmarky
      const url1 = `${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) { const data = await res1.json(); if (data?.length) return data[0]; }
      
      // Fallback: Pokud join selže, zkusíme aspoň čistou entitu
      const resF = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (resF.ok) { const dataF = await resF.json(); if (dataF?.length) return dataF[0]; }

      // TIER 2: Agresivní hledání podle jména (Tokens)
      const clean = slugPart.replace(/-/g, ' ').replace(/ryzen|core|intel|amd|geforce|rtx|radeon|rx/gi, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res2 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
          if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
          
          // Fallback bez joinu pro Tier 2
          const res2F = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&and=(${conditions})&limit=1`, { headers, cache: 'no-store' });
          if (res2F.ok) { const data2F = await res2F.json(); return data2F?.[0] || null; }
      }
  } catch(e) { console.error("Lookup Crash:", e); }
  return null;
};

const getAnalysisData = cache(async (slug) => {
  const cleanSlug = slug.replace(/^en-/, '');
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
        <ins className="adsbygoogle"
             style={{ display: 'block', minHeight: height }}
             data-ad-client="ca-pub-5468223287024993"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
    </div>
);

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const isEn = rawSlug.startsWith('en-');
  const data = await getAnalysisData(rawSlug);
  if (!data?.cpu || !data?.gpu) return { title: 'Analysis | Hardware Guru' };

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

  if (!data?.cpu || !data?.gpu) return (
    <div className="error-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d', color: '#fff', textAlign: 'center' }}>
      <div>
        <AlertTriangle size={64} color="#ef4444" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontWeight: '950' }}>KOMPONENTA NENALEZENA</h2>
        <p style={{ color: '#9ca3af' }}>Zkontrolujte URL adresu nebo hledejte v databázi.</p>
        <a href="/" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', background: '#f59e0b', color: '#000', borderRadius: '10px', fontWeight: 'bold' }}>ZPĚT DOMŮ</a>
      </div>
    </div>
  );

  const { cpu, gpu, gameSlug } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  let bottleneckScore = cpuPower < gpuPower * 0.75 
    ? Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100)
    : (gpuPower < cpuPower * 0.6 ? Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100) : 0);

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');
  const recommendedPsu = Math.ceil(((Number(cpu.tdp_w) || 65) + (Number(gpu.tdp_w) || 200)) * 1.6 / 50) * 50;

  const fpsData = gpu?.game_fps?.[0] || {};
  const gameKey = gameSlug ? gameSlug.replace('-2077', '').replace(/-/g, '_') : null;
  const specificFps = gameKey ? (fpsData[`${gameKey}_1440p`] || fpsData[`${gameKey}_1080p`] || 0) : null;

  return (
    <div className="guru-page-container">
      <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5468223287024993" crossOrigin="anonymous" strategy="afterInteractive" />

      <main style={{ maxWidth: '1250px', margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}>
          <div className="radar-badge">
            <Gauge size={16} /> GURU {gameSlug ? gameSlug.replace(/-/g, ' ').toUpperCase() : 'SYSTEM'} RADAR
          </div>
          <h1 className="hero-title">
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.5, fontSize: '0.4em', display: 'block', margin: '15px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <AdSpace slot="1234567890" /> 

        <section className="glass-card main-hero" style={{ width: '100%', maxWidth: '900px', margin: '0 auto 60px' }}>
            <div className="hero-label">{isEn ? 'Calculated System Bottleneck' : 'Vypočítaný bottleneck systému'}</div>
            <div className="score-text" style={{ color: statusColor, textShadow: `0 0 60px ${statusColor}50` }}>{bottleneckScore}%</div>
            
            {specificFps > 0 && (
                <div style={{ marginBottom: '25px', fontSize: '26px', fontWeight: '950', color: '#66fcf1' }}>
                    ~{specificFps} FPS <span style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase' }}>{gameSlug.replace(/-/g, ' ')} 1440p</span>
                </div>
            )}

            <div className="status-badge" style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                {bottleneckScore < 15 ? (isEn ? 'PERFECT MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
            </div>
        </section>

        <section style={{ width: '100%', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', width: '100%', justifyContent: 'center' }}>
              <div style={{ height: '4px', width: '40px', background: '#66fcf1', borderRadius: '10px' }}></div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '950', textTransform: 'uppercase', margin: 0 }}>
                {isEn ? 'BUILD RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}
              </h2>
              <div style={{ height: '4px', width: '40px', background: '#66fcf1', borderRadius: '10px' }}></div>
          </div>
          
          <div className="specs-grid">
              <div className="glass-card spec-item">
                  <PlugZap size={32} color="#f59e0b" />
                  <div className="spec-label">{isEn ? 'PSU' : 'ZDROJ'}</div>
                  <div className="spec-val">{recommendedPsu}W</div>
              </div>
              <div className="glass-card spec-item">
                  <Layers size={32} color="#66fcf1" />
                  <div className="spec-label">{isEn ? 'OPTIMAL CHIPSET' : 'ČIPSET'}</div>
                  <div className="spec-val">{(cpu.vendor === 'AMD' && cpu.name.includes('5000')) ? 'B550' : 'B650 / B760'}</div>
              </div>
              <div className="glass-card spec-item">
                  <Database size={32} color="#a855f7" />
                  <div className="spec-label">IDEAL RAM</div>
                  <div className="spec-val">{(cpu.vendor === 'AMD' && cpu.name.includes('5000')) ? 'DDR4 3600' : 'DDR5 6000'}</div>
              </div>
          </div>
        </section>

        <AdSpace slot="0987654321" height="250px" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', justifyContent: 'center', marginTop: '40px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" className="btn-deals"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA TOP CENY'}</a>
            <a href="/support" className="btn-support"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-page-container { min-height: 100vh; background: #0a0b0d; background-image: url("/bg-guru.png"); background-size: cover; background-attachment: fixed; padding-top: 120px; padding-bottom: 100px; color: #fff; }
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .hero-title { font-size: clamp(2.2rem, 6vw, 4.5rem); font-weight: 950; text-transform: uppercase; line-height: 1.1; margin: 0; }
        .glass-card { background: rgba(15,17,21,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; box-shadow: 0 30px 100px rgba(0,0,0,0.8); transition: 0.3s; }
        .main-hero { padding: 80px 40px; text-align: center; }
        .hero-label { color: #6b7280; font-size: 13px; font-weight: 950; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px; }
        .score-text { font-size: clamp(90px, 18vw, 150px); font-weight: 950; line-height: 1; margin: 10px 0; }
        .status-badge { padding: 15px 45px; border-radius: 50px; display: inline-block; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; }
        .specs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; width: 100%; max-width: 1100px; justify-content: center; margin: 0 auto; }
        .spec-item { padding: 45px 30px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .spec-label { font-size: 11px; font-weight: 950; text-transform: uppercase; color: #6b7280; letter-spacing: 2px; }
        .spec-val { font-size: 36px; font-weight: 950; color: #fff; }
        .btn-deals, .btn-support { flex: 1; max-width: 350px; min-width: 280px; padding: 22px; border-radius: 20px; font-weight: 950; text-align: center; display: flex; align-items: center; justify-content: center; gap: 12px; text-transform: uppercase; transition: 0.3s; text-decoration: none; }
        .btn-deals { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .btn-support { background: #eab308; color: #000; }
        .btn-deals:hover, .btn-support:hover { transform: scale(1.05); filter: brightness(1.1); }
        @media (max-width: 768px) { .specs-grid { grid-template-columns: 1fr; } }
      `}} />
    </div>
  );
}
