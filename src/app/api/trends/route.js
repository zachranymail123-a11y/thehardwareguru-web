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
    try {
        const rss = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`
        const res = await fetch(rss, {
          cache:'no-store',
          signal: AbortSignal.timeout(5000)
        })

        if (!res.ok) continue;

        const xml = await res.text()
        const titles = xml.match(/<title>(.*?)<\/title>/g)

        titles?.forEach(t => {
          const title = t.replace(/<\/?title>/g,'').trim()
          if (title !== 'Daily Search Trends' && title.length > 2) {
            keywords.add(title)
          }
        })
    } catch (e) {
        console.error(`Google Trends Error for ${geo}:`, e.message);
    }
  }

  return Array.from(keywords)
}

async function getIGDBToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
      throw new Error('CHYBÍ TWITCH_CLIENT_ID NEBO TWITCH_CLIENT_SECRET V PROSTŘEDÍ VERCELU! (Nezapomeň udělat redeploy)');
  }

  const res = await fetch(
    'https://id.twitch.tv/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }),
      signal: AbortSignal.timeout(5000)
    }
  )

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Twitch Auth Error (${res.status}): ${errText}`);
  }

  const json = await res.json()
  return json.access_token
}

async function igdbIsGame(name, token) {
  // Ochrana: Odstranění uvozovek, aby se nerozbila IGDB search query
  const safeName = name.replace(/"/g, '').replace(/\\/g, '');

  const res = await fetch(
    'https://api.igdb.com/v4/games',
    {
      method:'POST',
      headers:{
        'Accept': 'application/json',
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      },
      body: `search "${safeName}"; fields name; limit 1;`,
      signal: AbortSignal.timeout(5000)
    }
  )

  if (!res.ok) {
     console.error("IGDB Query Error:", await res.text());
     return false;
  }

  const data = await res.json()
  return Array.isArray(data) && data.length > 0
}

export async function GET() {
  try {
    const { data:games, error } = await supabase.from('games').select('slug')
    if (error) throw error

    const existing = new Set(games?.map(g => g.slug) || [])

    // 1. Získání klíčových slov z Google
    const keywords = await getTrendingKeywords()
    if (keywords.length === 0) {
        throw new Error('Google Trends nevrátil žádná data. Možná blokuje Vercel IP.');
    }

    // 2. Získání tokenu z Twitche (s detailní chybou, pokud selže)
    const token = await getIGDBToken()

    const results = []

    // 3. Filtrace přes IGDB
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
      success: true,
      data: results
    })

  } catch(e) {
    console.error("TRENDS API CRASH:", e.message);
    return NextResponse.json({
      success: false,
      error: e.message
    }, { status: 500 })
  }
}
