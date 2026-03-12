import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const slugify = (text) =>
  text?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'-')
    .replace(/[^a-z0-9\-]/g,'')
    .replace(/\-+/g,'-')
    .replace(/^-+|-+$/g,'')

async function getTrendingKeywords() {

  const regions = ['CZ','US']
  const keywords = new Set()

  for (const geo of regions) {

    const rss =
      `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`

    const res = await fetch(rss,{
      cache:'no-store',
      signal: AbortSignal.timeout(5000)
    })

    // 🛡️ GURU FIX: Zabráníme stahování chybových stránek, pokud nás Google dočasně zablokuje.
    if (!res.ok) continue;

    const xml = await res.text()

    // 🛡️ GURU FIX: Ujistíme se, že čteme validní RSS XML a ne HTML stránku s chybou 404.
    if (!xml.includes('<rss')) continue;

    const titles = xml.match(/<title>(.*?)<\/title>/g)

    titles?.forEach(t => {

      const title = t.replace(/<\/?title>/g,'').trim()

      // Ignorujeme defaultní tagy a pro jistotu odfiltrujeme i zbytky "404"
      if (title !== 'Daily Search Trends' && title.length > 2 && !title.includes('404')) {
        keywords.add(title)
      }

    })

  }

  return Array.from(keywords)
}

async function getIGDBToken() {

  const res = await fetch(
    'https://id.twitch.tv/oauth2/token',
    {
      method:'POST',
      body:new URLSearchParams({
        client_id:process.env.TWITCH_CLIENT_ID,
        client_secret:process.env.TWITCH_CLIENT_SECRET,
        grant_type:'client_credentials'
      }),
      signal: AbortSignal.timeout(5000)
    }
  )

  if (!res.ok) {
    throw new Error('Failed to get IGDB token')
  }

  const json = await res.json()

  return json.access_token
}

async function igdbIsGame(name, token) {

  // Ochrana: Odstranění uvozovek z názvu, aby nespadl dotaz na IGDB
  const safeName = name.replace(/"/g, '');

  const res = await fetch(
    'https://api.igdb.com/v4/games',
    {
      method:'POST',
      headers:{
        'Client-ID':process.env.TWITCH_CLIENT_ID,
        'Authorization':`Bearer ${token}`
      },
      body:`search "${safeName}"; fields name; limit 1;`,
      signal: AbortSignal.timeout(5000)
    }
  )

  if (!res.ok) return false

  const data = await res.json()

  return Array.isArray(data) && data.length > 0
}

export async function GET() {

  try {

    const { data:games, error } =
      await supabase.from('games').select('slug')

    if (error) throw error

    const existing = new Set(games?.map(g => g.slug) || [])

    const keywords = await getTrendingKeywords()
    
    // Žádný heuristický fallback. Pokud Google Trends nevrátí data, zůstane prostě prázdno.
    if (keywords.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const token = await getIGDBToken()

    const results = []

    for (const keyword of keywords) {

      const slug = slugify(keyword)

      if (existing.has(slug)) continue

      const isGame = await igdbIsGame(keyword, token)

      if (isGame) {
        results.push(keyword)
      }

      if (results.length >= 5) break

    }

    return NextResponse.json({
      success:true,
      data:results
    })

  } catch(e) {

    return NextResponse.json({
      success:false,
      error:e.message
    },{status:500})

  }

}
