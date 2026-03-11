import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V14.0 (MONSTER GAME SCALE)
 * Cesta: src/app/sitemap.js
 * 🚀 CÍL: Agresivní znásobení URL (stovky tisíc cest s parametry her).
 * 🛡️ ARCH: Rozdělení na 15 sitemáp (0-14). Celková kapacita 750 000 URL.
 * 🛡️ FEATURE: Bottleneck Game Multiplier (-in-[game]) pro TOP 200x200 páry.
 */

export const revalidate = 3600;

// 1. DEFINICE SEGMENTŮ
export async function generateSitemaps() {
  const sitemaps = [];
  // ID 0: Core + Profily + Články
  // ID 1-2: GPU SEO Matrix (Specs + FPS + Res)
  // ID 3-4: CPU SEO Matrix (Specs + FPS)
  // ID 5-14: Monster Bottleneck Cluster (CPU x GPU x Games)
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

  // Definice herního vesmíru
  const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2', 'fortnite', 'rdr2', 'alan-wake-2', 'hogwarts-legacy'];
  const bottleneckGames = ['cyberpunk-2077', 'warzone', 'fortnite']; // TOP 3 pro masivní párování
  const resolutions = ['1080p', '1440p', '4k'];

  try {
    // FETCH DATA (Zvýšené limity na 2000 pro maximální pokrytí profilů)
    const [gpus, cpus, posts, gpuUpgrades, cpuUpgrades, rady, tipy, tweaky, slovnik] = await Promise.all([
      supabase.from('gpus').select('slug, performance_index').order('performance_index', { ascending: false }).limit(2000),
      supabase.from('cpus').select('slug, performance_index').order('performance_index', { ascending: false }).limit(2000),
      supabase.from('posts').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en'),
      supabase.from('cpu_upgrades').select('slug, slug_en'),
      supabase.from('rady').select('slug'),
      supabase.from('tipy').select('slug'),
      supabase.from('tweaky').select('slug'),
      supabase.from('slovnik').select('slug')
    ]);

    const routes = [];

    // --- ID 0: CORE SITE (STATIKY + CONTENT + UPGRADES + PROFILY) ---
    if (id === 0) {
      const staticPaths = [
        { url: '/', priority: 1.0 }, { url: '/clanky', priority: 0.9 }, { url: '/tweaky', priority: 0.9 },
        { url: '/tipy', priority: 0.9 }, { url: '/rady', priority: 0.9 }, { url: '/slovnik', priority: 0.9 },
        { url: '/gpuvs', priority: 0.9 }, { url: '/gpuvs/ranking', priority: 0.9 },
        { url: '/cpuvs', priority: 0.9 }, { url: '/cpuvs/ranking', priority: 0.9 },
        { url: '/cpu-index', priority: 0.9 }, { url: '/deals', priority: 0.8 }, { url: '/support', priority: 0.5 }
      ];

      staticPaths.forEach(p => {
        routes.push({ url: `${baseUrl}${p.url}`, lastModified: currentDate, priority: p.priority });
        routes.push({ url: `${baseUrl}/en${p.url}`, lastModified: currentDate, priority: p.priority - 0.1 });
      });

      // Hlavní HW profily (4000+ entit)
      [...(gpus.data || []), ...(cpus.data || [])].forEach(h => {
        const type = h.performance_index !== undefined && gpus.data?.find(g => g.slug === h.slug) ? 'gpu' : 'cpu';
        routes.push({ url: `${baseUrl}/${type}/${h.slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en/${type}/${h.slug}`, lastModified: currentDate, priority: 0.7 });
      });

      // Upgrady & Duely
      [...(gpuUpgrades.data || []), ...(cpuUpgrades.data || [])].forEach(u => {
        const type = u.slug.includes('cpu') ? 'cpu-upgrade' : 'gpu-upgrade';
        routes.push({ url: `${baseUrl}/${type}/${u.slug}`, lastModified: currentDate, priority: 0.6 });
        routes.push({ url: `${baseUrl}/en/${type}/${u.slug_en || `en-${u.slug}`}`, lastModified: currentDate, priority: 0.5 });
      });

      // Content (Články, Rady...)
      const sections = [
        { data: posts.data, path: '/clanky/' }, { data: rady.data, path: '/rady/' },
        { data: tipy.data, path: '/tipy/' }, { data: tweaky.data, path: '/tweaky/' }, { data: slovnik.data, path: '/slovnik/' }
      ];
      sections.forEach(sec => sec.data?.forEach(item => {
        routes.push({ url: `${baseUrl}${sec.path}${item.slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en${sec.path}${item.slug}`, lastModified: currentDate, priority: 0.7 });
      }));
    }

    // --- ID 1-2: GPU SEO MATRIX ---
    if (id === 1 || id === 2) {
      const midG = Math.floor(gpus.data.length / 2);
      const targetGpus = (id === 1) ? gpus.data.slice(0, midG) : gpus.data.slice(midG);

      targetGpus.forEach(g => {
        ['/gpu-performance/', '/gpu-recommend/'].forEach(p => {
          routes.push({ url: `${baseUrl}${p}${g.slug}`, lastModified: currentDate, priority: 0.8 });
          routes.push({ url: `${baseUrl}/en${p}${g.slug}`, lastModified: currentDate, priority: 0.7 });
        });
        games.forEach(game => {
          routes.push({ url: `${baseUrl}/gpu-fps/${g.slug}/${game}`, lastModified: currentDate, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/gpu-fps/${g.slug}/${game}`, lastModified: currentDate, priority: 0.6 });
          resolutions.forEach(res => {
            routes.push({ url: `${baseUrl}/gpu-performance/${g.slug}/${game}/${res}`, lastModified: currentDate, priority: 0.6 });
            routes.push({ url: `${baseUrl}/en/gpu-performance/${g.slug}/${game}/${res}`, lastModified: currentDate, priority: 0.5 });
          });
        });
      });
    }

    // --- ID 3-4: CPU SEO MATRIX ---
    if (id === 3 || id === 4) {
      const midC = Math.floor(cpus.data.length / 2);
      const targetCpus = (id === 3) ? cpus.data.slice(0, midC) : cpus.data.slice(midC);

      targetCpus.forEach(c => {
        ['/cpu-performance/', '/cpu-recommend/'].forEach(p => {
          routes.push({ url: `${baseUrl}${p}${c.slug}`, lastModified: currentDate, priority: 0.8 });
          routes.push({ url: `${baseUrl}/en${p}${c.slug}`, lastModified: currentDate, priority: 0.7 });
        });
        games.forEach(game => {
          routes.push({ url: `${baseUrl}/cpu-fps/${c.slug}/${game}`, lastModified: currentDate, priority: 0.7 });
          routes.push({ url: `${baseUrl}/en/cpu-fps/${c.slug}/${game}`, lastModified: currentDate, priority: 0.6 });
        });
      });
    }

    // --- ID 5 až 14: MONSTER CLUSTER (BOTTLENECK + GAMES) ---
    // Bereme TOP 200 CPU a TOP 200 GPU = 40 000 základních párů.
    // Ke každému páru přidáváme 3 top hry = celkem cca 320 000 URL (včetně EN verzí).
    if (id >= 5 && id <= 14) {
      const topCpus = cpus.data?.slice(0, 200) || [];
      const topGpus = gpus.data?.slice(0, 200) || [];
      const chunkSize = Math.ceil(topCpus.length / 10);
      const start = (id - 5) * chunkSize;
      const end = start + chunkSize;
      const targetCpus = topCpus.slice(start, end);

      targetCpus.forEach(c => {
        topGpus.forEach(g => {
          const pairPath = `/bottleneck/${c.slug}-with-${g.slug}`;
          // Základní pár
          routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate, priority: 0.6 });
          routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate, priority: 0.5 });
          
          // Game-specific bottleneck (TOP 3 hry)
          bottleneckGames.forEach(game => {
             routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.5 });
             routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, lastModified: currentDate, priority: 0.4 });
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
