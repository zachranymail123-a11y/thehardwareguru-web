import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - SITEMAP INDEX V22.0 (CHATGPT ARCHITECTURE)
 * Cesta: src/app/sitemap.xml/route.js
 * 🛡️ FIX 1: Chunkování podle URL count (5000 na soubor) místo CPU count.
 * 🛡️ FIX 2: Dynamický <lastmod> založený na reálném čase úpravy v DB.
 * 🛡️ FIX 3: Rozdělení na logické celky (Articles, CPU, GPU, Duels, Upgrades, Matrix).
 */

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  
  try {
    // 🚀 Získáme metadata pro výpočet matrixu a lastmodu
    const [cpusRes, gpusRes, gamesRes, lastPostRes] = await Promise.all([
      supabase.from('cpus').select('id', { count: 'exact', head: true }),
      supabase.from('gpus').select('id', { count: 'exact', head: true }),
      supabase.from('games').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('created_at').order('created_at', { ascending: false }).limit(1).single()
    ]);

    const cpuCount = cpusRes.count || 40;
    const gpuCount = gpusRes.count || 45;
    const gameCount = gamesRes.count || 8;
    const lastModDate = lastPostRes.data?.created_at ? new Date(lastPostRes.data.created_at).toISOString() : new Date().toISOString();

    // 📊 MATEMATIKA: Kolik URL vygeneruje jeden CPU?
    // (GPU * hry * 3 rozlišení * 2 jazyky) + (GPU * hry * 2 jazyky) + (GPU * 2 jazyky)
    const urlsPerCpu = gpuCount * gameCount * 3 * 2; 
    const MAX_URLS_PER_SITEMAP = 5000;
    
    // Výpočet kolik CPU se vejde do jednoho chunku (např. 5000 / 2000 = 2 CPU)
    const cpusPerChunk = Math.max(1, Math.floor(MAX_URLS_PER_SITEMAP / urlsPerCpu));
    const totalChunks = Math.ceil(cpuCount / cpusPerChunk);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // 1. CHUNK 0: Statické stránky, Články a Profily
    xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/0.xml</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </sitemap>\n`;
    
    // 2. CHUNKY 1..N: Bottleneck Matrix (vždy po cca 5000 URL)
    for (let i = 1; i <= totalChunks; i++) {
      xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n    <lastmod>${lastModDate}</lastmod>\n  </sitemap>\n`;
    }
    
    xml += `</sitemapindex>`;
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
      }
    });

  } catch (e) {
    console.error("GURU SITEMAP INDEX ERROR:", e);
    return new Response(`Error`, { status: 500 });
  }
}
