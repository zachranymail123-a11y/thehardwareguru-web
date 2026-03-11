import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V16.0 (RESOLUTION MATRIX)
 * Cesta: src/app/sitemap.js
 * 🚀 CÍL: Dominance v long-tail vyhledávání (CPU x GPU x Hra x Rozlišení).
 * 🛡️ ARCH: 15 sitemáp (0-14). Kapacita 750 000 URL.
 * 🛡️ FEATURE: Přidán Resolution Multiplier (-at-[res]) pro maximální SEO zásah.
 */

export const revalidate = 3600;

export async function generateSitemaps() {
  const sitemaps = [];
  for (let i = 0; i <= 14; i++) {
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

  // Definice SEO vesmíru
  const bottleneckGames = ['cyberpunk-2077', 'warzone', 'fortnite']; 
  const resolutions = ['1080p', '1440p', '4k'];

  try {
    const [gpus, cpus, posts, gpuUpgrades, cpuUpgrades] = await Promise.all([
      supabase.from('gpus').select('slug, performance_index').order('performance_index', { ascending: false }).limit(2000),
      supabase.from('cpus').select('slug, performance_index').order('performance_index', { ascending: false }).limit(2000),
      supabase.from('posts').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en'),
      supabase.from('cpu_upgrades').select('slug, slug_en')
    ]);

    const routes = [];

    // --- ID 0: CORE SITE (STATIKY + PROFILY) ---
    if (id === 0) {
      const staticPaths = [
        { url: '/', priority: 1.0 }, { url: '/clanky', priority: 0.9 },
        { url: '/gpuvs/ranking', priority: 0.9 }, { url: '/cpuvs/ranking', priority: 0.9 }
      ];
      staticPaths.forEach(p => {
        routes.push({ url: `${baseUrl}${p.url}`, lastModified: currentDate, priority: p.priority });
        routes.push({ url: `${baseUrl}/en${p.url}`, lastModified: currentDate, priority: p.priority - 0.1 });
      });
      [...(gpus.data || []), ...(cpus.data || [])].forEach(h => {
        const type = h.performance_index !== undefined && gpus.data?.find(g => g.slug === h.slug) ? 'gpu' : 'cpu';
        routes.push({ url: `${baseUrl}/${type}/${h.slug}`, lastModified: currentDate, priority: 0.8 });
      });
    }

    // --- ID 5 až 14: MONSTER RESOLUTION CLUSTER ---
    // Bereme TOP 130 CPU x TOP 130 GPU = 16 900 základních párů.
    // Každý pár má: Základní (1) + Hry (3) + Hry s rozlišením (9) = 13 variant.
    // Celkem: 16 900 * 13 * 2 (jazyky) = 439 400 URL. 
    // Rozděleno na 10 segmentů = cca 44 000 URL na jeden soubor.
    if (id >= 5 && id <= 14) {
      const topCpus = cpus.data?.slice(0, 130) || [];
      const topGpus = gpus.data?.slice(0, 130) || [];
      const chunkSize = Math.ceil(topCpus.length / 10);
      const start = (id - 5) * chunkSize;
      const end = start + chunkSize;
      const targetCpus = topCpus.slice(start, end);

      targetCpus.forEach(c => {
        topGpus.forEach(g => {
          const pairPath = `/bottleneck/${c.slug}-with-${g.slug}`;
          
          // 1. Základní bottleneck (CZ + EN)
          routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate, priority: 0.6 });
          routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate, priority: 0.5 });
          
          bottleneckGames.forEach(game => {
             // 2. Game-specific (CZ + EN)
             routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.5 });
             routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.4 });

             // 3. Resolution-specific (TATO ČÁST DOMINUJE GOOGLU)
             resolutions.forEach(res => {
                routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, lastModified: currentDate, priority: 0.5 });
                routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, lastModified: currentDate, priority: 0.4 });
             });
          });
        });
      });
    }

    return routes.slice(0, 50000);
  } catch (error) {
    console.error("GURU SITEMAP ENGINE CRASH:", error);
    return [];
  }
}
