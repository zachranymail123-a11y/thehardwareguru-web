import React, { cache } from 'react';
import { 
  ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
  BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
  Monitor, ExternalLink, Info, HelpCircle
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - V3.0 (PROGRAMMATIC SEO & FAQ EDITION)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🚀 CÍL: Brutální SEO boost pro Bing a Google (Long-form texty a FAQ).
 * 🛡️ FIX 1: Dynamické generování SEO textů (Ray Tracing, Blender, Spotřeba).
 * 🛡️ FIX 2: Vloženo JSON-LD FAQ Schema pro Rich Snippets v Google/Bing.
 * 🛡️ FIX 3: Striktní 'await props.params' (Next.js 15).
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const baseUrl = "https://thehardwareguru.cz";

const slugify = (text) => text ? text.toLowerCase().replace(/graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim() : '';
const normalizeName = (name = '') => name.replace(/NVIDIA |AMD |GeForce |Radeon |Intel /gi, '');

// 🛡️ GURU ENGINE: 3-TIER SYSTEM PRO GPU
const findGpuBySlug = async (gpuSlug) => {
  if (!supabaseUrl || !gpuSlug) return null;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` };

  try {
      const res1 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=eq.${gpuSlug}&limit=1`, { headers, cache: 'force-cache' });
      if (res1.ok) { const data1 = await res1.json(); if (data1?.length) return data1[0]; }
      
      const res2 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&slug=ilike.*${gpuSlug}*&order=slug.asc`, { headers, cache: 'force-cache' });
      if (res2.ok) { const data2 = await res2.json(); if (data2?.length) return data2[0]; }

      const cleanString = gpuSlug.replace(/-/g, ' ').replace(/gb/gi, '').trim();
      const tokens = cleanString.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
          const conditions = tokens.map(t => `name.ilike.*${encodeURIComponent(t)}*`).join(',');
          const res3 = await fetch(`${supabaseUrl}/rest/v1/gpus?select=*,game_fps!gpu_id(*)&and=(${conditions})&order=name.asc`, { headers, cache: 'force-cache' });
          if (res3.ok) { const data3 = await res3.json(); return data3?.[0] || null; }
      }
  } catch(e) {}
  return null;
};

async function generateAndPersistDuel(rawSlug) {
  if (!supabaseUrl) return null;
  try {
    const cleanSlug = rawSlug.replace(/^en-/, '');
    const parts = cleanSlug.includes('-vs-') ? cleanSlug.split('-vs-') : cleanSlug.split('-to-');
    if (parts.length !== 2) return null;

    const [gpuA, gpuB] = await Promise.all([findGpuBySlug(parts[0]), findGpuBySlug(parts[1])]);
    if (!gpuA || !gpuB) return null;

    const payload = {
        slug: cleanSlug, slug_en: `en-${cleanSlug}`, gpu_a_id: gpuA.id, gpu_b_id: gpuB.id,
        title_cs: `Srovnání: ${gpuA.name} vs ${gpuB.name}`, title_en: `Comparison: ${gpuA.name} vs ${gpuB.name}`, 
        content_cs: '', content_en: '', seo_description_cs: `Která grafika je lepší? Srovnání herního výkonu, spotřeby a parametrů ${gpuA.name} vs ${gpuB.name}.`, seo_description_en: `Which GPU is better? Gaming performance, power draw and specs comparison of ${gpuA.name} vs ${gpuB.name}.`,
        created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/gpu_duels`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
    });

    const selectQuery = "*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))";
    const checkExisting = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${encodeURIComponent(cleanSlug)}`, { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }, cache: 'no-store' });
    const data = await checkExisting.json();
    return data[0] || null;
  } catch (err) { return null; }
}

const getDuelData = cache(async (rawSlug) => {
  if (!supabaseUrl || !rawSlug) return null;
  const cleanSlug = rawSlug.replace(/^en-/, '');
  const selectQuery = `*,gpuA:gpus!gpu_a_id(*,game_fps!gpu_id(*)),gpuB:gpus!gpu_b_id(*,game_fps!gpu_id(*))`;
  try {
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=${encodeURIComponent(selectQuery)}&slug=eq.${cleanSlug}&limit=1`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }, cache: 'force-cache' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.length === 0) return await generateAndPersistDuel(rawSlug);
      return data[0];
  } catch (e) { return null; }
});

