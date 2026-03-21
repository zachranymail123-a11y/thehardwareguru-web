import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V22.3 (ADS INJECTION UPDATE)
 * 🚀 CÍL: Maximální monetizace bottleneck analýz skrze A-ADS.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

const findHw = async (table, rawSlugPart) => {
  if (!rawSlugPart || rawSlugPart === 'undefined') return null;
  const slugPart = rawSlugPart.replace(/^en-/, '');
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      const r1 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`, { headers, cache: 'force-cache' });
      if (r1.ok) { const d1 = await r1.json(); if (d1?.length) return d1[0]; }
      
      const r2 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=ilike.*${slugPart}*&limit=1`, { headers, cache: 'force-cache' });
      if (r2.ok) { const d2 = await r2.json(); if (d2?.length) return d2[0]; }
  } catch(e) {}
  return null;
};

const getAnalysisData = async (slug) => {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const resParts = cleanSlug.split('-at-');
  const resolution = resParts[1] || null;
  const gameParts = resParts[0].split('-in-');
  const gameSlug = gameParts[1] || null;
  const hwParts = gameParts[0].split('-with-');
  if (hwParts.length !== 2) return null;
  
  const [cpu, gpu] = await Promise.all([
    findHw('cpus', hwParts[0]), 
    findHw('gpus', hwParts[1])
  ]);
  
  return { cpu, gpu, gameSlug, resolution };
};

export async function generateMetadata(props) {
    const params = await props.params;
    const isEn = props.isEn === true;
    const data = await getAnalysisData(params.slug);
    if (!data?.cpu || !data?.gpu) return { title: 'Analysis | Hardware Guru' };
    const { cpu, gpu, gameSlug, resolution } = data;
    return { 
        title: isEn ? `${cpu.name} + ${gpu.name} Bottleneck` : `${cpu.name} + ${gpu.name} – Analýza Bottlenecku`
    };
}

