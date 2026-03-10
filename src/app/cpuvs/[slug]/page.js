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
  Cpu,
  Activity,
  BarChart3,
  Gamepad2
} from 'lucide-react';

/**
 * GURU CPU DUELS ENGINE - DETAIL V67.4 (GPU LOGIC SYNC)
 * Cesta: src/app/cpuvs/[slug]/page.js
 * 🛡️ FIX 1: Podpora '-to-' v URL parseru pro upgrade duely (z GPU).
 * 🛡️ FIX 2: Agresivní slugify engine zachovávající SEO názvy (z GPU).
 * 🛡️ FIX 3: Ochrana resolution=merge-duplicates proti souběžnému zápisu (z GPU).
 * 🛡️ FIX 4: Nahrazeno cache: 'no-store' za ISR revalidate (86400) + React cache.
 */

export const runtime = "nodejs";
export const revalidate = 86400;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🚀 GURU: Agresivní slugify engine (zachovává vendor názvy pro čisté SEO)
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/processor|cpu/gi, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
};

// 🛡️ GURU ENGINE: Vyhledávání CPU z DB (ROBUSTNÍ PARSER)
const findCpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  
  // 🚀 GURU FIX: Stejná super-stabilní Regex logika jako u GPU
  const clean = slugPart.replace(/-/g, " ").replace(/ryzen|core|intel|amd|ultra/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks || chunks.length === 0) return null;
  
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=*&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data[0] || null;
  } catch (e) { return null; }
};

