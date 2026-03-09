import React, { cache } from 'react';
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
  Crosshair
} from 'lucide-react';

/**
 * GURU GPU UPGRADE ENGINE - DETAIL V112.6 (3-TIER BULLETPROOF LOOKUP)
 * Cesta: src/app/gpu-upgrade/[slug]/page.js
 * 🛡️ FIX 1: Vyřešen problém chybějícího výrobce v URL (např. url má geforce-rtx..., ale DB má nvidia-geforce-rtx...).
 * 🛡️ FIX 2: Implementován 3-fázový lookup (Exact Slug -> Contains Slug -> Name Wildcard) pro 100% spolehlivost.
 * 🛡️ ARCH: Node.js runtime a ISR revalidate (86400) pro optimální SEO.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Standardní slugify pro generování URL a lookupy
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

// 🚀 GURU LOGIC HELPER: Výpočet výkonu
function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    const diff = Math.round((b.performance_index / a.performance_index - 1) * 100);
    return { winner: b, loser: a, diff };
}

// 🛡️ GURU ENGINE: Vyhledávání karty z DB (3-TIER SYSTEM)
const findGpu = async (slugPart) => {
  if (!supabaseUrl || !slugPart) return null;

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };

  console.log("GPU LOOKUP INITIATED FOR:", slugPart);

  // 🛡️ TIER 1: Pokus o absolutní exact match (pokud URL 100% odpovídá slugu v DB)
  try {
      const url1 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${slugPart}&limit=1`;
      const res1 = await fetch(url1, { headers, cache: 'no-store' });
      if (res1.ok) {
          const data1 = await res1.json();
          if (data1?.length) return data1[0];
      }
  } catch(e) {}

  // 🛡️ TIER 2: Substring match na slug + vzestupné řazení 
  // Řeší chybějící prefixy (např. URL "rtx-5060" najde "nvidia-geforce-rtx-5060").
  // order=slug.asc zajistí, že základní model dostane přednost před "Ti" variantou.
  try {
      const url2 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${slugPart}*&order=slug.asc`;
      const res2 = await fetch(url2, { headers, cache: 'no-store' });
      if (res2.ok) {
          const data2 = await res2.json();
          if (data2?.length) return data2[0];
      }
  } catch(e) {}

  // 🛡️ TIER 3: Ultimátní fallback na původní procentuální hledání v Názvu
  // Pro zachycení zkrácenin a atypických tvarů, které by selhaly i v TIER 2.
  try {
      const model = slugPart.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const search = model.replace(/\s+/g, '%');
      const url3 = `${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.*${search}*&order=name.asc`;
      
      const res3 = await fetch(url3, { headers, cache: 'no-store' });
      if (res3.ok) {
          const data3 = await res3.json();
          return data3?.[0] || null;
      }
  } catch(e) {}

  return null;
};

// 🛡️ GURU ENGINE: Načtení podobných upgradů
const getSimilarUpgrades = async (gpuId, currentSlug) => {
    if (!supabaseUrl || !gpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=title_cs,title_en,slug,slug_en&or=(old_gpu_id.eq.${gpuId},new_gpu_id.eq.${gpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

// 🚀 GURU ENGINE: Generování Upgrade Stránky do DB
async function generateAndPersistUpgrade(slug) {
  if (!supabaseUrl) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    
    const parts = cleanSlug.includes('-to-')
      ? cleanSlug.split('-to-')
      : cleanSlug.split('-vs-');

    if (parts.length !== 2) return null;

    const [cardA, cardB] = await Promise.all([
        findGpu(parts[0]),
        findGpu(parts[1])
    ]);

    // 🚀 GURU DEBUG
    console.log("Slug Processing:", slug);
    console.log("GPU A Found:", cardA?.name || "NULL");
    console.log("GPU B Found:", cardB?.name || "NULL");

    if (!cardA || !cardB) return null;

    const title_cs = `Upgrade z ${cardA.name} na ${cardB.name}`;
    const title_en = `Upgrade from ${cardA.name} to ${cardB.name}`;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, 
        old_gpu_id: cardA.id, new_gpu_id: cardB.id,
        title_cs, title_en, content_cs: '', content_en: '', 
        seo_description_cs: `Vyplatí se přechod z ${cardA.name} na ${cardB.name}?`,
        seo_description_en: `Is it worth upgrading from ${cardA.name} to ${cardB.name}?`,
        created_at: new Date().toISOString()
    };

    // 🚀 GURU CRITICAL FIX: Samotný POST request OŘÍZNUT o ?select parametr
    await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades`, {
        method: 'POST',
        headers: { 
            'apikey': supabaseKey, 
            'Authorization': `Bearer ${supabaseKey}`, 
            'Content-Type': 'application/json', 
            'Prefer': 'return=representation' 
        },
        body: JSON.stringify(payload)
    });

    // 🚀 GURU FIX: Po uložení natáhneme nově vytvořený/stávající záznam čistým GET dotazem
    const selectQuery = "*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))";
    const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    
    const data = await checkExisting.json();
    return data[0] || null;
  } catch (err) { return null; }
}

/**
 * 🛡️ GURU PERF: Cache pro dotazování tabulky gpu_upgrades
 */
