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
          <div style={{ display: 'inline-flex', alignItems: 'center',
