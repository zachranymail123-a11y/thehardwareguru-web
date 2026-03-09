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
 * GURU GPU DUELS ENGINE - DETAIL V68.0 (SUPREME SEO OPTIMIZED)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🛡️ SEO FIX 1: Změna cache na revalidate 86400 (24h) pro bleskový výkon a indexaci.
 * 🛡️ SEO FIX 2: Implementace FAQPage Schema (JSON-LD) pro Rich Results v Google.
 * 🚀 INTEGRACE: Programmatic SEO + Herní FPS + Nativní Fetch.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 🛡️ GURU ENGINE: Vyhledávání karty z DB (Optimalizovaná Cache)
const findGpu = async (slugPart) => {
  if (!supabaseUrl) return null;
  const clean = slugPart.replace(/-/g, " ").replace(/geforce|radeon|nvidia|amd/gi, "").trim();
  const chunks = clean.match(/\d+|[a-zA-Z]+/g);
  if (!chunks) return null;
  const searchPattern = `%${chunks.join('%')}%`;

  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&name=ilike.${encodeURIComponent(searchPattern)}&limit=1`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 } // 🚀 GURU SEO: Cache na 24 hodin
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

    let perfDiff = 0;
    let winnerName = null;
    if (cardA.performance_index && cardB.performance_index) {
        perfDiff = Math.round((Math.max(cardA.performance_index, cardB.performance_index) / Math.min(cardA.performance_index, cardB.performance_index) - 1) * 100);
        winnerName = cardA.performance_index > cardB.performance_index ? cardA.name : cardB.name;
    }

    const fpsA = Array.isArray(cardA.game_fps) ? cardA.game_fps[0] : (cardA.game_fps || null);
    const fpsB = Array.isArray(cardB.game_fps) ? cardB.game_fps[0] : (cardB.game_fps || null);

    let fpsTextEn = "";
    let fpsTextCs = "";

    if (fpsA && fpsB) {
        fpsTextEn = `<h2>Gaming Performance (1440p)</h2><p>Looking at real-world gaming benchmarks at 1440p resolution, the ${cardA.name} achieves approximately <strong>${fpsA.cyberpunk_1440p} FPS</strong> in Cyberpunk 2077, <strong>${fpsA.warzone_1440p} FPS</strong> in Call of Duty: Warzone, and <strong>${fpsA.starfield_1440p} FPS</strong> in Starfield. In comparison, the ${cardB.name} delivers roughly <strong>${fpsB.cyberpunk_1440p} FPS</strong>, <strong>${fpsB.warzone_1440p} FPS</strong>, and <strong>${fpsB.starfield_1440p} FPS</strong> respectively.</p>`;
        fpsTextCs = `<h2>Reálný herní výkon (1440p)</h2><p>Při pohledu na reálné herní benchmarky v rozlišení 1440p dosahuje model ${cardA.name} přibližně <strong>${fpsA.cyberpunk_1440p} FPS</strong> v Cyberpunk 2077, <strong>${fpsA.warzone_1440p} FPS</strong> v Call of Duty: Warzone a <strong>${fpsA.starfield_1440p} FPS</strong> v titulu Starfield. Pro srovnání, konkurenční ${cardB.name} vykazuje hodnoty kolem <strong>${fpsB.cyberpunk_1440p} FPS</strong>, <strong>${fpsB.warzone_1440p} FPS</strong> a <strong>${fpsB.starfield_1440p} FPS</strong>.</p>`;
    }

    let seo_desc_cs = `Která grafická karta je lepší? Detailní srovnání specifikací a výkonu mezi ${cardA.name} a ${cardB.name}.`;
    let seo_desc_en = `Which graphics card is better? Detailed specs and performance comparison between ${cardA.name} and ${cardB.name}.`;

    if (winnerName) {
        seo_desc_cs += ` Vítězem v hrubém výkonu je ${winnerName} s náskokem ${perfDiff}%.`;
        seo_desc_en += ` The raw performance winner is ${winnerName} with a ${perfDiff}% lead.`;
    }

    const content_en = `<h2>Overview</h2><p>The <strong>${cardA.name}</strong> and <strong>${cardB.name}</strong> are powerful graphics cards designed for modern gaming experiences. This comparison looks at technical specs and actual gaming performance.</p><h2>Technical Benchmark Results</h2><p>${winnerName ? `The <strong>${winnerName}</strong> takes the lead, being approximately <strong>${perfDiff}% faster</strong>.` : `Both cards offer very similar raw performance.`}</p>${fpsTextEn}<h2>Architecture</h2><p>${cardA.name} uses ${cardA.architecture} while ${cardB.name} is based on ${cardB.architecture}.</p>`;
    const content_cs = `<h2>Přehled srovnání</h2><p>Grafické karty <strong>${cardA.name}</strong> a <strong>${cardB.name}</strong> patří mezi populární volby pro moderní hraní. Toto detailní srovnání se zaměřuje na technické specifikace a reálný herní výkon.</p><h2>Výsledky technických benchmarků</h2><p>${winnerName ? `Vítězí model <strong>${winnerName}</strong>, který nabízí přibližně o <strong>${perfDiff} % vyšší výkon</strong>.` : `Obě karty nabízejí velmi vyrovnaný výkon.`}</p>${fpsTextCs}<h2>Architektura</h2><p>${cardA.name} využívá architekturu ${cardA.architecture}, zatímco ${cardB.name} sází na ${cardB.architecture}.</p>`;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, gpu_a_id: cardA.id, gpu_b_id: cardB.id,
        title_cs, title_en, content_cs, content_en, seo_description_cs: seo_desc_cs, seo_description_en: seo_desc_en,
        created_at: new Date().toISOString()
    };

    const selectQuery = "*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))";
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
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
  } catch (err) { return null; }
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
          next: { revalidate: 86400 } // 🚀 GURU SEO: Cache na 24 hodin
      });
      if (!res.ok) return null;
      const data = await res.json();

      if (!data || data.length === 0) return await generateAndPersistDuel(slug);
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
  const formattedDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(duel.created_at || Date.now()));
  
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

  const hasPerfData = gpuA.performance_index > 0 && gpuB.performance_index > 0;
  let perfDiff = 0;
  let winner = null;
  if (hasPerfData) {
    perfDiff = Math.round((Math.max(gpuA.performance_index, gpuB.performance_index) / Math.min(gpuA.performance_index, gpuB.performance_index) - 1) * 100);
    winner = gpuA.performance_index > gpuB.performance_index ? gpuA : gpuB;
  }

  const fpsA = Array.isArray(gpuA.game_fps) ? gpuA.game_fps[0] : (gpuA.game_fps || null);
  const fpsB = Array.isArray(gpuB.game_fps) ? gpuB.game_fps[0] : (gpuB.game_fps || null);

  const content = isEn ? duel.content_en : duel.content_cs;

  // 🚀 GURU FAQ SCHEMA DATA
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${gpuA.name} better than ${gpuB.name}?` : `Je ${gpuA.name} lepší než ${gpuB.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": winner 
            ? (isEn ? `Yes, ${winner.name} is approximately ${perfDiff}% faster based on aggregated benchmarks.` : `Ano, ${winner.name} je přibližně o ${perfDiff} % rychlejší na základě agregovaných benchmarků.`)
            : (isEn ? "Both cards offer very similar performance." : "Obě karty nabízejí velmi vyrovnaný výkon.")
        }
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      
      {/* 🚀 GURU SEO: FAQ SCHEMA INJECTION */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs' : '/gpuvs'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO SELECTION' : 'ZPĚT NA VÝBĚR'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#9ca3af', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff0055' }}><Swords size={16} /> ELITNÍ SOUBOJ</span>
            <span className="opacity-30">|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formattedDate}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '950', color: '#fff', lineHeight: '1.1', margin: '0', textShadow: '0 0 30px rgba(0,0,0,0.8)' }}>{title}</h1>
        </header>

        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuA.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuA.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuA.vendor} • {gpuA.architecture}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{gpuA.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
            <div className="vs-badge-style">VS</div>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '11px', fontWeight: '950', color: getVendorColor(gpuB.vendor), textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '15px' }}>{gpuB.vendor} • {gpuB.architecture}</div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: 0, lineHeight: '1.1' }}>{gpuB.name.replace('GeForce ', '').replace('Radeon ', '')}</h2>
            </div>
        </div>

        {/* 🚀 GURU: VÝKONOVÝ ROZDÍL */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#66fcf1', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Zap size={36} /> {isEn ? 'RAW PERFORMANCE' : 'HRUBÝ VÝKON'}
          </h2>
          {hasPerfData && winner ? (
              <div className="perf-box-style" style={{ borderLeft: `6px solid ${getVendorColor(winner.vendor)}` }}>
                  <div className="perf-box-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                        <div style={{ color: getVendorColor(winner.vendor), fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}><Trophy size={18} /> {isEn ? 'PERFORMANCE WINNER' : 'VÍTĚZ HRUBÉHO VÝKONU'}</div>
                        <div style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '950', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', margin: 0 }}>{winner.name.replace('GeForce ', '').replace('Radeon ', '')}</div>
                        <p style={{ color: '#9ca3af', marginTop: '15px', fontSize: '15px' }}>{isEn ? `Advantage of ${perfDiff}% based on aggregate technical data.` : `Náskok o ${perfDiff} % na základě agregovaných technických dat.`}</p>
                    </div>
                    <div style={{ background: getVendorColor(winner.vendor), color: winner.vendor === 'NVIDIA' ? '#000' : '#fff', padding: '20px 30px', borderRadius: '20px', fontWeight: '950', fontSize: '36px' }}>+{perfDiff} %</div>
                  </div>
              </div>
          ) : <div className="no-data-box">{isEn ? "Detailed benchmark data unavailable." : "Detailní data benchmarků nedostupná."}</div>}
        </section>

        {/* 🚀 GURU: FPS DATA */}
        {fpsA && fpsB && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Gamepad2 size={36} /> {isEn ? 'GAMING FPS (1440p)' : 'HERNÍ VÝKON (1440p)'}
            </h2>
            <div className="table-wrapper">
               {[
                 { label: 'CYBERPUNK 2077', valA: fpsA.cyberpunk_1440p, valB: fpsB.cyberpunk_1440p },
                 { label: 'WARZONE', valA: fpsA.warzone_1440p, valB: fpsB.warzone_1440p },
                 { label: 'STARFIELD', valA: fpsA.starfield_1440p, valB: fpsB.starfield_1440p }
               ].map((row, i) => (
                 <div key={i} className="spec-row-style">
                   <div style={{ ...getWinnerStyle(row.valA, row.valB), flex: 1, textAlign: 'right', fontSize: '24px' }}>{row.valA} FPS</div>
                   <div className="table-label">{row.label}</div>
                   <div style={{ ...getWinnerStyle(row.valB, row.valA), flex: 1, textAlign: 'left', fontSize: '24px' }}>{row.valB} FPS</div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {/* 🚀 GURU: SEO CONTENT */}
        {content && (
          <section style={{ marginBottom: '60px' }}>
             <div className="content-box-style">
                 <div className="guru-prose-style" dangerouslySetInnerHTML={{ __html: content }} />
             </div>
          </section>
        )}

        {/* 🚀 GURU: SPECS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '20px' }}>{isEn ? 'TECHNICAL SPECS' : 'GURU SPECIFIKACE'}</h2>
          <div className="table-wrapper">
             {[
               { label: 'VRAM', valA: `${gpuA.vram_gb} GB`, valB: `${gpuB.vram_gb} GB`, winA: gpuA.vram_gb, winB: gpuB.vram_gb },
               { label: isEn ? 'BUS' : 'SBĚRNICE', valA: gpuA.memory_bus, valB: gpuB.memory_bus, winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: `${gpuA.boost_clock_mhz} MHz`, valB: `${gpuB.boost_clock_mhz} MHz`, winA: gpuA.boost_clock_mhz, winB: gpuB.boost_clock_mhz },
               { label: 'TDP', valA: `${gpuA.tdp_w} W`, valB: `${gpuB.tdp_w} W`, winA: gpuA.tdp_w, winB: gpuB.tdp_w, lower: true }
             ].map((row, i) => (
               <div key={i} className="spec-row-style">
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '22px' }}>{row.valA}</div>
                 <div className="table-label">{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '22px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>{isEn ? "Help us build this database by supporting us." : "Pomohl ti tento duel při výběru? Podpoř naši databázi."}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', width: '100%' }}>
            <a href="https://www.hrkgame.com/#a_aid=TheHardwareGuru" target="_blank" rel="nofollow sponsored" className="deals-btn-style"><Flame size={20} /> {isEn ? 'BEST GAME DEALS' : 'HRY ZA NEJLEPŠÍ CENY'}</a>
            <a href={isEn ? "/en/support" : "/support"} className="support-btn-style"><Heart size={20} /> {isEn ? 'SUPPORT GURU' : 'PODPOŘIT GURU'}</a>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #66fcf1; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(102, 252, 241, 0.3); transition: 0.3s; }
        .vs-badge-style { background: #ff0055; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 950; font-size: 24px; border: 5px solid #0f1115; box-shadow: 0 0 30px rgba(255,0,85,0.6); color: #fff; transform: rotate(-5deg); z-index: 10; margin: 0 -20px; }
        .perf-box-style { background: rgba(15, 17, 21, 0.95); border-radius: 24px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; overflow: hidden; }
        .no-data-box { padding: 30px; background: rgba(255,255,255,0.02); borderRadius: 20px; border: 1px dashed rgba(255,255,255,0.1); color: #9ca3af; font-style: italic; }
        .table-wrapper { background: rgba(15, 17, 21, 0.95); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .spec-row-style { display: flex; align-items: center; padding: 25px 30px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .table-label { width: 180px; text-align: center; font-size: 11px; font-weight: 950; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; }
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 50px; borderRadius: 30px; border: 1px solid rgba(168, 85, 247, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(10px); }
        .guru-prose-style { color: #d1d5db; font-size: 1.15rem; line-height: 1.8; }
        .guru-prose-style h2 { color: #fff; font-size: 2rem; font-weight: 950; margin-top: 1.5em; margin-bottom: 0.8em; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        .guru-prose-style p { margin-bottom: 1.5em; }
        .guru-prose-style strong { color: #fff; font-weight: 900; }
        .deals-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff; font-weight: 950; font-size: 15px; text-transform: uppercase; borderRadius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .support-btn-style { flex: 1 1 280px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000; font-weight: 950; font-size: 15px; text-transform: uppercase; borderRadius: 16px; text-decoration: none; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        @media (max-width: 768px) { .guru-grid-ring { grid-template-columns: 1fr !important; } .vs-badge-style { margin: 10px auto; rotate: 0deg; } .perf-box-content { flex-direction: column; align-items: flex-start; } .table-label { width: 100px; } }
      `}} />
    </div>
  );
}
