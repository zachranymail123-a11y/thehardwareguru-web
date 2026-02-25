import { createClient } from '@supabase/supabase-js';

// TOTO JE DŮLEŽITÉ PRO CRON: Vynutí, aby se sitemap vždy přegenerovala
export const revalidate = 0;

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme všechny články z databáze
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  const baseUrl = 'https://www.thehardwareguru.cz';

  // Vygenerujeme dynamické URL adresy pro každý článek
  const postUrls = posts?.map((post) => ({
    url: `${baseUrl}/clanky/${post.slug}`,
    lastModified: new Date(post.created_at).toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // Vrátíme pole, které obsahuje hlavní stránku + všechny články
  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...postUrls,
  ];
}
