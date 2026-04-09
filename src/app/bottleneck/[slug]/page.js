import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart, ChevronRight
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';
import HeurekaButtons from '../../../components/HeurekaButtons'; 
import BottleneckFatContent from '../../../components/BottleneckFatContent'; // 🔥 IMPORT TVÉ NOVÉ SEO KOMPONENTY 🔥

/**
 * GURU BOTTLENECK ENGINE V22.13 (FAT CONTENT UPDATE)
 * 🚀 CÍL: Generování tisíců plnohodnotných a unikátních stránek pro dominanci ve vyhledávačích.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '').trim();
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: HW LOOKUP
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

      const filter = table === 'gpus' ? /nvidia|geforce|rtx|amd|radeon|rx|gb|graphics|gpu/gi : /amd|intel|ryzen|core|ultra|processor|cpu/gi;
      const clean = slugPart.replace(/-/g, ' ').replace(filter, '').trim();
      const tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const cond = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const r3 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&and=(${cond})&limit=1`, { headers, cache: 'force-cache' });
          if (r3.ok) { const d3 = await r3.json(); if (d3?.length) return d3[0]; }
      }
  } catch(e) { console.error("GURU FIND HW ERROR:", e); }
  return null;
};

const normalizeResolution = (res) => {
    if (!res) return null;
    if (res === '4k' || res === '4K') return '2160p';
    return res;
}

const getAnalysisData = async (slug) => {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const resParts = cleanSlug.split('-at-');
  const resolution = normalizeResolution(resParts[1]); 
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
    const displayResolution = resolution === '2160p' ? '4K' : (resolution ? resolution.toUpperCase() : '');
    let titleSuffix = '';
    if (gameSlug && displayResolution) {
        const gameName = gameSlug.replace(/-/g, ' ').toUpperCase();
        titleSuffix = ` in ${gameName} at ${displayResolution}`;
    }
    const title = isEn ? `${cpu.name} + ${gpu.name} Bottleneck Analysis${titleSuffix}` : `${cpu.name} + ${gpu.name} – Analýza Bottlenecku${titleSuffix}`;
    const cleanSlug = params.slug.replace(/^en-/, '');
    return { title: `${title} | The Hardware Guru`, alternates: { canonical: `${baseUrl}/bottleneck/${cleanSlug}` } };
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
  else if (resolution === '2160p') { resModifierCpu = 1.25; resModifierGpu = 0.80; }

  const normalizedCpu = cpuPower * resModifierCpu * 2.9; 
  const normalizedGpu = gpuPower * resModifierGpu;
  
  let bottleneckScore = 0;
  let isCpuBottleneck = normalizedGpu > normalizedCpu;
  const diff = isCpuBottleneck ? (normalizedGpu / normalizedCpu) - 1 : (normalizedCpu / normalizedGpu) - 1;
  bottleneckScore = Math.max(0, Math.min(Math.round(diff * 45), 100));
  if (bottleneckScore < 5) bottleneckScore = 0;

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');
  const gameName = gameSlug ? gameSlug.replace(/-/g, ' ').toUpperCase() : null;
  const displayResolution = resolution === '2160p' ? '4K' : (resolution ? resolution.toUpperCase() : '');
  const gameKey = gameSlug ? gameSlug.replace('-2077', '').replace(/-/g, '_') : null;
  
  const gpuFpsData = (Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps) || {};
  const cpuFpsData = (Array.isArray(cpu.cpu_game_fps) ? cpu.cpu_game_fps[0] : cpu.cpu_game_fps) || {};
  
  let estimatedFps = null;
  if (gameKey) {
      const gFps = Number(gpuFpsData[`${gameKey}_${resolution || '1440p'}`] || gpuFpsData[`${gameKey}_1440p`]) || 0;
      const cFps = Number(cpuFpsData[`${gameKey}_${resolution || '1440p'}`] || cpuFpsData[`${gameKey}_1440p`]) || 0;
      if (gFps > 0 && cFps > 0) estimatedFps = Math.min(gFps, cFps);
  }

  // 🚀 GURU ALGORITHMIC FALLBACK
  if (!estimatedFps && gameSlug) {
      const gameDataMap = {
          'cyberpunk-2077': { thread_scaling: 0.85, cpu_weight: 1.2, gpu_weight: 1.5, fps_scale: 1.2 },
          'cs2': { thread_scaling: 0.3, cpu_weight: 0.5, gpu_weight: 0.4, fps_scale: 3.5 },
          'alan-wake-2': { thread_scaling: 0.8, cpu_weight: 1.1, gpu_weight: 1.8, fps_scale: 0.9 },
          'valorant': { thread_scaling: 0.25, cpu_weight: 0.4, gpu_weight: 0.3, fps_scale: 4.0 },
          'gta-v': { thread_scaling: 0.65, cpu_weight: 1.3, gpu_weight: 1.1, fps_scale: 1.5 },
          'generic': { thread_scaling: 0.6, cpu_weight: 1.0, gpu_weight: 1.0, fps_scale: 1.4 }
      };
      const game = gameDataMap[gameSlug] || gameDataMap['generic'];
      
      const cpuNameLower = String(cpu.name || '').toLowerCase();
      let ipcBase = 100; 
      let archEfficiency = 1.0;
      if (cpuNameLower.includes('x3d')) archEfficiency *= 1.4;
      if (cpuNameLower.includes('9800x3d')) ipcBase = 135;
      else if (cpuNameLower.includes('7800x3d')) ipcBase = 115;
      
      let cpuEffective = (ipcBase * (1 - game.thread_scaling) + (Number(cpu.performance_index) || 100) * game.thread_scaling) * archEfficiency;
      
      const resMultiplier = { '1080p': 1.0, '1440p': 1.5, '2160p': 2.4 }[resolution] || 1.5;
      let gpuEffective = (Number(gpu.performance_index) || 100) / resMultiplier;
      
      const rawCpuFps = (cpuEffective / (game.cpu_weight || 1)) * game.fps_scale;
      const rawGpuFps = (gpuEffective / (game.gpu_weight || 1)) * game.fps_scale;
      
      estimatedFps = Math.max(1, Math.round(Math.min(rawCpuFps, rawGpuFps)));
  }

  const safeCpuSlug = (cpu.slug || slugify(cpu.name)).replace(/^en-/, '');
  const safeGpuSlug = (gpu.slug || slugify(gpu.name)).replace(/^en-/, '');
  const baseComboUrl = gameSlug ? `${safeCpuSlug}-with-${safeGpuSlug}-in-${gameSlug}` : `${safeCpuSlug}-with-${safeGpuSlug}`;

  // 🔥 GENERÁTOR AFFILIATE LINKŮ 🔥
  const cleanCpuName = normalizeName(cpu.name);
  const cleanGpuName = normalizeName(gpu.name);

  const getSmartyLink = (name) => `https://ehub.cz/system/scripts/click.php?a_aid=71c85dea&a_bid=1651aa06&desturl=${encodeURIComponent(`https://www.smarty.cz/Vyhledavani?query=${encodeURIComponent(name)}`)}`;
  const getHeurekaLink = (name) => `https://www.heureka.cz/?h%5Bfraze%5D=${encodeURIComponent(name)}#utm_source=thehardwareguru.cz&utm_medium=affiliate&utm_campaign=25842&utm_content=Text%20link`;

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '160px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="radar-badge"><Gauge size={16} /> GURU BOTTLENECK RADAR</div>
          <h1 className="main-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>
            <a href={isEn ? `/en/cpu/${safeCpuSlug}` : `/cpu/${safeCpuSlug}`} style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24', textDecoration: 'none' }}>{normalizeName(cpu.name)}</a> <br/>
            <span style={{ color: '#fff', opacity: 0.3, fontSize: '0.4em', display: 'block', margin: '10px 0' }}>WITH</span>
            <a href={isEn ? `/en/gpu/${safeGpuSlug}` : `/gpu/${safeGpuSlug}`} style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24', textDecoration: 'none' }}>{normalizeName(gpu.name)}</a>
          </h1>
          {gameName && (
             <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {['1080p', '1440p', '2160p'].map(res => (
                   <a key={res} href={isEn ? `/en/bottleneck/${baseComboUrl}-at-${res}` : `/bottleneck/${baseComboUrl}-at-${res}`} className={`res-btn ${resolution === res ? 'active' : ''}`}>{res === '2160p' ? '4K' : res.toUpperCase()}</a>
                ))}
             </div>
          )}
        </header>

        <section className="main-analysis-box" style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${statusColor}40`, borderRadius: '30px', padding: '50px 40px', textAlign: 'center', marginBottom: '60px', boxShadow: `0 30px 100px ${statusColor}15` }}>
            <div style={{ display: 'grid', gridTemplateColumns: estimatedFps ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'System Bottleneck' : 'Bottleneck systému'}</div>
                    <div style={{ fontSize: 'clamp(60px, 12vw, 110px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '15px 0' }}>{bottleneckScore}%</div>
                    <div className="status-pill" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                        {bottleneckScore < 15 ? (isEn ? 'IDEAL MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? `${isCpuBottleneck ? 'CPU' : 'GPU'} BOTTLENECK` : `ZJIŠTĚN BOTTLENECK (${isCpuBottleneck ? 'CPU' : 'GPU'})`)}
                    </div>
                </div>
                {estimatedFps && (
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '40px' }} className="border-mobile-fix">
                    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'Estimated Average FPS' : 'Odhadovaný průměr FPS'}</div>
                    <div style={{ fontSize: 'clamp(60px, 12vw, 110px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '15px 0' }}>{estimatedFps}</div>
                </div>
                )}
            </div>
            
            {/* 🔥 ZDE JE INTEGROVÁN NOVÝ FAT CONTENT MÍSTO STARÉHO SEO TEXTU 🔥 */}
            <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', textAlign: 'left' }}>
              <BottleneckFatContent 
                cpuName={cpu.name} 
                gpuName={gpu.name} 
                gameName={gameName || (isEn ? "Modern Titles" : "Moderních hrách")} 
                resolution={displayResolution || "1440p"} 
                bottleneckPercent={bottleneckScore} 
                bottleneckType={bottleneckScore < 5 ? 'Balanced' : (isCpuBottleneck ? 'CPU' : 'GPU')} 
                isEn={isEn} 
              />
            </div>

            {/* 🔥 GURU AFFILIATE BOMB 🔥 */}
            <div className="affiliate-cta-grid" style={{ marginTop: '40px' }}>
                <div className="affiliate-col">
                    <div className="affiliate-col-title">
                        <Monitor size={16} /> {isEn ? 'BUY SELECTED GPU' : 'KOUPIT ZVOLENOU GRAFIKU'}
                    </div>
                    <div className="affiliate-btn-wrap">
                        <a href={getSmartyLink(cleanGpuName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                            <ShoppingCart size={16} /> Smarty.cz
                        </a>
                        <a href={getHeurekaLink(cleanGpuName)} data-trixam-positionid="276026" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link">
                            <ShoppingCart size={16} /> Heureka.cz
                        </a>
                    </div>
                </div>
                <div className="affiliate-col">
                    <div className="affiliate-col-title">
                        <Cpu size={16} /> {isEn ? 'BUY SELECTED CPU' : 'KOUPIT ZVOLENÝ PROCESOR'}
                    </div>
                    <div className="affiliate-btn-wrap">
                        <a href={getSmartyLink(cleanCpuName)} target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn smarty-btn">
                            <ShoppingCart size={16} /> Smarty.cz
                        </a>
                        <a href={getHeurekaLink(cleanCpuName)} data-trixam-positionid="276027" data-trixam-codetype="link" target="_blank" rel="nofollow sponsored" className="guru-buy-winner-btn heureka-btn heureka-hn-link">
                            <ShoppingCart size={16} /> Heureka.cz
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <HeurekaButtons isEn={isEn} />
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div className="ad-mobile-wrapper">
                <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #66fcf1' }}>{isEn ? 'SYSTEM RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             <div className="spec-card-box"><PlugZap size={24} color="#f97316" /><div className="card-label">PSU (ZDROJ)</div><div className="card-val">{gpu.tdp_w > 300 ? '850W+' : '750W'}</div></div>
             <div className="spec-card-box"><Layers size={24} color="#10b981" /><div className="card-label">CHIPSET</div><div className="card-val">{cpu.vendor === 'AMD' ? 'B650 / X670' : 'B760 / Z790'}</div></div>
             <div className="spec-card-box"><Database size={24} color="#a855f7" /><div className="card-label">RAM</div><div className="card-val">32GB DDR5 6000MT/s</div></div>
          </div>
        </section>

        <section className="massive-seo-hub" style={{ marginTop: '80px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '60px' }}>
            <h2 className="section-h2" style={{ borderLeft: '4px solid #a855f7', marginBottom: '40px' }}>
                {isEn ? 'EXPLORE GURU DATABASE' : 'PROZKOUMEJ GURU DATABÁZI'}
            </h2>
            <div className="hub-grid">
                <div className="hub-column">
                    <div className="hub-col-header"><Swords size={20} color="#ff0055" /> {isEn ? 'Hardware Battles' : 'HW Souboje'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/gpuvs" : "/gpuvs"}><ChevronRight size={16} /> {isEn ? 'Graphics Card Battles' : 'Souboje Grafických Karet'}</a></li>
                        <li><a href={isEn ? "/en/cpuvs" : "/cpuvs"}><ChevronRight size={16} /> {isEn ? 'Processor Battles' : 'Souboje Procesorů'}</a></li>
                        <li><a href={isEn ? `/en/cpu/${safeCpuSlug}` : `/cpu/${safeCpuSlug}`}><ChevronRight size={16} /> {isEn ? `More about ${cpu.name}` : `Detail procesoru ${cpu.name}`}</a></li>
                        <li><a href={isEn ? `/en/gpu/${safeGpuSlug}` : `/gpu/${safeGpuSlug}`}><ChevronRight size={16} /> {isEn ? `More about ${gpu.name}` : `Detail grafiky ${gpu.name}`}</a></li>
                    </ul>
                </div>
                <div className="hub-column">
                    <div className="hub-col-header"><Gamepad2 size={20} color="#66fcf1" /> {isEn ? 'Guru Ecosystem' : 'Guru Ekosystém'}</div>
                    <ul className="hub-links-list">
                        <li><a href={isEn ? "/en/bottleneck-calculator" : "/bottleneck-kalkulacka"}><ChevronRight size={16} /> {isEn ? 'New Bottleneck Test' : 'Nový Bottleneck Test'}</a></li>
                        <li><a href={isEn ? "/en/ocekavane-hry" : "/ocekavane-hry"}><ChevronRight size={16} /> {isEn ? 'Game Archive' : 'Archiv her'}</a></li>
                        <li><a href={isEn ? "/en/clanky" : "/clanky"}><ChevronRight size={16} /> {isEn ? 'News & Articles' : 'Články a Novinky'}</a></li>
                        <li><a href={isEn ? "/en/tipy" : "/tipy"}><ChevronRight size={16} /> {isEn ? 'GURU Tips' : 'GURU Tipy'}</a></li>
                    </ul>
                </div>
            </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '80px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="nofollow sponsored" className="live-btn"><Flame size={20} /> {isEn ? 'WATCH LIVE' : 'SLEDOVAT LIVE'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <div className="sticky-bottom-anchor">
          <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={90} />
          </div>
          <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={100} />
          </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .status-pill { padding: 12px 35px; border-radius: 50px; display: inline-block; font-weight: 950; font-size: 14px; text-transform: uppercase; }
        .section-h2 { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; padding-left: 15px; }
        .res-btn { padding: 8px 20px; border-radius: 12px; font-size: 12px; font-weight: 950; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; text-decoration: none; transition: 0.2s; }
        .res-btn.active { background: #66fcf120; border-color: #66fcf1; color: #66fcf1; }
        .spec-card-box { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .card-label { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin: 10px 0 5px; }
        .card-val { font-size: 18px; font-weight: 950; color: #fff; }
        .support-btn, .live-btn { display: flex; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .support-btn { background: #eab308; color: #000; }
        .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; }

        /* 🚀 SEO HUB CSS */
        .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .hub-column { background: rgba(255,255,255,0.02); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .hub-col-header { display: flex; align-items: center; gap: 15px; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; }
        .hub-links-list { list-style: none; padding: 0; }
        .hub-links-list a { color: #9ca3af; text-decoration: none; font-size: 16px; display: flex; align-items: center; margin-bottom: 18px; font-weight: bold; transition: 0.3s; }
        .hub-links-list a:hover { color: #66fcf1; transform: translateX(10px); }

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

        /* 🔥 CSS PRO AFFILIATE GRID A TLAČÍTKA 🔥 */
        .affiliate-cta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 25px; background: rgba(0,0,0,0.4); border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.2); width: 100%; box-sizing: border-box; }
        .affiliate-col { display: flex; flex-direction: column; align-items: center; width: 100%; }
        .affiliate-col-title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; font-weight: 950; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; text-align: center; }
        .affiliate-btn-wrap { display: flex; gap: 10px; width: 100%; justify-content: center; flex-wrap: wrap; }
        
        @keyframes pulse-smarty { 0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); } 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
        @keyframes pulse-heureka { 0% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(0, 120, 212, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 120, 212, 0); } }
        
        .guru-buy-winner-btn { flex: 1; min-width: 120px; display: inline-flex; justify-content: center; align-items: center; gap: 8px; padding: 12px 15px; border-radius: 12px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; transition: transform 0.3s ease, box-shadow 0.3s ease; letter-spacing: 0.5px; }
        .smarty-btn { background: linear-gradient(135deg, #facc15 0%, #eab308 100%); color: #000; border: 2px solid #fef08a; animation: pulse-smarty 2s infinite; }
        .smarty-btn:hover { transform: translateY(-3px) scale(1.02); animation: none; box-shadow: 0 10px 20px rgba(234, 179, 8, 0.5); }
        .heureka-btn { background: linear-gradient(135deg, #3b82f6 0%, #0078d4 100%); color: #fff; border: 2px solid #60a5fa; animation: pulse-heureka 2s infinite; animation-delay: 1s; }
        .heureka-btn:hover { transform: translateY(-3px) scale(1.02); animation: none; box-shadow: 0 10px 20px rgba(0, 120, 212, 0.5); }

        /* GURU RESPONSIVE ADS - STRICT FIX */
        .ad-desktop-wrapper { display: flex; justify-content: center; width: 100%; }
        .ad-mobile-wrapper { display: none; width: 100%; }

        @media (max-width: 768px) {
            .guru-bottleneck-wrapper { paddingTop: 80px !important; }
            .ad-desktop-wrapper { display: none !important; }
            .ad-mobile-wrapper { display: flex !important; justify-content: center; width: 100%; }
            .border-mobile-fix { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 40px; }
            .main-analysis-box { padding: 30px 15px !important; border-radius: 20px !important; }
            .status-pill { padding: 10px 20px; font-size: 12px; }
            .support-btn, .live-btn { width: 100%; justify-content: center; }
            .main-title { font-size: 1.6rem !important; }
            .hub-grid { grid-template-columns: 1fr; }
            .hub-column { padding: 25px; }
            
            /* Responzivita Affiliate tlačítek */
            .affiliate-cta-grid { grid-template-columns: 1fr; gap: 20px; padding: 15px; }
            .affiliate-btn-wrap { flex-direction: column; }
            .guru-buy-winner-btn { width: 100%; }
        }
      `}} />
    </div>
  );
}
