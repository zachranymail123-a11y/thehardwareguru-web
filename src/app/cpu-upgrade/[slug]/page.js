import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar,
  Trophy, Zap, Gamepad2, LayoutList, BarChart3, TrendingUp,
  ArrowRight, ExternalLink, ArrowUpCircle, Monitor, Crosshair,
  Cpu, Info, AlertTriangle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; 

/**
 * GURU CPU UPGRADE ENGINE - DETAIL V116.2 (ULTRA SMART SEARCH FIX)
 * 🚀 CÍL: Totální eliminace 404 chyb a příprava pro AdSense.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

// 🔥 GURU FIX: Povoleno dynamické generování pro všechny cesty
export const dynamicParams = true;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    const diff = Math.round((b.performance_index / a.performance_index - 1) * 100);
    return { winner: b, loser: a, diff };
}

const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  
  // 🔥 GURU FIX: Definujeme selectQuery s ošetřenými relacemi
  const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
  
  const performSearch = async (targetSlug, method = 'eq') => {
      const filter = method === 'eq' ? `slug=eq.${targetSlug}` : `slug=ilike.%${targetSlug}%`;
      try {
          const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, 
            cache: 'no-store'
          });
          if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) return data[0];
          }
      } catch(e) {}
      return null;
  };

  // 1. Zkusíme přesnou shodu (amd-ryzen-7-5800x3d-to-amd-ryzen-7-9800x3d)
  let result = await performSearch(cleanSlug, 'eq');
  if (result) return result;

  // 2. Ořežeme výrobce (ryzen-7-5800x3d-to-ryzen-7-9800x3d)
  const vendorlessSlug = cleanSlug.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '');
  if (vendorlessSlug !== cleanSlug) {
      result = await performSearch(vendorlessSlug, 'eq');
      if (result) return result;
  }

  // 3. Agresivní fuzzy vyhledávání přes LIKE
  result = await performSearch(vendorlessSlug, 'ilike');
  if (result) return result;

  // 4. Poslední záchrana - hledání podle názvu prvního CPU
  const firstCpu = vendorlessSlug.split('-to-')[0];
  if (firstCpu) {
      result = await performSearch(firstCpu, 'ilike');
  }

  return result;
});

const getSimilarUpgrades = async (cpuId, currentSlug) => {
    if (!supabaseUrl || !cpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=title_cs,title_en,slug,slug_en&or=(old_cpu_id.eq.${cpuId},new_cpu_id.eq.${cpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'force-cache'
        });
        if (res.ok) return await res.json();
    } catch (e) {}
    return [];
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const upgrade = await getUpgradeData(slug);
  
  if (!upgrade || !upgrade.oldCpu) {
    return { title: 'CPU Upgrade | Hardware Guru' };
  }

  const isEn = slug?.startsWith('en-');
  const { oldCpu, newCpu } = upgrade;
  const { diff } = calculatePerf(oldCpu, newCpu);
  return { 
    title: isEn ? `Upgrade ${oldCpu.name} to ${newCpu.name} (+${diff}% Perf)` : `Upgrade z ${oldCpu.name} na ${newCpu.name} (+${diff} % výkonu)`,
    description: isEn ? `Should you upgrade from ${oldCpu.name} to ${newCpu.name}?` : `Vyplatí se přechod z ${oldCpu.name} na ${newCpu.name}?`
  };
}

// 🛡️ POUZE JEDEN DEFAULT EXPORT
export default async function CpuUpgradePage({ params }) {
  const { slug } = await params;
  const upgrade = await getUpgradeData(slug);
  
  if (!upgrade) notFound();

  const isEn = slug?.startsWith('en-');
  const { oldCpu: cpuA, newCpu: cpuB } = upgrade;
  const { diff: finalPerfDiff } = calculatePerf(cpuA, cpuB);
  const similar = await (cpuA?.id ? getSimilarUpgrades(cpuA.id, upgrade.slug) : Promise.resolve([]));

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null || valA === valB) return { color: '#9ca3af' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#f59e0b', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const fpsA = cpuA?.cpu_game_fps?.[0] || {};
  const fpsB = cpuB?.cpu_game_fps?.[0] || {};

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((b / a) - 1) * 100);
  const gameStats = [
      { label: 'CYBERPUNK 2077', diff: calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p) },
      { label: 'WARZONE', diff: calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p) },
      { label: 'STARFIELD', diff: calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p) }
  ].filter(item => item.diff !== 0);

  const avgDiff = gameStats.length ? Math.round(gameStats.reduce((acc, curr) => acc + curr.diff, 0) / gameStats.length) : finalPerfDiff;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `CPU Upgrade: ${cpuA.name} to ${cpuB.name}`,
    "publisher": {
      "@type": "Organization",
      "name": "Hardware Guru",
      "logo": "https://thehardwareguru.cz/logo.png"
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn" style={{ textDecoration: 'none', color: '#f59e0b', fontWeight: '900' }}>
             ← {isEn ? 'BACK' : 'ZPĚT'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.1)' }}>
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', textTransform: 'uppercase', margin: '0' }}>
            {isEn ? "UPGRADE FROM" : "UPGRADE Z"} <span style={{ color: '#9ca3af' }}>{cpuA.name}</span> <br/>
            <span style={{ color: '#f59e0b' }}>TO {cpuB.name}</span>
          </h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="gpu-card-box" style={{ background: 'rgba(15,17,21,0.95)', padding: '30px', borderRadius: '24px', textAlign: 'center', borderTop: '5px solid #4b5563', opacity: 0.6 }}>
                <h2 style={{ fontSize: '20px' }}>{normalizeName(cpuA.name)}</h2>
            </div>
            <div style={{ fontSize: '24px', color: '#f59e0b' }}>➜</div>
            <div className="gpu-card-box" style={{ background: 'rgba(15,17,21,0.95)', padding: '30px', borderRadius: '24px', textAlign: 'center', borderTop: '5px solid #f59e0b', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }}>
                <h2 style={{ fontSize: '20px' }}>{normalizeName(cpuB.name)}</h2>
                <div style={{ color: '#f59e0b', fontWeight: '900', marginTop: '10px' }}>+{finalPerfDiff}% PERF</div>
            </div>
        </div>

        <div className="guru-upg-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        {/* 🚀 GURU: SEO ANALYSIS BLOCK */}
        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={24} color="#f59e0b" /> {isEn ? 'Upgrade Analysis' : 'Analýza upgradu'}
                </h2>
                <GuruCpuCompareText 
                    cpu1Name={normalizeName(cpuA.name)} 
                    cpu2Name={normalizeName(cpuB.name)} 
                    perfDiff={finalPerfDiff} 
                    cpu1Cores={cpuA.cores} 
                    cpu2Cores={cpuB.cores} 
                    isEn={isEn} 
                />
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '950', borderLeft: '4px solid #f59e0b', paddingLeft: '15px', marginBottom: '30px' }}>SPECIFIKACE</h2>
          <div style={{ background: 'rgba(15,17,21,0.95)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              {[
                { label: 'CORES / THREADS', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
                { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
                { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true }
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right' }}>{row.valA}</div>
                  <div style={{ width: '150px', textAlign: 'center', fontSize: '10px', color: '#6b7280', fontWeight: '900' }}>{row.label}</div>
                  <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left' }}>{row.valB}</div>
                </div>
              ))}
          </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" style={{ padding: '18px 30px', background: '#f97316', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', color: '#fff' }}>DEALS</a>
            <a href="/support" style={{ padding: '18px 30px', background: '#eab308', borderRadius: '16px', fontWeight: '950', textDecoration: 'none', color: '#000' }}>SUPPORT</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-upg-ad-slot { margin: 30px 0; padding: 15px; background: rgba(245, 158, 11, 0.02); border: 1px solid rgba(245, 158, 11, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }
        @media (max-width: 768px) {
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .guru-grid-ring { grid-template-columns: 1fr !important; }
        }
      `}} />
    </div>
  );
}
