import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600; // GURU FIX: Sitemapa se přegeneruje 1x za hodinu (ChatGPT doporučení)

/**
 * GURU SEO ENGINE - SITEMAP GENERATOR V2.6
 * Cesta: src/app/sitemap.js
 * Dynamicky generuje mapu webu pro Google.
 * Zahrnuje: Články, Tipy, Tweaky, Rady, Slovník, Slevy, 🚀 GPU & CPU DUELY, FPS, UPGRADY, PERFORMANCE & RECOMMEND.
 * 🛡️ FIX 1: Odstraněn chybný /cs prefix u českých URL.
 * 🛡️ FIX 2: Zvýšen rozsah pro upgrady na 20 000 záznamů.
 * 🛡️ FIX 3: Přidána ranking sekce do sitemapy.
 */
export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://www.thehardwareguru.cz';
  const currentDate = new Date().toISOString();

  // 1. STATICKÉ SEKCE (CZ + EN)
  const staticPaths = [
    { url: '', priority: 1.0 },
    { url: '/clanky', priority: 0.9 },
    { url: '/tipy', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/rady', priority: 0.8 },
    { url: '/slovnik', priority: 0.7 },
    { url: '/deals', priority: 0.9 },
    { url: '/gpuvs', priority: 0.9 },
    { url: '/gpuvs/ranking', priority: 0.9 }, // 🚀 GURU: SEO hub hub page doplněn
    { url: '/cpuvs', priority: 0.9 },
    { url: '/support', priority: 0.5 },
    { url: '/sin-slavy', priority: 0.6 },
  ];

  const staticRoutes = [];
  staticPaths.forEach((route) => {
    // CZ verze (bez /cs prefixu dle ChatGPT fixu)
    staticRoutes.push({
      url: `${baseUrl}${route.url}`,
      lastModified: currentDate,
      priority: route.priority,
    });
    // EN verze
    staticRoutes.push({
      url: `${baseUrl}/en${route.url}`,
      lastModified: currentDate,
      priority: Math.max(0.1, route.priority - 0.1),
    });
  });

  // 2. DYNAMICKÉ ROUTY (GURU DATA ENGINE)
  const dynamicRoutes = [];

  try {
    // 🚀 GURU FETCH: Agregace všech tabulek
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes, duelsRes, cpuDuelsRes, gpusRes, upgradesRes] = await Promise.all([
      supabase.from('posts').select('slug, slug_en, created_at, type'),
      supabase.from('tipy').select('slug, slug_en, created_at'),
      supabase.from('tweaky').select('slug, slug_en, created_at'),
      supabase.from('rady').select('slug, slug_en, created_at'),
      supabase.from('slovnik').select('slug, slug_en, created_at'),
      supabase.from('gpu_duels').select('slug, slug_en, created_at'),
      supabase.from('cpu_duels').select('slug, slug_en, created_at'),
      supabase.from('gpus').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en, created_at').range(0, 20000) // 🚀 GURU FIX: Zvýšený limit pro SEO upgrady
    ]);

    // Helper pro dynamické varianty (bez /cs prefixu)
    const addToRoutes = (item, basePath, priority) => {
      if (item.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}${basePath}/${item.slug}`,
          lastModified: item.created_at || currentDate,
          priority: priority,
        });
      }
      if (item.slug_en || ((basePath === '/gpuvs' || basePath === '/cpuvs') && item.slug)) {
        const enSlug = item.slug_en || ((basePath === '/gpuvs' || basePath === '/cpuvs') ? `en-${item.slug}` : item.slug);
        dynamicRoutes.push({
          url: `${baseUrl}/en${basePath}/${enSlug}`,
          lastModified: item.created_at || currentDate,
          priority: Math.max(0.1, priority - 0.1),
        });
      }
    };

    // Zpracování dat z tabulek
    if (postsRes.data) {
      postsRes.data.forEach(item => {
        const isExpected = item.type === 'expected';
        const path = isExpected ? '/ocekavane-hry' : '/clanky';
        addToRoutes(item, path, isExpected ? 0.9 : 0.8);
      });
    }
    if (tipyRes.data) tipyRes.data.forEach(item => addToRoutes(item, '/tipy', 0.8));
    if (tweakyRes.data) tweakyRes.data.forEach(item => addToRoutes(item, '/tweaky', 0.8));
    if (radyRes.data) radyRes.data.forEach(item => addToRoutes(item, '/rady', 0.8));
    if (slovnikRes.data) slovnikRes.data.forEach(item => addToRoutes(item, '/slovnik', 0.7));
    if (duelsRes.data) duelsRes.data.forEach(item => addToRoutes(item, '/gpuvs', 0.8));
    if (cpuDuelsRes.data) cpuDuelsRes.data.forEach(item => addToRoutes(item, '/cpuvs', 0.8));

    // 🚀 GURU: DYNAMICKÉ STRÁNKY PRO GRAFIKY (FPS, PERFORMANCE, RECOMMEND)
    const gamesList = ['cyberpunk-2077', 'warzone', 'starfield']; 
    if (gpusRes.data) {
      gpusRes.data.forEach((gpu) => {
        if (!gpu.slug) return;
        
        // A) GPU FPS (Jednotlivé hry)
        gamesList.forEach((game) => {
          dynamicRoutes.push({ url: `${baseUrl}/gpu-fps/${gpu.slug}/${game}`, lastModified: currentDate, priority: 0.7 });
          dynamicRoutes.push({ url: `${baseUrl}/en/gpu-fps/${gpu.slug}/${game}`, lastModified: currentDate, priority: 0.6 });
        });

        // B) GPU PERFORMANCE
        dynamicRoutes.push({ url: `${baseUrl}/gpu-performance/${gpu.slug}`, lastModified: currentDate, priority: 0.7 });
        dynamicRoutes.push({ url: `${baseUrl}/en/gpu-performance/${gpu.slug}`, lastModified: currentDate, priority: 0.6 });

        // C) GPU RECOMMEND
        dynamicRoutes.push({ url: `${baseUrl}/gpu-recommend/${gpu.slug}`, lastModified: currentDate, priority: 0.7 });
        dynamicRoutes.push({ url: `${baseUrl}/en/gpu-recommend/${gpu.slug}`, lastModified: currentDate, priority: 0.6 });
      });
    }

    // 🚀 GURU: DYNAMICKÉ GPU UPGRADE STRÁNKY
    if (upgradesRes.data) {
      upgradesRes.data.forEach((upg) => {
        if (!upg.slug) return;
        dynamicRoutes.push({
          url: `${baseUrl}/gpu-upgrade/${upg.slug}`,
          lastModified: upg.created_at || currentDate,
          priority: 0.6,
        });
        const enSlug = (upg.slug_en || `en-${upg.slug}`).replace(/^en-en-/,'en-');
        dynamicRoutes.push({
          url: `${baseUrl}/en/gpu-upgrade/${enSlug}`,
          lastModified: upg.created_at || currentDate,
          priority: 0.5,
        });
      });
    }

  } catch (err) {
    console.error("GURU SITEMAP ENGINE ERROR:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
