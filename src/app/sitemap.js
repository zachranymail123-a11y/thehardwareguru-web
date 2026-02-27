import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // Zabrání cachování staré sitemapy

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. STATICKÉ STRÁNKY
  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0 },
    { url: `${baseUrl}/sestavy`, priority: 0.9 },
    { url: `${baseUrl}/slovnik`, priority: 0.9 },
  ].map((route) => ({
    url: route.url,
    lastModified: new Date().toISOString(),
    priority: route.priority,
  }));

  // 2. DYNAMICKÉ ČLÁNKY (Předpokládám, že máš tabulku 'clanky')
  const { data: clanky } = await supabase.from('clanky').select('slug');
  const clankyRoutes = (clanky || []).map((clanek) => ({
    url: `${baseUrl}/clanky/${clanek.slug}`,
    lastModified: new Date().toISOString(), // Můžeš nahradit datem z DB, pokud máš sloupec created_at
    priority: 0.8,
  }));

  // 3. DYNAMICKÝ SLOVNÍK (Tohle vygeneruje těch 50+ pojmů automaticky)
  const { data: pojmy } = await supabase.from('slovnik').select('slug');
  const slovnikRoutes = (pojmy || []).map((pojem) => ({
    url: `${baseUrl}/slovnik/${pojem.slug}`,
    lastModified: new Date().toISOString(),
    priority: 0.7,
  }));

  // SPOJÍME VŠECHNO DOHROMADY
  return [...staticRoutes, ...clankyRoutes, ...slovnikRoutes];
}
