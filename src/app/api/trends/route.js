import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    const res = await fetch(rss,{ cache:'no-store' })
    const xml = await res.text()

    const titles = xml.match(/<title>(.*?)<\/title>/g)

    titles?.forEach(t => {

      const title = t.replace(/<\/?title>/g,'').trim()

      if (title !== 'Daily Search Trends' && title.length > 2) {
        keywords.add(title)
      }

    })

  }

  return Array.from(keywords)
}

async function igdbIsGame(name) {

  const tokenRes = await fetch(
    `https://id.twitch.tv/oauth2/token`,
    {
      method:'POST',
      body:new URLSearchParams({
        client_id:process.env.TWITCH_CLIENT_ID,
        client_secret:process.env.TWITCH_CLIENT_SECRET,
        grant_type:'client_credentials'
      })
    }
  )

  const token = await tokenRes.json()

  const res = await fetch(
    'https://api.igdb.com/v4/games',
    {
      method:'POST',
      headers:{
        'Client-ID':process.env.TWITCH_CLIENT_ID,
        'Authorization':`Bearer ${token.access_token}`
      },
      body:`search "${name}"; fields name; limit 1;`
    }
  )

  const data = await res.json()

  return data.length > 0
}

export async function GET() {

  try {

    const { data:games } =
      await supabase.from('games').select('slug')

    const existing = new Set(games?.map(g=>g.slug) || [])

    const keywords = await getTrendingKeywords()

    const results = []

    for (const keyword of keywords) {

      const slug = slugify(keyword)

      if (existing.has(slug)) continue

      const isGame = await igdbIsGame(keyword)

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
