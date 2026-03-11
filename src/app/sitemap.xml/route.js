import { createClient } from '@supabase/supabase-js'

/**
 * GURU SEO ENGINE - SITEMAP INDEX V20.0
 * Cesta: src/app/sitemap.xml/route.js
 * 🚀 CÍL: Hlavní rozcestník pro Google, který odkazuje na jednotlivé sitemapy.
 */

const baseUrl = 'https://thehardwareguru.cz'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const dynamic = 'force-dynamic';

export async function GET() {
  let cpuCount = 100

  try {
    // 🛡️ GURU FIX: Počítáme CPU přes service_role, aby count nebyl null
    const { count } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true })

    cpuCount = count || 100
  } catch (e) {
    console.error("DB Count Error:", e);
  }

  // Rozdělíme na chunky (2 CPU na jeden XML soubor)
  const chunks = Math.ceil(cpuCount / 2)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  for (let i = 0; i <= chunks; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n  </sitemap>\n`
  }

  xml += `</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
    }
  })
}
