import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - NATIVE HIERARCHICAL SITEMAP V25.0
 * Cesta: src/app/sitemap.js
 * 🛡️ FIX 1: Definitivní řešení chyby 405 na Vercelu. Využívá nativní Next.js engine.
 * 🛡️ FIX 2: Aplikuje doporučení ChatGPT (sémantické chunky: pages, posts, cpu...).
 * 🛡️ FIX 3: Automaticky generuje <sitemapindex> bez nutnosti vlastních API rout.
 */

export const revalidate = 86400; // 1 den cache, zamezuje infinite recrawl

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://thehardwareguru.cz';

const slugify = (text) => text?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/\-+/g, '-').replace(/^-+|-+$/g, '').trim();
const cleanGpuSlug = (s, n) => s || slugify(n).replace(/^rtx/,'geforce-rtx').replace(/^radeon/,'amd-radeon');

// 🚀 ZLATÝ STANDARD: Next.js automaticky vezme tato ID a vytvoří /sitemap.xml index!
// Odkazy budou vypadat např. /sitemap/pages.xml, /sitemap/bottleneck-1.xml atd.
export function generateSitemaps() {
  const maps = [
    { id: 'pages' },
    { id: 'posts' },
    { id: 'cpu' },
    { id: 'gpu' },
    { id: 'duels' },
    { id: 'upgrades' }
  ];
  
  // Přidáme 60 chunků pro Bottleneck Matici (Každý chunk = 2 procesory)
  for (let i = 1; i <= 60; i++) {
    maps.push({ id: `bottleneck-${i}` });
  }
  
  return maps;
}

