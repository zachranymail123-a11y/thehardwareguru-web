import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V17.0 (TOTAL DOMINATION)
 * Cesta: src/app/sitemap.js
 * 🚀 CÍL: Dominance v long-tail vyhledávání (CPU x GPU x 8 Her x 3 Rozlišení).
 * 🛡️ ARCH: 30 segmentů sitemapy (0-29). Kapacita přes 1 500 000 URL.
 * 🛡️ FEATURE: Každá unikátní kombinace rozlišení má svou vlastní URL pro Google Index.
 */

export const revalidate = 3600;

export async function generateSitemaps() {
  // Generujeme 30 sitemáp pro pokrytí celého vesmíru kombinací
  const sitemaps = [];
  for (let i = 0; i <= 29; i++) {
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

  // 🛡️ GURU SEO MATRIX DEFINICE
  const bottleneckGames = [
    'cyberpunk-2077', 
    'warzone', 
    'fortnite', 
    'starfield', 
    'cs2', 
    'rdr2', 
    'alan-wake-2', 
    'hogwarts-legacy'
  ]; 
  const resolutions = ['1080p', '1440p', '4k'];

  try {
    const [gpus, cpus, posts] = await Promise.all([
      supabase.from('gpus').select('slug, performance_index').order('performance_index', { ascending: false }).limit(1000),
      supabase.from('cpus').select('slug, performance_index').order('performance_index', { ascending: false }).limit(1000),
      supabase.from('posts').select('slug')
    ]);

    const routes = [];

    // --- ID 0: CORE SITE & HW PROFILY ---
    if (id === 0) {
      const staticPaths = [
        { url: '/', priority: 1.0 }, { url: '/clanky', priority: 0.9 },
        { url: '/gpuvs/ranking', priority: 0.9 }, { url: '/cpuvs/ranking', priority: 0.9 },
        { url: '/deals', priority: 0.9 }, { url: '/support', priority: 0.5 }
      ];
      
      staticPaths.forEach(p => {
        routes.push({ url: `${baseUrl}${p.url}`, lastModified: currentDate, priority: p.priority });
        routes.push({ url: `${baseUrl}/en${p.url}`, lastModified: currentDate, priority: p.priority - 0.1 });
      });

      // HW Profily (Základní landing pages)
      [...(gpus.data || []), ...(cpus.data || [])].forEach(h => {
        const type = h.performance_index !== undefined && gpus.data?.find(g => g.slug === h.slug) ? 'gpu' : 'cpu';
        routes.push({ url: `${baseUrl}/${type}/${h.slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en/${type}/${h.slug}`, lastModified: currentDate, priority: 0.7 });
      });
    }

    // --- ID 1 až 29: MONSTER RESOLUTION CLUSTER ---
    // Logika: Rozdělíme CPU do segmentů. Každý segment sitemapy zpracuje část CPU proti všem GPU.
    if (id >= 1 && id <= 29) {
      const topCpus = cpus.data?.slice(0, 150) || []; // TOP 150 CPU
      const topGpus = gpus.data?.slice(0, 150) || []; // TOP 150 GPU
      
      const chunkSize = Math.ceil(topCpus.length / 29);
      const start = (id - 1) * chunkSize;
      const end = start + chunkSize;
      const targetCpus = topCpus.slice(start, end);

      targetCpus.forEach(c => {
        topGpus.forEach(g => {
          const pairPath = `/bottleneck/${c.slug}-with-${g.slug}`;
          
          // 1. Základní kombinace (CZ + EN)
          routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate, priority: 0.6 });
          routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate, priority: 0.5 });
          
          bottleneckGames.forEach(game => {
             // 2. Herní varianty
             routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.5 });
             routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.4 });

             // 3. Rozlišení (Tady se tvoří statisíce URL)
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
