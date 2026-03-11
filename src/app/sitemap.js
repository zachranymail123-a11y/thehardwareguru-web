import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V7.0 (MAX INDEXING)
 * Cesta: src/app/sitemap.js
 * 🚀 CÍL: Maximální pokrytí pro GSC. Generuje desítky tisíc URL.
 * 🛡️ FIX: Zahrnuje Rady, Slovník, Tipy, Tweaky a hluboké SEO clustery (GPU/CPU FPS + Resolutions).
 * 🛡️ MULTILANG: Každá cesta má svou EN variantu.
 */

export const revalidate = 3600; // Refresh každou hodinu

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://thehardwareguru.cz';
  const currentDate = new Date().toISOString();

  // 1. STATICKÉ HLAVNÍ CESTY
  const staticPaths = [
    { url: '/', priority: 1.0 },
    { url: '/clanky', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/tipy', priority: 0.9 },
    { url: '/rady', priority: 0.9 },
    { url: '/slovnik', priority: 0.9 },
    { url: '/gpuvs/ranking', priority: 0.9 },
    { url: '/cpuvs/ranking', priority: 0.9 },
    { url: '/cpu-index', priority: 0.9 },
    { url: '/deals', priority: 0.8 },
    { url: '/support', priority: 0.5 },
  ];

  const routes = [];
  staticPaths.forEach(p => {
    routes.push({ url: `${baseUrl}${p.url}`, lastModified: currentDate, priority: p.priority });
    routes.push({ url: `${baseUrl}/en${p.url}`, lastModified: currentDate, priority: p.priority - 0.1 });
  });

  try {
    // 2. FETCH VŠECH DAT Z DB
    const [
        gpus, cpus, posts, gpuUpgrades, cpuUpgrades, 
        rady, tipy, tweaky, slovnik
    ] = await Promise.all([
      supabase.from('gpus').select('slug'),
      supabase.from('cpus').select('slug'),
      supabase.from('posts').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en'),
      supabase.from('cpu_upgrades').select('slug, slug_en'),
      supabase.from('rady').select('slug'),
      supabase.from('tipy').select('slug'),
      supabase.from('tweaky').select('slug'),
      supabase.from('slovnik').select('slug')
    ]);

    const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
    const resolutions = ['1080p', '1440p', '4k'];

    // 3. GPU SEKCE - EXTRÉMNÍ CLUSTER
    gpus.data?.forEach(g => {
      if (!g.slug) return;
      const slug = g.slug;
      
      // Základní GPU stránky
      ['/gpu/', '/gpu-performance/', '/gpu-recommend/'].forEach(p => {
        routes.push({ url: `${baseUrl}${p}${slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en${p}${slug}`, lastModified: currentDate, priority: 0.7 });
      });

      // FPS & Resolution Cluster (Tady vznikají tisíce stránek)
      games.forEach(game => {
        // gpu-fps/[slug]/[game]
        routes.push({ url: `${baseUrl}/gpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.7 });
        routes.push({ url: `${baseUrl}/en/gpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.6 });

        // gpu-performance/[slug]/[game]/[resolution]
        resolutions.forEach(res => {
            routes.push({ url: `${baseUrl}/gpu-performance/${slug}/${game}/${res}`, lastModified: currentDate, priority: 0.6 });
            routes.push({ url: `${baseUrl}/en/gpu-performance/${slug}/${game}/${res}`, lastModified: currentDate, priority: 0.5 });
        });
      });
    });

    // 4. CPU SEKCE
    cpus.data?.forEach(c => {
      if (!c.slug) return;
      const slug = c.slug;
      ['/cpu/', '/cpu-performance/', '/cpu-recommend/'].forEach(p => {
        routes.push({ url: `${baseUrl}${p}${slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en${p}${slug}`, lastModified: currentDate, priority: 0.7 });
      });

      games.forEach(game => {
        routes.push({ url: `${baseUrl}/cpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.7 });
        routes.push({ url: `${baseUrl}/en/cpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.6 });
      });
    });

    // 5. OBSAHOVÉ SEKCE (Články, Rady, Tipy, Tweaky, Slovník)
    const contentMaps = [
        { data: posts.data, path: '/clanky/' },
        { data: rady.data, path: '/rady/' },
        { data: tipy.data, path: '/tipy/' },
        { data: tweaky.data, path: '/tweaky/' },
        { data: slovnik.data, path: '/slovnik/' }
    ];

    contentMaps.forEach(map => {
        map.data?.forEach(item => {
            if (!item.slug) return;
            routes.push({ url: `${baseUrl}${map.path}${item.slug}`, lastModified: currentDate, priority: 0.8 });
            routes.push({ url: `${baseUrl}/en${map.path}${item.slug}`, lastModified: currentDate, priority: 0.7 });
        });
    });

    // 6. UPGRADY (Předgenerované cesty)
    gpuUpgrades.data?.forEach(u => {
      if (!u.slug) return;
      routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastModified: currentDate, priority: 0.6 });
      routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en || `en-${u.slug}`}`, lastModified: currentDate, priority: 0.5 });
    });

    cpuUpgrades.data?.forEach(u => {
      if (!u.slug) return;
      routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastModified: currentDate, priority: 0.6 });
      routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en || `en-${u.slug}`}`, lastModified: currentDate, priority: 0.5 });
    });

  } catch (error) {
    console.error("GURU SITEMAP ENGINE CRASH:", error);
  }

  return routes;
}
