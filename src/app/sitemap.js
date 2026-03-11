import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - ULTIMATE SITEMAP GENERATOR V11.0 (MULTI-SITEMAP EDITION)
 * Cesta: src/app/sitemap.js
 * 🚀 CIEĽ: Škálovateľnosť nad 50 000 URL pomocou generateSitemaps.
 * 🛡️ ARCH: Rozdelenie na 5 logických sitemáp (Core, GPU, CPU, Monster P1, Monster P2).
 * 🛡️ LIMIT: Každý súbor zvládne 50k, celkovo sme pripravení na 250 000 URL.
 */

export const revalidate = 3600;

// 1. DEFINÍCIA SITEMAP ČASTÍ
export async function generateSitemaps() {
  // Definujeme 5 sitemáp (ID 0 až 4)
  return [
    { id: 0 }, // Core Site (Statické, Články, Upgrady, Profily)
    { id: 1 }, // GPU Matrix (FPS, Performance, Recommend)
    { id: 2 }, // CPU Matrix (FPS, Performance, Recommend)
    { id: 3 }, // Monster Cluster P1 (Bottleneck analýzy - prvá polovica)
    { id: 4 }, // Monster Cluster P2 (Bottleneck analýzy - druhá polovica)
  ];
}

export default async function sitemap({ id }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://thehardwareguru.cz';
  const currentDate = new Date().toISOString();

  // Pomocné konštanty
  const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2', 'fortnite', 'rdr2'];
  const resolutions = ['1080p', '1440p', '4k'];

  try {
    // FETCH DÁT (Všetky sitemapy potrebujú prístup k HW pre cross-links)
    const [gpus, cpus, posts, gpuUpgrades, cpuUpgrades, rady, tipy, tweaky, slovnik] = await Promise.all([
      supabase.from('gpus').select('slug, performance_index').order('performance_index', { ascending: false }),
      supabase.from('cpus').select('slug, performance_index').order('performance_index', { ascending: false }),
      supabase.from('posts').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en'),
      supabase.from('cpu_upgrades').select('slug, slug_en'),
      supabase.from('rady').select('slug'),
      supabase.from('tipy').select('slug'),
      supabase.from('tweaky').select('slug'),
      supabase.from('slovnik').select('slug')
    ]);

    const routes = [];

    // --- ID 0: CORE SITE (STATICKÉ + CONTENT + UPGRADES + PROFILES) ---
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

      // Hlavné Hardware profily
      [...(gpus.data || []), ...(cpus.data || [])].forEach(h => {
        const type = h.vram_gb !== undefined ? 'gpu' : 'cpu';
        routes.push({ url: `${baseUrl}/${type}/${h.slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en/${type}/${h.slug}`, lastModified: currentDate, priority: 0.7 });
      });

      // Upgrady & Duely
      [...(gpuUpgrades.data || []), ...(cpuUpgrades.data || [])].forEach(u => {
        const type = u.slug.includes('cpu') ? 'cpu-upgrade' : 'gpu-upgrade';
        routes.push({ url: `${baseUrl}/${type}/${u.slug}`, lastModified: currentDate, priority: 0.6 });
        routes.push({ url: `${baseUrl}/en/${type}/${u.slug_en || `en-${u.slug}`}`, lastModified: currentDate, priority: 0.5 });
      });

      // Vedomostné sekcie
      const sections = [
        { data: posts.data, path: '/clanky/' }, { data: rady.data, path: '/rady/' },
        { data: tipy.data, path: '/tipy/' }, { data: tweaky.data, path: '/tweaky/' }, { data: slovnik.data, path: '/slovnik/' }
      ];
      sections.forEach(sec => sec.data?.forEach(item => {
        routes.push({ url: `${baseUrl}${sec.path}${item.slug}`, lastModified: currentDate, priority: 0.8 });
        routes.push({ url: `${baseUrl}/en${sec.path}${item.slug}`, lastModified: currentDate, priority: 0.7 });
      }));
    }

    // --- ID 1: GPU SEO MATRIX (FPS, PERFORMANCE, RECOMMEND) ---
    if (id === 1) {
      gpus.data?.forEach(g => {
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

    // --- ID 2: CPU SEO MATRIX ---
    if (id === 2) {
      cpus.data?.forEach(c => {
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

    // --- ID 3 & 4: MONSTER CLUSTER (BOTTLENECK PAIRING) ---
    if (id === 3 || id === 4) {
      const topCpus = cpus.data?.slice(0, 120) || [];
      const topGpus = gpus.data?.slice(0, 120) || [];
      const midPoint = Math.floor(topCpus.length / 2);
      
      const targetCpus = (id === 3) ? topCpus.slice(0, midPoint) : topCpus.slice(midPoint);

      targetCpus.forEach(c => {
        topGpus.forEach(g => {
          const pairPath = `/bottleneck/${c.slug}-with-${g.slug}`;
          routes.push({ url: `${baseUrl}${pairPath}`, lastModified: currentDate, priority: 0.6 });
          routes.push({ url: `${baseUrl}/en${pairPath}`, lastModified: currentDate, priority: 0.5 });
        });
      });
    }

    return routes.slice(0, 50000);
  } catch (error) {
    console.error("GURU SITEMAP ENGINE CRASH:", error);
    return [];
  }
}
