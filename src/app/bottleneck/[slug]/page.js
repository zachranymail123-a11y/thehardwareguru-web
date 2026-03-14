import React from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, Activity, Zap, ShieldCheck, AlertTriangle, ArrowRight, Cpu, Monitor, Gauge, CheckCircle2, Flame, Heart, Swords, PlugZap, Layers, Database, Info, BarChart3, Gamepad2, ArrowUpCircle, ShoppingCart
} from 'lucide-react';

/**
 * GURU BOTTLENECK ENGINE V21.0 (ENTERPRISE SEO EDITION)
 * Cesta: src/app/bottleneck/[slug]/page.js
 * 🚀 CÍL: Fix indexace Bingu (odstranění duplicit) a 100% sémantická shoda.
 * 🛡️ FIX 1: Jazyk isEn se bere z prop (předáno z /en/ proxy), ne ze slugu.
 * 🛡️ FIX 2: Absolutní Canonical a Hreflang URL (nutné pro Bing Webmaster Tools).
 * 🛡️ FIX 3: Automatické očištění slugů HW od 'en-' prefixu před dotazem do DB.
 */

export const runtime = "nodejs";
export const revalidate = 86400; // 24h cache pro stabilitu crawlerů

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const normalizeName = (name = '') => name.replace(/AMD |Intel |NVIDIA |GeForce |Ryzen |Core |Radeon /gi, '');
const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu|processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';

// 🛡️ GURU ENGINE: 3-TIER BULLETPROOF LOOKUP
const findHw = async (table, rawSlugPart) => {
  if (!rawSlugPart || rawSlugPart === 'undefined') return null;
  
  // 🚀 GURU FIX: Očištění od 'en-' prefixu, který se může vloupat do lookupu z URL
  const slugPart = rawSlugPart.replace(/^en-/, '');
  
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };
  const joinQuery = table === 'gpus' ? 'game_fps!gpu_id(*)' : 'cpu_game_fps!cpu_id(*)';

  try {
      // TIER 1: Exact match
      const r1 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=eq.${slugPart}&limit=1`, { headers, cache: 'force-cache' });
      if (r1.ok) { const d1 = await r1.json(); if (d1?.length) return d1[0]; }
      
      // TIER 2: Substring match
      const r2 = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*,${joinQuery}&slug=ilike.*${slugPart}*&limit=1`, { headers, cache: 'force-cache' });
      if (r2.ok) { const d2 = await r2.json(); if (d2?.length) return d2[0]; }

      // TIER 3: Tokenized Search
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
    
    const { cpu, gpu } = data;
    const title = isEn 
      ? `${cpu.name} + ${gpu.name} Bottleneck Analysis` 
      : `${cpu.name} + ${gpu.name} – Analýza Bottlenecku a FPS`;
    
    const safeSlug = params.slug.replace(/^en-/, '');
    const canonicalUrl = `${baseUrl}/bottleneck/${safeSlug}`;

    return { 
        title: `${title} | The Hardware Guru`,
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
  // 🚀 GURU FIX: Priorita isEn z props (z EN proxy), jinak fallback na slug
  const isEn = props.isEn === true || params.slug.startsWith('en-');
  const data = await getAnalysisData(params.slug);

  if (!data?.cpu || !data?.gpu) return notFound();

  const { cpu, gpu, gameSlug, resolution } = data;
  const cpuPower = cpu.performance_index || 1;
  const gpuPower = gpu.performance_index || 1;
  
  // Guru Bottleneck Formula
  const bottleneckScore = cpuPower < gpuPower * 0.75 
    ? Math.min(Math.round(((gpuPower / cpuPower) - 1) * 20), 100) 
    : (gpuPower < cpuPower * 0.6 ? Math.min(Math.round(((cpuPower / gpuPower) - 1) * 12), 100) : 0);
  
  const statusColor = bottleneckScore < 15 ? '#10b981' : (bottleneckScore < 30 ? '#f59e0b' : '#ef4444');

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="radar-badge"><Gauge size={16} /> GURU BOTTLENECK RADAR</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>
            <span style={{ color: cpu.vendor?.toUpperCase() === 'INTEL' ? '#0071c5' : '#ed1c24' }}>{normalizeName(cpu.name)}</span> <br/>
            <span style={{ color: '#fff', opacity: 0.3, fontSize: '0.4em', display: 'block', margin: '10px 0' }}>WITH</span>
            <span style={{ color: gpu.vendor?.toUpperCase() === 'NVIDIA' ? '#76b900' : '#ed1c24' }}>{normalizeName(gpu.name)}</span>
          </h1>
        </header>

        <section style={{ background: 'rgba(15, 17, 21, 0.95)', border: `1px solid ${statusColor}40`, borderRadius: '30px', padding: '60px 40px', textAlign: 'center', marginBottom: '60px', boxShadow: `0 30px 100px ${statusColor}15` }}>
            <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>{isEn ? 'System Bottleneck' : 'Bottleneck systému'}</div>
            <div style={{ fontSize: 'clamp(80px, 15vw, 130px)', fontWeight: '950', color: statusColor, lineHeight: '1', margin: '10px 0' }}>{bottleneckScore}%</div>
            <div className="status-pill" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                {bottleneckScore < 15 ? (isEn ? 'IDEAL MATCH' : 'IDEÁLNÍ PÁROVÁNÍ') : (isEn ? 'BOTTLENECK DETECTED' : 'ZJIŠTĚN BOTTLENECK')}
            </div>
        </section>

        {/* 🛒 AFFILIATE BUTTONS */}
        {(gpu.buy_link_cz || gpu.buy_link_en) && (
            <section style={{ marginBottom: '60px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {!isEn && gpu.buy_link_cz && (
                    <a href={gpu.buy_link_cz} target="_blank" rel="nofollow sponsored" className="btn-buy alza">
                        <ShoppingCart size={20} /> ZKONTROLOVAT CENU NA ALZA.CZ
                    </a>
                )}
                {isEn && gpu.buy_link_en && (
                    <a href={gpu.buy_link_en} target="_blank" rel="nofollow sponsored" className="btn-buy amazon">
                        <ShoppingCart size={20} /> CHECK PRICE ON AMAZON
                    </a>
                )}
            </section>
        )}

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
        .article-link-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.2s; }
        .article-link-card:hover { background: rgba(168, 85, 247, 0.1); color: #fff; border-color: rgba(168, 85, 247, 0.3); transform: translateX(5px); }
        .btn-buy { display: flex; align-items: center; gap: 12px; padding: 18px 35px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; font-size: 14px; transition: 0.3s; }
        .btn-buy.alza { background: #004996; color: #fff; }
        .btn-buy.amazon { background: #ff9900; color: #000; }
        .support-btn, .live-btn { display: flex; align-items: center; gap: 12px; padding: 18px 40px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .support-btn { background: #eab308; color: #000; }
        .live-btn { background: #000; color: #00ec64; border: 1px solid #00ec64; }
        @media (max-width: 768px) { .live-btn, .support-btn, .btn-buy { width: 100%; justify-content: center; } }
      `}} />
    </div>
  );
}
