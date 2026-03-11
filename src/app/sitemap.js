import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V9.0 (MAX INDEXING)
 * Cesta: src/app/sitemap.js
 * 🚀 CIEĽ: Agresívne pokrytie pre GSC. Generuje desiatky (až stovky) tisíc URL.
 * 🛡️ FIX: Zahŕňa kompletnú HW databázu, SEO resolution clustery a znalostné sekcie.
 * 🛡️ MULTILANG: Automatické generovanie EN variant (/en/) pre každý záznam.
 */

export const revalidate = 3600; // Aktualizácia každú hodinu

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://thehardwareguru.cz';
  const currentDate = new Date().toISOString();

  // 1. STATICKÉ HLAVNÉ CESTY (Maximálna priorita)
  const staticPaths = [
    { url: '/', priority: 1.0 },
    { url: '/clanky', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/tipy', priority: 0.9 },
    { url: '/rady', priority: 0.9 },
    { url: '/slovnik', priority: 0.9 },
    { url: '/gpuvs', priority: 0.9 },
    { url: '/gpuvs/ranking', priority: 0.9 },
    { url: '/cpuvs', priority: 0.9 },
    { url: '/cpuvs/ranking', priority: 0.9 },
    { url: '/cpu-index', priority: 0.9 },
    { url: '/deals', priority: 0.8 },
    { url: '/support', priority: 0.5 },
  ];

  const routes = [];
  
  // Pridanie statických ciest v CZ aj EN
  staticPaths.forEach(p => {
    routes.push({ url: `${baseUrl}${p.url}`, lastModified: currentDate, priority: p.priority });
    routes.push({ url: `${baseUrl}/en${p.url}`, lastModified: currentDate, priority: p.priority - 0.1 });
  });

  try {
    // 2. MASÍVNY DATA FETCH ZO VŠETKÝCH TABULIEK (Optimalizované query)
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

    const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2', 'fortnite', 'rdr2'];
    const resolutions = ['1080p', '1440p', '4k'];

    // 3. GPU EXTRÉMNY SEO CLUSTER (Týmto nafúkneme počet stránok)
    gpus.data?.forEach(g => {
      if (!g.slug) return;
      const slug = g.slug;
      
      // Základné profily
      ['/gpu/', '/gpu-performance/', '/gpu-recommend/'].forEach(prefix => {
        routes.push({ url: `${baseUrl}${prefix}${slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en${prefix}${slug}`, lastModified: currentDate, priority: 0.7 });
      });

      // FPS & Resolution Matrix
      games.forEach(game => {
        // gpu-fps/[slug]/[game]
        routes.push({ url: `${baseUrl}/gpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.7 });
        routes.push({ url: `${baseUrl}/en/gpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.6 });

        // gpu-performance/[slug]/[game]/[resolution] (SEO KĽÚČOVÉ)
        resolutions.forEach(res => {
            routes.push({ url: `${baseUrl}/gpu-performance/${slug}/${game}/${res}`, lastModified: currentDate, priority: 0.6 });
            routes.push({ url: `${baseUrl}/en/gpu-performance/${slug}/${game}/${res}`, lastModified: currentDate, priority: 0.5 });
        });
      });
    });

    // 4. CPU SEO CLUSTER
    cpus.data?.forEach(c => {
      if (!c.slug) return;
      const slug = c.slug;
      ['/cpu/', '/cpu-performance/', '/cpu-recommend/'].forEach(prefix => {
        routes.push({ url: `${baseUrl}${prefix}${slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en${prefix}${slug}`, lastModified: currentDate, priority: 0.7 });
      });

      // CPU FPS testy
      games.forEach(game => {
        routes.push({ url: `${baseUrl}/cpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.7 });
        routes.push({ url: `${baseUrl}/en/cpu-fps/${slug}/${game}`, lastModified: currentDate, priority: 0.6 });
      });
    });

    // 5. OBSAHOVÉ SEKCE (Rady, Tipy, Tweaky, Slovník, Články)
    const contentSections = [
        { data: posts.data, path: '/clanky/' },
        { data: rady.data, path: '/rady/' },
        { data: tipy.data, path: '/tipy/' },
        { data: tweaky.data, path: '/tweaky/' },
        { data: slovnik.data, path: '/slovnik/' }
    ];

    contentSections.forEach(sec => {
        sec.data?.forEach(item => {
            if (!item.slug) return;
            routes.push({ url: `${baseUrl}${sec.path}${item.slug}`, lastModified: currentDate, priority: 0.8 });
            routes.push({ url: `${baseUrl}/en${sec.path}${item.slug}`, lastModified: currentDate, priority: 0.7 });
        });
    });

    // 6. UPGRADE ENGINE (Perzistentné cesty z DB)
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

  // Finálna kontrola unikátnosti (ochrana pred duplicitami)
  const uniqueRoutes = Array.from(new Map(routes.map(r => [r.url, r])).values());

  return uniqueRoutes;
}
