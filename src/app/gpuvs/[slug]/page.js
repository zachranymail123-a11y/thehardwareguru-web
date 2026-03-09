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
  ExternalLink
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - DETAIL V86.0 (BENCHMARK CTR & SCHEMA BOOST)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ FIX 1: Ochrana pole karet přes .filter(Boolean) proti prázdným URL (ChatGPT Fix).
 * 🛡️ SEO 1: Nové Benchmark/FPS Title patterny pro maximální CTR.
 * 🛡️ SEO 2: Implementace Product schema pro obě karty (Rich Snippets).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Agresivní slugify engine (zachovává vendor názvy pro čisté SEO dle ChatGPT)
const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/graphics|gpu/gi, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim();
  };

// 🚀 GURU LOGIC HELPER: Výpočet výkonu s ochranou
function calculatePerf(a, b) {
    if (!a?.performance_index || !b?.performance_index || a.performance_index <= 0 || b.performance_index <= 0) {
        return { winner: null, loser: null, diff: 0 };
    }
    if (a.performance_index > b.performance_index) {
        return { 
            winner: a, 
            loser: b, 
            diff: Math.round((a.performance_index / b.performance_index - 1) * 100) 
        };
    }
    if (b.performance_index > a.performance_index) {
        return { 
            winner: b, 
            loser: a, 
            diff: Math.round((b.performance_index / a.performance_index - 1) * 100) 
        };
    }
    return { winner: null, loser: null, diff: 0 }; // Remíza
}

// 🛡️ GURU ENGINE: Vyhledávání karty z DB (ROBUSTNÍ PARSER)
const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  
  // 🚀 GURU FIX: Vrácení původního parseru, aby se nesmazaly důležité přípony (xt, ti, super)
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks || chunks.length === 0) return null;
  
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

// 🛡️ GURU ENGINE: Načtení podobných duelů
const getSimilarDuels = async (gpuId, currentSlug) => {
    if (!supabaseUrl || !gpuId) return [];
    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=title_cs,title_en,slug,slug_en&or=(gpu_a_id.eq.${gpuId},gpu_b_id.eq.${gpuId})&slug=neq.${currentSlug}&limit=4`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
            next: { revalidate: 86400 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) { return []; }
};

// 🚀 GURU ENGINE: Generování Programmatic SEO obsahu
async function generateAndPersistDuel(slug) {
  if (!supabaseUrl) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const [cardA, cardB] = await Promise.all([
        findGpu(parts[0]),
        findGpu(parts[1])
    ]);

    if (!cardA || !cardB) return null;

    const title_cs = `Srovnání grafických karet: ${cardA.name} vs ${cardB.name}`;
    const title_en = `Graphics cards comparison: ${cardA.name} vs ${cardB.name}`;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, gpu_a_id: cardA.id, gpu_b_id: cardB.id,
        title_cs, title_en, content_cs: '', content_en: '', seo_description_cs: `Srovnání ${cardA.name} vs ${cardB.name}.`, seo_description_en: `Comparison of ${cardA.name} vs ${cardB.name}.`,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))";
    
    /**
     * 🛡️ GURU CONCURRENCY FIX: Přidána hlavička resolution=merge-duplicates.
     * To provede automatický UPSERT místo pádu na Duplicate Key Error při souběžném přístupu.
     */
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: { 
            'apikey': supabaseKey, 
            'Authorization': `Bearer ${supabaseKey}`, 
            'Content-Type': 'application/json', 
            'Prefer': 'return=representation,resolution=merge-duplicates' 
        },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const data = await checkExisting.json();
        return data[0];
    }
    const inserted = await dbRes.json();
    return inserted[0];
  } catch (err) { return null; }
}

/**
 * 🛡️ GURU PERF: React Cache zajistí, že se data z DB fetchují pouze jednou pro metadata i render.
 */
const getDuelData = cache(async (slug) => {
  if (!supabaseUrl) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/geforce-/g, '').replace(/radeon-/g, '');
  const orQuery = `slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug},slug_en.eq.${slug}`;
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&or=(${encodeURIComponent(orQuery)})&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistDuel(slug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | Hardware Guru' };
  
  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const { winner, loser, diff } = calculatePerf(gpuA, gpuB);

  let title = '';
  let desc = '';

  if (winner) {
      // 🚀 GURU SEO FIX: Výkonnější klíčová slova (Benchmark a FPS srovnání)
      title = isEn 
        ? `${winner.name} vs ${loser.name} – ${diff}% Faster Benchmark (FPS Comparison)` 
        : `${winner.name} vs ${loser.name} – benchmark a FPS srovnání (+${diff} % výkon)`;
      desc = isEn 
        ? `${winner.name} is about ${diff}% faster than ${loser.name} based on benchmark data. Compare specs, gaming FPS and performance.` 
        : `${winner.name} je přibližně o ${diff} % výkonnější než ${loser.name} podle výsledků benchmarků. Porovnejte parametry a FPS.`;
  } else {
      title = isEn 
        ? `${gpuA.name} vs ${gpuB.name} – Equal Performance in Games` 
        : `${gpuA.name} vs ${gpuB.name} – Vyrovnaný výkon ve hrách`;
      desc = isEn 
        ? `${gpuA.name} and ${gpuB.name} offer nearly identical gaming performance.` 
        : `${gpuA.name} a ${gpuB.name} nabízejí téměř identický herní výkon.`;
  }

  // 🛡️ GURU SEO FIX: Oprava canonical URL (ChatGPT Fix absolutní kanonizace s languages)
  const duelSlugEn = (duel.slug_en || `en-${duel.slug}`).replace(/^en-en-/,'en-');
  const canonicalUrl = `https://www.thehardwareguru.cz/gpuvs/${duel.slug}`;

  return { 
    title: `${title} | The Hardware Guru`, 
    description: desc,
    alternates: { 
      canonical: canonicalUrl,
      languages: {
        "en": `https://www.thehardwareguru.cz/en/gpuvs/${duelSlugEn}`,
        "cs": canonicalUrl
      }
    }
  };
}

