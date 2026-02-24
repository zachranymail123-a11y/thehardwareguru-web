export const revalidate = 0;

import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://thehardwareguru.cz'; // Tvoje budoucí doména

// Inicializace Supabase
const supabase = createClient(
  'https://luepzmdwgrbtnevlznbx.supabase.co', 
  'sb_publishable_wa3MgO-wdn8oWrZbJReNPw_CT9Bp2mq' // <--- TADY VLOŽ SVŮJ KLÍČ !!!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Stáhneme SLUGY a datum vytvoření
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at');

  // 2. Vytvoříme seznam URL adres (pro články používáme /clanky/slug)
  const postsUrls = (posts || []).map((post) => ({
    url: `${BASE_URL}/clanky/${post.slug}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Hlavní stránka + seznam článků
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postsUrls,
  ];
}