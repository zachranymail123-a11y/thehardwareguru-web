import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // GURU FIX: Sitemapa se generuje vždy čerstvá

/**
 * GURU SEO ENGINE - SITEMAP GENERATOR V2.1
 * Cesta: src/app/sitemap.js
 * Dynamicky generuje mapu webu pro Google.
 * Zahrnuje: Články, Tipy, Tweaky, Rady, Slovník, Slevy a 🚀 GPU & CPU DUELY.
 */
export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. STATICKÉ SEKCE (CZ + EN)
  const staticPaths = [
    { url: '', priority: 1.0 },
    { url: '/clanky', priority: 0.9 },
    { url: '/tipy', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/rady', priority: 0.8 },
    { url: '/slovnik', priority: 0.7 },
    { url: '/deals', priority: 0.9 },
    { url: '/gpuvs', priority: 0.9 }, // 🚀 GURU: Hlavní rozcestník GPU srovnání
    { url: '/cpuvs', priority: 0.9 }, // 🚀 GURU: Hlavní rozcestník CPU srovnání
    { url: '/support', priority: 0.5 },
    { url: '/sin-slavy', priority: 0.6 },
  ];

  const staticRoutes = [];
  staticPaths.forEach((route) => {
    staticRoutes.push({
      url: `${baseUrl}/cs${route.url}`,
      lastModified: new Date().toISOString(),
      priority: route.priority,
    });
    staticRoutes.push({
      url: `${baseUrl}/en${route.url}`,
      lastModified: new Date().toISOString(),
      priority: Math.max(0.1, route.priority - 0.1),
    });
  });

  // 2. DYNAMICKÉ ROUTY (GURU DATA ENGINE)
  const dynamicRoutes = [];

  try {
    // 🚀 GURU FETCH: Agregace všech tabulek včetně GPU a CPU duelů
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes, dealsRes, duelsRes, cpuDuelsRes] = await Promise.all([
      supabase.from('posts').select('slug, slug_en, created_at, type'),
      supabase.from('tipy').select('slug, slug_en, created_at'),
      supabase.from('tweaky').select('slug, slug_en, created_at'),
      supabase.from('rady').select('slug, slug_en, created_at'),
      supabase.from('slovnik').select('slug, slug_en, created_at'),
      supabase.from('game_deals').select('id, created_at'),
      supabase.from('gpu_duels').select('slug, slug_en, created_at'), // 🚀 DATA PRO GPU SROVNÁNÍ
      supabase.from('cpu_duels').select('slug, slug_en, created_at')  // 🚀 DATA PRO CPU SROVNÁNÍ
    ]);

    // Helper pro přidání CZ/EN variant
    const addToRoutes = (item, basePath, priority) => {
      if (item.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}/cs${basePath}/${item.slug}`,
          lastModified: item.created_at || new Date().toISOString(),
          priority: priority,
        });
      }
      // 🚀 GURU FIX: Podpora EN fallbacku pro GPU i CPU duely
      if (item.slug_en || ((basePath === '/gpuvs' || basePath === '/cpuvs') && item.slug)) {
        const enSlug = item.slug_en || ((basePath === '/gpuvs' || basePath === '/cpuvs') ? `en-${item.slug}` : item.slug);
        dynamicRoutes.push({
          url: `${baseUrl}/en${basePath}/${enSlug}`,
          lastModified: item.created_at || new Date().toISOString(),
          priority: Math.max(0.1, priority - 0.1),
        });
      }
    };

    // Zpracování dat
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
    
    // 🚀 GURU: Indexace pro všechny jednotlivé duely grafik
    if (duelsRes.data) duelsRes.data.forEach(item => addToRoutes(item, '/gpuvs', 0.8));

    // 🚀 GURU: Indexace pro všechny jednotlivé duely procesorů
    if (cpuDuelsRes.data) cpuDuelsRes.data.forEach(item => addToRoutes(item, '/cpuvs', 0.8));

  } catch (err) {
    console.error("GURU SITEMAP ENGINE ERROR:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