export default async function GpuDuelDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center' }}>DUEL NENALEZEN</div>;

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  
  // 🚀 GURU PERF: Optimalizace latence pomocí Promise.resolve()
  const similarPromise = gpuA?.id ? getSimilarDuels(gpuA.id, duel.slug) : Promise.resolve([]);

  const { winner, loser, diff: finalPerfDiff } = calculatePerf(gpuA, gpuB);
  
  // Awaitujeme na similar až po kalkulacích
  const similar = await similarPromise;

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#66fcf1', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon /gi, '');

  // 🚀 GURU CRASH FIX: Ochrana proti pádu serveru při chybějících fps datech
  const fpsA = gpuA?.game_fps ? (Array.isArray(gpuA.game_fps) ? gpuA.game_fps[0] : gpuA.game_fps) : {};
  const fpsB = gpuB?.game_fps ? (Array.isArray(gpuB.game_fps) ? gpuB.game_fps[0] : gpuB.game_fps) : {};

  const calcSafeDiff = (a, b) => (!a || !b || a === 0 || b === 0) ? 0 : Math.round(((a / b) - 1) * 100);
  const cyberpunkDiff = calcSafeDiff(fpsA?.cyberpunk_1440p, fpsB?.cyberpunk_1440p);
  const warzoneDiff = calcSafeDiff(fpsA?.warzone_1440p, fpsB?.warzone_1440p);
  const starfieldDiff = calcSafeDiff(fpsA?.starfield_1440p, fpsB?.starfield_1440p);
  
  const diffs = [cyberpunkDiff, warzoneDiff, starfieldDiff].filter(v => Number.isFinite(v) && v !== 0);
  const avgDiffMagnitude = diffs.length 
    ? Math.round(diffs.map(v => Math.abs(v)).reduce((a, b) => a + b, 0) / diffs.length) 
    : 0;

  const availableGames = Object.keys(fpsA)
    .filter(k => k !== 'gpu_id' && k !== 'id' && (k.includes('_1080p') || k.includes('_1440p') || k.includes('_4k')))
    .map(g => g.replace(/_(1080p|1440p|4k)/,'').replace(/_/g, '-'))
    .filter((v, i, a) => a.indexOf(v) === i);

  const gamesList = availableGames.length > 0 ? availableGames : ['cyberpunk-2077', 'warzone', 'starfield'];

  const upgradeUrl = winner && loser 
    ? `/${isEn ? 'en/' : ''}gpu-upgrade/${slugify(loser.name)}-to-${slugify(winner.name)}`
    : null;

  // 🚀 SEO SCHEMATA
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${gpuA?.name || "GPU A"} better than ${gpuB?.name || "GPU B"}?` : `Je ${gpuA?.name || "GPU A"} lepší než ${gpuB?.name || "GPU B"}?`,
        "acceptedAnswer": { 
            "@type": "Answer", 
            "text": winner 
              ? (isEn ? `${winner.name} is about ${finalPerfDiff}% faster in benchmarks.` : `Ano, ${winner.name} je v herních benchmarcích přibližně o ${finalPerfDiff} % výkonnější.`)
              : (isEn ? "Both GPUs offer very similar gaming performance based on our data." : "Obě grafické karty nabízejí podle našich dat velmi vyrovnaný herní výkon.")
        }
      },
      {
        "@type": "Question",
        "name": isEn ? `Is ${gpuA?.name || "GPU A"} worth upgrading from ${gpuB?.name || "GPU B"}?` : `Vyplatí se upgrade z ${gpuB?.name || "GPU B"} na ${gpuA?.name || "GPU A"}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isEn 
            ? `${gpuA?.name || "GPU A"} offers about ${finalPerfDiff}% higher gaming performance than ${gpuB?.name || "GPU B"}.` 
            : `${gpuA?.name || "GPU A"} nabízí přibližně o ${finalPerfDiff} % vyšší herní výkon než ${gpuB?.name || "GPU B"}.`
        }
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": isEn ? `${gpuA?.name || "GPU A"} vs ${gpuB?.name || "GPU B"} comparison` : `Srovnání ${gpuA?.name || "GPU A"} vs ${gpuB?.name || "GPU B"}`,
    "description": winner 
        ? (isEn ? `${winner.name} is about ${finalPerfDiff}% faster.` : `${winner.name} je o ${finalPerfDiff} % výkonnější.`)
        : (isEn ? "Direct GPU comparison." : "Přímé srovnání grafik."),
    "author": { "@type": "Organization", "name": "The Hardware Guru" }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": similar.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": isEn ? (s.title_en || s.title_cs) : s.title_cs,
      "url": `https://www.thehardwareguru.cz${isEn ? '/en' : ''}/gpuvs/${isEn ? (s.slug_en ?? `en-${s.slug}`) : s.slug}`
    }))
  };

  // 🚀 SEO: PRODUCT SCHEMAS DLE CHATGPT (Pro Rich Snippets)
  const productSchemaA = gpuA ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": gpuA.name,
    "brand": gpuA.vendor,
    "category": "Graphics Card"
  } : null;

  const productSchemaB = gpuB ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": gpuB.name,
    "brand": gpuB.vendor,
    "category": "Graphics Card"
  } : null;

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemListSchema) }} />
      {productSchemaA && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaA) }} />}
      {productSchemaB && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(productSchemaB) }} />}

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK' : 'ZPĚT'}
          </a>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-ranking-link">
            <TrendingUp size={16} /> {isEn ? 'GPU TIER LIST' : 'ŽEBŘÍČEK GRAFIK'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {gpuA?.name || "GPU A"} <span style={{ color: '#ff0055' }}>vs</span> {gpuB?.name || "GPU B"}
          </h1>
          
          <div style={{ color: '#9ca3af', fontSize: '18px', marginTop: '20px', maxWidth: '850px', margin: '20px auto', lineHeight: '1.6' }}>
            {winner ? (
                isEn 
                ? <p>{winner.name} is approximately <strong>{finalPerfDiff}% faster</strong> than {loser.name} in gaming benchmarks based on aggregated data.</p>
                : <p>{winner.name} je přibližně o <strong>{finalPerfDiff} % výkonnější</strong> než {loser.name} v herních testech na základě agregovaných dat.</p>
            ) : (
                isEn
                ? <p>Both <strong>{gpuA?.name || "GPU A"}</strong> and <strong>{gpuB?.name || "GPU B"}</strong> deliver nearly identical performance levels in modern gaming scenarios.</p>
                : <p>Obě karty <strong>{gpuA?.name || "GPU A"}</strong> a <strong>{gpuB?.name || "GPU B"}</strong> doručují téměř identickou úroveň výkonu v moderních herních scénářích.</p>
            )}
          </div>

          {winner && (
            <div className="guru-verdict">
                {winner.name} {isEn ? 'is about' : 'je přibližně'} <strong>{finalPerfDiff}%</strong> {isEn ? 'faster in games' : 'výkonnější ve hrách'}
            </div>
          )}

          {upgradeUrl && (
            <a href={upgradeUrl} className="guru-upgrade-pill">
              <Zap size={14} fill="currentColor" /> {isEn ? `Upgrade Analysis: ${loser.name} → ${winner.name}` : `Analýza upgradu: ${loser.name} → ${winner.name}`} <ArrowRight size={14} />
            </a>
          )}
        </header>

        {/* VS RING */}
        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px', position: 'relative' }}>
            <div className="gpu-card-box" style={{ borderTop: `5px solid ${getVendorColor(gpuA?.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(gpuA?.vendor) }}>{gpuA?.vendor || ''}</span>
                <h2 className="gpu-name-text">{normalizeName(gpuA?.name || "")}</h2>
            </div>
            
            <div className="vs-center-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div className="vs-badge">vs</div>
                {!winner && (
                    <div className="tie-badge">
                        <Swords size={12} /> {isEn ? 'PERFORMANCE TIE' : 'VYROVNANÝ VÝKON'}
                    </div>
                )}
            </div>

            <div className="gpu-card-box" style={{ borderTop: `5px solid ${getVendorColor(gpuB?.vendor)}` }}>
                <span className="vendor-label" style={{ color: getVendorColor(gpuB?.vendor) }}>{gpuB?.vendor || ''}</span>
                <h2 className="gpu-name-text">{normalizeName(gpuB?.name || "")}</h2>
            </div>
        </div>

        {/* BENCHMARK SUMMARY */}
        {Object.keys(fpsA).length > 0 && Object.keys(fpsB).length > 0 && (
            <section style={{ marginBottom: '60px' }}>
            <div className="content-box-style" style={{ borderLeft: '6px solid #66fcf1' }}>
                <h2 className="section-h2" style={{ color: '#66fcf1', border: 'none', padding: 0 }}>
                <BarChart3 size={28} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                {isEn ? 'GAMING PERFORMANCE SUMMARY' : 'SHRNUTÍ HERNÍHO VÝKONU'}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    {[
                        { label: 'CYBERPUNK 2077', diff: cyberpunkDiff },
                        { label: 'WARZONE', diff: warzoneDiff },
                        { label: 'STARFIELD', diff: starfieldDiff }
                    ].map((item, i) => (
                        <div key={i} className="summary-item">
                            <span className="summary-label">{item.label}</span>
                            <div className="summary-val" style={{ color: item.diff >= 0 ? '#66fcf1' : '#ff0055' }}>{item.diff > 0 ? '+' : ''}{item.diff} %</div>
                        </div>
                    ))}
                    <div className="summary-item" style={{ background: 'rgba(102, 252, 241, 0.1)', border: '1px solid rgba(102, 252, 241, 0.3)' }}>
                        <span className="summary-label" style={{ color: '#66fcf1' }}>{isEn ? 'AVERAGE LEAD' : 'PRŮMĚRNÝ NÁSKOK'}</span>
                        <div className="summary-val" style={{ color: '#fff' }}>{avgDiffMagnitude > 0 ? '+' : ''}{avgDiffMagnitude} %</div>
                    </div>
                </div>
            </div>
            </section>
        )}

        {/* FPS ANALYSIS MATRIX */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Gamepad2 size={28} /> {isEn ? 'DETAILED GAME FPS ANALYSIS' : 'DETAILNÍ FPS ANALÝZY HER'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
              {/* 🚀 GURU FIX: Ochrana mapování přes .filter(Boolean) */}
              {[gpuA, gpuB].filter(Boolean).map((gpu, i) => (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(gpu?.vendor) }}>{gpu?.name || "GPU"}</div>
                      <div className="matrix-links">
                          {gamesList.map((game) => (
                              <a key={game} href={`/${isEn ? 'en/' : ''}gpu-fps/${slugify(gpu?.name || "")}/${game}`} className="matrix-link">
                                  <ExternalLink size={14} /> {game.replace(/-/g, ' ').toUpperCase()} Benchmark
                              </a>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
        </section>

        {/* H2 GAMING PERFORMANCE */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ borderLeft: '4px solid #66fcf1' }}>
            {isEn ? `${gpuA?.name || "GPU A"} vs ${gpuB?.name || "GPU B"} – Gaming Performance` : `${gpuA?.name || "GPU A"} vs ${gpuB?.name || "GPU B"} – Herní výkon`}
          </h2>
          <p style={{ color: '#d1d5db', fontSize: '1.1rem', lineHeight: '1.7' }}>
            {isEn 
              ? `In modern titles like Cyberpunk 2077, Call of Duty: Warzone, and Starfield, the ${winner ? winner.name : 'both cards'} deliver ${winner ? `a lead of ${finalPerfDiff}%` : 'comparable results'}. Our benchmark analysis shows that ${gpuA?.name || "GPU A"} and ${gpuB?.name || "GPU B"} are competitive options for ${gpuA?.vram_gb >= 12 ? '1440p and 4K' : '1080p and 1440p'} gaming.`
              : `V moderních hrách jako Cyberpunk 2077, Call of Duty: Warzone a Starfield dosahuje ${winner ? winner.name : 'obě karty'} ${winner ? `náskoku o ${finalPerfDiff} %` : 'srovnatelných výsledků'}. Naše analýza benchmarků ukazuje, že ${gpuA?.name || "GPU A"} a ${gpuB?.name || "GPU B"} jsou skvělými volbami pro hraní v ${gpuA?.vram_gb >= 12 ? '1440p a 4K' : '1080p a 1440p'} rozlišení.`
            }
          </p>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <div className="content-box-style">
             <div className="guru-prose-style" dangerouslySetInnerHTML={{ __html: isEn ? duel.content_en : duel.content_cs }} />
          </div>
        </section>

        {/* SPECS TABLE */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutList size={28} /> {isEn ? 'ARCHITECTURE & TECHNICAL SPECS' : 'ARCHITEKTURA A SPECIFIKACE'}
          </h2>
          <div className="table-wrapper">
             {[
               { label: 'VRAM', valA: `${gpuA?.vram_gb ?? '-'} GB`, valB: `${gpuB?.vram_gb ?? '-'} GB`, winA: gpuA?.vram_gb, winB: gpuB?.vram_gb },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', valA: gpuA?.memory_bus ?? '-', valB: gpuB?.memory_bus ?? '-', winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: `${gpuA?.boost_clock_mhz ?? '-'} MHz`, valB: `${gpuB?.boost_clock_mhz ?? '-'} MHz`, winA: gpuA?.boost_clock_mhz, winB: gpuB?.boost_clock_mhz },
               { label: 'TDP', valA: `${gpuA?.tdp_w ?? '-'} W`, valB: `${gpuB?.tdp_w ?? '-'} W`, winA: gpuA?.tdp_w ?? 999, winB: gpuB?.tdp_w ?? 999, lower: true },
               { label: isEn ? 'GPU ARCHITECTURE' : 'ARCHITEKTURA ČIPU', valA: gpuA?.architecture ?? '-', valB: gpuB?.architecture ?? '-', winA: 0, winB: 0 },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', valA: gpuA?.release_date ? new Date(gpuA.release_date).getFullYear() : '-', valB: gpuB?.release_date ? new Date(gpuB.release_date).getFullYear() : '-', winA: 0, winB: 0 },
               { label: isEn ? 'MSRP PRICE' : 'ZAVÁDĚCÍ CENA', valA: gpuA?.release_price_usd ? `$${gpuA.release_price_usd}` : '-', valB: gpuB?.release_price_usd ? `$${gpuB.release_price_usd}` : '-', winA: gpuA?.release_price_usd, winB: gpuB?.release_price_usd, lower: true }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '18px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {/* SIMILAR DUELS */}
        {similar.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LayoutList size={28} /> {isEn ? `COMPARE ${normalizeName(gpuA?.name || "")} WITH` : `SROVNEJTE ${normalizeName(gpuA?.name || "")} S...`}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '15px' }}>
              {similar.map((s, i) => (
                <a key={i} href={isEn ? `/en/gpuvs/${s.slug_en ?? `en-${s.slug}`}` : `/gpuvs/${s.slug}`} className="similar-link-card">
                  <Swords size={16} color="#66fcf1" /> {isEn ? (s.title_en ?? s.title_cs) : s.title_cs}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="deals-btn-style"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn-style"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-ranking-link { display: inline-flex; align-items: center; gap: 8px; color: #a855f7; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .guru-verdict { margin-top: 25px; color: #66fcf1; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 10px 25px; background: rgba(102, 252, 241, 0.05); border: 1px solid rgba(102, 252, 241, 0.2); border-radius: 50px; display: inline-block; }
        .guru-upgrade-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 25px; background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 50px; text-decoration: none; font-weight: 950; font-size: 13px; text-transform: uppercase; margin-top: 25px; transition: 0.3s; box-shadow: 0 0 20px rgba(168, 85, 247, 0.1); }
        .gpu-card-box { background: rgba(15, 17, 21, 0.95); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(10px); flex: 1; }
        .vendor-label { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 15px; display: block; }
        .gpu-name-text { font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 950; color: #fff; text-transform: uppercase; margin: 0; line-height: 1.1; }
        .vs-badge { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(255,0,85,0.6); color: #fff; transform: rotate(-5deg); z-index: 10; }
        .tie-badge { background: rgba(255,255,255,0.1); color: #fff; padding: 5px 12px; border-radius: 50px; font-size: 9px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 6px; backdrop-filter: blur(5px); }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .summary-item { background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .summary-label { display: block; font-size: 10px; font-weight: 900; color: #4b5563; margin-bottom: 8px; letter-spacing: 1px; }
        .summary-val { font-size: 24px; font-weight: 950; }
        .section-h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 10px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }
        .matrix-gpu-title { font-size: 11px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; }
        .matrix-links { display: flex; flex-direction: column; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 14px; font-weight: bold; transition: 0.2s; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 10px; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.1); transform: translateX(5px); }
        .similar-link-card { display: flex; align-items: center; gap: 12px; background: rgba(15, 17, 21, 0.8); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-decoration: none; color: #d1d5db; font-weight: 900; font-size: 13px; text-transform: uppercase; transition: 0.3s; }
        .deals-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .support-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .vs-badge { margin: 10px auto; rotate: 0deg; } .deals-btn-style, .support-btn-style { width: 100%; } .table-label { width: 100px; } }
      `}} />
    </div>
  );
}
