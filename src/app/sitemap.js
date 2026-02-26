import { createClient } from '@supabase/supabase-js';

// Nutíme Next.js, aby sitemapu nekachoval a generoval ji vždy čerstvou
export const revalidate = 0;

export default async function sitemap() {
  // OPRAVA: Použití správných environmentálních proměnných
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const baseUrl = 'https://www.thehardwareguru.cz';

  // Načteme všechno naráz
  const [{ data: posts }, { data: wiki }] = await Promise.all([
    supabase.from('posts').select('slug, created_at').order('created_at', { ascending: false }),
    supabase.from('wiki').select('slug, created_at')
  ]);

  // Články (Recenze)
  const postUrls = posts?.map((p) => ({ 
    url: `${baseUrl}/clanky/${p.slug}`, 
    lastModified: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(), 
    priority: 0.8 
  })) || [];

  // Slovník (Wiki)
  const wikiUrls = wiki?.map((w) => ({ 
    url: `${baseUrl}/slovnik/${w.slug}`, 
    lastModified: w.created_at ? new Date(w.created_at).toISOString() : new Date().toISOString(), 
    priority: 0.7 
  })) || [];

  return [
    { url: baseUrl, lastModified: new Date().toISOString(), priority: 1 },
    { url: `${baseUrl}/sestavy`, lastModified: new Date().toISOString(), priority: 0.9 },
    { url: `${baseUrl}/slovnik`, lastModified: new Date().toISOString(), priority: 0.9 },
    ...postUrls,
    ...wikiUrls
  ];
}
