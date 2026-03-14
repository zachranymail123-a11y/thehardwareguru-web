import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V22.0 (UNIQUE CONTENT & FPS EDITION)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🚀 CÍL: Fix masivního "Duplicate Content" v Bingu.
 * 🛡️ FIX 1: Jméno hry a rozlišení z URL propisujeme přímo do SEO Metadat (Title, Desc).
 * 🛡️ FIX 2: Dynamická matematika! Bottleneck skóre se mění dle rozlišení (1080p = CPU stress, 4K = GPU stress).
 * 🛡️ FIX 3: Extrahování a zobrazení odhadovaných FPS pro konkrétní hru přímo v Hero sekci.
 * 🛡️ FIX 4: Opraven routing pro "Lepší CPU/GPU", aby neskládal invalidní 'en-' URL adresy.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: 3-TIER BULLETPROOF LOOKUP
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
    
    // 🚀 GURU FIX: 100% UNIKÁTNÍ METADATA PRO BING/GOOGLE
    let titleSuffix = '';
    let descSuffix = '';
    if (gameSlug && resolution) {
        const gameName = gameSlug.replace(/-/g, ' ').toUpperCase();
        titleSuffix = ` in ${gameName} at ${resolution.toUpperCase()}`;
        descSuffix = ` ve hře ${gameName} v rozlišení ${resolution.toUpperCase()}`;
    } else if (gameSlug) {
        const gameName = gameSlug.replace(/-/g, ' ').toUpperCase();
        titleSuffix = ` in ${gameName}`;
        descSuffix = ` ve hře ${gameName}`;
    }

    const title = isEn 
      ? `${cpu.name} + ${gpu.name} Bottleneck Analysis${titleSuffix}` 
      : `${cpu.name} + ${gpu.name} – Analýza Bottlenecku${titleSuffix ? titleSuffix : ''}`;
    
    const desc = isEn
      ? `Calculate PC bottleneck for ${cpu.name} and ${gpu.name}${titleSuffix}. Detailed FPS analysis, upgrade recommendations and system balance.`
      : `Kalkulačka bottlenecku pro ${cpu.name} a ${gpu.name}${descSuffix}. Detailní analýza FPS, doporučení pro upgrade a vyváženost.`;

    const safeSlug = params.slug.replace(/^en-/, '');
    const canonicalUrl = `${baseUrl}/bottleneck/${safeSlug}`;

    return { 
        title: `${title} | The Hardware Guru`,
        description: desc,
        alternates: {
            canonical: isEn ? `${baseUrl}/en/bottleneck/${safeSlug}` : canonicalUrl,
            languages: {
                'en': `${baseUrl}/en/bottleneck/${safeSlug}`,
                'cs': canonicalUrl,
                'x-default': canonicalUrl
            }
        }
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
  
  // 🚀 GURU DYNAMICKÁ MATEMATIKA: Změna skóre na základě rozlišení
  let resModifierCpu = 1;
  let resModifierGpu = 1;
  if (resolution === '1080p') {
      resModifierCpu = 0.85; // 1080p drtí procesor
      resModifierGpu = 1.15;
  } else if (resolution === '4k') {
      resModifierCpu = 1.25; // 4K drtí grafiku
      resModifierGpu = 0.80;
  }

  const effCpuPower = cpuPower * resModifierCpu;
  const effGpuPower = gpuPower * resModifierGpu;

  // Guru Bottleneck Formula
  let bottleneckScore = effCpuPower < effGpuPower * 0.75 
    ? Math.min(Math.round(((effGpuPower / effCpuPower) - 1) * 20), 100) 
    : (effGpuPower < effCpuPower * 0.6 ? Math.min(Math.round(((effCpuPower / effGpuPower) - 1) * 12), 100) : 0);
  
  const isCpuBottleneck = effCpuPower < effGpuPower * 0.75;
  let bottleneckType = '';
  if (bottleneckScore > 15) {
      bottleneckType = isCpuBottleneck ? 'CPU' : 'GPU';
  }

  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');

  // 🚀 GURU FPS ESTIMATION ENGINE
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
      if (gFps > 0 && cFps > 0) {
          estimatedFps = Math.min(gFps, cFps);
      } else if (gFps > 0) {
          estimatedFps = gFps;
      } else if (cFps > 0) {
          estimatedFps = cFps;
      }
  }

  // 🚀 GURU FIX: Oprava URL pro recirkulaci (vyčištění "en-")
  const safeCpuSlug = (cpu.slug || slugify(cpu.name)).replace(/^en-/, '');
  const safeGpuSlug = (gpu.slug || slugify(gpu.name)).replace(/^en-/, '');
  
  const betterCpuPath = `core-i7-14700k-with-${safeGpuSlug}`;
  const betterGpuPath = `${safeCpuSlug}-with-geforce-rtx-5080`;

  // JSON-LD
  const titleSuffix = gameName ? ` in ${gameName}${resText ? ` at ${resText}` : ''}` : '';
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${normalizeName(cpu.name)} a bottleneck for ${normalizeName(gpu.name)}${titleSuffix}?` : `Bude ${normalizeName(cpu.name)} brzdit grafiku ${normalizeName(gpu.name)}${gameName ? ` ve hře ${gameName}`:''}?`,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": bottleneckScore < 15 
              ? (isEn ? `No, this is an ideal match with only ${bottleneckScore}% bottleneck.` : `Ne, jde o ideální spojení s minimálním bottleneckem pouze ${bottleneckScore} %.`)
              : (isEn ? `Yes, there is a ${bottleneckScore}% ${bottleneckType} bottleneck in this system.` : `Ano, systém vykazuje omezení výkonu o hodnotě ${bottleneckScore} % ze strany ${bottleneckType}.`)
        }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": isEn ? `${normalizeName(cpu.name)} and ${normalizeName(gpu.name)} bottleneck analysis${titleSuffix}` : `Analýza bottlenecku: ${normalizeName(cpu.name)} a ${normalizeName(gpu.name)}${titleSuffix}`,
    "description": isEn ? `System calculates a bottleneck score of ${bottleneckScore}%.` : `Systém vypočítal úroveň bottlenecku na ${bottleneckScore} %.`,
    "author": { "@type": "Organization", "name": "The Hardware Guru" }
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="radar-badge"><Gauge size={16} /> GURU BOTTLENECK RADAR</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.3, fontSize: '0.4em', display: 'block', margin: '10px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
          {gameName && (
             <div style={{ color: '#66fcf1', fontSize: '15px', fontWeight: '950', marginTop: '25px', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Gamepad2 size={18} style={{ marginBottom: '-2px' }}/> {isEn ? 'PERFORMANCE IN' : 'VÝKON VE HŘE'} {gameName} {resText && `(${resText})`}
             </div>
          )}
        </header>

        {/* 🚀 GURU FIX: SPLIT HERO KARTA (BOTTLENECK + FPS) */}
        <section style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${statusColor}40`, borderRadius: '30px', padding: '50px 40px', textAlign: 'center', marginBottom: '60px', boxShadow: `0 30px 100px ${statusColor}15` }}>
            <div style={{ display: 'grid', gridTemplateColumns: estimatedFps ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'System Bottleneck' : 'Bottleneck systému'}</div>
                    <div style={{ fontSize: 'clamp(70px, 12vw, 110px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '15px 0' }}>{bottleneckScore}%</div>
                    <div className="status-pill" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                        {bottleneckScore < 15 ? (isEn ? 'IDEAL MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? `${bottleneckType} BOTTLENECK DETECTED` : `ZJIŠTĚN BOTTLENECK (${bottleneckType})`)}
                    </div>
                </div>
                {estimatedFps && (
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '40px' }} className="border-mobile-fix">
                    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'Estimated Average FPS' : 'Odhadovaný průměr FPS'}</div>
                    <div style={{ fontSize: 'clamp(70px, 12vw, 110px)', fontWeight: '950', color: '#fff', lineHeight: '1', margin: '15px 0' }}>{estimatedFps}</div>
                    <div className="status-pill" style={{ background: `rgba(255,255,255,0.05)`, color: '#d1d5db', border: `1px solid rgba(255,255,255,0.1)` }}>
                        {gameName} @ {resText || '1440P'}
                    </div>
                </div>
                )}
            </div>
        </section>

        {/* 🚀 DOPORUČENÍ PRO SESTAVU */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #66fcf1' }}>
            {isEn ? 'SYSTEM RECOMMENDATIONS' : 'DOPORUČENÍ PRO SESTAVU'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             <div className="spec-card-box">
                <PlugZap size={24} color="#f97316" />
                <div className="card-label">PSU (ZDROJ)</div>
                <div className="card-val">{gpu.tdp_w > 300 ? '850W+' : (gpu.tdp_w > 200 ? '750W' : '650W')}</div>
             </div>
             <div className="spec-card-box">
                <Layers size={24} color="#10b981" />
                <div className="card-label">CHIPSET</div>
                <div className="card-val">{cpu.vendor === 'AMD' ? 'B650 / X670' : 'B760 / Z790'}</div>
             </div>
             <div className="spec-card-box">
                <Database size={24} color="#a855f7" />
                <div className="card-label">RAM</div>
                <div className="card-val">{cpu.name.includes('5000') ? 'DDR4 3600 MT/s' : '32GB DDR5 6000MT/s'}</div>
             </div>
          </div>
        </section>

        {/* 🚀 RECIRKULACE: CHCETE VYŠŠÍ VÝKON? (GURU FIX LINKŮ) */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #f59e0b' }}>
            {isEn ? 'WANT BETTER PERFORMANCE?' : 'CHCETE VYŠŠÍ VÝKON?'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <a href={isEn ? `/en/bottleneck/${betterCpuPath}` : `/bottleneck/${betterCpuPath}`} className="recirc-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-circle"><Cpu size={24} /></div>
                    <div>
                        <div className="card-label-small">{isEn ? 'UPGRADE CPU' : 'LEPŠÍ PROCESOR'}</div>
                        <div className="card-title">Srovnat s i7-14700K</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
              </a>
              <a href={isEn ? `/en/bottleneck/${betterGpuPath}` : `/bottleneck/${betterGpuPath}`} className="recirc-card" style={{ borderLeftColor: '#76b900' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-circle" style={{ background: '#76b90020', color: '#76b900' }}><Zap size={24} /></div>
                    <div>
                        <div className="card-label-small">{isEn ? 'UPGRADE GPU' : 'LEPŠÍ GRAFIKA'}</div>
                        <div className="card-title">Srovnat s RTX 5080</div>
                    </div>
                  </div>
                  <ArrowRight size={20} />
              </a>
          </div>
        </section>

        {/* 📚 GURU MASTERCLASS (RECIRCULATION) */}
        <section style={{ marginBottom: '60px' }}>
             <h2 className="section-h2" style={{ borderLeft: '4px solid #a855f7' }}>{isEn ? 'GURU MASTERCLASS' : 'GURU RÁDCE'}</h2>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                  <a href={isEn ? "/en/clanky/jak-vyresit-bottleneck-navod" : "/clanky/jak-vyresit-bottleneck-navod"} className="article-link-card"><Info size={18} /> {isEn ? 'How to fix bottleneck' : 'Jak vyřešit bottleneck'}</a>
                  <a href={isEn ? "/en/clanky/nejlepsi-cpu-pro-rtx-5090-5080" : "/clanky/nejlepsi-cpu-pro-rtx-5090-5080"} className="article-link-card"><BarChart3 size={18} /> {isEn ? 'Best CPU for RTX 50' : 'Nejlepší CPU pro RTX 50'}</a>
                  <a href={isEn ? "/en/clanky/jak-usetrit-na-hardwaru-navod" : "/clanky/jak-usetrit-na-hardwaru-navod"} className="article-link-card"><Flame size={18} /> {isEn ? 'Save on Hardware' : 'Jak ušetřit na HW'}</a>
             </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '60px' }}>
            <a href="https://kick.com/thehardwareguru" target="_blank" rel="nofollow sponsored" className="live-btn"><Flame size={20} /> {isEn ? 'WATCH LIVE' : 'SLEDOVAT LIVE'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .radar-badge { display: inline-flex; align-items: center; gap: 8px; color: #66fcf1; font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px; padding: 6px 20px; border: 1px solid rgba(102, 252, 241, 0.3); border-radius: 50px; background: rgba(102, 252, 241, 0.05); }
        .status-pill { padding: 12px 35px; border-radius: 50px; display: inline-block; font-weight: 950; fontSize: 14px; text-transform: uppercase; }
        .section-h2 { color: #fff; font-size: 1.5rem; font-weight: 950; text-transform: uppercase; margin-bottom: 30px; padding-left: 15px; }
        
        .spec-card-box { background: rgba(15, 17, 21, 0.95); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .card-label { font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin: 10px 0 5px; }
        .card-val { font-size: 18px; font-weight: 950; color: #fff; }

        .recirc-card { display: flex; align-items: center; justify-content: space-between; background: rgba(15,17,21,0.95); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); border-left: 5px solid #f59e0b; text-decoration: none; color: #fff; transition: 0.3s; }
        .recirc-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); }
        .icon-circle { width: 50px; height: 50px; border-radius: 50%; background: rgba(245, 158, 11, 0.1); color: #f59e0b; display: flex; align-items: center; justify-content: center; }
        .card-label-small { font-size: 9px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .card-title { font-size: 17px; font-weight: 950; margin-top: 2px; }
        
        .article-link-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.2s; }
        .article-link-card:hover { background: rgba(168, 85, 247, 0.1); color: #fff; border-color: rgba(168, 85, 247, 0.3); transform: translateX(5px); }
        .btn-buy { display: flex; align-items: center; gap: 12px; padding: 18px 35px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; font-size: 14px; transition: 0.3s; }
        .btn-buy.alza { background: #004996; color: #fff; }
        .btn-buy.amazon { background: #ff9900; color: #000; }
        .support-btn, .live-btn { display: flex; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .support-btn { background: #eab308; color: #000; }
        .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; }
        
        @media (max-width: 768px) { 
            .live-btn, .support-btn, .btn-buy { width: 100%; justify-content: center; } 
            .border-mobile-fix { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 40px; }
        }
      `}} />
    </div>
  );
}
