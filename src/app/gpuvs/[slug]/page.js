import React, { cache } from 'react';
import { 
  ChevronLeft, Zap, ArrowRight, Activity, ArrowUpCircle, LayoutList, 
  BarChart3, Gamepad2, Coins, CheckCircle2, Swords, Flame, Heart, 
  Monitor, ExternalLink, Info, HelpCircle
} from 'lucide-react';

/**
 * GURU GPU DUELS ENGINE - V4.0 (DEEP CONTENT SEO EDITION)
 * Cesta: src/app/gpuvs/[slug]/page.js
 * 🚀 CÍL: Fix pro Bing "Thin Content" - Masivní nárůst textového obsahu (Long-form SEO).
 * 🛡️ FIX 1: Dynamické generování sekcí Architektura, DLSS vs FSR, Kompletní doporučení.
 * 🛡️ FIX 2: Rozšířeno JSON-LD FAQ Schema pro Rich Snippets v Google/Bing.
 * 🛡️ FIX 3: Striktní 'await props.params' (Next.js 15 safe).
 */

export const runtime = "nodejs";
export const revalidate = 3600; 

// 🚀 GURU FIX: Zapnutí částečného Statického Generování (SSG)
// Vercel díky tomuto vygeneruje čisté, bleskové HTML pro 100 nejpopulárnějších duelů rovnou při buildu.
// Ostatní duely se vygenerují dynamicky při prvním přístupu a pak zůstanou staticky uložené (ISR).
export const dynamicParams = true;

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl) return [];

  try {
      // Vytáhneme 100 existujících duelů z DB pro statický build
      const res = await fetch(`${supabaseUrl}/rest/v1/gpu_duels?select=slug&limit=100`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
          next: { revalidate: 86400 }
      });
      
      if (!res.ok) return [];
      const duels = await res.json();
      
      // Vrátíme pole objektů se slugy pro pre-render
      return duels.map((duel) => ({
          slug: duel.slug,
      }));
  } catch (e) {
      return [];
  }
}

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
        content_cs: '', content_en: '', seo_description_cs: `Která grafika je lepší? Detailní srovnání herního výkonu, architektury, DLSS/FSR a parametrů ${gpuA.name} vs ${gpuB.name}.`, seo_description_en: `Which GPU is better? Detailed gaming performance, architecture, DLSS/FSR and specs comparison of ${gpuA.name} vs ${gpuB.name}.`,
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
    title: isEn ? `${gpuA.name} vs ${gpuB.name} – Gaming Benchmarks & Review` : `Srovnání: ${gpuA.name} vs ${gpuB.name} – Výkon, Testy a Parametry`,
    description: isEn 
        ? `Detailed comparison of ${gpuA.name} vs ${gpuB.name}. Deep dive into 1440p gaming benchmarks, DLSS vs FSR analysis, ray tracing performance, architecture and VRAM.`
        : `Detailní srovnání ${gpuA.name} vs ${gpuB.name}. Hluboká analýza herního výkonu, DLSS vs FSR, ray tracingu, architektury a spotřeby energie.`,
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
  
  // 🚀 GURU: DYNAMICKÁ LOGIKA PRO LONG-FORM SEO TEXTY
  const getRtWinner = () => {
    if (gpuA.vendor === 'NVIDIA' && gpuB.vendor === 'AMD') return gpuA;
    if (gpuB.vendor === 'NVIDIA' && gpuA.vendor === 'AMD') return gpuB;
    return winner; 
  };
  const rtWinner = getRtWinner();

  const getProdWinner = () => {
    const vA = gpuA.vram_gb || 0;
    const vB = gpuB.vram_gb || 0;
    if (vA > vB) return gpuA;
    if (vB > vA) return gpuB;
    return winner; 
  };
  const prodWinner = getProdWinner();

  const getEffWinner = () => {
    const pA = gpuA.tdp_w || 999;
    const pB = gpuB.tdp_w || 999;
    return pA < pB ? gpuA : gpuB;
  };
  const effWinner = getEffWinner();

  const getUpscaling = (vendor) => {
      const v = (vendor || '').toUpperCase();
      if (v === 'NVIDIA') return { short: 'DLSS', long: 'Deep Learning Super Sampling (DLSS)' };
      if (v === 'AMD') return { short: 'FSR', long: 'FidelityFX Super Resolution (FSR)' };
      return { short: 'XeSS', long: 'Xe Super Sampling' };
  };
  const upA = getUpscaling(gpuA.vendor);
  const upB = getUpscaling(gpuB.vendor);

  // 🚀 ZLATÁ GSC SEO SCHÉMATA (Rozšířené FAQ Schema pro Bing boty)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isEn ? `Which is better for gaming: ${gpuA.name} or ${gpuB.name}?` : `Která grafika je lepší na hry: ${gpuA.name} nebo ${gpuB.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `Based on raw benchmark data, the ${winner.name} is the superior choice, delivering approximately ${finalPerfDiff}% more performance in modern gaming titles compared to the ${loser.name}.` : `Na základě reálných dat z benchmarků je jasným vítězem ${winner.name}. V moderních herních titulech poskytuje přibližně o ${finalPerfDiff} % vyšší hrubý výkon než ${loser.name}.` }
      },
      {
        "@type": "Question",
        "name": isEn ? `Which GPU has better Ray Tracing performance?` : `Která z těchto karet zvládá lépe Ray Tracing?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `The ${rtWinner.name} features more advanced RT cores, providing significantly better frame rates and smoother gameplay when ray tracing effects are enabled.` : `Model ${rtWinner.name} je vybaven pokročilejšími RT jádry, což znamená výrazně stabilnější snímkovou frekvenci a plynulejší hratelnost při zapnutých efektech ray tracingu.` }
      },
      {
        "@type": "Question",
        "name": isEn ? `Power consumption comparison: ${gpuA.name} vs ${gpuB.name}` : `Porovnání spotřeby: Jaký je rozdíl v TDP mezi ${gpuA.name} a ${gpuB.name}?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `The ${gpuA.name} has a rated TDP of ${gpuA.tdp_w}W, whereas the ${gpuB.name} sits at ${gpuB.tdp_w}W. This makes the ${effWinner.name} more power-efficient, requiring a less expensive power supply.` : `Karta ${gpuA.name} má stanovené maximální TDP na ${gpuA.tdp_w}W, zatímco ${gpuB.name} si žádá ${gpuB.tdp_w}W. Karta ${effWinner.name} je tedy energeticky úspornější a méně náročná na počítačový zdroj.` }
      },
      {
        "@type": "Question",
        "name": isEn ? `Which GPU is better for Blender and Unreal Engine 5?` : `Která grafická karta je vhodnější pro Blender a Unreal Engine 5?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `For productivity tasks like 3D rendering and game development, the ${prodWinner.name} is highly recommended due to its ${prodWinner.vram_gb}GB of VRAM and robust architecture.` : `Pro náročné pracovní úkoly jako 3D renderování nebo vývoj her je doporučována karta ${prodWinner.name}, a to díky její kapacitě ${prodWinner.vram_gb} GB VRAM a optimalizované architektuře.` }
      },
      {
        "@type": "Question",
        "name": isEn ? `Does ${gpuA.name} or ${gpuB.name} support better upscaling?` : `Mají tyto karty podporu pro DLSS nebo FSR?`,
        "acceptedAnswer": { "@type": "Answer", "text": isEn ? `The ${gpuA.name} utilizes ${upA.short}, while the ${gpuB.name} is built around ${upB.short} technology.` : `Grafika ${gpuA.name} využívá technologii ${upA.short}, zatímco ${gpuB.name} se spoléhá na ekosystém ${upB.short}.` }
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

        {/* 🚀 DEEP LONG-FORM CONTENT (BING & GOOGLE SEO BOOST) */}
        <section style={{ marginBottom: '60px' }}>
          <div className="content-box-style">
            <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: '950', textTransform: 'uppercase', borderLeft: '4px solid #ff0055', paddingLeft: '15px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Info size={28} color="#ff0055" /> {isEn ? 'In-Depth Hardware Analysis' : 'Hluboká Hardwarová Analýza'}
            </h2>
            
            <div className="guru-prose">
              <h3>{isEn ? 'Gaming Benchmark Analysis' : 'Analýza herních benchmarků'}</h3>
              <p>
                {isEn 
                  ? `When pitting the ${normalizeName(gpuA.name)} against the ${normalizeName(gpuB.name)} in a direct benchmark battle, the numbers reveal a clear hierarchy. The ${winner.name} pulls ahead with an impressive ${finalPerfDiff}% advantage in raw rasterization performance. For gamers pushing high refresh rates at 1440p or stepping into the demanding world of 4K gaming, this performance gap means the difference between occasional stuttering and a buttery-smooth experience. While the ${loser.name} holds its ground in optimized titles, the sheer computational power of the winner makes it much more future-proof for upcoming Unreal Engine 5 releases.`
                  : `Při přímém srovnání modelů ${normalizeName(gpuA.name)} a ${normalizeName(gpuB.name)} v herních benchmarcích nám čísla ukazují jasnou hierarchii. Karta ${winner.name} dominuje s výrazným náskokem ${finalPerfDiff} % v hrubém rasterizačním výkonu. Pro náročné hráče, kteří cílí na vysoké FPS v rozlišení 1440p nebo se chtějí vrhnout do světa 4K hraní, znamená tento rozdíl hranici mezi občasnými záseky obrazu a naprosto plynulým herním zážitkem. Přestože si ${loser.name} v dobře optimalizovaných titulech drží své pozice, výpočetní síla vítěze z něj dělá mnohem spolehlivější investici s ohledem na přicházející hry běžící na Unreal Enginu 5.`}
              </p>

              <h3>{isEn ? 'GPU Architecture Explained' : 'Architektura grafického čipu'}</h3>
              <p>
                {isEn
                  ? `Under the hood, these cards represent significantly different engineering approaches. The ${gpuA.name} is powered by the ${gpuA.architecture || 'advanced'} architecture, bringing refined multiprocessors and enhanced cache memory to the table. On the opposing side, the ${gpuB.name} utilizes the ${gpuB.architecture || 'modern'} architecture design. This architectural clash dictates not only how fast frames are rendered but also how effectively the GPU handles complex compute tasks like physics simulations and geometry processing.`
                  : `Když se podíváme pod pomyslnou kapotu, tyto grafiky reprezentují odlišný inženýrský přístup. Model ${gpuA.name} je postaven na architektuře ${gpuA.architecture || 'pokročilé generace'}, která přináší vylepšené multiprocesory a optimalizovanou vyrovnávací paměť (Cache). Na opačné straně ringu stojí ${gpuB.name} těžící z architektury ${gpuB.architecture || 'moderní koncepce'}. Tento architektonický střet neurčuje jen to, jak rychle se snímky vykreslí, ale také s jakou efektivitou zvládá čip fyzikální simulace nebo komplexní výpočty geometrie ve hře.`}
              </p>

              <h3>{isEn ? 'Upscaling Technologies: DLSS vs FSR' : 'Technologie Upscalingu: DLSS vs FSR'}</h3>
              <p>
                {isEn
                  ? `Raw horsepower isn't everything anymore; AI upscaling is a major deciding factor. The ${gpuA.name} takes advantage of ${upA.long}, while the ${gpuB.name} utilizes ${upB.long}. For heavy titles like Cyberpunk 2077, utilizing these technologies allows you to push graphical settings to the absolute limit without sacrificing frame rates. Furthermore, if you plan on enabling Ray Tracing, the ${rtWinner.name} is structurally better equipped to handle the massive performance penalty associated with tracing light rays in real-time.`
                  : `Hrubý výkon už dnes není všechno; chytrý AI upscaling se stal hlavním rozhodovacím faktorem. Karta ${gpuA.name} plně využívá potenciál technologie ${upA.long}, zatímco ${gpuB.name} nabízí podporu pro ${upB.long}. V extrémně náročných hrách typu Cyberpunk 2077 vám aktivace těchto technologií umožní posunout grafické nastavení na absolutní maximum, aniž byste obětovali plynulost (FPS). Pokud navíc plánujete hrát se zapnutým Ray Tracingem, model ${rtWinner.name} je hardwarově lépe přizpůsoben k tomu, aby zvládl obrovskou výpočetní zátěž, kterou s sebou realistické nasvícení přináší.`}
              </p>

              <h3>{isEn ? 'VRAM and Content Creation (Blender, UE5)' : 'Kapacita VRAM a Práce (Blender, UE5)'}</h3>
              <p>
                {isEn
                  ? `For content creators, video editors, and 3D artists, Video RAM is often more important than the GPU core itself. With ${gpuA.vram_gb || 'N/A'}GB on the ${gpuA.name} and ${gpuB.vram_gb || 'N/A'}GB on the ${gpuB.name}, the ${prodWinner.name} emerges as the superior workstation card. Extra VRAM ensures that massive 4K video timelines or complex Blender scenes won't crash your system by running out of memory.`
                  : `Pro tvůrce obsahu, střihače videa a 3D grafiky je kapacita grafické paměti (VRAM) často důležitější než samotný grafický čip. S pamětí ${gpuA.vram_gb || 'N/A'} GB u karty ${gpuA.name} a ${gpuB.vram_gb || 'N/A'} GB u modelu ${gpuB.name} se jako podstatně lepší volba pro pracovní stanici profiluje ${prodWinner.name}. Kapacita paměti navíc je zárukou, že obrovské projekty ve 4K rozlišení nebo složité scény v Blenderu nezpůsobí pád celého systému kvůli nedostatku paměti.`}
              </p>

              <h3>{isEn ? 'Final Verdict and Power Efficiency' : 'Závěrečné doporučení a spotřeba (TDP)'}</h3>
              <p>
                {isEn
                  ? `To summarize, the ${winner.name} wins this duel regarding gaming performance. However, power efficiency shouldn't be ignored. The ${gpuA.name} consumes up to ${gpuA.tdp_w || 'N/A'}W (TDP), while the ${gpuB.name} tops out around ${gpuB.tdp_w || 'N/A'}W. The ${effWinner.name} runs more efficiently, translating to lower temperatures, quieter cooling fans, and less strain on your power supply.`
                  : `Závěrem lze konstatovat, že z pohledu herního výkonu tento duel jednoznačně vyhrává ${winner.name}. Nelze však ignorovat ani efektivitu spotřeby. Grafika ${gpuA.name} si z vašeho zdroje vezme až ${gpuA.tdp_w || 'N/A'} W (TDP), zatímco u karty ${gpuB.name} je toto maximum nastaveno na ${gpuB.tdp_w || 'N/A'} W. Karta ${effWinner.name} proto funguje mnohem efektivněji, což v praxi znamená nižší teploty v case, tišší chod ventilátorů a menší zátěž na váš napájecí zdroj.`}
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
