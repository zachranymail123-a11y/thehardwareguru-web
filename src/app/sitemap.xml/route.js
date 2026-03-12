import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - SITEMAP INDEX V22.3 (CHATGPT POLISH)
 * Cesta: src/app/sitemap.xml/route.js
 * 🛡️ FIX 1: Odstraněno force-dynamic, použito revalidate = 86400.
 * 🛡️ FIX 2: Odstraněn lastmod u matrix chunků (zabraňuje throttle od crawleru).
 * 🛡️ FIX 3: Bezpečnost - použit výhradně ANON_KEY.
 * 🛡️ FIX 4: Použito maybeSingle() pro posts (prevence pádu při prázdné DB).
 * 🛡️ FIX 5: Vylepšena Cache-Control hlavička o stale-while-revalidate.
 */

export const revalidate = 86400; // 🚀 GURU FIX: Stabilní revalidace (1 den)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// 🚀 GURU FIX: Z bezpečnostních důvodů (public endpoint) používáme striktně ANON_KEY
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  
  try {
    // Získáme metadata pro výpočet matrixu a lastmodu
    const [cpusRes, gpusRes, gamesRes, lastPostRes] = await Promise.all([
      supabase.from('cpus').select('id', { count: 'exact', head: true }),
      supabase.from('gpus').select('id', { count: 'exact', head: true }),
      supabase.from('games').select('id', { count: 'exact', head: true }),
      // 🚀 GURU FIX: Použito maybeSingle() místo single() proti pádům
      supabase.from('posts').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle()
    ]);

    const cpuCount = cpusRes.count || 40;
    const gpuCount = gpusRes.count || 45;
    const gameCount = gamesRes.count || 8;
    
    // 🚀 GURU FIX: Změněn fallback z new Date() na null dle ChatGPT
    const lastModDate = lastPostRes.data?.created_at 
      ? new Date(lastPostRes.data.created_at).toISOString() 
      : null;

    // 📊 MATEMATIKA: Kolik URL vygeneruje jeden CPU?
    // 🚀 GURU FIX: Zohledněny cpu-fps, gpu-fps, performance pages a recommend pages
    const urlsPerCpu = (gpuCount * gameCount * 3 * 2) + (gpuCount * 2) + (gpuCount * gameCount * 2); 
    const MAX_URLS_PER_SITEMAP = 5000;
    
    // Výpočet kolik CPU se vejde do jednoho chunku
    const cpusPerChunk = Math.max(1, Math.floor(MAX_URLS_PER_SITEMAP / urlsPerCpu));
    const totalChunks = Math.ceil(cpuCount / cpusPerChunk);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // 1. CHUNK 0: Statické stránky, Články a Profily
    // Zde <lastmod> zůstává, protože se tu tvoří nový obsah (články), ale pouze pokud existuje validní datum
    xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/0.xml</loc>\n`;
    if (lastModDate) {
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
    }
    xml += `  </sitemap>\n`;
    
    // 2. CHUNKY 1..N: Bottleneck Matrix (vždy po cca 5000 URL)
    // 🚀 GURU FIX: Záměrně odstraněn <lastmod>, Google tak nebude donekonečna přecrawlovávat beze změny
    for (let i = 1; i <= totalChunks; i++) {
      xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n  </sitemap>\n`;
    }
    
    xml += `</sitemapindex>`;
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // 🚀 GURU FIX: Vylepšený Cache-Control pro sitemapu s ideálním CDN chováním
        'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600'
      }
    });

  } catch (e) {
    console.error("GURU SITEMAP INDEX ERROR:", e);
    return new Response(`Error`, { status: 500 });
  }
}
