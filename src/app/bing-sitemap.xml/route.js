/**
 * GURU SEO ENGINE - BING EXCLUSIVE INDEX V1.7 (TOTAL DOMINATION)
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Překročit hranici 200k+ URL a odstranit "půlkový" stav v Bingu.
 * 🛡️ FIX 1: Dynamický chunking pro Duely a Upgrady (řeší limit 1000 řádků v Supabase).
 * 🛡️ FIX 2: Synchronizace s Chunkerem - každá sekce má svůj vlastní výpočet stránek.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. ZÍSKÁNÍ POČTŮ PRO PŘESNÝ CHUNKING
  let cpuCount = 50; 
  let gpuDuelCount = 1000;
  let gpuUpgradeCount = 1000;

  try {
    const fetchCount = async (table) => {
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'count=exact' },
            cache: 'no-store'
        });
        const range = res.headers.get('content-range');
        return parseInt(range?.split('/')[1] || "0", 10);
    };

    [cpuCount, gpuDuelCount, gpuUpgradeCount] = await Promise.all([
        fetchCount('cpus'),
        fetchCount('gpu_duels'),
        fetchCount('gpu_upgrades')
    ]);
  } catch (e) {
    console.error("Bing count fetch failed:", e);
  }

  // 2. VÝPOČET POTŘEBNÝCH STRÁNEK (Chunks)
  const bottleneckChunks = Math.max(25, Math.ceil(cpuCount / 2)); // 2 CPU per chunk
  const duelChunks = Math.ceil(gpuDuelCount / 800); // 800 duelů per chunk (bezpečné pro Supabase limit 1000)
  const upgradeChunks = Math.ceil(gpuUpgradeCount / 800);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // A) ZÁKLADNÍ SEKCE
  const basicMaps = ['pages', 'posts', 'cpu', 'gpu'];
  basicMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // B) CHUNKED DUELS (Srovnání A vs B)
  for (let i = 1; i <= duelChunks; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/duels-${i}.xml</loc>\n  </sitemap>\n`;
  }

  // C) CHUNKED UPGRADES (Analýzy přechodu)
  for (let i = 1; i <= upgradeChunks; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/upgrades-${i}.xml</loc>\n  </sitemap>\n`;
  }

  // D) MEGA BOTTLENECK MATICE (Tisíce kombinací)
  for (let i = 1; i <= bottleneckChunks; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${i}.xml</loc>\n  </sitemap>\n`;
  }
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' 
    } 
  });
}