export default async function BottleneckPage(props) {
  const params = await props.params;
  const isEn = props.isEn === true || params.slug.startsWith('en-');
  const data = await getAnalysisData(params.slug);

  if (!data?.cpu || !data?.gpu) return notFound();

  const { cpu, gpu, gameSlug, resolution } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  let resModifierCpu = 1;
  let resModifierGpu = 1;
  if (resolution === '1080p') { resModifierCpu = 0.85; resModifierGpu = 1.15; }
  else if (resolution === '4k') { resModifierCpu = 1.25; resModifierGpu = 0.80; }

  const normalizedCpu = cpuPower * resModifierCpu * 2.9; 
  const normalizedGpu = gpuPower * resModifierGpu;
  
  let bottleneckScore = 0;
  let isCpuBottleneck = false;

  if (normalizedGpu > normalizedCpu) {
      isCpuBottleneck = true;
      const diff = (normalizedGpu / normalizedCpu) - 1; 
      bottleneckScore = Math.min(Math.round(diff * 45), 100); 
  } else {
      isCpuBottleneck = false;
      const diff = (normalizedCpu / normalizedGpu) - 1; 
      bottleneckScore = Math.min(Math.round(diff * 45), 100);
  }

  if (bottleneckScore < 5) bottleneckScore = 0;
  let bottleneckType = isCpuBottleneck ? 'CPU' : 'GPU';
  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');

  const gameName = gameSlug ? gameSlug.replace(/-/g, ' ').toUpperCase() : null;
  const resText = resolution ? resolution.toUpperCase() : null;
  const gameKey = gameSlug ? gameSlug.replace('-2077', '').replace(/-/g, '_') : null;
  const targetRes = resolution || '1440p';
  
  const gpuFpsData = Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : (gpu.game_fps || {});
  const cpuFpsData = Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : (cpu.cpu_game_fps || {});
  
  let estimatedFps = null;
  if (gameKey) {
      const gFps = Number(gpuFpsData[`${gameKey}_${targetRes}`] || gpuFpsData[`${gameKey}_1440p`] || 0);
      const cFps = Number(cpuFpsData[`${gameKey}_${targetRes}`] || cpuFpsData[`${gameKey}_1440p`] || 0);
      if (gFps > 0 && cFps > 0) estimatedFps = Math.min(gFps, cFps);
  }

  const safeCpuSlug = (cpu.slug || slugify(cpu.name)).replace(/^en-/, '');
  const safeGpuSlug = (gpu.slug || slugify(gpu.name)).replace(/^en-/, '');
  const baseComboUrl = gameSlug ? `${safeCpuSlug}-with-${safeGpuSlug}-in-${gameSlug}` : `${safeCpuSlug}-with-${safeGpuSlug}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="radar-badge"><Gauge size={16} /> GURU BOTTLENECK RADAR</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>
            <a href={isEn ? `/en/cpu/${safeCpuSlug}` : `/cpu/${safeCpuSlug}`} style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24', textDecoration: 'none' }}>{normalizeName(cpu.name)}</a> 
            <span style={{ color: '#fff', opacity: 0.3, fontSize: '0.4em', display: 'block', margin: '10px 0' }}>WITH</span>
            <a href={isEn ? `/en/gpu/${safeGpuSlug}` : `/gpu/${safeGpuSlug}`} style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24', textDecoration: 'none' }}>{normalizeName(gpu.name)}</a>
          </h1>
          
          {gameName && <div className="game-label-box"><Gamepad2 size={18} /> {isEn ? 'PERFORMANCE IN' : 'VÝKON VE HŘE'} {gameName}</div>}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {['1080p', '1440p', '4k'].map(res => (
               <a key={res} href={isEn ? `/en/bottleneck/${baseComboUrl}-at-${res}` : `/bottleneck/${baseComboUrl}-at-${res}`} className={`res-btn ${resolution === res ? 'active' : ''}`}>{res.toUpperCase()}</a>
            ))}
          </div>
        </header>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD OVLÁDÁNÍM */}
        <div className="guru-bottleneck-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <section style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${statusColor}40`, borderRadius: '30px', padding: '50px 40px', textAlign: 'center', marginBottom: '60px', boxShadow: `0 30px 100px ${statusColor}15` }}>
            <div style={{ display: 'grid', gridTemplateColumns: estimatedFps ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'System Bottleneck' : 'Bottleneck systému'}</div>
                    <div style={{ fontSize: 'clamp(70px, 12vw, 110px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '15px 0' }}>{bottleneckScore}%</div>
                    <div className="status-pill" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                        {bottleneckScore < 15 ? (isEn ? 'IDEAL MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? `${bottleneckType} BOTTLENECK` : `ZJIŠTĚN BOTTLENECK` + ` (${bottleneckType})`)}
                    </div>
                </div>
                {estimatedFps && (
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '40px' }} className="border-mobile-fix">
                    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'Estimated Average FPS' : 'Odhadovaný průměr FPS'}</div>
                    <div style={{ fontSize: 'clamp(70px, 12vw, 110px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '15px 0' }}>{estimatedFps}</div>
                    <div className="status-pill" style={{ background: `rgba(255,255,255,0.05)`, color: '#d1d5db', border: `1px solid rgba(255,255,255,0.1)` }}>{gameName} @ {resText || '1440P'}</div>
                </div>
                )}
            </div>
        </section>

        {/* 🔥 ADS SLOT #2: PŘED DOPORUČENÍMI */}
        <div className="guru-bottleneck-ad-slot" style={{ borderLeft: `4px solid ${statusColor}` }}>
            <span className="ad-label">Sponsored Hardware Optimization</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #66fcf1' }}>{isEn ? 'SYSTEM RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             <div className="spec-card-box"><PlugZap size={24} color="#f97316" /><div className="card-label">PSU (ZDROJ)</div><div className="card-val">{gpu.tdp_w > 300 ? '850W+' : '750W'}</div></div>
             <div className="spec-card-box"><Layers size={24} color="#10b981" /><div className="card-label">CHIPSET</div><div className="card-val">{cpu.vendor === 'AMD' ? 'B650' : 'Z790'}</div></div>
             <div className="spec-card-box"><Database size={24} color="#a855f7" /><div className="card-label">RAM</div><div className="card-val">32GB DDR5 6000</div></div>
          </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" className="live-btn"><Flame size={20} /> {isEn ? 'WATCH LIVE' : 'SLEDOVAT LIVE'}</a>
            <a href="/support" className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .game-label-box { color: #66fcf1; font-size: 15px; font-weight: 950; margin-top: 25px; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; justifyContent: center; gap: 8px; }
        .status-pill { padding: 12px 35px; border-radius: 50px; display: inline-block; font-weight: 950; fontSize: 14px; text-transform: uppercase; }
        .section-h2 { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; padding-left: 15px; }
        
        .guru-bottleneck-ad-slot { margin: 30px 0; padding: 15px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }

        .res-btn { padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 950; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; text-decoration: none; transition: 0.2s; }
        .res-btn.active { background: #66fcf120; border-color: #66fcf1; color: #66fcf1; }
        .spec-card-box { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .card-label { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; margin: 10px 0 5px; }
        .card-val { font-size: 18px; font-weight: 950; color: #fff; }
        .support-btn { background: #eab308; color: #000; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; }
        .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; }

        @media (max-width: 768px) { 
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .border-mobile-fix { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 40px; }
            .support-btn, .live-btn { width: 100%; text-align: center; }
        }
      `}} />
    </div>
  );
}
