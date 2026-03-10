import React, { cache } from 'react';
import { 
  ChevronLeft, 
  Flame, 
  Heart, 
  ArrowRight,
  ArrowUpCircle,
  LayoutList,
  BarChart3,
  Cpu
} from 'lucide-react';

/**
 * GURU CPU UPGRADE ENGINE V1.0
 * Cesta: src/app/cpu-upgrade/[slug]/page.js
 * 🛡️ ARCH: Auto-generovanie do DB, Math Fix ((b/a)-1), 3-Tier Lookup, CZ/EN.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU LOGIC HELPER: Výpočet výkonu (MATH FIX Z GPU)
function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    const diff = Math.round(((b.performance_index / a.performance_index) - 1) * 100);
    return { winner: b, loser: a, diff };
}

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO CPU
const findCpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=eq.${slugPart}&limit=1`, { headers, cache: 'no-store' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
  } catch(e) {}

  try {
      const res2 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&slug=ilike.*${slugPart}*&order=slug.asc`, { headers, cache: 'no-store' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }
  } catch(e) {}

  try {
      const cleanString = slugPart.replace(/-/g, ' ').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*,cpu_game_fps!cpu_id(*)&and=(${conditions})&order=name.asc`, { headers, cache: 'no-store' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

const getSimilarUpgrades = async (cpuId, currentSlug) => {
    if (!supabaseUrl || !cpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=title_cs,title_en,slug,slug_en&or=(old_cpu_id.eq.${cpuId},new_cpu_id.eq.${cpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, next: { revalidate: 86400 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

// 🚀 GURU ENGINE: Auto-zápis do DB
async function generateAndPersistUpgrade(slug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.includes('-to-') ? cleanSlug.split('-to-') : cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const [cpuA, cpuB] = await Promise.all([findCpu(parts[0]), findCpu(parts[1])]);
    if (!cpuA || !cpuB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, 
        old_cpu_id: cpuA.id, new_cpu_id: cpuB.id,
        title_cs: `Upgrade z ${cpuA.name} na ${cpuB.name}`, 
        title_en: `Upgrade from ${cpuA.name} to ${cpuB.name}`, 
        content_cs: '', content_en: '', 
        seo_description_cs: `Vyplatí se přechod z procesoru ${cpuA.name} na ${cpuB.name}? Podívejte se na srovnání výkonu a benchmarků.`,
        seo_description_en: `Is it worth upgrading your CPU from ${cpuA.name} to ${cpuB.name}? Check out the performance and benchmark comparison.`,
        created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
    });

    const selectQuery = "*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))";
    const checkExisting = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    
    const data = await checkExisting.json();
    return data[0] || null;
  } catch (err) { return null; }
}

const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const selectQuery = `*,oldCpu:cpus!old_cpu_id(*,cpu_game_fps!cpu_id(*)),newCpu:cpus!new_cpu_id(*,cpu_game_fps!cpu_id(*))`;
  
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistUpgrade(slug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const upgrade = await getUpgradeData(slug);
  if (!upgrade) return { title: '404 | Hardware Guru' };
  
  const isEn = slug?.startsWith('en-');
  const { oldCpu, newCpu } = upgrade;
  const { diff } = calculatePerf(oldCpu, newCpu);

  const title = isEn 
    ? `Upgrade from ${oldCpu.name} to ${newCpu.name} (+${diff}% Perf)` 
    : `Vyplatí se upgrade z ${oldCpu.name} na ${newCpu.name}? (+${diff} % výkon)`;

  const canonicalUrl = `https://thehardwareguru.cz/cpu-upgrade/${upgrade.slug}`;

  return { 
    title: `${title} | The Hardware Guru`, 
    description: isEn 
      ? `Thinking about upgrading your CPU to ${newCpu.name}? See the real performance comparison against ${oldCpu.name}.`
      : `Zvažujete přechod na procesor ${newCpu.name}? Podívejte se na reálné srovnání výkonu proti ${oldCpu.name}.`,
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        "en": `https://thehardwareguru.cz/en/cpu-upgrade/${(upgrade.slug_en || `en-${upgrade.slug}`).replace(/^en-en-/,'en-')}`,
        "cs": canonicalUrl
      }
    }
  };
}

const normalizeName = (name = '') => name.replace(/AMD |Intel |Ryzen |Core /gi, '');

export default async function App({ params }) {
  const slug = params?.slug ?? null;
  const upgrade = await getUpgradeData(slug);
  
  if (!upgrade) return (
    <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>
      UPGRADE PATH NENALEZENA
    </div>
  );

  const isEn = slug?.startsWith('en-');
  const { oldCpu: cpuA, newCpu: cpuB } = upgrade;

  if (!cpuA || !cpuB) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>CPU DATA ERROR</div>;
  
  const similarPromise = cpuA?.id ? getSimilarUpgrades(cpuA.id, upgrade.slug) : Promise.resolve([]);
  const { diff: finalPerfDiff } = calculatePerf(cpuA, cpuB);
  const similar = await similarPromise;

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#f59e0b', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'AMD' ? '#ed1c24' : '#0071c5';
  };

  const fpsA = cpuA?.cpu_game_fps && Array.isArray(cpuA.cpu_game_fps) && cpuA.cpu_game_fps.length ? cpuA.cpu_game_fps[0] : (cpuA?.cpu_game_fps || {});
  const fpsB = cpuB?.cpu_game_fps && Array.isArray(cpuB.cpu_game_fps) && cpuB.cpu_game_fps.length ? cpuB.cpu_game_fps[0] : (cpuB?.cpu_game_fps || {});

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((b / a) - 1) * 100);
  const cbDiff = calcSafeDiff(fpsA?.cinebench_r23_multi, fpsB?.cinebench_r23_multi);
  const cs2Diff = calcSafeDiff(fpsA?.cs2_1080p, fpsB?.cs2_1080p);
  const cyberpunkDiff = calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p);
  
  const isWorthIt = (cpuB?.performance_index || 0) > (cpuA?.performance_index || 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/cpuvs' : '/cpuvs'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'CPU BATTLES' : 'CPU DUELY'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '50px', background: 'rgba(245,158,11,0.1)' }}>
            <Cpu size={14} /> GURU CPU ANALYSIS
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {isEn ? "SHOULD YOU UPGRADE FROM" : "VYPLATÍ SE UPGRADE Z"} <br/>
            <span style={{ color: '#9ca3af' }}>{cpuA.name}</span> <br/>
            <span style={{ color: '#f59e0b' }}>TO {cpuB.name}?</span>
          </h1>
          
          <div style={{ color: '#9ca3af', fontSize: '18px', marginTop: '20px', maxWidth: '850px', margin: '20px auto', lineHeight: '1.6' }}>
            {isWorthIt ? (
                isEn 
                ? <p>Moving from the <strong>{cpuA.name}</strong> to the <strong>{cpuB.name}</strong> will grant you roughly <strong>{finalPerfDiff}% more performance</strong>.</p>
                : <p>Přechod z procesoru <strong>{cpuA.name}</strong> na <strong>{cpuB.name}</strong> vám zajistí průměrně o <strong>{finalPerfDiff} % vyšší hrubý výkon</strong>.</p>
            ) : (
                isEn
                ? <p>Upgrading to the <strong>{cpuB.name}</strong> does not provide a meaningful boost compared to your current <strong>{cpuA.name}</strong>.</p>
                : <p>Upgrade na <strong>{cpuB.name}</strong> nepředstavuje oproti vašemu <strong>{cpuA.name}</strong> žiadny zásadní posun.</p>
            )}
          </div>

          {isWorthIt && (
            <div className="guru-verdict" style={{ borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                {isEn ? 'VERDICT:' : 'VERDIKT:'} <strong>{cpuB.name}</strong> {isEn ? 'is a solid upgrade' : 'je výborný upgrade'} (+{finalPerfDiff}%)
            </div>
          )}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px', position: 'relative' }}>
            <div className="gpu-card-box" style={{ borderTop: `5px solid #4b5563`, filter: 'grayscale(0.5)' }}>
                <span className="vendor-label" style={{ color: '#9ca3af' }}>{isEn ? 'CURRENT CPU' : 'VÁŠ SOUČASNÝ PROCESOR'}</span>
                <h2 className="gpu-name-text" style={{ color: '#d1d5db', fontSize: 'clamp(1.2rem, 2.5vw, 2rem)' }}>{normalizeName(cpuA.name)}</h2>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>{cpuA.cores} Cores / {cpuA.threads} Threads</div>
            </div>
            
            <div className="vs-center-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="upgrade-badge"><ArrowRight size={32} /></div>
            </div>

            <div className="gpu-card-box" style={{ borderTop: `5px solid ${getVendorColor(cpuB.vendor)}`, transform: 'scale(1.05)', zIndex: 5, boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}>
                <span className="vendor-label" style={{ color: getVendorColor(cpuB.vendor) }}>{isEn ? 'NEW UPGRADE' : 'NOVÝ UPGRADE'}</span>
                <h2 className="gpu-name-text" style={{ color: '#fff' }}>{normalizeName(cpuB.name)}</h2>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#f59e0b', fontWeight: '950' }}>+{finalPerfDiff}% {isEn ? 'RAW POWER' : 'VÝKONU NAVÍC'}</div>
            </div>
        </div>

        {Object.keys(fpsA || {}).length > 0 && Object.keys(fpsB || {}).length > 0 && (
            <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style" style={{ borderLeft: '6px solid #f59e0b' }}>
                <h2 className="section-h2" style={{ color: '#f59e0b', border: 'none', padding: 0 }}>
                <BarChart3 size={28} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                {isEn ? 'ESTIMATED PERFORMANCE GAIN' : 'ODHADOVANÝ NÁRŮST VÝKONU'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {[
                        { label: 'CINEBENCH R23 (MULTI)', diff: cbDiff, oldFps: fpsA.cinebench_r23_multi, newFps: fpsB.cinebench_r23_multi },
                        { label: 'CS2 (1080p)', diff: cs2Diff, oldFps: fpsA.cs2_1080p, newFps: fpsB.cs2_1080p },
                        { label: 'CYBERPUNK 2077 (1440p)', diff: cyberpunkDiff, oldFps: fpsA.cyberpunk_1440p, newFps: fpsB.cyberpunk_1440p }
                    ].map((item, i) => (
                        <div key={i} className="summary-item">
                            <span className="summary-label">{item.label}</span>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>{item.oldFps ?? '-'} ➔ <span style={{ color: '#fff', fontWeight: 'bold' }}>{item.newFps ?? '-'}</span></div>
                            <div className="summary-val" style={{ color: item.diff >= 0 ? '#f59e0b' : '#ef4444' }}>{item.diff > 0 ? '+' : ''}{item.diff} %</div>
                        </div>
                    ))}
                </div>
            </div>
            </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: '#f59e0b' }}>
            <LayoutList size={28} /> {isEn ? 'UPGRADE SPECIFICATIONS' : 'POROVNÁNIE PARAMETROV'}
          </h2>
          <div className="table-wrapper">
             <div className="spec-row-style" style={{ background: 'rgba(0,0,0,0.5)', color: '#9ca3af', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 <div style={{ flex: 1, textAlign: 'right' }}>{isEn ? 'CURRENT' : 'SOUČASNÝ'}</div>
                 <div className="table-label"></div>
                 <div style={{ flex: 1, textAlign: 'left', color: '#f59e0b' }}>{isEn ? 'UPGRADE' : 'NOVÝ'}</div>
             </div>
             {[
               { label: isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA', valA: `${cpuA?.cores ?? '-'}/${cpuA?.threads ?? '-'}`, valB: `${cpuB?.cores ?? '-'}/${cpuB?.threads ?? '-'}`, winA: cpuA?.cores, winB: cpuB?.cores },
               { label: 'BASE CLOCK', valA: `${cpuA?.base_clock_mhz ?? '-'} MHz`, valB: `${cpuB?.base_clock_mhz ?? '-'} MHz`, winA: cpuA?.base_clock_mhz, winB: cpuB?.base_clock_mhz },
               { label: 'BOOST CLOCK', valA: `${cpuA?.boost_clock_mhz ?? '-'} MHz`, valB: `${cpuB?.boost_clock_mhz ?? '-'} MHz`, winA: cpuA?.boost_clock_mhz, winB: cpuB?.boost_clock_mhz },
               { label: 'TDP', valA: `${cpuA?.tdp_w ?? '-'} W`, valB: `${cpuB?.tdp_w ?? '-'} W`, winA: cpuA?.tdp_w ?? 999, winB: cpuB?.tdp_w ?? 999, lower: true },
               { label: 'L3 CACHE', valA: `${cpuA?.l3_cache_mb ?? '-'} MB`, valB: `${cpuB?.l3_cache_mb ?? '-'} MB`, winA: cpuA?.l3_cache_mb, winB: cpuB?.l3_cache_mb }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '16px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {similar.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: '#f59e0b' }}>
              <LayoutList size={28} /> {isEn ? `MORE UPGRADE PATHS` : `ĎALŠIE VARIANTY UPGRADU`}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '15px' }}>
              {similar.map((s, i) => (
                <a key={i} href={isEn ? `/en/cpu-upgrade/${s.slug_en ?? `en-${s.slug}`}` : `/cpu-upgrade/${s.slug}`} className="similar-link-card">
                  <ArrowUpCircle size={16} color="#f59e0b" /> {isEn ? (s.title_en ?? s.title_cs) : s.title_cs}
                </a>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="deals-btn-style"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠIE CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn-style"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPORIŤ GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #f59e0b; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(245, 158, 11, 0.3); transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #f59e0b; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 50px; display: inline-block; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(10px); flex: 1; transition: 0.3s; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .gpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .upgrade-badge { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(245, 158, 11, 0.5); z-index: 10; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .summary-label { display: block; font-size: 10px; font-weight: 900; color: #4b5563; margin-bottom: 8px; letter-spacing: 1px; }
        .summary-val { font-size: 24px; font-weight: 950; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #f59e0b; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .similar-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.8); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .deals-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .support-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .upgrade-badge { margin: 10px auto; rotate: 90deg; } .deals-btn-style, .support-btn-style { width: 100%; } .table-label { width: 100px; } }
      `}} />
    </div>
  );
}