const getUpgradeData = cache(async (slug) => {
  if (!supabaseUrl || !slug) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  
  const selectQuery = `*,oldGpu:gpus!old_gpu_id(*,game_fps!gpu_id(*)),newGpu:gpus!new_gpu_id(*,game_fps!gpu_id(*))`;
  
  try {
      // 🚀 GURU FIX: Zjednodušený dotaz využívající čistý slug (ChatGPT Fix)
      const res = await fetch(
        `${supabaseUrl}/rest/v1/gpu_upgrades?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          },
          next: { revalidate: 86400 }
        }
      );
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
  const { oldGpu, newGpu } = upgrade;
  const { diff } = calculatePerf(oldGpu, newGpu);
  const isWorthIt = (newGpu?.performance_index || 0) > (oldGpu?.performance_index || 0);

  const title = isEn 
    ? `Upgrade from ${oldGpu.name} to ${newGpu.name} (+${diff}% FPS)` 
    : `Vyplatí se upgrade z ${oldGpu.name} na ${newGpu.name}? (+${diff} % výkon)`;

  const canonicalUrl = `https://www.thehardwareguru.cz/gpu-upgrade/${upgrade.slug}`;

  return { 
    title: `${title} | The Hardware Guru`, 
    description: isEn 
      ? `Thinking about upgrading to ${newGpu.name}? See the real gaming benchmark comparison against ${oldGpu.name}.`
      : `Zvažujete přechod na ${newGpu.name}? Podívejte se na reálné srovnání herních benchmarků proti ${oldGpu.name}.`,
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        "en": `https://www.thehardwareguru.cz/en/gpu-upgrade/${(upgrade.slug_en || `en-${upgrade.slug}`).replace(/^en-en-/,'en-')}`,
        "cs": canonicalUrl
      }
    }
  };
}

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

/**
 * 🚀 HLAVNÍ APP KOMPONENTA
 */
export default async function App({ params }) {
  const slug = params?.slug ?? null;
  const upgrade = await getUpgradeData(slug);
  
  if (!upgrade) return (
    <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>
      UPGRADE PATH NENALEZENA
    </div>
  );

  const isEn = slug?.startsWith('en-');
  const { oldGpu: gpuA, newGpu: gpuB } = upgrade;

  if (!gpuA || !gpuB) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>GPU DATA ERROR</div>;
  
  const similarPromise = gpuA?.id ? getSimilarUpgrades(gpuA.id, upgrade.slug) : Promise.resolve([]);
  const { diff: finalPerfDiff } = calculatePerf(gpuA, gpuB);
  const similar = await similarPromise;

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#a855f7', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#3b82f6');
  };

  const fpsA = gpuA?.game_fps && Array.isArray(gpuA.game_fps) && gpuA.game_fps.length ? gpuA.game_fps[0] : (gpuA?.game_fps || {});
  const fpsB = gpuB?.game_fps && Array.isArray(gpuB.game_fps) && gpuB.game_fps.length ? gpuB.game_fps[0] : (gpuB?.game_fps || {});

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((a / b) - 1) * 100);
  const cyberpunkDiff = calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p);
  const warzoneDiff = calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p);
  const starfieldDiff = calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p);
  
  const diffs = [cyberpunkDiff, warzoneDiff, starfieldDiff].filter(v => Number.isFinite(v) && v !== 0);
  const avgDiff = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : 0;

  const availableGames = Object.keys(fpsA || {})
    .filter(k => k !== 'gpu_id' && k !== 'id' && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'starfield'];
  const isWorthIt = (gpuB?.performance_index || 0) > (gpuA?.performance_index || 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'GPU BATTLES' : 'GPU DUELY'}
          </a>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-ranking-link">
            <TrendingUp size={16} /> {isEn ? 'GPU TIER LIST' : 'ŽEBŘÍČEK GRAFIK'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '50px', background: 'rgba(168,85,247,0.1)' }}>
            <ArrowUpCircle size={14} /> GURU UPGRADE ANALYSIS
          </div>
          
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {isEn ? "SHOULD YOU UPGRADE FROM" : "VYPLATÍ SE UPGRADE Z"} <br/>
            <span style={{ color: '#9ca3af' }}>{gpuA.name}</span> <br/>
            <span style={{ color: '#a855f7' }}>TO {gpuB.name}?</span>
          </h1>
          
          <div style={{ color: '#9ca3af', fontSize: '18px', marginTop: '20px', maxWidth: '850px', margin: '20px auto', lineHeight: '1.6' }}>
            {isWorthIt ? (
                isEn 
                ? <p>Moving from the <strong>{gpuA.name}</strong> to the <strong>{gpuB.name}</strong> will grant you roughly <strong>{finalPerfDiff}% more performance</strong>.</p>
                : <p>Přechod z <strong>{gpuA.name}</strong> na <strong>{gpuB.name}</strong> vám zajistí průměrně o <strong>{finalPerfDiff} % vyšší výkon</strong>.</p>
            ) : (
                isEn
                ? <p>Upgrading to the <strong>{gpuB.name}</strong> does not provide a meaningful boost compared to your current <strong>{gpuA.name}</strong>.</p>
                : <p>Upgrade na <strong>{gpuB.name}</strong> nepředstavuje oproti vaší <strong>{gpuA.name}</strong> žádný zásadní posun.</p>
            )}
          </div>

          {isWorthIt && (
            <div className="guru-verdict" style={{ borderColor: '#a855f7', color: '#a855f7', background: 'rgba(168, 85, 247, 0.05)' }}>
                {isEn ? 'VERDICT:' : 'VERDIKT:'} <strong>{gpuB.name}</strong> {isEn ? 'is a solid upgrade' : 'je výborný upgrade'} (+{finalPerfDiff}%)
            </div>
          )}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px', position: 'relative' }}>
            <div className="gpu-card-box" style={{ borderTop: `5px solid #4b5563`, filter: 'grayscale(0.5)' }}>
                <span className="vendor-label" style={{ color: '#9ca3af' }}>{isEn ? 'CURRENT GPU' : 'VAŠE SOUČASNÁ KARTA'}</span>
                <h2 className="gpu-name-text" style={{ color: '#d1d5db', fontSize: 'clamp(1.2rem, 2.5vw, 2rem)' }}>{normalizeName(gpuA.name)}</h2>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>{gpuA.architecture} • {gpuA.vram_gb}GB VRAM</div>
            </div>
            
            <div className="vs-center-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="upgrade-badge"><ArrowRight size={32} /></div>
            </div>

            <div className="gpu-card-box" style={{ borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, transform: 'scale(1.05)', zIndex: 5, boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)' }}>
                <span className="vendor-label" style={{ color: getVendorColor(gpuB.vendor) }}>{isEn ? 'NEW UPGRADE' : 'NOVÝ UPGRADE'}</span>
                <h2 className="gpu-name-text" style={{ color: '#fff' }}>{normalizeName(gpuB.name)}</h2>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#a855f7', fontWeight: '950' }}>+{finalPerfDiff}% {isEn ? 'RAW POWER' : 'VÝKONU NAVÍC'}</div>
            </div>
        </div>

        {Object.keys(fpsA || {}).length > 0 && Object.keys(fpsB || {}).length > 0 && (
            <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style" style={{ borderLeft: '6px solid #a855f7' }}>
                <h2 className="section-h2" style={{ color: '#a855f7', border: 'none', padding: 0 }}>
                <BarChart3 size={28} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                {isEn ? 'ESTIMATED FPS GAIN (1440p)' : 'ODHADOVANÝ NÁRŮST FPS (1440p)'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {[
                        { label: 'CYBERPUNK 2077', diff: cyberpunkDiff, oldFps: fpsA.cyberpunk_1440p, newFps: fpsB.cyberpunk_1440p },
                        { label: 'WARZONE', diff: warzoneDiff, oldFps: fpsA.warzone_1440p, newFps: fpsB.warzone_1440p },
                        { label: 'STARFIELD', diff: starfieldDiff, oldFps: fpsA.starfield_1440p, newFps: fpsB.starfield_1440p }
                    ].map((item, i) => (
                        <div key={i} className="summary-item">
                            <span className="summary-label">{item.label}</span>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>{item.oldFps} ➔ <span style={{ color: '#fff', fontWeight: 'bold' }}>{item.newFps}</span></div>
                            <div className="summary-val" style={{ color: item.diff >= 0 ? '#a855f7' : '#ef4444' }}>{item.diff > 0 ? '+' : ''}{item.diff} %</div>
                        </div>
                    ))}
                </div>
            </div>
            </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: '#a855f7' }}>
            <LayoutList size={28} /> {isEn ? 'UPGRADE SPECIFICATIONS' : 'POROVNÁNÍ PARAMETRŮ'}
          </h2>
          <div className="table-wrapper">
             <div className="spec-row-style" style={{ background: 'rgba(0,0,0,0.5)', color: '#9ca3af', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 <div style={{ flex: 1, textAlign: 'right' }}>{isEn ? 'CURRENT' : 'SOUČASNÁ'}</div>
                 <div className="table-label"></div>
                 <div style={{ flex: 1, textAlign: 'left', color: '#a855f7' }}>{isEn ? 'UPGRADE' : 'NOVÁ'}</div>
             </div>
             {[
               { label: 'VRAM', valA: `${gpuA?.vram_gb ?? '-'} GB`, valB: `${gpuB?.vram_gb ?? '-'} GB`, winA: gpuA?.vram_gb, winB: gpuB?.vram_gb },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', valA: gpuA?.memory_bus ?? '-', valB: gpuB?.memory_bus ?? '-', winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: `${gpuA?.boost_clock_mhz ?? '-'} MHz`, valB: `${gpuB?.boost_clock_mhz ?? '-'} MHz`, winA: gpuA?.boost_clock_mhz, winB: gpuB?.boost_clock_mhz },
               { label: 'TDP', valA: `${gpuA?.tdp_w ?? '-'} W`, valB: `${gpuB?.tdp_w ?? '-'} W`, winA: gpuA?.tdp_w ?? 999, winB: gpuB?.tdp_w ?? 999, lower: true },
               { label: isEn ? 'GPU ARCHITECTURE' : 'ARCHITEKTURA', valA: gpuA?.architecture ?? '-', valB: gpuB?.architecture ?? '-', winA: 0, winB: 0 }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '16px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: '#a855f7' }}>
            <Gamepad2 size={28} /> {isEn ? 'DETAILED FPS CAPABILITIES' : 'DETAILNÍ MOŽNOSTI VE HRÁCH'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
              {[gpuA, gpuB].filter(Boolean).map((gpu, i) => {
                  const safeGpuSlug = slugify(gpu?.name || "");
                  return (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: i === 1 ? '#a855f7' : '#9ca3af' }}>{gpu?.name || "GPU"}</div>
                      <div className="matrix-links">
                          {gamesList.map((game) => (
                              <a key={game} href={`/${isEn ? 'en/' : ''}gpu-fps/${safeGpuSlug}/${game}`} className="matrix-link">
                                  <ExternalLink size={14} /> {game.replace(/-/g, ' ').toUpperCase()} Benchmark
                              </a>
                          ))}
                      </div>
                  </div>
                  );
              })}
          </div>
        </section>

        {similar.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeftColor: '#a855f7' }}>
              <LayoutList size={28} /> {isEn ? `MORE UPGRADE PATHS` : `DALŠÍ VARIANTY UPGRADU`}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '15px' }}>
              {similar.map((s, i) => (
                <a key={i} href={isEn ? `/en/gpu-upgrade/${s.slug_en ?? `en-${s.slug}`}` : `/gpu-upgrade/${s.slug}`} className="similar-link-card">
                  <ArrowUpCircle size={16} color="#a855f7" /> {isEn ? (s.title_en ?? s.title_cs) : s.title_cs}
                </a>
              ))}
            </div>
          </section>
        )}

        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="deals-btn-style"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn-style"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(10px); flex: 1; transition: 0.3s; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .gpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .upgrade-badge { background: linear-gradient(135deg, #a855f7 0%, #66fcf1 100%); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(168,85,247,0.5); z-index: 10; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .summary-label { display: block; font-size: 10px; font-weight: 900; color: #4b5563; margin-bottom: 8px; letter-spacing: 1px; }
        .summary-val { font-size: 24px; font-weight: 950; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #a855f7; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .matrix-gpu-title { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 14px; font-weight: bold; transition: 0.2s; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
        .matrix-link:hover { color: #fff; background: rgba(168, 85, 247, 0.1); transform: translateX(5px); }
        .similar-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.8); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .deals-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .support-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .upgrade-badge { margin: 10px auto; rotate: 90deg; } .deals-btn-style, .support-btn-style { width: 100%; } .table-label { width: 100px; } }
      `}} />
    </div>
  );
}
