import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const baseUrl = 'https://www.thehardwareguru.cz';

  // Načteme vše
  const [{ data: posts }, { data: wiki }] = await Promise.all([
    supabase.from('posts').select('slug, created_at'),
    supabase.from('wiki').select('slug, created_at')
  ]);

  // Články - přidán .toISOString() pro jistotu
  const postUrls = posts?.map((p) => ({ 
    url: `${baseUrl}/clanky/${p.slug}`, 
    lastModified: p.created_at ? new Date(p.created_at) : new Date(), 
    priority: 0.8 
  })) || [];

  // Slovník - TADY JSEM OPRAVIL URL, aby každé slovo mělo svou adresu
  const wikiUrls = wiki?.map((w) => ({ 
    url: `${baseUrl}/slovnik/${w.slug}`, // Přidáno /${w.slug}
    lastModified: w.created_at ? new Date(w.created_at) : new Date(), 
    priority: 0.7 
  })) || [];

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/sestavy`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/slovnik`, lastModified: new Date(), priority: 0.9 },
    ...postUrls,
    ...wikiUrls
  ];
}
