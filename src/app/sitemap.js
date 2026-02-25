import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Stáhneme všechny články z DB, abychom o nich řekli Googlu
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  const baseUrl = 'https://www.thehardwareguru.cz';

  // Vygenerujeme dynamické URL pro každý jeden článek
  const postUrls = posts?.map((post) => ({
    url: `${baseUrl}/clanky/${post.slug}`,
    lastModified: new Date(post.created_at).toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // Vrátíme seznam: Hlavní stránka + všechny články
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