export default async function sitemap({ id }) {
  const routes = [];
  const fallbackNow = new Date();

  try {
    // 📌 ID: STATICKÉ STRÁNKY
    if (id === 'pages') {
      const staticPaths = ['/', '/clanky', '/gpuvs/ranking', '/cpuvs/ranking', '/cpu-index', '/deals', '/support'];
      staticPaths.forEach(p => {
          routes.push({ url: `${baseUrl}${p}`, lastModified: fallbackNow, changeFrequency: 'daily', priority: 1.0 });
          routes.push({ url: `${baseUrl}/en${p}`, lastModified: fallbackNow, changeFrequency: 'daily', priority: 0.9 });
      });
      return routes;
    }

    // 📌 ID: ČLÁNKY (POSTS)
    if (id === 'posts') {
      const { data } = await supabase.from('posts').select('slug, created_at');
      data?.forEach(p => {
          if (p.slug) {
              const d = p.created_at ? new Date(p.created_at) : fallbackNow;
              routes.push({ url: `${baseUrl}/clanky/${p.slug}`, lastModified: d, changeFrequency: 'weekly', priority: 0.9 });
              routes.push({ url: `${baseUrl}/en/clanky/${p.slug}`, lastModified: d, changeFrequency: 'weekly', priority: 0.8 });
          }
      });
      return routes.length > 0 ? routes : [{ url: baseUrl, lastModified: fallbackNow }];
    }

    // 📌 ID: CPU PROFILY A FPS
    if (id === 'cpu') {
      const { data } = await supabase.from('cpus').select('name, slug, created_at');
      const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
      data?.forEach(c => {
          const safeSlug = c.slug || slugify(c.name);
          if (!safeSlug) return;
          const d = c.created_at ? new Date(c.created_at) : fallbackNow;

          routes.push({ url: `${baseUrl}/cpu/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.8 });
          routes.push({ url: `${baseUrl}/en/cpu/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.7 });
          routes.push({ url: `${baseUrl}/cpu-performance/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.8 });
          routes.push({ url: `${baseUrl}/cpu-recommend/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.8 });
          
          games.forEach(gm => {
              routes.push({ url: `${baseUrl}/cpu-fps/${safeSlug}/${gm}`, lastModified: d, changeFrequency: 'monthly', priority: 0.7 });
              routes.push({ url: `${baseUrl}/en/cpu-fps/${safeSlug}/${gm}`, lastModified: d, changeFrequency: 'monthly', priority: 0.6 });
          });
      });
      return routes.length > 0 ? routes : [{ url: baseUrl, lastModified: fallbackNow }];
    }

    // 📌 ID: GPU PROFILY A FPS
    if (id === 'gpu') {
      const { data } = await supabase.from('gpus').select('name, slug, created_at');
      const games = ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
      data?.forEach(g => {
          const safeSlug = cleanGpuSlug(g.slug, g.name);
          if (!safeSlug) return;
          const d = g.created_at ? new Date(g.created_at) : fallbackNow;

          routes.push({ url: `${baseUrl}/gpu/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.8 });
          routes.push({ url: `${baseUrl}/en/gpu/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.7 });
          routes.push({ url: `${baseUrl}/gpu-performance/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.8 });
          routes.push({ url: `${baseUrl}/gpu-recommend/${safeSlug}`, lastModified: d, changeFrequency: 'monthly', priority: 0.8 });
          
          games.forEach(gm => {
              routes.push({ url: `${baseUrl}/gpu-fps/${safeSlug}/${gm}`, lastModified: d, changeFrequency: 'monthly', priority: 0.7 });
              routes.push({ url: `${baseUrl}/en/gpu-fps/${safeSlug}/${gm}`, lastModified: d, changeFrequency: 'monthly', priority: 0.6 });
          });
      });
      return routes.length > 0 ? routes : [{ url: baseUrl, lastModified: fallbackNow }];
    }

    // 📌 ID: DUELY (CPU vs CPU, GPU vs GPU)
    if (id === 'duels') {
      const [cpuDuels, gpuDuels] = await Promise.all([
          supabase.from('cpu_duels').select('slug, slug_en, created_at'),
          supabase.from('gpu_duels').select('slug, slug_en, created_at')
      ]);
      
      cpuDuels.data?.forEach(d => {
          const dt = d.created_at ? new Date(d.created_at) : fallbackNow;
          if (d.slug) routes.push({ url: `${baseUrl}/cpuvs/${d.slug}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.7 });
          if (d.slug_en) routes.push({ url: `${baseUrl}/en/cpuvs/${d.slug_en}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.6 });
      });
      
      gpuDuels.data?.forEach(d => {
          const dt = d.created_at ? new Date(d.created_at) : fallbackNow;
          if (d.slug) routes.push({ url: `${baseUrl}/gpuvs/${d.slug}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.7 });
          if (d.slug_en) routes.push({ url: `${baseUrl}/en/gpuvs/${d.slug_en}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.6 });
      });
      return routes.length > 0 ? routes : [{ url: baseUrl, lastModified: fallbackNow }];
    }

    // 📌 ID: UPGRADY
    if (id === 'upgrades') {
      const [cpuUpg, gpuUpg] = await Promise.all([
          supabase.from('cpu_upgrades').select('slug, slug_en, created_at'),
          supabase.from('gpu_upgrades').select('slug, slug_en, created_at')
      ]);
      
      cpuUpg.data?.forEach(u => {
          const dt = u.created_at ? new Date(u.created_at) : fallbackNow;
          if (u.slug) routes.push({ url: `${baseUrl}/cpu-upgrade/${u.slug}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.7 });
          if (u.slug_en) routes.push({ url: `${baseUrl}/en/cpu-upgrade/${u.slug_en}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.6 });
      });
      
      gpuUpg.data?.forEach(u => {
          const dt = u.created_at ? new Date(u.created_at) : fallbackNow;
          if (u.slug) routes.push({ url: `${baseUrl}/gpu-upgrade/${u.slug}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.7 });
          if (u.slug_en) routes.push({ url: `${baseUrl}/en/gpu-upgrade/${u.slug_en}`, lastModified: dt, changeFrequency: 'monthly', priority: 0.6 });
      });
      return routes.length > 0 ? routes : [{ url: baseUrl, lastModified: fallbackNow }];
    }

    // 📌 ID: MEGA BOTTLENECK MATICE (Dynamické Chunky)
    if (id.toString().startsWith('bottleneck-')) {
      const chunkId = parseInt(id.replace('bottleneck-', ''), 10);
      const limit = 2; // Přísný limit: 2 procesory na 1 soubor (zamezuje timeoutu na Vercelu)
      const offset = (chunkId - 1) * limit;

      const { data: cpus } = await supabase
          .from('cpus')
          .select('name, slug')
          .order('performance_index', { ascending: false })
          .range(offset, offset + limit - 1);
      
      // 🚀 ZLATÁ POJISTKA: Pokud dojdou CPU, vrátíme prázdné pole a Vercel vygeneruje prázdné XML (žádná 404!)
      if (!cpus || cpus.length === 0) return [];

      const [gpusRes, gamesRes] = await Promise.all([
          supabase.from('gpus').select('name, slug'),
          supabase.from('games').select('slug')
      ]);

      const gpus = gpusRes.data || [];
      const dbGames = gamesRes?.data?.map(g => g.slug).filter(Boolean) || [];
      const games = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield', 'cs2'];
      const resolutions = ['1080p', '1440p', '4k'];

      cpus.forEach(cpu => {
          const cpuSlug = cpu.slug || slugify(cpu.name);
          gpus.forEach(gpu => {
              const gpuSlug = cleanGpuSlug(gpu.slug, gpu.name);
              if (!cpuSlug || !gpuSlug) return;

              const pairPath = `/bottleneck/${cpuSlug}-with-${gpuSlug}`;
              
              // Zde záměrně nedáváme lastModified podle doporučení ChatGPT, aby Google necrawloval matici pořád dokola
              routes.push({ url: `${baseUrl}${pairPath}`, priority: 0.6, changeFrequency: 'monthly' });
              routes.push({ url: `${baseUrl}/en${pairPath}`, priority: 0.5, changeFrequency: 'monthly' });

              games.forEach(game => {
                  routes.push({ url: `${baseUrl}${pairPath}-in-${game}`, priority: 0.5, changeFrequency: 'monthly' });
                  routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}`, priority: 0.4, changeFrequency: 'monthly' });
                  resolutions.forEach(res => {
                      routes.push({ url: `${baseUrl}${pairPath}-in-${game}-at-${res}`, priority: 0.5, changeFrequency: 'monthly' });
                      routes.push({ url: `${baseUrl}/en${pairPath}-in-${game}-at-${res}`, priority: 0.4, changeFrequency: 'monthly' });
                  });
              });
          });
      });
      return routes;
    }

    return [{ url: baseUrl, lastModified: fallbackNow }];
  } catch (error) {
    console.error("GURU SITEMAP GENERATION CRASH:", error);
    // V případě kritického selhání DB se Vercel nezhroutí, ale vypíše aspoň indexovou URL
    return [{ url: baseUrl, lastModified: fallbackNow }];
  }
}
