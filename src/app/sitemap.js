import { createClient } from '@supabase/supabase-js';

// Tohle zajistí, že sitemapa bude vždy aktuální (při každém načtení)
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. Připojení k Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 2. Stáhneme všechny články (slug a datum)
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  // 3. Definice hlavní stránky
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // 4. Přidání všech článků z databáze
  const postsRoutes = posts?.map((post) => {
    // Čištění slugu (pro jistotu, aby seděl s tím, co máš v page.js)
    let cleanSlug = post.slug.replace('.html', '').trim();
    cleanSlug = cleanSlug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

    return {
      url: `${baseUrl}/clanky/${cleanSlug}`,
      lastModified: new Date(post.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  }) || [];

  // 5. Vrátíme kompletní seznam
  return [...routes, ...postsRoutes];
}
