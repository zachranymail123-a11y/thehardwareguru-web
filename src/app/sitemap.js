import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Načteme všechny články z databáze
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at')
    .order('created_at', { ascending: false });

  const postUrls = posts?.map((post) => ({
    url: `https://www.thehardwareguru.cz/clanky/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || [];

  // 2. Definujeme statické stránky (Domů + SESTAVY)
  const routes = [
    {
      url: 'https://www.thehardwareguru.cz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      // TOTO JE TA NOVÁ ČÁST
      url: 'https://www.thehardwareguru.cz/sestavy',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 3. Spojíme to dohromady
  return [...routes, ...postUrls];
}
