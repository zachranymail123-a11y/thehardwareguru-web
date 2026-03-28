import React from 'react';
import { notFound } from 'next/navigation';
import { 
 ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart
} from 'lucide-react';
import SeznamAd from '../../../components/SeznamAd';

/**
 * GURU BOTTLENECK ENGINE V22.9 (MOBILE OPTIMIZED)
 * 🚀 CÍL: Maximální monetizace a perfektní zobrazení na všech zařízeních.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
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

const AlgorithmicSeoText = ({ cpuName, gpuName, gameName, resolution, bottleneckPercent, isCpuBound, fps, isEn }) => {
  const isPerfect = bottleneckPercent < 10;
  const isMinor = bottleneckPercent >= 10 && bottleneckPercent <= 20;
  const targetGame = gameName ? (isEn ? `in ${gameName}` : `ve hře ${gameName}`) : (isEn ? `in modern titles` : `v moderních titulech`);
  const targetRes = resolution ? (isEn ? ` at ${resolution}` : ` v rozlišení ${resolution}`) : '';
  const bottleneckType = isCpuBound ? "CPU" : "GPU";

  let p1, p2, p3;

  if (isEn) {
    p1 = `When pairing the <strong>${cpuName}</strong> processor with the <strong>${gpuName}</strong> graphics card, it is crucial to analyze how they perform together ${targetGame}${targetRes}. A balanced system ensures maximum frames per second without wasting hardware potential.`;
    if (isPerfect) {
      p2 = `Based on our performance index, this combination is <strong>perfectly balanced</strong>. With a negligible bottleneck of only <strong>${bottleneckPercent}%</strong>, neither the ${bottleneckType} nor the other components are significantly holding the system back. This means you are extracting the maximum possible value from both components.`;
    } else if (isMinor) {
      p2 = `Our analysis reveals a minor <strong>${bottleneckPercent}% bottleneck</strong>, primarily caused by the <strong>${bottleneckType}</strong>. While not critical, it indicates that the ${bottleneckType} reaches its maximum capacity slightly earlier than the rest of the system${targetRes}.`;
    } else {
      p2 = `This configuration experiences a significant <strong>${bottleneckPercent}% bottleneck</strong>, strictly limited by the <strong>${bottleneckType}</strong>. In highly demanding scenarios ${targetGame}, the ${bottleneckType} struggles to keep pace, preventing the other components from achieving their full potential.`;
    }
    p3 = fps ? `For gamers, this translates to an estimated average performance of <strong>${fps} FPS</strong>. If you are planning to build or upgrade this PC, focusing on a more powerful ${bottleneckType} would yield the most noticeable improvements in smoothness and visual fidelity.` : `If you are planning to build or upgrade this exact PC setup, balancing the ${bottleneckType} power should be your next priority to optimize your gaming or professional workflow.`;
  } else {
    p1 = `Při spojení procesoru <strong>${cpuName}</strong> s grafickou kartou <strong>${gpuName}</strong> je naprosto klíčové vědět, jak se budou chovat ${targetGame}${targetRes}. Správně vyvážená sestava garantuje maximální snímkovou frekvenci (FPS) bez zbytečného plýtvání výkonem.`;
    if (isPerfect) {
      p2 = `Na základě našeho výkonnostního indexu je tato kombinace <strong>naprosto ideální</strong>. S naprosto zanedbatelným omezením pouze <strong>${bottleneckPercent} %</strong> nebrzdí procesor ani grafická karta zbytek systému. Z obou drahých komponent tak těžíte absolutní maximum.`;
    } else if (isMinor) {
      p2 = `Naše analýza odhalila mírný úzký profil (bottleneck) na úrovni <strong>${bottleneckPercent} %</strong>, který je způsoben primárně ze strany <strong>${bottleneckType}</strong>. Nejedná se o kritický problém, ale znamená to, že ${bottleneckType} naráží na své limity o něco dříve než zbytek sestavy${targetRes}.`;
    } else {
      p2 = `Tato konfigurace trpí poměrně zásadním bottleneckem <strong>${bottleneckPercent} %</strong>, kdy je výkon striktně limitován ze strany <strong>${bottleneckType}</strong>. V náročných momentech ${targetGame} přestává ${bottleneckType} stíhat a nedovolí druhé komponentě využít její plný potenciál.`;
    }
    p3 = fps ? `Pro hráče to v reálu znamená odhadovaný průměrný výkon kolem <strong>${fps} FPS</strong>. Pokud plánujete tuto sestavu stavět nebo vylepšovat, investice do silnějšího ${bottleneckType} by vám přinesla největší skok v plynulosti a kvalitě obrazu.` : `Pokud plánujete tuto počítačovou sestavu teprve stavět, doporučujeme zvážit lepší vyvážení. Investice do silnějšího ${bottleneckType} by měla být vaší prioritou číslo jedna pro maximalizaci výkonu.`;
  }

  return (
    <div className="seo-text-container" style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#d1d5db' }}>
      <p style={{ marginBottom: '15px' }} dangerouslySetInnerHTML={{ __html: p1 }}></p>
      <p style={{ marginBottom: '15px' }} dangerouslySetInnerHTML={{ __html: p2 }}></p>
      <p dangerouslySetInnerHTML={{ __html: p3 }}></p>
    </div>
  );
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

  const safeCpuSlug = (cpu.slug || slugify(cpu.name)).replace(/^en-/, '');
  const safeGpuSlug = (gpu.slug || slugify(gpu.name)).replace(/^en-/, '');
  const baseComboUrl = gameSlug ? `${safeCpuSlug}-with-${safeGpuSlug}-in-${gameSlug}` : `${safeCpuSlug}-with-${safeGpuSlug}`;

  return (
    <div className="guru-bottleneck-wrapper" style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
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

        {/* 🔥 TOP AD SLOT - STRIKTNÍ SEPARACE */}
        <div style={{ marginBottom: '40px' }}>
            <div className="ad-desktop-wrapper">
              <SeznamAd zoneId={408654} width={970} height={210} />
            </div>
            <div className="ad-mobile-wrapper">
              <SeznamAd zoneId={408651} width={300} height={250} />
            </div>
        </div>

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
            <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', textAlign: 'left' }}>
              <AlgorithmicSeoText cpuName={cpu.name} gpuName={gpu.name} gameName={gameName} resolution={displayResolution} bottleneckPercent={bottleneckScore} isCpuBound={isCpuBottleneck} fps={estimatedFps} isEn={isEn} />
            </div>
        </section>

        {/* 🔥 INNER AD SLOT - STRIKTNÍ SEPARACE */}
        <div style={{ marginBottom: '40px' }}>
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

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="nofollow sponsored" className="live-btn"><Flame size={20} /> {isEn ? 'WATCH LIVE' : 'SLEDOVAT LIVE'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

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
        }
      `}} />
    </div>
  );
}
