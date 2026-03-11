import { createClient } from '@supabase/supabase-js'

const baseUrl = 'https://thehardwareguru.cz'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  let cpuCount = 100

  try {
    const { count } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true })

    cpuCount = count || 100
  } catch (e) {}

  const chunks = Math.ceil(cpuCount / 2)

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  for (let i = 0; i <= chunks; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n  </sitemap>\n`
  }

  xml += `</sitemapindex>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
