import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // GURU FIX: Sitemapa sa vygeneruje vždy čerstvá pri každej požiadavke

/**
 * GURU SEO ENGINE - SITEMAP GENERATOR V4.0
 * Cesta: src/app/sitemap.js
 * Dynamicky generuje mapu webu pre Google.
 * Zahrnuje: Články, Očakávané hry, Mikrorecenzie, Tipy, Tweaky, Rady, Slovník, Slevy a 🚀 GPU DUELY.
 */
export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. STATICKÉ STRÁNKY (Základné kamene webu CZ + EN)
  const staticPaths = [
    { url: '', priority: 1.0 },
    { url: '/clanky', priority: 0.9 },
    { url: '/ocekavane-hry', priority: 0.9 }, 
    { url: '/mikrorecenze', priority: 0.9 },  
    { url: '/tipy', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/rady', priority: 0.9 },
    { url: '/deals', priority: 0.9 },        
    { url: '/kalendar', priority: 0.8 },      
    { url: '/sestavy', priority: 0.9 },
    { url: '/moje-pc', priority: 0.8 },
    { url: '/slovnik', priority: 0.8 },
    { url: '/gpuvs', priority: 0.9 },        // 🚀 GURU: Hlavná sekcia duelov
    { url: '/support', priority: 0.5 },
    { url: '/sin-slavy', priority: 0.6 },
    { url: '/partneri', priority: 0.6 },
    { url: '/ochrana-soukromi', priority: 0.3 },
    { url: '/podminky-uziti', priority: 0.3 },
  ];

  const staticRoutes = [];
  staticPaths.forEach((route) => {
    // Česká verzia
    staticRoutes.push({
      url: `${baseUrl}/cs${route.url}`,
      lastModified: new Date().toISOString(),
      priority: route.priority,
    });
    // Anglická verzia
    staticRoutes.push({
      url: `${baseUrl}/en${route.url}`,
      lastModified: new Date().toISOString(),
      priority: Math.max(0.1, route.priority - 0.1),
    });
  });

  // 2. DYNAMICKÉ TABUĽKY (GURU ENGINE)
  const dynamicRoutes = [];

  try {
    // 🚀 GURU DATA FETCH: Agregácia všetkých dynamických dát
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes, mikroRes, duelsRes] = await Promise.all([
      supabase.from('posts').select('slug, slug_en, title_en, created_at, type'),
      supabase.from('tipy').select('slug, slug_en, title_en, created_at'),
      supabase.from('tweaky').select('slug, slug_en, title_en, created_at'),
      supabase.from('rady').select('slug, slug_en, title_en, created_at'),
      supabase.from('slovnik').select('slug, slug_en, title_en, created_at'),
      supabase.from('mikrorecenze').select('slug, slug_en, title_en, created_at'),
      supabase.from('gpu_duels').select('slug, slug_en, created_at') // ⚔️ NOVINKA: GPU DUELY
    ]);

    // Univerzálna funkcia na pridávanie do poľa (CZ + EN varianty)
    const addToRoutes = (item, basePath, priority) => {
      if (item.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}/cs${basePath}/${item.slug}`,
          lastModified: item.created_at || new Date().toISOString(),
          priority: priority,
        });
      }

      // Detekcia EN verzie podľa Master Proxy logiky
      if (item.title_en || item.slug_en || (basePath === '/gpuvs' && item.slug)) {
        const enSlug = item.slug_en || (basePath === '/gpuvs' ? `en-${item.slug}` : item.slug);
        dynamicRoutes.push({
          url: `${baseUrl}/en${basePath}/${enSlug}`,
          lastModified: item.created_at || new Date().toISOString(),
          priority: Math.max(0.1, priority - 0.1),
        });
      }
    };

    // A) Spracovanie POSTS (Rozlíšenie Články vs Očakávané hry)
    if (postsRes.data) {
      postsRes.data.forEach(item => {
        const isExpected = item.type === 'expected';
        const basePath = isExpected ? '/ocekavane-hry' : '/clanky';
        addToRoutes(item, basePath, isExpected ? 0.9 : 0.8);
      });
    }

    // B) Spracovanie ostatných tabuliek
    if (tipyRes.data) tipyRes.data.forEach(item => addToRoutes(item, '/tipy', 0.8));
    if (tweakyRes.data) tweakyRes.data.forEach(item => addToRoutes(item, '/tweaky', 0.8));
    if (radyRes.data) radyRes.data.forEach(item => addToRoutes(item, '/rady', 0.8));
    if (slovnikRes.data) slovnikRes.data.forEach(item => addToRoutes(item, '/slovnik', 0.7));
    if (mikroRes.data) mikroRes.data.forEach(item => addToRoutes(item, '/mikrorecenze', 0.8));
    
    // C) ⚔️ GPU DUELY: Dynamická indexácia pre každé srovnanie
    if (duelsRes.data) duelsRes.data.forEach(item => addToRoutes(item, '/gpuvs', 0.8));

  } catch (err) {
    console.error("GURU SITEMAP ENGINE ERROR:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
