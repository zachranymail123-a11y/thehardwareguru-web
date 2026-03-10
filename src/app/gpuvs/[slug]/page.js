import React, { cache } from 'react';
import { 
  ChevronLeft, ShieldCheck, Flame, Heart, Swords, Calendar, Trophy, Zap, 
  Monitor, Activity, BarChart3, Gamepad2, LayoutList, TrendingUp, ArrowRight, ExternalLink
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - DETAIL V100.0 (1:1 CPU PARITY FIX)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ FIX 1: Absolutní zkopírování dokonalé logiky z CPU Duelů (žádná záporná procenta).
 * 🛡️ FIX 2: 3-Tier Lookup a merge-duplicates DB ochrana jako u CPU.
 */

export const runtime = "nodejs";
export const revalidate = 0; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => {
  return text.toLowerCase().replace(/nvidia|amd|geforce|radeon|graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();
};

const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks || chunks.length === 0) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

const getSimilarDuels = async (gpuId, currentSlug) => {
    if (!supabaseUrl || !gpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=title_cs,title_en,slug,slug_en&or=(gpu_a_id.eq.${gpuId},gpu_b_id.eq.${gpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

async function generateAndPersistDuel(slug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = slug.replace(/^en-/, '');
    let parts;
    if (cleanSlug.includes('-vs-')) parts = cleanSlug.split('-vs-');
    else if (cleanSlug.includes('-to-')) parts = cleanSlug.split('-to-');
    if (!parts || parts.length !== 2) return null;

    const gpuA = await findGpu(parts[0]);
    const gpuB = await findGpu(parts[1]);
    if (!gpuA || !gpuB) return null;

    const title_cs = `Srovnání grafických karet: ${gpuA.name} vs ${gpuB.name}`;
    const title_en = `Graphics cards comparison: ${gpuA.name} vs ${gpuB.name}`;
    
    let seo_desc_cs = `Která grafika je lepší? Detailní srovnání specifikací a výkonu mezi ${gpuA.name} a ${gpuB.name}.`;
    let seo_desc_en = `Which GPU is better? Detailed specs and performance comparison between ${gpuA.name} and ${gpuB.name}.`;

    if (gpuA.performance_index && gpuB.performance_index) {
        const diff = Math.round((Math.max(gpuA.performance_index, gpuB.performance_index) / Math.min(gpuA.performance_index, gpuB.performance_index) - 1) * 100);
        const winner = gpuA.performance_index > gpuB.performance_index ? gpuA.name : gpuB.name;
        seo_desc_cs += ` Vítězem v hrubém herním výkonu je ${winner} s náskokem ${diff}%.`;
        seo_desc_en += ` The raw gaming performance winner is ${winner} with a ${diff}% lead.`;
    }

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, gpu_a_id: gpuA.id, gpu_b_id: gpuB.id,
        title_cs, title_en, seo_description_cs: seo_desc_cs, seo_description_en: seo_desc_en,
        content_cs: '', content_en: '', created_at: new Date().toISOString()
    };

    const selectQuery = "*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))";
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store' });
        const existingData = await checkExisting.json();
        return existingData[0] || null;
    }
    const insertedData = await dbRes.json();
    return insertedData[0];
  } catch (err) { return null; }
}

const getDuelData = cache(async (slug) => {
  if (!supabaseUrl) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/geforce-/g, '').replace(/radeon-/g, '');
  const orQuery = `slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug},slug_en.eq.${slug}`;
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&or=(${encodeURIComponent(orQuery)})&limit=1`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistDuel(slug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | The Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  
  const hasPerfData = gpuA?.performance_index > 0 && gpuB?.performance_index > 0;
  let perfWinner = null, perfLoser = null, perfDiff = 0;

  if (hasPerfData) {
      if (gpuA.performance_index > gpuB.performance_index) { perfWinner = gpuA; perfLoser = gpuB; perfDiff = Math.round(((gpuA.performance_index / gpuB.performance_index) - 1) * 100); } 
      else if (gpuB.performance_index > gpuA.performance_index) { perfWinner = gpuB; perfLoser = gpuA; perfDiff = Math.round(((gpuB.performance_index / gpuA.performance_index) - 1) * 100); }
  }

  let title = perfWinner 
    ? (isEn ? `${perfWinner.name} vs ${perfLoser.name} – ${perfDiff}% Faster Benchmark` : `${perfWinner.name} vs ${perfLoser.name} – benchmark srovnání (+${perfDiff} % výkon)`)
    : (isEn ? `${gpuA?.name} vs ${gpuB?.name} – Equal Performance` : `${gpuA?.name} vs ${gpuB?.name} – Vyrovnaný výkon`);

  return { 
    title: `${title} | The Hardware Guru`,
    alternates: { 
      canonical: `https://www.thehardwareguru.cz/gpuvs/${duel.slug}`,
      languages: { "en": `https://www.thehardwareguru.cz/en/gpuvs/${(duel.slug_en || `en-${duel.slug}`).replace(/^en-en-/,'en-')}`, "cs": `https://www.thehardwareguru.cz/gpuvs/${duel.slug}` }
    }
  };
}

