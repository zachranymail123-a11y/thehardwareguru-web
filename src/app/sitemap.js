import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // Sitemapa se vygeneruje vždy čerstvá

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = 'https://www.thehardwareguru.cz';

  // 1. STATICKÉ STRÁNKY (CZ + EN základ)
  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0 },
    { url: `${baseUrl}/tipy`, priority: 0.9 }, 
    { url: `${baseUrl}/sestavy`, priority: 0.9 },
    { url: `${baseUrl}/tweaky`, priority: 0.9 },
    { url: `${baseUrl}/moje-pc`, priority: 0.8 },
    { url: `${baseUrl}/slovnik`, priority: 0.8 },
    { url: `${baseUrl}/en/slovnik`, priority: 0.8 }, // GURU: Nová anglická základna
    { url: `${baseUrl}/rady`, priority: 0.9 },
    { url: `${baseUrl}/support`, priority: 0.5 },
  ].map((route) => ({
    url: route.url,
    lastModified: new Date().toISOString(),
    priority: route.priority,
  }));

  // 2. DYNAMICKÉ TIPY (/tipy/...) 
  const { data: tipy } = await supabase.from('tipy').select('slug, created_at');
  const tipyRoutes = (tipy || [])
    .filter((tip) => tip.slug)
    .map((tip) => ({
      url: `${baseUrl}/tipy/${tip.slug}`,
      lastModified: tip.created_at || new Date().toISOString(),
      priority: 0.8,
    }));

  // 3. DYNAMICKÉ ČLÁNKY (/clanky/...)
  const { data: clanky } = await supabase.from('posts').select('slug, created_at');
  const clankyRoutes = (clanky || [])
    .filter((clanek) => clanek.slug)
    .map((clanek) => ({
      url: `${baseUrl}/clanky/${clanek.slug}`,
      lastModified: clanek.created_at || new Date().toISOString(),
      priority: 0.8,
    }));

  // 4. DYNAMICKÝ SLOVNÍK (Bilingvální GURU logiku - CZ + EN)
  const { data: pojmy } = await supabase.from('slovnik').select('slug, slug_en, created_at');
  const slovnikRoutes = [];
  
  (pojmy || []).forEach((pojem) => {
    // Česká cesta
    if (pojem.slug) {
      slovnikRoutes.push({
        url: `${baseUrl}/slovnik/${pojem.slug}`,
        lastModified: pojem.created_at || new Date().toISOString(),
        priority: 0.7,
      });
    }
    // GURU: Anglická cesta (pokud existuje slug_en)
    if (pojem.slug_en) {
      slovnikRoutes.push({
        url: `${baseUrl}/en/slovnik/${pojem.slug_en}`,
        lastModified: pojem.created_at || new Date().toISOString(),
        priority: 0.7,
      });
    }
  });

  // 5. DYNAMICKÉ RADY (/rady/...)
  const { data: rady } = await supabase.from('rady').select('slug, created_at');
  const radyRoutes = (rady || [])
    .filter((rada) => rada.slug)
    .map((rada) => ({
      url: `${baseUrl}/rady/${rada.slug}`,
      lastModified: rada.created_at || new Date().toISOString(),
      priority: 0.8,
    }));

  // 6. DYNAMICKÉ TWEAKY (/tweaky/...)
  const { data: tweaky } = await supabase.from('tweaky').select('slug, created_at');
  const tweakyRoutes = (tweaky || [])
    .filter((tweak) => tweak.slug)
    .map((tweak) => ({
      url: `${baseUrl}/tweaky/${tweak.slug}`,
      lastModified: tweak.created_at || new Date().toISOString(),
      priority: 0.8,
    }));

  // FINÁLNÍ SPOJENÍ
  return [...staticRoutes, ...tipyRoutes, ...clankyRoutes, ...slovnikRoutes, ...radyRoutes, ...tweakyRoutes];
}
