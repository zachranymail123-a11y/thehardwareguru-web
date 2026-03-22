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
 * GURU CPU UPGRADE ENGINE - DETAIL V116.3 (BACKUP design + ULTRA SMART SEARCH)
 * 🚀 CÍL: Definitivní vyhubení 404 chyb při zachování tvého originálního vzhledu.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 
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
  const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  const performSearch = async (targetSlug, method = 'eq') => {
    const filter = method === 'eq' ? `slug=eq.${targetSlug}` : `slug=ilike.%${targetSlug}%`;
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&${filter}&limit=1`, { 
          headers, cache: 'no-store' 
        });
        if (res.ok) {
           const data = await res.json();
           if (data && data.length > 0) return data[0];
        }
    } catch (e) {}
    return null;
  };

  // 1. Přesná shoda (např. amd-ryzen-7-5700x-to-amd-ryzen-5-9600x)
  let result = await performSearch(cleanSlug, 'eq');
  if (result) return result;

  // 2. Ořezaná shoda bez značek výrobců (ryzen-7-5700x-to-ryzen-5-9600x)
  const vendorlessSlug = cleanSlug.replace(/(amd-|intel-|nvidia-|geforce-|radeon-)/gi, '');
  if (vendorlessSlug !== cleanSlug) {
      result = await performSearch(vendorlessSlug, 'eq');
      if (result) return result;
  }

  // 3. Agresivní fuzzy vyhledávání (%slug%)
  result = await performSearch(vendorlessSlug, 'ilike');
  if (result) return result;

  // 4. Poslední záchrana - hledání podle názvu prvního CPU v řetězci
  const firstPart = vendorlessSlug.split('-to-')[0];
  if (firstPart) {
      result = await performSearch(firstPart, 'ilike');
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
  const { slug } = params; // 🛡️ FIX: params není Promise (dle tvého návodu)
  const upgrade = await getUpgradeData(slug);
  
  if (!upgrade || !upgrade.oldCpu) {
    return { title: 'CPU Upgrade Analysis | The Hardware Guru' };
  }

  const isEn = slug?.startsWith('en-');
  const { oldCpu, newCpu } = upgrade;
  const { diff } = calculatePerf(oldCpu, newCpu);
  return { 
    title: isEn ? `Upgrade ${oldCpu.name} to ${newCpu.name} (+${diff}% Perf)` : `Upgrade z ${oldCpu.name} na ${newCpu.name} (+${diff} % výkonu)`
  };
}

export default async function CpuUpgradePage({ params }) {
  const { slug } = params; // 🛡️ FIX: params není Promise (dle tvého návodu)
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn" style={{ textDecoration: 'none', color: '#f59e0b', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', fontSize: '13px' }}>
             <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link" style={{ textDecoration: 'none', color: '#f59e0b', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase', fontSize: '13px' }}>
            <TrendingUp size={16} /> {isEn ? 'CPU TIER LIST' : 'ŽEBŘÍČEK'}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.1)' }}>
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.2' }}>
            {isEn ? "UPGRADE FROM" : "UPGRADE Z"} <span style={{ color: '#9ca3af' }}>{cpuA.name}</span> <br/>
            <span style={{ color: '#f59e0b' }}>TO {cpuB.name}</span>
          </h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="gpu-card-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '30px', borderRadius: '24px', textAlign: 'center', borderTop: '5px solid #4b5563', opacity: 0.6, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '950', margin: 0 }}>{normalizeName(cpuA.name)}</h2>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>➜</div>
            <div className="gpu-card-box" style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '30px', borderRadius: '24px', textAlign: 'center', borderTop: '5px solid #f59e0b', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '950', margin: 0 }}>{normalizeName(cpuB.name)}</h2>
                <div style={{ color: '#f59e0b', fontWeight: '900', marginTop: '10px', fontSize: '14px' }}>+{finalPerfDiff}% VÝKONU</div>
            </div>
        </div>

        <div className="guru-upg-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '45px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ marginBottom: '25px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={24} color="#f59e0b" /> ANALÝZA UPGRADU
                </h2>
                <div style={{ color: '#d1d5db', lineHeight: '1.8' }}>
                    <GuruCpuCompareText 
                        cpu1Name={normalizeName(cpuA.name)} 
                        cpu2Name={normalizeName(cpuB.name)} 
                        perfDiff={finalPerfDiff} 
                        cpu1Cores={cpuA.cores} 
                        cpu2Cores={cpuB.cores} 
                        isEn={isEn} 
                    />
                </div>
            </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '950', borderLeft: '4px solid #f59e0b', paddingLeft: '15px', marginBottom: '30px', textTransform: 'uppercase' }}>Specifikace</h2>
          <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
               {[
                 { label: 'CORES / THREADS', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
                 { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
                 { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true }
               ].map((row, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                   <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                   <div style={{ width: '150px', textAlign: 'center', fontSize: '10px', color: '#6b7280', fontWeight: '950' }}>{row.label}</div>
                   <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
                 </div>
               ))}
          </div>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
          <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" style={{ flex: '1', maxWidth: '300px', textAlign: 'center', padding: '18px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', textDecoration: 'none', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase' }}>DEALS</a>
          <a href="/support" style={{ flex: '1', maxWidth: '300px', textAlign: 'center', padding: '18px', background: '#eab308', color: '#000', textDecoration: 'none', borderRadius: '16px', fontWeight: '950', textTransform: 'uppercase' }}>SUPPORT</a>
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