export default async function GpuDuelDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  
  if (!duel) return <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h1 style={{ color: '#ff0055', fontSize: '30px', fontWeight: '900' }}>404 - DUEL NENALEZEN</h1></div>;

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;

  if (!gpuA || !gpuB) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>GPU DATA ERROR</div>;

  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(duel.created_at || Date.now()));
  const backLink = isEn ? '/en/gpuvs' : '/gpuvs';
  
  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#0071c5');
  };

  const similarPromise = gpuA?.id ? getSimilarDuels(gpuA.id, duel.slug) : Promise.resolve([]);
  
  // 🚀 CPU PARITY: Absolutně přesná a bezpečná logika vítěze
  const hasPerfData = gpuA.performance_index > 0 && gpuB.performance_index > 0;
  let perfDiff = 0;
  let perfWinner = null;
  let perfLoser = null;
  let perfColor = '#4b5563';

  if (hasPerfData) {
    if (gpuA.performance_index > gpuB.performance_index) {
      perfWinner = gpuA; perfLoser = gpuB; perfDiff = Math.round(((gpuA.performance_index / gpuB.performance_index) - 1) * 100); perfColor = getVendorColor(gpuA.vendor);
    } else if (gpuB.performance_index > gpuA.performance_index) {
      perfWinner = gpuB; perfLoser = gpuA; perfDiff = Math.round(((gpuB.performance_index / gpuA.performance_index) - 1) * 100); perfColor = getVendorColor(gpuB.vendor);
    }
  }

  const upgradeUrl = perfWinner && perfLoser ? `/${isEn ? 'en/' : ''}gpu-upgrade/${slugify(perfLoser.name)}-to-${slugify(perfWinner.name)}` : null;
  const similar = await similarPromise;

  // Bezpečné FPS Diffy, vždy z pohledu vítěze (Žádná záporná procenta)
  const fpsA = Array.isArray(gpuA?.game_fps) ? gpuA.game_fps[0] : (gpuA?.game_fps || {});
  const fpsB = Array.isArray(gpuB?.game_fps) ? gpuB.game_fps[0] : (gpuB?.game_fps || {});

  const fpsWinnerObj = perfWinner?.id === gpuA.id ? fpsA : fpsB;
  const fpsLoserObj = perfLoser?.id === gpuA.id ? fpsA : fpsB;

  const calcSafeLead = (valWinner, valLoser) => {
    if (!valWinner || !valLoser || valLoser === 0) return 0;
    return Math.round(((valWinner / valLoser) - 1) * 100);
  };

  const cyberpunkDiff = calcSafeLead(fpsWinnerObj?.cyberpunk_1440p, fpsLoserObj?.cyberpunk_1440p);
  const warzoneDiff = calcSafeLead(fpsWinnerObj?.warzone_1440p, fpsLoserObj?.warzone_1440p);
  const starfieldDiff = calcSafeLead(fpsWinnerObj?.starfield_1440p, fpsLoserObj?.starfield_1440p);
  
  const diffs = [cyberpunkDiff, warzoneDiff, starfieldDiff].filter(v => Number.isFinite(v) && v > 0);
  const avgDiff = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : perfDiff;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={backLink} className="guru-back-btn"><ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}</a>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-ranking-link"><TrendingUp size={16} /> {isEn ? 'GPU TIER LIST' : 'ŽEBŘÍČEK GRAFIK'}</a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
            <span className="opacity-30">|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', lineHeight: '1.1', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {gpuA?.name} <span style={{ color: '#ff0055' }}>vs</span> {gpuB?.name}
          </h1>

          <div style={{ color: '#9ca3af', fontSize: '18px', marginTop: '20px', maxWidth: '850px', margin: '20px auto', lineHeight: '1.6' }}>
            {perfWinner ? (
                isEn 
                ? <p>{perfWinner.name} is approximately <strong>{perfDiff}% faster</strong> than {perfLoser.name} in gaming benchmarks based on aggregated data.</p>
                : <p>{perfWinner.name} je přibližně o <strong>{perfDiff} % výkonnější</strong> než {perfLoser.name} v herních testech na základě agregovaných dat.</p>
            ) : (
                isEn
                ? <p>Both <strong>{gpuA?.name}</strong> and <strong>{gpuB?.name}</strong> deliver nearly identical performance levels in modern gaming scenarios.</p>
                : <p>Obě grafiky <strong>{gpuA?.name}</strong> a <strong>{gpuB?.name}</strong> doručují téměř identickou úroveň výkonu v moderních herních scénářích.</p>
            )}
          </div>

          {perfWinner && (
            <div className="guru-verdict" style={{ borderColor: '#66fcf1', color: '#66fcf1', background: 'rgba(102, 252, 241, 0.05)' }}>
                {perfWinner.name} {isEn ? 'is about' : 'je přibližně'} <strong>{perfDiff}%</strong> {isEn ? 'faster in games' : 'výkonnější ve hrách'}
            </div>
          )}

          {upgradeUrl && (
            <div style={{ marginTop: '20px' }}>
                <a href={upgradeUrl} className="guru-upgrade-pill"><Zap size={14} fill="currentColor" /> {isEn ? `Upgrade Analysis: ${perfLoser.name} → ${perfWinner.name}` : `Analýza upgradu: ${perfLoser.name} → ${perfWinner.name}`} <ArrowRight size={14} /></a>
            </div>
          )}
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuA.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuA.vendor}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{normalizeName(gpuA.name)}</h2>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '70px', background: '#ff0055', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '24px', border: '5px solid #0f1115', boxShadow: '0 0 30px rgba(255,0,85,0.6)', color: '#fff', transform: 'rotate(-5deg)' }}>VS</div>
            </div>

            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuB.vendor}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{normalizeName(gpuB.name)}</h2>
            </div>
        </div>

        {/* 🚀 GURU VÝKONOVÝ ROZDÍL */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Zap size={36} className="text-[#66fcf1]" /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}
          </h2>
          
          {hasPerfData && perfWinner ? (
              <div className="perf-box" style={{ background: `linear-gradient(135deg, rgba(15, 17, 21, 0.9) 0%, ${perfColor}15 100%)`, border: `1px solid ${perfColor}40`, borderRadius: '24px', padding: '40px', boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px ${perfColor}10`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: perfColor }}></div>
                  <div className="perf-box-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ color: perfColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trophy size={18} /> {isEn ? 'GAMING PERFORMANCE WINNER' : 'VÍTĚZ HERNÍHO VÝKONU'}
                        </div>
                        <div style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', margin: 0, lineHeight: 1.1 }}>{perfWinner.name}</div>
                    </div>
                    <div style={{ background: perfColor, color: perfWinner.vendor.toUpperCase() === 'INTEL' ? '#fff' : '#000', padding: '20px 30px', borderRadius: '20px', fontWeight: '950', fontSize: '36px', boxShadow: `0 0 40px ${perfColor}80`, whiteSpace: 'nowrap' }}>
                        +{perfDiff} %
                    </div>
                  </div>
              </div>
          ) : null}
        </section>

        {/* 🚀 SHRNUTÍ HERNÍHO VÝKONU (Konečně pozitivní čísla z pohledu vítěze) */}
        {hasPerfData && perfWinner && (
            <section style={{ marginBottom: '60px' }}>
                <div className="content-box-style" style={{ borderLeft: '6px solid #66fcf1' }}>
                    <h2 className="section-h2" style={{ color: '#66fcf1', border: 'none', padding: 0 }}><BarChart3 size={28} style={{ display: 'inline', marginRight: '10px' }} /> {isEn ? 'FPS LEAD SUMMARY' : 'SHRNUTÍ NÁSKOKU FPS'}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        {[{ label: 'CYBERPUNK 2077', diff: cyberpunkDiff }, { label: 'WARZONE', diff: warzoneDiff }, { label: 'STARFIELD', diff: starfieldDiff }].map((item, i) => (
                            <div key={i} className="summary-item">
                                <span className="summary-label">{item.label}</span>
                                <div className="summary-val" style={{ color: '#66fcf1' }}>{item.diff > 0 ? `+${item.diff}` : '0'} %</div>
                            </div>
                        ))}
                        <div className="summary-item" style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                            <span className="summary-label" style={{ color: '#66fcf1' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                            <div className="summary-val" style={{ color: '#fff' }}>+{avgDiff} %</div>
                        </div>
                    </div>
                </div>
            </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2"><LayoutList size={28} /> {isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div className="table-wrapper">
             {[
               { label: 'VRAM', valA: gpuA.vram_gb ? `${gpuA.vram_gb} GB` : '-', valB: gpuB.vram_gb ? `${gpuB.vram_gb} GB` : '-', winA: gpuA.vram_gb, winB: gpuB.vram_gb },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', valA: gpuA.memory_bus ?? '-', valB: gpuB.memory_bus ?? '-', winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: gpuA.boost_clock_mhz ? `${gpuA.boost_clock_mhz} MHz` : '-', valB: gpuB.boost_clock_mhz ? `${gpuB.boost_clock_mhz} MHz` : '-', winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz },
               { label: 'TDP (SPOTŘEBA)', valA: gpuA.tdp_w ? `${gpuA.tdp_w} W` : '-', valB: gpuB.tdp_w ? `${gpuB.tdp_w} W` : '-', winA: gpuA.tdp_w ?? 999, winB: gpuB.tdp_w ?? 999, lower: true },
               { label: 'ARCHITECTURE', valA: gpuA.architecture ?? '-', valB: gpuB.architecture ?? '-', winA: 0, winB: 0 },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', valA: gpuA.release_date ? new Date(gpuA.release_date).getFullYear() : '-', valB: gpuB.release_date ? new Date(gpuB.release_date).getFullYear() : '-', winA: 0, winB: 0 },
               { label: 'MSRP PRICE', valA: gpuA.release_price_usd ? `$${gpuA.release_price_usd}` : '-', valB: gpuB.release_price_usd ? `$${gpuB.release_price_usd}` : '-', winA: gpuA.release_price_usd, winB: gpuB.release_price_usd, lower: true }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {/* DEEP DIVE CROSS LINKS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}><Activity size={36} /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              {[gpuA, gpuB].map((gpu, i) => {
                  const safeSlug = gpu.slug || slugify(gpu.name).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');
                  return (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(gpu.vendor) }}>{gpu.name}</div>
                      <div className="matrix-links">
                          <a href={`/${isEn ? 'en/' : ''}gpu-performance/${safeSlug}`} className="matrix-link"><BarChart3 size={14} /> {isEn ? 'Performance Specs' : 'Výkon a Parametry'}</a>
                          <a href={`/${isEn ? 'en/' : ''}gpu-recommend/${safeSlug}`} className="matrix-link"><ShieldCheck size={14} /> {isEn ? 'Guru Verdict' : 'Guru Verdikt'}</a>
                          <a href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/cyberpunk-2077`} className="matrix-link"><Gamepad2 size={14} /> Cyberpunk 2077 FPS</a>
                          <a href={`/${isEn ? 'en/' : ''}gpu-fps/${safeSlug}/warzone`} className="matrix-link"><Monitor size={14} /> Warzone FPS</a>
                      </div>
                  </div>
                  );
              })}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-flex; align-items: center; gap: 10px; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 25px; background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; margin-top: 25px; transition: 0.3s; }
        
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; transition: 0.3s; }
        .summary-label { display: block; font-size: 10px; font-weight: 950; color: #6b7280; margin-bottom: 12px; letter-spacing: 2px; }
        .summary-val { font-size: 32px; font-weight: 950; text-shadow: 0 0 20px rgba(102, 252, 241, 0.3); }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; display: flex; align-items: center; gap: 12px; }
        
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .matrix-gpu-title { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
        .matrix-links { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 13px; font-weight: bold; transition: 0.2s; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.1); transform: translateX(5px); }
        
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .perf-box-content { flex-direction: column !important; align-items: flex-start !important; gap: 20px; } .table-label { width: 100px; } .spec-row-style { padding: 15px 10px; flex-direction: column !important; gap: 10px; } }
      `}} />
    </div>
  );
}