export async function generateMetadata(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const duel = await getDuelData(rawSlug);
  if (!duel) return { title: '404 | Hardware Guru' };

  const { gpuA, gpuB } = duel;
  
  return { 
    title: isEn ? `${gpuA.name} vs ${gpuB.name} – Gaming Performance & Specs` : `Srovnání: ${gpuA.name} vs ${gpuB.name} – Výkon a Parametry`,
    description: isEn 
        ? `Detailed comparison of ${gpuA.name} vs ${gpuB.name}. See 1440p gaming benchmarks, power consumption, ray tracing performance, and VRAM differences.`
        : `Detailní srovnání ${gpuA.name} vs ${gpuB.name}. Zjistěte rozdíly v herním výkonu, spotřebě, ray tracingu a podívejte se na reálné benchmarky.`,
    alternates: {
        canonical: `${baseUrl}/gpuvs/${duel.slug}`,
        languages: { 'en': `${baseUrl}/en/gpuvs/${duel.slug}`, 'cs': `${baseUrl}/gpuvs/${duel.slug}`, 'x-default': `${baseUrl}/gpuvs/${duel.slug}` }
    }
  };
}

export default async function GpuVsDetailPage(props) {
  const params = await props.params;
  const rawSlug = params?.slug || params?.gpu || '';
  const isEn = rawSlug.startsWith('en-');
  const duel = await getDuelData(rawSlug);
  
  if (!duel) return <div style={{ color: '#f00', padding: '100px', textAlign: 'center', backgroundColor: '#0a0b0d', minHeight: '100vh' }}>DUEL NENALEZEN</div>;

  const { gpuA, gpuB } = duel;

  const perfA = gpuA.performance_index || 1;
  const perfB = gpuB.performance_index || 1;
  const winner = perfA > perfB ? gpuA : gpuB;
  const loser = perfA > perfB ? gpuB : gpuA;
  const finalPerfDiff = Math.round((Math.max(perfA, perfB) / Math.min(perfA, perfB) - 1) * 100);

  const getVendorColor = (vendor) => {
    const v = (vendor || '').toUpperCase();
    return v === 'NVIDIA' ? '#76b900' : (v === 'AMD' ? '#ed1c24' : '#66fcf1');
  };

  const getWinnerStyle = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return {};
    if (valA === valB) return { color: '#9ca3af', fontWeight: 'bold' };
    const aWins = lowerIsBetter ? valA < valB : valA > valB;
    return aWins ? { color: '#ff0055', fontWeight: '950' } : { color: '#4b5563', opacity: 0.6 }; 
  };

  const fpsA = Array.isArray(gpuA?.game_fps) ? gpuA.game_fps[0] : (gpuA?.game_fps || {});
  const fpsB = Array.isArray(gpuB?.game_fps) ? gpuB.game_fps[0] : (gpuB?.game_fps || {});

  const calcSafeDiff = (oldF, newF) => (!oldF || !newF || oldF === 0) ? 0 : Math.round(((newF / oldF) - 1) * 100);
  
  // 🚀 GURU: DYNAMICKÁ LOGIKA PRO SEO TEXTY
  const getRtWinner = () => {
    if (gpuA.vendor === 'NVIDIA' && gpuB.vendor === 'AMD') return gpuA;
    if (gpuB.vendor === 'NVIDIA' && gpuA.vendor === 'AMD') return gpuB;
    return winner; // Pokud jsou oba stejný vendor, vyhrává ten silnější
  };
  const rtWinner = getRtWinner();

  const getProdWinner = () => {
    const vA = gpuA.vram_gb || 0;
    const vB = gpuB.vram_gb || 0;
    if (vA > vB) return gpuA;
    if (vB > vA) return gpuB;
    return winner; // Pokud mají stejnou VRAM, vyhrává výkon
  };
  const prodWinner = getProdWinner();

  const getEffWinner = () => {
    const pA = gpuA.tdp_w || 999;
    const pB = gpuB.tdp_w || 999;
    return pA < pB ? gpuA : gpuB;
  };
  const effWinner = getEffWinner();

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (FAQ Schema)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Is ${gpuA.name} better than ${gpuB.name} for 1440p gaming?` : `Je ${gpuA.name} lepší než ${gpuB.name} pro 1440p hraní?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `The ${winner.name} is generally better, offering around ${finalPerfDiff}% more raw performance.` : `Ano, ${winner.name} je obecně lepší a nabízí přibližně o ${finalPerfDiff} % vyšší hrubý výkon.` }
      },
      {
        "@type": "Question",
        "name": isEn ? `Which GPU has better Ray Tracing: ${gpuA.name} or ${gpuB.name}?` : `Která grafika má lepší Ray Tracing: ${gpuA.name} nebo ${gpuB.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `The ${rtWinner.name} provides superior Ray Tracing capabilities.` : `Model ${rtWinner.name} poskytuje výrazně lepší výkon se zapnutým Ray Tracingem.` }
      },
      {
        "@type": "Question",
        "name": isEn ? `Power consumption: ${gpuA.name} vs ${gpuB.name}?` : `Jaká je spotřeba karet ${gpuA.name} a ${gpuB.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `The ${gpuA.name} draws ${gpuA.tdp_w}W, while the ${gpuB.name} consumes ${gpuB.tdp_w}W. The ${effWinner.name} is more power efficient.` : `Karta ${gpuA.name} spotřebuje ${gpuA.tdp_w}W, zatímco ${gpuB.name} si vezme ${gpuB.tdp_w}W.` }
      }
    ]
  };

  const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0b0d', backgroundImage: 'url("/bg-guru.png")', backgroundSize: 'cover', backgroundAttachment: 'fixed', paddingTop: '120px', paddingBottom: '100px', color: '#fff', fontFamily: 'sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(faqSchema) }} />
      
      <main style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <a href={isEn ? '/en/gpuvs/ranking' : '/gpuvs/ranking'} className="guru-back-btn">
            <ChevronLeft size={16} /> {isEn ? 'BACK TO TIER LIST' : 'ZPĚT NA ŽEBŘÍČEK'}
          </a>
        </div>

        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', padding: '6px 16px', border: '1px solid rgba(255, 0, 85, 0.3)', borderRadius: '50px', background: 'rgba(255, 0, 85, 0.1)' }}>
            <Swords size={14} /> GURU VS ENGINE
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '0', lineHeight: '1.1' }}>
            {normalizeName(gpuA.name)} <br/>
            <span style={{ color: '#ff0055' }}>VS</span> {normalizeName(gpuB.name)}
          </h1>
          <div className="guru-verdict" style={{ borderColor: '#ff0055', color: '#ff0055', background: 'rgba(255, 0, 85, 0.05)', display: 'inline-block', marginTop: '20px', padding: '10px 25px', borderRadius: '50px', fontWeight: '950', border: '1px solid #ff005540', textTransform: 'uppercase' }}>
              {isEn ? 'PERFORMANCE WINNER:' : 'VÍTĚZ VÝKONU:'} <strong>{normalizeName(winner.name)}</strong> (+{finalPerfDiff}%)
          </div>
        </header>

        {/* 🚀 UPGRADE RING */}
        <div className="guru-grid-ring" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', marginBottom: '60px' }}>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuA.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <span style={{ color: getVendorColor(gpuA.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px' }}>{gpuA.vendor} GPU</span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '15px 0 0 0', lineHeight: '1.1' }}>{normalizeName(gpuA.name)}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#0a0b0d', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0055', border: '2px solid #ff0055', fontWeight: '950', fontSize: '24px', boxShadow: '0 0 30px rgba(255, 0, 85, 0.3)' }}>VS</div>
            </div>
            <div style={{ background: 'rgba(15, 17, 21, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderTop: `5px solid ${getVendorColor(gpuB.vendor)}`, borderRadius: '24px', padding: '40px 20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <span style={{ color: getVendorColor(gpuB.vendor), fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '3px' }}>{gpuB.vendor} GPU</span>
                <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '950', color: '#fff', textTransform: 'uppercase', margin: '15px 0 0 0', lineHeight: '1.1' }}>{normalizeName(gpuB.name)}</h2>
            </div>
        </div>

        {/* 🚀 PROGRAMMATIC SEO TEXTY (BING & GOOGLE BOOST) */}
        <section style={{ marginBottom: '60px' }}>
          <div className="content-box-style">
            <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: '950', textTransform: 'uppercase', borderLeft: '4px solid #ff0055', paddingLeft: '15px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Info size={28} color="#ff0055" /> {isEn ? 'Detailed Hardware Analysis' : 'Detailní Hardwarová Analýza'}
            </h2>
            
            <div className="guru-prose">
              <h3>{isEn ? 'Gaming Performance & Resolution' : 'Herní Výkon a Rozlišení'}</h3>
              <p>
                {isEn 
                  ? `When comparing raw gaming performance, the ${winner.name} takes the lead by approximately ${finalPerfDiff}%. For gamers targeting 1440p or 4K resolutions, this translates to a noticeably smoother experience and more stable frame rates in modern titles compared to the ${loser.name}.`
                  : `Při srovnání hrubého herního výkonu vede karta ${winner.name} o přibližně ${finalPerfDiff} %. Pro hráče, kteří cílí na rozlišení 1440p nebo 4K, to znamená znatelně plynulejší zážitek a stabilnější snímkovou frekvenci (FPS) v moderních titulech ve srovnání s ${loser.name}.`}
              </p>

              <h3>{isEn ? 'Ray Tracing & Upscaling' : 'Ray Tracing a Upscaling'}</h3>
              <p>
                {isEn
                  ? `Ray tracing has become a standard in modern AAA games. In this matchup, the ${rtWinner.name} is the superior choice if you plan to use heavy ray tracing effects in games like Cyberpunk 2077 or Alan Wake 2, due to its specialized architectural cores.`
                  : `Ray tracing se stal standardem v moderních AAA hrách. V tomto souboji je ${rtWinner.name} lepší volbou, pokud plánujete využívat náročné ray tracing efekty ve hrách jako Cyberpunk 2077 nebo Alan Wake 2, a to díky její pokročilé architektuře jader.`}
              </p>

              <h3>{isEn ? 'VRAM & Productivity (Blender, Unreal Engine)' : 'VRAM a Pracovní nasazení (Blender, UE5)'}</h3>
              <p>
                {isEn
                  ? `For 3D rendering, video editing, or game development in Unreal Engine, VRAM capacity is crucial. The ${prodWinner.name} equipped with ${prodWinner.vram_gb}GB of VRAM offers a stronger foundation for content creators who need to handle massive textures and complex 3D scenes.`
                  : `Pro 3D renderování v Blenderu, střih videa nebo vývoj her v Unreal Engine 5 je kapacita VRAM naprosto klíčová. Model ${prodWinner.name} vybavený ${prodWinner.vram_gb} GB VRAM nabízí silnější základ pro tvůrce obsahu, kteří pracují s masivními texturami a složitými 3D scénami.`}
              </p>

              <h3>{isEn ? 'Power Consumption (TDP)' : 'Spotřeba energie (TDP) a Zdroj'}</h3>
              <p>
                {isEn
                  ? `Looking at power efficiency, the ${gpuA.name} is rated at ${gpuA.tdp_w || 'N/A'}W TDP, while the ${gpuB.name} consumes around ${gpuB.tdp_w || 'N/A'}W. The ${effWinner.name} is the more power-efficient card, meaning it generates less heat and is less demanding on your power supply unit (PSU).`
                  : `Z hlediska energetické efektivity má ${gpuA.name} stanovené TDP na ${gpuA.tdp_w || 'N/A'} W, zatímco ${gpuB.name} spotřebuje přibližně ${gpuB.tdp_w || 'N/A'} W. Karta ${effWinner.name} je efektivnější, což znamená, že generuje méně odpadního tepla a klade nižší nároky na váš počítačový zdroj (PSU).`}
              </p>
            </div>
          </div>
        </section>

        {/* 🚀 TABULKA PARAMETRŮ */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutList size={28} color="#ff0055" /> {isEn ? 'HARDWARE SPECIFICATIONS' : 'POROVNÁNÍ PARAMETRŮ'}
          </h2>
          <div style={{ background: 'rgba(15, 17, 21, 0.95)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
             <div style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', background: 'rgba(0,0,0,0.5)', color: '#9ca3af', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>
                 <div style={{ flex: 1, textAlign: 'right' }}>{normalizeName(gpuA.name)}</div>
                 <div style={{ width: '180px', textAlign: 'center' }}></div>
                 <div style={{ flex: 1, textAlign: 'left', color: '#ff0055' }}>{normalizeName(gpuB.name)}</div>
             </div>
             {[
               { label: 'VRAM CAPACITY', valA: gpuA?.vram_gb ? `${gpuA.vram_gb} GB` : '-', valB: gpuB?.vram_gb ? `${gpuB.vram_gb} GB` : '-', winA: gpuA?.vram_gb, winB: gpuB?.vram_gb },
               { label: isEn ? 'MEMORY BUS' : 'PAMĚŤOVÁ SBĚRNICE', valA: gpuA?.memory_bus ?? '-', valB: gpuB?.memory_bus ?? '-', winA: 0, winB: 0 },
               { label: 'BOOST CLOCK', valA: gpuA?.boost_clock_mhz ? `${gpuA.boost_clock_mhz} MHz` : '-', valB: gpuB?.boost_clock_mhz ? `${gpuB.boost_clock_mhz} MHz` : '-', winA: gpuA?.boost_clock_mhz, winB: gpuB?.boost_clock_mhz },
               { label: 'TDP (POWER)', valA: gpuA?.tdp_w ? `${gpuA.tdp_w} W` : '-', valB: gpuB?.tdp_w ? `${gpuB.tdp_w} W` : '-', winA: gpuA?.tdp_w ?? 999, winB: gpuB?.tdp_w ?? 999, lower: true },
               { label: isEn ? 'ARCHITECTURE' : 'ARCHITEKTURA', valA: gpuA?.architecture ?? '-', valB: gpuB?.architecture ?? '-', winA: 0, winB: 0 },
               { label: isEn ? 'RELEASE YEAR' : 'ROK VYDÁNÍ', valA: gpuA?.release_date ? new Date(gpuA.release_date).getFullYear() : '-', valB: gpuB?.release_date ? new Date(gpuB.release_date).getFullYear() : '-', winA: 0, winB: 0 }
             ].map((row, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                 <div style={{ ...getWinnerStyle(row.winA, row.winB, row.lower), flex: 1, textAlign: 'right', fontSize: '16px' }}>{row.valA}</div>
                 <div style={{ width: '180px', textAlign: 'center', fontSize: '10px', fontWeight: '950', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '2px' }}>{row.label}</div>
                 <div style={{ ...getWinnerStyle(row.winB, row.winA, row.lower), flex: 1, textAlign: 'left', fontSize: '18px' }}>{row.valB}</div>
               </div>
             ))}
          </div>
        </section>

        {/* 🚀 FAQ SEKCE PRO GOOGLE SNIPPETS */}
        <section style={{ marginBottom: '60px' }}>
          <h2 className="section-h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HelpCircle size={28} color="#ff0055" /> {isEn ? 'FREQUENTLY ASKED QUESTIONS' : 'ČASTÉ DOTAZY (FAQ)'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {faqSchema.mainEntity.map((faq, index) => (
                <div key={index} className="faq-card">
                    <h3 className="faq-q">{faq.name}</h3>
                    <p className="faq-a">{faq.acceptedAnswer.text}</p>
                </div>
            ))}
          </div>
        </section>

        {/* 🚀 GLOBÁLNÍ CTA TLAČÍTKA (Affiliate & Podpora) */}
        <div style={{ marginTop: '80px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px' }}>
          <h4 style={{ color: '#9ca3af', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, textAlign: 'center' }}>
            {isEn ? "Help us build this database by supporting us." : "Pomohl ti tento rozbor při výběru? Podpoř naši databázi."}
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

      <style dangerouslySetInnerHTML={{__html: `
        .guru-back-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.6); color: #ff0055; padding: 12px 20px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; border: 1px solid rgba(255, 0, 85, 0.3); transition: 0.3s; }
        .guru-back-btn:hover { background: rgba(255, 0, 85, 0.1); transform: translateX(-5px); }
        .section-h2 { color: #fff; font-size: 1.8rem; font-weight: 950; margin-bottom: 30px; text-transform: uppercase; border-left: 4px solid #ff0055; padding-left: 15px; }
        
        .content-box-style { background: rgba(15, 17, 21, 0.95); padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); }
        .guru-prose { color: #d1d5db; font-size: 1.1rem; line-height: 1.8; }
        .guru-prose h3 { color: #fff; font-size: 1.4rem; font-weight: 950; margin: 1.5em 0 0.8em; text-transform: uppercase; border-left: 3px solid #ff0055; padding-left: 12px; }
        
        .faq-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 25px; transition: 0.3s; }
        .faq-card:hover { border-color: rgba(255, 0, 85, 0.3); background: rgba(255,255,255,0.04); }
        .faq-q { font-size: 1.15rem; font-weight: 950; color: #ff0055; margin: 0 0 10px 0; line-height: 1.4; }
        .faq-a { color: #9ca3af; line-height: 1.6; margin: 0; }

        .guru-support-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: #eab308; color: #000 !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(234, 179, 8, 0.2); }
        .guru-support-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(234, 179, 8, 0.4); }

        .guru-deals-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 18px 30px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #fff !important; font-weight: 950; font-size: 15px; text-transform: uppercase; border-radius: 16px; text-decoration: none !important; transition: 0.3s; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3); border: 1px solid rgba(255,255,255,0.1); }
        .guru-deals-btn:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(249, 115, 22, 0.5); filter: brightness(1.1); }

        @media (max-width: 768px) {
            .guru-grid-ring { grid-template-columns: 1fr !important; gap: 15px !important; }
            .guru-deals-btn, .guru-support-btn { width: 100%; font-size: 15px; padding: 18px 30px; }
            .content-box-style { padding: 25px; }
        }
      `}} />
    </div>
  );
}
