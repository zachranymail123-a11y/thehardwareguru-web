import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // Sitemapa se vygeneruje vždy čerstvá při každém požadavku

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. STATICKÉ STRÁNKY
  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0 },
    { url: `${baseUrl}/sestavy`, priority: 0.9 },
    { url: `${baseUrl}/moje-pc`, priority: 0.9 },
    { url: `${baseUrl}/slovnik`, priority: 0.9 },
    { url: `${baseUrl}/rady`, priority: 0.9 },
  ].map((route) => ({
    url: route.url,
    lastModified: new Date().toISOString(),
    priority: route.priority,
  }));

  // 2. DYNAMICKÉ ČLÁNKY (/clanky/...)
  const { data: clanky } = await supabase.from('posts').select('slug');
  const clankyRoutes = (clanky || [])
    .filter((clanek) => clanek.slug) // PŘIDÁNO: Zabrání generování /clanky/null
    .map((clanek) => ({
      url: `${baseUrl}/clanky/${clanek.slug}`,
      lastModified: new Date().toISOString(),
      priority: 0.8,
    }));

  // 3. DYNAMICKÝ SLOVNÍK (/slovnik/...)
  const { data: pojmy } = await supabase.from('slovnik').select('slug');
  const slovnikRoutes = (pojmy || [])
    .filter((pojem) => pojem.slug) // PŘIDÁNO: Ochrana proti null
    .map((pojem) => ({
      url: `${baseUrl}/slovnik/${pojem.slug}`,
      lastModified: new Date().toISOString(),
      priority: 0.7,
    }));

  // 4. DYNAMICKÉ RADY (/rady/...)
  const { data: rady } = await supabase.from('rady').select('slug');
  const radyRoutes = (rady || [])
    .filter((rada) => rada.slug) // PŘIDÁNO: Ochrana proti null
    .map((rada) => ({
      url: `${baseUrl}/rady/${rada.slug}`,
      lastModified: new Date().toISOString(),
      priority: 0.8,
    }));

  // SPOJÍME VŠECHNY CESTY DO JEDNOHO VELKÉHO SEZNAMU PRO GOOGLE
  return [...staticRoutes, ...clankyRoutes, ...slovnikRoutes, ...radyRoutes];
}