// 🚀 GURU ENGINE: Bleskové generování bez zdržování AI (Nativní Fetch)
async function generateAndPersistDuel(slug) {
  if (!supabaseUrl) return null;

  try {
    const cleanSlug = slug.replace(/^en-/, '');
    
    // 🛡️ GURU FIX: Podpora -to- i -vs- (Kopie z GPU)
    let parts;
    if (cleanSlug.includes('-vs-')) {
      parts = cleanSlug.split('-vs-');
    } else if (cleanSlug.includes('-to-')) {
      parts = cleanSlug.split('-to-');
    }

    if (!parts || parts.length !== 2) return null;

    const cpuA = await findCpu(parts[0]);
    const cpuB = await findCpu(parts[1]);

    if (!cpuA || !cpuB) return null;

    // Rychlé vygenerování metadat (Žádné halucinující AI texty)
    const title_cs = `Srovnání procesorů: ${cpuA.name} vs ${cpuB.name}`;
    const title_en = `Processors comparison: ${cpuA.name} vs ${cpuB.name}`;
    
    let seo_desc_cs = `Který procesor je lepší? Detailní srovnání specifikací a výkonu mezi ${cpuA.name} a ${cpuB.name}.`;
    let seo_desc_en = `Which processor is better? Detailed specs and performance comparison between ${cpuA.name} and ${cpuB.name}.`;

    // Pokud máme skóre, rovnou ho přidáme do SEO popisku
    if (cpuA.performance_index && cpuB.performance_index) {
        const diff = Math.round((Math.max(cpuA.performance_index, cpuB.performance_index) / Math.min(cpuA.performance_index, cpuB.performance_index) - 1) * 100);
        const winner = cpuA.performance_index > cpuB.performance_index ? cpuA.name : cpuB.name;
        seo_desc_cs += ` Vítězem v hrubém herním výkonu je ${winner} s náskokem ${diff}%.`;
        seo_desc_en += ` The raw gaming performance winner is ${winner} with a ${diff}% lead.`;
    }

    const payload = {
        slug: cleanSlug,
        slug_en: `en-${cleanSlug}`,
        cpu_a_id: cpuA.id,
        cpu_b_id: cpuB.id,
        title_cs,
        title_en,
        seo_description_cs: seo_desc_cs,
        seo_description_en: seo_desc_en,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,cpuA:cpus!cpu_a_id(*),cpuB:cpus!cpu_b_id(*)";
    
    // 🛡️ GURU CONCURRENCY FIX: resolution=merge-duplicates jako u GPU
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}`, {
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
        console.error("GURU DB INSERT ERROR:", await dbRes.text());
        const checkExisting = await fetch(`${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, {
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

// Načtení dat z DB (Nativní Fetch s React Cache)
const getDuelData = cache(async (slug) => {
  if (!supabaseUrl) return null;
  const cleanSlug = slug.replace(/^en-/, '');
  const normalizedSlug = cleanSlug.replace(/intel-/g, '').replace(/amd-/g, '');

  // 🛡️ GURU FIX: Přidáno slug_en.eq.${slug} jako u GPU
  const orQuery = `slug.eq.${slug},slug.eq.${cleanSlug},slug.eq.${normalizedSlug},slug_en.eq.${slug}`;
  const selectQuery = `*,cpuA:cpus!cpu_a_id(*),cpuB:cpus!cpu_b_id(*)`;
  const url = `${supabaseUrl}/rest/v1/cpu_duels?select=${encodeURIComponent(selectQuery)}&or=(${encodeURIComponent(orQuery)})&limit=1`;

  try {
      const res = await fetch(url, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      if (!res.ok) return null;
      const data = await res.json();

      if (!data || data.length === 0) {
          return await generateAndPersistDuel(slug);
      }
      return data[0];
  } catch (e) { return null; }
});

// SEO Metadata
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

export default async function CpuDuelDetail({ params }) {
  const slug = params?.slug ?? null;
  const duel = await getDuelData(slug);
  
  if (!duel) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#ff0055', fontSize: '30px', fontWeight: '900', textTransform: 'uppercase' }}>404 - DUEL NENALEZEN</h1>
      </div>
    );
  }

  // Základní nastavení
  const isEn = slug?.startsWith('en-');
  const { cpuA, cpuB } = duel;
  const title = isEn && duel.title_en ? duel.title_en : duel.title_cs;
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  }).format(new Date(duel.created_at || Date.now()));
  const backLink = isEn ? '/en/cpuvs' : '/cpuvs';
  
  // Design funkce
  const getWinnerClass = (valA, valB, lowerIsBetter = false) => {
    if (valA === valB) return 'text-neutral-400';
    if (lowerIsBetter) return valA < valB ? 'text-green-400 font-black' : 'text-red-400';
    return valA > valB ? 'text-green-400 font-black' : 'text-red-400';
  };

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'INTEL' ? '#0071c5' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  // 🚀 GURU: VÝPOČET REÁLNÉHO VÝKONU
  const hasPerfData = cpuA.performance_index > 0 && cpuB.performance_index > 0;
  let perfDiff = 0;
  let perfWinner = null;
  let perfColor = '#4b5563';

  if (hasPerfData) {
    if (cpuA.performance_index > cpuB.performance_index) {
      perfWinner = cpuA;
      perfDiff = Math.round(((cpuA.performance_index / cpuB.performance_index) - 1) * 100);
      perfColor = getVendorColor(cpuA.vendor);
    } else if (cpuB.performance_index > cpuA.performance_index) {
      perfWinner = cpuB;
      perfDiff = Math.round(((cpuB.performance_index / cpuA.performance_index) - 1) * 100);
      perfColor = getVendorColor(cpuB.vendor);
    }
  }

  return (
    <div style={{ 
        minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', 
        backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px',
        color: '#fff', fontFamily: 'sans-serif'
    }}>
      
      {/* 🚀 Ochranný Main Wrapper */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        
        {/* Tlačítko Zpět - Klasický A tag kvůli stabilitě */}
        <div style={{ marginBottom: '30px' }}>
          <a href={backLink} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}
          </a>
        </div>

        {/* HLAVIČKA DUELU */}
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

        {/* 🚀 GURU FIX: ABSOLUTNĚ NEPŮSTŘELNÝ GRID PRO RING */}
        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            
            {/* KARTA A */}
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(cpuA.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(cpuA.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{cpuA.vendor} • {cpuA.architecture}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{cpuA.name}</h2>
            </div>
            
            {/* VS ZNAK */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '70px', background: '#ff0055', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '24px', border: '5px solid #0f1115', boxShadow: '0 0 30px rgba(255,0,85,0.6)', color: '#fff', transform: 'rotate(-5deg)' }}>VS</div>
            </div>

            {/* KARTA B */}
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(cpuB.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(cpuB.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{cpuB.vendor} • {cpuB.architecture}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{cpuB.name}</h2>
            </div>
        </div>

        {/* 🚀 GURU: VÝKONOVÝ ROZDÍL */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Zap size={36} className="text-[#66fcf1]" /> {isEn ? 'GAMING PERFORMANCE' : 'HERNÍ VÝKON'}
          </h2>
          
          {hasPerfData && perfWinner ? (
              <div className="perf-box" style={{
                  background: `linear-gradient(135deg, rgba(15, 17, 21, 0.9) 0%, ${perfColor}15 100%)`,
                  border: `1px solid ${perfColor}40`,
                  borderRadius: '24px',
                  padding: '40px',
                  boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px ${perfColor}10`,
                  position: 'relative',
                  overflow: 'hidden'
              }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: perfColor }}></div>
                  <div className="perf-box-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ color: perfColor, fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Trophy size={18} /> {isEn ? 'GAMING PERFORMANCE WINNER' : 'VÍTĚZ HERNÍHO VÝKONU'}
                        </div>
                        <div style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', margin: 0, lineHeight: 1.1 }}>
                            {perfWinner.name}
                        </div>
                        <p style={{ color: '#9ca3af', marginTop: '15px', fontSize: '15px', maxWidth: '600px' }}>
                          {isEn 
                            ? `Based on aggregate gaming benchmarks, the ${perfWinner.name} provides a clear performance advantage over its competitor in gaming scenarios.` 
                            : `Na základě agregovaných herních benchmarků poskytuje procesor ${perfWinner.name} jasnou výkonnostní výhodu nad svým konkurentem ve hrách.`}
                        </p>
                    </div>
                    <div style={{
                        background: perfColor,
                        color: perfWinner.vendor.toUpperCase() === 'INTEL' ? '#fff' : '#000',
                        padding: '20px 30px',
                        borderRadius: '20px',
                        fontWeight: '950',
                        fontSize: '36px',
                        boxShadow: `0 0 40px ${perfColor}80`,
                        whiteSpace: 'nowrap'
                    }}>
                        +{perfDiff} %
                    </div>
                  </div>
              </div>
          ) : hasPerfData && !perfWinner ? (
              <div className="perf-box" style={{
                  background: `linear-gradient(135deg, rgba(15, 17, 21, 0.9) 0%, rgba(255,255,255,0.05) 100%)`,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: '24px',
                  padding: '40px',
                  boxShadow: `0 20px 50px rgba(0,0,0,0.5)`,
                  position: 'relative',
                  overflow: 'hidden'
              }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#9ca3af' }}></div>
                  <div className="perf-box-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Swords size={18} /> {isEn ? 'PERFORMANCE TIE' : 'VYROVNANÝ VÝKON'}
                        </div>
                        <div style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', margin: 0, lineHeight: 1.1 }}>
                            {isEn ? 'IDENTICAL PERFORMANCE' : 'TOTOŽNÝ HERNÍ VÝKON'}
                        </div>
                    </div>
                    <div style={{ background: '#374151', color: '#fff', padding: '20px 30px', borderRadius: '20px', fontWeight: '950', fontSize: '36px' }}>
                        0 %
                    </div>
                  </div>
              </div>
          ) : (
             <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', color: '#9ca3af', fontStyle: 'italic' }}>
                {isEn ? "Detailed benchmark data for this exact pairing is currently not available in our index." : "Detailní data z benchmarků pro tuto konkrétní dvojici zatím nejsou v našem indexu k dispozici."}
             </div>
          )}
        </section>

        {/* TABULKA SPECIFIKACÍ */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px' }}>
            {isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}
          </h2>
          <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
             
             <div className="spec-row">
               <div className={`spec-val ${getWinnerClass(cpuA.cores, cpuB.cores)}`}>{cpuA.cores} / {cpuA.threads}</div>
               <div className="spec-label">{isEn ? 'CORES / THREADS' : 'JÁDRA / VLÁKNA'}</div>
               <div className={`spec-val ${getWinnerClass(cpuB.cores, cpuA.cores)}`}>{cpuB.cores} / {cpuB.threads}</div>
             </div>

             <div className="spec-row">
               <div className={`spec-val ${getWinnerClass(cpuA.base_clock_ghz, cpuB.base_clock_ghz)}`}>{cpuA.base_clock_ghz} GHz</div>
               <div className="spec-label">{isEn ? 'BASE CLOCK' : 'ZÁKLADNÍ TAKT'}</div>
               <div className={`spec-val ${getWinnerClass(cpuB.base_clock_ghz, cpuA.base_clock_ghz)}`}>{cpuB.base_clock_ghz} GHz</div>
             </div>

             <div className="spec-row">
               <div className={`spec-val ${getWinnerClass(cpuA.boost_clock_ghz, cpuB.boost_clock_ghz)}`}>{cpuA.boost_clock_ghz} GHz</div>
               <div className="spec-label">BOOST CLOCK</div>
               <div className={`spec-val ${getWinnerClass(cpuB.boost_clock_ghz, cpuA.boost_clock_ghz)}`}>{cpuB.boost_clock_ghz} GHz</div>
             </div>

             <div className="spec-row">
               <div className={`spec-val ${getWinnerClass(cpuA.tdp_w, cpuB.tdp_w, true)}`}>{cpuA.tdp_w} W</div>
               <div className="spec-label">TDP (SPOTŘEBA)</div>
               <div className={`spec-val ${getWinnerClass(cpuB.tdp_w, cpuA.tdp_w, true)}`}>{cpuB.tdp_w} W</div>
             </div>

             <div className="spec-row">
               <div className="spec-val" style={{ color: '#e5e7eb' }}>{cpuA.architecture}</div>
               <div className="spec-label">{isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA'}</div>
               <div className="spec-val" style={{ color: '#e5e7eb' }}>{cpuB.architecture}</div>
             </div>
          </div>
        </section>

        {/* 🚀 GURU: DEEP DIVE CROSS-LINKS PRO NOVÉ CPU LANDING PAGES */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Activity size={36} className="text-[#66fcf1]" /> {isEn ? 'DEEP DIVE ANALYSIS' : 'DETAILNÍ ANALÝZA'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              {[cpuA, cpuB].filter(Boolean).map((cpu, i) => {
                  const safeSlug = cpu.slug || slugify(cpu.name);
                  return (
                  <div key={i} className="fps-matrix-card">
                      <div className="matrix-gpu-title" style={{ color: getVendorColor(cpu.vendor) }}>{cpu.name}</div>
                      <div className="matrix-links">
                          <a href={`/${isEn ? 'en/' : ''}cpu/${safeSlug}`} className="matrix-link">
                              <Cpu size={14} /> {isEn ? 'Full Profile' : 'Kompletní Profil'}
                          </a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-performance/${safeSlug}`} className="matrix-link">
                              <BarChart3 size={14} /> {isEn ? 'Performance Specs' : 'Výkon a Parametry'}
                          </a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-recommend/${safeSlug}`} className="matrix-link">
                              <ShieldCheck size={14} /> {isEn ? 'Guru Verdict' : 'Guru Verdikt'}
                          </a>
                          <a href={`/${isEn ? 'en/' : ''}cpu-fps/${safeSlug}/cyberpunk-2077`} className="matrix-link">
                              <Gamepad2 size={14} /> Cyberpunk 2077 FPS
                          </a>
                      </div>
                  </div>
                  );
              })}
          </div>
        </section>

        {/* GLOBÁLNÍ CTA TLAČÍTKA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Help us build this database by supporting us." : "Pomohl ti tento duel při výběru? Podpoř naši databázi."}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="guru-deals-btn" style={{ flex: '1 1 280px' }}>
              <Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}
            </a>
            <a href={isEn ? "/en/support" : "/support"} className="guru-support-btn" style={{ flex: '1 1 280px' }}>
              <Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}
            </a>
          </div>
        </div>

      </main>

      {/* GLOBÁLNÍ STYLY - ABSOLUTNÍ KOPIE GPUVS PRO MAXIMÁLNÍ STABILITU */}
      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; backdrop-filter: blur(5px); border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(102, 252, 241, 0.1); transform: translateX(-5px); box-shadow: 0 0 20px rgba(102, 252, 241, 0.2); }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        /* Utility classes pre tabulku */
        .spec-row { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }
        .spec-row:nth-child(even) { background: rgba(255,255,255,0.02); }
        .spec-row:hover { background: rgba(255,255,255,0.05); }
        .spec-val { flex: 1; text-align: center; font-size: 16px; font-weight: 900; }
        .spec-label { flex: 1; text-align: center; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
        
        .text-green-400 { color: #4ade80; }
        .text-red-400 { color: #f87171; }
        .text-neutral-400 { color: #a3a3a3; }
        .font-black { font-weight: 900; }

        /* 🚀 GURU: DEEP DIVE STYLY */
        .fps-matrix-card { background: rgba(15,17,21,0.9); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .matrix-gpu-title { font-size: 15px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
        .matrix-links { display: grid; grid-template-columns: 1fr; gap: 10px; }
        .matrix-link { display: flex; align-items: center; gap: 10px; color: #d1d5db; text-decoration: none; font-size: 13px; font-weight: bold; transition: 0.2s; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid transparent; }
        .matrix-link:hover { color: #fff; background: rgba(102, 252, 241, 0.05); transform: translateX(5px); border-color: rgba(102, 252, 241, 0.3); }

        @media (max-width: 768px) {
          .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }

          /* Responzivní logika - Na mobilu složíme Grid pod sebe */
          .guru-grid-ring { grid-template-columns: 1fr !important; gap: 15px !important; }
          .guru-grid-ring > div:nth-child(2) { margin: -10px 0 !important; } /* Odznak VS */

          .perf-box-content { flex-direction: column !important; align-items: flex-start !important; gap: 20px; }
          .spec-row { padding: 15px 10px !important; }
        }
      `}} />
    </div>
  );
}
