import React from 'react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Swords, 
  Calendar,
  Trophy,
  Zap,
  Gamepad2
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - DETAIL V67.1 (FPS & SEO FIX)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ FIX 1: Opraveny CSS vlastnosti v globálním style tagu (kebab-case).
 * 🛡️ FIX 2: Vylepšená extrakce FPS dat (ošetření pole vs objektu).
 * 🛡️ FIX 3: Explicitní PostgREST join hint !gpu_id pro garantované načtení FPS dat.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🛡️ GURU ENGINE: Vyhledávání karty z DB (Nativní Fetch včetně FPS dat)
const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      // 🚀 GURU FIX: Explicitní join game_fps!gpu_id
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

// 🚀 GURU ENGINE: Bleskové generování Programmatic SEO obsahu
async function generateAndPersistDuel(slug) {
  if (!supabaseUrl) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    const parts = cleanSlug.split('-vs-');
    if (parts.length !== 2) return null;

    const cardA = await findGpu(parts[0]);
    const cardB = await findGpu(parts[1]);

    if (!cardA || !cardB) return null;

    const title_cs = `Srovnání grafických karet: ${cardA.name} vs ${cardB.name}`;
    const title_en = `Graphics cards comparison: ${cardA.name} vs ${cardB.name}`;

    // 1. Výpočet výkonnostního rozdílu
    let perfDiff = 0;
    let winnerName = null;
    if (cardA.performance_index && cardB.performance_index) {
        perfDiff = Math.round((Math.max(cardA.performance_index, cardB.performance_index) / Math.min(cardA.performance_index, cardB.performance_index) - 1) * 100);
        winnerName = cardA.performance_index > cardB.performance_index ? cardA.name : cardB.name;
    }

    // 2. Extrakce FPS dat pro textový rozbor
    const fpsA = Array.isArray(cardA.game_fps) ? cardA.game_fps[0] : (cardA.game_fps || null);
    const fpsB = Array.isArray(cardB.game_fps) ? cardB.game_fps[0] : (cardB.game_fps || null);

    let fpsTextEn = "";
    let fpsTextCs = "";

    if (fpsA && fpsB) {
        fpsTextEn = `
          <h2>Gaming Performance (1440p)</h2>
          <p>Looking at real-world gaming benchmarks at 1440p resolution, the ${cardA.name} achieves approximately <strong>${fpsA.cyberpunk_1440p} FPS</strong> in Cyberpunk 2077, <strong>${fpsA.warzone_1440p} FPS</strong> in Call of Duty: Warzone, and <strong>${fpsA.starfield_1440p} FPS</strong> in Starfield. In comparison, the ${cardB.name} delivers roughly <strong>${fpsB.cyberpunk_1440p} FPS</strong>, <strong>${fpsB.warzone_1440p} FPS</strong>, and <strong>${fpsB.starfield_1440p} FPS</strong> respectively.</p>
        `;
        fpsTextCs = `
          <h2>Reálný herní výkon (1440p)</h2>
          <p>Při pohledu na reálné herní benchmarky v rozlišení 1440p dosahuje model ${cardA.name} přibližně <strong>${fpsA.cyberpunk_1440p} FPS</strong> v Cyberpunk 2077, <strong>${fpsA.warzone_1440p} FPS</strong> v Call of Duty: Warzone a <strong>${fpsA.starfield_1440p} FPS</strong> v titulu Starfield. Pro srovnání, konkurenční ${cardB.name} vykazuje hodnoty kolem <strong>${fpsB.cyberpunk_1440p} FPS</strong>, <strong>${fpsB.warzone_1440p} FPS</strong> a <strong>${fpsB.starfield_1440p} FPS</strong>.</p>
        `;
    }

    // 3. Tvorba SEO Metadat
    let seo_desc_cs = `Která grafická karta je lepší? Detailní srovnání specifikací a výkonu mezi ${cardA.name} a ${cardB.name}.`;
    let seo_desc_en = `Which graphics card is better? Detailed specs and performance comparison between ${cardA.name} and ${cardB.name}.`;

    if (winnerName) {
        seo_desc_cs += ` Vítězem v hrubém výkonu je ${winnerName} s náskokem ${perfDiff}%.`;
        seo_desc_en += ` The raw performance winner is ${winnerName} with a ${perfDiff}% lead.`;
    }

    // 4. Skládání Programmatic SEO obsahu
    const content_en = `
      <h2>Overview</h2>
      <p>The <strong>${cardA.name}</strong> and <strong>${cardB.name}</strong> are powerful graphics cards designed for modern gaming experiences. This detailed comparison looks at technical specifications, architecture differences, and actual gaming performance to help you decide which hardware is the right choice for your PC build.</p>
      
      <h2>Technical Benchmark Results</h2>
      <p>Based on our aggregated performance index, ${winnerName ? `the <strong>${winnerName}</strong> is the clear winner, offering approximately <strong>${perfDiff}% more power</strong> in standard gaming scenarios.` : `both GPUs are extremely close in terms of raw processing power.`}</p>
      
      ${fpsTextEn}

      <h2>Architecture and Specifications</h2>
      <p>The ${cardA.name} is based on the <strong>${cardA.architecture}</strong> architecture and features <strong>${cardA.vram_gb} GB</strong> of VRAM with a ${cardA.memory_bus} bus. The ${cardB.name} uses the <strong>${cardB.architecture}</strong> architecture and comes equipped with <strong>${cardB.vram_gb} GB</strong> of VRAM on a ${cardB.memory_bus} bus.</p>
      
      <h2>Conclusion</h2>
      <p>Choosing between the ${cardA.name} and ${cardB.name} depends on your budget and specific needs. ${winnerName ? `If pure performance is your priority, the ${winnerName} is the better option.` : `Both cards provide high value for gamers.`} Consider current pricing and power requirements (${cardA.tdp_w}W vs ${cardB.tdp_w}W) before making your final purchase.</p>
    `;

    const content_cs = `
      <h2>Přehled srovnání</h2>
      <p>Grafické karty <strong>${cardA.name}</strong> a <strong>${cardB.name}</strong> patří mezi populární volby pro moderní hraní. Toto detailní srovnání se zaměřuje na technické specifikace, rozdíly v architekturách a reálný herní výkon, aby vám pomohlo vybrat ten správný hardware pro váš počítač.</p>
      
      <h2>Výsledky technických benchmarků</h2>
      <p>Na základě našeho agregovaného výkonnostního indexu ${winnerName ? `vítězí <strong>${winnerName}</strong>, která nabízí přibližně o <strong>${perfDiff} % vyšší výkon</strong> v běžných herních scénářích.` : `jsou obě grafické karty z hlediska hrubého výpočetního výkonu extrémně vyrovnané.`}</p>
      
      ${fpsTextCs}

      <h2>Architektura a specifikace</h2>
      <p>Model ${cardA.name} je postaven na architektuře <strong>${cardA.architecture}</strong> a disponuje <strong>${cardA.vram_gb} GB</strong> VRAM s ${cardA.memory_bus} sběrnicí. Konkurenční ${cardB.name} využívá architekturu <strong>${cardB.architecture}</strong> a je vybavena <strong>${cardB.vram_gb} GB</strong> VRAM na ${cardB.memory_bus} sběrnici.</p>
      
      <h2>Závěrečný verdikt</h2>
      <p>Volba mezi ${cardA.name} a ${cardB.name} závisí na vašem rozpočtu a specifických požadavcích. ${winnerName ? `Pokud je vaší prioritou čistý výkon, ${winnerName} je jasnou volbou.` : `Obě karty nabízejí skvělou hodnotu pro hráče.`} Před nákupem doporučujeme zvážit aktuální ceny a nároky na napájecí zdroj (${cardA.tdp_w}W vs ${cardB.tdp_w}W).</p>
    `;

    const payload = {
        slug: cleanSlug,
        slug_en: `en-${cleanSlug}`,
        gpu_a_id: cardA.id,
        gpu_b_id: cardB.id,
        title_cs,
        title_en,
        content_cs: content_cs, 
        content_en: content_en,
        seo_description_cs: seo_desc_cs,
        seo_description_en: seo_desc_en,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))";
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload)
    });

    if (!dbRes.ok) {
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const existingData = await checkExisting.json();
        return existingData[0] || null;
    }

    const insertedData = await dbRes.json();
    return insertedData[0];
  } catch (err) {
    return null;
  }
}

