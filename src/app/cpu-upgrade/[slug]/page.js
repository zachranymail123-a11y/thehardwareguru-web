import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar,
  Trophy, 
  Zap,
  Gamepad2,
  LayoutList,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ArrowUpCircle,
  Monitor,
  Crosshair,
  Cpu,
  Info,
  AlertTriangle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import GuruCpuCompareText from '../../../components/GuruCpuCompareText'; // 🚀 GURU: Import SEO generátoru

/**
 * GURU CPU UPGRADE ENGINE - DETAIL V115.6 (SEO TEXT UPDATE)
 * 🚀 CÍL: Přidán dynamický SEO generátor textu pro odstranění "Thin Content" hlášky z Bingu.
 */

export const runtime = "nodejs";
export const revalidate = 86400; 

export const dynamicParams = false;

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl) return [];
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=slug&limit=10000`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return [];
      const upgrades = await res.json();
      return upgrades.map((upg) => ({ slug: upg.slug }));
  } catch (e) { return []; }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => {
  return text ? text.toLowerCase().replace(/processor|cpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
};

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
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'force-cache'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return null; 
      return data[0];
  } catch (e) { return null; }
});

const getSimilarUpgrades = async (cpuId, currentSlug) => {
    if (!supabaseUrl || !cpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=title_cs,title_en,slug,slug_en&or=(old_cpu_id.eq.${cpuId},new_cpu_id.eq.${cpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            cache: 'force-cache'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) notFound();
  const isEn = slug?.startsWith('en-');
  const { oldCpu, newCpu } = upgrade;
  const { diff } = calculatePerf(oldCpu, newCpu);
  return { title: isEn ? `Upgrade ${oldCpu.name} to ${newCpu.name} (+${diff}% Perf)` : `Upgrade z ${oldCpu.name} na ${newCpu.name} (+${diff} % výkon)` };
}

export default async function App({ params }) {
  const { slug } = await params;
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) notFound();

  const isEn = slug?.startsWith('en-');
  const { oldCpu: cpuA, newCpu: cpuB } = upgrade;
  const { diff: finalPerfDiff } = calculatePerf(cpuA, cpuB);
  const similar = await (cpuA?.id ? getSimilarUpgrades(cpuA.id, upgrade.slug) : Promise.resolve([]));

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#f59e0b', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const fpsA = cpuA?.cpu_game_fps && Array.isArray(cpuA.cpu_game_fps) && cpuA.cpu_game_fps.length ? cpuA.cpu_game_fps[0] : (cpuA?.cpu_game_fps || {});
  const fpsB = cpuB?.cpu_game_fps && Array.isArray(cpuB.cpu_game_fps) && cpuB.cpu_game_fps.length ? cpuB.cpu_game_fps[0] : (cpuB?.cpu_game_fps || {});

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((b / a) - 1) * 100);
  const gameStats = [
      { label: 'CYBERPUNK 2077', diff: calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p) },
      { label: 'WARZONE', diff: calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p) },
      { label: 'STARFIELD', diff: calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p) }
  ].filter(item => Number.isFinite(item.diff) && item.diff !== 0);

  const avgDiff = gameStats.length ? Math.round(gameStats.reduce((acc, curr) => acc + curr.diff, 0) / gameStats.length) : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}</a>
          <a href={isEn ? '/en/cpuvs/ranking' : '/cpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'CPU TIER LIST' : 'ŽEBŘÍČEK'}</a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '50px', background: 'rgba(245, 158, 11, 0.1)' }}>
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0' }}>
            {isEn ? "UPGRADE FROM" : "UPGRADE Z"} <span style={{ color: '#9ca3af' }}>{cpuA.name}</span> <br/>
            <span style={{ color: '#f59e0b' }}>TO {cpuB.name}</span>
          </h1>
        </header>

        {/* FIX STYLU PRO GRID */}
        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="gpu-card-box" style={{ borderTop: '5px solid #4b5563', filter: 'grayscale(0.5)' }}>
                <h2 className="gpu-name-text">{normalizeName(cpuA.name)}</h2>
            </div>
            <div className="vs-badge" style={{ background: '#f59e0b' }}>➜</div>
            <div className="gpu-card-box" style={{ borderTop: '5px solid #f59e0b', transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}>
                <h2 className="gpu-name-text">{normalizeName(cpuB.name)}</h2>
            </div>
        </div>

        {/* 🔥 ADS SLOT #1: TOP PLACEMENT POD UPGRADE RINGEM */}
        <div className="guru-upg-ad-slot">
            <span className="ad-label">Advertisement</span>
            <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
            <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
        </div>

        {gameStats.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <div className="content-box-style" style={{ borderLeft: '6px solid #f59e0b' }}>
                    <h2 className="section-h2" style={{ color: '#f59e0b', border: 'none', padding: 0 }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'GAMING PERFORMANCE GAIN' : 'NÁRŮST HERNÍHO VÝKONU'}</h2>
                    {/* FIX STYLU PRO GRID 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        {gameStats.map((item, i) => (
                            <div key={i} className="summary-item">
                                <span className="summary-label">{item.label}</span>
                                <div className="summary-val" style={{ color: item.diff >= 0 ? '#f59e0b' : '#ef4444' }}>{item.diff > 0 ? `+${item.diff}` : item.diff} %</div>
                            </div>
                        ))}
                        <div className="summary-item" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            <span className="summary-label" style={{ color: '#f59e0b' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                            <div className="summary-val">+{avgDiff} %</div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* 🚀 GURU: UNIKÁTNÍ SEO TEXT (VLOŽENO ZDE) */}
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
          <h2 className="section-h2" style={{ borderLeftColor: '#f59e0b' }}><LayoutList size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'UPGRADE SPECIFICATIONS' : 'POROVNÁNÍ PARAMETRŮ'}</h2>
          <div className="table-wrapper">
              {[
                { label: 'CORES / THREADS', valA: `${cpuA.cores}/${cpuA.threads}`, valB: `${cpuB.cores}/${cpuB.threads}`, winA: cpuA.cores, winB: cpuB.cores },
                { label: 'BOOST CLOCK', valA: `${cpuA.boost_clock_mhz} MHz`, valB: `${cpuB.boost_clock_mhz} MHz`, winA: cpuA.boost_clock_mhz, winB: cpuB.boost_clock_mhz },
                { label: 'TDP', valA: `${cpuA.tdp_w}W`, valB: `${cpuB.tdp_w}W`, winA: cpuA.tdp_w, winB: cpuB.tdp_w, lower: true }
              ].map((row, i) => (
                <div key={i} className="spec-row-style">
                  <div style={getWinnerStyle(row.winA, row.winB, row.lower)} className="spec-val-side">{row.valA}</div>
                  <div className="table-label">{row.label}</div>
                  <div style={getWinnerStyle(row.winB, row.winA, row.lower)} className="spec-val-side">{row.valB}</div>
                </div>
              ))}

              {/* 🔥 ADS SLOT #2: MEZI SPECIFIKACEMI */}
              <div className="guru-upg-ad-slot" style={{ border: 'none', margin: '10px 0' }}>
                  <div className="ad-desktop"><iframe data-aa='2431217' src='https://acceptable.a-ads.com/2431217/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
                  <div className="ad-mobile"><iframe data-aa='2431218' src='https://acceptable.a-ads.com/2431218/?size=Adaptive' style={{border:0, padding:0, width:'100%', height:'100px', overflow:'hidden', display: 'block', margin: 'auto'}}></iframe></div>
              </div>

              <div className="spec-row-style">
                  <div className="spec-val-side" style={{ opacity: 0.5 }}>{cpuA.architecture}</div>
                  <div className="table-label">ARCHITECTURE</div>
                  <div className="spec-val-side" style={{ color: '#f59e0b' }}>{cpuB.architecture}</div>
              </div>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 17, 21, 0.95) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '40px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{isEn ? 'BOTTLENECK CHECK' : 'KONTROLA BOTTLENECKU'}</h3>
                    <p style={{ color: '#9ca3af', margin: 0 }}>{isEn ? `Will your GPU handle the ${normalizeName(cpuB.name)}?` : `Bude tvá grafika stačit na procesor ${normalizeName(cpuB.name)}?`}</p>
                </div>
                {/* 🚀 OPRAVENÝ ODKAZ (BEZPEČNÝ LINK NATVRDO) */}
                <a href={isEn ? '/en/bottleneck-calculator' : '/bottleneck-kalkulacka'} className="guru-bottleneck-btn" style={{ background: '#f59e0b', color: '#000', padding: '15px 30px', borderRadius: '12px', fontWeight: '950', textDecoration: 'none' }}>{isEn ? 'VERIFY' : 'OVĚŘIT'}</a>
            </div>
        </section>

        {similar.length > 0 && (
            <section style={{ marginBottom: '60px' }}>
                <h2 className="section-h2" style={{ borderLeftColor: '#f59e0b' }}><ArrowUpCircle size={28} color="#f59e0b" style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'MORE UPGRADES' : 'DALŠÍ UPGRADY'}</h2>
                {/* FIX STYLU PRO GRID 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    {similar.map(upg => (
                        <a key={upg.slug} href={isEn ? `/en/cpu-upgrade/${upg.slug_en || upg.slug}` : `/cpu-upgrade/${upg.slug}`} className="silo-link-card">
                            <span style={{ fontWeight: '900' }}>{isEn && upg.title_en ? upg.title_en : upg.title_cs}</span>
                            <ArrowRight size={16} color="#f59e0b" />
                        </a>
                    ))}
                </div>
            </section>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%', marginTop: '50px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn"><Flame size={20} /> DEALS</a>
            <a href="/support" className="guru-support-btn"><Heart size={20} /> SUPPORT</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #f59e0b; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; }
        
        .guru-upg-ad-slot { margin: 30px 0; padding: 15px; background: rgba(245, 158, 11, 0.02); border: 1px solid rgba(245, 158, 11, 0.1); border-radius: 20px; text-align: center; }
        .ad-label { display: block; font-size: 9px; color: #444; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .ad-desktop { display: block; } .ad-mobile { display: none; }

        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; }
        .gpu-name-text { font-size: clamp(1.4rem, 3vw, 2.2rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 32px; border: 5px solid #0f1115; color: #000; }

        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .spec-val-side { flex: 1; }
        .spec-val-side:first-child { text-align: right; }
        .spec-val-side:last-child { text-align: left; }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }

        .summary-item { background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .summary-label { display: block; font-size: 10px; font-weight: 950; color: #6b7280; margin-bottom: 12px; letter-spacing: 2px; }
        .summary-val { font-size: 32px; font-weight: 950; }

        .silo-link-card { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 18px 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; transition: 0.3s; border-left: 3px solid #f59e0b; }
        .silo-link-card:hover { transform: translateX(5px); background: rgba(255,255,255,0.05); }

        .guru-support-btn, .guru-deals-btn { flex: 1; max-width: 300px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; border-radius: 16px; font-weight: 950; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
        .guru-deals-btn { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; }
        .guru-support-btn { background: #eab308; color: #000; }

        @media (max-width: 768px) {
            .ad-desktop { display: none; } .ad-mobile { display: block; }
            .guru-grid-ring { grid-template-columns: 1fr !important; }
            .vs-badge { margin: 10px auto; transform: rotate(90deg); }
            .table-label { width: 100px; }
            .spec-row-style { padding: 15px 10px; }
        }
      `}} />
    </div>
  );
}
