import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V17.3 (404 FIX)
 * Cesta: src/app/sitemap.js
 * 🛡️ FIX 1: Přidáno 'force-dynamic', aby sitemap nespadla na Vercelu při buildu (to způsobovalo 404).
 * 🛡️ FIX 2: 'id' je explicitně převedeno na Number(), protože Next.js ho může posílat jako string ("0").
 * 🛡️ FIX 3: Navýšeno na 40 segmentů, aby každý segment měl 100% pod 50k URLs.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Žádná cache, vždy aktuální stav

export async function generateSitemaps() {
  const sitemaps = [];
  for (let i = 0; i <= 39; i++) { // Zvýšeno na 40 pro absolutní jistotu limitu Google (50k/soubor)
    sitemaps.push({ id: i });
  }
  return sitemaps;
}

export default async function sitemap({ id }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://thehardwareguru.cz';
  const currentDate = new Date().toISOString();
  
  // 🚀 GURU CRITICAL FIX: Next.js v produkci předává ID jako String ("0"). Musíme ho převést!
  const currentId = Number(id || 0);

  const slugify = (text) => text.toLowerCase().replace(/nvidia|amd|geforce|radeon|intel|processor|graphics|gpu/gi, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").replace(/\-+/g, "-").replace(/^-+|-+$/g, "").trim();

  try {
    const [gpus, cpus, posts, gamesRes, gpuUpg, cpuUpg] = await Promise.all([
      supabase.from('gpus').select('slug, name, performance_index').order('performance_index', { ascending: false }).limit(1000),
      supabase.from('cpus').select('slug, name, performance_index').order('performance_index', { ascending: false }).limit(1000),
      supabase.from('posts').select('slug'),
      supabase.from('games').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en'),
      supabase.from('cpu_upgrades').select('slug, slug_en')
    ]);

    const routes = [];

    const dbGames = gamesRes.data?.map(g => g.slug).filter(Boolean) || [];
    const bottleneckGames = dbGames.length > 0 ? dbGames : [
      'cyberpunk-2077', 'warzone', 'fortnite', 'starfield', 'cs2', 'rdr2', 'alan-wake-2', 'hogwarts-legacy'
    ];
    const resolutions = ['1080p', '1440p', '4k'];

    // --- ID 0: CORE SITE & HW PROFILY ---
    if (currentId === 0) {
      const staticPaths = [
        { url: '/', priority: 1.0 }, 
        { url: '/clanky', priority: 0.9 },
        { url: '/gpuvs/ranking', priority: 0.9 }, 
        { url: '/cpuvs/ranking', priority: 0.9 },
        { url: '/cpu-index', priority: 0.9 },
        { url: '/deals', priority: 0.9 }, 
        { url: '/support', priority: 0.5 }
      ];
      
      staticPaths.forEach(p => {
        routes.push({ url: `${baseUrl}${p.url}`, lastModified: currentDate, priority: p.priority });
        routes.push({ url: `${baseUrl}/en${p.url}`, lastModified: currentDate, priority: p.priority - 0.1 });
      });

      posts.data?.forEach(p => {
         if (p.slug) {
            routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastModified: currentDate, priority: 0.8 });
            routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastModified: currentDate, priority: 0.7 });
         }
      });

      gpus.data?.forEach(g => {
        const safeSlug = g.slug || slugify(g.name);
        if (!safeSlug) return;
        routes.push({ url: `${baseUrl}/gpu/${safeSlug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en/gpu/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
        bottleneckGames.forEach(gm => {
          routes.push({ url: `${baseUrl}/gpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/gpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.6 });
        });
      });

      cpus.data?.forEach(c => {
        const safeSlug = c.slug || slugify(c.name);
        if (!safeSlug) return;
        routes.push({ url: `${baseUrl}/cpu/${safeSlug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en/cpu/${safeSlug}`, lastModified: currentDate, priority: 0.7 });
        bottleneckGames.forEach(gm => {
          routes.push({ url: `${baseUrl}/cpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/cpu-fps/${safeSlug}/${gm}`, lastModified: currentDate, priority: 0.6 });
        });
      });

      [...(gpuUpg.data || []), ...(cpuUpg.data || [])].forEach(u => {
        const base = u.slug.includes('cpu') ? '/cpu-upgrade' : '/gpu-upgrade';
        routes.push({ url: `${baseUrl}${base}/${u.slug}`, lastModified: currentDate, priority: 0.6 });
        routes.push({ url: `${baseUrl}/en${base}/${u.slug_en || `en-${u.slug}`}`, lastModified: currentDate, priority: 0.5 });
      });
    }

    // --- ID 1 až 39: MONSTER RESOLUTION CLUSTER ---
    if (currentId >= 1 && currentId <= 39) {
      const topCpus = cpus.data?.slice(0, 150) || []; 
      const topGpus = gpus.data?.slice(0, 150) || []; 
      
      const chunkSize = Math.ceil(topCpus.length / 39);
      const start = (currentId - 1) * chunkSize;
      const end = start + chunkSize;
      const targetCpus = topCpus.slice(start, end);

      targetCpus.forEach(c => {
        topGpus.forEach(g => {
          const safeCpuSlug = c.slug || slugify(c.name);
          const safeGpuSlug = g.slug || slugify(g.name);
          
          if(!safeCpuSlug || !safeGpuSlug) return;
          
          const pairPath = `/bottleneck/${safeCpuSlug}-with-${safeGpuSlug}`;
          
          routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate, priority: 0.6 });
          routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate, priority: 0.5 });
          
          bottleneckGames.forEach(game => {
             routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.5 });
             routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.4 });

             resolutions.forEach(res => {
                routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, lastModified: currentDate, priority: 0.5 });
                routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, lastModified: currentDate, priority: 0.4 });
             });
          });
        });
      });
    }

    // Next.js limit je 50k URL na soubor
    return routes.slice(0, 50000);
  } catch (error) {
    console.error("GURU SITEMAP ENGINE CRASH:", error);
    return [];
  }
}