// Načtení dat z DB
const getDuelData = async (slug) => {
  if (!supabaseUrl) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/geforce-/g, '').replace(/radeon-/g, '');

  const orQuery = `slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug}`;
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  const url = `${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&or=(${encodeURIComponent(orQuery)})&limit=1`;

  try {
      const res = await fetch(url, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();

      if (!data || data.length === 0) {
          return await generateAndPersistDuel(slug);
      }
      return data[0];
  } catch (e) { return null; }
};

export async function generateMetadata({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  if (!duel) return { title: '404 | The Hardware Guru' };

  const isEn = slug?.startsWith('en-');
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const desc = isEn && duel.seo_description_en ? duel.seo_description_en : duel.seo_description_cs;
  
  return { 
    title: `${title} | The Hardware Guru`,
    description: desc,
    openGraph: { title, description: desc }
  };
}

export default async function GpuDuelDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  
  if (!duel) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#ff0055', fontSize: '30px', fontWeight: '900', textTransform: 'uppercase' }}>404 - DUEL NENALEZEN</h1>
      </div>
    );
  }

  const isEn = slug?.startsWith('en-');
  const { gpuA, gpuB } = duel;
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date(duel.created_at || Date.now()));
  const backLink = isEn ? '/en/gpuvs' : '/gpuvs';
  
  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    if (aWins) return { color: '#66fcf1', fontWeight: '950', textShadow: '0 0 15px rgba(102,252,241,0.4)' };
    return { color: '#4b5563', opacity: 0.6 }; 
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  // 🚀 VÝPOČET REÁLNÉHO VÝKONU
  const hasPerfData = gpuA.performance_index > 0 && gpuB.performance_index > 0;
  let perfDiff = 0;
  let perfWinner = null;
  let perfColor = '#4b5563';

  if (hasPerfData) {
    if (gpuA.performance_index > gpuB.performance_index) {
      perfWinner = gpuA;
      perfDiff = Math.round(((gpuA.performance_index / gpuB.performance_index) - 1) * 100);
      perfColor = getVendorColor(gpuA.vendor);
    } else if (gpuB.performance_index > gpuA.performance_index) {
      perfWinner = gpuB;
      perfDiff = Math.round(((gpuB.performance_index / gpuA.performance_index) - 1) * 100);
      perfColor = getVendorColor(gpuB.vendor);
    }
  }

  // 🚀 FPS DATA PRO VIZUALIZACI (Ošetření pole vs objektu)
  const extractFps = (gpu) => {
    if (!gpu || !gpu.game_fps) return null;
    return Array.isArray(gpu.game_fps) ? gpu.game_fps[0] : gpu.game_fps;
  };

  const fpsA = extractFps(gpuA);
  const fpsB = extractFps(gpuB);

  const content = isEn ? duel.content_en : duel.content_cs;

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px',
        color: '#fff', fontFamily: 'sans-serif'
    }}>
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <a href={backLink} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
            <span className="opacity-30">|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', lineHeight: '1.1', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
            {title}
          </h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuA.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuA.vendor} • {gpuA.architecture}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{gpuA.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '70px', background: '#ff0055', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '24px', border: '5px solid #0f1115', boxShadow: '0 0 30px rgba(255,0,85,0.6)', color: '#fff', transform: 'rotate(-5deg)' }}>VS</div>
            </div>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuB.vendor} • {gpuB.architecture}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{gpuB.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Zap size={36} className="text-[#66fcf1]" /> {isEn ? 'RAW PERFORMANCE' : 'HRUBÝ VÝKON'}
          </h2>
          {hasPerfData && perfWinner ? (
              <div className="perf-box" style={{ background: `linear-gradient(135deg, rgba(15, 17, 21, 0.9) 0%, ${perfColor}15 100%)`, border: `1px solid ${perfColor}40`, borderRadius: '24px', padding: '40px', boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px ${perfColor}10`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: perfColor }}></div>
                  <div className="perf-box-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ color: perfColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={18} /> {isEn ? 'PERFORMANCE WINNER' : 'VÍTĚZ HRUBÉHO VÝKONU'}</div>
                        <div style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', margin: 0, lineHeight: 1.1 }}>{perfWinner.name.replace('GeForce ', '').replace('Radeon ', '')}</div>
                        <p style={{ color: '#9ca3af', marginTop: '15px', fontSize: '15px', maxWidth: '600px' }}>{isEn ? `The aggregated benchmarks show a clear performance advantage of ${perfDiff}% for the ${perfWinner.name}.` : `Agregované benchmarky vykazují jasnou výkonnostní převahu o ${perfDiff} % pro kartu ${perfWinner.name}.`}</p>
                    </div>
                    <div style={{ background: perfColor, color: perfWinner.vendor.toUpperCase() === 'NVIDIA' ? '#000' : '#fff', padding: '20px 30px', borderRadius: '20px', fontWeight: '950', fontSize: '36px', boxShadow: `0 0 40px ${perfColor}80`, whiteSpace: 'nowrap' }}>+{perfDiff} %</div>
                  </div>
              </div>
          ) : <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', color: '#9ca3af', fontStyle: 'italic' }}>{isEn ? "Detailed benchmark data unavailable." : "Detailní data benchmarků nedostupná."}</div>}
        </section>

        {/* 🚀 GURU: HERNÍ FPS SROVNÁNÍ */}
        {fpsA && fpsB && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Gamepad2 size={36} color="#fff" /> {isEn ? 'GAMING FPS (1440p)' : 'HERNÍ VÝKON (1440p)'}
            </h2>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
               <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
                 <div style={{ ...getWinnerStyle(fpsA.cyberpunk_1440p, fpsB.cyberpunk_1440p), fontSize: '24px', textAlign: 'right' }}>{fpsA.cyberpunk_1440p} FPS</div>
                 <div className="fps-label">CYBERPUNK 2077</div>
                 <div style={{ ...getWinnerStyle(fpsB.cyberpunk_1440p, fpsA.cyberpunk_1440p), fontSize: '24px', textAlign: 'left' }}>{fpsB.cyberpunk_1440p} FPS</div>
               </div>
               <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
                 <div style={{ ...getWinnerStyle(fpsA.warzone_1440p, fpsB.warzone_1440p), fontSize: '24px', textAlign: 'right' }}>{fpsA.warzone_1440p} FPS</div>
                 <div className="fps-label">WARZONE</div>
                 <div style={{ ...getWinnerStyle(fpsB.warzone_1440p, fpsA.warzone_1440p), fontSize: '24px', textAlign: 'left' }}>{fpsB.warzone_1440p} FPS</div>
               </div>
               <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', alignItems: 'center' }}>
                 <div style={{ ...getWinnerStyle(fpsA.starfield_1440p, fpsB.starfield_1440p), fontSize: '24px', textAlign: 'right' }}>{fpsA.starfield_1440p} FPS</div>
                 <div className="fps-label">STARFIELD</div>
                 <div style={{ ...getWinnerStyle(fpsB.starfield_1440p, fpsA.starfield_1440p), fontSize: '24px', textAlign: 'left' }}>{fpsB.starfield_1440p} FPS</div>
               </div>
            </div>
          </section>
        )}

        {content && (
          <section style={{ marginBottom: '60px' }}>
             <div style={{ background: 'rgba(15, 17, 21, 0.95)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                 <div className="guru-prose" dangerouslySetInnerHTML={{ __html: content }} />
             </div>
          </section>
        )}

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px' }}>{isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
               <div style={{ ...getWinnerStyle(gpuA.vram_gb, gpuB.vram_gb), fontSize: '24px', textAlign: 'right' }}>{gpuA.vram_gb} GB</div>
               <div className="fps-label">VRAM</div>
               <div style={{ ...getWinnerStyle(gpuB.vram_gb, gpuA.vram_gb), fontSize: '24px', textAlign: 'left' }}>{gpuB.vram_gb} GB</div>
             </div>
             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
               <div style={{ color: '#e5e7eb', fontSize: '22px', fontWeight: 'bold', textAlign: 'right' }}>{gpuA.memory_bus}</div>
               <div className="fps-label">{isEn ? 'BUS' : 'SBĚRNICE'}</div>
               <div style={{ color: '#e5e7eb', fontSize: '22px', fontWeight: 'bold', textAlign: 'left' }}>{gpuB.memory_bus}</div>
             </div>
             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
               <div style={{ ...getWinnerStyle(gpuA.boost_clock_mhz, gpuB.boost_clock_mhz), fontSize: '24px', textAlign: 'right' }}>{gpuA.boost_clock_mhz} MHz</div>
               <div className="fps-label">BOOST CLOCK</div>
               <div style={{ ...getWinnerStyle(gpuB.boost_clock_mhz, gpuA.boost_clock_mhz), fontSize: '24px', textAlign: 'left' }}>{gpuB.boost_clock_mhz} MHz</div>
             </div>
             <div className="spec-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', padding: '25px 30px', alignItems: 'center' }}>
               <div style={{ ...getWinnerStyle(gpuA.tdp_w, gpuB.tdp_w, true), fontSize: '24px', textAlign: 'right' }}>{gpuA.tdp_w} W</div>
               <div className="fps-label">TDP</div>
               <div style={{ ...getWinnerStyle(gpuB.tdp_w, gpuA.tdp_w, true), fontSize: '24px', textAlign: 'left' }}>{gpuB.tdp_w} W</div>
             </div>
          </div>
        </section>

        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>{isEn ? "Support the Guru by checking out our latest deals." : "Podpořte Guru nákupem her za nejlepší ceny na trhu."}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); }
        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; }
        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none; transition: 0.3s; }
        .guru-prose { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-top: 1.5em; margin-bottom: 0.8em; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        .guru-prose p { margin-bottom: 1.5em; }
        .guru-prose strong { color: #fff; font-weight: 900; }
        /* 🚀 GURU FIX: Standardní kebab-case vlastnosti pro RAW CSS */
        .fps-label { padding: 0 30px; font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; text-align: center; }
        @media (max-width: 768px) { .guru-deals-btn, .guru-support-btn { width: 100%; } .guru-grid-ring { grid-template-columns: 1fr !important; } .guru-grid-ring > div:nth-child(2) { margin: -10px 0 !important; } }
      `}} />
    </div>
  );
}
