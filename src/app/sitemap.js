import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

export default async function sitemap() {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const baseUrl = 'https://thehardwareguru.cz';

  const currentDate = new Date().toISOString();

  const staticPaths = [
    { url: '/', priority: 1.0 },
    { url: '/clanky', priority: 0.9 },
    { url: '/tipy', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/rady', priority: 0.8 },
    { url: '/slovnik', priority: 0.7 },
    { url: '/deals', priority: 0.9 },
    { url: '/gpuvs', priority: 0.9 },
    { url: '/gpuvs/ranking', priority: 0.9 },
    { url: '/cpuvs', priority: 0.9 },
    { url: '/support', priority: 0.5 },
    { url: '/sin-slavy', priority: 0.6 },
    { url: '/crawl-signal', priority: 1.0 },
  ];

  const staticRoutes = [];

  staticPaths.forEach((route) => {

    staticRoutes.push({
      url: `${baseUrl}${route.url}`,
      lastModified: currentDate,
      priority: route.priority,
    });

    staticRoutes.push({
      url: `${baseUrl}/en${route.url}`,
      lastModified: currentDate,
      priority: Math.max(0.1, route.priority - 0.1),
    });

  });

  const dynamicRoutes = [];

  try {

    const [
      postsRes,
      tipyRes,
      tweakyRes,
      radyRes,
      slovnikRes,
      duelsRes,
      cpuDuelsRes,
      gpusRes,
      upgradesRes
    ] = await Promise.all([
      supabase.from('posts').select('slug, slug_en, created_at, type'),
      supabase.from('tipy').select('slug, slug_en, created_at'),
      supabase.from('tweaky').select('slug, slug_en, created_at'),
      supabase.from('rady').select('slug, slug_en, created_at'),
      supabase.from('slovnik').select('slug, slug_en, created_at'),
      supabase.from('gpu_duels').select('slug, slug_en, created_at'),
      supabase.from('cpu_duels').select('slug, slug_en, created_at'),
      supabase.from('gpus').select('slug'),
      supabase.from('gpu_upgrades').select('slug, slug_en, created_at').range(0,20000)
    ]);

    const addToRoutes = (item, basePath, priority) => {

      if (item.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}${basePath}/${item.slug}`,
          lastModified: item.created_at || currentDate,
          priority: priority,
        });
      }

      if (item.slug_en || ((basePath === '/gpuvs' || basePath === '/cpuvs') && item.slug)) {

        const enSlug =
          item.slug_en ||
          ((basePath === '/gpuvs' || basePath === '/cpuvs')
            ? `en-${item.slug}`
            : item.slug);

        dynamicRoutes.push({
          url: `${baseUrl}/en${basePath}/${enSlug}`,
          lastModified: item.created_at || currentDate,
          priority: Math.max(0.1, priority - 0.1),
        });

      }
    };

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
    if (cpuDuelsRes.data) cpuDuelsRes.data.forEach(item => addToRoutes(item, '/cpuvs', 0.8));

    const gamesList = [
      'cyberpunk-2077',
      'warzone',
      'starfield',
      'fortnite',
      'cs2',
      'gta-5',
      'witcher-3',
      'red-dead-redemption-2',
      'baldurs-gate-3',
      'hogwarts-legacy',
      'forza-horizon-5',
      'call-of-duty-mw3',
      'elden-ring',
      'apex-legends',
      'valorant',
      'minecraft',
      'helldivers-2',
      'escape-from-tarkov',
      'overwatch-2',
      'diablo-4'
    ];

    const resolutions = ['1080p','1440p','4k'];
    const modes = ['dlss','ray-tracing','ultra','high'];

    /* GAME BENCHMARK HUB (NOVÉ) */

    gamesList.forEach((game) => {

      dynamicRoutes.push({
        url: `${baseUrl}/game-benchmarks/${game}`,
        lastModified: currentDate,
        priority: 0.8
      });

      dynamicRoutes.push({
        url: `${baseUrl}/en/game-benchmarks/${game}`,
        lastModified: currentDate,
        priority: 0.7
      });

    });

    if (gpusRes.data) {

      gpusRes.data.forEach((gpu) => {

        if (!gpu.slug) return;

        dynamicRoutes.push({
          url: `${baseUrl}/gpu/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.8
        });

        dynamicRoutes.push({
          url: `${baseUrl}/en/gpu/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.7
        });

        dynamicRoutes.push({
          url: `${baseUrl}/gpu-upgrade-from/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.7
        });

        dynamicRoutes.push({
          url: `${baseUrl}/en/gpu-upgrade-from/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.6
        });

        dynamicRoutes.push({
          url: `${baseUrl}/gpu-upgrade-to/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.7
        });

        dynamicRoutes.push({
          url: `${baseUrl}/en/gpu-upgrade-to/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.6
        });

        gamesList.forEach((game) => {

          dynamicRoutes.push({
            url: `${baseUrl}/gpu/${gpu.slug}/${game}`,
            lastModified: currentDate,
            priority: 0.7
          });

          dynamicRoutes.push({
            url: `${baseUrl}/en/gpu/${gpu.slug}/${game}`,
            lastModified: currentDate,
            priority: 0.6
          });

        });

        gamesList.forEach((game) => {

          resolutions.forEach((res) => {

            dynamicRoutes.push({
              url: `${baseUrl}/gpu-performance/${gpu.slug}/${game}/${res}`,
              lastModified: currentDate,
              priority: 0.7
            });

            dynamicRoutes.push({
              url: `${baseUrl}/en/gpu-performance/${gpu.slug}/${game}/${res}`,
              lastModified: currentDate,
              priority: 0.6
            });

          });

          modes.forEach((mode) => {

            dynamicRoutes.push({
              url: `${baseUrl}/gpu-performance/${gpu.slug}/${game}/${mode}`,
              lastModified: currentDate,
              priority: 0.7
            });

            dynamicRoutes.push({
              url: `${baseUrl}/en/gpu-performance/${gpu.slug}/${game}/${mode}`,
              lastModified: currentDate,
              priority: 0.6
            });

          });

        });

        dynamicRoutes.push({
          url: `${baseUrl}/gpu-performance/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.7
        });

        dynamicRoutes.push({
          url: `${baseUrl}/gpu-recommend/${gpu.slug}`,
          lastModified: currentDate,
          priority: 0.7
        });

      });

    }

    if (upgradesRes.data) {

      upgradesRes.data.forEach((upg) => {

        if (!upg.slug) return;

        dynamicRoutes.push({
          url: `${baseUrl}/gpu-upgrade/${upg.slug}`,
          lastModified: upg.created_at || currentDate,
          priority: 0.6,
        });

        const enSlug = (upg.slug_en || `en-${upg.slug}`).replace(/^en-en-/, 'en-');

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
