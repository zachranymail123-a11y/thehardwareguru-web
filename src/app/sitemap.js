import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // GURU FIX: Sitemapa se vygeneruje vždy čerstvá při každém požadavku

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. STATICKÉ STRÁNKY (Základní kameny webu CZ + EN)
  const staticPaths = [
    { url: '', priority: 1.0 },
    { url: '/tipy', priority: 0.9 },
    { url: '/sestavy', priority: 0.9 },
    { url: '/tweaky', priority: 0.9 },
    { url: '/moje-pc', priority: 0.8 },
    { url: '/slovnik', priority: 0.8 },
    { url: '/rady', priority: 0.9 },
    { url: '/support', priority: 0.5 },
    { url: '/sin-slavy', priority: 0.6 },
    { url: '/partneri', priority: 0.6 },
  ];

  const staticRoutes = [];
  staticPaths.forEach((route) => {
    // Česká verze
    staticRoutes.push({
      url: `${baseUrl}${route.url}`,
      lastModified: new Date().toISOString(),
      priority: route.priority,
    });
    // Anglická verze
    staticRoutes.push({
      url: `${baseUrl}/en${route.url}`,
      lastModified: new Date().toISOString(),
      priority: Math.max(0.1, route.priority - 0.1),
    });
  });

  // 2. DYNAMICKÉ TABULKY (GURU ENGINE)
  const config = [
    { table: 'posts', path: '/clanky', priority: 0.8 },
    { table: 'tipy', path: '/tipy', priority: 0.8 },
    { table: 'tweaky', path: '/tweaky', priority: 0.8 },
    { table: 'rady', path: '/rady', priority: 0.8 },
    { table: 'slovnik', path: '/slovnik', priority: 0.7 }
  ];

  const dynamicRoutes = [];

  try {
    // GURU FIX: Dotazujeme se na sloupce, které v tabulkách 100% jsou (slug, title_en jsou v migraci)
    const results = await Promise.all(
      config.map(c => supabase.from(c.table).select('slug, slug_en, title_en, created_at'))
    );

    results.forEach((res, index) => {
      const { path, priority } = config[index];
      
      if (res.data && res.data.length > 0) {
        res.data.forEach(item => {
          // --- ČESKÁ CESTA ---
          if (item.slug) {
            dynamicRoutes.push({
              url: `${baseUrl}${path}/${item.slug}`,
              lastModified: item.created_at || new Date().toISOString(),
              priority: priority,
            });
          }

          // --- ANGLICKÁ CESTA (Pouze pokud existuje anglický ekvivalent) ---
          // Podmínka: buď má vyplněný title_en nebo slug_en
          if (item.title_en || item.slug_en) {
            const enSlug = item.slug_en || item.slug;
            dynamicRoutes.push({
              url: `${baseUrl}/en${path}/${enSlug}`,
              lastModified: item.created_at || new Date().toISOString(),
              priority: Math.max(0.1, priority - 0.1),
            });
          }
        });
      }
    });
  } catch (err) {
    console.error("GURU SITEMAP ENGINE ERROR:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
